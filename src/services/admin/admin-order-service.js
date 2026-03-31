const Order = require("../../models/Order");
const { handlers } = require("../../utilities/handlers/handlers");
const { sendValidationError } = require("../../utilities/validations/common-validations");

class OrderService {
  async getOrders(req, res) {
    try {
      const orders = await Order.find().sort({ createdAt: -1 });

      return handlers.response.success({
        res,
        message: "Orders retrieved successfully",
        data: orders,
      });
    } catch (error) {
      return handlers.response.error({
        res,
        message: error.message,
      });
    }
  }

  async getOrderById(req, res) {
    try {
      const { id } = req.params;

      const order = await Order.findById(id);

      if (!order) {
        return handlers.response.unavailable({
          res,
          code: 404,
          message: "Order not found",
        });
      }

      return handlers.response.success({
        res,
        message: "Order retrieved successfully",
        data: order,
      });
    } catch (error) {
      return handlers.response.error({
        res,
        message: error.message,
      });
    }
  }

  async updateOrderStatus(req, res) {
    try {
      const { id } = req.params;
      const { order_status, payment_status } = req.body;
      const errors = [];

      const allowedOrderStatuses = ["placed", "processing", "shipped", "delivered", "cancelled"];
      const allowedPaymentStatuses = ["pending", "paid", "failed"];

      if (order_status && !allowedOrderStatuses.includes(order_status)) {
        errors.push({
          field: "order_status",
          message: "Order status must be one of the following: placed, processing, shipped, delivered, cancelled",
        });
      }

      if (payment_status && !allowedPaymentStatuses.includes(payment_status)) {
        errors.push({
          field: "payment_status",
          message: "Payment status must be one of the following: pending, paid, failed",
        });
      }

      if (errors.length > 0) {
        return sendValidationError({ res, errors });
      }

      const order = await Order.findById(id);

      if (!order) {
        return handlers.response.unavailable({
          res,
          code: 404,
          message: "Order not found",
        });
      }

      if (order_status) order.order_status = order_status;
      if (payment_status) order.payment_status = payment_status;

      await order.save();

      return handlers.response.success({
        res,
        message: "Order status updated successfully",
        data: order,
      });
    } catch (error) {
      return handlers.response.error({
        res,
        message: error.message,
      });
    }
  }
}

module.exports = new OrderService();