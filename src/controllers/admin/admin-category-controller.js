class Controller {
  constructor() {
    this.service = require("../../services/admin/admin-category-service");
  }

  async createCategory(req, res) {
    await this.service.createCategory(req, res);
  }

  async getAllCategories(req, res) {
    await this.service.getAllCategories(req, res);
  }

  async getCategory(req, res) {
    await this.service.getCategory(req, res);
  }

  async updateCategory(req, res) {
    await this.service.updateCategory(req, res);
  }

  async deleteCategory(req, res) {
    await this.service.deleteCategory(req, res);
  }
}

module.exports = new Controller();