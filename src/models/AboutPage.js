const mongoose = require("mongoose");

const statItemSchema = new mongoose.Schema(
  {
    number: {
      type: String,
      default: "",
      trim: true,
    },
    label: {
      type: String,
      default: "",
      trim: true,
    },
  },
  { _id: false }
);

const featureItemSchema = new mongoose.Schema(
  {
    icon: {
      type: String,
      default: "",
      trim: true,
    },
    title: {
      type: String,
      default: "",
      trim: true,
    },
    description: {
      type: String,
      default: "",
      trim: true,
    },
  },
  { _id: false }
);

const aboutPageSchema = new mongoose.Schema(
  {
    slug: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      default: "about",
    },

    hero_section: {
      badge: {
        type: String,
        default: "",
        trim: true,
      },
      title: {
        type: String,
        default: "",
        trim: true,
      },
      description: {
        type: String,
        default: "",
        trim: true,
      },
      primary_button_text: {
        type: String,
        default: "",
        trim: true,
      },
      primary_button_link: {
        type: String,
        default: "",
        trim: true,
      },
      secondary_button_text: {
        type: String,
        default: "",
        trim: true,
      },
      secondary_button_link: {
        type: String,
        default: "",
        trim: true,
      },
      vision_badge: {
        type: String,
        default: "",
        trim: true,
      },
      vision_title: {
        type: String,
        default: "",
        trim: true,
      },
      vision_description: {
        type: String,
        default: "",
        trim: true,
      },
      vision_stats: {
        type: [statItemSchema],
        default: [],
      },
    },

    story_section: {
      badge: {
        type: String,
        default: "",
        trim: true,
      },
      title: {
        type: String,
        default: "",
        trim: true,
      },
      paragraph_one: {
        type: String,
        default: "",
        trim: true,
      },
      paragraph_two: {
        type: String,
        default: "",
        trim: true,
      },
      image: {
        type: String,
        default: "",
      },
    },

    stats_section: {
      items: {
        type: [statItemSchema],
        default: [],
      },
    },

    features_section: {
      badge: {
        type: String,
        default: "",
        trim: true,
      },
      title: {
        type: String,
        default: "",
        trim: true,
      },
      description: {
        type: String,
        default: "",
        trim: true,
      },
      items: {
        type: [featureItemSchema],
        default: [],
      },
    },

    cta_section: {
      badge: {
        type: String,
        default: "",
        trim: true,
      },
      title: {
        type: String,
        default: "",
        trim: true,
      },
      description: {
        type: String,
        default: "",
        trim: true,
      },
      primary_button_text: {
        type: String,
        default: "",
        trim: true,
      },
      primary_button_link: {
        type: String,
        default: "",
        trim: true,
      },
      secondary_button_text: {
        type: String,
        default: "",
        trim: true,
      },
      secondary_button_link: {
        type: String,
        default: "",
        trim: true,
      },
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("AboutPage", aboutPageSchema);