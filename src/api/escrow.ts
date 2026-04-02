import axiosInstance from './index';

export interface EscrowLogRequest {
  txHash: string;
  propertyId: number;
  buyerAddress: string;
  sellerAddress: string;
  amount: number;
  status: 'PENDING' | 'LOCKED' | 'RELEASED' | 'REFUNDED';
}

export interface EscrowUpdateRequest {
  txHash: string;
  status: 'PENDING' | 'LOCKED' | 'RELEASED' | 'REFUNDED';
}

export interface EscrowTransaction {
  id: number;
  transactionHash: string;
  propertyId: number;
  buyerAddress: string;
  sellerAddress: string;
  amount: number;
  status: 'PENDING' | 'LOCKED' | 'RELEASED' | 'REFUNDED';
  createdAt: string;
  updatedAt: string;
}

export const escrowAPI = {
  logTransaction: async (data: EscrowLogRequest): Promise<EscrowTransaction> => {
    const response = await axiosInstance.post('/escrow/log', data);
    return response.data;
  },

  updateTransaction: async (data: EscrowUpdateRequest): Promise<EscrowTransaction> => {
    const response = await axiosInstance.put('/escrow/update', data);
    return response.data;
  },

  getUserTransactions: async (address: string): Promise<EscrowTransaction[]> => {
    const response = await axiosInstance.get(`/escrow/user/${address}`);
    return response.data;
  },
};
