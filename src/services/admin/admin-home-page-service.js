const HomePage = require("../../models/HomePage");
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

    if (
      !data.hero_section ||
      !Array.isArray(data.hero_section.slides) ||
      data.hero_section.slides.length === 0
    ) {
      errors.push({
        field: "hero_section.slides",
        message: "At least one hero slide is required",
      });
    }

    (data.hero_section?.slides || []).forEach((item, index) => {
      if (!item.title || !String(item.title).trim()) {
        errors.push({
          field: `hero_section.slides.${index}.title`,
          message: "Hero slide title is required",
        });
      }
    });

    return errors;
  }

  buildPayload(req, existingContent = null) {
    const hero_section = this.parseJsonField(req.body.hero_section, {
      badge: "",
      slides: [],
    });

    const promo_section = this.parseJsonField(req.body.promo_section, {
      left_card: {},
      right_card: {},
    });

    const lookbook_section = this.parseJsonField(req.body.lookbook_section, {
      badge: "",
      title: "",
      description: "",
      items: [],
    });

    const limited_offer_section = this.parseJsonField(
      req.body.limited_offer_section,
      {}
    );

    const features_section = this.parseJsonField(req.body.features_section, {
      badge: "",
      title: "",
      description: "",
      items: [],
    });

    const testimonial_section = this.parseJsonField(
      req.body.testimonial_section,
      {
        badge: "",
        title: "",
        description: "",
        items: [],
      }
    );

    const newsletter_section = this.parseJsonField(req.body.newsletter_section, {
      badge: "",
      title: "",
      description: "",
      placeholder: "",
      button_text: "",
    });

    const remove_images = this.parseJsonField(req.body.remove_images, {});

    hero_section.slides = (hero_section.slides || []).map((item, index) => {
      const oldValue =
        existingContent?.hero_section?.slides?.[index]?.image || item.image || "";

      return {
        ...item,
        image: this.resolveImageField({
          req,
          fieldName: `hero_slide_image_${index}`,
          oldValue,
          removeImage: this.parseBoolean(remove_images[`hero_slide_image_${index}`]),
        }),
      };
    });

    promo_section.left_card = {
      ...promo_section.left_card,
      image: this.resolveImageField({
        req,
        fieldName: "promo_left_image",
        oldValue:
          existingContent?.promo_section?.left_card?.image ||
          promo_section?.left_card?.image ||
          "",
        removeImage: this.parseBoolean(remove_images.promo_left_image),
      }),
    };

    promo_section.right_card = {
      ...promo_section.right_card,
      image: this.resolveImageField({
        req,
        fieldName: "promo_right_image",
        oldValue:
          existingContent?.promo_section?.right_card?.image ||
          promo_section?.right_card?.image ||
          "",
        removeImage: this.parseBoolean(remove_images.promo_right_image),
      }),
    };

    lookbook_section.items = (lookbook_section.items || []).map((item, index) => {
      const oldValue =
        existingContent?.lookbook_section?.items?.[index]?.image ||
        item.image ||
        "";

      return {
        ...item,
        image: this.resolveImageField({
          req,
          fieldName: `lookbook_item_image_${index}`,
          oldValue,
          removeImage: this.parseBoolean(remove_images[`lookbook_item_image_${index}`]),
        }),
      };
    });

    limited_offer_section.image = this.resolveImageField({
      req,
      fieldName: "limited_offer_image",
      oldValue:
        existingContent?.limited_offer_section?.image ||
        limited_offer_section?.image ||
        "",
      removeImage: this.parseBoolean(remove_images.limited_offer_image),
    });

    return {
      slug: req.body.slug,
      hero_section,
      promo_section,
      lookbook_section,
      limited_offer_section,
      features_section,
      testimonial_section,
      newsletter_section,
    };
  }

  async createHomePage(req, res) {
    try {
      const payload = this.buildPayload(req);
      const errors = this.validatePayload(payload);

      if (errors.length > 0) {
        handlers.logger.failed({
          object_type: "create_home_page",
          message: "Validation failed",
          data: errors,
        });

        return sendValidationError({ res, errors });
      }

      const existingContent = await HomePage.findOne({
        slug: payload.slug.trim(),
      });

      if (existingContent) {
        return handlers.response.failed({
          res,
          code: 400,
          message: "Home page content with this slug already exists",
        });
      }

      const content = await HomePage.create({
        ...payload,
        slug: payload.slug.trim(),
      });

      return handlers.response.success({
        res,
        message: "Home page content created successfully",
        data: content,
      });
    } catch (error) {
      return handlers.response.error({
        res,
        message: error.message,
      });
    }
  }

  async getHomePage(req, res) {
    try {
      const { slug } = req.params;

      const content = await HomePage.findOne({ slug });

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

  async updateHomePage(req, res) {
    try {
      const { slug } = req.params;

      const existingContent = await HomePage.findOne({ slug });

      if (!existingContent) {
        return handlers.response.unavailable({
          res,
          code: 404,
          message: "Home page content not found",
        });
      }

      const payload = this.buildPayload(req, existingContent);
      const errors = this.validatePayload(payload);

      if (errors.length > 0) {
        handlers.logger.failed({
          object_type: "update_home_page",
          message: "Validation failed",
          data: errors,
        });

        return sendValidationError({ res, errors });
      }

      existingContent.hero_section = payload.hero_section;
      existingContent.promo_section = payload.promo_section;
      existingContent.lookbook_section = payload.lookbook_section;
      existingContent.limited_offer_section = payload.limited_offer_section;
      existingContent.features_section = payload.features_section;
      existingContent.testimonial_section = payload.testimonial_section;
      existingContent.newsletter_section = payload.newsletter_section;

      await existingContent.save();

      return handlers.response.success({
        res,
        message: "Home page content updated successfully",
        data: existingContent,
      });
    } catch (error) {
      handlers.logger.error({
        object_type: "update_home_page",
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