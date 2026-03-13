const Setting = require("../../models/Setting");
const buildFileUrl = require("../../utilities/helpers/file-url");
const { handlers } = require("../../utilities/handlers/handlers");

class Service {
  async getSettings(req, res) {
    try {
      let settings = await Setting.findOne();

      if (!settings) {
        settings = await Setting.create({});
      }

      return handlers.response.success({
        res,
        message: "Settings retrieved successfully",
        data: settings,
      });
    } catch (error) {
      return handlers.response.error({
        res,
        message: "Internal server error",
      });
    }
  }

  async updateSettings(req, res) {
    try {
      let settings = await Setting.findOne();

      if (!settings) {
        settings = await Setting.create({});
      }

      const {
        site_name,
        support_email,
        support_phone,
        cod,
        stripe,
        bank_transfer,
      } = req.body;

      if (site_name !== undefined) settings.site_name = site_name;
      if (support_email !== undefined) settings.support_email = support_email;
      if (support_phone !== undefined) settings.support_phone = support_phone;

      settings.payment_methods.cod =
        typeof cod === "undefined"
          ? settings.payment_methods.cod
          : String(cod) === "true";

      settings.payment_methods.stripe =
        typeof stripe === "undefined"
          ? settings.payment_methods.stripe
          : String(stripe) === "true";

      settings.payment_methods.bank_transfer =
        typeof bank_transfer === "undefined"
          ? settings.payment_methods.bank_transfer
          : String(bank_transfer) === "true";

      if (req.files && req.files.logo && req.files.logo[0]) {
        settings.logo = buildFileUrl(req, req.files.logo[0].path);
      }

      if (req.files && req.files.favicon && req.files.favicon[0]) {
        settings.favicon = buildFileUrl(req, req.files.favicon[0].path);
      }

      await settings.save();

      return handlers.response.success({
        res,
        message: "Settings updated successfully",
        data: settings,
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