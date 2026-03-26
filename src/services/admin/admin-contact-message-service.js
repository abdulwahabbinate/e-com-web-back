const ContactMessage = require("../../models/ContactMessage");
const { handlers } = require("../../utilities/handlers/handlers");
const { sendValidationError } = require("../../utilities/validations/common-validations");

class Service {
  async getContactMessages(req, res) {
    try {
      const messages = await ContactMessage.find().sort({ createdAt: -1 });

      return handlers.response.success({
        res,
        message: "Contact messages retrieved successfully",
        data: messages,
      });
    } catch (error) {
      return handlers.response.error({
        res,
        message: error.message,
      });
    }
  }

  async getContactMessage(req, res) {
    try {
      const { id } = req.params;

      const message = await ContactMessage.findById(id);

      if (!message) {
        return handlers.response.unavailable({
          res,
          code: 404,
          message: "Contact message not found",
        });
      }

      return handlers.response.success({
        res,
        message: "Contact message retrieved successfully",
        data: message,
      });
    } catch (error) {
      return handlers.response.error({
        res,
        message: error.message,
      });
    }
  }

  async updateContactMessageStatus(req, res) {
    try {
      const { id } = req.params;
      const { status } = req.body;
      const errors = [];

      const allowedStatuses = ["new", "in_progress", "resolved"];

      if (!status || !allowedStatuses.includes(status)) {
        errors.push({
          field: "status",
          message: "Status must be new, in_progress, or resolved",
        });
      }

      if (errors.length > 0) {
        return sendValidationError({ res, errors });
      }

      const message = await ContactMessage.findById(id);

      if (!message) {
        return handlers.response.unavailable({
          res,
          code: 404,
          message: "Contact message not found",
        });
      }

      message.status = status;
      await message.save();

      return handlers.response.success({
        res,
        message: "Contact message status updated successfully",
        data: message,
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