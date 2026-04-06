const Product = require("../../models/Product");
const Order = require("../../models/Order");
const PaymentSetting = require("../../models/PaymentSetting");
const stripe = require("../../utilities/helpers/stripe");
const { handlers } = require("../../utilities/handlers/handlers");
const {
  sendValidationError,
} = require("../../utilities/validations/common-validations");
const {
  getTransporter,
  isMailerConfigured,
} = require("../../utilities/emails/mail-transporter");
const {
  buildCustomerOrderEmailTemplate,
  buildAdminOrderEmailTemplate,
} = require("../../utilities/emails/order-email-template");

class Service {
  SHIPPING_COST = 15;
  EMAIL_SEND_DELAY_MS = 1500;
  EMAIL_MAX_RETRIES = 3;

  isValidEmail(email = "") {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  isValidPhone(phone = "") {
    const sanitizedPhone = String(phone).replace(/[\s\-()+]/g, "");
    return /^[0-9]{10,15}$/.test(sanitizedPhone);
  }

  normalizeEmail(email = "") {
    return String(email || "").trim().toLowerCase();
  }

  sleep(ms = 0) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  isMailtrapRateLimitError(error = {}) {
    const text = String(
      error?.message ||
        error?.response ||
        error?.reason ||
        ""
    ).toLowerCase();

    return (
      text.includes("too many emails per second") ||
      text.includes("550 5.7.0")
    );
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

  buildOrderResponse(order) {
    return {
      _id: order._id,
      order_number: order.order_number,
      total: order.total,
      payment_status: order.payment_status,
      order_status: order.order_status,
      email_notifications: {
        customer_email_sent:
          order.email_notifications?.customer_email_sent || false,
        admin_email_sent: order.email_notifications?.admin_email_sent || false,
        email_sent_at: order.email_notifications?.email_sent_at || null,
        last_error_message:
          order.email_notifications?.last_error_message || "",
      },
    };
  }

  getAdminNotificationRecipient(paymentSetting) {
    return this.normalizeEmail(
      paymentSetting?.admin_notification_email ||
        process.env.ADMIN_NOTIFICATION_EMAIL ||
        process.env.MAIL_USER ||
        ""
    );
  }

  toRecipientList(list = []) {
    return list
      .map((item) => {
        if (typeof item === "string") return this.normalizeEmail(item);
        return this.normalizeEmail(item?.address || "");
      })
      .filter(Boolean);
  }

  async sendMailJob({
    transporter,
    from,
    to,
    subject,
    html,
    text,
    replyTo,
    key,
  }) {
    let attempt = 0;
    let lastError = null;

    while (attempt < this.EMAIL_MAX_RETRIES) {
      try {
        if (attempt > 0) {
          await this.sleep(this.EMAIL_SEND_DELAY_MS * (attempt + 1));
        }

        const info = await transporter.sendMail({
          from,
          to,
          subject,
          html,
          text,
          ...(replyTo ? { replyTo } : {}),
        });

        const accepted = this.toRecipientList(info?.accepted || []);
        const rejected = this.toRecipientList(info?.rejected || []);
        const pending = this.toRecipientList(info?.pending || []);
        const normalizedTo = this.normalizeEmail(to);

        const isAccepted =
          accepted.length > 0
            ? accepted.includes(normalizedTo)
            : rejected.length === 0 && pending.length === 0;

        if (!isAccepted) {
          lastError = {
            message: `SMTP did not accept recipient ${to}. Rejected: ${
              rejected.join(", ") || "none"
            }, Pending: ${pending.join(", ") || "none"}`,
          };

          if (
            (rejected.length || pending.length) &&
            attempt < this.EMAIL_MAX_RETRIES - 1
          ) {
            attempt += 1;
            continue;
          }

          return {
            success: false,
            key,
            email: to,
            messageId: info?.messageId || "",
            reason: lastError.message,
          };
        }

        return {
          success: true,
          key,
          email: to,
          messageId: info?.messageId || "",
          reason: "",
        };
      } catch (error) {
        lastError = error;

        if (
          this.isMailtrapRateLimitError(error) &&
          attempt < this.EMAIL_MAX_RETRIES - 1
        ) {
          attempt += 1;
          await this.sleep(this.EMAIL_SEND_DELAY_MS * (attempt + 1));
          continue;
        }

        return {
          success: false,
          key,
          email: to,
          messageId: "",
          reason: error?.message || "Failed to send email",
        };
      }
    }

    return {
      success: false,
      key,
      email: to,
      messageId: "",
      reason: lastError?.message || "Failed to send email",
    };
  }

  async sendOrderEmails(order, paymentSetting, options = {}) {
    const { onlyMissing = false } = options;
    const adminRecipient = this.getAdminNotificationRecipient(paymentSetting);

    if (!isMailerConfigured()) {
      order.email_notifications = {
        customer_email_sent:
          order.email_notifications?.customer_email_sent || false,
        admin_email_sent: order.email_notifications?.admin_email_sent || false,
        email_sent_at: null,
        last_error_message: "Mail configuration is missing",
      };
      await order.save();

      return {
        success: false,
        failedRecipients: [
          {
            recipient: "system",
            reason: "Mail configuration is missing",
          },
        ],
      };
    }

    const transporter = getTransporter();
    const mailFrom = process.env.MAIL_FROM || process.env.MAIL_USER;

    const jobs = [];

    if (!onlyMissing || !order.email_notifications?.customer_email_sent) {
      jobs.push({
        key: "customer",
        to: order.customer.email,
        subject: `Order Confirmation - ${order.order_number}`,
        html: buildCustomerOrderEmailTemplate({ order }),
        text: `Order Confirmation - ${order.order_number}\nTotal: $${Number(
          order.total || 0
        ).toFixed(2)}\nPayment Status: ${order.payment_status}`,
      });
    }

    if (adminRecipient) {
      if (!onlyMissing || !order.email_notifications?.admin_email_sent) {
        jobs.push({
          key: "admin",
          to: adminRecipient,
          subject: `New Order Received - ${order.order_number}`,
          html: buildAdminOrderEmailTemplate({ order }),
          text: `New Order Received - ${order.order_number}\nCustomer: ${
            order.customer.first_name
          } ${order.customer.last_name}\nTotal: $${Number(order.total || 0).toFixed(
            2
          )}`,
        });
      }
    }

    const failedRecipients = [];

    if (!adminRecipient) {
      failedRecipients.push({
        recipient: "admin",
        reason: "Admin notification email is not configured",
      });
    }

    if (!jobs.length) {
      const customerSent = order.email_notifications?.customer_email_sent || false;
      const adminSent = adminRecipient
        ? order.email_notifications?.admin_email_sent || false
        : false;

      return {
        success: customerSent && (adminRecipient ? adminSent : true),
        failedRecipients,
      };
    }

    let customerEmailSent =
      order.email_notifications?.customer_email_sent || false;
    let adminEmailSent = order.email_notifications?.admin_email_sent || false;

    for (let index = 0; index < jobs.length; index += 1) {
      const job = jobs[index];

      if (index > 0) {
        await this.sleep(this.EMAIL_SEND_DELAY_MS);
      }

      const result = await this.sendMailJob({
        transporter,
        from: mailFrom,
        to: job.to,
        subject: job.subject,
        html: job.html,
        text: job.text,
        replyTo: adminRecipient || undefined,
        key: job.key,
      });

      if (result.success) {
        if (result.key === "customer") customerEmailSent = true;
        if (result.key === "admin") adminEmailSent = true;
      } else {
        failedRecipients.push({
          recipient: result.key,
          email: result.email,
          reason: result.reason,
        });
      }
    }

    order.email_notifications = {
      customer_email_sent: customerEmailSent,
      admin_email_sent: adminEmailSent,
      email_sent_at:
        customerEmailSent && (adminRecipient ? adminEmailSent : true)
          ? new Date()
          : null,
      last_error_message: failedRecipients
        .map((item) => `${item.recipient}: ${item.reason}`)
        .join(" | "),
    };

    await order.save();

    return {
      success: customerEmailSent && (adminRecipient ? adminEmailSent : true),
      failedRecipients,
    };
  }

  async ensureOrderEmails(order, paymentSetting) {
    const adminRecipient = this.getAdminNotificationRecipient(paymentSetting);

    const alreadyDone =
      order.email_notifications?.customer_email_sent &&
      (adminRecipient ? order.email_notifications?.admin_email_sent : true);

    if (alreadyDone) {
      return {
        success: true,
        failedRecipients: [],
      };
    }

    return this.sendOrderEmails(order, paymentSetting, {
      onlyMissing: true,
    });
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
          const emailResult = await this.ensureOrderEmails(
            existingOrder,
            paymentSetting
          );

          if (!emailResult.success) {
            return handlers.response.failed({
              res,
              code: 500,
              message:
                "Order is already placed, but one or more emails are still pending.",
              data: {
                ...this.buildOrderResponse(existingOrder),
                failed_recipients: emailResult.failedRecipients,
                order_already_placed: true,
              },
            });
          }

          return handlers.response.success({
            res,
            message: "Order already placed successfully",
            data: this.buildOrderResponse(existingOrder),
          });
        }

        const paymentIntent = await stripe.paymentIntents.retrieve(
          paymentIntentId
        );

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
          email: this.normalizeEmail(email),
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
        email_notifications: {
          customer_email_sent: false,
          admin_email_sent: false,
          email_sent_at: null,
          last_error_message: "",
        },
      });

      const emailResult = await this.sendOrderEmails(order, paymentSetting);

      if (!emailResult.success) {
        return handlers.response.failed({
          res,
          code: 500,
          message:
            "Order placed successfully, but one or more order emails could not be delivered yet.",
          data: {
            ...this.buildOrderResponse(order),
            failed_recipients: emailResult.failedRecipients,
          },
        });
      }

      return handlers.response.success({
        res,
        message: "Order placed successfully",
        data: this.buildOrderResponse(order),
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