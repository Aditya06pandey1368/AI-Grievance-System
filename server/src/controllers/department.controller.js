import Department from '../models/Department.model.js';

// @desc    Create a new Department (Super Admin only)
// @route   POST /api/departments
export const createDepartment = async (req, res) => {
  try {
    const { name, code } = req.body;
    
    const dept = await Department.create({ name, code });
    res.status(201).json(dept);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all Departments
// @route   GET /api/departments
export const getDepartments = async (req, res) => {
  try {
    const depts = await Department.find();
    res.json(depts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};