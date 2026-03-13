class Controller {
  constructor() {
    this.service = require("../../services/public/content-service");
  }

  async getContent(req, res) {
    await this.service.getContent(req, res);
  }
}

module.exports = new Controller();