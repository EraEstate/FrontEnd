import api from './index';

export interface NeighborhoodReview {
  id: number;
  userId: string;
  province: string;
  district: string;
  ward?: string;
  overallRating: number;
  safetyRating: number;
  amenitiesRating: number;
  transportRating: number;
  comment?: string;
  likesCount: number;
  createdAt: string;
  user?: { id: string; fullName: string; avatar?: string };
}

export interface NeighborhoodReviewPayload {
  province: string;
  district: string;
  ward?: string;
  overallRating: number;
  safetyRating: number;
  amenitiesRating: number;
  transportRating: number;
  comment?: string;
}

export interface NeighborhoodReviewPage {
  content: NeighborhoodReview[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
}

export const neighborhoodReviewAPI = {
  getReviews: async (params: { province: string; district: string; page?: number; size?: number }) => {
    const response = await api.get<NeighborhoodReviewPage>('/neighborhood-reviews', { params });
    return response.data;
  },

  createReview: async (payload: NeighborhoodReviewPayload) => {
    const response = await api.post<NeighborhoodReview>('/neighborhood-reviews', payload);
    return response.data;
  },

  getAverageRatings: async (province: string, district: string) => {
    const response = await api.get<Record<string, number>>('/neighborhood-reviews/average', {
      params: { province, district },
    });
    return response.data;
  },

  likeReview: async (reviewId: number) => {
    await api.put(`/neighborhood-reviews/${reviewId}/like`);
  },
};

