import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './src/models/User.model.js'; // Ensure path is correct

dotenv.config();

const seedAdmin = async () => {
  try {
    // 1. Connect
    await mongoose.connect(process.env.MONGO_URI);
    console.log("🔌 MongoDB Connected...");

    // 2. DELETE the old broken admin (Cleanup)
    await User.deleteOne({ email: "admin@gov.in" });
    console.log("🗑️  Old/Broken Admin removed.");

    // 3. Create New Admin (Pass PLAIN TEXT password)
    // The User Model's "pre-save" hook will handle the hashing automatically.
    await User.create({
      name: "Chief Officer",
      email: "admin@gov.in",
      password: "admin123", // <--- No bcrypt.hash here! Pure string.
      role: "admin"
    });

    console.log("✅ Admin User Created Successfully!");
    process.exit();
  } catch (error) {
    console.error("❌ Error:", error);
    process.exit(1);
  }
};

seedAdmin();