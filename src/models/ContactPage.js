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

const infoCardSchema = new mongoose.Schema(
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
    value: {
      type: String,
      default: "",
      trim: true,
    },
  },
  { _id: false }
);

const faqItemSchema = new mongoose.Schema(
  {
    question: {
      type: String,
      default: "",
      trim: true,
    },
    answer: {
      type: String,
      default: "",
      trim: true,
    },
  },
  { _id: false }
);

const contactPageSchema = new mongoose.Schema(
  {
    slug: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      default: "contact",
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
      support_badge: {
        type: String,
        default: "",
        trim: true,
      },
      support_title: {
        type: String,
        default: "",
        trim: true,
      },
      support_description: {
        type: String,
        default: "",
        trim: true,
      },
      support_stats: {
        type: [statItemSchema],
        default: [],
      },
    },

    info_section: {
      items: {
        type: [infoCardSchema],
        default: [],
      },
    },

    form_section: {
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
      full_name_label: {
        type: String,
        default: "",
        trim: true,
      },
      full_name_placeholder: {
        type: String,
        default: "",
        trim: true,
      },
      email_label: {
        type: String,
        default: "",
        trim: true,
      },
      email_placeholder: {
        type: String,
        default: "",
        trim: true,
      },
      phone_label: {
        type: String,
        default: "",
        trim: true,
      },
      phone_placeholder: {
        type: String,
        default: "",
        trim: true,
      },
      subject_label: {
        type: String,
        default: "",
        trim: true,
      },
      subject_placeholder: {
        type: String,
        default: "",
        trim: true,
      },
      message_label: {
        type: String,
        default: "",
        trim: true,
      },
      message_placeholder: {
        type: String,
        default: "",
        trim: true,
      },
      submit_button_text: {
        type: String,
        default: "",
        trim: true,
      },
    },

    faq_section: {
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
        type: [faqItemSchema],
        default: [],
      },
    },

    support_cta_section: {
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
  },
  { timestamps: true }
);

module.exports = mongoose.model("ContactPage", contactPageSchema);7