const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    first_name: {
      type: String,
      trim: true,
      default: "",
    },
    last_name: {
      type: String,
      trim: true,
      default: "",
    },
    avatar: {
      type: String,
      default: "",
    },
    phone: {
      type: String,
      trim: true,
      default: "",
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ["admin", "user", "provider"],
      default: "admin",
    },
    bio: {
      type: String,
      default: "",
    },
    device_token: {
      type: String,
      default: "",
    },
    device_type: {
      type: String,
      default: "",
    },
    location: {
      type: String,
      default: "",
    },
    address: {
      type: String,
      default: "",
    },
    city: {
      type: String,
      default: "",
    },
    state: {
      type: String,
      default: "",
    },
    zip_code: {
      type: String,
      default: "",
    },
    gender: {
      type: String,
      enum: ["male", "female", "other", ""],
      default: "",
    },
    is_verified: {
      type: Boolean,
      default: false,
    },
    is_profile_completed: {
      type: Boolean,
      default: false,
    },
    is_notification_enabled: {
      type: Boolean,
      default: true,
    },
    terms_and_conditions: {
      type: Boolean,
      default: false,
    },
    privacy_policy: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
    collection: "users",
  }
);

module.exports = mongoose.model("User", userSchema);