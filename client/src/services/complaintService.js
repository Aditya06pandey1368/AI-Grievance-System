import api from './api';

export const createComplaint = async (complaintData) => {
  const response = await api.post('/complaints', complaintData);
  return response.data;
};

export const getMyComplaints = async () => {
  const response = await api.get('/complaints/my-history');
  return response.data;
};