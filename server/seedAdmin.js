
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './src/models/User.model.js'; // Ensure path is correct

dotenv.config();

const seedUsers = async () => {
  try {
    // 1. Connect
    const uri = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/grievance_pro_db";
    await mongoose.connect(uri);
    console.log(`🔌 Connected to MongoDB...`);

    // 2. Cleanup: Remove old users to avoid duplicates
    // We also remove 'admin@gov.in' to fix the broken record
    const emailsToDelete = [
      "super@gov.in", 
      "admin@dept.in", 
      "officer@ward1.in", 
      "citizen@test.com",
      "admin@gov.in" 
    ];
    await User.deleteMany({ email: { $in: emailsToDelete } });
    console.log("🗑️  Old test users removed.");

    // 3. Create Users with CORRECT Roles
    // The role must match the enum in your User.model.js
    const users = [
      {
        name: "Super Admin",
        email: "super@gov.in",
        password: "password123", 
        role: "super_admin", // <--- CHANGED THIS from 'admin' to 'super_admin'
        trustScore: 100
      },
      {
        name: "Department Head",
        email: "admin@dept.in",
        password: "password123",
        role: "dept_admin",
        departmentId: "DEPT_ROADS", 
        trustScore: 100
      },
      {
        name: "Field Officer",
        email: "officer@ward1.in",
        password: "password123",
        role: "officer",
        zones: ["Ward-1"],
        trustScore: 100
      },
      {
        name: "Rahul Citizen",
        email: "citizen@test.com",
        password: "password123",
        role: "citizen",
        trustScore: 85
      }
    ];

    await User.create(users);

    console.log("✅ All Test Users Created Successfully!");
    process.exit();
  } catch (error) {
    console.error("❌ Error seeding database:", error);
    process.exit(1);
  }
};

seedUsers();