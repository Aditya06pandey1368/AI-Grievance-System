import Department from '../models/Department.model.js';
import User from '../models/User.model.js';
import Officer from '../models/Officer.model.js';
import Complaint from '../models/Complaint.model.js';
import AuditLog from '../models/AuditLog.model.js'; 

// @desc    Create Department AND its Admin User
export const createDepartment = async (req, res) => {
  try {
    const { name, code, defaultSLAHours, adminName, adminEmail, adminPassword } = req.body;

    const deptExists = await Department.findOne({ code });
    if (deptExists) return res.status(400).json({ success: false, message: 'Department Code already exists' });

    const userExists = await User.findOne({ email: adminEmail });
    if (userExists) return res.status(400).json({ success: false, message: 'Admin email already exists' });

    // 1. Create Dept
    const newDept = await Department.create({
        name,
        code,
        defaultSLAHours: defaultSLAHours || 48
    });

    // 2. Create Admin
    const newAdmin = await User.create({
        name: adminName,
        email: adminEmail,
        password: adminPassword, 
        role: 'dept_admin',
        departmentId: newDept.code,
        trustScore: 100
    });

    newDept.admin = newAdmin._id;
    await newDept.save();

    // 3. AUDIT LOG (Detailed)
    await AuditLog.create({
        action: 'DEPT_CREATED',
        actor: req.user._id,
        targetId: newDept._id,
        details: `Actor: ${req.user.name} (${req.user._id}) created Department: ${name} (${newDept._id}) | Code: ${code} | Admin Assigned: ${adminName} (${newAdmin._id})`
    });

    res.status(201).json({ success: true, message: "Department Created Successfully", data: newDept });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get All Departments
export const getAllDepartments = async (req, res) => {
    try {
        const depts = await Department.find().populate('admin', 'name email _id');
        const data = await Promise.all(depts.map(async (dept) => {
            const officerCount = await Officer.countDocuments({ department: dept._id });
            const complaintCount = await Complaint.countDocuments({ department: dept._id });
            return { ...dept.toObject(), officerCount, complaintCount };
        }));
        res.json({ success: true, data });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update Department
export const updateDepartment = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, code, defaultSLAHours, adminName, adminEmail, adminPassword } = req.body;

        const dept = await Department.findById(id).populate('admin');
        if (!dept) return res.status(404).json({ message: "Department not found" });

        let changes = [];

        // Track Changes & Update Dept
        if (name && dept.name !== name) {
            changes.push(`Name: ${dept.name} -> ${name}`);
            dept.name = name;
        }
        if (code && dept.code !== code) {
            changes.push(`Code: ${dept.code} -> ${code}`);
            dept.code = code;
        }
        if (defaultSLAHours && dept.defaultSLAHours != defaultSLAHours) {
            changes.push(`SLA: ${dept.defaultSLAHours} -> ${defaultSLAHours}`);
            dept.defaultSLAHours = defaultSLAHours;
        }
        await dept.save();

        // Track Changes & Update Admin
        if (dept.admin) {
            const user = await User.findById(dept.admin._id);
            if (user) {
                if (adminName && user.name !== adminName) {
                    changes.push(`Admin Name: ${user.name} -> ${adminName}`);
                    user.name = adminName;
                }
                if (adminEmail && user.email !== adminEmail) {
                    changes.push(`Admin Email: ${user.email} -> ${adminEmail}`);
                    user.email = adminEmail;
                }
                if (adminPassword && adminPassword.trim() !== "") {
                    changes.push(`Admin Password Updated`);
                    user.password = adminPassword; 
                }
                await user.save();
            }
        }

        // AUDIT LOG (Detailed)
        if (changes.length > 0) {
            await AuditLog.create({
                action: 'DEPT_UPDATED',
                actor: req.user._id,
                targetId: dept._id,
                details: `Actor: ${req.user.name} (${req.user._id}) updated Dept: ${dept.name} (${dept._id}). Changes: ${changes.join(', ')}`
            });
        }

        res.json({ success: true, message: "Department Updated" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    DELETE Department
export const deleteDepartment = async (req, res) => {
    try {
        const { id } = req.params;
        const dept = await Department.findById(id);
        if (!dept) return res.status(404).json({ message: "Department not found" });

        const deptName = dept.name;
        const deptId = dept._id;

        // Cleanup Logic
        const deletedComplaints = await Complaint.deleteMany({ department: id });
        const officers = await Officer.find({ department: id });
        const officerUserIds = officers.map(o => o.user);
        
        await Officer.deleteMany({ department: id });
        const deletedOfficers = await User.deleteMany({ _id: { $in: officerUserIds } });
        
        let adminDeleted = false;
        if (dept.admin) {
            await User.findByIdAndDelete(dept.admin);
            adminDeleted = true;
        }
        
        await Department.findByIdAndDelete(id);

        // AUDIT LOG (Detailed)
        await AuditLog.create({
            action: 'DEPT_DELETED',
            actor: req.user._id,
            details: `Actor: ${req.user.name} (${req.user._id}) deleted Dept: ${deptName} (${deptId}). Cascade Delete: ${deletedComplaints.deletedCount} Complaints, ${deletedOfficers.deletedCount} Officers, Admin Deleted: ${adminDeleted}`
        });

        res.json({ success: true, message: "Department deleted." });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};