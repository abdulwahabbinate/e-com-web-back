class Controller {
  constructor() {
    this.service = require("../../services/admin/admin-payment-setting-service");
  }

  async getPaymentSettings(req, res) {
    await this.service.getPaymentSettings(req, res);
  }

  async updatePaymentSettings(req, res) {
    await this.service.updatePaymentSettings(req, res);
  }
}

module.exports = new Controller();