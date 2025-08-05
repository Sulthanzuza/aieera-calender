import nodemailer from 'nodemailer';
import { IContent } from '../models/Content';

/* ---------- ENV → CONFIG ---------- */
interface EmailConfig {
  host: string;
  port: number;
  user: string;
  pass: string;
}

const getEmailConfig = (): EmailConfig => {
  const { EMAIL_HOST, EMAIL_PORT, EMAIL_USER, EMAIL_PASS } = process.env;
  if (!EMAIL_HOST || !EMAIL_PORT || !EMAIL_USER || !EMAIL_PASS) {
    throw new Error(
      'EMAIL_HOST, EMAIL_PORT, EMAIL_USER, and EMAIL_PASS must be set'
    );
  }
  return {
    host: EMAIL_HOST,
    port: parseInt(EMAIL_PORT, 10),
    user: EMAIL_USER,
    pass: EMAIL_PASS
  };
};

/* ---------- SINGLETON TRANSPORTER ---------- */
let cachedTransporter: nodemailer.Transporter | null = null;

export const getTransporter = () => {
  if (cachedTransporter) return cachedTransporter;

  const cfg = getEmailConfig();
  cachedTransporter = nodemailer.createTransport({
    host: cfg.host,
    port: cfg.port,
    secure: cfg.port === 465,
    pool: true,                     // keep connection open
    auth: { user: cfg.user, pass: cfg.pass }
  });
  return cachedTransporter;
};


export const sendReminderEmail = async (
  content: IContent,
  transporter = getTransporter()
): Promise<void> => {
  const scheduledDate = content.scheduledTime.toLocaleDateString();
  const scheduledTime = content.scheduledTime.toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit'
  });

  const contentTypeTitle =
    content.contentType.charAt(0).toUpperCase() + content.contentType.slice(1);

  const html = `
    <div style="font-family: Arial, sans-serif; max-width:600px;margin:0 auto">
      <h2 style="background:#3B82F6;color:#fff;padding:16px 24px;border-radius:8px 8px 0 0">
        📅 Content Reminder
      </h2>
      <div style="border:1px solid #e2e8f0;border-top:0;padding:24px">
        <p><b>${contentTypeTitle}</b> is scheduled in <b>4 h</b></p>
        <p>📅 <b>Date:</b> ${scheduledDate}</p>
        <p>⏰ <b>Time:</b> ${scheduledTime}</p>
        <p>📝 <b>Caption:</b><br/>${content.caption}</p>
        ${
          content.contentLink
            ? `<p>🔗 <b>Link:</b> <a href="${content.contentLink}">${content.contentLink}</a></p>`
            : ''
        }
      </div>
      <p style="font-size:12px;color:#64748b;text-align:center;margin-top:16px">
        Automated reminder from your Social-Media Calendar
      </p>
    </div>
  `;

  const mailOptions = {
    from: `"Social Media Calendar" <${process.env.EMAIL_USER}>`,
    to: Array.isArray(content.userEmail)
      ? content.userEmail
      : [content.userEmail],
    subject: `⏰ Reminder: ${contentTypeTitle} @ ${scheduledTime}`,
    html,
    text: `
${contentTypeTitle} reminder – 4 h left

Date: ${scheduledDate}
Time: ${scheduledTime}
Caption: ${content.caption}
${content.contentLink ? `Link: ${content.contentLink}` : ''}

--
Social Media Calendar
    `
  };

  await transporter.sendMail(mailOptions);
};


export const verifyEmailConnection = async (): Promise<void> => {
  await getTransporter().verify();
};


