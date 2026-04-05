import api from './index';

export const staffDashboardAPI = {
  /**
   * Lấy thống kê tổng hợp cho Staff Dashboard.
   * GET /api/staff/stats
   */
  getStats: async () => {
    const response = await api.get('/staff/stats');
    return response.data;
  },

  /**
   * Duyệt nhiều tin cùng lúc (tối đa 50).
   * PUT /api/staff/bulk-approve
   */
  bulkApprove: async (ids: string[]) => {
    const response = await api.put('/staff/bulk-approve', { ids });
    return response.data;
  },

  /**
   * Từ chối nhiều tin cùng lúc (tối đa 50).
   * PUT /api/staff/bulk-reject
   */
  bulkReject: async (ids: string[], reason: string) => {
    const response = await api.put('/staff/bulk-reject', { ids, reason });
    return response.data;
  },
};
