import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  Bell, 
  Trash2, 
  Clock, 
  Search, 
  ChevronRight, 
  Sliders, 
  Loader2, 
  Filter, 
  AlertCircle, 
  Activity, 
  Sparkles,
  CheckCircle,
  ToggleLeft,
  ToggleRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { savedSearchAPI } from '../api';
import type { SavedSearch } from '../api/types';
import { showSuccess, showError, showWarning } from '../utils/toast';
import { useNavigate } from 'react-router-dom';

const SavedSearchesPage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searches, setSearches] = useState<SavedSearch[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const fetchSavedSearches = async () => {
    try {
      setLoading(true);
      const data = await savedSearchAPI.getMySavedSearches();
      setSearches(data);
    } catch (error) {
      showError(t('savedSearch.fetchError', 'Không thể tải danh sách tìm kiếm đã lưu'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSavedSearches();
  }, []);

  const handleToggleActive = async (id: string, currentStatus: boolean) => {
    setUpdatingId(id);
    try {
      await savedSearchAPI.updateSavedSearch(id, { isActive: !currentStatus });
      setSearches(prev => prev.map(item => item.id === id ? { ...item, isActive: !currentStatus } : item));
      showSuccess(t('savedSearch.statusUpdated', 'Cập nhật trạng thái thành công!'));
    } catch (error) {
      showError(t('savedSearch.updateError', 'Không thể cập nhật trạng thái'));
    } finally {
      setUpdatingId(null);
    }
  };

  const handleChangeFrequency = async (id: string, frequency: SavedSearch['alertFrequency']) => {
    setUpdatingId(id);
    try {
      await savedSearchAPI.updateSavedSearch(id, { alertFrequency: frequency });
      setSearches(prev => prev.map(item => item.id === id ? { ...item, alertFrequency: frequency } : item));
      showSuccess(t('savedSearch.frequencyUpdated', 'Cập nhật tần suất thông báo thành công!'));
    } catch (error) {
      showError(t('savedSearch.updateError', 'Không thể cập nhật tần suất'));
    } finally {
      setUpdatingId(null);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm(t('savedSearch.deleteConfirm', 'Bạn có chắc chắn muốn xóa tìm kiếm đã lưu này không?'))) {
      return;
    }

    try {
      await savedSearchAPI.deleteSavedSearch(id);
      setSearches(prev => prev.filter(item => item.id !== id));
      showSuccess(t('savedSearch.deleteSuccess', 'Đã xóa tìm kiếm đã lưu thành công!'));
    } catch (error) {
      showError(t('savedSearch.deleteError', 'Không thể xóa tìm kiếm'));
    }
  };

  const handleSearchClick = (queryParamsStr: string) => {
    try {
      const params = JSON.parse(queryParamsStr);
      const searchParams = new URLSearchParams();
      
      Object.keys(params).forEach(key => {
        if (params[key] !== null && params[key] !== undefined && params[key] !== '') {
          searchParams.append(key, params[key].toString());
        }
      });
      
      // Navigate to properties search page with loaded filters
      navigate(`/properties?${searchParams.toString()}`);
    } catch (e) {
      showWarning(t('savedSearch.parseError', 'Không thể khôi phục bộ lọc tìm kiếm'));
    }
  };

  const getReadableFilters = (queryParamsStr: string) => {
    try {
      const params = JSON.parse(queryParamsStr);
      const filters: string[] = [];

      if (params.query) filters.push(`Từ khóa: "${params.query}"`);
      if (params.propertyType) filters.push(t(`propExtra.types.${params.propertyType.toLowerCase()}`, params.propertyType));
      if (params.listingType) filters.push(params.listingType === 'RENT' ? 'Cho thuê' : 'Bán');
      
      if (params.minPrice || params.maxPrice) {
        const min = params.minPrice ? `${(params.minPrice / 1000000000).toFixed(1)} Tỷ` : '0';
        const max = params.maxPrice ? `${(params.maxPrice / 1000000000).toFixed(1)} Tỷ` : 'Vô hạn';
        filters.push(`Giá: ${min} - ${max}`);
      }

      if (params.minArea || params.maxArea) {
        const min = params.minArea ? `${params.minArea} m²` : '0';
        const max = params.maxArea ? `${params.maxArea} m²` : 'Vô hạn';
        filters.push(`Diện tích: ${min} - ${max}`);
      }

      if (params.bedrooms) filters.push(`${params.bedrooms} Phòng ngủ`);
      if (params.bathrooms) filters.push(`${params.bathrooms} Phòng tắm`);

      return filters.length > 0 ? filters.join(' • ') : 'Tất cả danh mục';
    } catch (e) {
      return 'Mọi bất động sản';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 via-gray-100 to-gray-200 py-10 px-4 md:px-8 mt-12">
      <div className="max-w-4xl mx-auto">
        {/* Header Hero Area */}
        <div className="relative bg-gradient-to-r from-red-600 to-red-800 rounded-3xl p-8 text-white shadow-xl overflow-hidden mb-8">
          <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 bg-white/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-60 h-60 bg-red-400/20 rounded-full blur-2xl"></div>

          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-xs font-bold uppercase tracking-wider mb-3">
                <Sparkles className="h-3.5 w-3.5" />
                Smart Alerts
              </span>
              <h1 className="text-3xl font-extrabold tracking-tight mb-2">
                {t('savedSearch.pageTitle', 'Tìm Kiếm Đã Lưu & Cảnh Báo')}
              </h1>
              <p className="text-red-100 text-sm max-w-xl">
                Quản lý các bộ lọc tìm kiếm yêu thích của bạn và theo dõi thông tin cập nhật giá, dự án bất động sản mới tức thì.
              </p>
            </div>
            <div className="bg-white/15 backdrop-blur-lg p-5 rounded-2xl border border-white/10 flex items-center gap-4">
              <div className="p-3 bg-white text-red-700 rounded-xl shadow-md">
                <Bell className="h-6 w-6 animate-swing" />
              </div>
              <div>
                <div className="text-2xl font-black">{searches.length}</div>
                <div className="text-xs text-red-100 font-semibold uppercase">{t('savedSearch.statsTitle', 'Bộ lọc hoạt động')}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Content Section */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl border border-gray-100 shadow-sm">
            <Loader2 className="h-10 w-10 text-red-600 animate-spin mb-4" />
            <p className="text-gray-500 font-medium">{t('common.loading', 'Đang tải dữ liệu...')}</p>
          </div>
        ) : searches.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-16 bg-white rounded-3xl border border-gray-100 shadow-sm p-8"
          >
            <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6 text-red-600 border border-red-100">
              <Search className="h-8 w-8" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">
              {t('savedSearch.emptyTitle', 'Chưa có tìm kiếm nào được lưu')}
            </h2>
            <p className="text-gray-500 text-sm max-w-sm mx-auto mb-6">
              Bạn có thể dễ dàng lưu lại bộ lọc ưa thích khi đang tìm kiếm bất động sản để nhận thông báo tự động ngay khi có tin đăng mới.
            </p>
            <button
              onClick={() => navigate('/properties')}
              className="inline-flex items-center gap-2 px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-semibold shadow transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0"
            >
              <Search className="h-5 w-5" />
              {t('savedSearch.exploreButton', 'Khám phá bất động sản')}
            </button>
          </motion.div>
        ) : (
          <div className="space-y-4">
            <AnimatePresence>
              {searches.map((search) => (
                <motion.div
                  key={search.id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className={`bg-white rounded-2xl border transition-all duration-300 shadow-sm hover:shadow-md ${
                    search.isActive ? 'border-gray-100' : 'border-gray-200 bg-gray-50/75 opacity-75'
                  }`}
                >
                  <div className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="flex-1 space-y-3">
                      <div className="flex items-center gap-3">
                        <span className={`h-2.5 w-2.5 rounded-full ${search.isActive ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`} />
                        <h3 className="font-extrabold text-gray-900 text-lg hover:text-red-600 cursor-pointer flex items-center gap-1.5 transition-colors"
                            onClick={() => handleSearchClick(search.queryParams)}
                        >
                          {search.searchName}
                          <ChevronRight className="h-4 w-4 opacity-50" />
                        </h3>
                      </div>
                      
                      {/* Sub-text query info */}
                      <div className="flex items-center gap-2 text-xs text-gray-600 bg-gray-50 px-3.5 py-2 rounded-xl border border-gray-100 w-fit">
                        <Filter className="h-3.5 w-3.5 text-gray-400 flex-shrink-0" />
                        <span className="font-medium line-clamp-1">{getReadableFilters(search.queryParams)}</span>
                      </div>

                      {/* Notified stats */}
                      <div className="flex items-center gap-4 text-xs text-gray-400">
                        <span className="flex items-center gap-1">
                          <Clock className="h-3.5 w-3.5" />
                          Lưu ngày: {new Date(search.createdAt).toLocaleDateString()}
                        </span>
                        {search.lastNotifiedAt && (
                          <span className="flex items-center gap-1 text-green-600 font-semibold bg-green-50 px-2 py-0.5 rounded-md">
                            <CheckCircle className="h-3.5 w-3.5" />
                            Đã báo: {new Date(search.lastNotifiedAt).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Action Controls */}
                    <div className="flex flex-wrap items-center gap-4 border-t md:border-t-0 pt-4 md:pt-0 border-gray-100">
                      {/* Frequency Selection */}
                      <div className="flex items-center gap-1.5 bg-gray-100 p-1 rounded-xl">
                        {[
                          { value: 'INSTANT', label: 'Tức thời' },
                          { value: 'DAILY', label: 'Hàng ngày' },
                          { value: 'OFF', label: 'Tắt' },
                        ].map((option) => (
                          <button
                            key={option.value}
                            onClick={() => handleChangeFrequency(search.id, option.value as any)}
                            disabled={updatingId === search.id}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                              search.alertFrequency === option.value
                                ? 'bg-white text-red-600 shadow-sm'
                                : 'text-gray-600 hover:text-gray-900'
                            }`}
                          >
                            {option.label}
                          </button>
                        ))}
                      </div>

                      {/* Active Status Switch */}
                      <button
                        onClick={() => handleToggleActive(search.id, search.isActive)}
                        disabled={updatingId === search.id}
                        className="text-gray-500 hover:text-red-600 transition-colors p-1.5 hover:bg-gray-50 rounded-xl"
                        title={search.isActive ? 'Tạm dừng cảnh báo' : 'Kích hoạt cảnh báo'}
                      >
                        {search.isActive ? (
                          <ToggleRight className="h-8 w-8 text-red-600" />
                        ) : (
                          <ToggleLeft className="h-8 w-8 text-gray-400" />
                        )}
                      </button>

                      {/* Delete Button */}
                      <button
                        onClick={() => handleDelete(search.id)}
                        disabled={updatingId === search.id}
                        className="p-2.5 border border-gray-200 hover:border-red-200 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                        title="Xóa tìm kiếm này"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
};

export default SavedSearchesPage;
