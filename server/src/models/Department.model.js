import mongoose from 'mongoose';

const departmentSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true, 
    unique: true,
    trim: true 
  }, 
  code: { 
    type: String, 
    required: true, 
    unique: true, 
    uppercase: true,
    trim: true 
  }, // e.g., "DEPT_ROADS"
  
  // Default time to solve a complaint (in hours)
  defaultSLAHours: { 
    type: Number, 
    default: 48 
  }, 

  // Who manages this department? (Links to a User with role 'dept_admin')
  admin: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User' 
  }
}, { timestamps: true });

export default mongoose.model('Department', departmentSchema);