const NewsletterSubscriber = require("../../models/NewsletterSubscriber");
const { handlers } = require("../../utilities/handlers/handlers");
const { sendValidationError } = require("../../utilities/validations/common-validations");

class NewsletterService {
  async subscribe(req, res) {
    try {
      const { email, source } = req.body;
      const errors = [];

      const normalizedEmail = String(email || "").trim().toLowerCase();
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

      if (!normalizedEmail) {
        errors.push({
          field: "email",
          message: "Email is required",
        });
      } else if (!emailRegex.test(normalizedEmail)) {
        errors.push({
          field: "email",
          message: "Please provide a valid email address",
        });
      }

      if (errors.length > 0) {
        return sendValidationError({ res, errors });
      }

      let subscriber = await NewsletterSubscriber.findOne({
        email: normalizedEmail,
      });

      if (subscriber) {
        subscriber.status = "subscribed";
        subscriber.source = source || subscriber.source || "homepage";
        subscriber.subscribed_at = new Date();
        await subscriber.save();

        return handlers.response.success({
          res,
          message: "You are subscribed successfully",
          data: subscriber,
        });
      }

      subscriber = await NewsletterSubscriber.create({
        email: normalizedEmail,
        source: source || "homepage",
        status: "subscribed",
        subscribed_at: new Date(),
      });

      return handlers.response.success({
        res,
        message: "You are subscribed successfully",
        data: subscriber,
      });
    } catch (error) {
      return handlers.response.error({
        res,
        message: error.message,
      });
    }
  }
}

module.exports = new NewsletterService();