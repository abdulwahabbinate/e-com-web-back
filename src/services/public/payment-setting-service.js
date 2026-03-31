const PaymentSetting = require("../../models/PaymentSetting");
const { handlers } = require("../../utilities/handlers/handlers");

class Service {
  async getDefaultPaymentSetting() {
    const envPublishableKey = String(
      process.env.STRIPE_PUBLISHABLE_KEY || ""
    ).trim();

    let setting = await PaymentSetting.findOne({ slug: "default" });

    if (!setting) {
      setting = await PaymentSetting.create({
        slug: "default",
        cash_on_delivery_enabled: false,
        card_payment_enabled: true,
        gateway_name: "stripe",
        sandbox_mode: envPublishableKey.startsWith("pk_test_"),
        stripe_publishable_key: envPublishableKey,
      });
    } else if (!setting.stripe_publishable_key && envPublishableKey) {
      setting.stripe_publishable_key = envPublishableKey;
      if (!setting.gateway_name) {
        setting.gateway_name = "stripe";
      }
      await setting.save();
    }

    return setting;
  }

  async getPaymentSettings(req, res) {
    try {
      const setting = await this.getDefaultPaymentSetting();

      return handlers.response.success({
        res,
        message: "Payment settings retrieved successfully",
        data: {
          cash_on_delivery_enabled: setting.cash_on_delivery_enabled,
          card_payment_enabled: setting.card_payment_enabled,
          gateway_name: setting.gateway_name || "stripe",
          sandbox_mode: setting.sandbox_mode,
          stripe_publishable_key: String(
            setting.stripe_publishable_key ||
              process.env.STRIPE_PUBLISHABLE_KEY ||
              ""
          ).trim(),
        },
      });
    } catch (error) {
      console.log("getPaymentSettings error:", error);

      return handlers.response.error({
        res,
        message: error?.message || "Internal server error",
      });
    }
  }
}

module.exports = new Service();