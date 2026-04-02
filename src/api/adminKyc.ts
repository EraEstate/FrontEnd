import api from './index';

export const adminKycAPI = {
  getAll: async (page = 0, size = 10, sortBy = 'createdAt', sortDir = 'desc') => {
    const response = await api.get('/admin/kyc', {
      params: { page, size, sortBy, sortDir }
    });
    return response.data;
  },

  approve: async (id: number) => {
    const response = await api.put(`/admin/kyc/${id}/approve`);
    return response.data;
  },

  reject: async (id: number) => {
    const response = await api.put(`/admin/kyc/${id}/reject`);
    return response.data;
  }
};
