const escapeHtml = (value = "") =>
  String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");

const nl2br = (value = "") => escapeHtml(value).replace(/\n/g, "<br />");

const formatCurrency = (value = 0) => `$${Number(value || 0).toFixed(2)}`;

const formatDate = (value) => {
  const date = value ? new Date(value) : new Date();

  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
};

const getPaymentMethodLabel = (value = "") => {
  if (value === "card") return "Card Payment";
  if (value === "cod") return "Cash on Delivery";
  return value || "N/A";
};

const getPaymentStatusLabel = (value = "") => {
  if (value === "paid") return "Paid";
  if (value === "pending") return "Pending";
  if (value === "failed") return "Failed";
  return value || "N/A";
};

const getOrderStatusLabel = (value = "") => {
  if (value === "placed") return "Placed";
  if (value === "processing") return "Processing";
  if (value === "shipped") return "Shipped";
  if (value === "delivered") return "Delivered";
  if (value === "cancelled") return "Cancelled";
  return value || "N/A";
};

const buildItemsRows = (items = []) => {
  return items
    .map(
      (item) => `
        <tr>
          <td class="stack-cell" style="padding:14px 12px;border-bottom:1px solid #e2e8f0;color:#0f172a;font-weight:700;">
            ${escapeHtml(item.title)}
          </td>
          <td class="stack-cell center-sm" style="padding:14px 12px;border-bottom:1px solid #e2e8f0;color:#475569;text-align:center;">
            ${Number(item.qty || 0)}
          </td>
          <td class="stack-cell right-sm" style="padding:14px 12px;border-bottom:1px solid #e2e8f0;color:#475569;text-align:right;">
            ${formatCurrency(item.price)}
          </td>
          <td class="stack-cell right-sm" style="padding:14px 12px;border-bottom:1px solid #e2e8f0;color:#0f172a;font-weight:800;text-align:right;">
            ${formatCurrency(item.line_total)}
          </td>
        </tr>
      `
    )
    .join("");
};

const buildSummaryRows = (order) => {
  return `
    <tr>
      <td style="padding:10px 0;color:#64748b;">Subtotal</td>
      <td style="padding:10px 0;color:#0f172a;font-weight:700;text-align:right;">${formatCurrency(order.subtotal)}</td>
    </tr>
    <tr>
      <td style="padding:10px 0;color:#64748b;">Shipping</td>
      <td style="padding:10px 0;color:#0f172a;font-weight:700;text-align:right;">${formatCurrency(order.shipping)}</td>
    </tr>
    <tr>
      <td style="padding:10px 0;color:#64748b;">Total Items</td>
      <td style="padding:10px 0;color:#0f172a;font-weight:700;text-align:right;">${Number(order.total_items || 0)}</td>
    </tr>
    <tr>
      <td style="padding:14px 0 0;color:#0f172a;font-size:16px;font-weight:800;border-top:1px solid #e2e8f0;">Grand Total</td>
      <td style="padding:14px 0 0;color:#0f172a;font-size:18px;font-weight:900;text-align:right;border-top:1px solid #e2e8f0;">
        ${formatCurrency(order.total)}
      </td>
    </tr>
  `;
};

const buildShell = ({ eyebrow, title, subtitle, body }) => {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>${escapeHtml(title)}</title>
        <style>
          body {
            margin: 0;
            padding: 0;
            background: #f8fafc;
            font-family: Arial, Helvetica, sans-serif;
            color: #0f172a;
          }

          table {
            border-collapse: collapse;
          }

          .email-wrapper {
            width: 100%;
            background: #f8fafc;
            padding: 28px 0;
          }

          .email-card {
            width: 100%;
            max-width: 720px;
            margin: 0 auto;
            background: linear-gradient(135deg, #0f172a 0%, #1e293b 45%, #312e81 100%);
            border-radius: 30px;
            overflow: hidden;
            box-shadow: 0 24px 50px rgba(15, 23, 42, 0.16);
          }

          .email-card-inner {
            padding: 30px;
          }

          .eyebrow {
            display: inline-block;
            padding: 10px 18px;
            border-radius: 999px;
            background: rgba(255, 255, 255, 0.12);
            color: #ffffff;
            font-size: 12px;
            font-weight: 800;
            letter-spacing: 0.06em;
            text-transform: uppercase;
          }

          .title {
            margin: 20px 0 10px;
            font-size: 34px;
            line-height: 1.15;
            font-weight: 900;
            color: #ffffff;
          }

          .subtitle {
            margin: 0 0 24px;
            font-size: 16px;
            line-height: 1.8;
            color: rgba(255, 255, 255, 0.82);
          }

          .white-panel {
            background: #ffffff;
            border-radius: 24px;
            padding: 24px;
            box-shadow: 0 16px 34px rgba(15, 23, 42, 0.18);
          }

          .overview-grid {
            width: 100%;
            margin-bottom: 22px;
          }

          .overview-grid td {
            width: 50%;
            vertical-align: top;
            padding: 7px;
          }

          .info-card {
            padding: 16px;
            border-radius: 18px;
            background: #f8fafc;
            border: 1px solid #e2e8f0;
            height: 100%;
          }

          .info-label {
            font-size: 12px;
            font-weight: 800;
            color: #6366f1;
            letter-spacing: 0.06em;
            text-transform: uppercase;
          }

          .info-value {
            margin-top: 6px;
            font-size: 18px;
            font-weight: 900;
            color: #0f172a;
            line-height: 1.4;
          }

          .info-subvalue {
            margin-top: 4px;
            color: #475569;
            font-size: 13px;
            line-height: 1.6;
          }

          .section-title {
            margin: 0 0 14px;
            font-size: 18px;
            font-weight: 900;
            color: #0f172a;
          }

          .table-wrap {
            overflow: hidden;
            border-radius: 18px;
            border: 1px solid #e2e8f0;
          }

          .items-table {
            width: 100%;
            background: #ffffff;
          }

          .items-table th {
            padding: 14px 12px;
            text-align: left;
            font-size: 12px;
            font-weight: 800;
            color: #475569;
            text-transform: uppercase;
            letter-spacing: 0.06em;
            background: #f8fafc;
          }

          .two-col-layout {
            width: 100%;
            margin-top: 20px;
          }

          .two-col-layout td {
            width: 50%;
            vertical-align: top;
            padding: 10px;
          }

          .box {
            padding: 18px;
            border-radius: 18px;
            background: #f8fafc;
            border: 1px solid #e2e8f0;
          }

          .note-box {
            margin-top: 24px;
            padding: 18px;
            border-radius: 18px;
            background: rgba(99, 102, 241, 0.06);
            border: 1px solid rgba(99, 102, 241, 0.14);
            font-size: 14px;
            line-height: 1.85;
            color: #334155;
          }

          .warning-box {
            margin-top: 20px;
            padding: 18px;
            border-radius: 18px;
            background: #fff7ed;
            border: 1px solid #fed7aa;
            font-size: 14px;
            line-height: 1.85;
            color: #7c2d12;
          }

          @media only screen and (max-width: 640px) {
            .email-wrapper {
              padding: 14px 8px;
            }

            .email-card {
              border-radius: 22px;
            }

            .email-card-inner {
              padding: 18px;
            }

            .title {
              font-size: 26px;
            }

            .subtitle {
              font-size: 14px;
            }

            .white-panel {
              padding: 16px;
              border-radius: 18px;
            }

            .overview-grid,
            .overview-grid tbody,
            .overview-grid tr,
            .overview-grid td,
            .two-col-layout,
            .two-col-layout tbody,
            .two-col-layout tr,
            .two-col-layout td {
              display: block !important;
              width: 100% !important;
            }

            .overview-grid td,
            .two-col-layout td {
              padding: 0 0 12px !important;
            }

            .items-table,
            .items-table tbody,
            .items-table tr,
            .items-table td,
            .items-table th {
              display: block !important;
              width: 100% !important;
            }

            .items-table thead {
              display: none !important;
            }

            .stack-cell {
              text-align: left !important;
              padding: 10px 12px !important;
            }

            .center-sm,
            .right-sm {
              text-align: left !important;
            }
          }
        </style>
      </head>
      <body>
        <div class="email-wrapper">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
            <tr>
              <td align="center">
                <table role="presentation" class="email-card" width="100%" cellpadding="0" cellspacing="0">
                  <tr>
                    <td class="email-card-inner">
                      <div class="eyebrow">${escapeHtml(eyebrow)}</div>
                      <h1 class="title">${escapeHtml(title)}</h1>
                      <p class="subtitle">${escapeHtml(subtitle)}</p>

                      <div class="white-panel">
                        ${body}
                      </div>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </div>
      </body>
    </html>
  `;
};

const buildOrderOverview = (order) => {
  return `
    <table role="presentation" class="overview-grid" cellpadding="0" cellspacing="0">
      <tr>
        <td>
          <div class="info-card">
            <div class="info-label">Order Number</div>
            <div class="info-value">${escapeHtml(order.order_number)}</div>
          </div>
        </td>
        <td>
          <div class="info-card">
            <div class="info-label">Order Date</div>
            <div class="info-value">${escapeHtml(formatDate(order.createdAt || new Date()))}</div>
          </div>
        </td>
      </tr>
      <tr>
        <td>
          <div class="info-card">
            <div class="info-label">Payment Method</div>
            <div class="info-value" style="font-size:16px;">${escapeHtml(getPaymentMethodLabel(order.payment_method))}</div>
            <div class="info-subvalue">${escapeHtml(getPaymentStatusLabel(order.payment_status))}</div>
          </div>
        </td>
        <td>
          <div class="info-card">
            <div class="info-label">Order Status</div>
            <div class="info-value" style="font-size:16px;">${escapeHtml(getOrderStatusLabel(order.order_status))}</div>
            <div class="info-subvalue">Invoice Total ${formatCurrency(order.total)}</div>
          </div>
        </td>
      </tr>
    </table>
  `;
};

const buildOrderItemsTable = (order) => {
  return `
    <div style="margin-bottom:24px;">
      <h3 class="section-title">Ordered Products</h3>
      <div class="table-wrap">
        <table role="presentation" class="items-table" width="100%" cellpadding="0" cellspacing="0">
          <thead>
            <tr>
              <th>Product</th>
              <th style="text-align:center;">Qty</th>
              <th style="text-align:right;">Price</th>
              <th style="text-align:right;">Line Total</th>
            </tr>
          </thead>
          <tbody>
            ${buildItemsRows(order.items)}
          </tbody>
        </table>
      </div>
    </div>
  `;
};

const buildInvoiceSummary = (order) => {
  return `
    <table role="presentation" class="two-col-layout" cellpadding="0" cellspacing="0">
      <tr>
        <td>
          <div class="box">
            <h3 class="section-title">Shipping Details</h3>
            <div style="font-size:14px;line-height:1.85;color:#334155;">
              <strong>${escapeHtml(order.customer.first_name)} ${escapeHtml(order.customer.last_name)}</strong><br />
              ${escapeHtml(order.customer.email)}<br />
              ${escapeHtml(order.customer.phone)}<br />
              ${escapeHtml(order.customer.address)}, ${escapeHtml(order.customer.city)}<br />
              ${escapeHtml(order.customer.country)} - ${escapeHtml(order.customer.postal_code)}
            </div>
            ${
              order.customer.notes
                ? `<div style="margin-top:14px;padding-top:14px;border-top:1px solid #e2e8f0;font-size:14px;line-height:1.8;color:#475569;">
                    <strong style="color:#0f172a;">Notes:</strong><br />
                    ${nl2br(order.customer.notes)}
                  </div>`
                : ""
            }
          </div>
        </td>
        <td>
          <div class="box">
            <h3 class="section-title">Invoice Summary</h3>
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
              ${buildSummaryRows(order)}
            </table>
          </div>
        </td>
      </tr>
    </table>
  `;
};

const buildCustomerOrderEmailTemplate = ({ order }) => {
  const body = `
    <p style="margin:0 0 18px;font-size:15px;line-height:1.9;color:#334155;">
      Dear <strong>${escapeHtml(order.customer.first_name)} ${escapeHtml(order.customer.last_name)}</strong>,<br />
      Thank you for your order. Your payment and order details have been confirmed successfully.
    </p>

    ${buildOrderOverview(order)}
    ${buildOrderItemsTable(order)}
    ${buildInvoiceSummary(order)}

    <div class="note-box">
      We have recorded your payment status as <strong>${escapeHtml(getPaymentStatusLabel(order.payment_status))}</strong>.
      Our team will update your order as it moves through processing, shipping, and delivery.
    </div>
  `;

  return buildShell({
    eyebrow: "Order Confirmation",
    title: "Your Order Has Been Placed",
    subtitle:
      "We’ve received your order and prepared your invoice details below.",
    body,
  });
};

const buildAdminOrderEmailTemplate = ({ order }) => {
  const body = `
    <p style="margin:0 0 18px;font-size:15px;line-height:1.9;color:#334155;">
      A new customer order has been placed. Full invoice and delivery details are listed below for admin review.
    </p>

    ${buildOrderOverview(order)}
    ${buildOrderItemsTable(order)}

    <table role="presentation" class="two-col-layout" cellpadding="0" cellspacing="0">
      <tr>
        <td>
          <div class="box">
            <h3 class="section-title">Customer Details</h3>
            <div style="font-size:14px;line-height:1.85;color:#334155;">
              <strong>${escapeHtml(order.customer.first_name)} ${escapeHtml(order.customer.last_name)}</strong><br />
              ${escapeHtml(order.customer.email)}<br />
              ${escapeHtml(order.customer.phone)}<br />
              ${escapeHtml(order.customer.address)}, ${escapeHtml(order.customer.city)}<br />
              ${escapeHtml(order.customer.country)} - ${escapeHtml(order.customer.postal_code)}
            </div>
          </div>
        </td>
        <td>
          <div class="box">
            <h3 class="section-title">Invoice Summary</h3>
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
              ${buildSummaryRows(order)}
            </table>
          </div>
        </td>
      </tr>
    </table>

    ${
      order.customer.notes
        ? `
          <div class="warning-box">
            <strong style="color:#9a3412;">Customer Notes:</strong><br />
            ${nl2br(order.customer.notes)}
          </div>
        `
        : ""
    }
  `;

  return buildShell({
    eyebrow: "New Order Alert",
    title: "A New Order Has Arrived",
    subtitle:
      "Admin notification with complete order, payment, and customer invoice details.",
    body,
  });
};

module.exports = {
  buildCustomerOrderEmailTemplate,
  buildAdminOrderEmailTemplate,
};