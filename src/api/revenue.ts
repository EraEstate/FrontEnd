import api from './index';

export interface RevenueSummary {
  totalRevenue: number;
  totalPaidRevenue: number;
  totalOverdueAmount: number;
  paidInvoices: number;
  overdueInvoices: number;
  pendingInvoices: number;
}

export interface PropertyRevenueBreakdown {
  propertyId: string;
  propertyTitle: string;
  revenue: number;
  paidInvoices: number;
  overdueInvoices: number;
  pendingInvoices: number;
}

export interface MonthlyRevenueChartItem {
  month: string;
  revenue: number;
  paidInvoices: number;
}

export interface RevenueDateFilter {
  from?: string;
  to?: string;
}

export const revenueAPI = {
  getSummary: async (filter?: RevenueDateFilter) => {
    const response = await api.get<RevenueSummary>('/revenue/summary', { params: filter });
    return response.data;
  },

  getByProperty: async (filter?: RevenueDateFilter) => {
    const response = await api.get<PropertyRevenueBreakdown[]>('/revenue/by-property', { params: filter });
    return response.data;
  },

  getMonthlyChart: async (months = 12) => {
    const response = await api.get<MonthlyRevenueChartItem[]>('/revenue/monthly-chart', {
      params: { months },
    });
    return response.data;
  },

  exportCsv: async (filter?: RevenueDateFilter) => {
    const response = await api.get<Blob>('/revenue/export', {
      params: filter,
      responseType: 'blob',
    });
    return response.data;
  },
};
