const Product = require("../../models/Product");
const PaymentSetting = require("../../models/PaymentSetting");
const stripe = require("../../utilities/helpers/stripe");
const { handlers } = require("../../utilities/handlers/handlers");
const { sendValidationError } = require("../../utilities/validations/common-validations");

class Service {
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

      if (!paymentSetting.card_payment_enabled) {
        return handlers.response.failed({
          res,
          code: 400,
          message: "Card payment is currently unavailable",
        });
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

      let subtotal = 0;

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

        subtotal += Number(product.price || 0) * qty;
      }

      const shipping = items.length > 0 ? 15 : 0;
      const total = subtotal + shipping;

      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(total * 100),
        currency: "usd",
        payment_method_types: ["card"],
        metadata: {
          integration: "mern_ecommerce",
        },
      });

      return handlers.response.success({
        res,
        message: "Payment intent created successfully",
        data: {
          client_secret: paymentIntent.client_secret,
          amount: total,
        },
      });
    } catch (error) {
      return handlers.response.error({
        res,
        message: error.message || "Internal server error",
      });
    }
  }
}

module.exports = new Service();