const Content = require("../../models/Content");
const { handlers } = require("../../utilities/handlers/handlers");

class Service {
  async getContent(req, res) {
    try {
      const { slug } = req.params;

      const content = await Content.findOne({ slug });

      if (!content) {
        return handlers.response.unavailable({
          res,
          code: 404,
          message: "Content not found",
        });
      }

      return handlers.response.success({
        res,
        message: "Content retrieved successfully",
        data: content,
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