import mongoose from "mongoose";

const MONGO_URI = Bun.env.MONGO_URL || "mongodb://localhost:27017/your_database_name";

const connectDB = async () => {
  try {
    await mongoose.connect(MONGO_URI);

    console.log("🚀 MongoDB connected successfully!");
  } catch (error) {
    console.error("❌ MongoDB connection error:", error);
    process.exit(1); // Exit the process on connection failure
  }
};

export default connectDB;
