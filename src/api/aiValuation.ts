import api from './index';
import type { ValuationReport } from './types';

export const aiValuationAPI = {
  getValuationReport: async (propertyId: string): Promise<ValuationReport> => {
    const response = await api.get<ValuationReport>(`/ai-valuation/generate/${propertyId}`);
    return response.data;
  }
};
