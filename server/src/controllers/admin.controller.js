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

    // 6. Log Action (Detailed)
    await AuditLog.create({
        action: 'OFFICER_CREATED',
        actor: req.user._id,
        targetId: officer._id,
        details: `Actor: ${req.user.name} (${req.user._id}) created Officer: ${name} (${user._id}). Dept: ${adminDept.name} (${adminDept._id}). Auto-assigned ${pendingComplaints.modifiedCount} complaints.`,
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
        const userId = req.params.id; // User ID
        const { name, email, mobile, zones, password } = req.body;

        // 1. Fetch Current State for Comparison
        const user = await User.findById(userId);
        const officer = await Officer.findOne({ user: userId });

        if(!user || !officer) return res.status(404).json({ message: "Officer not found" });

        let changes = [];

        // 2. Update User Model & Track Changes
        if (name && user.name !== name) {
            changes.push(`Name: ${user.name} -> ${name}`);
            user.name = name;
        }
        if (email && user.email !== email) {
            changes.push(`Email: ${user.email} -> ${email}`);
            user.email = email;
        }
        if (password && password.trim() !== "") {
            changes.push(`Password updated`);
            user.password = password; 
        }
        await user.save();

        // 3. Update Officer Model & Track Changes
        if (mobile && officer.mobile !== mobile) {
            changes.push(`Mobile: ${officer.mobile} -> ${mobile}`);
            officer.mobile = mobile;
        }
        
        // Compare Zones (Array comparison)
        const oldZones = JSON.stringify(officer.jurisdictionZones.sort());
        const newZonesInput = zones ? zones : officer.jurisdictionZones;
        const newZonesSorted = JSON.stringify(newZonesInput.sort());
        
        if (zones && oldZones !== newZonesSorted) {
            changes.push(`Zones: [${officer.jurisdictionZones.join(', ')}] -> [${zones.join(', ')}]`);
            officer.jurisdictionZones = zones;
        }
        
        await officer.save();

        // 4. Detailed Audit Log
        if (changes.length > 0) {
            await AuditLog.create({
                action: 'OFFICER_UPDATED',
                actor: req.user._id,
                targetId: officer._id,
                details: `Actor: ${req.user.name} (${req.user._id}) updated Officer: ${user.name} (${user._id}). Changes: ${changes.join(', ')}`
            });
        }

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
// @route   DELETE /api/admin/users/:id
export const deleteUser = async (req, res) => {
  try {
    const userId = req.params.id;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    let auditDetails = `Actor: ${req.user.name} (${req.user._id}) deleted User: ${user.name} (${user._id}) Role: ${user.role}`;

    // 1. Handle Officer Deletion
    if (user.role === 'officer') {
        const officerProfile = await Officer.findOne({ user: userId }).populate('department');
        if (officerProfile) {
            auditDetails += ` | Officer Profile: ${officerProfile._id} | Dept: ${officerProfile.department?.name}`;
            await Officer.deleteOne({ _id: officerProfile._id });
        }

        const result = await Complaint.updateMany(
            { assignedOfficer: userId },
            { 
                $unset: { assignedOfficer: "" },
                $set: { status: 'submitted' } 
            }
        );
        auditDetails += ` | Unassigned ${result.modifiedCount} complaints.`;
    }

    // 2. Handle Admin Deletion
    if (user.role === 'dept_admin') {
        const dept = await Department.findOne({ admin: userId });
        if (dept) {
            auditDetails += ` | Removed from Dept: ${dept.name} (${dept._id})`;
            await Department.updateOne({ _id: dept._id }, { $unset: { admin: "" } });
        }
    }

    await User.findByIdAndDelete(userId);

    // 3. Log
    await AuditLog.create({
        action: 'USER_DELETED',
        actor: req.user._id,
        targetId: userId, // The deleted user's ID
        details: auditDetails,
        ipAddress: req.ip || '127.0.0.1'
    });

    res.status(200).json({ success: true, message: "User deleted and associated data synced." });

  } catch (error) {
    console.error("Delete Error:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// ... Utilities (No changes to logic, just context)
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
    
    // UPDATED LOGIC: Readable Action
    const actionVerb = isActive ? "unbanned" : "banned";
    
    await AuditLog.create({
        action: isActive ? 'USER_UNBANNED' : 'USER_BANNED',
        actor: req.user._id,
        targetId: user._id,
        // "Super admin banned Rahul (ID)"
        details: `${req.user.name} ${actionVerb} ${user.name} (${user._id})`
    });

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