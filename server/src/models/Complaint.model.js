import mongoose from 'mongoose';

const complaintSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  description: { type: String, required: true },
  
  citizen: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true, 
    index: true 
  },

  category: { 
    type: String, 
    required: true,
    default: 'Other',
    enum: [
        'Road', 'Electricity', 'Water', 'Sanitation',
        'Police', 'Fire', 'URBAN PLANNING & REGULATION', 
        'Environmental Protection', 'Animal Control & Veterinary', 
        'Disaster Management', 'Other', 'General'
    ]
  },
  
  department: { type: mongoose.Schema.Types.ObjectId, ref: 'Department' },

  priorityScore: { type: Number, default: 0, min: 0, max: 100 },
  priorityLevel: { 
    type: String, 
    enum: ['Low', 'Medium', 'High', 'Critical'], 
    default: 'Medium' 
  },

  aiAnalysis: {
    confidence: Number,
    summary: String
  },

  location: { type: String, required: true }, 
  zone: { type: String, required: true }, 
  
  assignedOfficer: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },

  // --- ENSURE 'in_progress' IS HERE ---
  status: {
    type: String,
    enum: ['submitted', 'assigned', 'in_progress', 'resolved', 'rejected'],
    default: 'submitted'
  },
  
  deadline: { type: Date }, 
  isBreached: { type: Boolean, default: false },

  history: [{
    action: String, 
    performedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    timestamp: { type: Date, default: Date.now },
    remarks: String
  }],

  feedback: {
    rating: { type: Number, min: 1, max: 5 },
    comment: String
  }

}, { timestamps: true });

complaintSchema.index({ citizen: 1, status: 1 });
complaintSchema.index({ assignedOfficer: 1, status: 1 });
complaintSchema.index({ zone: 1 }); 

export default mongoose.model('Complaint', complaintSchema);