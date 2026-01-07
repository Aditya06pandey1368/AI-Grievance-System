import mongoose from 'mongoose';

const auditLogSchema = new mongoose.Schema({
  action: { type: String, required: true }, // e.g., "LOGIN_FAILURE", "COMPLAINT_REJECTED"
  
  actor: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // Who did it?
  
  targetId: { type: String }, // ID of the User or Complaint affected
  targetModel: { type: String }, // "User" or "Complaint"
  
  details: { type: String }, // "Reason: Spam content"
  
  ipAddress: String,
  timestamp: { type: Date, default: Date.now }
});

export default mongoose.model('AuditLog', auditLogSchema);