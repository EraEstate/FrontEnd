import { api } from './index';

export type PriceAlertType = 'PRICE_DROP' | 'PRICE_BELOW' | 'PRICE_ABOVE' | 'ANY_CHANGE';

export interface PriceAlert {
  id: string;
  userId: string;
  propertyId?: string;
  targetPrice?: number;
  alertType: PriceAlertType;
  propertyType?: string;
  listingType?: string;
  minArea?: number;
  maxArea?: number;
  provinceId?: string;
  districtId?: string;
  isActive: boolean;
  isTriggered: boolean;
  triggerCount?: number;
  triggeredAt?: string;
  createdAt: string;
  property?: {
    id: string;
    title: string;
    price: number;
  };
}

export interface CreatePriceAlertPayload {
  propertyId?: string;
  targetPrice?: number;
  alertType: PriceAlertType;
  propertyType?: string;
  listingType?: string;
  minArea?: number;
  maxArea?: number;
  provinceId?: string;
  districtId?: string;
  isActive?: boolean;
}

export const priceAlertAPI = {
  create: (payload: CreatePriceAlertPayload) =>
    api.post<PriceAlert>('/price-alerts', payload).then((res) => res.data),

  getMyAlerts: () =>
    api.get<PriceAlert[]>('/price-alerts/my').then((res) => res.data),

  deleteAlert: (id: string) =>
    api.delete(`/price-alerts/${id}`).then((res) => res.data),

  updateActive: (id: string, active: boolean) =>
    api.put<PriceAlert>(`/price-alerts/${id}/active`, null, { params: { active } }).then((res) => res.data),
};
