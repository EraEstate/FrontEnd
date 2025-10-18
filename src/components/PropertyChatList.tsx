import React, { useState, useEffect } from 'react';
import { MessageCircle, User, Clock } from 'lucide-react';
import { chatAPI, type Conversation } from '../api/chat';
import { useAuthStore } from '../store/authStore';

interface PropertyChatListProps {
  propertyId: string;
  onSelectConversation: (conversation: Conversation) => void;
  selectedConversationId?: string;
}

const PropertyChatList: React.FC<PropertyChatListProps> = ({
  propertyId,
  onSelectConversation,
  selectedConversationId
}) => {
  const { user } = useAuthStore();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadConversations();
    
    // Refresh every 30 seconds
    const interval = setInterval(loadConversations, 30000);
    return () => clearInterval(interval);
  }, [propertyId]);

  const loadConversations = async () => {
    if (!user?.id) return;
    
    try {
      setLoading(true);
      const allConversations = await chatAPI.getConversations();
      
      // Filter conversations for this property
      let propertyConversations = allConversations.filter(
        conv => conv.propertyId === propertyId
      );
      
      // Filter out conversations where current user is talking to themselves
      // Only show conversations where the OTHER user is different from current user
      propertyConversations = propertyConversations.filter(conv => {
        const currentUserId = String(user.id);
        // Keep conversation only if there's another user involved
        // If user1 is current user, check if user2 is different
        // If user2 is current user, check if user1 is different
        if (conv.user1Id === currentUserId && conv.user2Id === currentUserId) {
          return false; // Both are same user, skip
        }
        return true; // At least one is different user
      });
      
      // Sort by last message time
      propertyConversations.sort((a, b) => {
        const timeA = a.lastMessageAt ? new Date(a.lastMessageAt).getTime() : 0;
        const timeB = b.lastMessageAt ? new Date(b.lastMessageAt).getTime() : 0;
        return timeB - timeA;
      });
      
      setConversations(propertyConversations);
    } catch (error) {
      console.error('Error loading conversations:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (dateString?: string) => {
    if (!dateString) return '';
    
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);

    if (minutes < 1) return 'Vừa xong';
    if (minutes < 60) return `${minutes} phút trước`;
    if (minutes < 1440) return `${Math.floor(minutes / 60)} giờ trước`;
    return date.toLocaleDateString('vi-VN');
  };

  const truncateMessage = (message?: string, maxLength: number = 50) => {
    if (!message) return 'Chưa có tin nhắn';
    if (message.length <= maxLength) return message;
    return message.substring(0, maxLength) + '...';
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
        </div>
      </div>
    );
  }

  if (conversations.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center mb-4">
          <MessageCircle className="h-5 w-5 text-red-600 mr-2" />
          <h3 className="text-lg font-semibold text-gray-900">Tin nhắn về bài đăng</h3>
        </div>
        <div className="text-center py-8">
          <MessageCircle className="h-12 w-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-600 font-medium mb-1">Chưa có ai nhắn tin</p>
          <p className="text-sm text-gray-500">Khách hàng quan tâm sẽ xuất hiện ở đây</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center">
          <MessageCircle className="h-5 w-5 text-red-600 mr-2" />
          <h3 className="text-lg font-semibold text-gray-900">
            Tin nhắn về bài đăng ({conversations.length})
          </h3>
        </div>
        <button 
          onClick={loadConversations}
          className="text-sm text-red-600 hover:text-red-700 transition-colors"
          title="Làm mới danh sách"
        >
          Làm mới
        </button>
      </div>
      <p className="text-sm text-gray-500 mb-4">
        Click vào khách hàng để xem và trả lời tin nhắn
      </p>
      
      <div className="space-y-2 max-h-[400px] overflow-y-auto">
        {conversations.map((conversation) => {
          // Determine other user's name (not current user)
          const currentUserId = String(user?.id);
          let otherUserName = 'Người dùng';
          
          if (conversation.user1Id === currentUserId) {
            otherUserName = conversation.user2Name || 'Người dùng';
          } else if (conversation.user2Id === currentUserId) {
            otherUserName = conversation.user1Name || 'Người dùng';
          } else {
            // Fallback: show whichever name is available
            otherUserName = conversation.user1Name || conversation.user2Name || 'Người dùng';
          }
          
          const isSelected = selectedConversationId === conversation.id;
          
          return (
            <button
              key={conversation.id}
              onClick={() => onSelectConversation(conversation)}
              className={`w-full text-left p-3 rounded-lg transition-colors border group ${
                isSelected 
                  ? 'bg-red-50 border-red-300 shadow-sm' 
                  : 'bg-white border-gray-100 hover:bg-gray-50 hover:border-red-200'
              }`}
            >
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center group-hover:bg-red-100 transition-colors">
                    <User className="h-5 w-5 text-gray-600 group-hover:text-red-600" />
                  </div>
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="font-medium text-gray-900 truncate">
                      {otherUserName}
                    </h4>
                    {conversation.unreadCount > 0 && (
                      <span className="flex-shrink-0 ml-2 bg-red-600 text-white text-xs font-medium px-2 py-0.5 rounded-full">
                        {conversation.unreadCount}
                      </span>
                    )}
                  </div>
                  
                  <p className="text-sm text-gray-600 truncate mb-1">
                    {truncateMessage(conversation.lastMessage)}
                  </p>
                  
                  <div className="flex items-center text-xs text-gray-500">
                    <Clock className="h-3 w-3 mr-1" />
                    {formatTime(conversation.lastMessageAt)}
                  </div>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default PropertyChatList;

