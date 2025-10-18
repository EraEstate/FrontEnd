import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Eye,
  Heart,
  MessageCircle,
  PlusCircle,
  Filter,
  MapPin,
  DollarSign,
  Clock,
} from 'lucide-react';
import { activityAPI, type ActivityResponse } from '../api/activity';
import { getImageUrl, getImagePlaceholder } from '../utils/imageUtils';

const ActivityTab: React.FC = () => {
  const [activities, setActivities] = useState<ActivityResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('ALL');
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    loadActivities();
  }, [filter, page]);

  const loadActivities = async () => {
    try {
      setLoading(true);
      const data = await activityAPI.getUserActivities(page, 20, filter === 'ALL' ? undefined : filter);
      if (page === 0) {
        setActivities(data.content);
      } else {
        setActivities((prev) => [...prev, ...data.content]);
      }
      setHasMore(data.number < data.totalPages - 1);
    } catch (error) {
      console.error('Failed to load activities:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatTimeAgo = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return 'Vừa xong';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} phút trước`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} giờ trước`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} ngày trước`;
    if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 604800)} tuần trước`;
    if (diffInSeconds < 31536000) return `${Math.floor(diffInSeconds / 2592000)} tháng trước`;
    return `${Math.floor(diffInSeconds / 31536000)} năm trước`;
  };

  const formatPrice = (price?: number) => {
    if (!price) return '';
    if (price >= 1000000000) {
      return `${(price / 1000000000).toFixed(1)} tỷ`;
    }
    if (price >= 1000000) {
      return `${(price / 1000000).toFixed(0)} triệu`;
    }
    return price.toLocaleString('vi-VN');
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'PROPERTY_VIEWED':
        return <Eye className="w-5 h-5" />;
      case 'PROPERTY_FAVORITED':
        return <Heart className="w-5 h-5" />;
      case 'PROPERTY_INQUIRY':
        return <MessageCircle className="w-5 h-5" />;
      case 'PROPERTY_POSTED':
        return <PlusCircle className="w-5 h-5" />;
      default:
        return <Clock className="w-5 h-5" />;
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'PROPERTY_VIEWED':
        return 'bg-blue-100 text-blue-600 border-blue-200';
      case 'PROPERTY_FAVORITED':
        return 'bg-red-100 text-red-600 border-red-200';
      case 'PROPERTY_INQUIRY':
        return 'bg-green-100 text-green-600 border-green-200';
      case 'PROPERTY_POSTED':
        return 'bg-purple-100 text-purple-600 border-purple-200';
      default:
        return 'bg-gray-100 text-gray-600 border-gray-200';
    }
  };

  const filters = [
    { value: 'ALL', label: 'Tất cả' },
    { value: 'VIEWED', label: 'Đã xem' },
    { value: 'FAVORITED', label: 'Đã lưu' },
    { value: 'INQUIRY', label: 'Đã liên hệ' },
    { value: 'POSTED', label: 'Đã đăng' },
  ];

  if (loading && activities.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Filter */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-gray-900">Hoạt động của tôi</h3>
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-500" />
            <span className="text-sm text-gray-600">Lọc:</span>
          </div>
        </div>

        {/* Filter Buttons */}
        <div className="flex flex-wrap gap-2">
          {filters.map((f) => (
            <button
              key={f.value}
              onClick={() => {
                setFilter(f.value);
                setPage(0);
              }}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === f.value
                  ? 'bg-red-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Activities Timeline */}
      {activities.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm p-12 text-center">
          <Clock className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Chưa có hoạt động nào</h3>
          <p className="text-gray-600 mb-6">
            Hoạt động của bạn sẽ được hiển thị ở đây khi bạn xem, lưu, liên hệ hoặc đăng tin bất động sản
          </p>
          <Link
            to="/properties"
            className="inline-block bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition-colors"
          >
            Khám phá tin đăng
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {activities.map((activity) => (
            <div
              key={activity.id}
              className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
            >
              <div className="flex gap-4 p-4">
                {/* Icon */}
                <div
                  className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center border-2 ${getActivityColor(
                    activity.type
                  )}`}
                >
                  {getActivityIcon(activity.type)}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900 mb-1 line-clamp-1">
                        {activity.title}
                      </h4>
                      <p className="text-sm text-gray-600 mb-2">{activity.description}</p>

                      {/* Property Info */}
                      {activity.property && (
                        <div className="mt-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                          <div className="flex gap-3">
                            {activity.property.mainImageUrl && (
                              <img
                                src={getImageUrl(activity.property.mainImageUrl) || getImagePlaceholder(100, 100)}
                                alt={activity.property.title}
                                className="w-20 h-20 rounded object-cover flex-shrink-0"
                                onError={(e) => {
                                  const target = e.target as HTMLImageElement;
                                  target.src = getImagePlaceholder(100, 100);
                                }}
                              />
                            )}
                            <div className="flex-1 min-w-0">
                              <h5 className="font-medium text-gray-900 mb-1 line-clamp-1">
                                {activity.property.title}
                              </h5>
                              {activity.property.address && (
                                <div className="flex items-center text-sm text-gray-600 mb-1">
                                  <MapPin className="w-3 h-3 mr-1 flex-shrink-0" />
                                  <span className="line-clamp-1">{activity.property.address}</span>
                                </div>
                              )}
                              {activity.property.price && (
                                <div className="flex items-center text-sm font-semibold text-red-600">
                                  <DollarSign className="w-3 h-3 mr-1" />
                                  <span>{formatPrice(activity.property.price)} VNĐ</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Time */}
                      <div className="flex items-center gap-2 mt-3 text-xs text-gray-500">
                        <Clock className="w-3 h-3" />
                        <span>{formatTimeAgo(activity.timestamp)}</span>
                        <span>•</span>
                        <span>{new Date(activity.timestamp).toLocaleDateString('vi-VN')}</span>
                      </div>
                    </div>

                    {/* Action Button */}
                    {activity.propertyId && (
                      <Link
                        to={`/properties/${activity.propertyId}`}
                        className="flex-shrink-0 px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors border border-blue-200"
                      >
                        Xem chi tiết
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}

          {/* Load More */}
          {hasMore && (
            <div className="text-center pt-4">
              <button
                onClick={() => setPage((p) => p + 1)}
                disabled={loading}
                className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Đang tải...' : 'Tải thêm'}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ActivityTab;

