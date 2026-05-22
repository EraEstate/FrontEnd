import api from './index';
import type { InvestmentCalculationRequest, InvestmentCalculationResponse } from './types';

export const investmentAPI = {
  calculate: async (data: InvestmentCalculationRequest): Promise<InvestmentCalculationResponse> => {
    const response = await api.post<InvestmentCalculationResponse>('/api/investment/calculate', data);
    return response.data;
  }
};
