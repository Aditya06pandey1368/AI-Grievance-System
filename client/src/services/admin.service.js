import api from './api';

// Create Officer (Super Admin / Dept Admin)
export const createOfficer = async (officerData) => {
  // officerData = { name, email, password, departmentId, zones: [...] }
  const response = await api.post('/admin/create-officer', officerData);
  return response.data;
};

// Get All Users (For Fraud Monitor)
export const getAllUsers = async () => {
  const response = await api.get('/admin/users');
  return response.data;
};

// Ban or Activate User
export const updateUserStatus = async (userId, isActive) => {
  const response = await api.put(`/admin/users/${userId}/status`, { isActive });
  return response.data;
};

// Create Department (Super Admin)
export const createDepartment = async (deptData) => {
  const response = await api.post('/departments', deptData);
  return response.data;
};

const adminService = {
  createOfficer,
  getAllUsers,
  updateUserStatus,
  createDepartment
};

export default adminService;