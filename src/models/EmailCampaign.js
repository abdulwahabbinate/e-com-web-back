const mongoose = require("mongoose");

const emailCampaignSchema = new mongoose.Schema(
  {
    subject: {
      type: String,
      required: true,
      trim: true,
    },
    heading: {
      type: String,
      default: "",
      trim: true,
    },
    message: {
      type: String,
      required: true,
      trim: true,
    },
    preview_text: {
      type: String,
      default: "",
      trim: true,
    },
    audience_type: {
      type: String,
      enum: ["subscribers", "order_customers", "all"],
      default: "subscribers",
    },
    cta_text: {
      type: String,
      default: "Shop Now",
      trim: true,
    },
    cta_link: {
      type: String,
      default: "",
      trim: true,
    },
    recipient_count: {
      type: Number,
      default: 0,
    },
    success_count: {
      type: Number,
      default: 0,
    },
    failed_count: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: ["sent", "partial_failed", "failed"],
      default: "sent",
    },
    sent_at: {
      type: Date,
      default: Date.now,
    },
    created_by: {
      admin_id: {
        type: mongoose.Schema.Types.ObjectId,
        default: null,
      },
      name: {
        type: String,
        default: "",
        trim: true,
      },
      email: {
        type: String,
        default: "",
        trim: true,
      },
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("EmailCampaign", emailCampaignSchema);