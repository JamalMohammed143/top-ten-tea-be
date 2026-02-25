import mongoose from "mongoose";
import dotenv from "dotenv";
import { User } from "./models/Users";

dotenv.config();

const seedAdmin = async () => {
  try {
    if (!process.env.MONGO_URI) {
      throw new Error("MONGO_URI is not defined in .env");
    }

    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB Connected");

    const adminExists = await User.findOne({ email: "admin@example.com" });
    if (adminExists) {
      console.log("Admin already exists. You can log in with:");
      console.log("Email: admin@example.com");
      process.exit(0);
    }

    const admin = new User({
      name: "Super Admin",
      email: "admin@example.com",
      password: "password123",
      role: "admin",
    });

    // this will trigger the pre-save hook and hash the password
    await admin.save();
    console.log("--- Initial Admin Created ---");
    console.log("Email: admin@example.com");
    console.log("Password: password123");
    console.log("-----------------------------");

    process.exit(0);
  } catch (error) {
    console.error("Error seeding admin:", error);
    process.exit(1);
  }
};

seedAdmin();
