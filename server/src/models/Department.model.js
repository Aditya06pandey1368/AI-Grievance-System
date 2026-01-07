import mongoose from 'mongoose';

const departmentSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true }, 
  code: { type: String, required: true, unique: true, uppercase: true }, // e.g., "RD"
  
  // Default time to solve a complaint (in hours)
  defaultSLAHours: { type: Number, default: 48 }, 

  // Who manages this department?
  admin: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

export default mongoose.model('Department', departmentSchema);