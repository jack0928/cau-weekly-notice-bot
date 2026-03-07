// Gmail SMTP-based mail sender using nodemailer.

import nodemailer from "nodemailer";
import { requireEnv } from "../../utils/env.js";
import type { Recipient } from "../../types/recipient.js";

export async function sendMail(
  recipients: Recipient[],
  subject: string,
  html: string
): Promise<void> {
  const smtpUser = requireEnv("SMTP_USER");
  const smtpPass = requireEnv("SMTP_PASS");

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: smtpUser,
      pass: smtpPass,
    },
  });

  // Generate a simple plain text fallback by stripping HTML tags
  const text = html
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  // Create BCC list from all recipients
  const bccList = recipients.map(r => r.email).join(", ");

  await transporter.sendMail({
    from: `CAU Notice Bot <${smtpUser}>`,
    to: smtpUser,  // TO field shows the bot itself
    bcc: bccList,  // All recipients receive via BCC
    subject,
    text,
    html,
  });
}
