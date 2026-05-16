import api from './index';

export interface Badge {
  id: string;
  name: string;
  description: string;
  iconUrl?: string;
  criteria?: string;
  category: 'ACHIEVEMENT' | 'MILESTONE' | 'SPECIAL';
  isActive: boolean;
  createdAt: string;
}

export interface UserBadge {
  id: string;
  userId: string;
  badgeId: string;
  earnedAt: string;
  badge?: Badge;
}

export const badgeAPI = {
  getAllBadges: async (): Promise<Badge[]> => {
    const response = await api.get('/badges');
    return response.data;
  },

  getUserBadges: async (userId: string): Promise<UserBadge[]> => {
    const response = await api.get(`/users/${userId}/badges`);
    return response.data;
  },

  refreshMyBadges: async (): Promise<number> => {
    const response = await api.post('/badges/me/refresh');
    return response.data;
  },
};

