const Content = require("../../models/Content");
const buildFileUrl = require("../../utilities/helpers/file-url");
const { handlers } = require("../../utilities/handlers/handlers");
const { sendValidationError } = require("../../utilities/validations/common-validations");

class Service {
  async createContent(req, res) {
    try {
      const { page_title, slug, description } = req.body;
      const errors = [];

      if (!page_title || !page_title.trim()) {
        errors.push({
          field: "page_title",
          message: "Page title is required",
        });
      }

      if (!slug || !slug.trim()) {
        errors.push({
          field: "slug",
          message: "Slug is required",
        });
      }

      if (!description || !description.trim()) {
        errors.push({
          field: "description",
          message: "Description is required",
        });
      }

      if (errors.length > 0) {
        handlers.logger.failed({
          object_type: "create_content",
          message: "Validation failed",
          data: errors,
        });

        return sendValidationError({ res, errors });
      }

      const existingContent = await Content.findOne({ slug: slug.trim() });
      if (existingContent) {
        return handlers.response.failed({
          res,
          code: 400,
          message: "Content with this slug already exists",
        });
      }

      let imagePath = "";
      if (req.file) {
        imagePath = buildFileUrl(req, req.file.path);
      }

      const content = await Content.create({
        page_title: page_title.trim(),
        slug: slug.trim(),
        description: description.trim(),
        image: imagePath,
      });

      return handlers.response.success({
        res,
        message: "Content created successfully",
        data: content,
      });
    } catch (error) {
      return handlers.response.error({
        res,
        message: error.message,
      });
    }
  }

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
        message: error.message,
      });
    }
  }

  async updateContent(req, res) {
    try {
      const { slug } = req.params;
      const { page_title, description } = req.body;
      const errors = [];

      if (!slug) {
        errors.push({
          field: "slug",
          message: "Slug is required",
        });
      }

      if (page_title !== undefined && page_title.trim() === "") {
        errors.push({
          field: "page_title",
          message: "Page title can not be empty",
        });
      }

      if (description !== undefined && description.trim() === "") {
        errors.push({
          field: "description",
          message: "Description can not be empty",
        });
      }

      if (errors.length > 0) {
        handlers.logger.failed({
          object_type: "update_content",
          message: "Validation failed",
          data: errors,
        });

        return sendValidationError({ res, errors });
      }

      const content = await Content.findOne({ slug });

      if (!content) {
        return handlers.response.unavailable({
          res,
          code: 404,
          message: "Content not found",
        });
      }

      if (page_title !== undefined && page_title.trim() !== "") {
        content.page_title = page_title.trim();
      }

      if (description !== undefined && description.trim() !== "") {
        content.description = description.trim();
      }

      if (req.file) {
        content.image = buildFileUrl(req, req.file.path);
      }

      await content.save();

      return handlers.response.success({
        res,
        message: "Content updated successfully",
        data: content,
      });
    } catch (error) {
      handlers.logger.error({
        object_type: "update_content",
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