const Product = require("../../models/Product");
const PaymentSetting = require("../../models/PaymentSetting");
const stripe = require("../../utilities/helpers/stripe");
const { handlers } = require("../../utilities/handlers/handlers");
const {
  sendValidationError,
} = require("../../utilities/validations/common-validations");

class Service {
  SHIPPING_COST = 15;

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

  async createPaymentIntent(req, res) {
    try {
      const { items = [] } = req.body;
      const errors = [];

      if (!Array.isArray(items) || items.length === 0) {
        errors.push({
          field: "items",
          message: "At least one item is required",
        });
      }

      if (errors.length > 0) {
        return sendValidationError({ res, errors });
      }

      const paymentSetting = await this.getDefaultPaymentSetting();

      if (!paymentSetting.card_payment_enabled) {
        return handlers.response.failed({
          res,
          code: 400,
          message: "Card payment is currently unavailable",
        });
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
          message: "No valid cart items found",
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

      let subtotal = 0;

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

        subtotal += Number(product.price || 0) * item.qty;
      }

      const shipping = normalizedItems.length > 0 ? this.SHIPPING_COST : 0;
      const total = subtotal + shipping;

      if (total <= 0) {
        return handlers.response.failed({
          res,
          code: 400,
          message: "Invalid payment amount",
        });
      }

      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(total * 100),
        currency: "usd",
        payment_method_types: ["card"],
        metadata: {
          integration: "mern_ecommerce",
          item_count: String(normalizedItems.length),
        },
      });

      return handlers.response.success({
        res,
        message: "Payment intent created successfully",
        data: {
          client_secret: paymentIntent.client_secret,
          payment_intent_id: paymentIntent.id,
          amount: total,
          subtotal,
          shipping,
        },
      });
    } catch (error) {
      console.log("createPaymentIntent error:", error);

      return handlers.response.error({
        res,
        message: error?.message || "Internal server error",
      });
    }
  }
}

module.exports = new Service();