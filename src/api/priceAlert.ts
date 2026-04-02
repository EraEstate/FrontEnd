import { api } from './index';

export interface PriceAlert {
  id: string;
  userId: string;
  propertyId: string;
  targetPrice: number;
  alertType: 'PRICE_DROP' | 'PRICE_BELOW' | 'PRICE_ABOVE' | 'ANY_CHANGE';
  isActive: boolean;
  isTriggered: boolean;
  triggeredAt?: string;
  createdAt: string;
  property?: {
    id: string;
    title: string;
    price: number;
  };
}

export const priceAlertAPI = {
  create: (propertyId: string, targetPrice: number, alertType: string) =>
    api.post<PriceAlert>('/price-alerts', { propertyId, targetPrice, alertType }).then(res => res.data),

  getMyAlerts: () =>
    api.get<PriceAlert[]>('/price-alerts/my').then(res => res.data),

  deleteAlert: (id: string) =>
    api.delete(`/price-alerts/${id}`).then(res => res.data),
};
