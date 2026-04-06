const NewsletterSubscriber = require("../../models/NewsletterSubscriber");
const EmailCampaign = require("../../models/EmailCampaign");
const Order = require("../../models/Order");
const { handlers } = require("../../utilities/handlers/handlers");
const {
  sendValidationError,
} = require("../../utilities/validations/common-validations");
const {
  getTransporter,
  isMailerConfigured,
} = require("../../utilities/emails/mail-transporter");
const {
  buildNewsletterEmailTemplate,
} = require("../../utilities/emails/newsletter-email-template");

class NewsletterService {
  async getStats(req, res) {
    try {
      const total_subscribers = await NewsletterSubscriber.countDocuments();
      const active_subscribers = await NewsletterSubscriber.countDocuments({
        status: "subscribed",
      });
      const unsubscribed_count = await NewsletterSubscriber.countDocuments({
        status: "unsubscribed",
      });
      const total_campaigns = await EmailCampaign.countDocuments();
      const order_customer_emails = await Order.distinct("customer.email", {
        "customer.email": { $exists: true, $nin: [null, ""] },
      });

      return handlers.response.success({
        res,
        message: "Newsletter stats retrieved successfully",
        data: {
          total_subscribers,
          active_subscribers,
          unsubscribed_count,
          total_campaigns,
          total_order_customers: order_customer_emails.length,
        },
      });
    } catch (error) {
      return handlers.response.error({
        res,
        message: error.message,
      });
    }
  }

  async getSubscribers(req, res) {
    try {
      const subscribers = await NewsletterSubscriber.find().sort({
        createdAt: -1,
      });

      return handlers.response.success({
        res,
        message: "Newsletter subscribers retrieved successfully",
        data: subscribers,
      });
    } catch (error) {
      return handlers.response.error({
        res,
        message: error.message,
      });
    }
  }

  async getCampaigns(req, res) {
    try {
      const campaigns = await EmailCampaign.find()
        .sort({ createdAt: -1 })
        .limit(30);

      return handlers.response.success({
        res,
        message: "Email campaigns retrieved successfully",
        data: campaigns,
      });
    } catch (error) {
      return handlers.response.error({
        res,
        message: error.message,
      });
    }
  }

  async updateSubscriberStatus(req, res) {
    try {
      const { id } = req.params;
      const { status } = req.body;
      const errors = [];

      if (!["subscribed", "unsubscribed"].includes(status)) {
        errors.push({
          field: "status",
          message: "Status must be either subscribed or unsubscribed",
        });
      }

      if (errors.length > 0) {
        return sendValidationError({ res, errors });
      }

      const subscriber = await NewsletterSubscriber.findById(id);

      if (!subscriber) {
        return handlers.response.unavailable({
          res,
          code: 404,
          message: "Subscriber not found",
        });
      }

      subscriber.status = status;
      await subscriber.save();

      return handlers.response.success({
        res,
        message: "Subscriber status updated successfully",
        data: subscriber,
      });
    } catch (error) {
      return handlers.response.error({
        res,
        message: error.message,
      });
    }
  }

  async removeSubscriber(req, res) {
    try {
      const { id } = req.params;

      const subscriber = await NewsletterSubscriber.findById(id);

      if (!subscriber) {
        return handlers.response.unavailable({
          res,
          code: 404,
          message: "Subscriber not found",
        });
      }

      await NewsletterSubscriber.findByIdAndDelete(id);

      return handlers.response.success({
        res,
        message: "Subscriber removed successfully",
        data: subscriber,
      });
    } catch (error) {
      return handlers.response.error({
        res,
        message: error.message,
      });
    }
  }

  normalizeEmail(email) {
    return String(email || "").trim().toLowerCase();
  }

  async getRecipientsByAudience(audienceType) {
    const subscribers = await NewsletterSubscriber.find({
      status: "subscribed",
    }).select("email");

    const subscriberEmails = subscribers
      .map((item) => this.normalizeEmail(item.email))
      .filter(Boolean);

    const orderCustomerEmails = await Order.distinct("customer.email", {
      "customer.email": { $exists: true, $nin: [null, ""] },
    });

    const normalizedOrderEmails = orderCustomerEmails
      .map((item) => this.normalizeEmail(item))
      .filter(Boolean);

    if (audienceType === "subscribers") {
      return [...new Set(subscriberEmails)];
    }

    if (audienceType === "order_customers") {
      return [...new Set(normalizedOrderEmails)];
    }

    return [...new Set([...subscriberEmails, ...normalizedOrderEmails])];
  }

  async sendCampaign(req, res) {
    try {
      const {
        subject,
        heading,
        message,
        preview_text,
        audience_type,
        cta_text,
        cta_link,
      } = req.body;

      const errors = [];

      if (!String(audience_type || "").trim()) {
        errors.push({
          field: "audience_type",
          message: "Audience is required",
        });
      } else if (
        !["subscribers", "order_customers", "all"].includes(audience_type)
      ) {
        errors.push({
          field: "audience_type",
          message:
            "Audience type must be subscribers, order_customers, or all",
        });
      }

      if (!String(subject || "").trim()) {
        errors.push({
          field: "subject",
          message: "Subject is required",
        });
      }

      if (!String(heading || "").trim()) {
        errors.push({
          field: "heading",
          message: "Heading is required",
        });
      }

      if (!String(preview_text || "").trim()) {
        errors.push({
          field: "preview_text",
          message: "Preview text is required",
        });
      }

      if (!String(message || "").trim()) {
        errors.push({
          field: "message",
          message: "Message is required",
        });
      }

      if (!String(cta_text || "").trim()) {
        errors.push({
          field: "cta_text",
          message: "CTA text is required",
        });
      }

      if (!String(cta_link || "").trim()) {
        errors.push({
          field: "cta_link",
          message: "CTA link is required",
        });
      } else if (!/^https?:\/\/.+/i.test(String(cta_link).trim())) {
        errors.push({
          field: "cta_link",
          message: "CTA link must start with http:// or https://",
        });
      }

      if (!isMailerConfigured()) {
        errors.push({
          field: "mailer",
          message:
            "Mail configuration is missing. Please configure SMTP in env first",
        });
      }

      if (errors.length > 0) {
        return sendValidationError({ res, errors });
      }

      const recipients = await this.getRecipientsByAudience(audience_type);

      if (!recipients.length) {
        return handlers.response.unavailable({
          res,
          code: 404,
          message: "No recipients found for selected audience",
        });
      }

      const transporter = getTransporter();

      const html = buildNewsletterEmailTemplate({
        heading,
        message,
        preview_text,
        cta_text,
        cta_link,
      });

      const mailFrom = process.env.MAIL_FROM || process.env.MAIL_USER;

      const sendResults = await Promise.allSettled(
        recipients.map((email) =>
          transporter.sendMail({
            from: mailFrom,
            to: email,
            subject: String(subject).trim(),
            html,
          })
        )
      );

      const success_count = sendResults.filter(
        (item) => item.status === "fulfilled"
      ).length;

      const failed_count = sendResults.filter(
        (item) => item.status === "rejected"
      ).length;

      const failed_recipients = sendResults
        .map((item, index) => {
          if (item.status === "rejected") {
            return {
              email: recipients[index],
              reason: item.reason?.message || "Failed to send",
            };
          }
          return null;
        })
        .filter(Boolean);

      const campaign = await EmailCampaign.create({
        subject: String(subject).trim(),
        heading: String(heading).trim(),
        message: String(message).trim(),
        preview_text: String(preview_text).trim(),
        audience_type,
        cta_text: String(cta_text).trim(),
        cta_link: String(cta_link).trim(),
        recipient_count: recipients.length,
        success_count,
        failed_count,
        status:
          success_count === recipients.length
            ? "sent"
            : success_count > 0
              ? "partial_failed"
              : "failed",
        sent_at: new Date(),
        created_by: {
          admin_id: req.admin?._id || null,
          name: req.admin?.name || req.admin?.full_name || "Admin",
          email: req.admin?.email || "",
        },
      });

      await NewsletterSubscriber.updateMany(
        { email: { $in: recipients } },
        { $set: { last_email_sent_at: new Date() } }
      );

      return handlers.response.success({
        res,
        message:
          success_count === recipients.length
            ? "Email campaign sent successfully"
            : success_count > 0
              ? "Email campaign sent with some failures"
              : "Email campaign failed",
        data: {
          ...campaign.toObject(),
          failed_recipients,
        },
      });
    } catch (error) {
      return handlers.response.error({
        res,
        message: error.message,
      });
    }
  }
}

module.exports = new NewsletterService();