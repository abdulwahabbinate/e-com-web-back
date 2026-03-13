const Category = require("../../models/Category");
const Product = require("../../models/Product");
const Content = require("../../models/Content");
const { handlers } = require("../../utilities/handlers/handlers");

class Service {
  async getStats(req, res) {
    try {
      const total_categories = await Category.countDocuments();
      const total_products = await Product.countDocuments();
      const active_products = await Product.countDocuments({ is_active: true });
      const featured_products = await Product.countDocuments({ is_featured: true });
      const low_stock_products = await Product.countDocuments({ stock: { $lte: 5 } });
      const total_content_pages = await Content.countDocuments();

      return handlers.response.success({
        res,
        message: "Dashboard stats retrieved successfully",
        data: {
          total_categories,
          total_products,
          active_products,
          featured_products,
          low_stock_products,
          total_content_pages,
        },
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