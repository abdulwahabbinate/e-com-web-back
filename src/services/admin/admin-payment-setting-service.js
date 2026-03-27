const PaymentSetting = require("../../models/PaymentSetting");
const { handlers } = require("../../utilities/handlers/handlers");

class Service {
  parseBoolean(value) {
    return value === true || value === "true";
  }

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
        data: setting,
      });
    } catch (error) {
      return handlers.response.error({
        res,
        message: "Internal server error",
      });
    }
  }

  async updatePaymentSettings(req, res) {
    try {
      let setting = await PaymentSetting.findOne({ slug: "default" });

      if (!setting) {
        setting = await PaymentSetting.create({
          slug: "default",
        });
      }

      setting.cash_on_delivery_enabled = this.parseBoolean(req.body.cash_on_delivery_enabled);
      setting.card_payment_enabled = this.parseBoolean(req.body.card_payment_enabled);
      setting.admin_notification_email = req.body.admin_notification_email || "";
      setting.gateway_name = "stripe";
      setting.sandbox_mode = this.parseBoolean(req.body.sandbox_mode);
      setting.stripe_publishable_key =
        req.body.stripe_publishable_key || process.env.STRIPE_PUBLISHABLE_KEY || "";

      await setting.save();

      return handlers.response.success({
        res,
        message: "Payment settings updated successfully",
        data: setting,
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