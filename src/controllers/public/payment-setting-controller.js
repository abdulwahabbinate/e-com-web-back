class Controller {
  constructor() {
    this.service = require("../../services/public/payment-setting-service");
  }

  async getPaymentSettings(req, res) {
    await this.service.getPaymentSettings(req, res);
  }
}

module.exports = new Controller();