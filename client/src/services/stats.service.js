import api from './api';

// Get Dashboard Analytics (Counts, Charts data)
export const getDashboardStats = async () => {
  const response = await api.get('/stats/dashboard');
  return response.data;
};

const statsService = {
  getDashboardStats
};

export default statsService;