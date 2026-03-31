const Product = require("../../models/Product");
const Order = require("../../models/Order");
const PaymentSetting = require("../../models/PaymentSetting");
const sendEmail = require("../../utilities/helpers/send-email");
const stripe = require("../../utilities/helpers/stripe");
const { handlers } = require("../../utilities/handlers/handlers");
const {
  sendValidationError,
} = require("../../utilities/validations/common-validations");

class Service {
  SHIPPING_COST = 15;

  isValidEmail(email = "") {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  isValidPhone(phone = "") {
    const sanitizedPhone = String(phone).replace(/[\s\-()+]/g, "");
    return /^[0-9]{10,15}$/.test(sanitizedPhone);
  }

  async getDefaultPaymentSetting() {
    const envPublishableKey = String(
      process.env.STRIPE_PUBLISHABLE_KEY || ""
    ).trim();

    let paymentSetting = await PaymentSetting.findOne({ slug: "default" });

    if (!paymentSetting) {
      paymentSetting = await PaymentSetting.create({
        slug: "default",
        cash_on_delivery_enabled: false,
        card_payment_enabled: true,
        gateway_name: "stripe",
        sandbox_mode: envPublishableKey.startsWith("pk_test_"),
        stripe_publishable_key: envPublishableKey,
      });
    } else if (!paymentSetting.stripe_publishable_key && envPublishableKey) {
      paymentSetting.stripe_publishable_key = envPublishableKey;
      if (!paymentSetting.gateway_name) {
        paymentSetting.gateway_name = "stripe";
      }
      await paymentSetting.save();
    }

    return paymentSetting;
  }

  async buildUniqueOrderNumber() {
    let orderNumber = "";

    while (true) {
      const now = new Date();
      const year = now.getFullYear();
      const time = now.getTime().toString().slice(-6);
      const random = Math.floor(100000 + Math.random() * 900000);

      orderNumber = `ORD-${year}-${time}-${random}`;

      const exists = await Order.exists({ order_number: orderNumber });
      if (!exists) break;
    }

    return orderNumber;
  }

  async createOrder(req, res) {
    try {
      const {
        first_name,
        last_name,
        email,
        phone,
        country,
        city,
        address,
        postal_code,
        notes,
        payment_method,
        stripe_payment_intent_id,
        items = [],
      } = req.body;

      const errors = [];
      const normalizedPaymentMethod = String(payment_method || "")
        .trim()
        .toLowerCase();

      if (!first_name || !String(first_name).trim()) {
        errors.push({
          field: "first_name",
          message: "First name is required",
        });
      }

      if (!last_name || !String(last_name).trim()) {
        errors.push({
          field: "last_name",
          message: "Last name is required",
        });
      }

      if (!email || !String(email).trim()) {
        errors.push({
          field: "email",
          message: "Email is required",
        });
      } else if (!this.isValidEmail(String(email).trim())) {
        errors.push({
          field: "email",
          message: "Please enter a valid email address",
        });
      }

      if (!phone || !String(phone).trim()) {
        errors.push({
          field: "phone",
          message: "Phone number is required",
        });
      } else if (!this.isValidPhone(String(phone).trim())) {
        errors.push({
          field: "phone",
          message: "Please enter a valid phone number",
        });
      }

      if (!country || !String(country).trim()) {
        errors.push({
          field: "country",
          message: "Country is required",
        });
      }

      if (!city || !String(city).trim()) {
        errors.push({
          field: "city",
          message: "City is required",
        });
      }

      if (!address || !String(address).trim()) {
        errors.push({
          field: "address",
          message: "Address is required",
        });
      }

      if (!postal_code || !String(postal_code).trim()) {
        errors.push({
          field: "postal_code",
          message: "Postal code is required",
        });
      }

      if (!["card", "cod"].includes(normalizedPaymentMethod)) {
        errors.push({
          field: "payment_method",
          message: "Payment method must be card or cod",
        });
      }

      if (!Array.isArray(items) || items.length === 0) {
        errors.push({
          field: "items",
          message: "At least one order item is required",
        });
      }

      const paymentSetting = await this.getDefaultPaymentSetting();

      if (
        normalizedPaymentMethod === "cod" &&
        !paymentSetting.cash_on_delivery_enabled
      ) {
        errors.push({
          field: "payment_method",
          message: "Cash on delivery is currently unavailable",
        });
      }

      if (normalizedPaymentMethod === "card") {
        if (!paymentSetting.card_payment_enabled) {
          errors.push({
            field: "payment_method",
            message: "Card payment is currently unavailable",
          });
        }

        if (
          !stripe_payment_intent_id ||
          !String(stripe_payment_intent_id).trim()
        ) {
          errors.push({
            field: "stripe_payment_intent_id",
            message: "Stripe payment confirmation is required",
          });
        }
      }

      if (errors.length > 0) {
        return sendValidationError({ res, errors });
      }

      const normalizedItems = items
        .map((item) => ({
          product_id: String(item?.product_id || "").trim(),
          qty: Number(item?.qty || 0),
        }))
        .filter((item) => item.product_id);

      if (!normalizedItems.length) {
        return handlers.response.failed({
          res,
          code: 400,
          message: "No valid order items found",
        });
      }

      const productIds = normalizedItems.map((item) => item.product_id);

      const products = await Product.find({
        _id: { $in: productIds },
        is_active: true,
      });

      const productMap = products.reduce((acc, item) => {
        acc[String(item._id)] = item;
        return acc;
      }, {});

      const orderItems = [];
      let subtotal = 0;
      let totalItems = 0;

      for (const item of normalizedItems) {
        const product = productMap[item.product_id];

        if (!product) {
          return handlers.response.failed({
            res,
            code: 400,
            message: "One or more products are unavailable",
          });
        }

        if (!item.qty || item.qty < 1) {
          return handlers.response.failed({
            res,
            code: 400,
            message: `Invalid quantity for product ${product.title}`,
          });
        }

        if (Number(product.stock || 0) < item.qty) {
          return handlers.response.failed({
            res,
            code: 400,
            message: `Only ${product.stock} item(s) available for ${product.title}`,
          });
        }

        const lineTotal = Number(product.price || 0) * item.qty;

        subtotal += lineTotal;
        totalItems += item.qty;

        orderItems.push({
          product_id: product._id,
          title: product.title,
          image: product.images?.[0] || "",
          price: Number(product.price || 0),
          qty: item.qty,
          line_total: lineTotal,
        });
      }

      const shipping = orderItems.length > 0 ? this.SHIPPING_COST : 0;
      const total = subtotal + shipping;

      if (normalizedPaymentMethod === "card") {
        const paymentIntentId = String(stripe_payment_intent_id).trim();

        const existingOrder = await Order.findOne({
          stripe_payment_intent_id: paymentIntentId,
        });

        if (existingOrder) {
          return handlers.response.success({
            res,
            message: "Order already placed successfully",
            data: {
              _id: existingOrder._id,
              order_number: existingOrder.order_number,
              total: existingOrder.total,
              payment_status: existingOrder.payment_status,
              order_status: existingOrder.order_status,
            },
          });
        }

        const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

        if (!paymentIntent || paymentIntent.status !== "succeeded") {
          return handlers.response.failed({
            res,
            code: 400,
            message: "Payment is not completed yet",
          });
        }

        const expectedAmount = Math.round(total * 100);

        if (Number(paymentIntent.amount || 0) !== expectedAmount) {
          return handlers.response.failed({
            res,
            code: 400,
            message: "Paid amount does not match order total",
          });
        }

        if (String(paymentIntent.currency || "").toLowerCase() !== "usd") {
          return handlers.response.failed({
            res,
            code: 400,
            message: "Invalid payment currency",
          });
        }
      }

      for (const item of orderItems) {
        await Product.updateOne(
          { _id: item.product_id },
          { $inc: { stock: -item.qty } }
        );
      }

      const order = await Order.create({
        order_number: await this.buildUniqueOrderNumber(),
        stripe_payment_intent_id:
          normalizedPaymentMethod === "card"
            ? String(stripe_payment_intent_id).trim()
            : "",
        customer: {
          first_name: String(first_name).trim(),
          last_name: String(last_name).trim(),
          email: String(email).trim().toLowerCase(),
          phone: String(phone).trim(),
          country: String(country).trim(),
          city: String(city).trim(),
          address: String(address).trim(),
          postal_code: String(postal_code).trim(),
          notes: String(notes || "").trim(),
        },
        items: orderItems,
        subtotal,
        shipping,
        total_items: totalItems,
        total,
        payment_method: normalizedPaymentMethod,
        payment_status: normalizedPaymentMethod === "card" ? "paid" : "pending",
        order_status: "placed",
      });

      const userEmailHtml = `
        <h2>Order Confirmed</h2>
        <p>Dear ${order.customer.first_name} ${order.customer.last_name},</p>
        <p>Your order <strong>${order.order_number}</strong> has been placed successfully.</p>
        <p>Total: <strong>$${order.total.toFixed(2)}</strong></p>
        <p>Payment Method: <strong>${order.payment_method.toUpperCase()}</strong></p>
        <p>Thank you for shopping with us.</p>
      `;

      const adminEmailHtml = `
        <h2>New Order Received</h2>
        <p>Order Number: <strong>${order.order_number}</strong></p>
        <p>Customer: ${order.customer.first_name} ${order.customer.last_name}</p>
        <p>Email: ${order.customer.email}</p>
        <p>Phone: ${order.customer.phone}</p>
        <p>Total: <strong>$${order.total.toFixed(2)}</strong></p>
        <p>Payment Method: <strong>${order.payment_method.toUpperCase()}</strong></p>
      `;

      try {
        await sendEmail({
          to: order.customer.email,
          subject: `Order Confirmation - ${order.order_number}`,
          html: userEmailHtml,
        });

        if (paymentSetting.admin_notification_email) {
          await sendEmail({
            to: paymentSetting.admin_notification_email,
            subject: `New Order - ${order.order_number}`,
            html: adminEmailHtml,
          });
        }
      } catch (emailError) {
        console.log("Order email send error:", emailError.message);
      }

      return handlers.response.success({
        res,
        message: "Order placed successfully",
        data: {
          _id: order._id,
          order_number: order.order_number,
          total: order.total,
          payment_status: order.payment_status,
          order_status: order.order_status,
        },
      });
    } catch (error) {
      console.log("createOrder error:", error);

      return handlers.response.error({
        res,
        message: error?.message || "Internal server error",
      });
    }
  }
}

module.exports = new Service();