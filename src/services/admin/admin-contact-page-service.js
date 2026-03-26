const ContactPage = require("../../models/ContactPage");
const { handlers } = require("../../utilities/handlers/handlers");
const { sendValidationError } = require("../../utilities/validations/common-validations");

class Service {
  parseJsonField(value, defaultValue) {
    try {
      if (!value) return defaultValue;
      if (typeof value === "object") return value;
      return JSON.parse(value);
    } catch (error) {
      return defaultValue;
    }
  }

  validatePayload(data) {
    const errors = [];

    if (!data.slug || !data.slug.trim()) {
      errors.push({
        field: "slug",
        message: "Slug is required",
      });
    }

    if (!data.hero_section?.title || !data.hero_section.title.trim()) {
      errors.push({
        field: "hero_section.title",
        message: "Hero title is required",
      });
    }

    if (!data.form_section?.title || !data.form_section.title.trim()) {
      errors.push({
        field: "form_section.title",
        message: "Form section title is required",
      });
    }

    if (!data.faq_section?.title || !data.faq_section.title.trim()) {
      errors.push({
        field: "faq_section.title",
        message: "FAQ section title is required",
      });
    }

    return errors;
  }

  buildPayload(req) {
    const hero_section = this.parseJsonField(req.body.hero_section, {
      badge: "",
      title: "",
      description: "",
      support_badge: "",
      support_title: "",
      support_description: "",
      support_stats: [],
    });

    const info_section = this.parseJsonField(req.body.info_section, {
      items: [],
    });

    const form_section = this.parseJsonField(req.body.form_section, {
      badge: "",
      title: "",
      description: "",
      full_name_label: "",
      full_name_placeholder: "",
      email_label: "",
      email_placeholder: "",
      phone_label: "",
      phone_placeholder: "",
      subject_label: "",
      subject_placeholder: "",
      message_label: "",
      message_placeholder: "",
      submit_button_text: "",
    });

    const faq_section = this.parseJsonField(req.body.faq_section, {
      badge: "",
      title: "",
      description: "",
      items: [],
    });

    const support_cta_section = this.parseJsonField(req.body.support_cta_section, {
      icon: "",
      title: "",
      description: "",
    });

    return {
      slug: req.body.slug,
      hero_section,
      info_section,
      form_section,
      faq_section,
      support_cta_section,
    };
  }

  async createContactPage(req, res) {
    try {
      const payload = this.buildPayload(req);
      const errors = this.validatePayload(payload);

      if (errors.length > 0) {
        handlers.logger.failed({
          object_type: "create_contact_page",
          message: "Validation failed",
          data: errors,
        });

        return sendValidationError({ res, errors });
      }

      const existingContent = await ContactPage.findOne({
        slug: payload.slug.trim(),
      });

      if (existingContent) {
        return handlers.response.failed({
          res,
          code: 400,
          message: "Contact page content with this slug already exists",
        });
      }

      const content = await ContactPage.create({
        ...payload,
        slug: payload.slug.trim(),
      });

      return handlers.response.success({
        res,
        message: "Contact page content created successfully",
        data: content,
      });
    } catch (error) {
      return handlers.response.error({
        res,
        message: error.message,
      });
    }
  }

  async getContactPage(req, res) {
    try {
      const { slug } = req.params;

      const content = await ContactPage.findOne({ slug });

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

  async updateContactPage(req, res) {
    try {
      const { slug } = req.params;

      const existingContent = await ContactPage.findOne({ slug });

      if (!existingContent) {
        return handlers.response.unavailable({
          res,
          code: 404,
          message: "Contact page content not found",
        });
      }

      const payload = this.buildPayload(req);
      const errors = this.validatePayload(payload);

      if (errors.length > 0) {
        handlers.logger.failed({
          object_type: "update_contact_page",
          message: "Validation failed",
          data: errors,
        });

        return sendValidationError({ res, errors });
      }

      existingContent.hero_section = payload.hero_section;
      existingContent.info_section = payload.info_section;
      existingContent.form_section = payload.form_section;
      existingContent.faq_section = payload.faq_section;
      existingContent.support_cta_section = payload.support_cta_section;

      await existingContent.save();

      return handlers.response.success({
        res,
        message: "Contact page content updated successfully",
        data: existingContent,
      });
    } catch (error) {
      handlers.logger.error({
        object_type: "update_contact_page",
        message: error.message,
      });

      return handlers.response.error({
        res,
        message: "Internal server error",
      });
    }
  }
}

module.exports = new Service();