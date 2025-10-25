import React from 'react';
import { useTranslation } from 'react-i18next';
import {
  BarChart3,
  Eye,
  Heart,
  MessageSquare,
  DollarSign,
  MapPin
} from 'lucide-react';

const DashboardPage: React.FC = () => {
  const { t } = useTranslation();
  // Mock data - thay thế bằng API calls thực tế
  const stats = {
    totalProperties: 12,
    activeProperties: 8,
    totalViews: 2456,
    totalFavorites: 89,
    totalInquiries: 23,
    totalRevenue: 4500000,
    recentViews: 156,
    recentInquiries: 5
  };

  const recentActivities = [
    {
      type: 'inquiry',
      message: t('dashboard.viewRequest'),
      property: t('dashboard.premiumApartment'),
      time: t('dashboard.hoursAgo', { count: 2 }),
      icon: MessageSquare
    },
    {
      type: 'view',
      message: t('dashboard.newViews', { count: 15 }),
      property: t('dashboard.townhouse'),
      time: t('dashboard.hoursAgo', { count: 4 }),
      icon: Eye
    },
    {
      type: 'favorite',
      message: t('dashboard.addedToFavorites'),
      property: t('dashboard.parkResidence'),
      time: t('dashboard.hoursAgo', { count: 6 }),
      icon: Heart
    }
  ];

  const topProperties = [
    {
      id: 1,
      title: t('dashboard.premiumApartment'),
      views: 456,
      inquiries: 12,
      favorites: 23,
      image: '/api/placeholder/100/80'
    },
    {
      id: 2,
      title: t('dashboard.townhouse'),
      views: 389,
      inquiries: 8,
      favorites: 18,
      image: '/api/placeholder/100/80'
    },
    {
      id: 3,
      title: t('dashboard.parkResidence'),
      views: 312,
      inquiries: 6,
      favorites: 15,
      image: '/api/placeholder/100/80'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 mt-10">
      <div className="w-full max-w-7xl mx-auto px-6 lg:px-12 py-8">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className="flex items-center space-x-3 mb-4">
            <BarChart3 className="h-8 w-8 text-red-600" />
            <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          </div>
          <p className="text-gray-600">
            Tổng quan về hoạt động bất động sản của bạn
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Tổng tin đăng</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalProperties}</p>
                <p className="text-sm text-green-600">+2 so với tháng trước</p>
              </div>
              <MapPin className="h-8 w-8 text-blue-600" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Lượt xem</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalViews.toLocaleString()}</p>
                <p className="text-sm text-green-600">+{stats.recentViews} hôm nay</p>
              </div>
              <Eye className="h-8 w-8 text-green-600" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Yêu thích</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalFavorites}</p>
                <p className="text-sm text-green-600">+5 so với tuần trước</p>
              </div>
              <Heart className="h-8 w-8 text-red-600" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Yêu cầu liên hệ</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalInquiries}</p>
                <p className="text-sm text-green-600">+{stats.recentInquiries} hôm nay</p>
              </div>
              <MessageSquare className="h-8 w-8 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recent Activities */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-900">Hoạt động gần đây</h2>
              </div>

              <div className="divide-y divide-gray-200">
                {recentActivities.map((activity, index) => {
                  const IconComponent = activity.icon;
                  return (
                    <div key={index} className="p-6 hover:bg-gray-50">
                      <div className="flex items-start space-x-4">
                        <div className={`p-2 rounded-full ${
                          activity.type === 'inquiry' ? 'bg-purple-100' :
                          activity.type === 'view' ? 'bg-green-100' : 'bg-red-100'
                        }`}>
                          <IconComponent className={`h-4 w-4 ${
                            activity.type === 'inquiry' ? 'text-purple-600' :
                            activity.type === 'view' ? 'text-green-600' : 'text-red-600'
                          }`} />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900">{activity.message}</p>
                          <p className="text-sm text-gray-600">{activity.property}</p>
                          <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Top Properties */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-900">Top BĐS</h2>
              </div>

              <div className="p-6 space-y-4">
                {topProperties.map((property) => (
                  <div key={property.id} className="flex items-start space-x-3">
                    <img
                      src={property.image}
                      alt={property.title}
                      className="w-16 h-12 rounded object-cover"
                    />
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-medium text-gray-900 truncate">
                        {property.title}
                      </h4>
                      <div className="flex items-center space-x-3 mt-1 text-xs text-gray-500">
                        <span className="flex items-center">
                          <Eye className="h-3 w-3 mr-1" />
                          {property.views}
                        </span>
                        <span className="flex items-center">
                          <MessageSquare className="h-3 w-3 mr-1" />
                          {property.inquiries}
                        </span>
                        <span className="flex items-center">
                          <Heart className="h-3 w-3 mr-1" />
                          {property.favorites}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-8 bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <a
              href="/post-property"
              className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <MapPin className="h-8 w-8 text-red-600 mb-2" />
              <span className="text-sm font-medium text-gray-900">Đăng tin mới</span>
            </a>
            <a
              href="/my-properties"
              className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <BarChart3 className="h-8 w-8 text-blue-600 mb-2" />
              <span className="text-sm font-medium text-gray-900">Quản lý tin</span>
            </a>
            <a
              href="/inquiries"
              className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <MessageSquare className="h-8 w-8 text-purple-600 mb-2" />
              <span className="text-sm font-medium text-gray-900">Yêu cầu liên hệ</span>
            </a>
            <a
              href="/payments"
              className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <DollarSign className="h-8 w-8 text-green-600 mb-2" />
              <span className="text-sm font-medium text-gray-900">Thanh toán</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;