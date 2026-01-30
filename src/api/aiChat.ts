import { api } from './index';

export interface AIChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp?: string;
  id?: string;
}

export interface AIChatRequest {
  message: string;
  history?: AIChatMessage[];
  sessionId?: string;
}

export interface AIChatResponse {
  response: string;
  status: string;
  sessionId?: string;
  messageId?: string;
  aiMessageId?: string;
}

export interface AIChatHistoryResponse {
  messages: AIChatMessage[];
  status: string;
}

export const aiChatAPI = {
  /**
   * Gửi tin nhắn đến AI chatbot
   */
  sendMessage: async (message: string, history: AIChatMessage[] = [], sessionId?: string): Promise<AIChatResponse> => {
    const request: AIChatRequest = {
      message,
      history,
      sessionId
    };
    
    const response = await api.post<AIChatResponse>('/ai-chat/message', request);
    return response.data;
  },

  /**
   * Lấy lịch sử tin nhắn
   */
  getHistory: async (sessionId?: string): Promise<AIChatMessage[]> => {
    const params = sessionId ? `?sessionId=${sessionId}` : '';
    const response = await api.get<AIChatHistoryResponse>(`/ai-chat/history${params}`);
    return response.data.messages.map(msg => ({
      role: msg.role as 'user' | 'assistant',
      content: msg.content,
      timestamp: msg.timestamp,
      id: msg.id
    }));
  },

  /**
   * Sync session lên user khi đăng nhập
   */
  syncSession: async (sessionId: string): Promise<void> => {
    await api.post('/ai-chat/sync-session', { sessionId });
  },

  /**
   * Test kết nối với AI service
   */
  test: async (): Promise<string> => {
    const response = await api.get<{ message: string }>('/ai-chat/test');
    return response.data.message;
  }
};

