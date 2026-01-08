import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './src/models/User.model.js';
import Officer from './src/models/Officer.model.js';
import Complaint from './src/models/Complaint.model.js';
import Department from './src/models/Department.model.js';
import AuditLog from './src/models/AuditLog.model.js';

dotenv.config();

const resetDb = async () => {
  try {
    // 1. Connect
    const uri = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/grievance_pro_db";
    await mongoose.connect(uri);
    console.log(`🔌 Connected to MongoDB...`);

    // 2. Delete ALL Data from Collections
    await User.deleteMany({});
    console.log("🗑️  Users deleted.");
    
    await Officer.deleteMany({});
    console.log("🗑️  Officers deleted.");
    
    await Complaint.deleteMany({});
    console.log("🗑️  Complaints deleted.");

    await Department.deleteMany({});
    console.log("🗑️  Departments deleted.");
    
    // Optional: Delete logs if you have them
    // await AuditLog.deleteMany({}); 

    console.log("✅ Database Wiped Successfully! It is clean now.");
    process.exit();
  } catch (error) {
    console.error("❌ Error wiping database:", error);
    process.exit(1);
  }
};

resetDb();