import { api } from './index';

export interface ListingAnalysis {
  score: number;
  grade: string;
  issues: string[];
  suggestions: string[];
}

export interface ModerationResult {
  decision: 'APPROVED' | 'FLAGGED' | 'REJECTED';
  flags: string[];
}

export interface PriceEstimation {
  status: string;
  estimatedPrice?: number;
  estimatedMin?: number;
  estimatedMax?: number;
  avgPricePerM2?: number;
  priceAssessment?: string;
  note?: string;
  sampleSize: number;
}

export interface FullAnalysis {
  propertyId: string;
  analyzedAt: string;
  quality: ListingAnalysis;
  moderation: ModerationResult;
  priceEstimation: PriceEstimation;
}

export const aiAgentAPI = {
  analyzeQuality: async (propertyId: string): Promise<ListingAnalysis> => {
    const res = await api.get(`/ai-agent/analyze/${propertyId}`);
    return res.data;
  },

  moderate: async (propertyId: string): Promise<ModerationResult> => {
    const res = await api.get(`/ai-agent/moderate/${propertyId}`);
    return res.data;
  },

  estimatePrice: async (propertyId: string): Promise<PriceEstimation> => {
    const res = await api.get(`/ai-agent/price-estimate/${propertyId}`);
    return res.data;
  },

  suggest: async (propertyId: string): Promise<{ suggestion: string }> => {
    const res = await api.get(`/ai-agent/suggest/${propertyId}`);
    return res.data;
  },

  fullAnalysis: async (propertyId: string): Promise<FullAnalysis> => {
    const res = await api.get(`/ai-agent/full-analysis/${propertyId}`);
    return res.data;
  },
};
