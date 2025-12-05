import api from './index';

// Notification API - Dựa trên NotificationController
export const notificationAPI = {
  // Lấy notifications của user hiện tại
  getUserNotifications: async (page = 0, size = 20) => {
    const response = await api.get('/notifications', {
      params: { page, size }
    });
    return response.data;
  },

  // Lấy notifications chưa đọc
  getUnread: async (page = 0, size = 20) => {
    const response = await api.get('/notifications/unread', {
      params: { page, size }
    });
    return response.data;
  },

  // Đếm notifications chưa đọc
  countUnread: async () => {
    const response = await api.get('/notifications/unread/count');
    return response.data;
  },

  // Tạo notification mới (Admin)
  create: async (notificationData: {
    userId: string;
    title: string;
    message: string;
    type: string;
  }) => {
    const response = await api.post('/notifications', null, {
      params: notificationData
    });
    return response.data;
  },

  // Đánh dấu đã đọc
  markAsRead: async (id: string) => {
    const response = await api.put(`/notifications/${id}/read`);
    return response.data;
  },

  // Đánh dấu tất cả đã đọc
  markAllAsRead: async () => {
    const response = await api.put('/notifications/read-all');
    return response.data;
  },

  // Xóa notification
  delete: async (id: string) => {
    const response = await api.delete(`/notifications/${id}`);
    return response.data;
  },

  // Gửi notification cho một user (Admin only)
  sendToUser: async (userData: {
    userId: string;
    title: string;
    message: string;
    type: string;
  }) => {
    const response = await api.post('/notifications/send-to-user', null, {
      params: userData
    });
    return response.data;
  },

  // Gửi notification broadcast cho tất cả users (Admin only)
  broadcast: async (broadcastData: {
    title: string;
    message: string;
    type: string;
  }) => {
    const response = await api.post('/notifications/broadcast', null, {
      params: broadcastData
    });
    return response.data;
  },

  // Legacy methods for backward compatibility
  getMyNotifications: async (page = 0, size = 20) => {
    return notificationAPI.getUserNotifications(page, size);
  },

  // Lấy notification settings (custom implementation)
  getSettings: async () => {
    const response = await api.get('/notifications/settings');
    return response.data;
  },

  // Cập nhật notification settings (custom implementation)
  updateSettings: async (settings: {
    emailNotifications?: boolean;
    pushNotifications?: boolean;
    smsNotifications?: boolean;
    marketingEmails?: boolean;
  }) => {
    const response = await api.put('/notifications/settings', settings);
    return response.data;
  },
};

// Payment API - Dựa trên PaymentController
export const paymentAPI = {
  // Tạo payment
  create: async (paymentData: {
    amount: number;
    currency?: string;
    description?: string;
    propertyId?: string;
    packageId?: string;
    paymentMethod: string;
  }) => {
    const response = await api.post('/payments', paymentData);
    return response.data;
  },

  // Lấy payment theo ID
  getById: async (id: string) => {
    const response = await api.get(`/payments/${id}`);
    return response.data;
  },

  // Lấy payments của user
  getMyPayments: async (page = 0, size = 10) => {
    const response = await api.get('/payments/my', {
      params: { page, size }
    });
    return response.data;
  },

  // Lấy tất cả payments (Admin)
  getAll: async (page = 0, size = 10) => {
    const response = await api.get('/payments', {
      params: { page, size }
    });
    return response.data;
  },

  // Verify payment
  verify: async (id: string, verificationData: any) => {
    const response = await api.post(`/payments/${id}/verify`, verificationData);
    return response.data;
  },

  // Cancel payment
  cancel: async (id: string, reason?: string) => {
    const response = await api.post(`/payments/${id}/cancel`, { reason });
    return response.data;
  },

  // Refund payment
  refund: async (id: string, amount?: number, reason?: string) => {
    const response = await api.post(`/payments/${id}/refund`, {
      amount,
      reason
    });
    return response.data;
  },

  // Lấy payment methods
  getPaymentMethods: async () => {
    const response = await api.get('/payments/methods');
    return response.data;
  },

  // Lấy payment statistics (Admin)
  getStatistics: async (startDate?: string, endDate?: string) => {
    const response = await api.get('/payments/statistics', {
      params: { startDate, endDate }
    });
    return response.data;
  },

  // ========== ENDPOINTS MỚI BỔ SUNG - BE ==========
  
  // Lấy payments của một user cụ thể (Admin/BE endpoint)
  getUserPayments: async (page = 0, size = 10) => {
    const response = await api.get('/payments/user', {
      params: { page, size }
    });
    return response.data;
  },

  // Lấy payments theo status (Admin/BE endpoint)
  getByStatus: async (status: 'PENDING' | 'COMPLETED' | 'FAILED' | 'REFUNDED' | 'CANCELLED', page = 0, size = 10) => {
    const response = await api.get(`/payments/status/${status}`, {
      params: { page, size }
    });
    return response.data;
  },

  // Xử lý payment (Admin/BE endpoint)
  processPayment: async (id: string, processData?: any) => {
    const response = await api.put(`/payments/${id}/process`, processData);
    return response.data;
  },

  // Lấy tổng doanh thu (Admin/BE endpoint)
  getTotalRevenue: async (startDate?: string, endDate?: string) => {
    const response = await api.get('/payments/revenue/total', {
      params: { startDate, endDate }
    });
    return response.data;
  },
};

// Listing Package API - Dựa trên ListingPackageController
export const listingPackageAPI = {
  // Lấy tất cả packages
  getAll: async () => {
    const response = await api.get('/listing-packages');
    return response.data;
  },

  // Lấy package theo ID
  getById: async (id: string) => {
    const response = await api.get(`/listing-packages/${id}`);
    return response.data;
  },

  // Tạo package mới (Admin)
  create: async (packageData: {
    name: string;
    description: string;
    price: number;
    duration: number;
    features: string[];
    maxProperties?: number;
    priority?: number;
  }) => {
    const response = await api.post('/listing-packages', packageData);
    return response.data;
  },

  // Cập nhật package (Admin)
  update: async (id: string, packageData: any) => {
    const response = await api.put(`/listing-packages/${id}`, packageData);
    return response.data;
  },

  // Xóa package (Admin)
  delete: async (id: string) => {
    const response = await api.delete(`/listing-packages/${id}`);
    return response.data;
  },

  // Purchase package
  purchase: async (packageId: string, paymentMethod: string) => {
    const response = await api.post(`/listing-packages/${packageId}/purchase`, {
      paymentMethod
    });
    return response.data;
  },

  // Lấy active packages của user
  getMyActivePackages: async () => {
    const response = await api.get('/listing-packages/my-active');
    return response.data;
  },

  // Lấy package history của user
  getMyPackageHistory: async (page = 0, size = 10) => {
    const response = await api.get('/listing-packages/my-history', {
      params: { page, size }
    });
    return response.data;
  },

  // ========== ENDPOINTS MỚI BỔ SUNG - BE ==========

  // Lấy active packages
  getActivePackages: async () => {
    const response = await api.get('/listing-packages/active');
    return response.data;
  },

  // Lấy active packages sắp xếp theo giá
  getActivePackagesSortedByPrice: async (ascending = true) => {
    const response = await api.get('/listing-packages/active/sorted', {
      params: { ascending }
    });
    return response.data;
  },

  // Lấy packages giá rẻ (affordable)
  getAffordablePackages: async (maxPrice: number) => {
    const response = await api.get('/listing-packages/affordable', {
      params: { maxPrice }
    });
    return response.data;
  },

  // Lấy packages theo số property tối thiểu
  getPackagesByMinProperties: async (minProperties: number) => {
    const response = await api.get('/listing-packages/by-properties', {
      params: { minProperties }
    });
    return response.data;
  },

  // Lấy package theo tên
  getActivePackageByName: async (name: string) => {
    const response = await api.get(`/listing-packages/name/${name}`);
    return response.data;
  },

  // Deactivate package (Admin)
  deactivate: async (id: string) => {
    const response = await api.put(`/listing-packages/${id}/deactivate`);
    return response.data;
  },

  // Activate package (Admin)
  activate: async (id: string) => {
    const response = await api.put(`/listing-packages/${id}/activate`);
    return response.data;
  },

  // Đếm số active packages
  countActivePackages: async () => {
    const response = await api.get('/listing-packages/count');
    return response.data;
  },

  // Lấy package rẻ nhất
  getCheapestPackage: async () => {
    const response = await api.get('/listing-packages/cheapest');
    return response.data;
  },

  // Kiểm tra package có active không
  isPackageActive: async (id: string) => {
    const response = await api.get(`/listing-packages/${id}/active`);
    return response.data;
  },
};

// Combined API for convenience
export const miscAPI = {
  // Notifications
  ...notificationAPI,
  // Payments
  ...paymentAPI,
  // Listing Packages
  ...listingPackageAPI
};