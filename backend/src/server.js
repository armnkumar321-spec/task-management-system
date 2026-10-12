import dotenv from 'dotenv';
import app from './app.js';
import connectDB from './config/db.js';

dotenv.config();

const PORT = process.env.PORT || 5000;
const HOST = '0.0.0.0';

// Connect to MongoDB then start Express server
connectDB()
  .then(() => {
    app.listen(PORT, HOST, () => {
      console.log(`🚀 TaskFlow Backend running in ${process.env.NODE_ENV || 'development'} mode on http://${HOST}:${PORT}`);
    });
  })
  .catch((err) => {
    console.error('Failed to connect to database on startup:', err.message);
    process.exit(1);
  });
