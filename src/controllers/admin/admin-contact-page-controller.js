class Controller {
  constructor() {
    this.service = require("../../services/admin/admin-contact-page-service");
  }

  async createContactPage(req, res) {
    await this.service.createContactPage(req, res);
  }

  async getContactPage(req, res) {
    await this.service.getContactPage(req, res);
  }

  async updateContactPage(req, res) {
    await this.service.updateContactPage(req, res);
  }
}

module.exports = new Controller();