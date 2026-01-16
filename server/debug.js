
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './src/models/User.model.js';
import Officer from './src/models/Officer.model.js';
import Complaint from './src/models/Complaint.model.js';

dotenv.config();

const debugSystem = async () => {
  try {
    const uri = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/grievance_pro_db";
    await mongoose.connect(uri);
    console.log(`\n🔌 CONNECTED TO DB: ${uri}\n`);

    // 1. DUMP OFFICERS
    console.log("👮 --- OFFICERS LIST ---");
    const officers = await Officer.find().populate('user');
    
    if (officers.length === 0) {
        console.log("❌ NO OFFICERS FOUND! (Did you create one?)");
    } else {
        officers.forEach(off => {
            console.log(`\nName: ${off.user ? off.user.name : 'ORPHAN PROFILE'}`);
            console.log(`Email: ${off.user ? off.user.email : 'N/A'}`);
            console.log(`User ID: ${off.user ? off.user._id : 'N/A'}`);
            console.log(`Zones: ${JSON.stringify(off.jurisdictionZones)}  <-- LOOK CLOSELY HERE`);
        });
    }

    // 2. DUMP COMPLAINTS
    console.log("\n📝 --- COMPLAINTS LIST ---");
    const complaints = await Complaint.find();
    
    if (complaints.length === 0) {
        console.log("❌ NO COMPLAINTS FOUND!");
    } else {
        complaints.forEach(c => {
            console.log(`\nTitle: ${c.title}`);
            console.log(`Zone: "${c.zone}"  <-- DOES THIS MATCH OFFICER ZONES EXACTLY?`);
            console.log(`Status: ${c.status}`);
            console.log(`AssignedOfficer ID: ${c.assignedOfficer}`);
        });
    }

    console.log("\n---------------------------------------------------");
    process.exit();
  } catch (error) {
    console.error("❌ ERROR:", error);
    process.exit(1);
  }
};

debugSystem();