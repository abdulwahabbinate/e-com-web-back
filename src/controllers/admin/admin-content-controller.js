class Controller {
  constructor() {
    this.service = require("../../services/admin/admin-content-service");
  }

  async createContent(req, res) {
    await this.service.createContent(req, res);
  }

  async getContent(req, res) {
    await this.service.getContent(req, res);
  }

  async updateContent(req, res) {
    await this.service.updateContent(req, res);
  }
}

module.exports = new Controller();