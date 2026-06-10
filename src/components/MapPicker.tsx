import React, { useState, useCallback } from 'react';
import { X, MapPin, Search, Building2, Home, Store } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface MapPickerProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectLocation: (location: { lat: number; lng: number; address: string }) => void;
}

interface Location {
  name: string;
  type: 'province' | 'district' | 'ward' | 'store';
  parent?: string;
  lat: number;
  lng: number;
  address?: string;
}

const MapPicker: React.FC<MapPickerProps> = ({ isOpen, onClose, onSelectLocation }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLocation, setSelectedLocation] = useState<{ lat: number; lng: number; address: string } | null>(null);
  const [selectedProvince, setSelectedProvince] = useState<string>('');
  const [selectedDistrict, setSelectedDistrict] = useState<string>('');
  const { t } = useTranslation();

  // 63 tỉnh thành Việt Nam + Quận/Huyện + Xã/Phường + Cửa hàng
  const vietnamLocations: Location[] = [
    // TP. HỒ CHÍ MINH - Đầy đủ
    { name: 'TP. Hồ Chí Minh', type: 'province', lat: 10.8231, lng: 106.6297 },
    { name: 'Quận 1', type: 'district', parent: 'TP. Hồ Chí Minh', lat: 10.7756, lng: 106.7019 },
    { name: 'Phường Bến Nghé', type: 'ward', parent: 'Quận 1', lat: 10.7742, lng: 106.7028 },
    { name: 'Phường Bến Thành', type: 'ward', parent: 'Quận 1', lat: 10.7745, lng: 106.7015 },
    { name: 'CH BĐS Nguyễn Huệ', type: 'store', parent: 'Phường Bến Nghé', lat: 10.7742, lng: 106.7028, address: '123 Nguyễn Huệ, Q1' },
    { name: 'CH BĐS Đồng Khởi', type: 'store', parent: 'Phường Bến Nghé', lat: 10.7769, lng: 106.7040, address: '45 Đồng Khởi, Q1' },
    { name: 'Quận 3', type: 'district', parent: 'TP. Hồ Chí Minh', lat: 10.7826, lng: 106.6875 },
    { name: 'Phường 1', type: 'ward', parent: 'Quận 3', lat: 10.7799, lng: 106.6917 },
    { name: 'CH BĐS Võ Văn Tần', type: 'store', parent: 'Phường 1', lat: 10.7799, lng: 106.6917, address: '234 Võ Văn Tần, Q3' },
    { name: 'Quận 7', type: 'district', parent: 'TP. Hồ Chí Minh', lat: 10.7338, lng: 106.7217 },
    { name: 'Phường Tân Phú', type: 'ward', parent: 'Quận 7', lat: 10.7338, lng: 106.7217 },
    { name: 'CH BĐS Phú Mỹ Hưng', type: 'store', parent: 'Phường Tân Phú', lat: 10.7338, lng: 106.7217, address: 'Phú Mỹ Hưng, Q7' },
    { name: 'Thủ Đức', type: 'district', parent: 'TP. Hồ Chí Minh', lat: 10.7892, lng: 106.7450 },
    { name: 'Phường Thảo Điền', type: 'ward', parent: 'Thủ Đức', lat: 10.8034, lng: 106.7385 },
    { name: 'CH BĐS Thảo Điền', type: 'store', parent: 'Phường Thảo Điền', lat: 10.8034, lng: 106.7385, address: '89 Xuân Thủy, Thảo Điền' },
    
    // HÀ NỘI - Đầy đủ
    { name: 'Hà Nội', type: 'province', lat: 21.0285, lng: 105.8542 },
    { name: 'Ba Đình', type: 'district', parent: 'Hà Nội', lat: 21.0344, lng: 105.8195 },
    { name: 'Phường Điện Biên', type: 'ward', parent: 'Ba Đình', lat: 21.0322, lng: 105.8227 },
    { name: 'CH BĐS Hoàng Hoa Thám', type: 'store', parent: 'Phường Điện Biên', lat: 21.0322, lng: 105.8227, address: '56 Hoàng Hoa Thám, Ba Đình' },
    { name: 'Hoàn Kiếm', type: 'district', parent: 'Hà Nội', lat: 21.0285, lng: 105.8542 },
    { name: 'Phường Hàng Bài', type: 'ward', parent: 'Hoàn Kiếm', lat: 21.0241, lng: 105.8446 },
    { name: 'CH BĐS Hồ Gươm', type: 'store', parent: 'Phường Hàng Bài', lat: 21.0241, lng: 105.8446, address: '78 Lý Thường Kiệt, Hoàn Kiếm' },
    { name: 'Cầu Giấy', type: 'district', parent: 'Hà Nội', lat: 21.0337, lng: 105.7936 },
    { name: 'Phường Dịch Vọng', type: 'ward', parent: 'Cầu Giấy', lat: 21.0337, lng: 105.7936 },
    { name: 'CH BĐS Cầu Giấy', type: 'store', parent: 'Phường Dịch Vọng', lat: 21.0337, lng: 105.7936, address: '123 Xuân Thủy, Cầu Giấy' },
    
    // ĐÀ NẴNG
    { name: 'Đà Nẵng', type: 'province', lat: 16.0544, lng: 108.2022 },
    { name: 'Hải Châu', type: 'district', parent: 'Đà Nẵng', lat: 16.0475, lng: 108.2219 },
    { name: 'Phường Thạch Thang', type: 'ward', parent: 'Hải Châu', lat: 16.0576, lng: 108.2235 },
    { name: 'CH BĐS Trần Phú', type: 'store', parent: 'Phường Thạch Thang', lat: 16.0576, lng: 108.2235, address: '90 Trần Phú, Hải Châu' },
    { name: 'Sơn Trà', type: 'district', parent: 'Đà Nẵng', lat: 16.0830, lng: 108.2479 },
    { name: 'Phường Mân Thái', type: 'ward', parent: 'Sơn Trà', lat: 16.0830, lng: 108.2479 },
    { name: 'CH BĐS Sơn Trà', type: 'store', parent: 'Phường Mân Thái', lat: 16.0830, lng: 108.2479, address: '45 Võ Nguyên Giáp, Sơn Trà' },
    
    // Các tỉnh còn lại (63 tỉnh)
    { name: 'Hải Phòng', type: 'province', lat: 20.8449, lng: 106.6881 },
    { name: 'Hồng Bàng', type: 'district', parent: 'Hải Phòng', lat: 20.8647, lng: 106.6831 },
    { name: 'CH BĐS Hải Phòng', type: 'store', parent: 'Hồng Bàng', lat: 20.8647, lng: 106.6831, address: '12 Điện Biên Phủ, HP' },
    
    { name: 'Cần Thơ', type: 'province', lat: 10.0452, lng: 105.7469 },
    { name: 'Ninh Kiều', type: 'district', parent: 'Cần Thơ', lat: 10.0452, lng: 105.7469 },
    { name: 'CH BĐS Cần Thơ', type: 'store', parent: 'Ninh Kiều', lat: 10.0452, lng: 105.7469, address: '34 Hai Bà Trưng, CT' },
    
    { name: 'Nha Trang', type: 'province', lat: 12.2388, lng: 109.1967 },
    { name: 'CH BĐS Nha Trang', type: 'store', parent: 'Nha Trang', lat: 12.2388, lng: 109.1967, address: '67 Trần Phú, NT' },
    
    { name: 'Vũng Tàu', type: 'province', lat: 10.3460, lng: 107.0844 },
    { name: 'CH BĐS Vũng Tàu', type: 'store', parent: 'Vũng Tàu', lat: 10.3460, lng: 107.0844, address: '89 Quang Trung, VT' },
    
    { name: 'Đà Lạt', type: 'province', lat: 11.9404, lng: 108.4583 },
    { name: 'CH BĐS Đà Lạt', type: 'store', parent: 'Đà Lạt', lat: 11.9404, lng: 108.4583, address: '23 3 Tháng 4, ĐL' },
    
    { name: 'Biên Hòa', type: 'province', lat: 10.9510, lng: 106.8439 },
    { name: 'CH BĐS Biên Hòa', type: 'store', parent: 'Biên Hòa', lat: 10.9510, lng: 106.8439, address: '45 Phạm Văn Thuận, BH' },
    
    { name: 'Bình Dương', type: 'province', lat: 10.9804, lng: 106.6519 },
    { name: 'CH BĐS Bình Dương', type: 'store', parent: 'Bình Dương', lat: 10.9804, lng: 106.6519, address: '78 Đại lộ Bình Dương' },
    
    // Thêm các tỉnh khác
    { name: 'An Giang', type: 'province', lat: 10.5216, lng: 105.1258 },
    { name: 'Bà Rịa - Vũng Tàu', type: 'province', lat: 10.5417, lng: 107.2430 },
    { name: 'Bắc Giang', type: 'province', lat: 21.2819, lng: 106.1975 },
    { name: 'Bắc Kạn', type: 'province', lat: 22.1474, lng: 105.8348 },
    { name: 'Bạc Liêu', type: 'province', lat: 9.2940, lng: 105.7215 },
    { name: 'Bắc Ninh', type: 'province', lat: 21.1863, lng: 106.0752 },
    { name: 'Bến Tre', type: 'province', lat: 10.2433, lng: 106.3757 },
    { name: 'Bình Định', type: 'province', lat: 13.7831, lng: 109.2197 },
    { name: 'Bình Phước', type: 'province', lat: 11.7512, lng: 106.7234 },
    { name: 'Bình Thuận', type: 'province', lat: 10.9291, lng: 108.1044 },
    { name: 'Cà Mau', type: 'province', lat: 9.1527, lng: 105.1960 },
    { name: 'Cao Bằng', type: 'province', lat: 22.6666, lng: 106.2520 },
    { name: 'Đắk Lắk', type: 'province', lat: 12.7100, lng: 108.2378 },
    { name: 'Đắk Nông', type: 'province', lat: 12.2646, lng: 107.6098 },
    { name: 'Điện Biên', type: 'province', lat: 21.8042, lng: 103.1076 },
    { name: 'Đồng Nai', type: 'province', lat: 11.0686, lng: 107.1676 },
    { name: 'Đồng Tháp', type: 'province', lat: 10.4938, lng: 105.6881 },
    { name: 'Gia Lai', type: 'province', lat: 13.8078, lng: 108.1094 },
    { name: 'Hà Giang', type: 'province', lat: 22.8025, lng: 104.9784 },
    { name: 'Hà Nam', type: 'province', lat: 20.5835, lng: 105.9230 },
    { name: 'Hà Tĩnh', type: 'province', lat: 18.3559, lng: 105.8879 },
    { name: 'Hải Dương', type: 'province', lat: 20.9373, lng: 106.3145 },
    { name: 'Hậu Giang', type: 'province', lat: 9.7579, lng: 105.6412 },
    { name: 'Hòa Bình', type: 'province', lat: 20.6861, lng: 105.3131 },
    { name: 'Hưng Yên', type: 'province', lat: 20.6464, lng: 106.0511 },
    { name: 'Khánh Hòa', type: 'province', lat: 12.2585, lng: 109.0526 },
    { name: 'Kiên Giang', type: 'province', lat: 10.0125, lng: 105.0810 },
    { name: 'Kon Tum', type: 'province', lat: 14.3497, lng: 108.0005 },
    { name: 'Lai Châu', type: 'province', lat: 22.3864, lng: 103.4702 },
    { name: 'Lâm Đồng', type: 'province', lat: 11.5753, lng: 108.1429 },
    { name: 'Lạng Sơn', type: 'province', lat: 21.8537, lng: 106.7610 },
    { name: 'Lào Cai', type: 'province', lat: 22.4809, lng: 103.9756 },
    { name: 'Long An', type: 'province', lat: 10.6956, lng: 106.2431 },
    { name: 'Nam Định', type: 'province', lat: 20.4388, lng: 106.1621 },
    { name: 'Nghệ An', type: 'province', lat: 19.2342, lng: 104.9200 },
    { name: 'Ninh Bình', type: 'province', lat: 20.2506, lng: 105.9745 },
    { name: 'Ninh Thuận', type: 'province', lat: 11.6738, lng: 108.8629 },
    { name: 'Phú Thọ', type: 'province', lat: 21.2683, lng: 105.2045 },
    { name: 'Phú Yên', type: 'province', lat: 13.0882, lng: 109.0929 },
    { name: 'Quảng Bình', type: 'province', lat: 17.6103, lng: 106.3487 },
    { name: 'Quảng Nam', type: 'province', lat: 15.5394, lng: 108.0192 },
    { name: 'Quảng Ngãi', type: 'province', lat: 15.1214, lng: 108.8044 },
    { name: 'Quảng Ninh', type: 'province', lat: 21.0064, lng: 107.2925 },
    { name: 'Quảng Trị', type: 'province', lat: 16.7404, lng: 107.1854 },
    { name: 'Sóc Trăng', type: 'province', lat: 9.6037, lng: 105.9739 },
    { name: 'Sơn La', type: 'province', lat: 21.1022, lng: 103.7289 },
    { name: 'Tây Ninh', type: 'province', lat: 11.3351, lng: 106.1098 },
    { name: 'Thái Bình', type: 'province', lat: 20.5386, lng: 106.3934 },
    { name: 'Thái Nguyên', type: 'province', lat: 21.5671, lng: 105.8252 },
    { name: 'Thanh Hóa', type: 'province', lat: 19.8067, lng: 105.7851 },
    { name: 'Thừa Thiên Huế', type: 'province', lat: 16.4674, lng: 107.5905 },
    { name: 'Tiền Giang', type: 'province', lat: 10.4493, lng: 106.3420 },
    { name: 'Trà Vinh', type: 'province', lat: 9.8125, lng: 106.2992 },
    { name: 'Tuyên Quang', type: 'province', lat: 21.7767, lng: 105.2280 },
    { name: 'Vĩnh Long', type: 'province', lat: 10.2396, lng: 105.9722 },
    { name: 'Vĩnh Phúc', type: 'province', lat: 21.3091, lng: 105.5474 },
    { name: 'Yên Bái', type: 'province', lat: 21.7168, lng: 104.8985 },
  ];

  const provinces = vietnamLocations.filter(loc => loc.type === 'province');
  const getDistrictsByProvince = (provinceName: string) => 
    vietnamLocations.filter(loc => loc.type === 'district' && loc.parent === provinceName);
  const getWardsByDistrict = (districtName: string) => 
    vietnamLocations.filter(loc => loc.type === 'ward' && loc.parent === districtName);
  const getStoresByWard = (wardName: string) => 
    vietnamLocations.filter(loc => loc.type === 'store' && loc.parent === wardName);
  
  const filteredLocations = vietnamLocations.filter(loc =>
    loc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    loc.address?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleLocationClick = useCallback((location: Location) => {
    const addressParts = [location.address || location.name];
    if (location.parent) {
      addressParts.push(location.parent);
      const parentLoc = vietnamLocations.find(l => l.name === location.parent);
      if (parentLoc?.parent) {
        addressParts.push(parentLoc.parent);
      }
    }
    const fullAddress = addressParts.join(', ');
    
    setSelectedLocation({ 
      lat: location.lat, 
      lng: location.lng, 
      address: fullAddress 
    });
    
    if (location.type === 'province') {
      setSelectedProvince(location.name);
      setSelectedDistrict('');
    } else if (location.type === 'district') {
      setSelectedDistrict(location.name);
    }
  }, [vietnamLocations]);

  const handleConfirm = () => {
    if (selectedLocation) {
      onSelectLocation(selectedLocation);
      onClose();
    }
  };

  const getLocationIcon = (type: string) => {
    switch (type) {
      case 'province':
        return <Building2 className="h-4 w-4" />;
      case 'district':
        return <Home className="h-4 w-4" />;
      case 'ward':
        return <MapPin className="h-4 w-4" />;
      case 'store':
        return <Store className="h-4 w-4" />;
      default:
        return <MapPin className="h-4 w-4" />;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-950/60 backdrop-blur-sm pt-20">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl h-[85vh] flex flex-col mx-4 mt-4">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-x-3">
            <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center">
              <MapPin className="h-5 w-5 text-red-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">🇻🇳 {t('mapPicker.title')}</h2>
              <p className="text-sm text-gray-500">{t('mapPicker.subtitle')}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-gray-100 transition-colors"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="flex flex-1 overflow-hidden">
          {/* Full Width Location List */}
          <div className="flex-1 flex flex-col bg-gray-50">
            {/* Search Bar */}
            <div className="p-6 border-b border-gray-200 bg-white">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder={t('mapPicker.searchPlaceholder')}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 text-base"
                />
              </div>
            </div>

            {/* Locations List */}
            <div className="flex-1 overflow-y-auto p-6">
              {!searchQuery && !selectedProvince && (
                <>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">🏙️ {t('mapPicker.provincesList')}</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                    {provinces.map((province) => (
                  <button
                        key={province.name}
                        onClick={() => handleLocationClick(province)}
                        className={`p-4 rounded-xl border-2 transition-all duration-200 text-left ${
                          selectedLocation?.address.includes(province.name)
                            ? 'border-red-500 bg-red-50'
                            : 'border-gray-200 hover:border-red-300 hover:bg-gray-50'
                        }`}
                      >
                        <div className="flex items-center gap-x-3">
                          <div className={`p-2 rounded-lg ${
                            selectedLocation?.address.includes(province.name)
                              ? 'bg-red-500 text-white'
                              : 'bg-gray-100 text-red-600'
                          }`}>
                            <Building2 className="h-4 w-4" />
                          </div>
                          <span className="font-semibold text-sm">{province.name}</span>
                        </div>
                  </button>
                    ))}
                  </div>
                </>
              )}

              {!searchQuery && selectedProvince && !selectedDistrict && (
                <>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">📍 {selectedProvince}</h3>
                    <button
                      onClick={() => setSelectedProvince('')}
                      className="text-sm text-red-600 hover:text-red-700 font-medium"
                    >
                      ← {t('common.back')}
                    </button>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {getDistrictsByProvince(selectedProvince).map((district) => (
                      <button
                        key={district.name}
                        onClick={() => handleLocationClick(district)}
                        className={`p-4 rounded-xl border-2 transition-all duration-200 text-left ${
                          selectedLocation?.address.includes(district.name)
                            ? 'border-red-500 bg-red-50'
                            : 'border-gray-200 hover:border-red-300 hover:bg-gray-50'
                        }`}
                      >
                        <div className="flex items-center gap-x-3">
                          <div className={`p-2 rounded-lg ${
                            selectedLocation?.address.includes(district.name)
                              ? 'bg-red-500 text-white'
                              : 'bg-gray-100 text-orange-600'
                          }`}>
                            <Home className="h-4 w-4" />
                          </div>
                          <span className="font-semibold text-sm">{district.name}</span>
                        </div>
                      </button>
                    ))}
              </div>

                </>
              )}

              {!searchQuery && selectedDistrict && (
                <>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">🏘️ {selectedDistrict}</h3>
              <button
                      onClick={() => setSelectedDistrict('')}
                      className="text-sm text-red-600 hover:text-red-700 font-medium"
              >
                      ← {t('common.back')}
              </button>
            </div>

                  {/* Wards */}
                  <div className="mb-6">
                    <h4 className="text-sm font-semibold text-gray-700 mb-3">📍 {t('mapPicker.wards')}</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {getWardsByDistrict(selectedDistrict).map((ward) => (
                  <button
                          key={ward.name}
                          onClick={() => handleLocationClick(ward)}
                          className={`p-3 rounded-lg border transition-all duration-200 text-left ${
                            selectedLocation?.address.includes(ward.name)
                              ? 'border-red-500 bg-red-50'
                              : 'border-gray-200 hover:border-red-300 hover:bg-gray-50'
                          }`}
                        >
                          <div className="flex items-center gap-x-2">
                            <MapPin className={`h-3.5 w-3.5 ${
                              selectedLocation?.address.includes(ward.name) ? 'text-red-500' : 'text-blue-600'
                            }`} />
                            <span className="text-sm font-medium">{ward.name}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

                  {/* Stores */}
                  {getWardsByDistrict(selectedDistrict).map(ward => {
                    const stores = getStoresByWard(ward.name);
                    if (stores.length === 0) return null;
                    return (
                      <div key={ward.name} className="mb-4">
                        <h4 className="text-sm font-semibold text-gray-700 mb-2">🏪 {t('mapPicker.store')} - {ward.name}</h4>
                        <div className="space-y-2">
                          {stores.map((store) => (
                <button
                              key={store.name}
                              onClick={() => handleLocationClick(store)}
                              className={`w-full p-4 rounded-xl border-2 transition-all duration-200 text-left ${
                                selectedLocation?.address === store.address
                                  ? 'border-red-500 bg-red-50'
                                  : 'border-gray-200 hover:border-red-300 hover:bg-gray-50'
                              }`}
                            >
                              <div className="flex items-center gap-x-3">
                                <div className={`p-2 rounded-lg ${
                                  selectedLocation?.address === store.address
                                    ? 'bg-red-500 text-white'
                                    : 'bg-green-100 text-green-600'
                                }`}>
                                  <Store className="h-4 w-4" />
                                </div>
                                <div className="flex-1">
                                  <div className="font-semibold text-sm">{store.name}</div>
                                  <div className="text-xs text-gray-500">{store.address}</div>
                                </div>
                              </div>
                </button>
                          ))}
                        </div>
              </div>
                    );
                  })}
                </>
              )}

              {searchQuery && (
                <>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">🔍 {t('mapPicker.searchResults')}</h3>
                  {filteredLocations.length === 0 ? (
                    <div className="text-center py-12 text-gray-500">
                      <Search className="h-12 w-12 mx-auto mb-3 opacity-50" />
                      <p>{t('mapPicker.noResults')}</p>
          </div>
                  ) : (
                    <div className="space-y-2">
                      {filteredLocations.map((location) => (
                        <button
                          key={location.name + location.address}
                          onClick={() => handleLocationClick(location)}
                          className={`w-full p-4 rounded-xl border-2 transition-all duration-200 text-left ${
                            selectedLocation?.address === (location.address || location.name)
                              ? 'border-red-500 bg-red-50'
                              : 'border-gray-200 hover:border-red-300 hover:bg-gray-50'
                          }`}
                        >
                          <div className="flex items-center gap-x-3">
                            <div className={`p-2 rounded-lg ${
                              selectedLocation?.address === (location.address || location.name)
                                ? 'bg-red-500 text-white'
                                : location.type === 'store' ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-red-600'
                            }`}>
                              {getLocationIcon(location.type)}
                  </div>
                  <div className="flex-1">
                              <div className="font-semibold">{location.name}</div>
                              {(location.address || location.parent) && (
                                <div className="text-xs text-gray-500">
                                  {location.address || location.parent}
              </div>
            )}
          </div>
        </div>
                        </button>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>

        {/* Footer with Selected Location */}
        {selectedLocation && (
          <div className="p-6 border-t border-gray-200 bg-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="min-w-0 flex-1">
              <p className="text-xs text-gray-500 mb-1">📍 {t('mapPicker.selectedLocation')}</p>
              <p className="font-bold text-gray-900 text-base sm:text-lg break-words leading-tight">{selectedLocation.address}</p>
            </div>
            <button
              onClick={handleConfirm}
              className="w-full sm:w-auto bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white px-8 py-3 rounded-xl font-bold transition-all duration-200 shadow-lg hover:shadow-xl text-center whitespace-nowrap"
            >
              {t('common.confirm')}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default MapPicker;
