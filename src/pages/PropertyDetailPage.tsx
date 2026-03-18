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
  CreditCard,
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
  Flag,
  X,
} from 'lucide-react';
import { useProperty, useFavoriteStatus } from '../api/hooks';
import { propertyFavoriteAPI } from '../api';
import { propertyAPI } from '../api/property';
import { propertyTransactionAPI } from '../api/propertyTransaction';
import { useTranslation } from 'react-i18next';
import { getImageUrl, getImagePlaceholder } from '../utils/imageUtils';
import { useAuthStore } from '../store/authStore';
import FloatingChatBox from '../components/FloatingChatBox';
import PropertyChatList from '../components/PropertyChatList';
import type { Conversation } from '../api/chat';
import { toast } from 'react-toastify';
import { REALESTATE_CONTRACT_ADDRESS } from '../config/blockchain';

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
  const [creatingContract, setCreatingContract] = useState(false);
  const [showContractModal, setShowContractModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportReason, setReportReason] = useState('INACCURATE');
  const [reportDescription, setReportDescription] = useState('');
  const [reportSubmitting, setReportSubmitting] = useState(false);
  
  // API Hooks
  const { data: property, loading, error, refetch } = useProperty(id || '');
  const { data: isFavorited, refetch: refetchFavoriteStatus } = useFavoriteStatus(id || '');

  // Toggle favorite
  const handleToggleFavorite = async () => {
    if (!id || !isAuthenticated) {
      alert(t('propertyDetail.loginToFavorite'));
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
        const goToFavorites = window.confirm(`${t('propertyDetail.addedToFavorites')}\n\n${t('propertyDetail.viewFavorites')}`);
        if (goToFavorites) {
          navigate('/favorites');
        }
      } else {
        alert(t('propertyDetail.removedFromFavorites'));
      }
    } catch (error: any) {
      console.error('Error toggling favorite:', error);
      const errorMessage = error.response?.data?.message || t('propertyDetail.favoriteError');
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
          <h2 className="text-2xl font-bold text-gray-900 mb-2">{t('propertyDetail.loadingError')}</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button 
            onClick={refetch}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            {t('propertyDetail.tryAgain')}
          </button>
        </div>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">{t('propertyDetail.notFound')}</h2>
          <p className="text-gray-600">{t('propertyDetail.notFoundMessage')}</p>
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
  const ownerName: string = (owner?.fullName ?? t('propertyDetail.notUpdated') ?? '') as string;
  const ownerPhone = owner?.phone || property.owner?.phone || '';
  const ownerEmail = owner?.email || property.owner?.email || '';
  
  // Format phone number for Zalo (remove spaces, dashes, and ensure it starts with 0 or country code)
  const formatPhoneForZalo = (phone: string): string => {
    if (!phone) return '';
    // Remove all non-digit characters
    let cleaned = phone.replace(/\D/g, '');
    // If phone doesn't start with 0 or country code, add 0
    if (cleaned.length === 9) {
      cleaned = '0' + cleaned;
    }
    // If phone starts with +84, replace with 0
    if (cleaned.startsWith('84')) {
      cleaned = '0' + cleaned.substring(2);
    }
    return cleaned;
  };
  
  const zaloPhone = formatPhoneForZalo(ownerPhone);
  const zaloLink = zaloPhone ? `https://zalo.me/${zaloPhone}` : '#';
  
  // Check if current user is the property owner
  const isOwner = isAuthenticated && owner && user?.id === owner.id;
  const isRentListing = (property.listingType || property.transactionType) === 'RENT';

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
    { icon: Car, label: t('postProperty.parking'), value: details?.parking ? t('propertyDetail.yes') : t('propertyDetail.no') },
    { icon: Shield, label: t('propertyDetail.security'), value: details?.security ? t('propertyDetail.yes') : t('propertyDetail.no') },
    { icon: Zap, label: t('postProperty.airConditioning'), value: details?.airConditioning ? t('propertyDetail.yes') : t('propertyDetail.no') },
    { icon: TreePine, label: t('postProperty.balcony'), value: details?.balcony ? t('propertyDetail.yes') : t('propertyDetail.no') },
    { icon: Home, label: t('postProperty.garden'), value: details?.garden ? t('propertyDetail.yes') : t('propertyDetail.no') },
  ].filter(feature => feature.value !== undefined && feature.value !== null);

  const handleOpenContractModal = () => {
    if (!isAuthenticated || !user) {
      navigate('/login');
      return;
    }

    if (isOwner) {
      toast.info('Bạn là chủ sở hữu tin đăng này, không thể tự tạo hợp đồng mua cho chính mình.');
      return;
    }

    if (!id) {
      toast.error('Không tìm thấy thông tin bất động sản.');
      return;
    }
    setShowContractModal(true);
  };

  const handleCreateTransaction = async (paymentMethod: 'VNPAY' | 'CASH') => {
    if (!id || !user) return;
    if (paymentMethod === 'CASH' && (
      !REALESTATE_CONTRACT_ADDRESS ||
      REALESTATE_CONTRACT_ADDRESS === '0x0000000000000000000000000000000000000000'
    )) {
      toast.error('Chưa cấu hình địa chỉ smart contract. Chọn "Thanh toán VNPay" hoặc liên hệ quản trị viên.');
      return;
    }
    try {
      setCreatingContract(true);
      const transaction = await propertyTransactionAPI.create({
        propertyId: id,
        buyerId: String(user.id),
        paymentMethod,
      });
      setShowContractModal(false);
      navigate(`/transactions/${transaction.id}/contract`);
    } catch (error: any) {
      console.error('Failed to create transaction from property detail:', error);
      const msg =
        error?.message ||
        error?.response?.data?.error ||
        'Không thể tạo giao dịch. Vui lòng thử lại.';
      toast.error(msg);
    } finally {
      setCreatingContract(false);
    }
  };

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
                  title={isFavorited ? t('propertyDetail.removeFromFavorites') : t('propertyDetail.addToFavorites')}
                >
                  {togglingFavorite ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <Heart className={`h-5 w-5 ${isFavorited ? 'fill-current' : ''}`} />
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    void navigator.clipboard?.writeText(window.location.href);
                    toast.info('Đã sao chép liên kết tin đăng.');
                  }}
                  className="p-3 bg-white bg-opacity-90 text-gray-600 rounded-full hover:bg-opacity-100 transition-colors"
                  title="Chia sẻ / sao chép link"
                >
                  <Share2 className="h-5 w-5" />
                </button>
                {!isOwner && (
                  <button
                    type="button"
                    onClick={() => setShowReportModal(true)}
                    className="p-3 bg-white bg-opacity-90 text-gray-600 rounded-full hover:bg-red-50 hover:text-red-600 transition-colors"
                    title="Báo cáo tin vi phạm"
                  >
                    <Flag className="h-5 w-5" />
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="aspect-[16/9] lg:aspect-[21/9] bg-gray-200 flex items-center justify-center">
              <span className="text-gray-500">{t('propertyDetail.noImages')}</span>
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
                      <span className="text-lg text-gray-500">{t('propertyDetail.perMonth')}</span>
                    )}
                  </div>
                  {property.area && (
                    <div className="text-sm text-gray-500 mt-1">
                      {Math.round(Number(property.price) / Number(property.area)).toLocaleString()} {t('propertyDetail.vndPerSqm')}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center text-gray-600 mb-4">
                <MapPin className="h-5 w-5 mr-2" />
                <span>{fullAddress || property.address || t('propertyDetail.addressNotUpdated')}</span>
              </div>

              <div className="flex items-center space-x-6 text-sm text-gray-600">
                <div className="flex items-center">
                  <Ruler className="h-4 w-4 mr-1" />
                  <span>{property.area}m²</span>
                </div>
                {property.views !== undefined && (
                  <div className="flex items-center">
                    <Eye className="h-4 w-4 mr-1" />
                    <span>{property.views?.toLocaleString() || 0} {t('propertyDetail.views')}</span>
                  </div>
                )}
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 mr-1" />
                  <span>{t('propertyDetail.posted')} {formatDate(property.createdAt)}</span>
                </div>
              </div>
            </div>

            {/* Features */}
            {features.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">{t('propertyDetail.detailInfo')}</h2>
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
              <h2 className="text-xl font-bold text-gray-900 mb-4">{t('propertyDetail.description')}</h2>
              <div className="prose max-w-none text-gray-700">
                {property.description.split('\n').map((paragraph: string, index: number) => (
                  <p key={index} className="mb-3">{paragraph}</p>
                ))}
              </div>
            </div>

            {/* Additional Features */}
            {details?.additionalFeatures && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">{t('propertyDetail.additionalFeatures')}</h2>
                <p className="text-gray-700">{details.additionalFeatures}</p>
              </div>
            )}

            {/* Map */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">{t('propertyDetail.location')}</h2>
              <div className="aspect-[16/9] bg-gray-200 rounded-lg flex items-center justify-center">
                <div className="text-center">
                  <Navigation className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-500">{t('propertyDetail.mapPlaceholder')}</p>
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
                          src={getImageUrl(owner.avatar) ?? undefined}
                          alt={ownerName ?? undefined}
                          className="absolute inset-0 w-20 h-20 rounded-full object-cover"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                          }}
                        />
                      )}
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 group-hover:text-red-600 transition-colors">
                      {ownerName || ''}
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
                    {t('propertyDetail.viewProfile')}
                  </Link>
                  <div className="flex items-center justify-center mt-2">
                    <Star className="h-4 w-4 text-yellow-400 fill-current" />
                    <span className="text-sm text-gray-600 ml-1">{t('propertyDetail.rating')}</span>
                  </div>
                  {property.agent && (
                    <div className="mt-2">
                      <span className="inline-block bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full">
                        {t('propertyDetail.certifiedBroker')}
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
                    {t('propertyDetail.call')}
                  </a>
                  {zaloPhone && (
                    <a
                      href={zaloLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full bg-blue-500 text-white py-3 px-4 rounded-lg hover:bg-blue-600 transition-colors font-medium flex items-center justify-center"
                    >
                      <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91C2.13 13.66 2.58 15.36 3.45 16.86L2.05 22L7.3 20.62C8.75 21.41 10.38 21.83 12.04 21.83C17.5 21.83 21.95 17.38 21.95 11.92C21.95 9.27 20.92 6.78 19.05 4.91C17.18 3.03 14.69 2 12.04 2M12.05 3.67C14.25 3.67 16.31 4.53 17.87 6.09C19.42 7.64 20.28 9.7 20.28 11.91C20.28 16.31 16.45 20.14 12.05 20.14C10.56 20.14 9.11 19.76 7.85 19.06L7.55 18.91L4.43 19.65L5.17 16.58L5.02 16.28C4.28 14.95 3.89 13.46 3.89 11.91C3.89 7.5 7.72 3.67 12.05 3.67M8.53 7.33C8.37 7.33 8.1 7.39 7.87 7.64C7.65 7.89 7 8.5 7 9.71C7 10.93 7.89 12.1 8 12.27C8.14 12.44 9.76 14.94 12.25 15.87C12.84 16.07 13.3 16.18 13.66 16.26C14.25 16.4 14.79 16.36 15.22 16.28C15.7 16.18 16.68 15.6 16.89 15C17.1 14.38 17.1 13.87 17.04 13.75C16.97 13.64 16.81 13.58 16.56 13.45C16.31 13.33 14.77 12.55 14.44 12.42C14.12 12.29 13.91 12.23 13.7 12.5C13.5 12.74 12.89 13.5 12.69 13.71C12.5 13.92 12.31 13.95 12.06 13.82C11.81 13.69 10.89 13.33 9.76 12.3C8.89 11.5 8.27 10.55 8.08 10.3C7.89 10.05 8.05 9.96 8.22 9.78C8.39 9.61 8.58 9.36 8.72 9.17C8.87 8.97 8.97 8.83 9.13 8.66C9.28 8.5 9.19 8.36 9.08 8.22C8.97 8.08 8.53 7.33 8.53 7.33Z" />
                      </svg>
                      {t('propertyDetail.contactZalo')}
                    </a>
                  )}
                  <button 
                    onClick={() => setIsChatOpen(true)}
                    className="w-full bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 transition-colors font-medium flex items-center justify-center"
                  >
                    <MessageCircle className="h-5 w-5 mr-2" />
                    {t('propertyDetail.sendMessage')}
                  </button>
                  <button
                    onClick={() => setShowContactForm(!showContactForm)}
                    className="w-full border border-red-600 text-red-600 py-3 px-4 rounded-lg hover:bg-red-50 transition-colors font-medium flex items-center justify-center"
                  >
                    <Mail className="h-5 w-5 mr-2" />
                    {t('propertyDetail.contact')}
                  </button>
                  {/* Mở hợp đồng: VNPay hoặc Blockchain */}
                  {!isOwner && (
                    <button
                      onClick={handleOpenContractModal}
                      className="w-full bg-red-600 text-white py-3 px-4 rounded-lg hover:bg-red-700 transition-colors font-medium flex items-center justify-center"
                    >
                      <Shield className="h-5 w-5 mr-2" />
                      {isRentListing ? 'Mở hợp đồng thuê' : 'Mở hợp đồng mua bán'}
                    </button>
                  )}
                </div>

                {/* Contact Form */}
                {showContactForm && (
                  <div className="border-t pt-6">
                    <h4 className="font-medium text-gray-900 mb-4">{t('propertyDetail.sendMessageTitle')}</h4>
                    <form className="space-y-4">
                      <input
                        type="text"
                        placeholder={t('propertyDetail.fullName')}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                      />
                      <input
                        type="tel"
                        placeholder={t('propertyDetail.phoneNumber')}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                      />
                      <textarea
                        placeholder={t('propertyDetail.messagePlaceholder')}
                        rows={4}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none"
                        defaultValue={`${t('propertyDetail.interestedIn')}"${property.title}". ${t('propertyDetail.contact')}.`}
                      />
                      <button
                        type="submit"
                        className="w-full bg-red-600 text-white py-3 px-4 rounded-lg hover:bg-red-700 transition-colors font-medium"
                      >
                        {t('propertyDetail.sendMessageButton')}
                      </button>
                    </form>
                  </div>
                )}

                {/* Agent Stats */}
                <div className="border-t pt-6 mt-6">
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <div className="text-xl font-bold text-gray-900">45</div>
                      <div className="text-xs text-gray-600">{t('propertyDetail.listings')}</div>
                    </div>
                    <div>
                      <div className="text-xl font-bold text-gray-900">3.2k</div>
                      <div className="text-xs text-gray-600">{t('propertyDetail.views')}</div>
                    </div>
                    <div>
                      <div className="text-xl font-bold text-gray-900">98%</div>
                      <div className="text-xs text-gray-600">{t('propertyDetail.responseRate')}</div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Quick Stats */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="font-semibold text-gray-900 mb-4">{t('propertyDetail.quickStats')}</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <TrendingUp className="h-4 w-4 text-green-600 mr-2" />
                    <span className="text-sm text-gray-600">{t('propertyDetail.avgPriceArea')}</span>
                  </div>
                  <span className="text-sm font-medium text-gray-900">45 {t('propertyDetail.millionPerSqm')}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Award className="h-4 w-4 text-red-600 mr-2" />
                    <span className="text-sm text-gray-600">{t('propertyDetail.areaRating')}</span>
                  </div>
                  <span className="text-sm font-medium text-gray-900">{t('propertyDetail.good')}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Clock className="h-4 w-4 text-blue-600 mr-2" />
                    <span className="text-sm text-gray-600">{t('propertyDetail.avgSellingTime')}</span>
                  </div>
                  <span className="text-sm font-medium text-gray-900">45 {t('propertyDetail.days')}</span>
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

      {/* Blockchain contract preview modal */}
      {showReportModal && id && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 relative">
            <button
              type="button"
              onClick={() => setShowReportModal(false)}
              className="absolute top-3 right-3 p-2 rounded-lg text-gray-500 hover:bg-gray-100"
              aria-label="Đóng"
            >
              <X className="w-5 h-5" />
            </button>
            <h2 className="text-lg font-bold text-gray-900 pr-8">Báo cáo tin đăng</h2>
            <p className="text-sm text-gray-600 mt-1 mb-4">
              Thông tin của bạn giúp chúng tôi duy trì nội dung uy tín. Báo cáo được xử lý nội bộ.
            </p>
            <div className="space-y-3">
              <label className="block text-sm font-medium text-gray-700">Lý do</label>
              <select
                value={reportReason}
                onChange={(e) => setReportReason(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-red-500 focus:border-red-500"
              >
                <option value="INACCURATE">Thông tin sai lệch / giả mạo</option>
                <option value="SPAM">Spam / lừa đảo</option>
                <option value="DUPLICATE">Trùng tin</option>
                <option value="OFFENSIVE">Nội dung không phù hợp</option>
                <option value="OTHER">Khác</option>
              </select>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Mô tả thêm (tuỳ chọn)</label>
                <textarea
                  value={reportDescription}
                  onChange={(e) => setReportDescription(e.target.value)}
                  rows={3}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  placeholder="Ghi chú ngắn giúp bộ phận kiểm duyệt xử lý nhanh hơn"
                />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                type="button"
                onClick={() => setShowReportModal(false)}
                className="flex-1 py-2.5 rounded-lg border border-gray-300 text-gray-700 text-sm font-medium hover:bg-gray-50"
              >
                Huỷ
              </button>
              <button
                type="button"
                disabled={reportSubmitting}
                onClick={async () => {
                  setReportSubmitting(true);
                  try {
                    await propertyAPI.report(id, reportReason, reportDescription.trim() || undefined);
                    toast.success('Đã gửi báo cáo. Cảm ơn bạn.');
                    setShowReportModal(false);
                    setReportDescription('');
                  } catch (e: any) {
                    toast.error(e.response?.data?.message || 'Không gửi được báo cáo.');
                  } finally {
                    setReportSubmitting(false);
                  }
                }}
                className="flex-1 py-2.5 rounded-lg bg-red-600 text-white text-sm font-medium hover:bg-red-700 disabled:opacity-50"
              >
                {reportSubmitting ? 'Đang gửi…' : 'Gửi báo cáo'}
              </button>
            </div>
          </div>
        </div>
      )}

      {showContractModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-xl max-w-2xl w-full shadow-xl overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  {isRentListing ? 'Hợp đồng thuê bất động sản' : 'Hợp đồng mua bán bất động sản'}
                </h2>
                <p className="text-sm text-gray-500 mt-1">
                  Chọn phương thức: thanh toán VNPay hoặc ký hợp đồng trên blockchain (MetaMask).
                </p>
              </div>
            </div>

            <div className="px-6 py-5 space-y-4 max-h-[60vh] overflow-y-auto">
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-2">Thông tin bất động sản</h3>
                <p className="text-gray-900 font-medium">{property.title}</p>
                <p className="text-sm text-gray-600 mt-1">{fullAddress || property.address}</p>
                <p className="text-sm text-gray-700 mt-2">
                  Giá: <span className="font-semibold text-red-600">{formatPrice(Number(property.price))}</span>
                  {isRentListing && <span className="text-gray-500"> / tháng</span>}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 mb-2">Bên A (Người bán/cho thuê)</h3>
                  <p className="text-sm text-gray-800">{ownerName}</p>
                  {ownerPhone && <p className="text-sm text-gray-600 mt-1">SĐT: {ownerPhone}</p>}
                  {ownerEmail && <p className="text-sm text-gray-600">Email: {ownerEmail}</p>}
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 mb-2">Bên B (Người mua/thuê)</h3>
                  <p className="text-sm text-gray-800">{user?.fullName || user?.email}</p>
                  {user?.phoneNumber && <p className="text-sm text-gray-600 mt-1">SĐT: {user.phoneNumber}</p>}
                  <p className="text-sm text-gray-600">Email: {user?.email}</p>
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-2">Điều khoản chính (rút gọn)</h3>
                <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
                  <li>Hai bên thống nhất giao dịch bất động sản nêu trên với giá đã hiển thị.</li>
                  <li>Thông tin chi tiết về pháp lý, thanh toán và bàn giao sẽ được hai bên thoả thuận ngoài hệ thống.</li>
                  <li>Hợp đồng blockchain này chỉ ghi nhận giao dịch trên chuỗi, không thay thế hợp đồng công chứng.</li>
                </ul>
              </div>
            </div>

            <div className="px-6 py-4 border-t border-gray-200 flex flex-col gap-3">
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  type="button"
                  onClick={() => handleCreateTransaction('VNPAY')}
                  disabled={creatingContract}
                  className="flex-1 px-4 py-3 rounded-lg bg-blue-600 text-white hover:bg-blue-700 text-sm font-medium flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {creatingContract ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <CreditCard className="h-4 w-4" />
                  )}
                  Thanh toán bằng VNPay
                </button>
                <button
                  type="button"
                  onClick={() => handleCreateTransaction('CASH')}
                  disabled={creatingContract}
                  className="flex-1 px-4 py-3 rounded-lg bg-red-600 text-white hover:bg-red-700 text-sm font-medium flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {creatingContract ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Shield className="h-4 w-4" />
                  )}
                  Ký hợp đồng Blockchain (MetaMask)
                </button>
              </div>
              <button
                type="button"
                disabled={creatingContract}
                onClick={() => {
                  if (!creatingContract) setShowContractModal(false);
                }}
                className="px-4 py-2.5 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 text-sm font-medium disabled:opacity-60"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PropertyDetailPage;