// Gmail SMTP-based mail sender using nodemailer.

import nodemailer from "nodemailer";
import { requireEnv } from "../../utils/env.js";

export async function sendMail(subject: string, html: string): Promise<void> {
  const smtpUser = requireEnv("SMTP_USER");
  const smtpPass = requireEnv("SMTP_PASS");
  const mailTo = requireEnv("MAIL_TO");

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

  await transporter.sendMail({
    from: `CAU Notice Bot <${smtpUser}>`,
    to: mailTo,
    subject,
    text,
    html,
  });
}
