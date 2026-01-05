import mongoose from 'mongoose';

const departmentSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true, 
    unique: true 
  },
  code: {
    type: String, // e.g., "RD-01" for Road Dept
    required: true,
    uppercase: true
  },
  headOfDepartment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, { timestamps: true });

export default mongoose.model('Department', departmentSchema);