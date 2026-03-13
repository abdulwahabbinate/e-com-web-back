class Controller {
  constructor() {
    this.service = require("../../services/public/settings-service");
  }

  async getSettings(req, res) {
    await this.service.getSettings(req, res);
  }
}

module.exports = new Controller();