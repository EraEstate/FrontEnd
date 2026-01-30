import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Minimize2, Maximize2, Send, Bot, Loader2 } from 'lucide-react';
import { aiChatAPI, type AIChatMessage } from '../api/aiChat';
import { useAuthStore } from '../store/authStore';

const AI_CHAT_STORAGE_KEY = 'ai_chat_session';
const AI_CHAT_MESSAGES_KEY = 'ai_chat_messages';

interface AIChatBoxProps {
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
}

const AIChatBox: React.FC<AIChatBoxProps> = ({
  isOpen: externalIsOpen,
  onOpenChange
}) => {
  const { user, isAuthenticated } = useAuthStore();
  const [internalIsOpen, setInternalIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<AIChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string>('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Khởi tạo sessionId và load messages
  useEffect(() => {
    initializeSession();
  }, [isAuthenticated, user?.id]);

  // Sync localStorage lên DB khi user đăng nhập (chỉ một lần)
  useEffect(() => {
    const hasSynced = localStorage.getItem('ai_chat_synced');
    if (isAuthenticated && user?.id && sessionId && !hasSynced) {
      syncLocalStorageToDB();
    }
  }, [isAuthenticated, user?.id, sessionId]);

  const initializeSession = async () => {
    try {
      // Tạo hoặc lấy sessionId từ localStorage
      let currentSessionId = localStorage.getItem(AI_CHAT_STORAGE_KEY);
      if (!currentSessionId) {
        currentSessionId = `ai-session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        localStorage.setItem(AI_CHAT_STORAGE_KEY, currentSessionId);
      }
      setSessionId(currentSessionId);

      // Load messages
      if (isAuthenticated && user?.id) {
        // Đã đăng nhập - load từ DB
        try {
          const dbMessages = await aiChatAPI.getHistory();
          if (dbMessages && dbMessages.length > 0) {
            setMessages(dbMessages);
          } else {
            loadFromLocalStorage();
          }
        } catch (error) {
          console.warn('Error loading from DB, loading from localStorage:', error);
          loadFromLocalStorage();
        }
      } else {
        // Chưa đăng nhập - load từ localStorage
        loadFromLocalStorage();
      }
    } catch (error) {
      console.error('Error initializing session:', error);
      // Fallback to welcome message
      if (messages.length === 0) {
        setMessages([{
          role: 'assistant',
          content: 'Xin chào! Tôi là trợ lý AI của Era Estate. Tôi có thể giúp bạn tìm kiếm thông tin về bất động sản, tin tức, dự án và nhiều hơn nữa. Bạn cần tôi hỗ trợ gì?',
          timestamp: new Date().toISOString()
        }]);
      }
    }
  };

  const loadFromLocalStorage = () => {
    try {
      const saved = localStorage.getItem(AI_CHAT_MESSAGES_KEY);
      if (saved) {
        const parsedMessages = JSON.parse(saved);
        if (Array.isArray(parsedMessages) && parsedMessages.length > 0) {
          setMessages(parsedMessages);
          return;
        }
      }
    } catch (error) {
      console.error('Error loading from localStorage:', error);
    }
    
    // Default welcome message
    if (messages.length === 0) {
      setMessages([{
        role: 'assistant',
        content: 'Xin chào! Tôi là trợ lý AI của Era Estate. Tôi có thể giúp bạn tìm kiếm thông tin về bất động sản, tin tức, dự án và nhiều hơn nữa. Bạn cần tôi hỗ trợ gì?',
        timestamp: new Date().toISOString()
      }]);
    }
  };

  const saveToLocalStorage = (msgs: AIChatMessage[]) => {
    try {
      localStorage.setItem(AI_CHAT_MESSAGES_KEY, JSON.stringify(msgs));
    } catch (error) {
      console.error('Error saving to localStorage:', error);
    }
  };

  const syncLocalStorageToDB = async () => {
    try {
      const localMessages = localStorage.getItem(AI_CHAT_MESSAGES_KEY);
      if (localMessages && sessionId) {
        // Sync session lên DB
        await aiChatAPI.syncSession(sessionId);
        // Đánh dấu đã sync để không sync lại
        localStorage.setItem('ai_chat_synced', 'true');
        // Clear localStorage sau khi sync
        localStorage.removeItem(AI_CHAT_MESSAGES_KEY);
        // Load lại từ DB
        const dbMessages = await aiChatAPI.getHistory();
        if (dbMessages && dbMessages.length > 0) {
          setMessages(dbMessages);
        }
      }
    } catch (error) {
      console.error('Error syncing to DB:', error);
    }
  };

  // Use external control if provided, otherwise use internal state
  const isOpen = externalIsOpen !== undefined ? externalIsOpen : internalIsOpen;
  const setIsOpen = (open: boolean) => {
    if (onOpenChange) {
      onOpenChange(open);
    } else {
      setInternalIsOpen(open);
    }
  };

  // Scroll to bottom when new message arrives
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Focus input when chat opens
  useEffect(() => {
    if (isOpen && !isMinimized && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen, isMinimized]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim() || isLoading || !sessionId) {
      return;
    }

    const userMessage = inputMessage.trim();
    setInputMessage('');

    // Add user message to chat
    const newUserMessage: AIChatMessage = {
      role: 'user',
      content: userMessage,
      timestamp: new Date().toISOString()
    };
    
    const updatedMessages = [...messages, newUserMessage];
    setMessages(updatedMessages);
    
    // Lưu vào localStorage ngay (cho cả user chưa đăng nhập và đã đăng nhập)
    saveToLocalStorage(updatedMessages);
    
    setIsLoading(true);

    try {
      // CHỈ gửi 1 tin nhắn gần nhất để TỐI THIỂU token (free tier)
      const recentHistory = messages.length > 1 
        ? [messages[messages.length - 2]].map(msg => ({
            role: msg.role,
            content: msg.content.length > 50 ? msg.content.substring(0, 50) : msg.content
          }))
        : [];

      // Send to AI API với sessionId
      const response = await aiChatAPI.sendMessage(userMessage, recentHistory, sessionId);

      // Add AI response to chat
      const aiResponse: AIChatMessage = {
        id: response.aiMessageId,
        role: 'assistant',
        content: response.response,
        timestamp: new Date().toISOString()
      };

      const finalMessages = [...updatedMessages, aiResponse];
      setMessages(finalMessages);
      
      // Lưu vào localStorage
      saveToLocalStorage(finalMessages);
      
      // Nếu đã đăng nhập, tin nhắn đã được lưu vào DB bởi backend
      // Nếu chưa đăng nhập, chỉ lưu localStorage (đã lưu ở trên)
    } catch (error: any) {
      console.error('Error sending message to AI:', error);
      
      // Add error message
      const errorResponse: AIChatMessage = {
        role: 'assistant',
        content: 'Xin lỗi, có lỗi xảy ra khi xử lý câu hỏi của bạn. Vui lòng thử lại sau.',
        timestamp: new Date().toISOString()
      };
      
      const errorMessages = [...updatedMessages, errorResponse];
      setMessages(errorMessages);
      saveToLocalStorage(errorMessages);
    } finally {
      setIsLoading(false);
    }
  };

  const formatTime = (timestamp?: string) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    return date.toLocaleTimeString('vi-VN', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  // Chỉ hiển thị floating button khi chat box đóng
  const shouldShowFloatingButton = !isOpen;

  return (
    <>
      {/* Floating Chat Button */}
      {shouldShowFloatingButton && (
        <div className="fixed bottom-6 right-6 z-50">
          <button
            onClick={() => setIsOpen(true)}
            className="relative bg-gradient-to-r from-red-600 to-red-700 text-white p-4 rounded-full shadow-2xl hover:shadow-3xl hover:scale-110 transition-all duration-300 flex items-center gap-2 group"
            title="Chat với AI hỗ trợ"
          >
            <Bot className="w-6 h-6 group-hover:animate-bounce" />
            <span className="hidden sm:inline font-medium">AI Hỗ trợ</span>
          </button>
        </div>
      )}

      {/* Chat Box */}
      {isOpen && (
        <div
          className={`fixed bottom-6 right-6 bg-white rounded-lg shadow-2xl border border-gray-200 z-50 flex flex-col transition-all duration-300 ${
            isMinimized ? 'w-80 h-14' : 'w-96 h-[600px]'
          }`}
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-red-600 to-red-700 text-white p-4 rounded-t-lg flex items-center justify-between shadow-lg">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                <Bot className="w-5 h-5" />
              </div>
              {!isMinimized && (
                <div>
                  <span className="font-semibold block">AI Hỗ trợ Era Estate</span>
                  <span className="text-xs text-red-100 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 bg-green-300 rounded-full animate-pulse"></span>
                    Đang hoạt động
                  </span>
                </div>
              )}
              {isMinimized && (
                <span className="font-semibold">AI Hỗ trợ</span>
              )}
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setIsMinimized(!isMinimized)}
                className="hover:bg-white/20 p-2 rounded-lg transition-colors"
                title={isMinimized ? 'Mở rộng' : 'Thu nhỏ'}
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
                  setIsMinimized(false);
                }}
                className="hover:bg-white/20 p-2 rounded-lg transition-colors"
                title="Đóng"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {!isMinimized && (
            <>
              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
                {messages.map((message, index) => {
                  const isUser = message.role === 'user';
                  return (
                    <div
                      key={index}
                      className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[85%] rounded-lg p-3 shadow-sm ${
                          isUser
                            ? 'bg-gradient-to-r from-red-600 to-red-700 text-white'
                            : 'bg-white text-gray-800 border border-gray-200'
                        }`}
                      >
                        {!isUser && (
                          <div className="flex items-center gap-2 mb-1">
                            <Bot className="w-4 h-4 text-red-600" />
                            <span className="text-xs font-semibold text-gray-600">AI Assistant</span>
                          </div>
                        )}
                        <div className="text-sm leading-relaxed whitespace-pre-wrap break-words">
                          {message.content}
                        </div>
                        {message.timestamp && (
                          <div
                            className={`text-xs mt-1.5 ${
                              isUser ? 'text-red-100' : 'text-gray-500'
                            }`}
                          >
                            {formatTime(message.timestamp)}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
                
                {isLoading && (
                  <div className="flex justify-start">
                    <div className="bg-white border border-gray-200 rounded-lg p-3 shadow-sm">
                      <div className="flex items-center gap-2">
                        <Bot className="w-4 h-4 text-red-600" />
                        <Loader2 className="w-4 h-4 text-gray-500 animate-spin" />
                        <span className="text-sm text-gray-500">Đang suy nghĩ...</span>
                      </div>
                    </div>
                  </div>
                )}
                
                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <form onSubmit={handleSendMessage} className="border-t border-gray-200 p-4 bg-white rounded-b-lg">
                <div className="flex gap-2">
                  <input
                    ref={inputRef}
                    type="text"
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    placeholder="Nhập câu hỏi của bạn..."
                    className="flex-1 border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent text-sm"
                    disabled={isLoading}
                  />
                  <button
                    type="submit"
                    disabled={!inputMessage.trim() || isLoading}
                    className="bg-gradient-to-r from-red-600 to-red-700 text-white p-2.5 rounded-lg hover:from-red-700 hover:to-red-800 disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed transition-all flex items-center justify-center shadow-md hover:shadow-lg"
                  >
                    {isLoading ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <Send className="w-5 h-5" />
                    )}
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  AI có thể trả lời về bất động sản, tin tức và thông tin trên hệ thống
                </p>
              </form>
            </>
          )}
        </div>
      )}
    </>
  );
};

export default AIChatBox;

