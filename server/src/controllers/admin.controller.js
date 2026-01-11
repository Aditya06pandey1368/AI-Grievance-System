import User from '../models/User.model.js';
import Officer from '../models/Officer.model.js';
import AuditLog from '../models/AuditLog.model.js';
import Department from '../models/Department.model.js';

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
    const userId = req.params.id;

    // 1. Delete the User from the User Collection
    const deletedUser = await User.findByIdAndDelete(userId);
    
    if (!deletedUser) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    // 2. CRITICAL STEP: Remove this user from any Department they are assigned to
    // This finds any department where 'admin' is the deleted user's ID and removes that field.
    await Department.updateMany(
      { admin: userId }, 
      { $unset: { admin: "" } } 
    );

    res.status(200).json({ 
      success: true, 
      message: "User deleted and removed from Department successfully" 
    });

  } catch (error) {
    console.error("Delete Error:", error);
    res.status(500).json({ success: false, message: "Server Error" });
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