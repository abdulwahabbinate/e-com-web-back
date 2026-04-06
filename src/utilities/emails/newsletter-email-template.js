const escapeHtml = (value = "") =>
  String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");

const nl2br = (value = "") => escapeHtml(value).replace(/\n/g, "<br />");

const buildNewsletterEmailTemplate = ({
  heading,
  message,
  preview_text,
  cta_text,
  cta_link,
}) => {
  const safeHeading = escapeHtml(heading || "Latest Updates From Our Store");
  const safePreview = escapeHtml(
    preview_text || "New arrivals, offers and curated updates from our store."
  );
  const safeMessage = nl2br(message || "");
  const safeCtaText = escapeHtml(cta_text || "Shop Now");
  const safeCtaLink =
    cta_link || process.env.STORE_FRONTEND_URL || "http://localhost:3000";

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>${safeHeading}</title>
      </head>
      <body style="margin:0;padding:0;background:#f8fafc;font-family:Arial,sans-serif;color:#0f172a;">
        <div style="max-width:640px;margin:0 auto;padding:32px 18px;">
          <div style="background:linear-gradient(135deg,#0f172a 0%,#1e293b 45%,#312e81 100%);padding:32px;border-radius:28px;overflow:hidden;">
            <div style="display:inline-block;padding:10px 18px;border-radius:999px;background:rgba(255,255,255,0.12);color:#fff;font-size:12px;font-weight:800;letter-spacing:.06em;text-transform:uppercase;">
              Newsletter
            </div>

            <h1 style="margin:22px 0 14px;font-size:36px;line-height:1.15;font-weight:800;color:#fff;">
              ${safeHeading}
            </h1>

            <p style="margin:0 0 24px;font-size:16px;line-height:1.8;color:rgba(255,255,255,0.82);">
              ${safePreview}
            </p>

            <div style="background:#ffffff;border-radius:22px;padding:24px;box-shadow:0 16px 34px rgba(15,23,42,0.18);">
              <div style="font-size:15px;line-height:1.9;color:#334155;">
                ${safeMessage}
              </div>

              <div style="margin-top:24px;">
                <a href="${safeCtaLink}" style="display:inline-block;padding:14px 24px;border-radius:14px;background:linear-gradient(135deg,#4f46e5 0%,#6366f1 100%);color:#fff;text-decoration:none;font-weight:700;font-size:15px;box-shadow:0 12px 24px rgba(79,70,229,0.24);">
                  ${safeCtaText}
                </a>
              </div>
            </div>

            <p style="margin:22px 0 0;font-size:13px;line-height:1.7;color:rgba(255,255,255,0.62);">
              You are receiving this email because you subscribed to updates from our store.
            </p>
          </div>
        </div>
      </body>
    </html>
  `;
};

module.exports = {
  buildNewsletterEmailTemplate,
};