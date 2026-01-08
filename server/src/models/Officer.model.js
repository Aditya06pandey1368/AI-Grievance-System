import mongoose from 'mongoose';

const officerSchema = new mongoose.Schema({
  // Link to the User Login
  user: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true, 
    unique: true 
  },
  
  department: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Department', 
    required: true 
  },

  // --- ROUTING MAGIC ---
  // The specific areas this officer handles.
  // Example: ["Sector-62", "Sector-63", "Ward-12"]
  jurisdictionZones: [{ type: String, required: true }],
  
  // Performance Stats
  activeComplaints: { type: Number, default: 0 },
  resolvedComplaints: { type: Number, default: 0 },
  
  isAvailable: { type: Boolean, default: true } // Toggle for Leave/Vacation

}, { timestamps: true });

// This allows us to quickly find: "Officer in Road Dept covering Sector-62"
officerSchema.index({ department: 1, jurisdictionZones: 1 });

export default mongoose.model('Officer', officerSchema);