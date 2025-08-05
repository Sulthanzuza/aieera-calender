import nodemailer from 'nodemailer';
import { IContent } from '../models/Content';

interface EmailConfig {
  host: string;
  port: number;
  user: string;
  pass: string;
}

const getEmailConfig = (): EmailConfig => {
  const host = process.env.EMAIL_HOST;
  const port = process.env.EMAIL_PORT;
  const user = process.env.EMAIL_USER;
  const pass = process.env.EMAIL_PASS;

  if (!host || !port || !user || !pass) {
    throw new Error('Email configuration is incomplete. Check EMAIL_HOST, EMAIL_PORT, EMAIL_USER, and EMAIL_PASS environment variables.');
  }

  return {
    host,
    port: parseInt(port),
    user,
    pass
  };
};

const createTransporter = () => {
  const config = getEmailConfig();
  
  return nodemailer.createTransport({
    host: config.host,
    port: config.port,
    secure: config.port === 465, // true for 465, false for other ports
    auth: {
      user: config.user,
      pass: config.pass
    }
  });
};

export const sendReminderEmail = async (content: IContent): Promise<void> => {
  try {
    const transporter = createTransporter();
    
    const scheduledDate = content.scheduledTime.toLocaleDateString();
    const scheduledTime = content.scheduledTime.toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });

    const contentTypeTitle = content.contentType.charAt(0).toUpperCase() + content.contentType.slice(1);
    
    const emailHTML = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #3B82F6 0%, #1E40AF 100%); color: white; padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
          <h1 style="margin: 0; font-size: 24px;">📅 Content Reminder</h1>
          <p style="margin: 10px 0 0 0; opacity: 0.9;">Your social media content is scheduled in 4 hours!</p>
        </div>
        
        <div style="background: #f8fafc; padding: 30px; border-radius: 0 0 10px 10px; border: 1px solid #e2e8f0;">
          <div style="background: white; padding: 20px; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
            <h2 style="color: #1e293b; margin: 0 0 15px 0; font-size: 18px;">
              📱 ${contentTypeTitle} Scheduled
            </h2>
            
            <div style="margin: 15px 0;">
              <strong style="color: #475569;">📅 Date:</strong> ${scheduledDate}
            </div>
            
            <div style="margin: 15px 0;">
              <strong style="color: #475569;">⏰ Time:</strong> ${scheduledTime}
            </div>
            
            <div style="margin: 15px 0;">
              <strong style="color: #475569;">📝 Caption:</strong>
              <div style="background: #f1f5f9; padding: 10px; border-radius: 5px; margin-top: 5px; white-space: pre-wrap;">${content.caption}</div>
            </div>
            
            ${content.contentLink ? `
            <div style="margin: 15px 0;">
              <strong style="color: #475569;">🔗 Content Link:</strong>
              <a href="${content.contentLink}" style="color: #3B82F6; text-decoration: none; word-break: break-all;">${content.contentLink}</a>
            </div>
            ` : ''}
          </div>
          
          <div style="text-align: center; margin-top: 20px; padding: 15px; background: #dbeafe; border-radius: 8px;">
            <p style="margin: 0; color: #1e40af;">
              ⏰ <strong>Don't forget!</strong> Your content is scheduled to go live in 4 hours.
            </p>
          </div>
        </div>
        
        <div style="text-align: center; margin-top: 20px; color: #64748b; font-size: 12px;">
          <p>This is an automated reminder from your Social Media Content Calendar.</p>
        </div>
      </div>
    `;

    const mailOptions = {
      from: `"Social Media Calendar" <${process.env.EMAIL_USER}>`,
      to: content.userEmail,
      subject: `⏰ Reminder: ${contentTypeTitle} scheduled for ${scheduledTime}`,
      html: emailHTML,
      text: `
Content Reminder

Your ${content.contentType} is scheduled in 4 hours!

Date: ${scheduledDate}
Time: ${scheduledTime}
Caption: ${content.caption}
${content.contentLink ? `Content Link: ${content.contentLink}` : ''}

Don't forget to post your content!
      `
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent successfully:', info.messageId);
    
  } catch (error) {
    console.error('Failed to send reminder email:', error);
    throw error;
  }
};

export const testEmailConnection = async (): Promise<boolean> => {
  try {
    const transporter = createTransporter();
    await transporter.verify();
    console.log('Email service is ready');
    return true;
  } catch (error) {
    console.error('Email service connection failed:', error);
    return false;
  }
};