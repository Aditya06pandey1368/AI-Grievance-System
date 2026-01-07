import User from '../models/User.model.js';
import Officer from '../models/Officer.model.js';
import AuditLog from '../models/AuditLog.model.js';

// @desc    Create a new Officer (User + Officer Profile)
// @route   POST /api/admin/create-officer
export const createOfficer = async (req, res) => {
  try {
    const { name, email, password, departmentId, zones } = req.body;

    // 1. Create User Account
    const user = await User.create({
      name,
      email,
      password,
      role: 'officer',
      trustScore: 100
    });

    // 2. Create Officer Profile (Linked to User)
    const officer = await Officer.create({
      user: user._id,
      department: departmentId,
      jurisdictionZones: zones // Array of strings ["Ward-1", "Ward-2"]
    });

    // 3. Log Action
    await AuditLog.create({
      action: 'OFFICER_CREATED',
      actor: req.user._id,
      targetId: officer._id,
      details: `Created officer for Dept ${departmentId}`,
      ipAddress: req.ip
    });

    res.status(201).json({ success: true, data: { user, officer } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all users (with filters)
// @route   GET /api/admin/users
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.json({ success: true, data: users });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Ban or Unban a user manually
// @route   PUT /api/admin/users/:id/status
export const updateUserStatus = async (req, res) => {
  try {
    const { isActive } = req.body;
    const user = await User.findByIdAndUpdate(
        req.params.id, 
        { isActive }, 
        { new: true }
    );

    await AuditLog.create({
      action: isActive ? 'USER_UNBANNED' : 'USER_BANNED',
      actor: req.user._id,
      targetId: user._id,
      details: `Manual status change to ${isActive}`
    });

    res.json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};