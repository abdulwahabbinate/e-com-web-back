class Controller {
  constructor() {
    this.service = require("../../services/public/home-page-service");
  }

  async getHomePage(req, res) {
    await this.service.getHomePage(req, res);
  }
}

module.exports = new Controller();