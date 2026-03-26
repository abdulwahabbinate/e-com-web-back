class Controller {
  constructor() {
    this.service = require("../../services/public/contact-page-service");
  }

  async getContactPage(req, res) {
    await this.service.getContactPage(req, res);
  }
}

module.exports = new Controller();