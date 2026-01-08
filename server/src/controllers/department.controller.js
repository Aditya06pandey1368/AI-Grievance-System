import Department from '../models/Department.model.js';

// @desc    Create a new Department (Super Admin Only)
// @route   POST /api/departments
export const createDepartment = async (req, res) => {
  try {
    const { name, code } = req.body;
    
    const dept = await Department.create({ name, code });
    
    res.status(201).json({ success: true, data: dept });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get All Departments (For Dropdowns)
export const getAllDepartments = async (req, res) => {
    try {
        const depts = await Department.find();
        res.json({ success: true, data: depts });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};