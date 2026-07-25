/* ==========================================================================
   server.js — lightweight Node/Express/Nodemailer backend
   Alternative to EmailJS: use this if you'd rather send order emails from
   your own server instead of directly from the browser.
   ========================================================================== */

const express = require("express");
const cors = require("cors");
const nodemailer = require("nodemailer");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

/* ---------- Mail Transport ----------
   Configure these in a .env file (see .env.example):
     SMTP_HOST=smtp.gmail.com
     SMTP_PORT=465
     SMTP_USER=your-email@gmail.com
     SMTP_PASS=your-app-password
     STORE_INBOX=orders@aureumandoak.com
   For Gmail, use an "App Password", not your normal login password:
   https://myaccount.google.com/apppasswords
------------------------------------------------------------------------ */
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT) || 465,
  secure: true,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

/* ---------- Order Endpoint ---------- */
app.post("/api/order", async (req, res) => {
  const {
    customer_name,
    customer_email,
    shipping_address,
    order_notes,
    order_items,
    order_total,
    order_date,
  } = req.body;

  if (!customer_name || !customer_email || !shipping_address || !order_items) {
    return res.status(400).json({ error: "Missing required order fields." });
  }

  const htmlBody = `
    <div style="font-family: Georgia, serif; max-width: 560px; margin: auto;">
      <h2 style="color:#2b3520;">New Order — Aureum &amp; Oak</h2>
      <p><strong>Date:</strong> ${order_date}</p>
      <p><strong>Customer:</strong> ${customer_name} (${customer_email})</p>
      <p><strong>Shipping Address:</strong><br>${shipping_address.replace(/\n/g, "<br>")}</p>
      <p><strong>Notes:</strong> ${order_notes || "None"}</p>
      <hr>
      <h3>Items</h3>
      <pre style="white-space: pre-wrap; font-family: inherit;">${order_items}</pre>
      <hr>
      <p><strong>Total: ${order_total}</strong></p>
    </div>
  `;

  try {
    await transporter.sendMail({
      from: `"Aureum & Oak Orders" <${process.env.SMTP_USER}>`,
      to: process.env.STORE_INBOX,
      replyTo: customer_email,
      subject: `New Order from ${customer_name} — ${order_total}`,
      html: htmlBody,
    });

    res.json({ success: true, message: "Order email sent." });
  } catch (err) {
    console.error("Email send failed:", err);
    res.status(500).json({ error: "Failed to send order email." });
  }
});

app.get("/", (req, res) => {
  res.send("Aureum & Oak order API is running.");
});

app.listen(PORT, () => {
  console.log(`Order API listening on http://localhost:${PORT}`);
});
