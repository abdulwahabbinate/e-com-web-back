class Controller {
  constructor() {
    this.service = require("../../services/admin/admin-about-page-service");
  }

  async createAboutPage(req, res) {
    await this.service.createAboutPage(req, res);
  }

  async getAboutPage(req, res) {
    await this.service.getAboutPage(req, res);
  }

  async updateAboutPage(req, res) {
    await this.service.updateAboutPage(req, res);
  }
}

module.exports = new Controller();