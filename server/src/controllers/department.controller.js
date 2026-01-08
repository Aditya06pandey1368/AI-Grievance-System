import Department from '../models/Department.model.js';
import User from '../models/User.model.js';

// @desc    Create Department AND its Admin User
// @route   POST /api/departments
export const createDepartment = async (req, res) => {
  try {
    const { name, code, defaultSLAHours, adminName, adminEmail, adminPassword } = req.body;

    // 1. Check if Department Code exists
    const deptExists = await Department.findOne({ code });
    if (deptExists) {
        return res.status(400).json({ success: false, message: 'Department Code already exists' });
    }

    // 2. Check if Admin Email exists
    const userExists = await User.findOne({ email: adminEmail });
    if (userExists) {
        return res.status(400).json({ success: false, message: 'Admin email already exists' });
    }

    // 3. Create the Department Document first
    const newDept = await Department.create({
        name,
        code,
        defaultSLAHours: defaultSLAHours || 48
    });

    // 4. Create the Dept Admin User
    const newAdmin = await User.create({
        name: adminName,
        email: adminEmail,
        password: adminPassword, // Pre-save hook will hash this
        role: 'dept_admin',
        departmentId: newDept.code, // Linking by Code is easier for reference
        trustScore: 100
    });

    // 5. Link Admin ID back to Department (Optional but good for quick lookups)
    newDept.admin = newAdmin._id;
    await newDept.save();

    res.status(201).json({ 
        success: true, 
        message: `Department and Admin (${adminName}) created successfully!`,
        data: newDept 
    });

  } catch (error) {
    console.error("Create Dept Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Keep getAllDepartments as is...
export const getAllDepartments = async (req, res) => {
    try {
        const depts = await Department.find().populate('admin', 'name email');
        res.json({ success: true, data: depts });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};