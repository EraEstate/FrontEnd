import axiosInstance from './index';

export interface AnalyticsKPIs {
  totalViews: number;
  totalFavorites: number;
  totalInquiries: number;
  conversionRate: number;
}

export interface DailyStat {
  date: string;
  views: number;
  favorites: number;
  inquiries: number;
}

export interface PropertyStat {
  propertyId: string;
  title: string;
  status: string;
  views: number;
  favorites: number;
  inquiries: number;
}

export interface LandlordAnalyticsResponse {
  kpis: AnalyticsKPIs;
  dailyStats: DailyStat[];
  topProperties: PropertyStat[];
}

export const analyticsAPI = {
  getLandlordAnalytics: async (days: number = 30): Promise<LandlordAnalyticsResponse> => {
    const response = await axiosInstance.get(`/analytics/landlord`, {
      params: { range: days }
    });
    return response.data;
  }
};
