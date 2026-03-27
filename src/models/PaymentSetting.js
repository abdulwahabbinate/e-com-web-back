const mongoose = require("mongoose");

const paymentSettingSchema = new mongoose.Schema(
  {
    slug: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      default: "default",
    },
    cash_on_delivery_enabled: {
      type: Boolean,
      default: false,
    },
    card_payment_enabled: {
      type: Boolean,
      default: true,
    },
    admin_notification_email: {
      type: String,
      default: "",
      trim: true,
      lowercase: true,
    },
    gateway_name: {
      type: String,
      default: "stripe",
      trim: true,
    },
    sandbox_mode: {
      type: Boolean,
      default: true,
    },
    stripe_publishable_key: {
      type: String,
      default: "",
      trim: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("PaymentSetting", paymentSettingSchema);