import axiosInstance from './index';

export interface KycSubmitRequest {
  userId: string;
  cccdNumber: string;
  fullName: string;
  dateOfBirth?: string; // yyyy-MM-dd
  gender?: string;
  nationality?: string;
  placeOfOrigin?: string;
  placeOfResidence?: string;
  expiryDate?: string;
  frontImageUrl?: string;
  rawOcrText?: string;
}

export interface KycVerification {
  id: number;
  userId: string;
  cccdNumber: string;
  fullName: string;
  dateOfBirth: string | null;
  gender: string | null;
  nationality: string | null;
  placeOfOrigin: string | null;
  placeOfResidence: string | null;
  expiryDate: string | null;
  status: 'PENDING' | 'VERIFIED' | 'REJECTED';
  frontImageUrl: string | null;
  createdAt: string;
  updatedAt: string;
}

export const kycAPI = {
  submit: async (data: KycSubmitRequest): Promise<KycVerification> => {
    const response = await axiosInstance.post('/kyc/submit', data);
    return response.data;
  },

  getStatus: async (userId: string): Promise<KycVerification | { status: 'NOT_SUBMITTED'; verified: false }> => {
    const response = await axiosInstance.get(`/kyc/status/${userId}`);
    return response.data;
  },

  isVerified: async (userId: string): Promise<boolean> => {
    const response = await axiosInstance.get(`/kyc/verified/${userId}`);
    return response.data.verified;
  },
};
