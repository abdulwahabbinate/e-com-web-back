class Controller {
  constructor() {
    this.service = require("../../services/admin/admin-dashboard-service");
  }

  async getStats(req, res) {
    await this.service.getStats(req, res);
  }
}

module.exports = new Controller();