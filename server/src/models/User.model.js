import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true, select: false }, // 'select: false' hides password from queries
  role: {
    type: String,
    enum: ['citizen', 'officer', 'admin', 'super_admin'],
    default: 'citizen'
  },
  department: { type: mongoose.Schema.Types.ObjectId, ref: 'Department' }
}, { timestamps: true });

// --- MIDDLEWARE: Encrypt password before saving ---
userSchema.pre('save', async function(next) {
  // Only hash the password if it has been modified (or is new)
  if (!this.isModified('password')) {
    return next();
  }
  // Generate a "salt" (random data) and hash the password
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// --- METHOD: Check if entered password matches hashed password ---
userSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

export default mongoose.model('User', userSchema);