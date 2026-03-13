const Category = require("../../models/Category");
const { handlers } = require("../../utilities/handlers/handlers");

class Service {
  async getAllCategories(req, res) {
    try {
      const categories = await Category.find({ is_active: true }).sort({
        menu_section: 1,
        group_title: 1,
        sort_order: 1,
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

  async getCategoryBySlug(req, res) {
    try {
      const { slug } = req.params;

      const category = await Category.findOne({ slug, is_active: true });

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

  async getMenuCategories(req, res) {
    try {
      const categories = await Category.find({ is_active: true }).sort({
        menu_section: 1,
        group_title: 1,
        sort_order: 1,
      });

      const sectionMeta = {
        retail: {
          id: "retail",
          title: "Retail",
          icon: "🛍️",
          description: "Shop individual fashion products",
        },
        wholesale: {
          id: "wholesale",
          title: "Wholesale",
          icon: "📦",
          description: "Bulk seasonal product categories",
        },
      };

      const grouped = {};

      categories.forEach((category) => {
        const sectionKey = category.menu_section;

        if (!grouped[sectionKey]) {
          grouped[sectionKey] = {
            ...sectionMeta[sectionKey],
            children: [],
          };
        }

        let existingGroup = grouped[sectionKey].children.find(
          (item) => item.title === category.group_title
        );

        if (!existingGroup) {
          existingGroup = {
            id: `${sectionKey}-${category.group_title.toLowerCase().replace(/\s+/g, "-")}`,
            title: category.group_title,
            children: [],
          };

          grouped[sectionKey].children.push(existingGroup);
        }

        existingGroup.children.push({
          id: category._id,
          title: category.name,
          slug: category.slug,
          image: category.image,
          description: category.description,
          sort_order: category.sort_order,
        });
      });

      const menu = Object.values(grouped);

      return handlers.response.success({
        res,
        message: "Menu categories retrieved successfully",
        data: menu,
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