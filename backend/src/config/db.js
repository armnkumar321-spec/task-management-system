import mongoose from 'mongoose';

const connectDB = async () => {
  const uri = process.env.MONGO_URI || process.env.MONGODB_URI;

  if (!uri) {
    const errorMsg = 'MongoDB connection error: Neither MONGO_URI nor MONGODB_URI is defined in environment variables.';
    console.error(`[TaskFlow DB Error]: ${errorMsg}`);
    if (process.env.NODE_ENV !== 'test') {
      process.exit(1);
    }
    throw new Error(errorMsg);
  }

  try {
    const conn = await mongoose.connect(uri);
    console.log(`[TaskFlow DB] MongoDB Connected successfully to host: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error(`[TaskFlow DB Error]: Failed to connect to MongoDB (${error.name}): ${error.message}`);
    if (process.env.NODE_ENV !== 'test') {
      process.exit(1);
    }
    throw error;
  }
};

export default connectDB;

