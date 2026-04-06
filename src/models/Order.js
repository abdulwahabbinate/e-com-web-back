const mongoose = require("mongoose");

const orderItemSchema = new mongoose.Schema(
  {
    product_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    image: {
      type: String,
      default: "",
    },
    price: {
      type: Number,
      required: true,
    },
    qty: {
      type: Number,
      required: true,
      min: 1,
    },
    line_total: {
      type: Number,
      required: true,
    },
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    order_number: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    stripe_payment_intent_id: {
      type: String,
      default: "",
      trim: true,
      index: true,
    },
    customer: {
      first_name: {
        type: String,
        required: true,
        trim: true,
      },
      last_name: {
        type: String,
        required: true,
        trim: true,
      },
      email: {
        type: String,
        required: true,
        trim: true,
        lowercase: true,
      },
      phone: {
        type: String,
        required: true,
        trim: true,
      },
      country: {
        type: String,
        required: true,
        trim: true,
      },
      city: {
        type: String,
        required: true,
        trim: true,
      },
      address: {
        type: String,
        required: true,
        trim: true,
      },
      postal_code: {
        type: String,
        required: true,
        trim: true,
      },
      notes: {
        type: String,
        default: "",
        trim: true,
      },
    },
    items: {
      type: [orderItemSchema],
      default: [],
    },
    subtotal: {
      type: Number,
      required: true,
    },
    shipping: {
      type: Number,
      required: true,
      default: 0,
    },
    total_items: {
      type: Number,
      required: true,
    },
    total: {
      type: Number,
      required: true,
    },
    payment_method: {
      type: String,
      enum: ["card", "cod"],
      required: true,
    },
    payment_status: {
      type: String,
      enum: ["pending", "paid", "failed"],
      default: "pending",
    },
    order_status: {
      type: String,
      enum: ["placed", "processing", "shipped", "delivered", "cancelled"],
      default: "placed",
    },
    email_notifications: {
      customer_email_sent: {
        type: Boolean,
        default: false,
      },
      admin_email_sent: {
        type: Boolean,
        default: false,
      },
      email_sent_at: {
        type: Date,
        default: null,
      },
      last_error_message: {
        type: String,
        default: "",
        trim: true,
      },
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Order", orderSchema);