import mongoose from "mongoose";

let isConnected = false;

const ATLAS_URI =
  "mongodb://banrayndox_db_user:QTGVTnuF6ZdQpe2m@ac-uv2ugnm-shard-00-00.noxlfsv.mongodb.net:27017,ac-uv2ugnm-shard-00-01.noxlfsv.mongodb.net:27017,ac-uv2ugnm-shard-00-02.noxlfsv.mongodb.net:27017/doomsday_ready?ssl=true&replicaSet=atlas-cxrzhw-shard-0&authSource=admin";

const connectDB = async () => {
  if (isConnected && mongoose.connection.readyState === 1) {
    return;
  }

  const mongoURI = process.env.MONGO_URI || ATLAS_URI;

  try {
    const conn = await mongoose.connect(mongoURI, {
      serverSelectionTimeoutMS: 5000,
    });
    isConnected = true;
    console.log(`Database connected to ${conn.connection.host}`);
  } catch (error) {
    console.error(`MongoDB connection error: ${error.message}`);
    isConnected = false;
  }
};

export default connectDB;
