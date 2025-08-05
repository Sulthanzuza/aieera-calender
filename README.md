# Social Media Content Calendar

A full-stack social media content calendar application built with the MERN stack (MongoDB, Express, React, Node.js) and TypeScript. Plan, schedule, and get reminded about your social media posts with an intuitive calendar interface.

## Features

### Frontend
- 📅 **Interactive Calendar** - Month, week, day, and agenda views
- ➕ **Easy Content Scheduling** - Click any date to add content
- 🎯 **Content Types** - Support for Posts, Reels, and Stories
- 📱 **Responsive Design** - Works on desktop and mobile
- ✨ **Modern UI** - Built with Tailwind CSS and Lucide icons

### Backend
- 🗄️ **MongoDB Database** - Secure data storage with Mongoose
- 📧 **Email Reminders** - Automated emails 4 hours before scheduled posts
- ⏰ **Smart Scheduling** - Cron jobs for timely notifications
- 🔒 **Input Validation** - Comprehensive data validation
- 🚀 **RESTful API** - Clean, well-documented endpoints

## Tech Stack

### Frontend
- **React 18** with TypeScript
- **Vite** for fast development
- **Tailwind CSS** for styling
- **react-big-calendar** for calendar functionality
- **Axios** for API calls
- **React Modal** for dialogs

### Backend
- **Node.js** with Express
- **TypeScript** for type safety
- **MongoDB** with Mongoose ODM
- **Nodemailer** for email sending
- **node-cron** for scheduled tasks
- **CORS** for cross-origin requests

## Quick Start

### Prerequisites
- Node.js (v18 or higher)
- MongoDB (local or MongoDB Atlas)
- Email service credentials (Gmail recommended)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd social-media-calendar
   ```

2. **Set up the Backend**
   ```bash
   cd backend
   npm install
   ```

3. **Configure Environment Variables**
   
   Copy `.env.example` to `.env` and update the values:
   ```bash
   cp .env.example .env
   ```
   
   Update `.env` with your configuration:
   ```env
   MONGODB_URI=mongodb://localhost:27017/social_media_calendar
   PORT=5000
   NODE_ENV=development
   
   # Email Configuration (Gmail example)
   EMAIL_HOST=smtp.gmail.com
   EMAIL_PORT=587
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASS=your-app-password
   
   FRONTEND_URL=http://localhost:5173
   ```

4. **Start the Backend**
   ```bash
   npm run dev
   ```

5. **Set up the Frontend** (in a new terminal)
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

6. **Access the Application**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:5000

## Email Configuration

### Gmail Setup
1. Enable 2-Factor Authentication on your Gmail account
2. Generate an App Password:
   - Go to Google Account settings
   - Security → 2-Step Verification → App passwords
   - Generate a password for "Mail"
3. Use your Gmail address as `EMAIL_USER` and the app password as `EMAIL_PASS`

### Other Email Providers
Update the `EMAIL_HOST` and `EMAIL_PORT` in your `.env` file according to your provider:
- **Outlook**: smtp.office365.com, port 587
- **Yahoo**: smtp.mail.yahoo.com, port 587
- **Custom SMTP**: Use your provider's settings

## API Endpoints

### Content Management
- `POST /api/content` - Create new content
- `GET /api/content` - Get all content (with optional filtering)
- `PUT /api/content/:id` - Update content
- `DELETE /api/content/:id` - Delete content

### Query Parameters for GET /api/content
- `date` - Filter by specific date (YYYY-MM-DD)
- `startDate` & `endDate` - Filter by date range
- `userEmail` - Filter by user email

## Database Schema

### Content Model
```typescript
{
  date: Date,                    // Content date
  contentType: 'post' | 'reel' | 'story',
  caption: string,               // Content caption (max 2200 chars)
  contentLink?: string,          // Optional content URL
  scheduledTime: Date,           // Exact scheduled time
  reminderSent: boolean,         // Email reminder status
  userEmail: string,             // User's email for reminders
  createdAt: Date,
  updatedAt: Date
}
```

## Development

### Backend Development
```bash
cd backend
npm run dev          # Start with hot reload
npm run build        # Build TypeScript
npm start           # Start production server
```

### Frontend Development
```bash
cd frontend
npm run dev         # Start development server
npm run build       # Build for production
npm run preview     # Preview production build
```

## Features in Detail

### Calendar Interface
- **Multiple Views**: Month, week, day, and agenda views
- **Event Colors**: Different colors for posts (blue), reels (red), and stories (green)
- **Quick Add**: Click any date to schedule content
- **Event Details**: Hover or click events to see details

### Content Scheduling
- **Content Types**: Posts, Reels, Stories with distinctive icons
- **Rich Text**: Support for long captions (up to 2200 characters)
- **Optional Links**: Add URLs to your content
- **Time Selection**: Precise time scheduling
- **Email Reminders**: 4-hour advance notifications

### Email Reminders
- **Automated Sending**: Cron job checks every minute
- **Rich HTML**: Beautiful email templates with content details
- **Fallback Text**: Plain text version for all email clients
- **Error Handling**: Robust error logging and retry logic

## Troubleshooting

### Common Issues

1. **MongoDB Connection Failed**
   - Ensure MongoDB is running locally or check your Atlas connection string
   - Verify the `MONGODB_URI` in your `.env` file

2. **Email Not Sending**
   - Check email credentials in `.env`
   - Verify 2FA and app passwords for Gmail
   - Check spam folder for test emails

3. **CORS Errors**
   - Ensure `FRONTEND_URL` in backend `.env` matches your frontend URL
   - Check that both frontend and backend are running

4. **Calendar Not Loading**
   - Verify backend is running on the correct port
   - Check browser console for API errors
   - Ensure database connection is established

### Development Tips

- **Hot Reload**: Both frontend and backend support hot reload during development
- **Type Safety**: TypeScript provides compile-time error checking
- **Database Indexes**: Optimized queries for calendar date ranges
- **Error Handling**: Comprehensive error messages for debugging

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support, please open an issue on GitHub or contact the development team.

---

Built with ❤️ using the MERN stack and TypeScript