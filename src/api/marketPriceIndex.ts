import api from './index';

export interface MarketPriceIndex {
  id: number;
  province: string;
  district: string;
  propertyType: string;
  avgPricePerSqm: number;
  totalListings: number;
  monthYear: string;
  createdAt: string;
}

export const marketPriceIndexAPI = {
  getMarketPriceIndex: async (province?: string, propertyType?: string) => {
    const response = await api.get<MarketPriceIndex[]>('/market-price-index', {
      params: { province, propertyType },
    });
    return response.data;
  },

  getLatestIndices: async (propertyType?: string) => {
    const response = await api.get<MarketPriceIndex[]>('/market-price-index/latest', {
      params: { propertyType },
    });
    return response.data;
  },

  getAvailableProvinces: async () => {
    const response = await api.get<string[]>('/market-price-index/provinces');
    return response.data;
  },
};

