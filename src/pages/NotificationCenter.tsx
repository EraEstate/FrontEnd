import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { 
  Bell, 
  BellOff, 
  X, 
  Check, 
  Clock, 
  Home, 
  MessageSquare, 
  Heart,
  Settings,
  Filter
} from 'lucide-react';
import { 
  useNotifications, 
  useUnreadCount, 
  useMarkAsRead, 
  useMarkAllAsRead, 
  useDeleteNotification 
} from '../api/hooks';

interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: 'PROPERTY_ALERT' | 'PRICE_UPDATE' | 'NEW_MESSAGE' | 'MARKETING' | 'SYSTEM';
  isRead: boolean;
  createdAt: string;
  relatedId?: string;
}

const NotificationCenter: React.FC = () => {
  const { t } = useTranslation();
  const [filter, setFilter] = useState<'all' | 'unread' | 'read'>('all');
  const [page, setPage] = useState(0);
  const size = 20;

  // API Hooks
  const { data: notificationsData, loading, refetch } = useNotifications(page, size);
  const { data: unreadCount, refetch: refetchUnreadCount } = useUnreadCount();
  const { mutate: markAsRead } = useMarkAsRead();
  const { mutate: markAllAsRead } = useMarkAllAsRead();
  const { mutate: deleteNotification } = useDeleteNotification();

  const notifications = notificationsData?.content || [];
  
  const handleMarkAsRead = async (id: string) => {
    try {
      await markAsRead(id);
      refetch();
      refetchUnreadCount();
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllAsRead(undefined);
      refetch();
      refetchUnreadCount();
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  const handleDeleteNotification = async (id: string) => {
    try {
      await deleteNotification(id);
      refetch();
      refetchUnreadCount();
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'PROPERTY_ALERT':
        return <Home className="w-5 h-5 text-blue-600" />;
      case 'PRICE_UPDATE':
        return <Heart className="w-5 h-5 text-green-600" />;
      case 'NEW_MESSAGE':
        return <MessageSquare className="w-5 h-5 text-purple-600" />;
      case 'MARKETING':
        return <Bell className="w-5 h-5 text-orange-600" />;
      default:
        return <Bell className="w-5 h-5 text-gray-600" />;
    }
  };

  const getNotificationTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      'PROPERTY_ALERT': 'Cảnh báo BDS',
      'PRICE_UPDATE': 'Cập nhật giá',
      'NEW_MESSAGE': t('notifications.newMessage'),
      'MARKETING': 'Khuyến mãi',
      'SYSTEM': 'Hệ thống'
    };
    return labels[type] || 'Thông báo';
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
    const diffInHours = Math.floor(diffInMinutes / 60);
    const diffInDays = Math.floor(diffInHours / 24);

    if (diffInMinutes < 1) return t('notifications.justNow');
    if (diffInMinutes < 60) return `${diffInMinutes} phút trước`;
    if (diffInHours < 24) return `${diffInHours} giờ trước`;
    if (diffInDays < 7) return `${diffInDays} ngày trước`;
    return date.toLocaleDateString('vi-VN');
  };

  const filteredNotifications = notifications.filter((notification: NotificationItem) => {
    if (filter === 'unread') return !notification.isRead;
    if (filter === 'read') return notification.isRead;
    return true;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Bell className="w-8 h-8 text-red-600" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Trung tâm thông báo</h1>
                <p className="text-gray-600">
                  {unreadCount > 0 ? `${unreadCount} thông báo chưa đọc` : 'Tất cả thông báo đã được đọc'}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllAsRead}
                  className="flex items-center px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                >
                  <Check className="w-4 h-4 mr-2" />
                  Đánh dấu tất cả đã đọc
                </button>
              )}
              <Link
                to="/settings"
                className="flex items-center px-4 py-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
              >
                <Settings className="w-4 h-4 mr-2" />
                Cài đặt
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* Filters */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-2">
            <Filter className="w-5 h-5 text-gray-400" />
            <div className="flex space-x-1">
              {[
                { key: 'all', label: t('common.all'), count: notifications.length },
                { key: 'unread', label: t('notifications.unread'), count: notifications.filter((n: NotificationItem) => !n.isRead).length },
                { key: 'read', label: 'Đã đọc', count: notifications.filter((n: NotificationItem) => n.isRead).length }
              ].map(filterOption => (
                <button
                  key={filterOption.key}
                  onClick={() => setFilter(filterOption.key as any)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    filter === filterOption.key
                      ? 'bg-red-100 text-red-700'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  {filterOption.label} ({filterOption.count})
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Notifications List */}
        {loading ? (
          <div className="space-y-4">
            {[...Array(5)].map((_, index) => (
              <div key={index} className="bg-white rounded-lg shadow-sm p-6 animate-pulse">
                <div className="flex items-start space-x-4">
                  <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : filteredNotifications.length === 0 ? (
          <div className="text-center py-12">
            <BellOff className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {filter === 'unread' ? 'Không có thông báo chưa đọc' : 
               filter === 'read' ? 'Không có thông báo đã đọc' : 
               'Chưa có thông báo nào'}
            </h3>
            <p className="text-gray-600">
              {filter === 'all' && 'Các thông báo mới sẽ xuất hiện tại đây.'}
              {filter === 'unread' && 'Tất cả thông báo đã được đọc.'}
              {filter === 'read' && 'Chưa có thông báo nào được đánh dấu là đã đọc.'}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredNotifications.map((notification: NotificationItem) => (
              <div
                key={notification.id}
                className={`bg-white rounded-lg shadow-sm border-l-4 hover:shadow-md transition-shadow ${
                  notification.isRead 
                    ? 'border-gray-200' 
                    : 'border-red-500 bg-red-50/30'
                }`}
              >
                <div className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4 flex-1">
                      <div className={`p-2 rounded-full ${
                        notification.isRead ? 'bg-gray-100' : 'bg-white shadow-sm'
                      }`}>
                        {getNotificationIcon(notification.type)}
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded">
                            {getNotificationTypeLabel(notification.type)}
                          </span>
                          {!notification.isRead && (
                            <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                          )}
                        </div>
                        
                        <h3 className={`font-semibold mb-1 ${
                          notification.isRead ? 'text-gray-700' : 'text-gray-900'
                        }`}>
                          {notification.title}
                        </h3>
                        
                        <p className={`text-sm mb-3 ${
                          notification.isRead ? 'text-gray-500' : 'text-gray-700'
                        }`}>
                          {notification.message}
                        </p>
                        
                        <div className="flex items-center text-xs text-gray-500 space-x-4">
                          <div className="flex items-center">
                            <Clock className="w-3 h-3 mr-1" />
                            {formatTime(notification.createdAt)}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center space-x-2 ml-4">
                      {!notification.isRead && (
                        <button
                          onClick={() => handleMarkAsRead(notification.id)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Đánh dấu đã đọc"
                        >
                          <Check className="w-4 h-4" />
                        </button>
                      )}
                      <button
                        onClick={() => handleDeleteNotification(notification.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Xóa thông báo"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {notificationsData?.totalPages > 1 && (
          <div className="flex justify-center mt-8">
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setPage(page - 1)}
                disabled={page === 0}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                Trước
              </button>
              
              <div className="flex items-center space-x-1">
                {[...Array(Math.min(5, notificationsData.totalPages))].map((_, index) => {
                  const pageNum = index + Math.max(0, page - 2);
                  if (pageNum >= notificationsData.totalPages) return null;
                  
                  return (
                    <button
                      key={pageNum}
                      onClick={() => setPage(pageNum)}
                      className={`px-4 py-2 rounded-lg ${
                        page === pageNum
                          ? 'bg-red-600 text-white'
                          : 'text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      {pageNum + 1}
                    </button>
                  );
                })}
              </div>
              
              <button
                onClick={() => setPage(page + 1)}
                disabled={page >= notificationsData.totalPages - 1}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                Sau
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationCenter;