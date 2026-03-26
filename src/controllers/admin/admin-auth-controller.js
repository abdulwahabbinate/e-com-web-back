class Controller {
  constructor() {
    this.service = require("../../services/admin/admin-auth-service");
  }

  async login(req, res) {
    await this.service.login(req, res);
  }

  async profile(req, res) {
    await this.service.profile(req, res);
  }

  async updateProfile(req, res) {
    await this.service.updateProfile(req, res);
  }

  async changePassword(req, res) {
    await this.service.changePassword(req, res);
  }
}

module.exports = new Controller();