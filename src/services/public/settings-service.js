const Setting = require("../../models/Setting");
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
}

module.exports = new Service();