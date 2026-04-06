const NewsletterService = require("../../services/newsletter/newsletter-service");

class NewsletterController {
  constructor() {
    this.service = NewsletterService;
  }

  async subscribe(req, res) {
    await this.service.subscribe(req, res);
  }
}

module.exports = new NewsletterController();