import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDB } from './config/database';
import contentRoutes from './routes/contentRoutes';
import { startReminderJob } from './cron/reminderJob';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

/* --------------------------------------------
   CORS: allow several exact origins
--------------------------------------------- */
const allowedOrigins = [
  'https://aieera-calender.vercel.app',
  'https://aieera-calender-zuzas-projects-8791177a.vercel.app'
];

app.use(
  cors({
    origin: (origin, callback) => {
      // allow requests with no origin (mobile apps, curl, Postman)
      if (!origin) return callback(null, true);

      return allowedOrigins.includes(origin)
        ? callback(null, true)
        : callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
  })
);

/* ---------- body parsing ---------- */
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/* ---------- routes ---------- */
app.use('/api/content', contentRoutes);

/* ---------- health check ---------- */
app.get('/api/health', (_, res) =>
  res.json({ message: 'Social Media Calendar API is running!' })
);

/* ---------- error handler ---------- */
app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

/* ---------- start server ---------- */
const startServer = async () => {
  try {
    await connectDB();

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      console.log(`Environment: ${process.env.NODE_ENV}`);
    });

    // cron job
    startReminderJob();
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
