import User from '../models/User.model.js';
import Officer from '../models/Officer.model.js';
import AuditLog from '../models/AuditLog.model.js';

// @desc    Create a new Officer (User + Officer Profile)
// @route   POST /api/admin/create-officer
export const createOfficer = async (req, res) => {
  try {
    const { name, email, password, departmentId, zones } = req.body;

    // 1. Check if user already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ success: false, message: 'User already exists' });
    }

    // 2. Create User Account
    const user = await User.create({
      name,
      email,
      password,
      role: 'officer',
      trustScore: 100
    });

    // 3. Create Officer Profile
    // NOTE: departmentId MUST be a valid MongoDB ObjectId (24 characters)
    // If you don't have a real department ID yet, create one in the database first.
    const officer = await Officer.create({
      user: user._id,
      department: departmentId, 
      jurisdictionZones: zones 
    });

    // 4. Log Action (Safe check for req.user)
    if (req.user) {
        await AuditLog.create({
        action: 'OFFICER_CREATED',
        actor: req.user._id,
        targetId: officer._id,
        details: `Created officer for Dept ${departmentId}`,
        ipAddress: req.ip || '127.0.0.1'
        });
    }

    res.status(201).json({ success: true, data: { user, officer } });

  } catch (error) {
    console.error("❌ CREATE OFFICER ERROR:", error); // Check your terminal for this!
    
    // Handle "CastError" (Invalid ID format) specifically
    if (error.name === 'CastError') {
        return res.status(400).json({ 
            success: false, 
            message: 'Invalid Department ID format. Must be a 24-char MongoDB ID.' 
        });
    }

    res.status(500).json({ success: false, message: error.message });
  }
};

// ... keep getAllUsers and updateUserStatus as they were ...
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.json({ success: true, data: users });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateUserStatus = async (req, res) => {
  try {
    const { isActive } = req.body;
    const user = await User.findByIdAndUpdate(
        req.params.id, 
        { isActive }, 
        { new: true }
    );
    res.json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};