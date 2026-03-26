class Controller {
  constructor() {
    this.service = require("../../services/admin/admin-contact-message-service");
  }

  async getContactMessages(req, res) {
    await this.service.getContactMessages(req, res);
  }

  async updateContactMessageStatus(req, res) {
    await this.service.updateContactMessageStatus(req, res);
  }

  async getContactMessage(req, res) {
    await this.service.getContactMessage(req, res);
  }
}

module.exports = new Controller();