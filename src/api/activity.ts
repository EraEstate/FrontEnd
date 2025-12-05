import api from './index';

export interface ActivityResponse {
  id: string;
  type: 'PROPERTY_VIEWED' | 'PROPERTY_FAVORITED' | 'PROPERTY_INQUIRY' | 'PROPERTY_POSTED' | 'PROPERTY_UPDATED';
  timestamp: string;
  title: string;
  description: string;
  propertyId: string;
  property?: {
    id: string;
    title: string;
    address?: string;
    mainImageUrl?: string;
    price?: number;
  };
  icon: string;
  color: string;
}

export interface ActivityPage {
  content: ActivityResponse[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}

export const activityAPI = {
  /**
   * Get user activities
   * @param page Page number (0-indexed)
   * @param size Page size
   * @param type Filter by activity type (VIEWED, FAVORITED, INQUIRY, POSTED, or ALL)
   */
  getUserActivities: async (
    page: number = 0,
    size: number = 20,
    type?: string
  ): Promise<ActivityPage> => {
    const params: any = { page, size };
    if (type) params.type = type;
    
    const response = await api.get<ActivityPage>('/activities', { params });
    return response.data;
  },
};

