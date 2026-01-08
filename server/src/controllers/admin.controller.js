import User from '../models/User.model.js';
import Officer from '../models/Officer.model.js';
import AuditLog from '../models/AuditLog.model.js';

// @desc    Create a new Officer (User + Officer Profile)
// @route   POST /api/admin/create-officer
export const createOfficer = async (req, res) => {
  try {
    const { name, email, password, departmentId, zones } = req.body;

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ success: false, message: 'User already exists' });
    }

    const user = await User.create({
      name, email, password,
      role: 'officer',
      trustScore: 100
    });

    const officer = await Officer.create({
      user: user._id,
      department: departmentId, 
      jurisdictionZones: zones 
    });

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
    console.error("❌ CREATE OFFICER ERROR:", error);
    if (error.name === 'CastError') {
        return res.status(400).json({ success: false, message: 'Invalid Department ID format.' });
    }
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get ONLY Officers (for the Officer List page)
// @route   GET /api/admin/officers
export const getAllOfficers = async (req, res) => {
    try {
        // Find users with role 'officer'
        const officers = await User.find({ role: 'officer' }).select('-password');
        
        // Optional: If you want to attach their Zones/Dept info, you'd need to loop and query Officer model
        // For now, listing the User account is enough for Deletion
        res.json({ success: true, data: officers });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Delete a User (Officer)
// @route   DELETE /api/admin/users/:id
export const deleteUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if(!user) return res.status(404).json({ message: "User not found" });

        await User.deleteOne({ _id: req.params.id });
        // Also cleanup Officer profile if it exists
        await Officer.deleteOne({ user: req.params.id });

        res.json({ success: true, message: "User deleted" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

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
    const user = await User.findByIdAndUpdate(req.params.id, { isActive }, { new: true });
    res.json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};