import api from './index';

export interface TimeSlot {
  startTime: string; // "09:00"
  endTime: string;   // "10:00"
  available: boolean;
}

export interface PropertyViewingData {
  id: string;
  propertyId: string;
  viewerId: string;
  ownerId: string;
  viewingDate: string;
  startTime: string;
  endTime: string;
  status: 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED';
  note?: string;
  cancellationReason?: string;
  reminderSent: boolean;
  createdAt: string;
  property?: {
    id: number;
    title: string;
    address: string;
    propertyImages?: { imageUrl: string }[];
  };
  viewer?: {
    id: string;
    fullName: string;
    email: string;
    phone?: string;
  };
  owner?: {
    id: string;
    fullName: string;
    email: string;
    phone?: string;
  };
}

export interface OwnerAvailabilitySlot {
  id?: string;
  ownerId?: string;
  dayOfWeek: string; // "MONDAY" | "TUESDAY" | ...
  startTime: string; // "09:00"
  endTime: string;   // "18:00"
  isActive: boolean;
}

export const propertyViewingAPI = {
  /** Get available time slots for a property on a date */
  getAvailableSlots: async (propertyId: string, date: string): Promise<TimeSlot[]> => {
    const response = await api.get('/property-viewings/available-slots', {
      params: { propertyId, date },
    });
    return response.data;
  },

  /** Create a new viewing appointment */
  createViewing: async (data: {
    propertyId: string;
    date: string;
    startTime: string;
    note?: string;
  }): Promise<PropertyViewingData> => {
    const response = await api.post('/property-viewings', data);
    return response.data;
  },

  /** Confirm a viewing (owner) */
  confirmViewing: async (id: string): Promise<PropertyViewingData> => {
    const response = await api.put(`/property-viewings/${id}/confirm`);
    return response.data;
  },

  /** Cancel a viewing */
  cancelViewing: async (id: string, reason?: string): Promise<PropertyViewingData> => {
    const response = await api.put(`/property-viewings/${id}/cancel`, { reason });
    return response.data;
  },

  /** Get my viewings (as viewer or owner) */
  getMyViewings: async (): Promise<PropertyViewingData[]> => {
    const response = await api.get('/property-viewings/my');
    return response.data;
  },

  /** Get viewings for a property */
  getPropertyViewings: async (propertyId: string): Promise<PropertyViewingData[]> => {
    const response = await api.get(`/property-viewings/property/${propertyId}`);
    return response.data;
  },

  /** Get current user's availability settings */
  getOwnerAvailability: async (): Promise<OwnerAvailabilitySlot[]> => {
    const response = await api.get('/property-viewings/owner-availability');
    return response.data;
  },

  /** Get a specific owner's availability (public) */
  getOwnerAvailabilityById: async (ownerId: string): Promise<OwnerAvailabilitySlot[]> => {
    const response = await api.get(`/property-viewings/owner-availability/${ownerId}`);
    return response.data;
  },

  /** Update current user's availability */
  updateOwnerAvailability: async (slots: OwnerAvailabilitySlot[]): Promise<OwnerAvailabilitySlot[]> => {
    const response = await api.put('/property-viewings/owner-availability', slots);
    return response.data;
  },
};
