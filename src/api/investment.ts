import api from './index';
import type { InvestmentCalculationRequest, InvestmentCalculationResponse } from './types';

export const investmentAPI = {
  calculate: async (data: InvestmentCalculationRequest): Promise<InvestmentCalculationResponse> => {
    const response = await api.post<InvestmentCalculationResponse>('/investment/calculate', data);
    return response.data;
  }
};
