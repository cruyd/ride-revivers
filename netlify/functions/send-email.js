// netlify/functions/send-email.js
// Handles all 4 Ride Revivers forms via Resend API
// API key read from: process.env.RESEND_API_KEY_RIDEREVIVERS (set in Netlify dashboard)

const BUSINESS_EMAIL  = "riderevivers780@gmail.com";
const SENDER_FROM     = "Ride Revivers <bookings@riderevivers.ca>";
const RESEND_ENDPOINT = "https://api.resend.com/emails";

// ── Email template builders ──────────────────────────────────

function buildBookingEmails(data) {
  const { name, phone, email, vehicle, service, notes } = data;

  const toBusinessHtml = `
<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;color:#222;">
  <div style="background:#0a0a0a;padding:24px 32px;border-radius:8px 8px 0 0;">
    <h2 style="color:#0A84FF;margin:0;font-size:20px;letter-spacing:0.05em;">NEW BOOKING REQUEST</h2>
    <p style="color:#888;margin:4px 0 0;font-size:13px;">Ride Revivers — Edmonton Auto Detailing</p>
  </div>
  <div style="background:#f9f9f9;padding:32px;border-radius:0 0 8px 8px;border:1px solid #e0e0e0;">
    <table style="width:100%;border-collapse:collapse;">
      <tr><td style="padding:8px 0;font-weight:bold;color:#555;width:160px;">Name</td><td style="padding:8px 0;color:#222;">${esc(name)}</td></tr>
      <tr style="border-top:1px solid #eee;"><td style="padding:8px 0;font-weight:bold;color:#555;">Phone</td><td style="padding:8px 0;color:#222;">${esc(phone)}</td></tr>
      <tr style="border-top:1px solid #eee;"><td style="padding:8px 0;font-weight:bold;color:#555;">Email</td><td style="padding:8px 0;color:#222;">${esc(email)}</td></tr>
      <tr style="border-top:1px solid #eee;"><td style="padding:8px 0;font-weight:bold;color:#555;">Vehicle</td><td style="padding:8px 0;color:#222;">${esc(vehicle)}</td></tr>
      <tr style="border-top:1px solid #eee;"><td style="padding:8px 0;font-weight:bold;color:#555;">Service</td><td style="padding:8px 0;color:#222;">${esc(service)}</td></tr>
      ${notes ? `<tr style="border-top:1px solid #eee;"><td style="padding:8px 0;font-weight:bold;color:#555;vertical-align:top;">Message</td><td style="padding:8px 0;color:#222;">${esc(notes)}</td></tr>` : ''}
    </table>
    <p style="margin:24px 0 0;color:#555;font-size:13px;">Please contact the customer to confirm appointment date and time.</p>
  </div>
</div>`;

  const toCustomerHtml = `
<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;color:#222;">
  <div style="background:#0a0a0a;padding:24px 32px;border-radius:8px 8px 0 0;">
    <h2 style="color:#0A84FF;margin:0;font-size:20px;letter-spacing:0.05em;">BOOKING REQUEST RECEIVED</h2>
    <p style="color:#888;margin:4px 0 0;font-size:13px;">Ride Revivers — Edmonton Auto Detailing</p>
  </div>
  <div style="background:#f9f9f9;padding:32px;border-radius:0 0 8px 8px;border:1px solid #e0e0e0;">
    <p style="color:#222;font-size:15px;">Hi ${esc(name)},</p>
    <p style="color:#444;line-height:1.7;">Thank you for submitting a booking request with Ride Revivers.</p>
    <p style="color:#444;line-height:1.7;">We have successfully received your information. Our team will review your request and contact you shortly to confirm your appointment date, time, and service details.</p>
    <p style="color:#444;line-height:1.7;">If you need immediate assistance, you can call us at <strong>587-938-7654</strong>.</p>
    <p style="color:#444;line-height:1.7;margin-top:24px;">Thank you for choosing Ride Revivers.</p>
    <p style="color:#222;font-weight:bold;">Ride Revivers Team</p>
  </div>
</div>`;

  return {
    toBusiness: {
      subject: "New Booking Request - Ride Revivers",
      html: toBusinessHtml,
    },
    toCustomer: {
      to: email,
      subject: "Booking Request Received - Ride Revivers",
      html: toCustomerHtml,
    },
  };
}

function buildQuoteEmails(data) {
  const { name, phone, email, vehicle, service, condition } = data;

  const toBusinessHtml = `
<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;color:#222;">
  <div style="background:#0a0a0a;padding:24px 32px;border-radius:8px 8px 0 0;">
    <h2 style="color:#0A84FF;margin:0;font-size:20px;letter-spacing:0.05em;">NEW QUOTE REQUEST</h2>
    <p style="color:#888;margin:4px 0 0;font-size:13px;">Ride Revivers — Edmonton Auto Detailing</p>
  </div>
  <div style="background:#f9f9f9;padding:32px;border-radius:0 0 8px 8px;border:1px solid #e0e0e0;">
    <table style="width:100%;border-collapse:collapse;">
      <tr><td style="padding:8px 0;font-weight:bold;color:#555;width:160px;">Name</td><td style="padding:8px 0;color:#222;">${esc(name)}</td></tr>
      <tr style="border-top:1px solid #eee;"><td style="padding:8px 0;font-weight:bold;color:#555;">Phone</td><td style="padding:8px 0;color:#222;">${esc(phone)}</td></tr>
      <tr style="border-top:1px solid #eee;"><td style="padding:8px 0;font-weight:bold;color:#555;">Email</td><td style="padding:8px 0;color:#222;">${esc(email)}</td></tr>
      <tr style="border-top:1px solid #eee;"><td style="padding:8px 0;font-weight:bold;color:#555;">Vehicle</td><td style="padding:8px 0;color:#222;">${esc(vehicle)}</td></tr>
      <tr style="border-top:1px solid #eee;"><td style="padding:8px 0;font-weight:bold;color:#555;">Service Interested In</td><td style="padding:8px 0;color:#222;">${esc(service)}</td></tr>
      ${condition ? `<tr style="border-top:1px solid #eee;"><td style="padding:8px 0;font-weight:bold;color:#555;vertical-align:top;">Vehicle Condition</td><td style="padding:8px 0;color:#222;">${esc(condition)}</td></tr>` : ''}
    </table>
    <p style="margin:24px 0 0;color:#555;font-size:13px;">Please contact the customer with pricing and availability.</p>
  </div>
</div>`;

  const toCustomerHtml = `
<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;color:#222;">
  <div style="background:#0a0a0a;padding:24px 32px;border-radius:8px 8px 0 0;">
    <h2 style="color:#0A84FF;margin:0;font-size:20px;letter-spacing:0.05em;">QUOTE REQUEST RECEIVED</h2>
    <p style="color:#888;margin:4px 0 0;font-size:13px;">Ride Revivers — Edmonton Auto Detailing</p>
  </div>
  <div style="background:#f9f9f9;padding:32px;border-radius:0 0 8px 8px;border:1px solid #e0e0e0;">
    <p style="color:#222;font-size:15px;">Hi ${esc(name)},</p>
    <p style="color:#444;line-height:1.7;">Thank you for requesting a quote from Ride Revivers.</p>
    <p style="color:#444;line-height:1.7;">We have successfully received your request. Our team will review your vehicle information and contact you shortly with pricing, availability, and next steps.</p>
    <p style="color:#444;line-height:1.7;">If you need immediate assistance, you can call us at <strong>587-938-7654</strong>.</p>
    <p style="color:#444;line-height:1.7;margin-top:24px;">Thank you for choosing Ride Revivers.</p>
    <p style="color:#222;font-weight:bold;">Ride Revivers Team</p>
  </div>
</div>`;

  return {
    toBusiness: {
      subject: "New Quote Request - Ride Revivers",
      html: toBusinessHtml,
    },
    toCustomer: {
      to: email,
      subject: "Quote Request Received - Ride Revivers",
      html: toCustomerHtml,
    },
  };
}

function buildCeramicEmails(data) {
  const { name, phone, email, vehicle, package: pkg, condition, notes } = data;

  const toBusinessHtml = `
<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;color:#222;">
  <div style="background:#0a0a0a;padding:24px 32px;border-radius:8px 8px 0 0;">
    <h2 style="color:#0A84FF;margin:0;font-size:20px;letter-spacing:0.05em;">NEW CERAMIC COATING QUOTE</h2>
    <p style="color:#888;margin:4px 0 0;font-size:13px;">Ride Revivers — Edmonton Auto Detailing</p>
  </div>
  <div style="background:#f9f9f9;padding:32px;border-radius:0 0 8px 8px;border:1px solid #e0e0e0;">
    <table style="width:100%;border-collapse:collapse;">
      <tr><td style="padding:8px 0;font-weight:bold;color:#555;width:180px;">Name</td><td style="padding:8px 0;color:#222;">${esc(name)}</td></tr>
      <tr style="border-top:1px solid #eee;"><td style="padding:8px 0;font-weight:bold;color:#555;">Phone</td><td style="padding:8px 0;color:#222;">${esc(phone)}</td></tr>
      <tr style="border-top:1px solid #eee;"><td style="padding:8px 0;font-weight:bold;color:#555;">Email</td><td style="padding:8px 0;color:#222;">${esc(email)}</td></tr>
      <tr style="border-top:1px solid #eee;"><td style="padding:8px 0;font-weight:bold;color:#555;">Vehicle</td><td style="padding:8px 0;color:#222;">${esc(vehicle)}</td></tr>
      <tr style="border-top:1px solid #eee;"><td style="padding:8px 0;font-weight:bold;color:#555;">Ceramic Package</td><td style="padding:8px 0;color:#222;">${esc(pkg || '')}</td></tr>
      ${condition ? `<tr style="border-top:1px solid #eee;"><td style="padding:8px 0;font-weight:bold;color:#555;vertical-align:top;">Vehicle Condition</td><td style="padding:8px 0;color:#222;">${esc(condition)}</td></tr>` : ''}
      ${notes ? `<tr style="border-top:1px solid #eee;"><td style="padding:8px 0;font-weight:bold;color:#555;vertical-align:top;">Additional Details</td><td style="padding:8px 0;color:#222;">${esc(notes)}</td></tr>` : ''}
    </table>
    <p style="margin:24px 0 0;color:#555;font-size:13px;">Please contact the customer with ceramic coating pricing and package information.</p>
  </div>
</div>`;

  const toCustomerHtml = `
<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;color:#222;">
  <div style="background:#0a0a0a;padding:24px 32px;border-radius:8px 8px 0 0;">
    <h2 style="color:#0A84FF;margin:0;font-size:20px;letter-spacing:0.05em;">CERAMIC COATING QUOTE RECEIVED</h2>
    <p style="color:#888;margin:4px 0 0;font-size:13px;">Ride Revivers — Edmonton Auto Detailing</p>
  </div>
  <div style="background:#f9f9f9;padding:32px;border-radius:0 0 8px 8px;border:1px solid #e0e0e0;">
    <p style="color:#222;font-size:15px;">Hi ${esc(name)},</p>
    <p style="color:#444;line-height:1.7;">Thank you for requesting a ceramic coating quote from Ride Revivers.</p>
    <p style="color:#444;line-height:1.7;">We have successfully received your inquiry. Our team will review your vehicle details and selected ceramic coating package, then contact you shortly with pricing, recommendations, and availability.</p>
    <p style="color:#444;line-height:1.7;">If you need immediate assistance, you can call us at <strong>587-938-7654</strong>.</p>
    <p style="color:#444;line-height:1.7;margin-top:24px;">Thank you for choosing Ride Revivers.</p>
    <p style="color:#222;font-weight:bold;">Ride Revivers Team</p>
  </div>
</div>`;

  return {
    toBusiness: {
      subject: "New Ceramic Coating Quote Request - Ride Revivers",
      html: toBusinessHtml,
    },
    toCustomer: {
      to: email,
      subject: "Ceramic Coating Quote Received - Ride Revivers",
      html: toCustomerHtml,
    },
  };
}

function buildPaintEmails(data) {
  const { name, phone, email, vehicle, package: pkg, condition, notes } = data;

  const toBusinessHtml = `
<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;color:#222;">
  <div style="background:#0a0a0a;padding:24px 32px;border-radius:8px 8px 0 0;">
    <h2 style="color:#0A84FF;margin:0;font-size:20px;letter-spacing:0.05em;">NEW PAINT CORRECTION QUOTE</h2>
    <p style="color:#888;margin:4px 0 0;font-size:13px;">Ride Revivers — Edmonton Auto Detailing</p>
  </div>
  <div style="background:#f9f9f9;padding:32px;border-radius:0 0 8px 8px;border:1px solid #e0e0e0;">
    <table style="width:100%;border-collapse:collapse;">
      <tr><td style="padding:8px 0;font-weight:bold;color:#555;width:200px;">Name</td><td style="padding:8px 0;color:#222;">${esc(name)}</td></tr>
      <tr style="border-top:1px solid #eee;"><td style="padding:8px 0;font-weight:bold;color:#555;">Phone</td><td style="padding:8px 0;color:#222;">${esc(phone)}</td></tr>
      <tr style="border-top:1px solid #eee;"><td style="padding:8px 0;font-weight:bold;color:#555;">Email</td><td style="padding:8px 0;color:#222;">${esc(email)}</td></tr>
      <tr style="border-top:1px solid #eee;"><td style="padding:8px 0;font-weight:bold;color:#555;">Vehicle</td><td style="padding:8px 0;color:#222;">${esc(vehicle)}</td></tr>
      <tr style="border-top:1px solid #eee;"><td style="padding:8px 0;font-weight:bold;color:#555;">Paint Correction Package</td><td style="padding:8px 0;color:#222;">${esc(pkg || '')}</td></tr>
      ${condition ? `<tr style="border-top:1px solid #eee;"><td style="padding:8px 0;font-weight:bold;color:#555;vertical-align:top;">Vehicle Condition</td><td style="padding:8px 0;color:#222;">${esc(condition)}</td></tr>` : ''}
      ${notes ? `<tr style="border-top:1px solid #eee;"><td style="padding:8px 0;font-weight:bold;color:#555;vertical-align:top;">Additional Details</td><td style="padding:8px 0;color:#222;">${esc(notes)}</td></tr>` : ''}
    </table>
    <p style="margin:24px 0 0;color:#555;font-size:13px;">Please contact the customer with paint correction recommendations and pricing.</p>
  </div>
</div>`;

  const toCustomerHtml = `
<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;color:#222;">
  <div style="background:#0a0a0a;padding:24px 32px;border-radius:8px 8px 0 0;">
    <h2 style="color:#0A84FF;margin:0;font-size:20px;letter-spacing:0.05em;">PAINT CORRECTION QUOTE RECEIVED</h2>
    <p style="color:#888;margin:4px 0 0;font-size:13px;">Ride Revivers — Edmonton Auto Detailing</p>
  </div>
  <div style="background:#f9f9f9;padding:32px;border-radius:0 0 8px 8px;border:1px solid #e0e0e0;">
    <p style="color:#222;font-size:15px;">Hi ${esc(name)},</p>
    <p style="color:#444;line-height:1.7;">Thank you for requesting a paint correction quote from Ride Revivers.</p>
    <p style="color:#444;line-height:1.7;">We have successfully received your inquiry. Our team will review your vehicle condition and selected paint correction package, then contact you shortly with recommendations, pricing, and availability.</p>
    <p style="color:#444;line-height:1.7;">If you need immediate assistance, you can call us at <strong>587-938-7654</strong>.</p>
    <p style="color:#444;line-height:1.7;margin-top:24px;">Thank you for choosing Ride Revivers.</p>
    <p style="color:#222;font-weight:bold;">Ride Revivers Team</p>
  </div>
</div>`;

  return {
    toBusiness: {
      subject: "New Paint Correction Quote Request - Ride Revivers",
      html: toBusinessHtml,
    },
    toCustomer: {
      to: email,
      subject: "Paint Correction Quote Received - Ride Revivers",
      html: toCustomerHtml,
    },
  };
}

// ── HTML escape helper ───────────────────────────────────────
function esc(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

// ── Resend API sender ────────────────────────────────────────
async function sendEmail({ to, subject, html, replyTo }) {
  const apiKey = process.env.RESEND_API_KEY_RIDEREVIVERS;
  if (!apiKey) throw new Error("RESEND_API_KEY_RIDEREVIVERS is not set");

  const payload = {
    from: SENDER_FROM,
    to: Array.isArray(to) ? to : [to],
    subject,
    html,
  };
  if (replyTo) payload.reply_to = replyTo;

  const res = await fetch(RESEND_ENDPOINT, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Resend API error ${res.status}: ${err}`);
  }
  return res.json();
}

// ── Netlify Function handler ─────────────────────────────────
exports.handler = async function (event) {
  // CORS headers
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
    "Content-Type": "application/json",
  };

  // Handle CORS preflight
  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 200, headers, body: "" };
  }

  if (event.httpMethod !== "POST") {
    return { statusCode: 405, headers, body: JSON.stringify({ error: "Method not allowed" }) };
  }

  let data;
  try {
    data = JSON.parse(event.body || "{}");
  } catch {
    return { statusCode: 400, headers, body: JSON.stringify({ error: "Invalid JSON" }) };
  }

  const formType = data.form_type || "";

  // Validate required fields present in all forms
  if (!data.name || !data.email || !data.phone || !data.vehicle) {
    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({ error: "Missing required fields: name, email, phone, vehicle" }),
    };
  }

  // Basic email format check
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
    return { statusCode: 400, headers, body: JSON.stringify({ error: "Invalid email address" }) };
  }

  // Build emails based on form type
  let emails;
  if (formType === "Booking Request") {
    emails = buildBookingEmails(data);
  } else if (formType === "Quote Request") {
    emails = buildQuoteEmails(data);
  } else if (formType === "Ceramic Coating Quote") {
    emails = buildCeramicEmails(data);
  } else if (formType === "Paint Correction Quote") {
    emails = buildPaintEmails(data);
  } else {
    // Fallback: treat unknown form types as general quote
    emails = buildQuoteEmails(data);
  }

  try {
    // Send business notification
    await sendEmail({
      to: BUSINESS_EMAIL,
      subject: emails.toBusiness.subject,
      html: emails.toBusiness.html,
      replyTo: data.email, // replies go to the customer
    });

    // Send customer confirmation
    await sendEmail({
      to: emails.toCustomer.to,
      subject: emails.toCustomer.subject,
      html: emails.toCustomer.html,
    });

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ success: true, message: "Emails sent successfully" }),
    };
  } catch (err) {
    console.error("Email send error:", err.message);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: "Failed to send email", detail: err.message }),
    };
  }
};
