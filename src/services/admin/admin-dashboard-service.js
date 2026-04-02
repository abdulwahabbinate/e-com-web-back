const Category = require("../../models/Category");
const Product = require("../../models/Product");
const Content = require("../../models/Content");
const Order = require("../../models/Order");
const { handlers } = require("../../utilities/handlers/handlers");

class Service {
  async getStats(req, res) {
    try {
      const [
        totalCategories,
        totalProducts,
        activeProducts,
        featuredProducts,
        lowStockProducts,
        totalContentPages,
        totalOrders,
        placedOrders,
        processingOrders,
        shippedOrders,
        deliveredOrders,
        cancelledOrders,
        paidOrders,
        pendingPaymentOrders,
        failedPaymentOrders,
        codOrders,
        revenueResult,
      ] = await Promise.all([
        Category.countDocuments(),
        Product.countDocuments(),
        Product.countDocuments({ is_active: true }),
        Product.countDocuments({ is_featured: true }),
        Product.countDocuments({ stock: { $lte: 5 } }),
        Content.countDocuments(),

        Order.countDocuments(),
        Order.countDocuments({ order_status: "placed" }),
        Order.countDocuments({ order_status: "processing" }),
        Order.countDocuments({ order_status: "shipped" }),
        Order.countDocuments({ order_status: "delivered" }),
        Order.countDocuments({ order_status: "cancelled" }),

        Order.countDocuments({ payment_status: "paid" }),
        Order.countDocuments({ payment_status: "pending" }),
        Order.countDocuments({ payment_status: "failed" }),
        Order.countDocuments({ payment_method: "cod" }),

        Order.aggregate([
          { $match: { payment_status: "paid" } },
          {
            $group: {
              _id: null,
              totalRevenue: { $sum: "$total" },
            },
          },
        ]),
      ]);

      const totalRevenue = revenueResult?.[0]?.totalRevenue || 0;

      return handlers.response.success({
        res,
        message: "Dashboard stats retrieved successfully",
        data: {
          totalCategories,
          totalProducts,
          activeProducts,
          featuredProducts,
          lowStockProducts,
          totalContentPages,

          totalOrders,
          placedOrders,
          processingOrders,
          shippedOrders,
          deliveredOrders,
          cancelledOrders,

          paidOrders,
          pendingPaymentOrders,
          failedPaymentOrders,
          codOrders,
          totalRevenue,
        },
      });
    } catch (error) {
      return handlers.response.error({
        res,
        message: error.message || "Internal server error",
      });
    }
  }
}

module.exports = new Service();
