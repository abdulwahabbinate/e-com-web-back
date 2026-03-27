const Product = require("../../models/Product");
const Order = require("../../models/Order");
const PaymentSetting = require("../../models/PaymentSetting");
const sendEmail = require("../../utilities/helpers/send-email");
const { handlers } = require("../../utilities/handlers/handlers");
const { sendValidationError } = require("../../utilities/validations/common-validations");

class Service {
  isValidEmail(email = "") {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  isValidPhone(phone = "") {
    const sanitizedPhone = String(phone).replace(/[\s\-()+]/g, "");
    return /^[0-9]{10,15}$/.test(sanitizedPhone);
  }

  buildOrderNumber() {
    const now = new Date();
    const year = now.getFullYear();
    const random = Math.floor(1000 + Math.random() * 9000);
    return `ORD-${year}-${random}`;
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

      if (!first_name || !String(first_name).trim()) {
        errors.push({ field: "first_name", message: "First name is required" });
      }

      if (!last_name || !String(last_name).trim()) {
        errors.push({ field: "last_name", message: "Last name is required" });
      }

      if (!email || !String(email).trim()) {
        errors.push({ field: "email", message: "Email is required" });
      } else if (!this.isValidEmail(String(email).trim())) {
        errors.push({ field: "email", message: "Please enter a valid email address" });
      }

      if (!phone || !String(phone).trim()) {
        errors.push({ field: "phone", message: "Phone number is required" });
      } else if (!this.isValidPhone(String(phone).trim())) {
        errors.push({ field: "phone", message: "Please enter a valid phone number" });
      }

      if (!country || !String(country).trim()) {
        errors.push({ field: "country", message: "Country is required" });
      }

      if (!city || !String(city).trim()) {
        errors.push({ field: "city", message: "City is required" });
      }

      if (!address || !String(address).trim()) {
        errors.push({ field: "address", message: "Address is required" });
      }

      if (!postal_code || !String(postal_code).trim()) {
        errors.push({ field: "postal_code", message: "Postal code is required" });
      }

      if (!payment_method || !["card", "cod"].includes(String(payment_method))) {
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

      let paymentSetting = await PaymentSetting.findOne({ slug: "default" });

      if (!paymentSetting) {
        paymentSetting = await PaymentSetting.create({
          slug: "default",
          cash_on_delivery_enabled: false,
          card_payment_enabled: true,
          gateway_name: "stripe",
          sandbox_mode: true,
          stripe_publishable_key: process.env.STRIPE_PUBLISHABLE_KEY || "",
        });
      }

      if (payment_method === "cod" && !paymentSetting.cash_on_delivery_enabled) {
        errors.push({
          field: "payment_method",
          message: "Cash on delivery is currently unavailable",
        });
      }

      if (payment_method === "card") {
        if (!paymentSetting.card_payment_enabled) {
          errors.push({
            field: "payment_method",
            message: "Card payment is currently unavailable",
          });
        }

        if (!stripe_payment_intent_id || !String(stripe_payment_intent_id).trim()) {
          errors.push({
            field: "stripe_payment_intent_id",
            message: "Stripe payment confirmation is required",
          });
        }
      }

      if (errors.length > 0) {
        return sendValidationError({ res, errors });
      }

      const productIds = items.map((item) => item.product_id).filter(Boolean);

      const products = await Product.find({
        _id: { $in: productIds },
        is_active: true,
      });

      const productMap = products.reduce((acc, item) => {
        acc[String(item._id)] = item;
        return acc;
      }, {});

      const normalizedItems = [];
      let subtotal = 0;
      let totalItems = 0;

      for (const item of items) {
        const product = productMap[String(item.product_id)];

        if (!product) {
          return handlers.response.failed({
            res,
            code: 400,
            message: "One or more products are unavailable",
          });
        }

        const qty = Number(item.qty || 0);

        if (!qty || qty < 1) {
          return handlers.response.failed({
            res,
            code: 400,
            message: `Invalid quantity for product ${product.title}`,
          });
        }

        if (Number(product.stock || 0) < qty) {
          return handlers.response.failed({
            res,
            code: 400,
            message: `Only ${product.stock} item(s) available for ${product.title}`,
          });
        }

        const lineTotal = Number(product.price || 0) * qty;

        subtotal += lineTotal;
        totalItems += qty;

        normalizedItems.push({
          product_id: product._id,
          title: product.title,
          image: product.images?.[0] || "",
          price: Number(product.price || 0),
          qty,
          line_total: lineTotal,
        });
      }

      const shipping = normalizedItems.length > 0 ? 15 : 0;
      const total = subtotal + shipping;

      for (const item of normalizedItems) {
        await Product.updateOne(
          { _id: item.product_id },
          { $inc: { stock: -item.qty } }
        );
      }

      const order = await Order.create({
        order_number: this.buildOrderNumber(),
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
        items: normalizedItems,
        subtotal,
        shipping,
        total_items: totalItems,
        total,
        payment_method,
        payment_status: payment_method === "card" ? "paid" : "pending",
        order_status: "placed",
      });

      const userEmailHtml = `
        <h2>Order Confirmed</h2>
        <p>Dear ${order.customer.first_name} ${order.customer.last_name},</p>
        <p>Your order <strong>${order.order_number}</strong> has been placed successfully.</p>
        <p>Total: <strong>$${order.total.toFixed(2)}</strong></p>
        <p>Payment Method: <strong>${order.payment_method.toUpperCase()}</strong></p>
      `;

      const adminEmailHtml = `
        <h2>New Order Received</h2>
        <p>Order Number: <strong>${order.order_number}</strong></p>
        <p>Customer: ${order.customer.first_name} ${order.customer.last_name}</p>
        <p>Email: ${order.customer.email}</p>
        <p>Total: <strong>$${order.total.toFixed(2)}</strong></p>
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
      return handlers.response.error({
        res,
        message: "Internal server error",
      });
    }
  }
}

module.exports = new Service();