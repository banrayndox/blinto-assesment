import mongoose from "mongoose";

let isConnected = false;

const connectDB = async () => {
  if (isConnected && mongoose.connection.readyState === 1) {
    return;
  }

  const mongoURI = process.env.MONGO_URI || "mongodb://localhost:27017/doomsday_ready";

  try {
    const conn = await mongoose.connect(mongoURI, {
      serverSelectionTimeoutMS: 5000,
    });
    isConnected = true;
    console.log(`Database connected to ${conn.connection.host}`);
  } catch (error) {
    console.error(`MongoDB connection error: ${error.message}`);
    isConnected = false;
    // Don't kill serverless lambda process; allow handling in request
    if (process.env.NODE_ENV !== "production" && !process.env.VERCEL) {
      // In local development, can log error
    }
  }
};

export default connectDB;
