import nodemailer from 'nodemailer';
import type Mail from 'nodemailer/lib/mailer';

let cachedTransporter: Mail | null = null;

// Reuses a single SMTP connection pool across requests instead of reconnecting every send
export function getMailTransporter(): Mail {
  if (cachedTransporter) return cachedTransporter;

  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT || 587);
  const secure = process.env.SMTP_SECURE === 'true';
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!host || !user || !pass) {
    throw new Error('SMTP credentials are not configured on the server.');
  }

  cachedTransporter = nodemailer.createTransport({
    host,
    port,
    secure,
    auth: { user, pass }
  });

  return cachedTransporter;
}

export async function sendMail(options: { to: string; subject: string; html: string }) {
  const transporter = getMailTransporter();
  const from = process.env.SMTP_FROM || process.env.SMTP_USER;

  const info = await transporter.sendMail({
    from: `"TrainMedix" <${from}>`,
    to: options.to,
    subject: options.subject,
    html: options.html
  });

  return { messageId: info.messageId };
}
