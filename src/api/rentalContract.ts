import api from './index';

export interface RentalContract {
  id: string;
  propertyId: string;
  propertyTitle?: string;
  landlordId: string;
  landlordName?: string;
  tenantId: string;
  tenantName?: string;
  startDate: string;
  endDate: string;
  monthlyRent: number;
  deposit?: number;
  terms?: string;
  status: 'DRAFT' | 'ACTIVE' | 'EXPIRED' | 'TERMINATED';
  signedByLandlord: boolean;
  signedByTenant: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface CreateRentalContractPayload {
  propertyId: string;
  tenantId: string;
  startDate: string;
  endDate: string;
  monthlyRent: number;
  deposit?: number;
  terms?: string;
}

export interface RenewRentalContractPayload {
  endDate?: string;
  monthlyRent?: number;
  terms?: string;
}

export const rentalContractAPI = {
  createContract: async (payload: CreateRentalContractPayload) => {
    const response = await api.post<RentalContract>('/rental-contracts', payload);
    return response.data;
  },

  signContract: async (id: string) => {
    const response = await api.put<RentalContract>(`/rental-contracts/${id}/sign`);
    return response.data;
  },

  terminateContract: async (id: string) => {
    const response = await api.put<RentalContract>(`/rental-contracts/${id}/terminate`);
    return response.data;
  },

  renewContract: async (id: string, payload: RenewRentalContractPayload) => {
    const response = await api.put<RentalContract>(`/rental-contracts/${id}/renew`, payload);
    return response.data;
  },

  getMyContracts: async (status?: string) => {
    const response = await api.get<RentalContract[]>('/rental-contracts/my-contracts', {
      params: status ? { status } : undefined,
    });
    return response.data;
  },

  getById: async (id: string) => {
    const response = await api.get<RentalContract>(`/rental-contracts/${id}`);
    return response.data;
  },
};
