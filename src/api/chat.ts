import api from './index';

export interface ChatMessage {
  id: string;
  conversationId: string;
  senderId: string;
  receiverId: string;
  senderName?: string;
  receiverName?: string;
  content: string;
  isRead: boolean;
  createdAt: string;
}

export interface Conversation {
  id: string;
  user1Id: string;
  user2Id: string;
  user1Name?: string;
  user2Name?: string;
  propertyId?: string;
  propertyTitle?: string;
  lastMessage?: string;
  lastMessageAt?: string;
  unreadCount: number;
  createdAt: string;
  messages?: ChatMessage[];
}

export const chatAPI = {
  // Get or create conversation
  getOrCreateConversation: async (userId: string, propertyId?: string) => {
    const response = await api.post<Conversation>('/chat/conversations', {
      userId,
      propertyId
    });
    return response.data;
  },

  // Get all conversations for current user
  getConversations: async () => {
    const response = await api.get<Conversation[]>('/chat/conversations');
    return response.data;
  },

  // Get conversation by ID
  getConversation: async (conversationId: string) => {
    const response = await api.get<Conversation>(`/chat/conversations/${conversationId}`);
    return response.data;
  },

  // Get messages in a conversation
  getMessages: async (conversationId: string) => {
    const response = await api.get<ChatMessage[]>(`/chat/conversations/${conversationId}/messages`);
    return response.data;
  },

  // Mark messages as read
  markAsRead: async (conversationId: string) => {
    await api.put(`/chat/conversations/${conversationId}/read`);
  },

  // Get unread count
  getUnreadCount: async (conversationId: string) => {
    const response = await api.get<{ count: number }>(`/chat/conversations/${conversationId}/unread`);
    return response.data.count;
  },

  // Send a message
  sendMessage: async (conversationId: string, content: string) => {
    const response = await api.post<ChatMessage>(`/chat/conversations/${conversationId}/messages`, {
      content
    });
    return response.data;
  }
};

