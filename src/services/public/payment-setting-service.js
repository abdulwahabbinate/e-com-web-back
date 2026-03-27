const PaymentSetting = require("../../models/PaymentSetting");
const { handlers } = require("../../utilities/handlers/handlers");

class Service {
  async getPaymentSettings(req, res) {
    try {
      let setting = await PaymentSetting.findOne({ slug: "default" });

      if (!setting) {
        setting = await PaymentSetting.create({
          slug: "default",
          cash_on_delivery_enabled: false,
          card_payment_enabled: true,
          gateway_name: "stripe",
          sandbox_mode: true,
          stripe_publishable_key: process.env.STRIPE_PUBLISHABLE_KEY || "",
        });
      }

      return handlers.response.success({
        res,
        message: "Payment settings retrieved successfully",
        data: {
          cash_on_delivery_enabled: setting.cash_on_delivery_enabled,
          card_payment_enabled: setting.card_payment_enabled,
          gateway_name: setting.gateway_name,
          sandbox_mode: setting.sandbox_mode,
          stripe_publishable_key: setting.stripe_publishable_key,
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