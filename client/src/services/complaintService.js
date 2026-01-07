import api from './api';

export const createComplaint = async (formData) => {
  const response = await api.post('/complaints', formData, {
    headers: {
      'Content-Type': 'multipart/form-data', 
    },
  });
  return response.data;
};

export const getMyComplaints = async () => {
  const response = await api.get('/complaints/my-history');
  return response.data;
};
