import api from './index';
import type { EnvironmentalQualityResponse } from './types';

export const environmentalAPI = {
  getQuality: async (propertyId: string): Promise<EnvironmentalQualityResponse> => {
    const response = await api.get<EnvironmentalQualityResponse>('/api/environmental/quality', {
      params: { propertyId }
    });
    return response.data;
  }
};
