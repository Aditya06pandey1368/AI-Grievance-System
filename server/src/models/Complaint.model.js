import mongoose from 'mongoose';

const complaintSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  description: { type: String, required: true },
  images: [{ type: String }],
  
  citizen: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true, 
    index: true 
  },

  // --- CLASSIFICATION ---
  category: { 
    type: String, 
    required: true,
    enum: ['Road', 'Electricity', 'Water', 'Police', 'Medical', 'Fire', 'Other'] 
  },
  
  department: { type: mongoose.Schema.Types.ObjectId, ref: 'Department' },

  // --- PRIORITY (0-100 Scale) ---
  priorityScore: { type: Number, default: 0, min: 0, max: 100 },
  priorityLevel: { 
    type: String, 
    enum: ['Low', 'Medium', 'High', 'Critical'], 
    default: 'Medium' 
  },

  // --- LOCATION & ROUTING (NEW) ---
  location: { type: String, required: true }, // Full address
  zone: { type: String, required: true },     // e.g., "Ward-12" (Used for matching Officer)
  
  // --- ASSIGNMENT ---
  assignedOfficer: { type: mongoose.Schema.Types.ObjectId, ref: 'Officer' },

  // --- STATUS & SLA ---
  status: {
    type: String,
    enum: ['submitted', 'assigned', 'in_progress', 'resolved', 'closed', 'rejected'],
    default: 'submitted'
  },
  deadline: { type: Date }, // Automatically calculated based on priority
  isBreached: { type: Boolean, default: false },

  // --- AUDIT TRAIL (NEW) ---
  // Keeps a permanent record of every change
  history: [{
    action: String, // e.g., "STATUS_UPDATED", "OFFICER_ASSIGNED"
    performedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    timestamp: { type: Date, default: Date.now },
    remarks: String
  }],

  // --- FEEDBACK ---
  feedback: {
    rating: { type: Number, min: 1, max: 5 },
    comment: String
  }

}, { timestamps: true });

// Optimize queries
complaintSchema.index({ citizen: 1, status: 1 });
complaintSchema.index({ assignedOfficer: 1, status: 1 });
complaintSchema.index({ zone: 1, department: 1 }); // Speed up routing

export default mongoose.model('Complaint', complaintSchema);