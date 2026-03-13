class Controller {
  constructor() {
    this.service = require("../../services/public/product-service");
  }

  async getAllProducts(req, res) {
    await this.service.getAllProducts(req, res);
  }

  async getProduct(req, res) {
    await this.service.getProduct(req, res);
  }
}

module.exports = new Controller();