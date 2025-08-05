import { Request, Response } from 'express';
import Content, { IContent } from '../models/Content';
import { startOfDay, endOfDay } from '../utils/dateHelpers';

interface CreateContentRequest {
  date: string;
  contentType: 'post' | 'reel' | 'story';
  caption: string;
  contentLink?: string;
  scheduledTime: string;
  userEmail: string[]; 
  clientName: string;    
}
interface StatsQuery {
  month?: string; 
  year?: string; 
  clientName?: string;
}

interface GetContentQuery {
  date?: string;
  startDate?: string;
  endDate?: string;
  userEmail?: string[]; 
  clientName?: string;    
}

// ----------- CREATE CONTENT -----------------
export const createContent = async (
  req: Request<{}, {}, CreateContentRequest>,
  res: Response
) => {
  try {
    const { date, contentType, caption, contentLink, scheduledTime, userEmail,clientName } = req.body;
  
   

    const safeUserEmails = userEmail.map(email => email.trim().toLowerCase()); 

    // Combine date & time into scheduledDateTime
    const contentDate = new Date(date);
    const [hours, minutes] = scheduledTime.split(':').map(Number);
    const scheduledDateTime = new Date(contentDate);
    scheduledDateTime.setHours(hours, minutes, 0, 0);

    // Cannot schedule in the past
    if (scheduledDateTime <= new Date()) {
      return res.status(400).json({ message: 'Scheduled time cannot be in the past' });
    }

    const content = new Content({
      date: contentDate,
      contentType,
      caption,
      contentLink: contentLink || undefined,
      scheduledTime: scheduledDateTime,
      userEmail: safeUserEmails,
       clientName: clientName.trim()
    });

    const savedContent = await content.save();

    res.status(201).json({
      message: 'Content created successfully',
      content: savedContent
    });
  } catch (error: any) {
    console.error('Error creating content:', error);
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        message: 'Validation error',
        errors: Object.values(error.errors).map((err: any) => err.message)
      });
    }
    res.status(500).json({
      message: 'Failed to create content',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

export const getContent = async (
  req: Request<{}, {}, {}, GetContentQuery>,
  res: Response
) => {
  try {
    const { date, startDate, endDate, userEmail, clientName } = req.query;
    const filter: any = {};

    // Specific date
    if (date) {
      const targetDate = new Date(date as string);
      filter.date = {
        $gte: startOfDay(targetDate),
        $lte: endOfDay(targetDate)
      };
    }

    // Date range
    if (startDate && endDate) {
      filter.date = {
        $gte: startOfDay(new Date(startDate)),
        $lte: endOfDay(new Date(endDate))
      };
    }

    // Email match (if front-end sends userEmail as array)
    if (Array.isArray(userEmail) && userEmail.length > 0) {
      // Find content where ANY of the userEmail array matches ANY in document userEmail array
      filter.userEmail = { $in: userEmail.map(e => e.toLowerCase()) };
    }
  if (clientName) {
      filter.clientName = { $regex: new RegExp(clientName, 'i') };
    }
    const content = await Content.find(filter).sort({ scheduledTime: 1 }).lean();

    res.json({
      message: 'Content retrieved successfully',
      content,
      count: content.length
    });
  } catch (error: any) {
    console.error('Error retrieving content:', error);
    res.status(500).json({
      message: 'Failed to retrieve content',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// -------- GET EVENTS BY DATE -----------
export const getEventsByDate = async (req: Request, res: Response) => {
  try {
    const { date } = req.query;
    if (!date) {
      return res.status(400).json({ message: 'Missing required query parameter: date' });
    }
    const targetDate = new Date(date as string);
    const events = await Content.find({
      scheduledTime: {
        $gte: startOfDay(targetDate),
        $lte: endOfDay(targetDate),
      },
    }).sort({ scheduledTime: 1 }).lean();

    res.json({
      message: 'Events retrieved successfully',
      events,
      count: events.length,
    });
  } catch (error: any) {
    console.error('Error fetching events for date:', error);
    res.status(500).json({
      message: 'Failed to fetch events for the specified date',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};


export const updateContent = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updates = { ...req.body };

    
    if (Array.isArray(updates.userEmail)) {
      updates.userEmail = updates.userEmail.map((email: string) => email.trim().toLowerCase());
    }

    
    if (updates.scheduledTime && updates.date) {
      const contentDate = new Date(updates.date);
      const [hours, minutes] = updates.scheduledTime.split(':').map(Number);
      const scheduledDateTime = new Date(contentDate);
      scheduledDateTime.setHours(hours, minutes, 0, 0);
      
      
      if (scheduledDateTime <= new Date()) {
        return res.status(400).json({
          message: 'Scheduled time cannot be in the past'
        });
      }
      
      
      updates.scheduledTime = scheduledDateTime;
    }
    
    else if (updates.scheduledTime && !updates.date) {
      delete updates.scheduledTime;
    }

    const content = await Content.findByIdAndUpdate(
      id,
      { $set: updates },
      { new: true, runValidators: true }
    );

    if (!content) {
      return res.status(404).json({ message: 'Content not found' });
    }

    res.json({
      message: 'Content updated successfully',
      content
    });

  } catch (error: any) {
    console.error('Error updating content:', error);
    res.status(500).json({
      message: 'Failed to update content',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};


// ----------- DELETE CONTENT -----------------
export const deleteContent = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const content = await Content.findByIdAndDelete(id);
    if (!content) {
      return res.status(404).json({ message: 'Content not found' });
    }
    res.json({
      message: 'Content deleted successfully',
      content
    });
  } catch (error: any) {
    console.error('Error deleting content:', error);
    res.status(500).json({
      message: 'Failed to delete content',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

