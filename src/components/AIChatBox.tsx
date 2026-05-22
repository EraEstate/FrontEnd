import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Minimize2, Maximize2, Send, Bot, Loader2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
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
  const { t } = useTranslation();
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
          content: t('aiChat.welcomeMessage'),
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
        content: t('aiChat.welcomeMessage'),
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

  const isOpen = externalIsOpen !== undefined ? externalIsOpen : internalIsOpen;
  
  const setIsOpen = (open: boolean) => {
    if (onOpenChange) {
      onOpenChange(open);
    }
    setInternalIsOpen(open);
  };

  // Sync external state if changed
  useEffect(() => {
    if (externalIsOpen !== undefined) {
      setInternalIsOpen(externalIsOpen);
    }
  }, [externalIsOpen]);

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
      // Gửi 8 tin nhắn gần nhất cho Groq context
      const recentHistory = messages.slice(-8).map(msg => ({
            role: msg.role,
            content: msg.content
          }));

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
        content: t('aiChat.errorMessage'),
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

  return (
    <>
      {/* Chat Box (Controlled by FloatingActionHub) */}
      {isOpen && (
        <div
          className={`fixed bottom-6 right-6 bg-white/95 backdrop-blur-md rounded-2xl shadow-[0_8px_40px_rgb(0,0,0,0.12)] border border-gray-200 z-50 flex flex-col transition-all duration-300 overflow-hidden ${
            isMinimized ? 'w-80 h-16' : 'w-96 h-[600px]'
          }`}
        >
          <div className={`bg-gradient-to-r from-red-600/95 to-red-700/95 backdrop-blur-md text-white p-4 flex items-center justify-between transition-all duration-300 ${isMinimized ? '' : 'shadow-lg border-b border-red-800/20'}`}>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                <Bot className="w-5 h-5" />
              </div>
              {!isMinimized && (
                <div>
                  <span className="font-semibold block">{t('aiChat.title')}</span>
                  <span className="text-xs text-red-100 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 bg-green-300 rounded-full animate-pulse"></span>
                    {t('aiChat.active')}
                  </span>
                </div>
              )}
              {isMinimized && (
                <span className="font-semibold">{t('aiChat.titleShort')}</span>
              )}
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setIsMinimized(!isMinimized)}
                className="hover:bg-white/20 p-2 rounded-lg transition-colors"
                title={isMinimized ? t('aiChat.maximize') : t('aiChat.minimize')}
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
                }}
                className="p-1.5 hover:bg-white/20 rounded-lg transition-colors"
                title={t('aiChat.close')}
              >
                <X className="w-5 h-5 text-white" />
              </button>
            </div>
          </div>

          {!isMinimized && (
            <>
              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50/50">
                {messages.map((message) => {
                  const isUser = message.role === 'user';
                  const msgKey = message.id || `msg-${message.role}-${message.timestamp || message.content.substring(0, 20)}`;
                  return (
                    <div
                      key={msgKey}
                      className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[85%] p-3 shadow-sm ${
                          isUser
                            ? 'bg-gradient-to-r from-red-600 to-red-700 text-white rounded-2xl rounded-tr-sm'
                            : 'bg-white text-gray-800 border border-gray-100 rounded-2xl rounded-tl-sm'
                        }`}
                      >
                        {!isUser && (
                          <div className="flex items-center gap-2 mb-1">
                            <Bot className="w-4 h-4 text-red-600" />
                            <span className="text-xs font-semibold text-gray-600">{t('aiChat.assistantName')}</span>
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
                    <div className="bg-white border border-gray-100 rounded-2xl rounded-tl-sm p-3 shadow-sm">
                      <div className="flex items-center gap-2">
                        <Bot className="w-4 h-4 text-red-600" />
                        <Loader2 className="w-4 h-4 text-gray-500 animate-spin" />
                        <span className="text-sm text-gray-500">{t('aiChat.thinking')}</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Quick suggestion chips */}
                {messages.length <= 1 && !isLoading && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {(isAuthenticated ? [
                      'Hướng dẫn đăng tin bán nhà',
                      'Cách tìm căn hộ phù hợp?',
                      'Làm sao để so sánh BĐS?',
                      'Quy trình giao dịch thế nào?',
                    ] : [
                      'Sàn Era Estate có gì?',
                      'Cách tìm kiếm BĐS?',
                      'Tôi muốn thuê căn hộ',
                      'Hướng dẫn đăng ký tài khoản',
                    ]).map((suggestion) => (
                      <button
                        key={suggestion}
                        onClick={() => {
                          setInputMessage(suggestion);
                          inputRef.current?.focus();
                        }}
                        className="text-xs px-3 py-1.5 bg-white border border-red-200 text-red-600 rounded-full hover:bg-red-50 hover:border-red-300 transition-colors"
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                )}
                
                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <form onSubmit={handleSendMessage} className="border-t border-gray-200 p-4 bg-white/80 backdrop-blur-sm">
                <div className="flex gap-2">
                  <input
                    ref={inputRef}
                    type="text"
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    placeholder={t('aiChat.inputPlaceholder')}
                    className="flex-1 border border-gray-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 text-sm transition-colors"
                    disabled={isLoading}
                  />
                  <button
                    type="submit"
                    disabled={!inputMessage.trim() || isLoading}
                    className="bg-gradient-to-r from-red-600 to-red-700 text-white p-2.5 rounded-xl hover:from-red-700 hover:to-red-800 disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed transition-all flex items-center justify-center shadow-sm hover:shadow-md btn-press"
                  >
                    {isLoading ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <Send className="w-5 h-5" />
                    )}
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  {t('aiChat.disclaimer')}
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

