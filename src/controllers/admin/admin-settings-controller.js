class Controller {
  constructor() {
    this.service = require("../../services/admin/admin-settings-service");
  }

  async getSettings(req, res) {
    await this.service.getSettings(req, res);
  }

  async updateSettings(req, res) {
    await this.service.updateSettings(req, res);
  }
}

module.exports = new Controller();