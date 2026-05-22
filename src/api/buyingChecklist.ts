import api from './index';

export interface BuyingChecklist {
  id: string;
  userId: string;
  propertyId?: string;
  title: string;
  items: string;
  progress: number;
  createdAt: string;
  updatedAt?: string;
}

export interface BuyingChecklistPayload {
  propertyId?: string;
  title?: string;
  items?: string;
}

export const buyingChecklistAPI = {
  getAll: async () => {
    const response = await api.get<BuyingChecklist[]>('/buying-checklists');
    return response.data;
  },

  create: async (payload: BuyingChecklistPayload) => {
    const response = await api.post<BuyingChecklist>('/buying-checklists', payload);
    return response.data;
  },

  update: async (id: string, payload: BuyingChecklistPayload) => {
    const response = await api.put<BuyingChecklist>(`/buying-checklists/${id}`, payload);
    return response.data;
  },

  remove: async (id: string) => {
    await api.delete(`/buying-checklists/${id}`);
  },
};

