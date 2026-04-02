import React, { useState, useEffect, useRef } from 'react';
import {
  Search,
  Heart,
  Eye,
  ChevronDown,
  SlidersHorizontal,
  Bell,
  Map,
  User,
  Loader2,
  Scale,
} from 'lucide-react';
import { useProperties } from '../api/hooks';
import { propertyFavoriteAPI } from '../api';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import type { Property } from '../types';
import { useAuthStore } from '../store/authStore';
import { useCompareStore } from '../store/compareStore';
import { getImageUrl, getImagePlaceholder } from '../utils/imageUtils';
import { showSuccess, showWarning, showError } from '../utils/toast';
import { logger } from '../utils/logger';
import EmptyState from '../components/EmptyState';

const PropertiesPage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParamsFromURL, setSearchParamsFromURL] = useSearchParams();
  const [searchTerm, setSearchTerm] = useState(t('properties.search.placeholder'));
  const [showFilters, setShowFilters] = useState(false);
  const [selectedFilters, setSelectedFilters] = useState({
    verified: false,
    propertyType: '',
    priceRange: '',
    bedrooms: '',
    bathrooms: '',
    minPrice: '',
    maxPrice: '',
    minArea: '',
    maxArea: '',
  });
  const [currentPage, setCurrentPage] = useState(0);
  const [searchParams, setSearchParams] = useState<any>({});

  // Read search params from URL on mount
  useEffect(() => {
    const params: any = {};
    
    // Read all search params from URL
    const query = searchParamsFromURL.get('query');
    const provinceId = searchParamsFromURL.get('provinceId');
    const districtId = searchParamsFromURL.get('districtId');
    const wardId = searchParamsFromURL.get('wardId');
    const propertyType = searchParamsFromURL.get('propertyType');
    const listingType = searchParamsFromURL.get('listingType');
    const minPrice = searchParamsFromURL.get('minPrice');
    const maxPrice = searchParamsFromURL.get('maxPrice');
    const minArea = searchParamsFromURL.get('minArea');
    const maxArea = searchParamsFromURL.get('maxArea');

    if (query) params.query = query;
    if (provinceId) params.provinceId = provinceId;
    if (districtId) params.districtId = districtId;
    if (wardId) params.wardId = wardId;
    if (propertyType) params.propertyType = propertyType;
    if (listingType) params.listingType = listingType;
    if (minPrice) params.minPrice = parseFloat(minPrice);
    if (maxPrice) params.maxPrice = parseFloat(maxPrice);
    if (minArea) params.minArea = parseFloat(minArea);
    if (maxArea) params.maxArea = parseFloat(maxArea);

    if (Object.keys(params).length > 0) {
      setSearchParams(params);
      if (query) {
        setSearchTerm(query);
      }
    }
  }, [searchParamsFromURL]);

  // API Hooks
  const { data: properties, loading: propertiesLoading, error: propertiesError, refetch: refetchProperties } = useProperties({
    page: currentPage,
    size: 12,
    ...searchParams
  });
  
  // const { data: featuredProperties, loading: featuredLoading } = useFeaturedProperties(0, 8);
  // const { data: provinces } = useProvinces();

  // Xử lý search
  const handleSearch = () => {
    const newParams: any = {
      query: searchTerm !== t('properties.search.placeholder') ? searchTerm : '',
    };
    
    if (selectedFilters.propertyType) {
      newParams.propertyType = selectedFilters.propertyType;
    }
    
    if (selectedFilters.minPrice) {
      newParams.minPrice = parseFloat(selectedFilters.minPrice);
    }
    if (selectedFilters.maxPrice) {
      newParams.maxPrice = parseFloat(selectedFilters.maxPrice);
    }
    
    if (selectedFilters.minArea) {
      newParams.minArea = parseFloat(selectedFilters.minArea);
    }
    if (selectedFilters.maxArea) {
      newParams.maxArea = parseFloat(selectedFilters.maxArea);
    }
    
    if (selectedFilters.bedrooms) {
      newParams.bedrooms = parseInt(selectedFilters.bedrooms);
    }
    if (selectedFilters.bathrooms) {
      newParams.bathrooms = parseInt(selectedFilters.bathrooms);
    }
    
    setSearchParams(newParams);
    setCurrentPage(0);
    setShowFilters(false);
  };

  // Xử lý thêm/xóa yêu thích
  const handleToggleFavorite = async (propertyId: string, event?: React.MouseEvent) => {
    event?.preventDefault();
    event?.stopPropagation();
    
    try {
      const wasFavorited = await propertyFavoriteAPI.isFavorited(propertyId);
      await propertyFavoriteAPI.toggle(propertyId);
      refetchProperties();
      
      if (!wasFavorited) {
        showSuccess('Đã thêm vào danh sách yêu thích!');
      } else {
        showSuccess('Đã xóa khỏi danh sách yêu thích');
      }
    } catch (error: any) {
      logger.warn('Error toggling favorite:', error);
      showError('Có lỗi xảy ra khi cập nhật danh sách yêu thích');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 mt-10">
      {/* Search Bar - giống batdongsan.com.vn */}
      <div className="bg-white shadow-sm">
        <div className="w-full px-6 lg:px-12 py-4">
          <div className="flex items-center space-x-4">
            {/* Search Input */}
            <div className="flex-1 relative">
              <div className="flex items-center bg-gray-100 rounded-lg">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder={t('properties.search.placeholder')}
                  className="flex-1 px-4 py-3 bg-transparent border-none focus:outline-none text-sm"
                />
                <button 
                  onClick={handleSearch}
                  className="px-6 py-3 bg-red-600 text-white rounded-r-lg hover:bg-red-700 transition-colors flex items-center"
                >
                  <Search className="h-4 w-4 mr-2" />
                  {t('properties.search.button')}
                </button>
              </div>
            </div>

            {/* Map Icon */}
            <Link to="/map-search" className="p-3 text-gray-600 hover:text-red-600 transition-colors" title="Tìm kiếm trên bản đồ">
              <Map className="h-5 w-5" />
            </Link>
          </div>

          {/* Filter Bar - giống batdongsan.com.vn */}
          <div className="flex items-center space-x-4 mt-4 pb-2">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center space-x-2 px-4 py-2 border rounded-lg transition-colors text-sm ${
                showFilters 
                  ? 'border-red-600 bg-red-50 text-red-600' 
                  : 'border-gray-300 hover:border-red-300'
              }`}
            >
              <SlidersHorizontal className="h-4 w-4" />
              <span>{t('properties.filters.title')}</span>
            </button>

            {/* Tin xác thực */}
            <button
              onClick={() => setSelectedFilters({ ...selectedFilters, verified: !selectedFilters.verified })}
              className={`flex items-center space-x-2 px-4 py-2 border rounded-lg transition-colors text-sm ${
                selectedFilters.verified
                  ? 'border-red-600 bg-red-50 text-red-600'
                  : 'border-gray-300 hover:border-red-300'
              }`}
            >
              <span>{t('properties.filters.verified')}</span>
            </button>

            {/* Loại nhà đất */}
            <FilterDropdown
              label={t('properties.filters.propertyType')}
              options={[
                { value: 'APARTMENT', label: 'Căn hộ' },
                { value: 'HOUSE', label: 'Nhà riêng' },
                { value: 'VILLA', label: 'Biệt thự' },
                { value: 'LAND', label: 'Đất nền' },
                { value: 'OFFICE', label: 'Văn phòng' },
              ]}
              value={selectedFilters.propertyType}
              onChange={(v) => {
                setSelectedFilters({ ...selectedFilters, propertyType: v });
                setSearchParams((prev: any) => ({ ...prev, propertyType: v || undefined }));
                setCurrentPage(0);
              }}
            />

            {/* Khoảng giá */}
            <FilterDropdown
              label={t('properties.filters.priceRange')}
              options={[
                { value: '0-1000000000', label: 'Dưới 1 tỷ' },
                { value: '1000000000-3000000000', label: '1 - 3 tỷ' },
                { value: '3000000000-5000000000', label: '3 - 5 tỷ' },
                { value: '5000000000-10000000000', label: '5 - 10 tỷ' },
                { value: '10000000000-', label: 'Trên 10 tỷ' },
              ]}
              value={selectedFilters.priceRange}
              onChange={(v) => {
                const [min, max] = v.split('-');
                setSelectedFilters({ ...selectedFilters, priceRange: v, minPrice: min || '', maxPrice: max || '' });
                const p: any = { ...searchParams };
                if (min) p.minPrice = parseFloat(min);
                else delete p.minPrice;
                if (max) p.maxPrice = parseFloat(max);
                else delete p.maxPrice;
                setSearchParams(p);
                setCurrentPage(0);
              }}
            />
          </div>

          {/* Advanced Search Panel */}
          {showFilters && (
            <div className="mt-4 p-6 bg-white border border-gray-200 rounded-lg shadow-lg">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Tìm kiếm nâng cao</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Property Type */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Loại nhà đất
                  </label>
                  <select
                    value={selectedFilters.propertyType}
                    onChange={(e) => setSelectedFilters({ ...selectedFilters, propertyType: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent text-sm"
                  >
                    <option value="">Tất cả</option>
                    <option value="APARTMENT">Căn hộ</option>
                    <option value="HOUSE">Nhà riêng</option>
                    <option value="VILLA">Biệt thự</option>
                    <option value="LAND">Đất nền</option>
                    <option value="OFFICE">Văn phòng</option>
                  </select>
                </div>

                {/* Bedrooms */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Số phòng ngủ
                  </label>
                  <select
                    value={selectedFilters.bedrooms}
                    onChange={(e) => setSelectedFilters({ ...selectedFilters, bedrooms: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent text-sm"
                  >
                    <option value="">Tất cả</option>
                    <option value="1">1 phòng</option>
                    <option value="2">2 phòng</option>
                    <option value="3">3 phòng</option>
                    <option value="4">4 phòng</option>
                    <option value="5">5+ phòng</option>
                  </select>
                </div>

                {/* Bathrooms */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Số phòng tắm
                  </label>
                  <select
                    value={selectedFilters.bathrooms}
                    onChange={(e) => setSelectedFilters({ ...selectedFilters, bathrooms: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent text-sm"
                  >
                    <option value="">Tất cả</option>
                    <option value="1">1 phòng</option>
                    <option value="2">2 phòng</option>
                    <option value="3">3 phòng</option>
                    <option value="4">4+ phòng</option>
                  </select>
                </div>

                {/* Price Range */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Khoảng giá
                  </label>
                  <div className="flex space-x-2">
                    <input
                      type="number"
                      placeholder="Từ (VNĐ)"
                      value={selectedFilters.minPrice}
                      onChange={(e) => setSelectedFilters({ ...selectedFilters, minPrice: e.target.value })}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent text-sm"
                    />
                    <input
                      type="number"
                      placeholder="Đến (VNĐ)"
                      value={selectedFilters.maxPrice}
                      onChange={(e) => setSelectedFilters({ ...selectedFilters, maxPrice: e.target.value })}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent text-sm"
                    />
                  </div>
                </div>

                {/* Area Range */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Diện tích (m²)
                  </label>
                  <div className="flex space-x-2">
                    <input
                      type="number"
                      placeholder="Từ (m²)"
                      value={selectedFilters.minArea}
                      onChange={(e) => setSelectedFilters({ ...selectedFilters, minArea: e.target.value })}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent text-sm"
                    />
                    <input
                      type="number"
                      placeholder="Đến (m²)"
                      value={selectedFilters.maxArea}
                      onChange={(e) => setSelectedFilters({ ...selectedFilters, maxArea: e.target.value })}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent text-sm"
                    />
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end space-x-3 mt-6 pt-4 border-t border-gray-200">
                <button
                  onClick={() => {
                    setSelectedFilters({
                      verified: false,
                      propertyType: '',
                      priceRange: '',
                      bedrooms: '',
                      bathrooms: '',
                      minPrice: '',
                      maxPrice: '',
                      minArea: '',
                      maxArea: '',
                    });
                    setSearchParams({});
                    setCurrentPage(0);
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors text-sm"
                >
                  Xóa bộ lọc
                </button>
                <button
                  onClick={handleSearch}
                  className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium"
                >
                  Áp dụng bộ lọc
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="w-full px-6 lg:px-12 py-6">
        {/* Page Title */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            {t('properties.pageTitle')}
          </h1>
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-600">
              {t('properties.propertiesCount', { count: properties?.totalElements || properties?.content?.length || '0' })}
            </span>
            <button className="flex items-center space-x-1 text-sm text-red-600 hover:text-red-700 transition-colors">
              <Bell className="h-4 w-4" />
              <span>{t('properties.emailNotifications')}</span>
            </button>
          </div>
        </div>

        {/* Sort and View Options */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <select className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-red-500 focus:border-transparent">
              <option>{t('properties.sortOptions.default')}</option>
              <option>{t('properties.sortOptions.newest')}</option>
              <option>{t('properties.sortOptions.priceLowToHigh')}</option>
              <option>{t('properties.sortOptions.priceHighToLow')}</option>
            </select>
          </div>

          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600">{t('properties.viewOptions.list')}</span>
            <span className="text-sm text-gray-400">{t('properties.viewOptions.map')}</span>
          </div>
        </div>

        {/* Properties List - Layout giống batdongsan.com.vn */}
        {propertiesLoading ? (
          <div className="text-center py-12">
            <Loader2 className="animate-spin h-8 w-8 text-red-600 mx-auto" />
            <p className="mt-4 text-gray-600">{t('properties.loading')}</p>
          </div>
        ) : propertiesError ? (
          <div className="text-center py-12">
            <p className="text-red-600 mb-4">{t('properties.error')}: {propertiesError}</p>
            <button 
              onClick={refetchProperties}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
            >
              {t('common.submit')}
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {properties?.content?.map((property: Property) => (
              <PropertyListItem 
                key={property.id} 
                property={property}
                t={t}
                onToggleFavorite={handleToggleFavorite}
              />
            )) || (
              <EmptyState
                type="search"
                title="Không tìm thấy kết quả"
                description="Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm để xem thêm kết quả."
                actionLabel="Xem tất cả tin đăng"
                actionTo="/properties"
              />
            )}
          </div>
        )}

        {/* Pagination */}
        {properties?.content && properties.content.length > 0 && (
          <div className="text-center mt-8">
            {!properties.last ? (
              <button
                onClick={() => setCurrentPage(prev => prev + 1)}
                disabled={propertiesLoading}
                className="px-6 py-3 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                {propertiesLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader2 className="animate-spin h-4 w-4" />
                    Đang tải...
                  </span>
                ) : (
                  `${t('properties.loadMore')} (${currentPage + 1}/${properties.totalPages})`
                )}
              </button>
            ) : (
              <p className="text-sm text-gray-500">Đã hiển thị tất cả {properties.totalElements} tin</p>
            )}
          </div>
        )}

        {/* Content Sections - giống batdongsan.com.vn */}
        <div className="mt-12 grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl p-6 border border-gray-100" style={{ boxShadow: 'var(--shadow-sm)' }}>
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                {t('properties.content.mainTitle')}
              </h2>
              
              <div className="prose max-w-none text-sm text-gray-600 space-y-4">
                <h3 className="font-semibold text-gray-900">
                  {t('properties.content.sections.marketSegments')}
                </h3>

                <p>
                  {t('properties.content.marketSegments.description')}
                </p>

                <ul className="space-y-3">
                  <li>
                    <strong>{t('properties.content.marketSegments.apartments')}:</strong> {t('properties.content.marketSegments.apartmentsDesc')}
                  </li>
                  <li>
                    <strong>{t('properties.content.marketSegments.houses')}:</strong> {t('properties.content.marketSegments.housesDesc')}
                  </li>
                  <li>
                    <strong>{t('properties.content.marketSegments.villas')}:</strong> {t('properties.content.marketSegments.villasDesc')}
                  </li>
                  <li>
                    <strong>{t('properties.content.marketSegments.land')}:</strong> {t('properties.content.marketSegments.landDesc')}
                  </li>
                </ul>

                <h3 className="font-semibold text-gray-900 mt-6">
                  {t('properties.content.fastBuying.title')}
                </h3>

                <p>
                  {t('properties.content.fastBuying.description')}
                </p>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Mua bán nhà đất by Province */}
            <div className="bg-white rounded-xl p-6 border border-gray-100" style={{ boxShadow: 'var(--shadow-sm)' }}>
              <h3 className="font-bold text-gray-900 mb-4">{t('properties.sidebar.byProvince')}</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">{t('properties.sidebar.provinces.hcm')}</span>
                  <span className="text-sm text-gray-500">(77.902)</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">{t('properties.sidebar.provinces.hanoi')}</span>
                  <span className="text-sm text-gray-500">(58.349)</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">{t('properties.sidebar.provinces.danang')}</span>
                  <span className="text-sm text-gray-500">(9.968)</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">{t('properties.sidebar.provinces.binhduong')}</span>
                  <span className="text-sm text-gray-500">(8.674)</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">{t('properties.sidebar.provinces.khanhhoa')}</span>
                  <span className="text-sm text-gray-500">(5.498)</span>
                </div>
              </div>
            </div>

            {/* Bài viết được quan tâm */}
            <div className="bg-white rounded-xl p-6 border border-gray-100" style={{ boxShadow: 'var(--shadow-sm)' }}>
              <h3 className="font-bold text-gray-900 mb-4">{t('properties.sidebar.popularArticles')}</h3>
              <div className="space-y-4">
                <div className="flex space-x-3">
                  <span className="flex-shrink-0 w-6 h-6 bg-red-600 text-white text-xs rounded-full flex items-center justify-center font-medium">1</span>
                  <a href="#" className="text-sm text-blue-600 hover:text-blue-800 line-clamp-2">
                    Trọn Bộ Lãi Suất Vay Mua Nhà Mới Nhất Tháng 9/2025
                  </a>
                </div>
                <div className="flex space-x-3">
                  <span className="flex-shrink-0 w-6 h-6 bg-red-600 text-white text-xs rounded-full flex items-center justify-center font-medium">2</span>
                  <a href="#" className="text-sm text-blue-600 hover:text-blue-800 line-clamp-2">
                    Chung Cư Hưng Yên, Khu Vực Thái Bình Cũ Giảm Tốc
                  </a>
                </div>
                <div className="flex space-x-3">
                  <span className="flex-shrink-0 w-6 h-6 bg-red-600 text-white text-xs rounded-full flex items-center justify-center font-medium">3</span>
                  <a href="#" className="text-sm text-blue-600 hover:text-blue-800 line-clamp-2">
                    Thị Trường Đất Nền Tây Ninh Tiếp Tục Tăng Giá Mạnh
                  </a>
                </div>
                <div className="flex space-x-3">
                  <span className="flex-shrink-0 w-6 h-6 bg-red-600 text-white text-xs rounded-full flex items-center justify-center font-medium">4</span>
                  <a href="#" className="text-sm text-blue-600 hover:text-blue-800 line-clamp-2">
                    Đất Nền Hưng Yên Tiếp Tục Tăng Giá
                  </a>
                </div>
                <div className="flex space-x-3">
                  <span className="flex-shrink-0 w-6 h-6 bg-red-600 text-white text-xs rounded-full flex items-center justify-center font-medium">5</span>
                  <a href="#" className="text-sm text-blue-600 hover:text-blue-800 line-clamp-2">
                    Thị Trường Đất Nền Đà Nẵng Nóng Sốt
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Property List Item Component - giống batdongsan.com.vn
const PropertyListItem: React.FC<{ 
  property: Property; 
  t: any;
  onToggleFavorite: (propertyId: string, event?: React.MouseEvent) => void;
}> = ({ property, t, onToggleFavorite }) => {
  const [isFavorited, setIsFavorited] = useState(false);
  const [checkingFavorite, setCheckingFavorite] = useState(true);
  const { isAuthenticated } = useAuthStore();
  const { compareList, addProperty, removeProperty } = useCompareStore();

  const isComparing = compareList.some(p => p.id === property.id?.toString());

  // Check favorite status when component mounts
  useEffect(() => {
    const checkFavoriteStatus = async () => {
      if (!isAuthenticated || !property.id) {
        setCheckingFavorite(false);
        return;
      }
      
      try {
        const favorited = await propertyFavoriteAPI.isFavorited(property.id.toString());
        setIsFavorited(favorited);
      } catch {
        logger.debug('Error checking favorite status for', property.id);
      } finally {
        setCheckingFavorite(false);
      }
    };

    checkFavoriteStatus();
  }, [property.id, isAuthenticated]);

  const handleFavoriteClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!isAuthenticated) {
      showWarning('Vui lòng đăng nhập để thêm vào danh sách yêu thích');
      return;
    }

    if (!property.id) return;

    // Optimistic update
    setIsFavorited(!isFavorited);
    await onToggleFavorite(property.id.toString(), e);
    
    // Refetch status after toggle
    try {
      const favorited = await propertyFavoriteAPI.isFavorited(property.id.toString());
      setIsFavorited(favorited);
    } catch {
      setIsFavorited(!isFavorited);
    }
  };

  const formatPrice = (price: number) => {
    if (price >= 1000000000) {
      return `${(price / 1000000000).toFixed(1)} ${t('common.billion')}`;
    } else if (price >= 1000000) {
      return `${(price / 1000000).toFixed(0)} ${t('common.million')}`;
    }
    return price.toLocaleString();
  };

  // Get primary image or first image - handle multiple possible structures
  // PropertyResponse has: mainImageUrl, propertyImages (array), or images (array)
  // PropertyImageResponse has: imageUrl, isPrimary (or isMain)
  let rawImagePath: string | null = null;
  
  // Priority 1: Check mainImageUrl (direct field from PropertyResponse)
  if ((property as any).mainImageUrl) {
    rawImagePath = (property as any).mainImageUrl;
  }
  // Priority 2: Check propertyImages array (serialized name from PropertyResponse)
  else if ((property as any).propertyImages && Array.isArray((property as any).propertyImages) && (property as any).propertyImages.length > 0) {
    const images = (property as any).propertyImages;
    // Find primary image first
    const primaryImg = images.find((img: any) => img.isPrimary || img.isMain);
    if (primaryImg && primaryImg.imageUrl) {
      rawImagePath = primaryImg.imageUrl;
    } else if (images[0] && images[0].imageUrl) {
      rawImagePath = images[0].imageUrl;
    }
  }
  // Priority 3: Check images array (internal field name)
  else if ((property as any).images && Array.isArray((property as any).images)) {
    if (typeof (property as any).images[0] === 'object') {
      const images = (property as any).images;
      const primaryImg = images.find((img: any) => img.isPrimary || img.isMain);
      if (primaryImg && primaryImg.imageUrl) {
        rawImagePath = primaryImg.imageUrl;
      } else if (images[0] && images[0].imageUrl) {
        rawImagePath = images[0].imageUrl;
      }
    } else if (typeof (property as any).images[0] === 'string') {
      rawImagePath = (property as any).images[0];
    }
  }
  // Priority 4: Check imageUrl alias (from PropertyResponse.getImageUrlAlias)
  else if ((property as any).imageUrl) {
    rawImagePath = (property as any).imageUrl;
  }
  
  // Convert to full URL using getImageUrl
  // This handles both local paths (/uploads/...) and Supabase Storage URLs (https://...)
  const primaryImage = getImageUrl(rawImagePath) || getImagePlaceholder(400, 300);
  
  // Use logger instead of console for dev debugging
  if (import.meta.env.DEV && rawImagePath) {
    logger.debug('Property image:', property.id, rawImagePath);
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -5 }}
      transition={{ duration: 0.3 }}
      className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100"
    >
      <div className="flex">
        {/* Image Section */}
        <Link to={`/properties/${property.id}`} className="relative w-80 h-48 flex-shrink-0 bg-gray-100 block">
          <img
            src={primaryImage}
            alt={property.title}
            className="w-full h-full object-cover"
            loading="lazy"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              const placeholder = getImagePlaceholder(400, 300);
              if (target.src !== placeholder && !target.src.includes('data:image/svg+xml')) {
                logger.debug('Failed to load image:', rawImagePath);
                target.src = placeholder;
              }
            }}
          />
          <div className="absolute top-2 left-2">
            <span className="bg-red-600 text-white px-2 py-1 text-xs font-medium rounded">10</span>
          </div>
          <div className="absolute top-2 right-2">
            <button 
              onClick={handleFavoriteClick}
              disabled={checkingFavorite || !isAuthenticated}
              className={`p-2 bg-white/90 backdrop-blur-sm rounded-lg hover:bg-white transition-all duration-200 ${
                isFavorited ? 'text-red-600' : 'text-gray-600'
              } ${!isAuthenticated ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:scale-110'}`}
              title={isFavorited ? 'Xóa khỏi danh sách yêu thích' : 'Thêm vào danh sách yêu thích'}
            >
              <Heart className={`h-4 w-4 ${isFavorited ? 'fill-current' : ''}`} />
            </button>
          </div>
          <div className="absolute bottom-2 left-2">
            <button 
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                if (isComparing) {
                  removeProperty(property.id.toString());
                } else {
                  addProperty({
                    id: property.id.toString(),
                    title: property.title,
                    price: property.price,
                    imageUrl: rawImagePath || undefined
                  });
                }
              }}
              className={`p-2 bg-white/90 backdrop-blur-sm rounded-lg hover:bg-white transition-all duration-200 hover:scale-110 ${
                isComparing ? 'text-blue-600' : 'text-gray-600'
              }`}
              title={isComparing ? 'Huỷ so sánh' : 'Thêm vào so sánh'}
            >
              <Scale className={`h-4 w-4`} />
            </button>
          </div>
        </Link>

        {/* Content Section */}
        <div className="flex-1 p-4">
          <div className="flex justify-between items-start mb-2">
            <Link to={`/properties/${property.id}`} className="font-semibold text-lg text-gray-900 line-clamp-2 flex-1 mr-4 hover:text-red-600 transition-colors duration-200">
              {property.title}
            </Link>
            <div className="text-right">
              <div className="text-xl font-bold text-red-600">
                {property.price ? formatPrice(property.price) : t('properties.status.negotiable')}
              </div>
              <div className="text-sm text-gray-500">
                {property.area}m² · {property.propertyDetails?.[0]?.bedrooms || 0} {t('properties.details.bedrooms')} · {property.propertyDetails?.[0]?.bathrooms || 0} {t('properties.details.bathrooms')}
              </div>
              <div className="text-sm text-gray-500">
                {property.address}
              </div>
            </div>
          </div>

          <p className="text-gray-600 text-sm mb-4 line-clamp-3">
            {property.description}
          </p>

          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center mr-2">
                <User className="h-4 w-4 text-gray-600" />
              </div>
              <div>
                <div className="text-sm font-medium text-gray-900">
                  {property.agent?.user?.fullName || property.user?.fullName}
                </div>
                <div className="text-xs text-gray-500">
                  {new Date(property.createdAt).toLocaleDateString('vi-VN')}
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <div className="flex items-center text-gray-500 text-sm">
                <Eye className="h-4 w-4 mr-1" />
                <span>{t('properties.actions.showPhone')}</span>
              </div>
              <button className="text-red-600 text-sm font-medium hover:text-red-700 transition-colors">
                {t('properties.actions.saveListing')}
              </button>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

// Reusable Filter Dropdown Component
const FilterDropdown: React.FC<{
  label: string;
  options: { value: string; label: string }[];
  value: string;
  onChange: (value: string) => void;
}> = ({ label, options, value, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedLabel = options.find(o => o.value === value)?.label;

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center space-x-2 px-4 py-2 border rounded-lg transition-colors text-sm ${
          value
            ? 'border-red-600 bg-red-50 text-red-600'
            : 'border-gray-300 hover:border-red-300'
        }`}
      >
        <span>{selectedLabel || label}</span>
        <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      {isOpen && (
        <div className="absolute top-full left-0 mt-1 bg-white border border-gray-100 rounded-xl shadow-xl z-50 min-w-[180px] py-1 anim-fade-in-down">
          <button
            onClick={() => { onChange(''); setIsOpen(false); }}
            className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 transition-colors ${
              !value ? 'text-red-600 font-medium' : 'text-gray-700'
            }`}
          >
            Tất cả
          </button>
          {options.map(opt => (
            <button
              key={opt.value}
              onClick={() => { onChange(opt.value); setIsOpen(false); }}
              className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 transition-colors ${
                value === opt.value ? 'text-red-600 font-medium bg-red-50' : 'text-gray-700'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default PropertiesPage;