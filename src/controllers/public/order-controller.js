class Controller {
  constructor() {
    this.service = require("../../services/public/order-service");
  }

  async createOrder(req, res) {
    await this.service.createOrder(req, res);
  }
}

module.exports = new Controller();