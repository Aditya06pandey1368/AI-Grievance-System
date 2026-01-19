import mongoose from 'mongoose';

const complaintSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  description: { type: String, required: true },
  
  // REMOVED: images: [{ type: String }],
  
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
    default: 'Other',
    enum: ['Road', 'Electricity', 'Water', 'Police', 'Medical', 'Fire', 'Other', 'General'] 
  },
  
  department: { type: mongoose.Schema.Types.ObjectId, ref: 'Department' },

  // --- PRIORITY (0-100 Scale) ---
  priorityScore: { type: Number, default: 0, min: 0, max: 100 },
  priorityLevel: { 
    type: String, 
    enum: ['Low', 'Medium', 'High', 'Critical'], 
    default: 'Medium' 
  },

  // --- AI ANALYSIS DATA ---
  aiAnalysis: {
    confidence: Number,
    summary: String
  },

  // --- LOCATION & ROUTING ---
  location: { type: String, required: true }, 
  zone: { type: String, required: true }, 
  
  // --- ASSIGNMENT ---
  assignedOfficer: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },

  // --- STATUS & SLA ---
  status: {
    type: String,
    enum: ['submitted', 'assigned', 'in_progress', 'resolved', 'closed', 'rejected'],
    default: 'submitted'
  },
  deadline: { type: Date }, 
  isBreached: { type: Boolean, default: false },

  // --- AUDIT TRAIL ---
  history: [{
    action: String, 
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
complaintSchema.index({ zone: 1 }); 

export default mongoose.model('Complaint', complaintSchema);