const mongoose = require("mongoose");

const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    image: {
      type: String,
      default: "",
    },
    description: {
      type: String,
      default: "",
    },
    menu_section: {
      type: String,
      enum: ["retail", "wholesale"],
      required: true,
    },
    group_title: {
      type: String,
      required: true,
      trim: true,
    },
    sort_order: {
      type: Number,
      default: 0,
    },
    icon: {
      type: String,
      default: "",
    },
    is_active: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Category", categorySchema);