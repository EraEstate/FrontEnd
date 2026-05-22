import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Loader2, Heart, MapPin, Bed, Bath, Building, Eye } from 'lucide-react';
import { useMyFavorites } from '../api/hooks';
import { propertyFavoriteAPI } from '../api';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '../store/authStore';
import { getImageUrl, getImagePlaceholder } from '../utils/imageUtils';
import { showSuccess, showError } from '../utils/toast';
import { logger } from '../utils/logger';

const FavoritesPage = () => {
  const { t } = useTranslation();
  const { isAuthenticated } = useAuthStore();
  const [currentPage] = useState(0);

  // API Hook
  const { data: favoritesData, loading, error, refetch } = useMyFavorites(currentPage, 12);

  const removeFavorite = async (propertyId: string, event?: React.MouseEvent) => {
    event?.preventDefault();
    event?.stopPropagation();
    
    try {
      await propertyFavoriteAPI.removeFromFavorites(propertyId);
      showSuccess('Đã xóa khỏi danh sách yêu thích');
      refetch();
    } catch (error: any) {
      logger.warn('Error removing favorite:', error);
      showError('Có lỗi xảy ra khi xóa khỏi danh sách yêu thích');
    }
  };

  const formatPrice = (price: number) => {
    if (!price) return 'Thỏa thuận';
    if (price >= 1000000000) {
      return `${(price / 1000000000).toFixed(1)} tỷ`;
    } else if (price >= 1000000) {
      return `${(price / 1000000).toFixed(0)} triệu`;
    }
    return price.toLocaleString('vi-VN');
  };

  const getPropertyTypeLabel = (type: string) => {
    const labels: { [key: string]: string } = {
      'APARTMENT': 'Căn hộ',
      'HOUSE': 'Nhà riêng',
      'VILLA': 'Biệt thự',
      'OFFICE': 'Văn phòng',
      'LAND': 'Đất nền',
      'COMMERCIAL': 'Thương mại'
    };
    return labels[type] || type;
  };

  const favorites = favoritesData?.content || [];

  // Check if user is authenticated
  if (!isAuthenticated) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">
            {t('favorites.loginRequired')}
          </h2>
          <p className="text-gray-600 mb-6">
            {t('favorites.loginRequiredMessage')}
          </p>
          <Link
            to="/login"
            className="inline-flex items-center px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            {t('common.login')}
          </Link>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="animate-spin h-8 w-8 text-red-600" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12">
          <p className="text-red-600 mb-4">{t('common.loadError')}: {error}</p>
          <button 
            onClick={refetch}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            {t('common.retry')}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-semibold text-gray-800 mb-2">{t('favorites.title')}</h1>
        <p className="text-gray-600">{t('favorites.emptyDescription')}</p>
      </div>

      {favorites.length === 0 ? (
        <div className="text-center py-12">
          <div className="mb-4">
            <svg className="mx-auto h-24 w-24 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </div>
          <h3 className="text-xl font-medium text-gray-800 mb-2">{t('favorites.empty')}</h3>
          <p className="text-gray-600 mb-6">{t('favorites.emptyDescription')}</p>
          <Link 
            to="/properties" 
            className="inline-flex items-center px-6 py-3 bg-red-600 text-white font-medium rounded-xl hover:bg-red-700 btn-press"
          >
            {t('favorites.explore')}
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {favorites.map((favorite) => {
            const property = favorite.property;
            
            // Debug: Log if property is missing
            if (!property) {
              logger.debug('Favorite without property:', favorite.id);
              return (
                <div key={favorite.id} className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <p className="text-sm text-yellow-800">
                    Favorite ID: {favorite.id}, Property ID: {favorite.propertyId}
                    <br />
                    Property data not loaded. Please check backend logs.
                  </p>
                </div>
              );
            }

            // Get primary image or first image - handle both propertyImages (objects) and images (strings or objects)
            const primaryImage = (property as any).propertyImages?.find((img: any) => img.isPrimary)?.imageUrl || 
                                 (property as any).propertyImages?.[0]?.imageUrl ||
                                 ((property as any).images && Array.isArray((property as any).images) && typeof (property as any).images[0] === 'object' 
                                   ? ((property as any).images.find((img: any) => img.isPrimary)?.imageUrl || (property as any).images[0]?.imageUrl)
                                   : (property as any).images?.[0]) ||
                                 null;

            return (
              <div key={favorite.id} className="bg-white rounded-xl overflow-hidden card-hover border border-gray-100">
                <Link to={`/properties/${property.id || favorite.propertyId}`} className="block">
                  <div className="relative">
                    <img
                      src={getImageUrl(primaryImage) || getImagePlaceholder(400, 250)}
                      alt={property.title}
                      className="w-full h-48 object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = getImagePlaceholder(400, 250);
                      }}
                    />
                    <button
                      onClick={(e) => removeFavorite(favorite.propertyId, e)}
                      className="absolute top-3 right-3 p-2 bg-white/90 rounded-full hover:bg-white transition-colors z-10"
                      title={t('favorites.remove')}
                    >
                      <Heart className="w-5 h-5 text-red-600 fill-current" />
                    </button>
                    <div className="absolute top-3 left-3 bg-red-600 text-white px-2 py-1 rounded text-sm font-medium">
                      {getPropertyTypeLabel(property.propertyType)}
                    </div>
                    {((property as any).listingType || (property as any).transactionType) === 'RENT' && (
                      <div className="absolute bottom-3 left-3 bg-blue-600 text-white px-2 py-1 rounded text-xs font-medium">
                        Cho thuê
                      </div>
                    )}
                  </div>
                  
                  <div className="p-4">
                    <h3 className="font-semibold text-lg text-gray-800 mb-2 line-clamp-2">
                      {property.title}
                    </h3>
                    
                    <div className="flex items-center text-gray-600 mb-2">
                      <MapPin className="w-4 h-4 mr-1 flex-shrink-0" />
                      <span className="text-sm line-clamp-1">
                        {(property as any).location?.fullAddress || 
                         ((property as any).location ? 
                           `${property.address || ''}, ${(property as any).location.ward?.name || ''}, ${(property as any).location.district?.name || ''}, ${(property as any).location.province?.name || ''}`.replace(/^,\s*|,\s*$/g, '') :
                           property.address || 'Chưa cập nhật địa chỉ')}
                      </span>
                    </div>
                    
                    <div className="flex items-center justify-between mb-3">
                      <div className="text-red-600 font-bold text-lg">
                        {formatPrice(Number(property.price))}
                        {((property as any).listingType || (property as any).transactionType) === 'RENT' && (
                          <span className="text-sm text-gray-500">/tháng</span>
                        )}
                      </div>
                      {property.area && (
                        <div className="text-sm text-gray-500">
                          {property.area} m²
                        </div>
                      )}
                    </div>
                    
                    <div className="flex items-center justify-between text-sm text-gray-600 mb-4">
                      {property.bedrooms !== undefined && (
                        <div className="flex items-center">
                          <Bed className="w-4 h-4 mr-1" />
                          <span>{property.bedrooms} PN</span>
                        </div>
                      )}
                      {property.bathrooms !== undefined && (
                        <div className="flex items-center">
                          <Bath className="w-4 h-4 mr-1" />
                          <span>{property.bathrooms} WC</span>
                        </div>
                      )}
                      {(property as any).propertyDetails?.[0]?.floors && (
                        <div className="flex items-center">
                          <Building className="w-4 h-4 mr-1" />
                          <span>Tầng {(property as any).propertyDetails[0].floors}</span>
                        </div>
                      )}
                    </div>
                    
                    <div className="pt-3 border-t">
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <span suppressHydrationWarning>Lưu ngày {new Date(favorite.createdAt).toLocaleDateString('vi-VN')}</span>
                        {property.views !== undefined && (
                          <span className="flex items-center" suppressHydrationWarning>
                            <Eye className="w-3 h-3 mr-1" />
                            {property.views} lượt xem
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </Link>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default FavoritesPage;