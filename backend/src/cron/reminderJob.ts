import cron from 'node-cron';
import Content from '../models/Content';
import { sendReminderEmail } from '../utils/emailService';

export const startReminderJob = (): void => {
  // Run every minute to check for reminders
  cron.schedule('* * * * *', async () => {
    try {
      const now = new Date();
      const fourHoursFromNow = new Date(now.getTime() + (4 * 60 * 60 * 1000));
      
      // Find content scheduled exactly 4 hours from now that hasn't been reminded
      const contentToRemind = await Content.find({
        scheduledTime: {
          $gte: fourHoursFromNow,
          $lt: new Date(fourHoursFromNow.getTime() + 60000) // Within 1 minute window
        },
        reminderSent: false
      });

      console.log(`Found ${contentToRemind.length} content items needing reminders`);

      for (const content of contentToRemind) {
        try {
          await sendReminderEmail(content);
          
          // Mark reminder as sent
          content.reminderSent = true;
          await content.save();
          
          console.log(`Reminder sent for content: ${content._id}`);
        } catch (emailError) {
          console.error(`Failed to send reminder for content ${content._id}:`, emailError);
        }
      }
    } catch (error) {
      console.error('Error in reminder job:', error);
    }
  });

  console.log('Reminder job started - checking every minute for upcoming content');
};