import api from './index';

export interface RentalPaymentResponse {
  id: string;
  propertyId: string;
  propertyTitle: string;
  tenantId: string;
  tenantName: string;
  amount: number;
  dueDate: string;
  paymentDate: string;
  status: string;
  statusDisplayName: string;
  description: string;
  createdAt: string;
  updatedAt: string;
}

export interface RentalPaymentRequest {
  propertyId: string;
  tenantId?: string;
  amount: number;
  dueDate: string;
  description?: string;
}

export const rentalPaymentAPI = {
  createPayment: async (data: RentalPaymentRequest) => {
    const response = await api.post('/rental-payments', data);
    return response.data;
  },

  markAsPaid: async (id: string) => {
    const response = await api.put(`/rental-payments/${id}/pay`);
    return response.data;
  },

  deletePayment: async (id: string) => {
    const response = await api.delete(`/rental-payments/${id}`);
    return response.data;
  },

  getMyPropertyPayments: async (page = 0, size = 10) => {
    const response = await api.get('/rental-payments/landlord', {
      params: { page, size }
    });
    return response.data;
  },

  getMyTenantPayments: async (page = 0, size = 10) => {
    const response = await api.get('/rental-payments/tenant', {
      params: { page, size }
    });
    return response.data;
  },

  getPaymentsByProperty: async (propertyId: string, page = 0, size = 10) => {
    const response = await api.get(`/rental-payments/property/${propertyId}`, {
      params: { page, size }
    });
    return response.data;
  }
};
