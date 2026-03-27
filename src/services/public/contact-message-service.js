const ContactMessage = require("../../models/ContactMessage");
const { handlers } = require("../../utilities/handlers/handlers");
const { sendValidationError } = require("../../utilities/validations/common-validations");

class Service {
  isValidEmail(email = "") {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  isValidPhone(phone = "") {
    const sanitizedPhone = String(phone).replace(/[\s\-()+]/g, "");
    return /^[0-9]{10,15}$/.test(sanitizedPhone);
  }

  async submitContactMessage(req, res) {
    try {
      const { full_name, email, phone, subject, message } = req.body;
      const errors = [];

      if (!full_name || !full_name.trim()) {
        errors.push({
          field: "full_name",
          message: "Full name is required",
        });
      }

      if (!email || !email.trim()) {
        errors.push({
          field: "email",
          message: "Email is required",
        });
      } else if (!this.isValidEmail(email.trim())) {
        errors.push({
          field: "email",
          message: "Please enter a valid email address",
        });
      }

      if (!phone || !phone.trim()) {
        errors.push({
          field: "phone",
          message: "Phone number is required",
        });
      } else if (!this.isValidPhone(phone.trim())) {
        errors.push({
          field: "phone",
          message: "Please enter a valid phone number",
        });
      }

      if (!subject || !subject.trim()) {
        errors.push({
          field: "subject",
          message: "Subject is required",
        });
      }

      if (!message || !message.trim()) {
        errors.push({
          field: "message",
          message: "Message is required",
        });
      }

      if (errors.length > 0) {
        handlers.logger.failed({
          object_type: "submit_contact_message",
          message: "Validation failed",
          data: errors,
        });

        return sendValidationError({ res, errors });
      }

      const contactMessage = await ContactMessage.create({
        full_name: full_name.trim(),
        email: email.trim().toLowerCase(),
        phone: phone.trim(),
        subject: subject.trim(),
        message: message.trim(),
      });

      return handlers.response.success({
        res,
        message: "Your message has been sent successfully",
        data: contactMessage,
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