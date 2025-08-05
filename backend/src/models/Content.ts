import mongoose, { Document, Schema } from 'mongoose';

export interface IContent extends Document {
  date: Date;
  contentType: 'post' | 'reel' | 'story';
  caption: string;
  contentLink?: string;
  scheduledTime: Date;
  reminderSent: boolean;
  userEmail: string[]; 
    clientName: string;    
  createdAt: Date;
  updatedAt: Date;
}

const ContentSchema = new Schema<IContent>({
  date: { type: Date, required: true, index: true },
  contentType: {
    type: String,
    enum: ['post', 'reel', 'story'],
    required: true
  },
  caption: {
    type: String,
    required: true,
    maxlength: 2200
  },
  contentLink: {
    type: String,
    validate: {
      validator: (v: string) => !v || /^https?:\/\/.+/.test(v),
      message: 'Content link must be a valid URL'
    }
  },
  scheduledTime: { type: Date, required: true, index: true },
  reminderSent: { type: Boolean, default: false, index: true },
  userEmail: {
    type: [String],
    required: [true, 'At least one user email is required'],
    validate: {
      validator: (arr: string[]) => Array.isArray(arr) && arr.every(v => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)),
      message: 'All email addresses must be valid'
    }
  }
}, { timestamps: true });

ContentSchema.index({ scheduledTime: 1, reminderSent: 1 });
ContentSchema.index({ date: 1, userEmail: 1 });

export default mongoose.model<IContent>('Content', ContentSchema);
