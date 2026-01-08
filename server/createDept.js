import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Department from './src/models/Department.model.js';
dotenv.config();

mongoose.connect(process.env.MONGO_URI).then(async () => {
   const dept = await Department.create({ 
       name: "Roads & Highways", 
       code: "DEPT_ROADS" 
   });
   console.log("✅ Department Created:", dept._id); // <--- COPY THIS ID
   process.exit();
});