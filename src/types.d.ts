export interface ContentEvent {
  _id: string;
  date: string;
  contentType: 'post' | 'reel' | 'story';
  caption: string;
  contentLink?: string;
  scheduledTime: string;
  reminderSent: boolean;
  userEmail: string[];
  clientName: string;
  createdAt: string;
  updatedAt: string;
}

export interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  resource: ContentEvent;
}

export interface CreateContentData {
  date: string;
  contentType: 'post' | 'reel' | 'story';
  caption: string;
  contentLink?: string;
  scheduledTime: string;
  userEmail: string[];
  clientName: string;
}

export interface ApiResponse<T> {
  message: string;
  content?: T;
  events?: T;
  count?: number;
  errors?: string[];
}
