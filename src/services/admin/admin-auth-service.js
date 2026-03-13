const bcrypt = require("bcryptjs");
const Admin = require("../../models/Admin");
const { handlers } = require("../../utilities/handlers/handlers");
const { sendValidationError } = require("../../utilities/validations/common-validations");
const { generateAdminToken } = require("../../utilities/helpers/token");

class Service {
  async login(req, res) {
    try {
      const { email_address, password } = req.body;
      const errors = [];

      if (!email_address || !/\S+@\S+\.\S+/.test(email_address)) {
        errors.push({
          field: "email_address",
          message: "Valid email is required",
        });
      }

      if (!password || !password.trim()) {
        errors.push({
          field: "password",
          message: "Password is required",
        });
      }

      if (errors.length > 0) {
        handlers.logger.failed({
          object_type: "admin_login",
          message: "Validation failed",
          data: errors,
        });

        return sendValidationError({ res, errors });
      }

      const admin = await Admin.findOne({
        email: email_address.toLowerCase().trim(),
      });

      if (!admin) {
        return handlers.response.unauthorized({
          res,
          code: 403,
          message: "Invalid credentials",
        });
      }

      const isPasswordMatched = await bcrypt.compare(password, admin.password);

      if (!isPasswordMatched) {
        return handlers.response.unauthorized({
          res,
          code: 403,
          message: "Invalid credentials",
        });
      }

      const token = generateAdminToken(admin);

      return handlers.response.success({
        res,
        code: 200,
        message: "Admin login successful",
        data: {
          admin: {
            id: admin._id,
            name: admin.name,
            email: admin.email,
          },
          token,
        },
      });
    } catch (error) {
      handlers.logger.error({
        object_type: "admin_login",
        message: error.message,
      });

      return handlers.response.error({
        res,
        code: 500,
        message: "Internal server error",
      });
    }
  }

  async profile(req, res) {
    try {
      return handlers.response.success({
        res,
        message: "Admin profile fetched successfully",
        data: req.admin,
      });
    } catch (error) {
      return handlers.response.error({
        res,
        message: "Internal server error",
      });
    }
  }
}

module.exports = new Service();