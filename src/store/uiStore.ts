import { create } from 'zustand';

export interface OwnerChatConfig {
  propertyId: string;
  propertyOwnerId: string;
  propertyOwnerName: string;
  conversationId?: string;
}

interface UIState {
  isAIChatOpen: boolean;
  isOwnerChatOpen: boolean;
  ownerChatConfig: OwnerChatConfig | null;
  
  setAIChatOpen: (isOpen: boolean) => void;
  setOwnerChatOpen: (isOpen: boolean) => void;
  registerOwnerChat: (config: OwnerChatConfig) => void;
  unregisterOwnerChat: () => void;
}

export const useUIStore = create<UIState>((set) => ({
  isAIChatOpen: false,
  isOwnerChatOpen: false,
  ownerChatConfig: null,

  setAIChatOpen: (isOpen) => set({ isAIChatOpen: isOpen }),
  setOwnerChatOpen: (isOpen) => set({ isOwnerChatOpen: isOpen }),
  registerOwnerChat: (config) => set({ ownerChatConfig: config }),
  unregisterOwnerChat: () => set({ ownerChatConfig: null, isOwnerChatOpen: false }),
}));
