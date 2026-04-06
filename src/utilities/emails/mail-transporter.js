const nodemailer = require("nodemailer");

let transporterInstance = null;

const isMailerConfigured = () => {
  return !!(
    process.env.MAIL_HOST &&
    process.env.MAIL_PORT &&
    process.env.MAIL_USER &&
    process.env.MAIL_PASS
  );
};

const getTransporter = () => {
  if (!isMailerConfigured()) {
    throw new Error("Mail configuration is missing");
  }

  if (transporterInstance) {
    return transporterInstance;
  }

  transporterInstance = nodemailer.createTransport({
    host: process.env.MAIL_HOST,
    port: Number(process.env.MAIL_PORT || 587),
    secure: String(process.env.MAIL_SECURE || "false") === "true",
    auth: {
      user: process.env.MAIL_USER,
      pass: process.env.MAIL_PASS,
    },
  });

  return transporterInstance;
};

module.exports = {
  getTransporter,
  isMailerConfigured,
};