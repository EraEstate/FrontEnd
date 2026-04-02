import { useEffect, useState } from 'react';
import { useAuthStore } from '../store/authStore';
import { connectWebSocket, subscribeToNotifications, isConnected } from '../services/websocket';
import { showInfo } from '../utils/toast';

export const useWebSocketNotification = () => {
  const { user, isAuthenticated } = useAuthStore();
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [notifications, setNotifications] = useState<any[]>([]);

  useEffect(() => {
    if (!isAuthenticated || !user?.id) return;

    let unsubscribe: (() => void) | undefined;

    const handleConnect = () => {
      console.log('WebSocket connected for notifications');
      unsubscribe = subscribeToNotifications(String(user.id), (notification) => {
        console.log('Received real-time notification:', notification);
        
        // Add to local state
        setNotifications((prev) => [notification, ...prev]);
        setUnreadCount((prev) => prev + 1);

        // Show toast
        showInfo(`${notification.title}: ${notification.message}`);
      });
    };

    const handleError = (error: any) => {
      console.error('WebSocket notification error:', error);
    };

    if (!isConnected()) {
      connectWebSocket(handleConnect, handleError);
    } else {
      handleConnect();
    }

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [isAuthenticated, user?.id]);

  return {
    unreadCount,
    setUnreadCount,
    notifications,
    setNotifications
  };
};
