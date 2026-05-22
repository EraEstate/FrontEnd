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
  Phone,
} from 'lucide-react';
import { useProperties } from '../api/hooks';
import { propertyFavoriteAPI } from '../api';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import type { Property } from '../types';
import { useAuthStore } from '../store/authStore';
import { useCompareStore } from '../store/compareStore';
import { getImageUrl, getImagePlaceholder } from '../utils/imageUtils';
import { showSuccess, showWarning, showError } from '../utils/toast';
import { logger } from '../utils/logger';
import EmptyState from '../components/EmptyState';
import { usePropertySearch } from '../hooks/usePropertySearch';
import { SaveSearchButton } from '../components/SaveSearchButton';

const PropertiesPage: React.FC = () => {
  const { t } = useTranslation();
  const {
    searchTerm,
    setSearchTerm,
    showFilters,
    setShowFilters,
    selectedFilters,
    setSelectedFilters,
    currentPage,
    setCurrentPage,
    searchParams,
    setSearchParams,
    handleSearch,
    resetFilters,
  } = usePropertySearch(t('properties.search.placeholder'));

  // API Hooks
  const { isAuthenticated } = useAuthStore();
  const [favoritedIds, setFavoritedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (isAuthenticated) {
      propertyFavoriteAPI.getMyFavorites(0, 500)
        .then(res => {
          if (res?.data?.content) {
            const ids = new Set(res.data.content.map((f: any) => f.propertyId || f.property?.id).filter(Boolean));
            setFavoritedIds(ids as Set<string>);
          }
        })
        .catch(err => logger.error('Error fetching favorites:', err));
    }
  }, [isAuthenticated]);

  const { data: properties, loading: propertiesLoading, error: propertiesError, refetch: refetchProperties } = useProperties({
    page: currentPage,
    size: 12,
    ...searchParams
  });
  
  // const { data: featuredProperties, loading: featuredLoading } = useFeaturedProperties(0, 8);
  // const { data: provinces } = useProvinces();

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
      {/* Search Bar - Modern Floating Style */}
      <div className="bg-white shadow-sm sticky top-16 z-40 border-b border-gray-100">
        <div className="w-full px-6 lg:px-12 py-4 max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row items-center gap-4">
            {/* Search Input */}
            <div className="flex-1 w-full relative">
              <div className="flex items-center bg-gray-50 border border-gray-200 rounded-full hover:shadow-md hover:border-red-200 transition-all duration-300">
                <div className="pl-6 pr-2 text-red-600">
                  <Search className="h-5 w-5" />
                </div>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder={t('properties.search.placeholder')}
                  className="flex-1 px-4 py-3.5 bg-transparent border-none focus:outline-none text-gray-900 font-medium placeholder-gray-400"
                />
                <button 
                  onClick={handleSearch}
                  className="mr-2 px-6 py-2 bg-red-600 text-white rounded-full hover:bg-red-700 transition-colors flex items-center font-semibold shadow-sm hover:shadow-md"
                >
                  {t('properties.search.button')}
                </button>
              </div>
            </div>

            {/* Map Icon */}
            <Link to="/map-search" className="flex items-center gap-2 p-3 text-gray-600 hover:text-red-600 bg-white border border-gray-200 rounded-full hover:border-red-200 hover:shadow-md transition-all whitespace-nowrap" title="Tìm kiếm trên bản đồ">
              <Map className="h-5 w-5" />
              <span className="font-medium hidden md:inline">{t('properties.viewMap')}</span>
            </Link>
          </div>

          {/* Filter Bar - Pill style */}
          <div className="flex items-center space-x-3 mt-4 pb-2 overflow-x-auto hide-scrollbar">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex-shrink-0 flex items-center space-x-2 px-5 py-2 border rounded-full transition-all duration-300 text-sm font-medium ${
                showFilters 
                  ? 'border-red-600 bg-red-600 text-white shadow-md' 
                  : 'border-gray-200 bg-white text-gray-700 hover:border-red-200 hover:bg-red-50 hover:text-red-600'
              }`}
            >
              <SlidersHorizontal className="h-4 w-4" />
              <span>{t('properties.filters.title')}</span>
            </button>

            {/* Tin xác thực */}
            <button
              onClick={() => setSelectedFilters({ ...selectedFilters, verified: !selectedFilters.verified })}
              className={`flex-shrink-0 flex items-center space-x-2 px-5 py-2 border rounded-full transition-all duration-300 text-sm font-medium ${
                selectedFilters.verified
                  ? 'border-red-600 bg-red-50 text-red-600 shadow-sm'
                  : 'border-gray-200 bg-white text-gray-700 hover:border-red-200 hover:bg-red-50 hover:text-red-600'
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
                  onClick={resetFilters}
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
            <SaveSearchButton searchParams={searchParams} searchTerm={searchTerm} />
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
                isInitiallyFavorited={favoritedIds.has(property.id?.toString())}
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
            {/* CTA Banner Nhỏ */}
            <div className="bg-gradient-to-br from-red-600 to-red-800 rounded-2xl p-6 text-white shadow-md relative overflow-hidden">
              <div className="absolute -right-6 -top-6 w-24 h-24 bg-white opacity-10 rounded-full blur-xl"></div>
              <div className="absolute -left-6 -bottom-6 w-32 h-32 bg-red-400 opacity-20 rounded-full blur-2xl"></div>
              <h3 className="font-bold text-lg mb-2 relative z-10">Bạn muốn bán nhà?</h3>
              <p className="text-red-100 text-sm mb-4 relative z-10">Đăng tin ngay hôm nay để tiếp cận hàng triệu khách hàng tiềm năng.</p>
              <Link to="/upload" className="inline-block bg-white text-red-600 font-semibold px-4 py-2 rounded-lg text-sm hover:bg-gray-50 transition-colors shadow-sm relative z-10">
                Đăng tin miễn phí
              </Link>
            </div>

            {/* Mua bán nhà đất by Province */}
            <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
              <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Map className="h-5 w-5 text-red-600" />
                {t('properties.sidebar.byProvince')}
              </h3>
              <div className="space-y-3">
                {[
                  { name: t('properties.sidebar.provinces.hcm'), count: '77.902' },
                  { name: t('properties.sidebar.provinces.hanoi'), count: '58.349' },
                  { name: t('properties.sidebar.provinces.danang'), count: '9.968' },
                  { name: t('properties.sidebar.provinces.binhduong'), count: '8.674' },
                  { name: t('properties.sidebar.provinces.khanhhoa'), count: '5.498' },
                ].map((prov, i) => (
                  <Link to={`/properties?province=${prov.name}`} key={i} className="flex items-center justify-between group">
                    <span className="text-sm text-gray-600 group-hover:text-red-600 transition-colors font-medium">{prov.name}</span>
                    <span className="text-xs text-gray-400 bg-gray-50 px-2 py-1 rounded-md">{prov.count}</span>
                  </Link>
                ))}
              </div>
            </div>

            {/* Bài viết được quan tâm */}
            <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
              <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                <span className="w-1.5 h-5 bg-red-600 rounded-full"></span>
                {t('properties.sidebar.popularArticles')}
              </h3>
              <div className="space-y-4">
                {[
                  "Trọn Bộ Lãi Suất Vay Mua Nhà Mới Nhất Tháng 9/2025",
                  "Chung Cư Hưng Yên, Khu Vực Thái Bình Cũ Giảm Tốc",
                  "Thị Trường Đất Nền Tây Ninh Tiếp Tục Tăng Giá Mạnh",
                  "Đất Nền Hưng Yên Tiếp Tục Tăng Giá",
                  "Thị Trường Đất Nền Đà Nẵng Nóng Sốt"
                ].map((article, i) => (
                  <div key={i} className="flex space-x-3 group cursor-pointer">
                    <span className="flex-shrink-0 w-6 h-6 bg-red-50 text-red-600 text-xs rounded-full flex items-center justify-center font-bold group-hover:bg-red-600 group-hover:text-white transition-colors">{i + 1}</span>
                    <a className="text-sm text-gray-700 group-hover:text-red-600 line-clamp-2 font-medium transition-colors">
                      {article}
                    </a>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Khám phá khu vực nổi bật */}
        <div className="mt-16 pt-12 border-t border-gray-200">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-extrabold text-gray-900 mb-4">{t('properties.neighborhoods.title')}</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">{t('properties.neighborhoods.subtitle')}</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { title: 'Quận 1, TP.HCM', count: '1.240', img: 'https://images.unsplash.com/photo-1583417319070-4a69db38a482?auto=format&fit=crop&q=80&w=800' },
              { title: 'Quận Cầu Giấy, HN', count: '985', img: 'https://images.unsplash.com/photo-1596422846543-75c6fc197f07?auto=format&fit=crop&q=80&w=800' },
              { title: 'TP. Thủ Đức', count: '2.100', img: 'https://images.unsplash.com/photo-1555580399-5ee4148b26dd?auto=format&fit=crop&q=80&w=800' },
              { title: 'Quận Hải Châu, ĐN', count: '450', img: 'https://images.unsplash.com/photo-1559592413-7ce4f1a26084?auto=format&fit=crop&q=80&w=800' }
            ].map((area, i) => (
              <Link to={`/properties?search=${area.title}`} key={i} className="group relative h-64 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 block">
                <img src={area.img} alt={area.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
                <div className="absolute bottom-0 left-0 w-full p-6">
                  <h3 className="text-xl font-bold text-white mb-1">{area.title}</h3>
                  <p className="text-red-100 text-sm font-medium">{area.count} bất động sản</p>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Newsletter Banner */}
        <div className="mt-16 bg-white rounded-3xl p-8 md:p-12 shadow-sm border border-red-100 relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-8 mb-8">
          <div className="absolute -right-20 -top-20 w-64 h-64 bg-red-50 rounded-full blur-3xl"></div>
          <div className="relative z-10 md:max-w-xl">
            <h2 className="text-2xl md:text-3xl font-extrabold text-gray-900 mb-3">{t('properties.newsletter.title')}</h2>
            <p className="text-gray-600 leading-relaxed">{t('properties.newsletter.subtitle')}</p>
          </div>
          <div className="relative z-10 w-full md:w-auto flex-1 max-w-md">
            <div className="flex bg-gray-50 border border-gray-200 rounded-full p-1.5 focus-within:ring-2 focus-within:ring-red-500 focus-within:border-transparent transition-all">
              <input 
                type="email" 
                placeholder={t('properties.newsletter.placeholder')} 
                className="flex-1 bg-transparent px-4 py-3 outline-none text-gray-700 placeholder-gray-400"
              />
              <button className="bg-red-600 text-white font-semibold px-6 py-3 rounded-full hover:bg-red-700 transition-colors whitespace-nowrap shadow-sm">
                {t('properties.newsletter.button')}
              </button>
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
  isInitiallyFavorited?: boolean;
}> = ({ property, t, onToggleFavorite, isInitiallyFavorited = false }) => {
  const [isFavorited, setIsFavorited] = useState(isInitiallyFavorited);
  const [checkingFavorite, setCheckingFavorite] = useState(false);
  const { isAuthenticated } = useAuthStore();
  const { compareList, addProperty, removeProperty } = useCompareStore();

  const isComparing = compareList.some(p => p.id === property.id?.toString());

  useEffect(() => {
    setIsFavorited(isInitiallyFavorited);
  }, [isInitiallyFavorited]);

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
      whileHover={{ y: -4 }}
      transition={{ duration: 0.3 }}
      className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 flex flex-col md:flex-row group"
    >
      {/* Image Section */}
      <Link to={`/properties/${property.id}`} className="relative w-full md:w-[320px] h-64 md:h-auto flex-shrink-0 bg-gray-100 block overflow-hidden">
        <img
          src={primaryImage}
          alt={property.title}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
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
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-60"></div>
        
        <div className="absolute top-3 left-3 flex gap-2">
          {property.isVerified && (
            <span className="bg-green-500 text-white px-2 py-1 text-xs font-semibold rounded-md shadow-sm flex items-center gap-1">
              <span className="w-1.5 h-1.5 bg-white rounded-full"></span> Xác thực
            </span>
          )}
          <span className="bg-white/90 backdrop-blur-md text-gray-900 px-2 py-1 text-xs font-bold rounded-md shadow-sm">
            {property.propertyDetails?.[0]?.images?.length || 5} <span className="opacity-70">Ảnh</span>
          </span>
        </div>

        <div className="absolute top-3 right-3 flex flex-col gap-2">
          <button 
            onClick={handleFavoriteClick}
            disabled={checkingFavorite || !isAuthenticated}
            className={`p-2.5 backdrop-blur-md rounded-full transition-all duration-300 shadow-sm ${
              isFavorited 
                ? 'bg-red-50 text-red-600 border border-red-100' 
                : 'bg-white/80 text-gray-600 hover:bg-white hover:text-red-500'
            } ${!isAuthenticated ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:scale-110'}`}
            title={isFavorited ? 'Xóa khỏi danh sách yêu thích' : 'Thêm vào danh sách yêu thích'}
          >
            <Heart className={`h-4 w-4 ${isFavorited ? 'fill-current' : ''}`} />
          </button>
          
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
            className={`p-2.5 backdrop-blur-md rounded-full transition-all duration-300 shadow-sm hover:scale-110 ${
              isComparing 
                ? 'bg-blue-50 text-blue-600 border border-blue-100' 
                : 'bg-white/80 text-gray-600 hover:bg-white hover:text-blue-500'
            }`}
            title={isComparing ? 'Huỷ so sánh' : 'Thêm vào so sánh'}
          >
            <Scale className={`h-4 w-4`} />
          </button>
        </div>
      </Link>

      {/* Content Section */}
      <div className="flex-1 p-5 md:p-6 flex flex-col justify-between">
        <div>
          <div className="flex justify-between items-start mb-3 gap-4">
            <Link to={`/properties/${property.id}`} className="font-bold text-lg md:text-xl text-gray-900 line-clamp-2 hover:text-red-600 transition-colors duration-200 flex-1">
              {property.title}
            </Link>
            <div className="text-right flex-shrink-0">
              <div className="text-xl md:text-2xl font-extrabold text-red-600">
                {property.price ? formatPrice(property.price) : t('properties.status.negotiable')}
              </div>
              {property.price && property.area && (
                <div className="text-sm text-gray-500 font-medium">
                  ~ {Math.round(property.price / property.area / 1000000)} triệu/m²
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center text-sm text-gray-600 mb-4 font-medium">
            <Map className="h-4 w-4 mr-1.5 text-gray-400" />
            <span className="truncate">{property.address}</span>
          </div>

          <div className="flex items-center gap-6 text-sm text-gray-700 mb-4 bg-gray-50/50 p-3 rounded-xl border border-gray-100 w-max">
            <div className="flex items-center gap-2" title="Diện tích">
              <span className="font-bold">{property.area}</span> <span className="text-gray-500">m²</span>
            </div>
            <div className="w-px h-4 bg-gray-300"></div>
            <div className="flex items-center gap-2" title="Phòng ngủ">
              <span className="font-bold">{property.propertyDetails?.[0]?.bedrooms || 0}</span> <span className="text-gray-500">PN</span>
            </div>
            <div className="w-px h-4 bg-gray-300"></div>
            <div className="flex items-center gap-2" title="Phòng tắm">
              <span className="font-bold">{property.propertyDetails?.[0]?.bathrooms || 0}</span> <span className="text-gray-500">PT</span>
            </div>
          </div>

          <p className="text-gray-600 text-sm mb-4 line-clamp-2 md:line-clamp-3 leading-relaxed">
            {property.description}
          </p>
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
          <div className="flex items-center">
            <div className="w-9 h-9 bg-gradient-to-br from-red-100 to-red-50 rounded-full flex items-center justify-center mr-3 border border-red-100">
              <User className="h-4 w-4 text-red-600" />
            </div>
            <div>
              <span className="text-sm font-semibold text-gray-900 block">{property.agent?.user?.fullName || property.user?.fullName || t('properties.details.owner')}</span>
              <span className="text-xs text-gray-500 font-medium">Đăng {property.createdAt ? new Date(property.createdAt).toLocaleDateString('vi-VN') : new Date().toLocaleDateString('vi-VN')}</span>
            </div>
          </div>
          
          <div className="flex gap-2">
            <button className="flex items-center gap-1.5 px-4 py-2 bg-red-50 text-red-600 text-sm font-semibold rounded-lg hover:bg-red-100 transition-colors">
              <Phone className="h-4 w-4" />
              <span className="hidden sm:inline">Gọi điện</span>
            </button>
            <button className="flex items-center gap-1.5 px-4 py-2 bg-white border border-gray-200 text-gray-700 text-sm font-semibold rounded-lg hover:border-gray-300 hover:bg-gray-50 transition-colors">
              Nhắn tin
            </button>
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
        className={`flex-shrink-0 flex items-center space-x-2 px-5 py-2 border rounded-full transition-all duration-300 text-sm font-medium ${
          value
            ? 'border-red-600 bg-red-50 text-red-600 shadow-sm'
            : 'border-gray-200 bg-white text-gray-700 hover:border-red-200 hover:bg-red-50 hover:text-red-600'
        }`}
      >
        <span>{selectedLabel || label}</span>
        <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      {isOpen && (
        <div className="absolute top-full left-0 mt-2 bg-white border border-gray-100 rounded-xl shadow-xl z-50 min-w-[180px] py-1 anim-fade-in-down">
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
