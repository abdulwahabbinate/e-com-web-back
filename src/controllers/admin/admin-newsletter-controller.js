const NewsletterService = require("../../services/admin/admin-newsletter-service");

class NewsletterController {
  constructor() {
    this.service = NewsletterService;
  }

  async getStats(req, res) {
    await this.service.getStats(req, res);
  }

  async getSubscribers(req, res) {
    await this.service.getSubscribers(req, res);
  }

  async getCampaigns(req, res) {
    await this.service.getCampaigns(req, res);
  }

  async sendCampaign(req, res) {
    await this.service.sendCampaign(req, res);
  }

  async updateSubscriberStatus(req, res) {
    await this.service.updateSubscriberStatus(req, res);
  }

  async removeSubscriber(req, res) {
    await this.service.removeSubscriber(req, res);
  }
}

module.exports = new NewsletterController();