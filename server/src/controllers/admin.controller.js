import User from '../models/User.model.js';
import Officer from '../models/Officer.model.js';
import AuditLog from '../models/AuditLog.model.js';
import Department from '../models/Department.model.js';
import Complaint from '../models/Complaint.model.js';

// @desc    Create a new Officer (User + Officer Profile)
// @route   POST /api/admin/create-officer
export const createOfficer = async (req, res) => {
  try {
    const { name, email, password, mobile, zones } = req.body;

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
      mobile: mobile,
      jurisdictionZones: zones || []
    });

    // 5. --- SYNC LOGIC ---
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
        details: `Created officer ${name} (Mobile: ${mobile}). Synced ${pendingComplaints.modifiedCount} pending complaints.`,
        ipAddress: req.ip || '127.0.0.1'
    });

    res.status(201).json({ success: true, data: { user, officer } });

  } catch (error) {
    console.error("❌ CREATE OFFICER ERROR:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update Officer Details
// @route   PUT /api/admin/officers/:id
export const updateOfficer = async (req, res) => {
    try {
        const userId = req.params.id; // This is the User ID
        const { name, email, mobile, zones, password } = req.body;

        // 1. Update User Model
        const user = await User.findById(userId);
        if(!user) return res.status(404).json({ message: "User not found" });

        user.name = name || user.name;
        user.email = email || user.email;
        if(password && password.trim() !== "") {
            user.password = password; 
        }
        await user.save();

        // 2. Update Officer Model
        const officerUpdate = {};
        if (mobile) officerUpdate.mobile = mobile;
        if (zones) officerUpdate.jurisdictionZones = zones;

        const officer = await Officer.findOneAndUpdate(
            { user: userId },
            { $set: officerUpdate },
            { new: true }
        );

        // 3. Log
        await AuditLog.create({
            action: 'OFFICER_UPDATED',
            actor: req.user._id,
            targetId: officer._id,
            details: `Updated details for officer ${name}`
        });

        res.status(200).json({ success: true, message: "Officer updated successfully" });

    } catch (error) {
        console.error("Update Officer Error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Get ONLY Officers
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
        officerId: doc._id,
        name: doc.user.name,
        email: doc.user.email,
        isActive: doc.user.isActive,
        zones: doc.jurisdictionZones, 
        department: doc.department,
        officerProfile: { mobile: doc.mobile }
      };
    }).filter(Boolean);

    res.status(200).json({ success: true, data: formattedData });

  } catch (error) {
    console.error("Get Officers Error:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// @desc    Delete a User
export const deleteUser = async (req, res) => {
  try {
    const userId = req.params.id;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    if (user.role === 'officer') {
        await Officer.deleteOne({ user: userId });
        await Complaint.updateMany(
            { assignedOfficer: userId },
            { 
                $unset: { assignedOfficer: "" },
                $set: { status: 'submitted' } 
            }
        );
    }

    if (user.role === 'dept_admin') {
        await Department.updateMany({ admin: userId }, { $unset: { admin: "" } });
    }

    await User.findByIdAndDelete(userId);

    res.status(200).json({ success: true, message: "User deleted and associated data synced." });

  } catch (error) {
    console.error("Delete Error:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// ... (Keep existing utilities like getAllUsers, etc.)
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