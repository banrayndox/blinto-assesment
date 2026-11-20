import mongoose from "mongoose";

const connectDB = async () => {
  const mongoURI = process.env.MONGO_URI || "mongodb://localhost:27017/doomsday_ready";

  try {
    const conn = await mongoose.connect(mongoURI);
    console.log(`Database connected to ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

export default connectDB;
