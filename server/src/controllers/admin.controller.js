// admin.controller.js
import User from '../models/User.model.js';
import Officer from '../models/Officer.model.js';
import AuditLog from '../models/AuditLog.model.js';
import Department from '../models/Department.model.js';
import Complaint from '../models/Complaint.model.js';

// @desc    Create a new Officer (User + Officer Profile)
// @route   POST /api/admin/create-officer
export const createOfficer = async (req, res) => {
  try {
    const { name, email, password, zones } = req.body;

    // 1. AUTO-DETECT DEPARTMENT
    const adminDept = await Department.findOne({ admin: req.user._id });

    if (!adminDept) {
      return res.status(403).json({ 
        success: false, 
        message: "You are not assigned to any Department, so you cannot create officers." 
      });
    }

    // 2. Check if email exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ success: false, message: 'User already exists' });
    }

    // 3. Create User Account
    const user = await User.create({
      name, 
      email, 
      password,
      role: 'officer',
      isActive: true,
      trustScore: 100
    });

    // 4. Create Officer Profile
    const officer = await Officer.create({
      user: user._id,
      department: adminDept._id,
      jurisdictionZones: zones || []
    });

    // 5. --- SYNC LOGIC: Auto-assign existing pending complaints to new officer ---
    const pendingComplaints = await Complaint.updateMany(
        { 
            department: adminDept._id, 
            zone: { $in: zones }, 
            $or: [{ assignedOfficer: null }, { status: 'submitted' }]
        },
        { 
            $set: { 
                assignedOfficer: user._id, 
                status: 'assigned' 
            }
        }
    );

    // 6. Log Action
    await AuditLog.create({
        action: 'OFFICER_CREATED',
        actor: req.user._id,
        targetId: officer._id,
        details: `Created officer ${name} for ${adminDept.name}. Synced ${pendingComplaints.modifiedCount} pending complaints.`,
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
    const adminDept = await Department.findOne({ admin: req.user._id });
    const filter = adminDept ? { department: adminDept._id } : {};

    const officers = await Officer.find(filter)
      .populate("user", "name email isActive"); 

    const formattedData = officers.map(doc => {
      if (!doc.user) return null;
      return {
        _id: doc.user._id,
        name: doc.user.name,
        email: doc.user.email,
        isActive: doc.user.isActive,
        zones: doc.jurisdictionZones, 
        department: doc.department
      };
    }).filter(Boolean);

    res.status(200).json({ success: true, data: formattedData });

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

    // 1. If Officer -> Unassign complaints so they go back to pool
    if (user.role === 'officer') {
        await Officer.deleteOne({ user: userId });
        
        // --- RESERVE INFO LOGIC: Unassign complaints ---
        await Complaint.updateMany(
            { assignedOfficer: userId },
            { 
                $unset: { assignedOfficer: "" },
                $set: { status: 'submitted' } // Reset to submitted so they can be picked up
            }
        );
    }

    // 2. If Admin -> Remove from Department
    if (user.role === 'dept_admin') {
        await Department.updateMany({ admin: userId }, { $unset: { admin: "" } });
    }

    // 3. Delete User Login
    await User.findByIdAndDelete(userId);

    res.status(200).json({ success: true, message: "User deleted and associated data synced." });

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
    const departments = await Department.find({}).select('name _id');
    res.status(200).json({ success: true, data: departments });
  } catch (error) {
    console.error("Fetch Depts Error:", error);
    res.status(500).json({ success: false, message: "Failed to load departments" });
  }
};