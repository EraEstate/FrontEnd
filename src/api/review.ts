import { api } from './index';

export interface ReviewData {
  rating: number;
  title?: string;
  content?: string;
  reviewType?: string;
  locationRating?: number;
  valueRating?: number;
  conditionRating?: number;
  isAnonymous?: boolean;
}

export interface Review {
  id: string;
  propertyId: string;
  userId: string;
  rating: number;
  title?: string;
  content?: string;
  reviewType?: string;
  locationRating?: number;
  valueRating?: number;
  conditionRating?: number;
  isVerified?: boolean;
  isAnonymous?: boolean;
  status: string;
  helpfulCount: number;
  createdAt: string;
  user?: {
    id: string;
    fullName: string;
    avatarUrl?: string;
  };
}

export interface ReviewStats {
  averageRating: number;
  totalReviews: number;
  distribution: Record<number, number>;
}

export const reviewAPI = {
  getReviews: (propertyId: string, page = 0, size = 10) =>
    api.get<{ content: Review[]; totalPages: number; totalElements: number }>(
      `/properties/${propertyId}/reviews`, { params: { page, size } }
    ).then(res => res.data),

  getStats: (propertyId: string) =>
    api.get<ReviewStats>(`/properties/${propertyId}/reviews/stats`).then(res => res.data),

  createReview: (propertyId: string, data: ReviewData) =>
    api.post<Review>(`/properties/${propertyId}/reviews`, data).then(res => res.data),

  checkReviewed: (propertyId: string) =>
    api.get<{ hasReviewed: boolean }>(`/properties/${propertyId}/reviews/check`).then(res => res.data),

  deleteReview: (reviewId: string) =>
    api.delete(`/reviews/${reviewId}`).then(res => res.data),
};
