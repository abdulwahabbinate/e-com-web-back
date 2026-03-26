const mongoose = require("mongoose");

const imageCardSchema = new mongoose.Schema(
  {
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
    button_text: {
      type: String,
      default: "",
      trim: true,
    },
    button_link: {
      type: String,
      default: "",
      trim: true,
    },
    image: {
      type: String,
      default: "",
    },
  },
  { _id: false }
);

const heroSlideSchema = new mongoose.Schema(
  {
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
    button_text: {
      type: String,
      default: "",
      trim: true,
    },
    button_link: {
      type: String,
      default: "",
      trim: true,
    },
    image: {
      type: String,
      default: "",
    },
  },
  { _id: false }
);

const featureSchema = new mongoose.Schema(
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

const testimonialSchema = new mongoose.Schema(
  {
    rating: {
      type: Number,
      default: 5,
    },
    review: {
      type: String,
      default: "",
      trim: true,
    },
    name: {
      type: String,
      default: "",
      trim: true,
    },
    designation: {
      type: String,
      default: "",
      trim: true,
    },
  },
  { _id: false }
);

const homePageSchema = new mongoose.Schema(
  {
    slug: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      default: "home",
    },

    hero_section: {
      badge: {
        type: String,
        default: "",
        trim: true,
      },
      slides: {
        type: [heroSlideSchema],
        default: [],
      },
    },

    promo_section: {
      left_card: {
        type: imageCardSchema,
        default: () => ({}),
      },
      right_card: {
        type: imageCardSchema,
        default: () => ({}),
      },
    },

    lookbook_section: {
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
        type: [imageCardSchema],
        default: [],
      },
    },

    limited_offer_section: {
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
      button_text: {
        type: String,
        default: "",
        trim: true,
      },
      button_link: {
        type: String,
        default: "",
        trim: true,
      },
      offer_end_date: {
        type: Date,
        default: null,
      },
      image: {
        type: String,
        default: "",
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
        type: [featureSchema],
        default: [],
      },
    },

    testimonial_section: {
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
        type: [testimonialSchema],
        default: [],
      },
    },

    newsletter_section: {
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
      placeholder: {
        type: String,
        default: "",
        trim: true,
      },
      button_text: {
        type: String,
        default: "",
        trim: true,
      },
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("HomePage", homePageSchema);