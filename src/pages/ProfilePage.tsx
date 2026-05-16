import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Camera, 
  Edit3, 
  Heart, 
  Building2, 
  TrendingUp,
  Shield,
  Award,
  Eye,
  CreditCard,
  DollarSign,
  Package,
  Calendar,
  CheckCircle2,
  XCircle,
  Clock
} from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { useMyProperties, useMyFavorites } from '../api/hooks';
import { settingsAPI } from '../api/settings';
import { subscriptionAPI } from '../api/subscription';
import { kycAPI } from '../api/kyc';
import type { UserSubscription } from '../types';
import { getImageUrl, getAvatarPlaceholder, getImagePlaceholder } from '../utils/imageUtils';
import Settings from '../components/Settings';
import ActivityTab from '../components/ActivityTab';
import BadgeDisplay from '../components/BadgeDisplay';
import BankAccountManagementPage from './BankAccountManagementPage';
import TransactionHistoryPage from './TransactionHistoryPage';
import toast from '../utils/toast';
import AccountDisabledBanner from '../components/AccountDisabledBanner';

const ProfilePage: React.FC = () => {
  const { t } = useTranslation();
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState('overview');
  const [userProfile, setUserProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [kycVerified, setKycVerified] = useState(false);
  const [kycStatus, setKycStatus] = useState<string>('NOT_SUBMITTED');

  // API Hooks
  const { data: myPropertiesData } = useMyProperties(0, 10);
  const { data: favoritesData } = useMyFavorites(0, 12);

  const myProperties = myPropertiesData?.content || [];
  const favorites = favoritesData?.content || [];

  // Load user profile from settings API (includes avatar from database)
  useEffect(() => {
    const loadUserProfile = async () => {
      try {
        setLoading(true);
        const settings = await settingsAPI.getCurrentSettings();
        // Merge settings data with user data
        setUserProfile({
          ...user,
          ...settings,
          avatar: settings.avatarUrl || user?.avatar, // Use avatarUrl from database
          phoneNumber: settings.phone || user?.phoneNumber,
        });
      } catch (error: any) {
        toast.error('Kh�ng th? t?i th�ng tin c� nh�n');
        // Fallback to user from auth store
        setUserProfile(user);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      loadUserProfile();
    } else {
      setUserProfile(null);
      setLoading(false);
    }
  }, [user]);

  // Load KYC status
  useEffect(() => {
    if (user?.id) {
      kycAPI.getStatus(String(user.id)).then(data => {
        if ('id' in data) {
          setKycStatus(data.status);
          setKycVerified(data.status === 'VERIFIED');
        }
      }).catch(() => {});
    }
  }, [user?.id]);


  const tabs = [
    { id: 'overview', label: t('profile.overview'), icon: User },
    { id: 'properties', label: t('profile.myProperties'), icon: Building2 },
    { id: 'favorites', label: t('profile.myFavorites'), icon: Heart },
    { id: 'subscription', label: t('profile.subscription'), icon: Package },
    { id: 'activities', label: t('profile.activities'), icon: TrendingUp },
    { id: 'bank-accounts', label: t('profile.bankAccounts'), icon: CreditCard },
    { id: 'transactions', label: t('profile.transactionHistory'), icon: DollarSign },
    { id: 'settings', label: t('profile.settings'), icon: Shield },
  ];



  const formatPrice = (price: number) => {
    if (price >= 1000000000) {
      return `${(price / 1000000000).toFixed(1)} ${t('common.billion')}`;
    }
    if (price >= 1000000) {
      return `${(price / 1000000).toFixed(0)} ${t('common.million')}`;
    }
    return price.toLocaleString('vi-VN');
  };

  const getPropertyTypeLabel = (type: string) => {
    const types: Record<string, string> = {
      'APARTMENT': t('profile.propertyTypes.apartment'),
      'HOUSE': t('profile.propertyTypes.house'),
      'VILLA': t('profile.propertyTypes.villa'),
      'OFFICE': t('profile.propertyTypes.office'),
      'LAND': t('profile.propertyTypes.land'),
      'OTHER': t('profile.propertyTypes.other')
    };
    return types[type] || type;
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      'AVAILABLE': 'bg-green-100 text-green-800',
      'SOLD': 'bg-gray-100 text-gray-800',
      'RENTED': 'bg-blue-100 text-blue-800',
      'PENDING': 'bg-yellow-100 text-yellow-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      'AVAILABLE': t('profile.status.available'),
      'SOLD': t('profile.status.sold'),
      'RENTED': t('profile.status.rented'),
      'PENDING': t('profile.status.pending')
    };
    return labels[status] || status;
  };

  const OverviewTab = () => {
    if (loading) {
      return (
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-20 bg-gray-200 rounded"></div>
            <div className="h-32 bg-gray-200 rounded"></div>
          </div>
        </div>
      );
    }

    return (
    <div className="space-y-6">
      {/* Profile Card */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <img
                src={getImageUrl(userProfile?.avatar) || getAvatarPlaceholder(80)}
                alt={t('profile.avatar')}
                className="w-20 h-20 rounded-full object-cover"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  if (target.src !== getAvatarPlaceholder(80)) {
                    target.src = getAvatarPlaceholder(80);
                  }
                }}
              />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                {userProfile?.fullName || t('profile.user')}
                {kycVerified ? (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 text-xs font-semibold" title="Đã xác minh CCCD">
                    <CheckCircle2 className="w-3 h-3" /> Đã xác minh
                  </span>
                ) : (
                  <Link to="/kyc-verify" className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 text-xs font-semibold hover:bg-amber-200 transition-colors" title="Chưa xác minh — Nhấn để xác minh">
                    <Shield className="w-3 h-3" /> Chưa xác minh
                  </Link>
                )}
              </h2>
              <div className="flex items-center text-gray-600 mt-1">
                <Award className="w-4 h-4 mr-1" />
                <span>{t('profile.memberSince')} {new Date(userProfile?.createdAt || Date.now()).getFullYear()}</span>
              </div>
              <div className="flex items-center space-x-4 mt-2 text-sm text-gray-600">
                <div className="flex items-center">
                  <Building2 className="w-4 h-4 mr-1" />
                  <span>{myProperties.length} {t('profile.listings')}</span>
                </div>
                <div className="flex items-center">
                  <Heart className="w-4 h-4 mr-1" />
                  <span>{favorites.length} {t('profile.savedListings')}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="font-semibold text-gray-900 mb-3">{t('profile.contactInfo')}</h3>
            <div className="space-y-2">
              <div className="flex items-center text-gray-600">
                <Mail className="w-4 h-4 mr-3" />
                <span>{userProfile?.email}</span>
              </div>
              <div className="flex items-center text-gray-600">
                <Phone className="w-4 h-4 mr-3" />
                <span>{userProfile?.phoneNumber || userProfile?.phone || t('profile.notUpdated')}</span>
              </div>
              <div className="flex items-center text-gray-600">
                <MapPin className="w-4 h-4 mr-3" />
                <span>{userProfile?.address || t('profile.notUpdated')}</span>
              </div>
            </div>
          </div>

          <div>
            <h3 className="font-semibold text-gray-900 mb-3">{t('profile.activityStatistics')}</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div className="bg-gray-50 rounded-lg p-3 text-center">
                <div className="text-2xl font-bold text-red-600">{myProperties.length}</div>
                <div className="text-sm text-gray-600">{t('myProperties.total')}</div>
              </div>
              <div className="bg-gray-50 rounded-lg p-3 text-center">
                <div className="text-2xl font-bold text-blue-600">{favorites.length}</div>
                <div className="text-sm text-gray-600">{t('profile.savedListings')}</div>
              </div>
              <Link
                to="/landlord-analytics"
                className="bg-red-50 border border-red-100 rounded-lg p-3 text-center hover:bg-red-100 transition-colors cursor-pointer group flex flex-col items-center justify-center col-span-2 md:col-span-1"
              >
                <TrendingUp className="w-6 h-6 mb-1 text-red-600 group-hover:scale-110 transition-transform" />
                <div className="text-sm font-semibold text-red-800">Thống kê BĐS</div>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* KYC Verification Card */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
          <Shield className="w-4 h-4 text-blue-600" />
          Xác minh danh tính (KYC)
        </h3>
        {kycVerified ? (
          <div className="flex items-center gap-2 text-sm text-emerald-700 bg-emerald-50 rounded-lg px-3 py-2">
            <CheckCircle2 className="w-4 h-4" />
            <span>Tài khoản đã xác minh CCCD — Hiển thị badge uy tín trên trang cá nhân và hợp đồng</span>
          </div>
        ) : kycStatus === 'PENDING' ? (
          <div className="flex items-center gap-2 text-sm text-amber-700 bg-amber-50 rounded-lg px-3 py-2">
            <Clock className="w-4 h-4" />
            <span>Đang chờ xác minh</span>
          </div>
        ) : kycStatus === 'REJECTED' ? (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-red-700 bg-red-50 rounded-lg px-3 py-2">
              <XCircle className="w-4 h-4" />
              <span>Xác minh bị từ chối — vui lòng thử lại</span>
            </div>
            <Link to="/kyc-verify" className="block text-center px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors">
              Xác minh lại
            </Link>
          </div>
        ) : (
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-600">Xác minh CCCD để tăng uy tín và mở khoá giao dịch hợp đồng.</p>
            <Link to="/kyc-verify" className="shrink-0 ml-4 px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors">
              Xác minh ngay
            </Link>
          </div>
        )}
      </div>

      {/* User Badges */}
      {userProfile?.id && (
        <div className="bg-white rounded-lg shadow-sm p-6">
          <BadgeDisplay userId={userProfile.id} title="Huy hiệu của bạn" />
          <div className="mt-3">
            <Link to="/badges" className="text-sm font-medium text-red-600 hover:underline">
              Xem tất cả huy hiệu
            </Link>
          </div>
        </div>
      )}

      {/* Recent Activity */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-4">{t('profile.recentActivity')}</h3>
        <div className="space-y-4">
          <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <div className="flex-1">
              <p className="text-gray-900">{t('profile.postedListing', { title: 'Căn hộ cao cấp Vinhomes Central Park' })}</p>
              <p className="text-sm text-gray-500">{t('profile.daysAgo', { count: 2 })}</p>
            </div>
          </div>
          <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
            <div className="flex-1">
              <p className="text-gray-900">{t('profile.savedListing', { title: 'Nhà phố hiện đại Thủ Đức' })}</p>
              <p className="text-sm text-gray-500">{t('profile.daysAgo', { count: 3 })}</p>
            </div>
          </div>
          <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
            <div className="w-2 h-2 bg-red-500 rounded-full"></div>
            <div className="flex-1">
              <p className="text-gray-900">{t('profile.viewedYourListing', { count: 5 })}</p>
              <p className="text-sm text-gray-500">{t('profile.weeksAgo', { count: 1 })}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
    );
  };

  const PropertiesTab = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-bold text-gray-900">{t('profile.myProperties')} ({myProperties.length})</h3>
        <Link
          to="/post-property"
          className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
        >
          {t('profile.newListing')}
        </Link>
      </div>

      {myProperties.length === 0 ? (
        <div className="text-center py-12">
          <Building2 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">{t('profile.noListings')}</h3>
          <p className="text-gray-600 mb-4">{t('profile.noListingsDesc')}</p>
          <Link
            to="/post-property"
            className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700"
          >
            {t('profile.postNow')}
          </Link>
        </div>
      ) : (
        <div className="grid gap-6">
          {myProperties.map((property: any) => (
            <div key={property.id} className="bg-white rounded-lg shadow-sm border overflow-hidden">
              {/* Property Image */}
              <div className="relative h-48 bg-gray-200">
                {property.mainImageUrl || (property.images && property.images.length > 0) ? (
                  <img
                    src={getImageUrl(property.mainImageUrl || property.images?.[0]?.imageUrl) || getImagePlaceholder(400, 200)}
                    alt={property.title}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = getImagePlaceholder(400, 200);
                    }}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gray-100">
                    <Building2 className="w-16 h-16 text-gray-400" />
                  </div>
                )}
                <div className="absolute top-2 left-2">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(property.status)}`}>
                    {getStatusLabel(property.status)}
                  </span>
                </div>
              </div>

              <div className="p-4">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <h4 className="text-lg font-semibold text-gray-900 mb-2 hover:text-red-600 transition-colors">
                      <Link to={`/properties/${property.id}`}>
                        {property.title}
                      </Link>
                    </h4>
                    <div className="text-2xl font-bold text-red-600 mb-2">
                      {formatPrice(property.price)}
                    </div>
                    <div className="flex items-center space-x-4 text-sm text-gray-600 mb-2">
                      <span>{property.area} m²</span>
                      {property.bedrooms && <span>• {property.bedrooms} PN</span>}
                      {property.bathrooms && <span>• {property.bathrooms} WC</span>}
                      <span>• {getPropertyTypeLabel(property.propertyType)}</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <MapPin className="w-4 h-4 mr-1" />
                      <span>{property.address}</span>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center justify-between pt-4 border-t">
                  <div className="flex items-center space-x-4 text-sm text-gray-600">
                    {property.viewCount !== undefined && (
                      <div className="flex items-center">
                        <Eye className="w-4 h-4 mr-1" />
                        <span>{t('profile.viewsCount', { count: property.viewCount || 0 })}</span>
                      </div>
                    )}
                    <span className="text-sm text-gray-500">
                      {t('profile.postedOn', { date: new Date(property.createdAt).toLocaleDateString('vi-VN') })}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Link
                      to={`/properties/${property.id}`}
                      className="flex items-center px-4 py-2 text-sm text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors border border-blue-200"
                      title={t('profile.viewDetails')}
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      {t('profile.viewDetails')}
                    </Link>
                    <Link
                      to={`/edit-property/${property.id}`}
                      className="flex items-center px-4 py-2 text-sm text-white bg-green-600 hover:bg-green-700 rounded-lg transition-colors"
                      title={t('profile.edit')}
                    >
                      <Edit3 className="w-4 h-4 mr-2" />
                      {t('profile.edit')}
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const FavoritesTab = () => (
    <div className="space-y-6">
      <h3 className="text-xl font-bold text-gray-900">{t('profile.myFavorites')} ({favorites.length})</h3>

      {favorites.length === 0 ? (
        <div className="text-center py-12">
          <Heart className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">{t('profile.noSavedListings')}</h3>
          <p className="text-gray-600 mb-4">{t('profile.noSavedListingsDesc')}</p>
          <Link
            to="/properties"
            className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700"
          >
            {t('profile.exploreListings')}
          </Link>
        </div>
      ) : (
        <div className="grid gap-6">
          {favorites.map((favorite: any) => (
            <div key={favorite.id} className="bg-white rounded-lg shadow-sm border p-4">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h4 className="text-lg font-semibold text-gray-900 mb-2">
                    {favorite.property?.title}
                  </h4>
                  <div className="text-2xl font-bold text-red-600 mb-2">
                    {favorite.property && formatPrice(favorite.property.price)}
                  </div>
                  <div className="flex items-center space-x-4 text-sm text-gray-600 mb-2">
                    <span>{favorite.property?.area} m²</span>
                    <span>•</span>
                    <span>{favorite.property && getPropertyTypeLabel(favorite.property.propertyType)}</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <MapPin className="w-4 h-4 mr-1" />
                    <span>{favorite.property?.address}</span>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <Link
                    to={`/properties/${favorite.property?.id}`}
                    className="p-2 text-gray-600 hover:text-blue-600"
                  >
                    <Eye className="w-4 h-4" />
                  </Link>
                  <button className="p-2 text-red-600 hover:text-red-700">
                    <Heart className="w-4 h-4 fill-current" />
                  </button>
                </div>
              </div>
              <div className="pt-4 border-t">
                <span className="text-sm text-gray-500">
                  {t('profile.savedOn', { date: new Date(favorite.createdAt).toLocaleDateString('vi-VN') })}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  // Subscription Tab Component
  const SubscriptionTab = () => {
    const [currentSubscription, setCurrentSubscription] = useState<UserSubscription | null>(null);
    const [subscriptionHistory, setSubscriptionHistory] = useState<any>(null);
    const [loadingSub, setLoadingSub] = useState(true);

    useEffect(() => {
      loadSubscriptionData();
    }, []);

    const loadSubscriptionData = async () => {
      setLoadingSub(true);
      try {
        const [current, history] = await Promise.all([
          subscriptionAPI.getCurrent().catch((error: any) => {
            // 404 means no subscription, which is fine - không log error
            if (error.response?.status === 404) {
              return null;
            }
            // Chỉ log error cho các lỗi khác 404
            // subscription fetch failed silently;
            throw error;
          }),
          subscriptionAPI.getHistory(0, 10).catch((error: any) => {
            // Log error nếu không phải 404
            if (error.response?.status !== 404) {
              // history fetch failed silently;
            }
            return { content: [], totalElements: 0 };
          })
        ]);
        setCurrentSubscription(current);
        setSubscriptionHistory(history);
      } catch (error: any) {
        // Chỉ log error nếu không phải 404 (đã được xử lý ở trên)
        if (error.response?.status !== 404) {
          toast.error('Kh�ng th? t?i th�ng tin g�i d?ch v?');
        }
        // Set empty state on error
        setCurrentSubscription(null);
        setSubscriptionHistory({ content: [], totalElements: 0 });
      } finally {
        setLoadingSub(false);
      }
    };

    const handleCancelSubscription = async (id: string) => {
      if (!window.confirm(t('profile.confirmCancel'))) {
        return;
      }
      try {
        await subscriptionAPI.cancel(id);
        toast.success(t('profile.cancelSuccess'));
        loadSubscriptionData();
      } catch (error: any) {
        toast.error(error.response?.data?.error || t('profile.cancelError'));
      }
    };

    const formatDate = (dateString: string) => {
      return new Date(dateString).toLocaleDateString('vi-VN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    };

    const getDaysRemaining = (endDate: string) => {
      const end = new Date(endDate);
      const now = new Date();
      const diff = end.getTime() - now.getTime();
      const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
      return days > 0 ? days : 0;
    };

    if (loadingSub) {
      return (
        <div className="bg-white rounded-lg shadow-sm p-8 text-center">
          <div className="animate-spin h-8 w-8 border-4 border-red-600 border-t-transparent rounded-full mx-auto"></div>
          <p className="mt-4 text-gray-600">{t('profile.loadingSubscription')}</p>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        {/* Current Subscription */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Package className="h-5 w-5 text-red-600" />
            {t('profile.currentSubscription')}
          </h3>

          {currentSubscription ? (
            <div className="border border-gray-200 rounded-lg p-5">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-1">
                    {currentSubscription.listingPackage?.name || t('profile.subscriptionPackage')}
                  </h4>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Calendar className="h-4 w-4" />
                    <span>
                      {t('profile.fromTo', { start: formatDate(currentSubscription.startDate), end: formatDate(currentSubscription.endDate) })}
                    </span>
                  </div>
                </div>
                <div className={`px-3 py-1 rounded-full text-xs font-semibold ${
                  currentSubscription.status === 'ACTIVE'
                    ? 'bg-green-100 text-green-700'
                    : currentSubscription.status === 'EXPIRED'
                    ? 'bg-gray-100 text-gray-700'
                    : 'bg-red-100 text-red-700'
                }`}>
                  {currentSubscription.status === 'ACTIVE' && <CheckCircle2 className="h-3 w-3 inline mr-1" />}
                  {currentSubscription.status === 'EXPIRED' && <XCircle className="h-3 w-3 inline mr-1" />}
                  {currentSubscription.status === 'CANCELLED' && <XCircle className="h-3 w-3 inline mr-1" />}
                  {currentSubscription.status === 'ACTIVE' ? t('profile.active') :
                   currentSubscription.status === 'EXPIRED' ? t('profile.expired') :
                   currentSubscription.status === 'CANCELLED' ? t('profile.cancelled') : currentSubscription.status}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <p className="text-sm text-gray-600 mb-1">{t('profile.daysRemaining')}</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {t('profile.days', { count: getDaysRemaining(currentSubscription.endDate) })}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">{t('profile.used')}</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {t('profile.of', { used: currentSubscription.propertiesUsed, max: currentSubscription.listingPackage?.maxProperties || '∞' })}
                  </p>
                </div>
              </div>

              {currentSubscription.status === 'ACTIVE' && (
                <button
                  onClick={() => handleCancelSubscription(currentSubscription.id)}
                  className="w-full px-4 py-2 border border-red-600 text-red-600 rounded-lg hover:bg-red-50 transition-colors font-medium"
                >
                  {t('profile.cancelSubscription')}
                </button>
              )}

              {currentSubscription.status === 'EXPIRED' && (
                <Link
                  to="/pricing"
                  className="block w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium text-center"
                >
                  {t('profile.renewOrBuy')}
                </Link>
              )}
            </div>
          ) : (
            <div className="border border-gray-200 rounded-lg p-8 text-center">
              <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h4 className="text-lg font-semibold text-gray-900 mb-2">{t('profile.noSubscription')}</h4>
              <p className="text-gray-600 mb-4">{t('profile.noSubscriptionDesc')}</p>
              <Link
                to="/pricing"
                className="inline-block px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
              >
                {t('profile.viewPackages')}
              </Link>
            </div>
          )}
        </div>

        {/* Subscription History */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-4">{t('profile.subscriptionHistory')}</h3>
          {subscriptionHistory?.content && subscriptionHistory.content.length > 0 ? (
            <div className="space-y-4">
              {subscriptionHistory.content.map((sub: UserSubscription) => (
                <div key={sub.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h4 className="font-semibold text-gray-900">
                        {sub.listingPackage?.name || t('profile.subscriptionPackage')}
                      </h4>
                      <p className="text-sm text-gray-600">
                        {formatDate(sub.startDate)} - {formatDate(sub.endDate)}
                      </p>
                    </div>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      sub.status === 'ACTIVE' ? 'bg-green-100 text-green-700' :
                      sub.status === 'EXPIRED' ? 'bg-gray-100 text-gray-700' :
                      'bg-red-100 text-red-700'
                    }`}>
                      {sub.status === 'ACTIVE' ? t('profile.active') :
                       sub.status === 'EXPIRED' ? t('profile.expired') :
                       sub.status === 'CANCELLED' ? t('profile.cancelled') : sub.status}
                    </span>
                  </div>
                  <div className="text-sm text-gray-600">
                    {t('profile.used')}: {t('profile.of', { used: sub.propertiesUsed, max: sub.listingPackage?.maxProperties || '∞' })}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-600 text-center py-8">{t('profile.noSubscriptionHistory')}</p>
          )}
        </div>
      </div>
    );
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">{t('profile.pleaseLogin')}</h2>
          <p className="text-gray-600 mb-6">{t('profile.loginRequired')}</p>
          <Link
            to="/login"
            className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700"
          >
            {t('profile.loginNow')}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Hiển thị banner nếu tài khoản chưa kích hoạt */}
        {user && user.enabled === false && (
          <div className="mb-6">
            <AccountDisabledBanner />
          </div>
        )}
        
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar */}
          <div className="lg:w-64">
            <div className="bg-white rounded-lg shadow-sm p-4 sticky top-4">
              <nav className="space-y-2">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full flex items-center px-3 py-2 text-left rounded-lg transition-colors ${
                        activeTab === tab.id
                          ? 'bg-red-100 text-red-700 font-medium'
                          : 'text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      <Icon className="w-5 h-5 mr-3" />
                      {tab.label}
                    </button>
                  );
                })}
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {activeTab === 'overview' && <OverviewTab />}
            {activeTab === 'properties' && <PropertiesTab />}
            {activeTab === 'favorites' && <FavoritesTab />}
            {activeTab === 'subscription' && <SubscriptionTab />}
            {activeTab === 'activities' && <ActivityTab />}
            {activeTab === 'bank-accounts' && <BankAccountManagementPage />}
            {activeTab === 'transactions' && <TransactionHistoryPage embedded />}
            {activeTab === 'settings' && <Settings />}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
