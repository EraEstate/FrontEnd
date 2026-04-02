import { Client } from '@stomp/stompjs';
import type { IMessage } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import type { ChatMessage } from '../api/chat';

let stompClient: Client | null = null;

export interface MessageCallback {
  (message: ChatMessage): void;
}

export const connectWebSocket = (
  onConnected: () => void,
  onError: (error: any) => void
): Client => {
  if (stompClient && stompClient.connected) {
    onConnected();
    return stompClient;
  }

  // Get token from localStorage
  let token = null;
  try {
    const authStorage = localStorage.getItem('auth-storage');
    if (authStorage) {
      const parsed = JSON.parse(authStorage);
      token = parsed.state?.token;
    }
  } catch (e) {
    console.warn('Failed to parse auth-storage for WebSocket:', e);
  }
  
  // Fallback to jwt key
  if (!token) {
    token = localStorage.getItem('jwt');
  }

  console.log('WebSocket connecting with token:', token ? 'exists' : 'null');

  // Determine WebSocket base URL from environment (Vercel/Vite) or fall back to local dev
  const WS_BASE_URL =
    import.meta.env.VITE_WS_BASE_URL ?? 'http://localhost:8080/ws';

  const socket = new SockJS(WS_BASE_URL);
  stompClient = new Client({
    webSocketFactory: () => socket as any,
    connectHeaders: token ? { token: token } : {},
    reconnectDelay: 5000,
    heartbeatIncoming: 4000,
    heartbeatOutgoing: 4000,
    onConnect: () => {
      console.log('WebSocket connected successfully');
      onConnected();
    },
    onStompError: (frame: any) => {
      console.error('STOMP error:', frame);
      onError(frame);
    },
    onWebSocketClose: () => {
      console.log('WebSocket closed');
    },
    onDisconnect: () => {
      console.log('WebSocket disconnected');
    }
  });

  stompClient.activate();
  return stompClient;
};

export const disconnectWebSocket = () => {
  if (stompClient) {
    stompClient.deactivate();
    stompClient = null;
  }
};

export const subscribeToConversation = (
  conversationId: string,
  callback: MessageCallback
): (() => void) => {
  if (!stompClient || !stompClient.connected) {
    console.error('WebSocket not connected');
    return () => {};
  }

  const subscription = stompClient.subscribe(
    `/topic/conversation/${conversationId}`,
    (message: IMessage) => {
      try {
        const data = JSON.parse(message.body) as ChatMessage;
        callback(data);
      } catch (error) {
        console.error('Error parsing message:', error);
      }
    }
  );

  return () => {
    subscription.unsubscribe();
  };
};

export const subscribeToNotifications = (
  userId: string,
  callback: (notification: any) => void
): (() => void) => {
  if (!stompClient || !stompClient.connected) {
    console.error('WebSocket not connected');
    return () => {};
  }

  const subscription = stompClient.subscribe(
    `/queue/notifications/${userId}`,
    (message: IMessage) => {
      try {
        const data = JSON.parse(message.body);
        callback(data);
      } catch (error) {
        console.error('Error parsing notification message:', error);
      }
    }
  );

  return () => {
    subscription.unsubscribe();
  };
};

export interface EscrowUpdatePayload {
  type: 'NEW_DEPOSIT' | 'HANDOVER_CONFIRMED' | 'REFUNDED' | 'STATUS_CHANGED';
  id: number;
  transactionHash: string;
  propertyId: number;
  buyerAddress: string;
  sellerAddress: string;
  amount: number;
  status: 'PENDING' | 'LOCKED' | 'RELEASED' | 'REFUNDED';
  updatedAt: string | null;
}

/**
 * Subscribe to real-time escrow updates for a specific wallet address.
 * Topic: /topic/escrow/{walletAddress}
 */
export const subscribeToEscrow = (
  walletAddress: string,
  callback: (payload: EscrowUpdatePayload) => void
): (() => void) => {
  if (!stompClient || !stompClient.connected) {
    console.error('WebSocket not connected for escrow subscription');
    return () => {};
  }

  const topic = `/topic/escrow/${walletAddress.toLowerCase()}`;
  const subscription = stompClient.subscribe(
    topic,
    (message: IMessage) => {
      try {
        const data = JSON.parse(message.body) as EscrowUpdatePayload;
        callback(data);
      } catch (error) {
        console.error('Error parsing escrow WebSocket message:', error);
      }
    }
  );

  console.log(`Subscribed to escrow updates: ${topic}`);

  return () => {
    subscription.unsubscribe();
    console.log(`Unsubscribed from escrow updates: ${topic}`);
  };
};

export const sendMessage = (
  conversationId: string,
  senderId: string,
  content: string
) => {
  if (!stompClient || !stompClient.connected) {
    console.error('WebSocket not connected');
    return false;
  }

  try {
    stompClient.publish({
      destination: '/app/chat.send',
      body: JSON.stringify({
        conversationId,
        senderId,
        content
      })
    });
    return true;
  } catch (error) {
    console.error('Error sending message via WebSocket:', error);
    return false;
  }
};

export const isConnected = (): boolean => {
  return stompClient !== null && stompClient.connected;
};

