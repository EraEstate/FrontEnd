import React, { useState } from 'react';
import { Bell, Loader2, CheckCircle2, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '../store/authStore';
import { savedSearchAPI } from '../api';
import { showSuccess, showWarning, showError } from '../utils/toast';

interface SaveSearchButtonProps {
  searchParams: any;
  searchTerm?: string;
}

export const SaveSearchButton: React.FC<SaveSearchButtonProps> = ({ searchParams, searchTerm }) => {
  const { t } = useTranslation();
  const { isAuthenticated } = useAuthStore();
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  // Modal Form States
  const [searchName, setSearchName] = useState('');
  const [alertFrequency, setAlertFrequency] = useState<'INSTANT' | 'DAILY' | 'WEEKLY' | 'OFF'>('DAILY');

  const handleOpenModal = () => {
    if (!isAuthenticated) {
      showWarning(t('savedSearch.loginRequired', 'Vui lòng đăng nhập để lưu tìm kiếm và nhận cảnh báo!'));
      return;
    }
    
    // Auto-generate a beautiful descriptive search name
    let generatedName = searchTerm?.trim() 
      ? `Từ khóa: "${searchTerm}"` 
      : t('savedSearch.defaultName', 'Tìm kiếm của tôi');

    const filters = [];
    if (searchParams.propertyType) {
      filters.push(t(`propExtra.types.${searchParams.propertyType.toLowerCase()}`, searchParams.propertyType));
    }
    if (searchParams.minPrice || searchParams.maxPrice) {
      const min = searchParams.minPrice ? `${(searchParams.minPrice / 1000000000).toFixed(1)}B` : '0';
      const max = searchParams.maxPrice ? `${(searchParams.maxPrice / 1000000000).toFixed(1)}B` : '∞';
      filters.push(`${min} - ${max}`);
    }
    if (searchParams.bedrooms) {
      filters.push(`${searchParams.bedrooms} PN`);
    }

    if (filters.length > 0) {
      generatedName += ` (${filters.join(', ')})`;
    }

    setSearchName(generatedName);
    setIsOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchName.trim()) {
      showWarning(t('savedSearch.nameRequired', 'Vui lòng nhập tên tìm kiếm'));
      return;
    }

    setIsLoading(true);
    try {
      // Serialize only relevant parameters for backend matching
      const queryParamsObj: any = {
        query: searchTerm || searchParams.query || searchParams.keyword || '',
        propertyType: searchParams.propertyType || null,
        listingType: searchParams.listingType || null,
        minPrice: searchParams.minPrice || null,
        maxPrice: searchParams.maxPrice || null,
        minArea: searchParams.minArea || null,
        maxArea: searchParams.maxArea || null,
        bedrooms: searchParams.bedrooms || null,
        bathrooms: searchParams.bathrooms || null,
        provinceId: searchParams.provinceId || null,
        districtId: searchParams.districtId || null,
        wardId: searchParams.wardId || null,
      };

      await savedSearchAPI.createSavedSearch({
        searchName: searchName.trim(),
        queryParams: JSON.stringify(queryParamsObj),
        alertFrequency: alertFrequency
      });

      showSuccess(t('savedSearch.saveSuccess', 'Đã lưu tìm kiếm và thiết lập cảnh báo thành công!'));
      setIsOpen(false);
    } catch (error: any) {
      showError(t('savedSearch.saveError', 'Lỗi khi lưu tìm kiếm. Vui lòng thử lại sau.'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <button
        onClick={handleOpenModal}
        className="flex items-center gap-x-2 text-sm text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 px-4 py-2 rounded-full font-semibold transition-all duration-300 shadow-sm hover:shadow active:scale-95"
      >
        <Bell className="h-4 w-4 animate-swing" />
        <span>{t('savedSearch.button', 'Lưu tìm kiếm & Nhận cảnh báo')}</span>
      </button>

      {/* Glassmorphism Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm transition-opacity duration-300">
          <div className="relative w-full max-w-md bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl border border-gray-100 overflow-hidden transform scale-100 transition-all duration-300">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <Bell className="h-5 w-5 text-red-600" />
                {t('savedSearch.modalTitle', 'Lưu Tìm Kiếm & Nhận Cảnh Báo')}
              </h3>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSave} className="p-6 space-y-5">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  {t('savedSearch.searchNameLabel', 'Tên tìm kiếm đã lưu')}
                </label>
                <input
                  type="text"
                  value={searchName}
                  onChange={(e) => setSearchName(e.target.value)}
                  placeholder={t('savedSearch.searchNamePlaceholder', 'Ví dụ: Căn hộ giá rẻ Q.7')}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none text-gray-900 text-sm font-medium transition-all"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  {t('savedSearch.frequencyLabel', 'Tần suất thông báo tin mới')}
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { value: 'INSTANT', label: t('savedSearch.frequency.instant', 'Tức thời (Push)') },
                    { value: 'DAILY', label: t('savedSearch.frequency.daily', 'Hàng ngày') },
                    { value: 'WEEKLY', label: t('savedSearch.frequency.weekly', 'Hàng tuần') },
                    { value: 'OFF', label: t('savedSearch.frequency.off', 'Tắt thông báo') },
                  ].map((freq) => (
                    <button
                      key={freq.value}
                      type="button"
                      onClick={() => setAlertFrequency(freq.value as any)}
                      className={`px-4 py-3 text-xs font-semibold rounded-xl border text-center transition-all duration-200 ${
                        alertFrequency === freq.value
                          ? 'border-red-600 bg-red-50 text-red-600 shadow-sm font-bold'
                          : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50 text-gray-700'
                      }`}
                    >
                      {freq.label}
                    </button>
                  ))}
                </div>
                <p className="mt-2 text-xs text-gray-500 leading-relaxed">
                  {alertFrequency === 'INSTANT' && t('savedSearch.desc.instant', 'Thông báo ngay lập tức trên app khi có tin đăng mới duyệt trùng khớp.')}
                  {alertFrequency === 'DAILY' && t('savedSearch.desc.daily', 'Tổng hợp và thông báo tin mới khớp điều kiện vào 8h sáng hàng ngày.')}
                  {alertFrequency === 'WEEKLY' && t('savedSearch.desc.weekly', 'Tổng hợp tin mới khớp điều kiện và gửi thông báo hàng tuần.')}
                  {alertFrequency === 'OFF' && t('savedSearch.desc.off', 'Chỉ lưu bộ lọc để tìm kiếm lại nhanh chóng, không nhận thông báo.')}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="px-5 py-2.5 border border-gray-200 rounded-xl text-gray-700 hover:bg-gray-50 transition-colors text-sm font-semibold"
                >
                  {t('common.cancel', 'Hủy')}
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="px-6 py-2.5 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors text-sm font-semibold flex items-center justify-center gap-2 disabled:opacity-50 min-w-[100px]"
                >
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    t('common.save', 'Lưu lại')
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};
