const OrderService = require("../../services/admin/admin-order-service");

class OrderController {
  constructor() {
    this.service = OrderService;
  }

  async getOrders(req, res) {
    await this.service.getOrders(req, res);
  }

  async getOrderById(req, res) {
    await this.service.getOrderById(req, res);
  }

  async updateOrderStatus(req, res) {
    await this.service.updateOrderStatus(req, res);
  }
}

module.exports = new OrderController();