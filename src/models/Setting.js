const mongoose = require("mongoose");

const settingSchema = new mongoose.Schema(
  {
    site_name: {
      type: String,
      default: "E-Commerce",
    },
    logo: {
      type: String,
      default: "",
    },
    favicon: {
      type: String,
      default: "",
    },
    support_email: {
      type: String,
      default: "",
    },
    support_phone: {
      type: String,
      default: "",
    },
    payment_methods: {
      cod: { type: Boolean, default: true },
      stripe: { type: Boolean, default: false },
      bank_transfer: { type: Boolean, default: false },
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Setting", settingSchema);