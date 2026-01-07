import api from './api';

// Citizen: Submit new complaint (Multipart for Images)
export const createComplaint = async (formData) => {
  const response = await api.post('/complaints', formData, {
    headers: {
      'Content-Type': 'multipart/form-data', 
    },
  });
  return response.data;
};

// Citizen/Officer: Get list of complaints
export const getMyComplaints = async () => {
  const response = await api.get('/complaints/my-history');
  return response.data; // Returns { success: true, data: [...] }
};

// Common: Get Single Complaint Details
export const getComplaintById = async (id) => {
  const response = await api.get(`/complaints/${id}`); // Assuming you have a GET /:id route in backend
  return response.data;
};

// Officer: Update Status
export const updateComplaintStatus = async (id, status, remarks) => {
  const response = await api.put(`/complaints/${id}/status`, { status, remarks });
  return response.data;
};

const complaintService = {
  createComplaint,
  getMyComplaints,
  getComplaintById,
  updateComplaintStatus
};

export default complaintService;