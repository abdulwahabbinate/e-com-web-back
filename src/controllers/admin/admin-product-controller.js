class Controller {
  constructor() {
    this.service = require("../../services/admin/admin-product-service");
  }

  async createProduct(req, res) {
    await this.service.createProduct(req, res);
  }

  async getAllProducts(req, res) {
    await this.service.getAllProducts(req, res);
  }

  async getProduct(req, res) {
    await this.service.getProduct(req, res);
  }

  async updateProduct(req, res) {
    await this.service.updateProduct(req, res);
  }

  async deleteProduct(req, res) {
    await this.service.deleteProduct(req, res);
  }
}

module.exports = new Controller();