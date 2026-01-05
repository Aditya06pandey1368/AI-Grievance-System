import mongoose from 'mongoose';

const complaintSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  description: { type: String, required: true },
  
  // Who submitted it?
  citizen: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },

  // AI Classification Data
  category: {
    type: String,
    enum: ['Road', 'Electricity', 'Water', 'Waste', 'Safety', 'Health', 'Other'],
    default: 'Other'
  },
  priorityScore: {
    type: Number,
    default: 0,
    min: 0,
    max: 100 // AI gives a score from 0-100
  },
  priorityLevel: {
    type: String,
    enum: ['Low', 'Medium', 'High', 'Critical'],
    default: 'Medium'
  },
  
  // Routing & Assignment
  department: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Department'
  },
  assignedOfficer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },

  // Lifecycle Status
  status: {
    type: String,
    enum: ['submitted', 'classified', 'assigned', 'in_progress', 'resolved', 'closed', 'rejected'],
    default: 'submitted'
  },

  location: {
    type: String, // "Sector 62, Noida"
    required: true
  },
  
  // Attachments (Images)
  images: [{ type: String }], // Array of URLs

  // SLA Tracking
  expectedResolutionDate: { type: Date },
  isBreached: { type: Boolean, default: false }

}, { timestamps: true });

export default mongoose.model('Complaint', complaintSchema);