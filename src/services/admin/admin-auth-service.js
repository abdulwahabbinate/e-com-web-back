const bcrypt = require("bcryptjs");
const fs = require("fs");
const path = require("path");
const User = require("../../models/User");
const { handlers } = require("../../utilities/handlers/handlers");
const { sendValidationError } = require("../../utilities/validations/common-validations");
const { generateAdminToken } = require("../../utilities/helpers/token");
const buildFileUrl = require("../../utilities/helpers/file-url");

class Service {
  getFilePathFromUrl(fileUrl) {
    try {
      if (!fileUrl) return "";

      const normalizedUrl = String(fileUrl).replace(/\\/g, "/");
      const uploadsMarker = "/uploads/";
      const uploadsIndex = normalizedUrl.indexOf(uploadsMarker);

      if (uploadsIndex === -1) return "";

      const relativeUploadsPath = normalizedUrl.substring(uploadsIndex + 1);
      return path.join(process.cwd(), relativeUploadsPath);
    } catch (error) {
      handlers.logger.error({
        object_type: "user_get_file_path_from_url",
        message: error.message,
      });
      return "";
    }
  }

  removeFileIfExists(filePath) {
    try {
      if (filePath && fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    } catch (error) {
      handlers.logger.error({
        object_type: "user_remove_file_if_exists",
        message: error.message,
      });
    }
  }

  sanitizeUser(user) {
    return {
      id: user._id,
      first_name: user.first_name || "",
      last_name: user.last_name || "",
      full_name: `${user.first_name || ""} ${user.last_name || ""}`.trim(),
      avatar: user.avatar || "",
      phone: user.phone || "",
      email: user.email || "",
      role: user.role || "",
      bio: user.bio || "",
      device_token: user.device_token || "",
      device_type: user.device_type || "",
      location: user.location || "",
      address: user.address || "",
      city: user.city || "",
      state: user.state || "",
      zip_code: user.zip_code || "",
      gender: user.gender || "",
      is_verified: !!user.is_verified,
      is_profile_completed: !!user.is_profile_completed,
      is_notification_enabled: !!user.is_notification_enabled,
      terms_and_conditions: !!user.terms_and_conditions,
      privacy_policy: !!user.privacy_policy,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }

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

      const user = await User.findOne({
        email: email_address.toLowerCase().trim(),
        role: "admin",
      });

      if (!user) {
        return handlers.response.unauthorized({
          res,
          code: 403,
          message: "Invalid credentials",
        });
      }

      const isPasswordMatched = await bcrypt.compare(password, user.password);

      if (!isPasswordMatched) {
        return handlers.response.unauthorized({
          res,
          code: 403,
          message: "Invalid credentials",
        });
      }

      const token = generateAdminToken(user);

      return handlers.response.success({
        res,
        code: 200,
        message: "Admin login successful",
        data: {
          admin: this.sanitizeUser(user),
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
      const user = await User.findById(req.admin._id || req.admin.id);

      if (!user || user.role !== "admin") {
        return handlers.response.unauthorized({
          res,
          code: 403,
          message: "Unauthorized access",
        });
      }

      return handlers.response.success({
        res,
        message: "Admin profile fetched successfully",
        data: this.sanitizeUser(user),
      });
    } catch (error) {
      handlers.logger.error({
        object_type: "admin_profile",
        message: error.message,
      });

      return handlers.response.error({
        res,
        message: "Internal server error",
      });
    }
  }

  async updateProfile(req, res) {
    try {
      const user = await User.findById(req.admin._id || req.admin.id);

      if (!user || user.role !== "admin") {
        return handlers.response.unauthorized({
          res,
          code: 403,
          message: "Unauthorized access",
        });
      }

      const {
        first_name,
        last_name,
        phone,
        bio,
        device_token,
        device_type,
        location,
        address,
        city,
        state,
        zip_code,
        gender,
        is_verified,
        is_profile_completed,
        is_notification_enabled,
        terms_and_conditions,
        privacy_policy,
      } = req.body;

      const errors = [];

      if (!first_name || !String(first_name).trim()) {
        errors.push({
          field: "first_name",
          message: "First name is required",
        });
      }

      if (!last_name || !String(last_name).trim()) {
        errors.push({
          field: "last_name",
          message: "Last name is required",
        });
      }

      if (!user.email || !/\S+@\S+\.\S+/.test(user.email)) {
        errors.push({
          field: "email",
          message: "Valid email is required",
        });
      }

      if (gender && !["male", "female", "other"].includes(String(gender).toLowerCase())) {
        errors.push({
          field: "gender",
          message: "Gender must be male, female or other",
        });
      }

      if (errors.length > 0) {
        return sendValidationError({ res, errors });
      }

      user.first_name = String(first_name).trim();
      user.last_name = String(last_name).trim();
      user.phone = phone ? String(phone).trim() : "";
      user.bio = bio ? String(bio).trim() : "";
      user.device_token = device_token ? String(device_token).trim() : "";
      user.device_type = device_type ? String(device_type).trim() : "";
      user.location = location ? String(location).trim() : "";
      user.address = address ? String(address).trim() : "";
      user.city = city ? String(city).trim() : "";
      user.state = state ? String(state).trim() : "";
      user.zip_code = zip_code ? String(zip_code).trim() : "";
      user.gender = gender ? String(gender).toLowerCase() : "";

      if (typeof is_verified !== "undefined") {
        user.is_verified = String(is_verified) === "true";
      }

      if (typeof is_profile_completed !== "undefined") {
        user.is_profile_completed = String(is_profile_completed) === "true";
      }

      if (typeof is_notification_enabled !== "undefined") {
        user.is_notification_enabled = String(is_notification_enabled) === "true";
      }

      if (typeof terms_and_conditions !== "undefined") {
        user.terms_and_conditions = String(terms_and_conditions) === "true";
      }

      if (typeof privacy_policy !== "undefined") {
        user.privacy_policy = String(privacy_policy) === "true";
      }

      if (req.file) {
        if (user.avatar) {
          const oldFilePath = this.getFilePathFromUrl(user.avatar);
          this.removeFileIfExists(oldFilePath);
        }
        user.avatar = buildFileUrl(req, req.file.path);
      }

      await user.save();

      return handlers.response.success({
        res,
        message: "Profile updated successfully",
        data: this.sanitizeUser(user),
      });
    } catch (error) {
      handlers.logger.error({
        object_type: "admin_update_profile",
        message: error.message,
      });

      return handlers.response.error({
        res,
        message: "Internal server error",
      });
    }
  }

  async changePassword(req, res) {
    try {
      const { current_password, new_password, confirm_password } = req.body;
      const errors = [];

      if (!current_password || !String(current_password).trim()) {
        errors.push({
          field: "current_password",
          message: "Current password is required",
        });
      }

      if (!new_password || String(new_password).trim().length < 6) {
        errors.push({
          field: "new_password",
          message: "New password must be at least 6 characters",
        });
      }

      if (!confirm_password || String(confirm_password).trim() !== String(new_password).trim()) {
        errors.push({
          field: "confirm_password",
          message: "Confirm password does not match",
        });
      }

      if (errors.length > 0) {
        return sendValidationError({ res, errors });
      }

      const user = await User.findById(req.admin._id || req.admin.id);

      if (!user || user.role !== "admin") {
        return handlers.response.unauthorized({
          res,
          code: 403,
          message: "Unauthorized access",
        });
      }

      const isMatched = await bcrypt.compare(current_password, user.password);

      if (!isMatched) {
        return handlers.response.failed({
          res,
          code: 400,
          message: "Current password is incorrect",
        });
      }

      const hashedPassword = await bcrypt.hash(new_password, 10);
      user.password = hashedPassword;
      await user.save();

      return handlers.response.success({
        res,
        message: "Password changed successfully",
      });
    } catch (error) {
      handlers.logger.error({
        object_type: "admin_change_password",
        message: error.message,
      });

      return handlers.response.error({
        res,
        message: "Internal server error",
      });
    }
  }
}

module.exports = new Service();