import React, { useState, useEffect, useRef } from 'react';
import { MessageCircle, X, Minimize2, Maximize2, Send } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '../store/authStore';
import { chatAPI, type ChatMessage, type Conversation } from '../api/chat';
import {
  connectWebSocket,
  disconnectWebSocket,
  subscribeToConversation,
  sendMessage as sendWebSocketMessage,
  isConnected
} from '../services/websocket';

interface FloatingChatBoxProps {
  propertyId?: string;
  propertyOwnerId?: string;
  propertyOwnerName?: string;
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  conversationId?: string; // For opening specific conversation
}

const FloatingChatBox: React.FC<FloatingChatBoxProps> = ({
  propertyId,
  propertyOwnerId,
  propertyOwnerName,
  isOpen: externalIsOpen,
  onOpenChange,
  conversationId: externalConversationId
}) => {
  const { t } = useTranslation();
  const { user, isAuthenticated } = useAuthStore();
  const [internalIsOpen, setInternalIsOpen] = useState(false);
  
  // Use external control if provided, otherwise use internal state
  const isOpen = externalIsOpen !== undefined ? externalIsOpen : internalIsOpen;
  
  const setIsOpen = (open: boolean) => {
    if (onOpenChange) {
      onOpenChange(open);
    } else {
      setInternalIsOpen(open);
    }
  };
  const [isMinimized, setIsMinimized] = useState(false);
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [wsConnected, setWsConnected] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messageInputRef = useRef<HTMLInputElement>(null);
  const unsubscribeRef = useRef<(() => void) | null>(null);

  // Initialize conversation when component mounts or props change
  useEffect(() => {
    if (isAuthenticated && user?.id) {
      if (externalConversationId) {
        // Load specific conversation (for owner viewing inquiries)
        loadSpecificConversation(externalConversationId);
      } else if (propertyOwnerId) {
        // Create new conversation with owner (for clients)
        initializeConversation();
      }
    }
  }, [propertyOwnerId, externalConversationId, user?.id, isAuthenticated]);

  // Connect WebSocket and subscribe when conversation is loaded
  // Keep connection even when chat is closed/minimized to receive notifications
  useEffect(() => {
    if (conversation && user?.id) {
      connectToWebSocket();
    }

    // Cleanup only on unmount or conversation change
    return () => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
        unsubscribeRef.current = null;
      }
      disconnectWebSocket();
      setWsConnected(false);
    };
  }, [conversation?.id, user?.id]);

  // Scroll to bottom when new message arrives
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Clear unread count and mark as read when chat is open and not minimized
  useEffect(() => {
    if (isOpen && !isMinimized && conversation) {
      setUnreadCount(0);
      // Mark messages as read on server
      chatAPI.markAsRead(conversation.id).catch(err => 
        console.error('Error marking as read:', err)
      );
    }
  }, [isOpen, isMinimized, conversation?.id]);

  const initializeConversation = async () => {
    if (!propertyOwnerId || !user?.id) return;

    try {
      setLoading(true);
      const conv = await chatAPI.getOrCreateConversation(
        propertyOwnerId,
        propertyId
      );
      setConversation(conv);

      // Load existing messages
      const existingMessages = await chatAPI.getMessages(conv.id);
      setMessages(existingMessages);

      // Mark as read
      await chatAPI.markAsRead(conv.id);
    } catch (error) {
      console.error('Error initializing conversation:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadSpecificConversation = async (convId: string) => {
    if (!user?.id) return;

    try {
      setLoading(true);
      const conv = await chatAPI.getConversation(convId);
      setConversation(conv);

      // Load existing messages
      const existingMessages = await chatAPI.getMessages(conv.id);
      setMessages(existingMessages);

      // Mark as read
      await chatAPI.markAsRead(conv.id);
    } catch (error) {
      console.error('Error loading conversation:', error);
    } finally {
      setLoading(false);
    }
  };

  const connectToWebSocket = () => {
    if (!conversation || !user?.id) return;

    connectWebSocket(
      () => {
        setWsConnected(true);
        
        // Subscribe to conversation messages
        const unsubscribe = subscribeToConversation(
          conversation.id,
          (message: ChatMessage) => {
            setMessages((prev) => {
              // Remove any temp messages from current user (they will be replaced by real message)
              const filtered = prev.filter(m => 
                !(m.id.startsWith('temp-') && m.senderId === message.senderId && m.content === message.content)
              );
              
              // Check if real message already exists
              const exists = filtered.some(m => m.id === message.id);
              if (exists) return prev;
              
              return [...filtered, message];
            });
            
            // If message is for current user
            if (message.receiverId === String(user.id)) {
              // Increment unread count for notification
              setUnreadCount((count) => count + 1);
            }
          }
        );

        unsubscribeRef.current = unsubscribe;
      },
      (error) => {
        console.error('WebSocket connection error:', error);
        setWsConnected(false);
      }
    );
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !conversation || !user?.id || sending || !isConnected()) {
      return;
    }

    const messageContent = newMessage.trim();
    setNewMessage('');

    try {
      setSending(true);
      
      // Send message via WebSocket (will be saved to DB by backend)
      const sent = sendWebSocketMessage(conversation.id, String(user.id), messageContent);
      
      if (!sent) {
        // Fallback to REST API if WebSocket fails
        const sentMessage = await chatAPI.sendMessage(conversation.id, messageContent);
        setMessages((prev) => [...prev, sentMessage]);
      } else {
        // Optimistically add message to UI (will be replaced by real message from WebSocket)
        const tempMessage: ChatMessage = {
          id: `temp-${Date.now()}`,
          conversationId: conversation.id,
          senderId: String(user.id),
          receiverId: conversation.user2Id === String(user.id) ? conversation.user1Id : conversation.user2Id,
          senderName: user.fullName || user.email,
          content: messageContent,
          isRead: false,
          createdAt: new Date().toISOString()
        };
        setMessages((prev) => [...prev, tempMessage]);
      }
      
      // Refresh conversation to update last message
      const updatedConv = await chatAPI.getConversation(conversation.id);
      if (updatedConv) {
        setConversation(updatedConv);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      // Restore message on error
      setNewMessage(messageContent);
    } finally {
      setSending(false);
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);

    if (minutes < 1) return 'Vừa xong';
    if (minutes < 60) return `${minutes} phút trước`;
    if (minutes < 1440) return `${Math.floor(minutes / 60)} giờ trước`;
    return date.toLocaleDateString('vi-VN');
  };

  if (!isAuthenticated) {
    return null;
  }

  // Determine the other user's name based on conversation
  let otherUserName = 'Người dùng';
  if (conversation && user) {
    // If current user is user1, show user2's name, and vice versa
    if (conversation.user1Id === String(user.id)) {
      otherUserName = conversation.user2Name || 'Người dùng';
    } else if (conversation.user2Id === String(user.id)) {
      otherUserName = conversation.user1Name || 'Người dùng';
    }
  } else if (propertyOwnerName) {
    // Fallback to property owner name if conversation not loaded yet
    otherUserName = propertyOwnerName;
  }

  // Chỉ hiển thị floating button cho KHÁCH (khi có propertyOwnerId)
  // KHÔNG hiển thị cho CHỦ (khi có conversationId - owner click từ PropertyChatList)
  const shouldShowFloatingButton = !isOpen && propertyOwnerId && !externalConversationId;

  return (
    <>
      {/* Chat Box (Controlled by FloatingActionHub) */}
      {isOpen && (
        <div
          className={`fixed bottom-4 sm:bottom-6 right-4 sm:right-6 bg-white/95 backdrop-blur-md rounded-2xl shadow-[0_8px_40px_rgb(0,0,0,0.12)] border border-gray-100/50 z-50 flex flex-col transition-all duration-300 overflow-hidden ${
            isMinimized 
              ? 'w-[calc(100vw-2rem)] sm:w-80 h-16' 
              : 'w-[calc(100vw-2rem)] sm:w-96 h-[500px] sm:h-[600px] max-h-[calc(100vh-6rem)]'
          }`}
        >
          {/* Header - Giống header hệ thống */}
          <div className="bg-white/85 backdrop-blur-md border-b border-gray-100/50 p-4 flex items-center justify-between shadow-sm">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-red-600 rounded-lg flex items-center justify-center">
                <MessageCircle className="w-4 h-4 text-white" />
              </div>
              {!isMinimized && (
                <>
                  <div>
                    <span className="font-semibold text-gray-800 block">
                      {externalConversationId ? t('chatBox.customer') : t('chatBox.owner')} - {otherUserName}
                    </span>
                    {wsConnected && (
                      <span className="text-xs text-gray-500 flex items-center gap-1">
                        <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></span>
                        {t('chatBox.active')}
                      </span>
                    )}
                  </div>
                </>
              )}
              {isMinimized && (
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-gray-800">
                    {externalConversationId ? t('chatBox.customerShort') : t('chatBox.ownerShort')} - {otherUserName}
                  </span>
                  {unreadCount > 0 && (
                    <span className="bg-red-600 text-white text-xs font-bold rounded-full px-2 py-0.5 animate-pulse">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </div>
              )}
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setIsMinimized(!isMinimized)}
                className="hover:bg-gray-100 p-2 rounded-lg transition-colors text-gray-600 hover:text-gray-800"
                title={isMinimized ? t('chatBox.maximize') : t('chatBox.minimize')}
              >
                {isMinimized ? (
                  <Maximize2 className="w-4 h-4" />
                ) : (
                  <Minimize2 className="w-4 h-4" />
                )}
              </button>
              <button
                onClick={() => {
                  setIsOpen(false);
                  if (onOpenChange) onOpenChange(false);
                  setIsMinimized(false);
                  if (unsubscribeRef.current) {
                    unsubscribeRef.current();
                    unsubscribeRef.current = null;
                  }
                  disconnectWebSocket();
                }}
                className="hover:bg-gray-100 p-2 rounded-lg transition-colors text-gray-600 hover:text-gray-800"
                title={t('chatBox.close')}
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {!isMinimized && (
            <>
              {/* Messages - Giống footer bg-gray-50 */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50/50">
                {loading ? (
                  <div className="flex items-center justify-center h-full">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
                  </div>
                ) : messages.length === 0 ? (
                  <div className="text-center text-gray-500 mt-8">
                    <MessageCircle className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                    {externalConversationId ? (
                      // CHỦ xem conversation với khách
                      <>
                        <p className="text-gray-600 font-medium">{t('chatBox.noMessagesOwner')}</p>
                        <p className="text-sm mt-2">{t('chatBox.waitFirstMessage')}</p>
                      </>
                    ) : (
                      // KHÁCH nhắn tin với chủ
                      <>
                        <p className="text-gray-600 font-medium">{t('chatBox.startConversation')}</p>
                        <p className="text-sm mt-2">{t('chatBox.sendToOwner')}</p>
                      </>
                    )}
                  </div>
                ) : (
                  messages.map((message) => {
                    const isOwn = message.senderId === String(user?.id);
                    return (
                      <div
                        key={message.id}
                        className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-[80%] p-3 shadow-sm ${
                            isOwn
                              ? 'bg-gradient-to-r from-red-500 to-red-600 text-white rounded-2xl rounded-tr-sm'
                              : 'bg-white text-gray-800 border border-gray-100 rounded-2xl rounded-tl-sm'
                          }`}
                        >
                          {!isOwn && (
                            <div className="text-xs font-semibold mb-1 text-gray-600">
                              {message.senderName}
                            </div>
                          )}
                          <div className="text-sm leading-relaxed">{message.content}</div>
                          <div
                            className={`text-xs mt-1.5 ${
                              isOwn ? 'text-red-100' : 'text-gray-500'
                            }`}
                          >
                            {formatTime(message.createdAt)}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input - Giống header bg-white */}
              <form onSubmit={handleSendMessage} className="border-t border-gray-100/50 p-4 bg-white/80 backdrop-blur-sm">
                <div className="flex gap-2">
                  <input
                    ref={messageInputRef}
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder={t('chatBox.inputPlaceholder')}
                    className="flex-1 border border-gray-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 text-sm transition-colors"
                    disabled={sending || !wsConnected}
                  />
                  <button
                    type="submit"
                    disabled={!newMessage.trim() || sending || !wsConnected}
                    className="bg-red-600 text-white p-2.5 rounded-xl hover:bg-red-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center btn-press shadow-sm"
                  >
                    <Send className="w-5 h-5" />
                  </button>
                </div>
                {!wsConnected && (
                  <p className="text-xs text-yellow-600 mt-2 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 bg-yellow-400 rounded-full animate-pulse"></span>
                    {t('chatBox.connecting')}
                  </p>
                )}
                {sending && wsConnected && (
                  <p className="text-xs text-gray-500 mt-2">{t('chatBox.sending')}</p>
                )}
              </form>
            </>
          )}
        </div>
      )}
    </>
  );
};

export default FloatingChatBox;
