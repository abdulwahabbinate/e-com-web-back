const AboutPage = require("../../models/AboutPage");
const { handlers } = require("../../utilities/handlers/handlers");

class Service {
  async getAboutPage(req, res) {
    try {
      const { slug } = req.params;

      const content = await AboutPage.findOne({ slug }).lean();

      if (!content) {
        return handlers.response.unavailable({
          res,
          code: 404,
          message: "About page content not found",
        });
      }

      return handlers.response.success({
        res,
        message: "About page content retrieved successfully",
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