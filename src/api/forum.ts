import api from './index';
import type { ForumComment, ForumPost, PageResponse } from './types';

export interface ForumPostPayload {
  title: string;
  content: string;
  category: 'AREA_DISCUSS' | 'PROJECT_REVIEW' | 'EXPERIENCE' | 'QUESTION';
  tags?: string[];
}

export interface ForumCommentPayload {
  content: string;
  parentCommentId?: string;
}

export interface ForumPostQuery {
  category?: ForumPostPayload['category'];
  tag?: string;
  keyword?: string;
  page?: number;
  size?: number;
  sort?: 'recent' | 'trending';
}

export const forumAPI = {
  getPosts: async (params?: ForumPostQuery): Promise<PageResponse<ForumPost>> => {
    const response = await api.get('/forum/posts', { params });
    return response.data;
  },

  getTrendingPosts: async (size = 10): Promise<ForumPost[]> => {
    const response = await api.get('/forum/posts/trending', { params: { size } });
    return response.data;
  },

  getPostById: async (postId: string): Promise<ForumPost> => {
    const response = await api.get(`/forum/posts/${postId}`);
    return response.data;
  },

  createPost: async (payload: ForumPostPayload): Promise<ForumPost> => {
    const response = await api.post('/forum/posts', payload);
    return response.data;
  },

  updatePost: async (postId: string, payload: Partial<ForumPostPayload>): Promise<ForumPost> => {
    const response = await api.put(`/forum/posts/${postId}`, payload);
    return response.data;
  },

  deletePost: async (postId: string): Promise<void> => {
    await api.delete(`/forum/posts/${postId}`);
  },

  votePost: async (postId: string): Promise<ForumPost> => {
    const response = await api.post(`/forum/posts/${postId}/vote`);
    return response.data;
  },

  pinPost: async (postId: string, pinned: boolean): Promise<ForumPost> => {
    const response = await api.put(`/forum/posts/${postId}/pin`, null, {
      params: { pinned },
    });
    return response.data;
  },

  updatePostStatus: async (postId: string, status: 'ACTIVE' | 'HIDDEN' | 'DELETED'): Promise<ForumPost> => {
    const response = await api.put(`/forum/posts/${postId}/status`, null, {
      params: { status },
    });
    return response.data;
  },

  getComments: async (postId: string): Promise<ForumComment[]> => {
    const response = await api.get(`/forum/posts/${postId}/comments`);
    return response.data;
  },

  createComment: async (postId: string, payload: ForumCommentPayload): Promise<ForumComment> => {
    const response = await api.post(`/forum/posts/${postId}/comments`, payload);
    return response.data;
  },

  updateComment: async (commentId: string, payload: ForumCommentPayload): Promise<ForumComment> => {
    const response = await api.put(`/forum/comments/${commentId}`, payload);
    return response.data;
  },

  deleteComment: async (commentId: string): Promise<void> => {
    await api.delete(`/forum/comments/${commentId}`);
  },

  voteComment: async (commentId: string): Promise<ForumComment> => {
    const response = await api.post(`/forum/comments/${commentId}/vote`);
    return response.data;
  },
};
