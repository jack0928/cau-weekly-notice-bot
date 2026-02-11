// Gmail SMTP-based mail sender using nodemailer.

import nodemailer from "nodemailer";
import { requireEnv } from "../../utils/env.js";

export async function sendMail(subject: string, text: string): Promise<void> {
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

  await transporter.sendMail({
    from: `CAU Notice Bot <${smtpUser}>`,
    to: mailTo,
    subject,
    text,
  });
}
