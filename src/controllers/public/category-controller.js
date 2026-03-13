class Controller {
  constructor() {
    this.service = require("../../services/public/category-service");
  }

  async getAllCategories(req, res) {
    await this.service.getAllCategories(req, res);
  }

  async getCategoryBySlug(req, res) {
    await this.service.getCategoryBySlug(req, res);
  }

  async getMenuCategories(req, res) {
    await this.service.getMenuCategories(req, res);
  }
}

module.exports = new Controller();