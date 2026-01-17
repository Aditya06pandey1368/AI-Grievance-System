import User from '../models/User.model.js';
import Officer from '../models/Officer.model.js';
import AuditLog from '../models/AuditLog.model.js';
import Department from '../models/Department.model.js';

// @desc    Create a new Officer (User + Officer Profile)
// @route   POST /api/admin/create-officer
export const createOfficer = async (req, res) => {
  try {
    // 1. We DO NOT ask for departmentId from frontend anymore.
    const { name, email, password, zones } = req.body;

    // 2. AUTO-DETECT DEPARTMENT: Find the department managed by this logged-in Admin
    // req.user._id comes from the 'protect' middleware
    const adminDept = await Department.findOne({ admin: req.user._id });

    if (!adminDept) {
      return res.status(403).json({ 
        success: false, 
        message: "You are not assigned to any Department, so you cannot create officers." 
      });
    }

    // 3. Check if email exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ success: false, message: 'User already exists' });
    }

    // 4. Create User Account
    const user = await User.create({
      name, 
      email, 
      password,
      role: 'officer',
      isActive: true,
      trustScore: 100
    });

    // 5. Create Officer Profile linked to Admin's Department
    const officer = await Officer.create({
      user: user._id,
      department: adminDept._id, // <--- AUTOMATIC ASSIGNMENT
      jurisdictionZones: zones || []
    });

    // 6. Log Action
    await AuditLog.create({
        action: 'OFFICER_CREATED',
        actor: req.user._id,
        targetId: officer._id,
        details: `Created officer ${name} for ${adminDept.name}`,
        ipAddress: req.ip || '127.0.0.1'
    });

    res.status(201).json({ success: true, data: { user, officer } });

  } catch (error) {
    console.error("❌ CREATE OFFICER ERROR:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get ONLY Officers belonging to the Logged-in Admin's Department
// @route   GET /api/admin/officers
export const getAllOfficers = async (req, res) => {
  try {
    // 1. Find Admin's Department
    const adminDept = await Department.findOne({ admin: req.user._id });
    
    // If super admin (optional handling), might want to see all. 
    // But for Dept Admin, we filter:
    const filter = adminDept ? { department: adminDept._id } : {};

    // 2. Find Officers matches that Department
    const officers = await Officer.find(filter)
      .populate("user", "name email isActive"); 

    // 3. Transform data
    const formattedData = officers.map(doc => {
      if (!doc.user) return null; // Skip if user was deleted but officer doc remains
      return {
        _id: doc.user._id,       // User ID (for delete)
        name: doc.user.name,
        email: doc.user.email,
        isActive: doc.user.isActive,
        zones: doc.jurisdictionZones, 
        department: doc.department
      };
    }).filter(Boolean);

    res.status(200).json({
      success: true,
      data: formattedData,
    });

  } catch (error) {
    console.error("Get Officers Error:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// @desc    Delete a User (Smart Delete)
// @route   DELETE /api/admin/users/:id
export const deleteUser = async (req, res) => {
  try {
    const userId = req.params.id;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    // 1. If it's an Officer -> Delete Officer Profile
    if (user.role === 'officer') {
        await Officer.deleteOne({ user: userId });
    }

    // 2. If it's an Admin -> Remove from Department (don't delete dept, just unset admin)
    // Or if you strictly want to delete the Dept, keep your old logic. 
    // But usually, we just unassign the admin.
    if (user.role === 'dept_admin') {
        await Department.updateMany({ admin: userId }, { $unset: { admin: "" } });
    }

    // 3. Finally delete the User Login
    await User.findByIdAndDelete(userId);

    res.status(200).json({ success: true, message: "User deleted successfully" });

  } catch (error) {
    console.error("Delete Error:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// Keep existing utilities
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

export const getAllAuditLogs = async (req, res) => {
  try {
    const logs = await AuditLog.find()
      .populate("actor", "name email role")
      .sort({ timestamp: -1 })
      .limit(100);
    res.status(200).json({ success: true, data: logs });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

export const getAllDepartments = async (req, res) => {
  try {
    // FIX: Removed { isActive: true } because your schema doesn't have that field.
    // We just fetch ALL departments.
    const departments = await Department.find({}).select('name _id');
    
    res.status(200).json({ success: true, data: departments });
  } catch (error) {
    console.error("Fetch Depts Error:", error);
    res.status(500).json({ success: false, message: "Failed to load departments" });
  }
};