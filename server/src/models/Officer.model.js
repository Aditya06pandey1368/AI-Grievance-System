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

  // --- NEW FIELD: MOBILE ---
  mobile: {
    type: String,
    required: true,
    trim: true,
    validate: {
      validator: function(v) {
        return /^\d{10}$/.test(v);
      },
      message: props => `${props.value} is not a valid 10-digit mobile number!`
    }
  },

  // --- ROUTING MAGIC ---
  jurisdictionZones: [{ type: String, required: true }],
  
  // Performance Stats
  activeComplaints: { type: Number, default: 0 },
  resolvedComplaints: { type: Number, default: 0 },
  
  isAvailable: { type: Boolean, default: true } 

}, { timestamps: true });

officerSchema.index({ department: 1, jurisdictionZones: 1 });

export default mongoose.model('Officer', officerSchema);