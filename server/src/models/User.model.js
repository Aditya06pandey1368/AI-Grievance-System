import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true, select: false },
  
  // Updated Roles for Enterprise System
  role: {
    type: String,
    enum: ['citizen', 'officer', 'dept_admin', 'super_admin'],
    default: 'citizen'
  },

  // --- NEW: FRAUD PREVENTION ---
  trustScore: { 
    type: Number, 
    default: 100, 
    min: 0, 
    max: 100 
  },
  
  // To block users who spam fake complaints
  isActive: { type: Boolean, default: true }, 

  lastLogin: { type: Date }

}, { timestamps: true });

// --- MIDDLEWARE ---
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

userSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

export default mongoose.model('User', userSchema);