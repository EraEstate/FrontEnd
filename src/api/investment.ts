import api from './index';

export interface InvestmentCalculationRequest {
  purchasePrice: number;
  initialCosts: number;
  monthlyRentIncome: number;
  monthlyExpenses: number;
  annualAppreciationRate: number;
  annualInflationRate: number;
  holdingYears: number;
  discountRate: number;
}

export interface YearlyCashFlow {
  year: number;
  netCashFlow: number;
  cumulativeCashFlow: number;
}

export interface InvestmentCalculationResponse {
  totalInvestment: number;
  totalNetCashFlow: number;
  estimatedSaleValue: number;
  netProfit: number;
  roiPercent: number;
  irrPercent: number;
  npv: number;
  paybackYears: number;
  marketBenchmarkPercent: number;
  yearlyCashFlows: YearlyCashFlow[];
}

export const investmentAPI = {
  calculate: async (payload: InvestmentCalculationRequest) => {
    const response = await api.post<InvestmentCalculationResponse>('/investment/calculate', payload);
    return response.data;
  },
};
