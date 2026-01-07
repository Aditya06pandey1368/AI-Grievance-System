import mongoose from 'mongoose';

const slaConfigSchema = new mongoose.Schema({
  // OPTION 1: Rule by Category (e.g., "Fire" always has strict SLA)
  category: { 
    type: String, 
    enum: ['Road', 'Electricity', 'Water', 'Police', 'Medical', 'Fire', 'Other', 'General'],
    default: 'General'
  },

  // OPTION 2: Rule by Priority (e.g., "Critical" always gets 24 hours)
  priorityLevel: {
    type: String,
    enum: ['Low', 'Medium', 'High', 'Critical']
  },

  // The Rule: Time allowed in hours
  resolutionTimeHours: { 
    type: Number, 
    required: true, 
    default: 48 // Standard default
  },

  // If breached, who gets notified?
  escalateTo: {
    type: String,
    enum: ['officer', 'dept_admin', 'super_admin'],
    default: 'dept_admin'
  },
  
  isActive: { type: Boolean, default: true }

}, { timestamps: true });

// Compound index to quickly find the matching rule
// Example: Find rule for { category: "Water", priorityLevel: "High" }
slaConfigSchema.index({ category: 1, priorityLevel: 1 }, { unique: true });

export default mongoose.model('SLAConfig', slaConfigSchema);