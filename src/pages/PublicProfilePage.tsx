import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  User,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Building2,
  Star,
  Award,
  Loader2,
  MessageCircle,
  Heart,
  Eye,
} from 'lucide-react';
import { userAPI } from '../api/user';
import { propertyAPI } from '../api/property';
import { getImageUrl, getAvatarPlaceholder, getImagePlaceholder } from '../utils/imageUtils';
import { useAuthStore } from '../store/authStore';

const PublicProfilePage: React.FC = () => {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user: currentUser } = useAuthStore();
  const [currentPage, setCurrentPage] = useState(0);
  const pageSize = 12;

  // Fetch public profile
  const [profile, setProfile] = useState<any>(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [profileError, setProfileError] = useState<string | null>(null);

  // Fetch user's properties
  const [propertiesData, setPropertiesData] = useState<any>(null);
  const [propertiesLoading, setPropertiesLoading] = useState(true);

  useEffect(() => {
    if (!id) return;

    const fetchProfile = async () => {
      try {
        setProfileLoading(true);
        setProfileError(null);
        const data = await userAPI.getPublicProfile(id);
        setProfile(data);
      } catch (err: any) {
        setProfileError(err.response?.data?.message || err.message || 'Không thể tải thông tin người dùng');
      } finally {
        setProfileLoading(false);
      }
    };

    fetchProfile();
  }, [id]);

  useEffect(() => {
    if (!id) return;

    const fetchProperties = async () => {
      try {
        setPropertiesLoading(true);
        const data = await propertyAPI.getByOwner(id, currentPage, pageSize);
        setPropertiesData(data);
      } catch (err: any) {
        console.error('Error fetching properties:', err);
        setPropertiesData({ content: [], totalPages: 0 });
      } finally {
        setPropertiesLoading(false);
      }
    };

    fetchProperties();
  }, [id, currentPage, pageSize]);

  const properties = propertiesData?.content || [];
  const totalPages = propertiesData?.totalPages || 0;

  const formatPrice = (price: number) => {
    if (price >= 1000000000) {
      return `${(price / 1000000000).toFixed(1)} tỷ`;
    } else if (price >= 1000000) {
      return `${(price / 1000000).toFixed(0)} triệu`;
    }
    return price.toLocaleString('vi-VN');
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN');
  };

  if (profileLoading) {
    return (
      <div className="min-h-screen bg-gray-50 pt-20">
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="flex items-center space-x-6 mb-8">
              <div className="w-32 h-32 bg-gray-300 rounded-full"></div>
              <div className="flex-1">
                <div className="h-8 bg-gray-300 rounded w-1/3 mb-4"></div>
                <div className="h-4 bg-gray-300 rounded w-1/4 mb-2"></div>
                <div className="h-4 bg-gray-300 rounded w-1/2"></div>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-gray-300 h-64 rounded-lg"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (profileError || !profile) {
    return (
      <div className="min-h-screen bg-gray-50 pt-20">
        <div className="container mx-auto px-4 py-8 text-center">
          <div className="mb-8">
            <User className="mx-auto h-24 w-24 text-gray-400" />
          </div>
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Không tìm thấy người dùng</h1>
          <p className="text-gray-600 mb-6">Người dùng bạn đang tìm kiếm không tồn tại hoặc đã bị xóa.</p>
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center px-6 py-3 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 transition-colors"
          >
            Quay lại
          </button>
        </div>
      </div>
    );
  }

  const isOwnProfile = currentUser?.id === profile.id;

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <nav className="flex items-center space-x-2 text-sm text-gray-600 mb-8">
          <Link to="/" className="hover:text-red-600">Trang chủ</Link>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
          <span className="text-gray-800">Hồ sơ</span>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
          <span className="text-gray-800">{profile.fullName}</span>
        </nav>

        {/* Profile Header */}
        <div className="bg-white rounded-lg shadow-md p-8 mb-8">
          <div className="flex flex-col md:flex-row items-start space-y-6 md:space-y-0 md:space-x-8">
            {/* Avatar */}
            <div className="relative flex-shrink-0">
              <div className="relative w-32 h-32 md:w-40 md:h-40">
                <div className="w-32 h-32 md:w-40 md:h-40 bg-red-600 rounded-full flex items-center justify-center text-white font-bold text-4xl md:text-5xl">
                  {profile.fullName?.charAt(0).toUpperCase() || 'U'}
                </div>
                {profile.avatarUrl && (
                  <img
                    src={getImageUrl(profile.avatarUrl) || getAvatarPlaceholder(160)}
                    alt={profile.fullName}
                    className="absolute inset-0 w-32 h-32 md:w-40 md:h-40 rounded-full object-cover border-4 border-white shadow-lg"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                )}
              </div>
              {profile.isAgent && (
                <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 bg-green-500 text-white px-3 py-1 rounded-full text-xs font-semibold">
                  Môi giới
                </div>
              )}
            </div>

            {/* Profile Info */}
            <div className="flex-1 w-full">
              <div className="flex flex-col md:flex-row md:items-start md:justify-between mb-4">
                <div className="flex-1">
                  <h1 className="text-3xl font-bold text-gray-800 mb-2">{profile.fullName}</h1>
                  
                  {profile.isAgent && profile.agentLicense && (
                    <div className="flex items-center space-x-4 text-gray-600 mb-2">
                      <span className="flex items-center text-green-600">
                        <Award className="w-5 h-5 mr-1" />
                        Giấy phép: {profile.agentLicense}
                      </span>
                    </div>
                  )}

                  {/* Stats */}
                  <div className="flex items-center space-x-6 mb-4">
                    <div className="flex items-center text-gray-600">
                      <Building2 className="w-5 h-5 mr-2 text-red-600" />
                      <span className="font-semibold">{profile.totalProperties || 0}</span>
                      <span className="ml-1">tin đăng</span>
                    </div>
                    {profile.averageRating && (
                      <div className="flex items-center">
                        <div className="flex text-yellow-400">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`w-5 h-5 ${i < Math.floor(profile.averageRating!) ? 'fill-current' : 'text-gray-300'}`}
                            />
                          ))}
                        </div>
                        <span className="ml-2 text-gray-600">
                          {profile.averageRating.toFixed(1)} ({profile.totalReviews || 0} đánh giá)
                        </span>
                      </div>
                    )}
                    <div className="flex items-center text-gray-600">
                      <Calendar className="w-5 h-5 mr-2" />
                      Tham gia {formatDate(profile.createdAt)}
                    </div>
                  </div>

                  {/* Contact Info */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    {profile.phone && (
                      <div className="flex items-center text-gray-600">
                        <Phone className="w-5 h-5 mr-2 text-red-600" />
                        <a href={`tel:${profile.phone}`} className="hover:text-red-600">
                          {profile.phone}
                        </a>
                      </div>
                    )}
                    {profile.address && (
                      <div className="flex items-center text-gray-600">
                        <MapPin className="w-5 h-5 mr-2 text-red-600" />
                        <span>{profile.address}</span>
                      </div>
                    )}
                  </div>

                  {/* Bio */}
                  {profile.bio && (
                    <div className="mb-6">
                      <p className="text-gray-700 leading-relaxed">{profile.bio}</p>
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                {!isOwnProfile && (
                  <div className="flex flex-col space-y-2 mt-4 md:mt-0 md:ml-4">
                    <a
                      href={`tel:${profile.phone || ''}`}
                      className="bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition-colors font-medium text-center flex items-center justify-center"
                    >
                      <Phone className="w-5 h-5 mr-2" />
                      Gọi điện
                    </a>
                    <button className="border border-gray-300 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-50 transition-colors font-medium flex items-center justify-center">
                      <MessageCircle className="w-5 h-5 mr-2" />
                      Nhắn tin
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Properties Section */}
        <div className="bg-white rounded-lg shadow-md p-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-800">
              Bất động sản đã đăng ({profile.totalProperties || 0})
            </h2>
          </div>

          {propertiesLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-gray-200 h-64 rounded-lg animate-pulse"></div>
              ))}
            </div>
          ) : properties.length === 0 ? (
            <div className="text-center py-12">
              <Building2 className="mx-auto h-16 w-16 text-gray-400 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Chưa có tin đăng nào</h3>
              <p className="text-gray-600">Người dùng này chưa đăng bất động sản nào.</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {properties.map((property: any) => (
                  <Link
                    key={property.id}
                    to={`/properties/${property.id}`}
                    className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow overflow-hidden group"
                  >
                    {/* Image */}
                    <div className="relative aspect-[4/3] overflow-hidden">
                      <img
                        src={
                          getImageUrl(property.propertyImages?.[0]?.imageUrl || property.images?.[0]) ||
                          getImagePlaceholder(400, 300)
                        }
                        alt={property.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = getImagePlaceholder(400, 300);
                        }}
                      />
                      <div className="absolute top-2 right-2">
                        <span
                          className={`px-2 py-1 text-xs font-medium rounded-full text-white ${
                            property.listingType === 'SALE' ? 'bg-green-600' : 'bg-blue-600'
                          }`}
                        >
                          {property.listingType === 'SALE' ? t('common.sell') : t('postProperty.forRent')}
                        </span>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-4">
                      <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 group-hover:text-red-600 transition-colors">
                        {property.title}
                      </h3>
                      <div className="flex items-center text-gray-600 text-sm mb-2">
                        <MapPin className="w-4 h-4 mr-1" />
                        <span className="line-clamp-1">
                          {property.location?.fullAddress ||
                            property.address ||
                            property.location?.ward?.name + ', ' + property.location?.district?.name ||
                            'Chưa cập nhật'}
                        </span>
                      </div>
                      <div className="flex items-center justify-between mb-2">
                        <div className="text-red-600 font-bold text-lg">
                          {formatPrice(Number(property.price))}
                          {property.listingType === 'RENT' && <span className="text-sm">/tháng</span>}
                        </div>
                        <div className="text-gray-600 text-sm">{property.area}m²</div>
                      </div>
                      <div className="flex items-center justify-between text-sm text-gray-500">
                        <div className="flex items-center">
                          <Eye className="w-4 h-4 mr-1" />
                          {property.views || 0} lượt xem
                        </div>
                        <div className="flex items-center">
                          <Calendar className="w-4 h-4 mr-1" />
                          {formatDate(property.createdAt)}
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center space-x-2 mt-8">
                  <button
                    onClick={() => setCurrentPage((prev) => Math.max(0, prev - 1))}
                    disabled={currentPage === 0}
                    className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                  >
                    Trước
                  </button>
                  <span className="px-4 py-2 text-gray-600">
                    Trang {currentPage + 1} / {totalPages}
                  </span>
                  <button
                    onClick={() => setCurrentPage((prev) => Math.min(totalPages - 1, prev + 1))}
                    disabled={currentPage >= totalPages - 1}
                    className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                  >
                    Sau
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default PublicProfilePage;

