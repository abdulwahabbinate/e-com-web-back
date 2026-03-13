const Category = require("../../models/Category");
const slugify = require("../../utilities/helpers/slugify");
const buildFileUrl = require("../../utilities/helpers/file-url");
const { handlers } = require("../../utilities/handlers/handlers");
const { sendValidationError } = require("../../utilities/validations/common-validations");

class Service {
  async createCategory(req, res) {
    try {
      const {
        name,
        description,
        menu_section,
        group_title,
        sort_order,
        icon,
        is_active,
      } = req.body;

      const errors = [];

      if (!name || !name.trim()) {
        errors.push({
          field: "name",
          message: "Category name is required",
        });
      }

      if (!menu_section || !["retail", "wholesale"].includes(String(menu_section).toLowerCase())) {
        errors.push({
          field: "menu_section",
          message: "menu_section must be retail or wholesale",
        });
      }

      if (!group_title || !group_title.trim()) {
        errors.push({
          field: "group_title",
          message: "group_title is required",
        });
      }

      if (sort_order !== undefined && isNaN(sort_order)) {
        errors.push({
          field: "sort_order",
          message: "sort_order must be a valid number",
        });
      }

      if (errors.length > 0) {
        return sendValidationError({ res, errors });
      }

      const slug = slugify(name);

      const existingCategory = await Category.findOne({ slug });
      if (existingCategory) {
        return handlers.response.failed({
          res,
          code: 400,
          message: "Category already exists",
        });
      }

      let imagePath = "";
      if (req.file) {
        imagePath = buildFileUrl(req, req.file.path);
      }

      const category = await Category.create({
        name: name.trim(),
        slug,
        image: imagePath,
        description: description ? description.trim() : "",
        menu_section: String(menu_section).toLowerCase(),
        group_title: group_title.trim(),
        sort_order: sort_order ? Number(sort_order) : 0,
        icon: icon || "",
        is_active:
          typeof is_active === "undefined" ? true : String(is_active) === "true",
      });

      return handlers.response.success({
        res,
        code: 201,
        message: "Category created successfully",
        data: category,
      });
    } catch (error) {
      handlers.logger.error({
        object_type: "create_category",
        message: error.message,
      });

      return handlers.response.error({
        res,
        message: "Internal server error",
      });
    }
  }

  async getAllCategories(req, res) {
    try {
      const categories = await Category.find().sort({
        menu_section: 1,
        group_title: 1,
        sort_order: 1,
        createdAt: -1,
      });

      return handlers.response.success({
        res,
        message: "Categories retrieved successfully",
        data: categories,
      });
    } catch (error) {
      return handlers.response.error({
        res,
        message: "Internal server error",
      });
    }
  }

  async getCategory(req, res) {
    try {
      const { id } = req.params;

      const category = await Category.findById(id);

      if (!category) {
        return handlers.response.unavailable({
          res,
          code: 404,
          message: "Category not found",
        });
      }

      return handlers.response.success({
        res,
        message: "Category retrieved successfully",
        data: category,
      });
    } catch (error) {
      return handlers.response.error({
        res,
        message: "Internal server error",
      });
    }
  }

  async updateCategory(req, res) {
    try {
      const { id } = req.params;
      const {
        name,
        description,
        menu_section,
        group_title,
        sort_order,
        icon,
        is_active,
      } = req.body;

      const errors = [];

      if (!id) {
        errors.push({
          field: "id",
          message: "Category id is required",
        });
      }

      if (name !== undefined && !String(name).trim()) {
        errors.push({
          field: "name",
          message: "Category name can not be empty",
        });
      }

      if (
        menu_section !== undefined &&
        !["retail", "wholesale"].includes(String(menu_section).toLowerCase())
      ) {
        errors.push({
          field: "menu_section",
          message: "menu_section must be retail or wholesale",
        });
      }

      if (group_title !== undefined && !String(group_title).trim()) {
        errors.push({
          field: "group_title",
          message: "group_title can not be empty",
        });
      }

      if (sort_order !== undefined && isNaN(sort_order)) {
        errors.push({
          field: "sort_order",
          message: "sort_order must be a valid number",
        });
      }

      if (errors.length > 0) {
        return sendValidationError({ res, errors });
      }

      const category = await Category.findById(id);

      if (!category) {
        return handlers.response.unavailable({
          res,
          code: 404,
          message: "Category not found",
        });
      }

      if (name !== undefined && String(name).trim()) {
        category.name = String(name).trim();
        category.slug = slugify(name);
      }

      if (description !== undefined) {
        category.description = description.trim();
      }

      if (menu_section !== undefined) {
        category.menu_section = String(menu_section).toLowerCase();
      }

      if (group_title !== undefined) {
        category.group_title = group_title.trim();
      }

      if (sort_order !== undefined) {
        category.sort_order = Number(sort_order);
      }

      if (icon !== undefined) {
        category.icon = icon;
      }

      if (typeof is_active !== "undefined") {
        category.is_active = String(is_active) === "true";
      }

      if (req.file) {
        category.image = buildFileUrl(req, req.file.path);
      }

      await category.save();

      return handlers.response.success({
        res,
        message: "Category updated successfully",
        data: category,
      });
    } catch (error) {
      handlers.logger.error({
        object_type: "update_category",
        message: error.message,
      });

      return handlers.response.error({
        res,
        message: "Internal server error",
      });
    }
  }

  async deleteCategory(req, res) {
    try {
      const { id } = req.params;

      const category = await Category.findById(id);

      if (!category) {
        return handlers.response.unavailable({
          res,
          code: 404,
          message: "Category not found",
        });
      }

      await category.deleteOne();

      return handlers.response.success({
        res,
        message: "Category deleted successfully",
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