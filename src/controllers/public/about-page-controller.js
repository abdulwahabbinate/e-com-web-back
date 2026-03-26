class Controller {
  constructor() {
    this.service = require("../../services/public/about-page-service");
  }

  async getAboutPage(req, res) {
    await this.service.getAboutPage(req, res);
  }
}

module.exports = new Controller();