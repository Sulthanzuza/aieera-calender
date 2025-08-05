import cron from 'node-cron';
import Content from '../models/Content';
import { getTransporter, sendReminderEmail } from '../utils/emailService';


export const startReminderJob = () => {
  cron.schedule('*/5 * * * *', async () => {
    const now = new Date();
    const start = new Date(now.getTime() + 4 * 60 * 60 * 1000);
    const end   = new Date(start.getTime() + 5 * 60 * 1000); 

    try {
      const posts = await Content.find({
        scheduledTime: { $gte: start, $lt: end },
        reminderSent: false
      });

      if (posts.length === 0) return;

      const transporter = getTransporter();

      for (const post of posts) {
        try {
          await sendReminderEmail(post, transporter);
          post.reminderSent = true;
          await post.save();
          console.log(`Reminder sent for ${post._id}`);
        } catch (err) {
          console.error(`E-mail failed for ${post._id}`, err);
        }
      }
    } catch (err) {
      console.error('Cron job error:', err);
    }
  });
};
