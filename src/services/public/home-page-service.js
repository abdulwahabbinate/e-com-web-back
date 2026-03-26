const HomePage = require("../../models/HomePage");
const { handlers } = require("../../utilities/handlers/handlers");

class Service {
  async getHomePage(req, res) {
    try {
      const { slug } = req.params;

      const content = await HomePage.findOne({ slug }).lean();

      if (!content) {
        return handlers.response.unavailable({
          res,
          code: 404,
          message: "Home page content not found",
        });
      }

      return handlers.response.success({
        res,
        message: "Home page content retrieved successfully",
        data: content,
      });
    } catch (error) {
      return handlers.response.error({
        res,
        message: error.message,
      });
    }
  }
}

module.exports = new Service();