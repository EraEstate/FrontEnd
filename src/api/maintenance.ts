import api from './index';

export interface MaintenanceRequest {
  id: string;
  propertyId: string;
  propertyTitle?: string;
  tenantId: string;
  tenantName?: string;
  landlordId: string;
  landlordName?: string;
  title: string;
  description?: string;
  category: 'PLUMBING' | 'ELECTRICAL' | 'STRUCTURAL' | 'APPLIANCE' | 'OTHER';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  status: 'OPEN' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  images: string[];
  scheduledDate?: string;
  completedDate?: string;
  cost?: number;
  notes?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface CreateMaintenanceRequestPayload {
  propertyId: string;
  title: string;
  description?: string;
  category: string;
  priority: string;
  images?: string[];
}

export interface UpdateMaintenanceStatusPayload {
  status?: string;
  priority?: string;
  scheduledDate?: string;
  completedDate?: string;
  cost?: number;
  notes?: string;
}

export const maintenanceAPI = {
  create: async (payload: CreateMaintenanceRequestPayload) => {
    const response = await api.post<MaintenanceRequest>('/maintenance-requests', payload);
    return response.data;
  },

  updateStatus: async (id: string, payload: UpdateMaintenanceStatusPayload) => {
    const response = await api.put<MaintenanceRequest>(`/maintenance-requests/${id}/status`, payload);
    return response.data;
  },

  getMyRequests: async () => {
    const response = await api.get<MaintenanceRequest[]>('/maintenance-requests/my');
    return response.data;
  },

  getByProperty: async (propertyId: string) => {
    const response = await api.get<MaintenanceRequest[]>(`/maintenance-requests/property/${propertyId}`);
    return response.data;
  },
};
