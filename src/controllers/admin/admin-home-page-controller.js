class Controller {
  constructor() {
    this.service = require("../../services/admin/admin-home-page-service");
  }

  async createHomePage(req, res) {
    await this.service.createHomePage(req, res);
  }

  async getHomePage(req, res) {
    await this.service.getHomePage(req, res);
  }

  async updateHomePage(req, res) {
    await this.service.updateHomePage(req, res);
  }
}

module.exports = new Controller();