class Controller {
  constructor() {
    this.service = require("../../services/public/stripe-payment-service");
  }

  async createPaymentIntent(req, res) {
    await this.service.createPaymentIntent(req, res);
  }
}

module.exports = new Controller();