import api from './index';
import type { UserSubscription } from '../types';

const subscriptionAPI = {
  // Lấy subscription hiện tại
  getCurrent: async (): Promise<UserSubscription | null> => {
    try {
      // Thử endpoint trong ListingPackageController trước
      const response = await api.get('/listing-packages/my-current');
      // Backend trả về 200 với null nếu không có subscription (bình thường)
      return response.data;
    } catch (error: any) {
      // Nếu lỗi, thử endpoint trong SubscriptionController
      try {
        const response = await api.get('/subscriptions/current');
        return response.data;
      } catch (e: any) {
        // Nếu cả 2 đều lỗi, log và return null
        console.warn('Failed to get subscription:', e);
        return null;
      }
    }
  },

  // Lấy tất cả subscription active
  getActive: async (): Promise<UserSubscription[]> => {
    const response = await api.get('/subscriptions/active');
    return response.data;
  },

  // Lấy lịch sử subscription
  getHistory: async (page = 0, size = 10) => {
    const response = await api.get('/subscriptions/history', {
      params: { page, size }
    });
    return response.data;
  },

  // Hủy subscription
  cancel: async (id: string): Promise<UserSubscription> => {
    const response = await api.put(`/subscriptions/${id}/cancel`);
    return response.data;
  }
};

export { subscriptionAPI };
