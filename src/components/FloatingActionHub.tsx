import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Bot, MessageCircle, Sparkles, X } from 'lucide-react';
import { useUIStore } from '../store/uiStore';
import AIChatBox from './AIChatBox';
import FloatingChatBox from './FloatingChatBox';

const FloatingActionHub: React.FC = () => {
  const { t } = useTranslation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  const { 
    isAIChatOpen, 
    setAIChatOpen, 
    isOwnerChatOpen, 
    setOwnerChatOpen, 
    ownerChatConfig 
  } = useUIStore();

  const toggleAIChat = () => {
    setAIChatOpen(!isAIChatOpen);
    setIsMenuOpen(false);
  };

  const toggleOwnerChat = () => {
    setOwnerChatOpen(!isOwnerChatOpen);
    setIsMenuOpen(false);
  };

  return (
    <>
      {/* Container for the Action Hub */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
        {/* Expanded Menu Options */}
        {isMenuOpen && (
          <div className="flex flex-col items-end gap-3 mb-2 animate-fade-in-up">
            {ownerChatConfig && (
              <button
                onClick={toggleOwnerChat}
                className="flex items-center gap-3 bg-white text-gray-800 px-4 py-3 rounded-full shadow-lg hover:bg-gray-50 border border-gray-100 transition-all hover:scale-105"
              >
                <span className="font-medium text-sm">
                  {t('chatBox.sendToOwner') || 'Chat Chủ nhà'}
                </span>
                <div className="bg-blue-100 p-2 rounded-full text-blue-600">
                  <MessageCircle className="w-5 h-5" />
                </div>
              </button>
            )}
            
            <button
              onClick={toggleAIChat}
              className="flex items-center gap-3 bg-white text-gray-800 px-4 py-3 rounded-full shadow-lg hover:bg-gray-50 border border-gray-100 transition-all hover:scale-105"
            >
              <span className="font-medium text-sm">
                {t('aiChat.buttonTitle') || 'Chat với AI'}
              </span>
              <div className="bg-red-100 p-2 rounded-full text-red-600">
                <Bot className="w-5 h-5" />
              </div>
            </button>
          </div>
        )}

        {/* Main Floating Button */}
        {!(isAIChatOpen || isOwnerChatOpen) && (
          <button
            onClick={() => {
              if (ownerChatConfig) {
                // If there are multiple options, toggle menu
                setIsMenuOpen(!isMenuOpen);
              } else {
                // If only AI is available, open it directly
                toggleAIChat();
              }
            }}
            className="relative bg-gradient-to-r from-red-500 to-red-600 text-white p-4 rounded-full shadow-[0_8px_30px_rgb(220,38,38,0.3)] hover:shadow-[0_8px_30px_rgb(220,38,38,0.5)] transition-all hover:scale-105 flex items-center justify-center z-50"
          >
            {isMenuOpen ? (
              <X className="w-6 h-6 animate-in spin-in-180" />
            ) : ownerChatConfig ? (
              <Sparkles className="w-6 h-6 animate-pulse" />
            ) : (
              <Bot className="w-6 h-6" />
            )}
          </button>
        )}
      </div>

      {/* The actual Chat Boxes rendered globally but controlled by UI Store */}
      <AIChatBox isOpen={isAIChatOpen} onOpenChange={setAIChatOpen} />
      
      {ownerChatConfig && (
        <FloatingChatBox 
          propertyId={ownerChatConfig.propertyId}
          propertyOwnerId={ownerChatConfig.propertyOwnerId}
          propertyOwnerName={ownerChatConfig.propertyOwnerName}
          conversationId={ownerChatConfig.conversationId}
          isOpen={isOwnerChatOpen}
          onOpenChange={setOwnerChatOpen}
        />
      )}
    </>
  );
};

export default FloatingActionHub;
