import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  MapPin,
  Heart,
  Share2,
  Eye,
  Phone,
  Mail,
  MessageCircle,
  Star,
  Calendar,
  Home,
  Ruler,
  Bed,
  Bath,
  Car,
  Shield,
  Zap,
  TreePine,
  Building,
  ChevronLeft,
  ChevronRight,
  User,
  Award,
  TrendingUp,
  Navigation,
  Clock,
  Loader2,
} from 'lucide-react';
import { useProperty, useFavoriteStatus } from '../api/hooks';
import { propertyFavoriteAPI } from '../api';
import { useTranslation } from 'react-i18next';
import { getImageUrl, getImagePlaceholder } from '../utils/imageUtils';
import { useAuthStore } from '../store/authStore';
import FloatingChatBox from '../components/FloatingChatBox';
import PropertyChatList from '../components/PropertyChatList';
import type { Conversation } from '../api/chat';

const PropertyDetailPage: React.FC = () => {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuthStore();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showContactForm, setShowContactForm] = useState(false);
  const [togglingFavorite, setTogglingFavorite] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  
  // API Hooks
  const { data: property, loading, error, refetch } = useProperty(id || '');
  const { data: isFavorited, refetch: refetchFavoriteStatus } = useFavoriteStatus(id || '');

  // Toggle favorite
  const handleToggleFavorite = async () => {
    if (!id || !isAuthenticated) {
      alert('Vui lòng đăng nhập để thêm vào danh sách yêu thích');
      return;
    }
    
    if (togglingFavorite) return; // Prevent double click
    
    try {
      setTogglingFavorite(true);
      const wasFavorited = isFavorited;
      await propertyFavoriteAPI.toggle(id);
      // Refetch favorite status after toggle
      await refetchFavoriteStatus();
      
      // Show success message and offer navigation if adding to favorites
      if (!wasFavorited) {
        const goToFavorites = window.confirm('Đã thêm vào danh sách yêu thích!\n\nBạn có muốn xem danh sách yêu thích không?');
        if (goToFavorites) {
          navigate('/favorites');
        }
      } else {
        alert('Đã xóa khỏi danh sách yêu thích');
      }
    } catch (error: any) {
      console.error('Error toggling favorite:', error);
      const errorMessage = error.response?.data?.message || 'Có lỗi xảy ra khi cập nhật danh sách yêu thích';
      alert(errorMessage);
    } finally {
      setTogglingFavorite(false);
    }
  };

  // Handle owner selecting a conversation to reply
  const handleSelectConversation = (conversation: Conversation) => {
    setSelectedConversation(conversation);
    setIsChatOpen(true);
  };

  const formatPrice = (price: number) => {
    if (price >= 1000000000) {
      return `${(price / 1000000000).toFixed(1)} tỷ`;
    } else if (price >= 1000000) {
      return `${(price / 1000000).toFixed(0)} triệu`;
    }
    return price.toLocaleString();
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="animate-spin h-8 w-8 text-red-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Lỗi tải dữ liệu</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button 
            onClick={refetch}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            Thử lại
          </button>
        </div>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Không tìm thấy bất động sản</h2>
          <p className="text-gray-600">Bất động sản bạn tìm kiếm không tồn tại hoặc đã bị xóa.</p>
        </div>
      </div>
    );
  }
  // Load images from database - use propertyImages (from backend) or fallback to images
  const images = property.propertyImages || property.images || [];
  
  // Load property details - use direct fields from property or from propertyDetails
  const details = property.propertyDetails?.[0];
  
  // Build full address from location data
  const fullAddress = property.location?.fullAddress || 
                      (property.location ? 
                        `${property.address || ''}, ${property.location.ward?.name || ''}, ${property.location.district?.name || ''}, ${property.location.province?.name || ''}`.replace(/^,\s*|,\s*$/g, '') :
                        property.address || '');
  
  // Get owner information
  const owner = property.owner || property.user;
  const ownerName = owner?.fullName || 'Chưa cập nhật';
  const ownerPhone = owner?.phone || property.owner?.phone || '';
  const ownerEmail = owner?.email || property.owner?.email || '';
  
  // Check if current user is the property owner
  const isOwner = isAuthenticated && owner && user?.id === owner.id;

  const nextImage = () => {
    if (images.length > 0) {
      setCurrentImageIndex((prev) => (prev + 1) % images.length);
    }
  };

  const prevImage = () => {
    if (images.length > 0) {
      setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
    }
  };

  // Features - use property fields directly or from details
  const features = [
    { icon: Bed, label: t('common.bedrooms'), value: property.bedrooms || details?.bedrooms },
    { icon: Bath, label: t('common.bathrooms'), value: property.bathrooms || details?.bathrooms },
    { icon: Building, label: t('postProperty.floors'), value: details?.floors },
    { icon: Car, label: t('postProperty.parking'), value: details?.parking ? 'Có' : t('propertyDetail.no') },
    { icon: Shield, label: t('propertyDetail.security'), value: details?.security ? 'Có' : t('propertyDetail.no') },
    { icon: Zap, label: t('postProperty.airConditioning'), value: details?.airConditioning ? 'Có' : t('propertyDetail.no') },
    { icon: TreePine, label: t('postProperty.balcony'), value: details?.balcony ? 'Có' : t('propertyDetail.no') },
    { icon: Home, label: t('postProperty.garden'), value: details?.garden ? 'Có' : t('propertyDetail.no') },
  ].filter(feature => feature.value !== undefined && feature.value !== null);

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      {/* Image Gallery */}
      <div className="bg-white">
        <div className="max-w-7xl mx-auto">
          {images.length > 0 ? (
            <div className="relative">
              <div className="aspect-[16/9] lg:aspect-[21/9] overflow-hidden">
                <img
                  src={getImageUrl(images[currentImageIndex]?.imageUrl) || getImagePlaceholder(1200, 600)}
                  alt={property.title}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = getImagePlaceholder(1200, 600);
                  }}
                />
              </div>
              
              {images.length > 1 && (
                <>
                  <button
                    onClick={prevImage}
                    className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-3 rounded-full hover:bg-opacity-70 transition-all"
                  >
                    <ChevronLeft className="h-6 w-6" />
                  </button>
                  <button
                    onClick={nextImage}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-3 rounded-full hover:bg-opacity-70 transition-all"
                  >
                    <ChevronRight className="h-6 w-6" />
                  </button>
                  
                  <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-50 text-white px-3 py-1 rounded-full text-sm">
                    {currentImageIndex + 1} / {images.length}
                  </div>
                </>
              )}

              {/* Action Buttons */}
              <div className="absolute top-4 right-4 flex space-x-2">
                <button
                  onClick={handleToggleFavorite}
                  disabled={togglingFavorite || !isAuthenticated}
                  className={`p-3 rounded-full transition-colors ${
                    isFavorited 
                      ? 'bg-red-600 text-white' 
                      : 'bg-white bg-opacity-90 text-gray-600 hover:bg-opacity-100'
                  } ${!isAuthenticated ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                  title={isFavorited ? 'Xóa khỏi danh sách yêu thích' : 'Thêm vào danh sách yêu thích'}
                >
                  {togglingFavorite ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <Heart className={`h-5 w-5 ${isFavorited ? 'fill-current' : ''}`} />
                  )}
                </button>
                <button className="p-3 bg-white bg-opacity-90 text-gray-600 rounded-full hover:bg-opacity-100 transition-colors">
                  <Share2 className="h-5 w-5" />
                </button>
              </div>
            </div>
          ) : (
            <div className="aspect-[16/9] lg:aspect-[21/9] bg-gray-200 flex items-center justify-center">
              <span className="text-gray-500">Không có hình ảnh</span>
            </div>
          )}

          {/* Thumbnail Gallery */}
          {images.length > 1 && (
            <div className="p-4 overflow-x-auto">
              <div className="flex space-x-2">
                {images.map((image: any, index: number) => (
                  <button
                    key={image.id}
                    onClick={() => setCurrentImageIndex(index)}
                    className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-colors ${
                      index === currentImageIndex 
                        ? 'border-red-600' 
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    <img
                      src={getImageUrl(image.imageUrl) || getImagePlaceholder(80, 80)}
                      alt={`${property.title} ${index + 1}`}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = getImagePlaceholder(80, 80);
                      }}
                    />
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Property Details */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 mt-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Header */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <span className={`inline-block px-3 py-1 text-sm font-medium rounded-full text-white mb-3 ${
                    (property.listingType || property.transactionType) === 'SALE' ? 'bg-green-600' : 'bg-blue-600'
                  }`}>
                    {(property.listingType || property.transactionType) === 'SALE' ? t('common.sell') : t('postProperty.forRent')}
                  </span>
                  <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">
                    {property.title}
                  </h1>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold text-red-600">
                    {formatPrice(Number(property.price))}
                    {(property.listingType || property.transactionType) === 'RENT' && (
                      <span className="text-lg text-gray-500">/tháng</span>
                    )}
                  </div>
                  {property.area && (
                    <div className="text-sm text-gray-500 mt-1">
                      {Math.round(Number(property.price) / Number(property.area)).toLocaleString()} VNĐ/m²
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center text-gray-600 mb-4">
                <MapPin className="h-5 w-5 mr-2" />
                <span>{fullAddress || property.address || 'Chưa cập nhật địa chỉ'}</span>
              </div>

              <div className="flex items-center space-x-6 text-sm text-gray-600">
                <div className="flex items-center">
                  <Ruler className="h-4 w-4 mr-1" />
                  <span>{property.area}m²</span>
                </div>
                {property.views !== undefined && (
                  <div className="flex items-center">
                    <Eye className="h-4 w-4 mr-1" />
                    <span>{property.views?.toLocaleString() || 0} lượt xem</span>
                  </div>
                )}
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 mr-1" />
                  <span>Đăng {formatDate(property.createdAt)}</span>
                </div>
              </div>
            </div>

            {/* Features */}
            {features.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Thông tin chi tiết</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {features.map((feature, index) => {
                    const Icon = feature.icon;
                    return (
                      <div key={index} className="text-center p-4 bg-gray-50 rounded-lg">
                        <Icon className="h-8 w-8 text-red-600 mx-auto mb-2" />
                        <div className="font-medium text-gray-900">{feature.value}</div>
                        <div className="text-sm text-gray-600">{feature.label}</div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Description */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Mô tả</h2>
              <div className="prose max-w-none text-gray-700">
                {property.description.split('\n').map((paragraph: string, index: number) => (
                  <p key={index} className="mb-3">{paragraph}</p>
                ))}
              </div>
            </div>

            {/* Additional Features */}
            {details?.additionalFeatures && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Tiện ích khác</h2>
                <p className="text-gray-700">{details.additionalFeatures}</p>
              </div>
            )}

            {/* Map */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Vị trí</h2>
              <div className="aspect-[16/9] bg-gray-200 rounded-lg flex items-center justify-center">
                <div className="text-center">
                  <Navigation className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-500">Bản đồ sẽ hiển thị tại đây</p>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Owner View: Show list of people who messaged */}
            {isOwner ? (
              <PropertyChatList
                propertyId={property.id}
                onSelectConversation={handleSelectConversation}
                selectedConversationId={selectedConversation?.id}
              />
            ) : (
              /* Client View: Show contact card */
              <div className="bg-white rounded-lg shadow-sm p-6 sticky top-24">
                <div className="text-center mb-6">
                  <Link to={`/users/${owner?.id}`} className="block group">
                    <div className="relative w-20 h-20 mx-auto mb-4">
                      <div className="w-20 h-20 bg-red-600 rounded-full flex items-center justify-center text-white font-bold text-2xl">
                        {ownerName?.charAt(0).toUpperCase() || 'U'}
                      </div>
                      {owner?.avatar && (
                        <img
                          src={getImageUrl(owner.avatar)}
                          alt={ownerName}
                          className="absolute inset-0 w-20 h-20 rounded-full object-cover"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                          }}
                        />
                      )}
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 group-hover:text-red-600 transition-colors">
                      {ownerName}
                    </h3>
                  </Link>
                  {ownerPhone && (
                    <p className="text-sm text-gray-600 mt-1">{ownerPhone}</p>
                  )}
                  {ownerEmail && (
                    <p className="text-sm text-gray-600">{ownerEmail}</p>
                  )}
                  <Link
                    to={`/users/${owner?.id}`}
                    className="inline-block mt-2 text-sm text-red-600 hover:underline"
                  >
                    Xem hồ sơ →
                  </Link>
                  <div className="flex items-center justify-center mt-2">
                    <Star className="h-4 w-4 text-yellow-400 fill-current" />
                    <span className="text-sm text-gray-600 ml-1">4.8 (127 đánh giá)</span>
                  </div>
                  {property.agent && (
                    <div className="mt-2">
                      <span className="inline-block bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full">
                        Môi giới chứng nhận
                      </span>
                    </div>
                  )}
                </div>

                <div className="space-y-3 mb-6">
                  <a 
                    href={`tel:${ownerPhone}`}
                    className="w-full bg-red-600 text-white py-3 px-4 rounded-lg hover:bg-red-700 transition-colors font-medium flex items-center justify-center"
                  >
                    <Phone className="h-5 w-5 mr-2" />
                    Gọi điện
                  </a>
                  <button 
                    onClick={() => setIsChatOpen(true)}
                    className="w-full bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 transition-colors font-medium flex items-center justify-center"
                  >
                    <MessageCircle className="h-5 w-5 mr-2" />
                    Nhắn tin
                  </button>
                  <button
                    onClick={() => setShowContactForm(!showContactForm)}
                    className="w-full border border-red-600 text-red-600 py-3 px-4 rounded-lg hover:bg-red-50 transition-colors font-medium flex items-center justify-center"
                  >
                    <Mail className="h-5 w-5 mr-2" />
                    Liên hệ
                  </button>
                </div>

                {/* Contact Form */}
                {showContactForm && (
                  <div className="border-t pt-6">
                    <h4 className="font-medium text-gray-900 mb-4">Gửi tin nhắn</h4>
                    <form className="space-y-4">
                      <input
                        type="text"
                        placeholder="Họ và tên"
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                      />
                      <input
                        type="tel"
                        placeholder="Số điện thoại"
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                      />
                      <textarea
                        placeholder={t('propertyDetail.messagePlaceholder')}
                        rows={4}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none"
                        defaultValue={`${t('propertyDetail.interestedIn')}"${property.title}". Xin hãy liên hệ với tôi.`}
                      />
                      <button
                        type="submit"
                        className="w-full bg-red-600 text-white py-3 px-4 rounded-lg hover:bg-red-700 transition-colors font-medium"
                      >
                        Gửi tin nhắn
                      </button>
                    </form>
                  </div>
                )}

                {/* Agent Stats */}
                <div className="border-t pt-6 mt-6">
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <div className="text-xl font-bold text-gray-900">45</div>
                      <div className="text-xs text-gray-600">Tin đăng</div>
                    </div>
                    <div>
                      <div className="text-xl font-bold text-gray-900">3.2k</div>
                      <div className="text-xs text-gray-600">Lượt xem</div>
                    </div>
                    <div>
                      <div className="text-xl font-bold text-gray-900">98%</div>
                      <div className="text-xs text-gray-600">Phản hồi</div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Quick Stats */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Thống kê nhanh</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <TrendingUp className="h-4 w-4 text-green-600 mr-2" />
                    <span className="text-sm text-gray-600">Giá trung bình khu vực</span>
                  </div>
                  <span className="text-sm font-medium text-gray-900">45 triệu/m²</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Award className="h-4 w-4 text-red-600 mr-2" />
                    <span className="text-sm text-gray-600">Đánh giá khu vực</span>
                  </div>
                  <span className="text-sm font-medium text-gray-900">Tốt</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Clock className="h-4 w-4 text-blue-600 mr-2" />
                    <span className="text-sm text-gray-600">Thời gian bán trung bình</span>
                  </div>
                  <span className="text-sm font-medium text-gray-900">45 ngày</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Floating Chat Box */}
      {property.owner && (
        <FloatingChatBox
          propertyId={property.id}
          propertyOwnerId={isOwner ? undefined : property.owner.id}
          propertyOwnerName={ownerName}
          isOpen={isChatOpen}
          onOpenChange={(open) => {
            setIsChatOpen(open);
            if (!open) setSelectedConversation(null); // Clear selected conversation when closing
          }}
          conversationId={selectedConversation?.id}
        />
      )}
    </div>
  );
};

export default PropertyDetailPage;