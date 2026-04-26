import api from './index';

export interface AgentReview {
    id: number;
    agentId: string;
    reviewerId: string;
    professionalRating: number;
    responsivenessRating: number;
    marketKnowledgeRating: number;
    averageRating: number;
    comment: string;
    createdAt: string;
}

export interface AgentReviewCreateRequest {
    agentId: string;
    professionalRating: number;
    responsivenessRating: number;
    marketKnowledgeRating: number;
    comment: string;
}

export const agentReviewApi = {
    createReview: (data: AgentReviewCreateRequest) => {
        return api.post('/agent-reviews', data);
    },
    getAgentReviews: (agentUserId: string) => {
        return api.get<AgentReview[]>(`/agent-reviews/agent/${agentUserId}`);
    }
};
