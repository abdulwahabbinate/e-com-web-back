class Controller {
  constructor() {
    this.service = require("../../services/public/contact-message-service");
  }

  async submitContactMessage(req, res) {
    await this.service.submitContactMessage(req, res);
  }
}

module.exports = new Controller();