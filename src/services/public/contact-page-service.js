const ContactPage = require("../../models/ContactPage");
const { handlers } = require("../../utilities/handlers/handlers");

class Service {
  async getContactPage(req, res) {
    try {
      const { slug } = req.params;

      const content = await ContactPage.findOne({ slug }).lean();

      if (!content) {
        return handlers.response.unavailable({
          res,
          code: 404,
          message: "Contact page content not found",
        });
      }

      return handlers.response.success({
        res,
        message: "Contact page content retrieved successfully",
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