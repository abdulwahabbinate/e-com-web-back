const AboutPage = require("../../models/AboutPage");
const buildFileUrl = require("../../utilities/helpers/file-url");
const deleteFileByUrl = require("../../utilities/helpers/delete-file-by-url");
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

  parseBoolean(value) {
    if (value === true || value === "true") return true;
    if (value === false || value === "false") return false;
    return false;
  }

  getUploadedFile(req, fieldName) {
    return req.files?.[fieldName]?.[0] || null;
  }

  resolveImageField({
    req,
    fieldName,
    oldValue = "",
    removeImage = false,
  }) {
    const uploadedFile = this.getUploadedFile(req, fieldName);

    if (removeImage) {
      if (oldValue) {
        deleteFileByUrl(oldValue);
      }

      if (uploadedFile?.path) {
        const newUploadedFileUrl = buildFileUrl(req, uploadedFile.path);
        deleteFileByUrl(newUploadedFileUrl);
      }

      return "";
    }

    if (uploadedFile?.path) {
      if (oldValue) {
        deleteFileByUrl(oldValue);
      }

      return buildFileUrl(req, uploadedFile.path);
    }

    return oldValue;
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

    if (!data.story_section?.title || !data.story_section.title.trim()) {
      errors.push({
        field: "story_section.title",
        message: "Story title is required",
      });
    }

    if (!data.features_section?.title || !data.features_section.title.trim()) {
      errors.push({
        field: "features_section.title",
        message: "Features title is required",
      });
    }

    if (!data.cta_section?.title || !data.cta_section.title.trim()) {
      errors.push({
        field: "cta_section.title",
        message: "CTA title is required",
      });
    }

    return errors;
  }

  buildPayload(req, existingContent = null) {
    const hero_section = this.parseJsonField(req.body.hero_section, {
      badge: "",
      title: "",
      description: "",
      primary_button_text: "",
      primary_button_link: "",
      secondary_button_text: "",
      secondary_button_link: "",
      vision_badge: "",
      vision_title: "",
      vision_description: "",
      vision_stats: [],
    });

    const story_section = this.parseJsonField(req.body.story_section, {
      badge: "",
      title: "",
      paragraph_one: "",
      paragraph_two: "",
      image: "",
    });

    const stats_section = this.parseJsonField(req.body.stats_section, {
      items: [],
    });

    const features_section = this.parseJsonField(req.body.features_section, {
      badge: "",
      title: "",
      description: "",
      items: [],
    });

    const cta_section = this.parseJsonField(req.body.cta_section, {
      badge: "",
      title: "",
      description: "",
      primary_button_text: "",
      primary_button_link: "",
      secondary_button_text: "",
      secondary_button_link: "",
    });

    const remove_images = this.parseJsonField(req.body.remove_images, {});

    story_section.image = this.resolveImageField({
      req,
      fieldName: "story_image",
      oldValue: existingContent?.story_section?.image || story_section?.image || "",
      removeImage: this.parseBoolean(remove_images.story_image),
    });

    return {
      slug: req.body.slug,
      hero_section,
      story_section,
      stats_section,
      features_section,
      cta_section,
    };
  }

  async createAboutPage(req, res) {
    try {
      const payload = this.buildPayload(req);
      const errors = this.validatePayload(payload);

      if (errors.length > 0) {
        handlers.logger.failed({
          object_type: "create_about_page",
          message: "Validation failed",
          data: errors,
        });

        return sendValidationError({ res, errors });
      }

      const existingContent = await AboutPage.findOne({
        slug: payload.slug.trim(),
      });

      if (existingContent) {
        return handlers.response.failed({
          res,
          code: 400,
          message: "About page content with this slug already exists",
        });
      }

      const content = await AboutPage.create({
        ...payload,
        slug: payload.slug.trim(),
      });

      return handlers.response.success({
        res,
        message: "About page content created successfully",
        data: content,
      });
    } catch (error) {
      return handlers.response.error({
        res,
        message: error.message,
      });
    }
  }

  async getAboutPage(req, res) {
    try {
      const { slug } = req.params;

      const content = await AboutPage.findOne({ slug });

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

  async updateAboutPage(req, res) {
    try {
      const { slug } = req.params;

      const existingContent = await AboutPage.findOne({ slug });

      if (!existingContent) {
        return handlers.response.unavailable({
          res,
          code: 404,
          message: "About page content not found",
        });
      }

      const payload = this.buildPayload(req, existingContent);
      const errors = this.validatePayload(payload);

      if (errors.length > 0) {
        handlers.logger.failed({
          object_type: "update_about_page",
          message: "Validation failed",
          data: errors,
        });

        return sendValidationError({ res, errors });
      }

      existingContent.hero_section = payload.hero_section;
      existingContent.story_section = payload.story_section;
      existingContent.stats_section = payload.stats_section;
      existingContent.features_section = payload.features_section;
      existingContent.cta_section = payload.cta_section;

      await existingContent.save();

      return handlers.response.success({
        res,
        message: "About page content updated successfully",
        data: existingContent,
      });
    } catch (error) {
      handlers.logger.error({
        object_type: "update_about_page",
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