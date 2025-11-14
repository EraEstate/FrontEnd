import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useRentProperties } from '../api/hooks';
import { useTranslation } from 'react-i18next';

interface RentProperty {
  id: number;
  title: string;
  price: string;
  location: string;
  area: string;
  bedrooms: number;
  bathrooms: number;
  image: string;
  type: string;
  isHot?: boolean;
}

const RentPage: React.FC = () => {
  const { t } = useTranslation();
  const [properties, setProperties] = useState<RentProperty[]>([]);
  const [filters, setFilters] = useState({
    location: '',
    priceRange: '',
    propertyType: '',
    bedrooms: ''
  });

  // API Hook for rent properties
  const { data: propertiesData, loading, error } = useRentProperties({
    city: filters.location,
    propertyType: filters.propertyType,
    minPrice: filters.priceRange === 'low' ? 0 : filters.priceRange === 'mid' ? 10000000 : 30000000,
    maxPrice: filters.priceRange === 'low' ? 10000000 : filters.priceRange === 'mid' ? 30000000 : undefined,
    page: 0,
    size: 20
  });

  useEffect(() => {
    // Set properties from API or fallback to mock data
    if (propertiesData?.content) {
      const rentProperties: RentProperty[] = propertiesData.content.map((property: any) => ({
        id: property.id,
        title: property.title,
        price: `${property.price?.toLocaleString()} VNĐ/tháng`,
        location: `${property.ward?.name || ''}, ${property.district?.name || ''}, ${property.province?.name || ''}`.trim(),
        area: `${property.area}m²`,
        bedrooms: property.bedrooms || 0,
        bathrooms: property.bathrooms || 0,
        image: property.images?.[0]?.url || "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=400",
        type: property.propertyType || t('postProperty.apartment'),
        isHot: property.featured || false
      }));
      setProperties(rentProperties);
    } else if (!loading && !error) {
    // Mock data cho nhà đất cho thuê
    const mockRentProperties: RentProperty[] = [
      {
        id: 1,
        title: "Cho thuê căn hộ 2PN tại Vinhomes Central Park",
        price: "25 triệu/tháng",
        location: "Quận 1, TP.HCM",
        area: "75m²",
        bedrooms: 2,
        bathrooms: 2,
        image: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=400",
        type: t('postProperty.apartment'),
        isHot: true
      },
      {
        id: 2,
        title: "Cho thuê nhà nguyên căn 4 tầng mặt phố",
        price: "45 triệu/tháng",
        location: "Ba Đình, Hà Nội",
        area: "120m²",
        bedrooms: 4,
        bathrooms: 3,
        image: "https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=400",
        type: "Nhà mặt phố"
      },
      {
        id: 3,
        title: "Cho thuê phòng trọ cao cấp có gác lửng",
        price: "5 triệu/tháng",
        location: "Gò Vấp, TP.HCM",
        area: "25m²",
        bedrooms: 1,
        bathrooms: 1,
        image: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=400",
        type: "Phòng trọ"
      },
      {
        id: 4,
        title: "Cho thuê biệt thự villa có hồ bơi",
        price: "80 triệu/tháng",
        location: "Thủ Đức, TP.HCM",
        area: "300m²",
        bedrooms: 5,
        bathrooms: 4,
        image: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=400",
        type: t('postProperty.villa')
      },
      {
        id: 5,
        title: t('properties.studioFullFurniture'),
        price: "12 triệu/tháng",
        location: "Cầu Giấy, Hà Nội",
        area: "35m²",
        bedrooms: 1,
        bathrooms: 1,
        image: "https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=400",
        type: "Căn hộ dịch vụ",
        isHot: true
      },
      {
        id: 6,
        title: "Cho thuê mặt bằng kinh doanh vị trí đẹp",
        price: "35 triệu/tháng",
        location: "Quận 3, TP.HCM",
        area: "80m²",
        bedrooms: 0,
        bathrooms: 2,
        image: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400",
        type: "Mặt bằng kinh doanh"
      }
    ];
      setProperties(mockRentProperties);
    }
  }, [propertiesData, loading, error]);

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      {/* Header Section */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Nhà đất cho thuê</h1>
          <p className="text-gray-600">Tìm kiếm nhà đất cho thuê tại Việt Nam</p>
        </div>
      </div>

      {/* Filters */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Khu vực</label>
              <select 
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={filters.location}
                onChange={(e) => setFilters({...filters, location: e.target.value})}
              >
                <option value="">Chọn khu vực</option>
                <option value="hcm">TP. Hồ Chí Minh</option>
                <option value="hn">Hà Nội</option>
                <option value="dn">Đà Nẵng</option>
                <option value="bd">Bình Dương</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Mức giá</label>
              <select 
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={filters.priceRange}
                onChange={(e) => setFilters({...filters, priceRange: e.target.value})}
              >
                <option value="">Chọn mức giá</option>
                <option value="under-10">Dưới 10 triệu</option>
                <option value="10-20">10 - 20 triệu</option>
                <option value="20-30">20 - 30 triệu</option>
                <option value="30-50">30 - 50 triệu</option>
                <option value="over-50">Trên 50 triệu</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Loại hình</label>
              <select 
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={filters.propertyType}
                onChange={(e) => setFilters({...filters, propertyType: e.target.value})}
              >
                <option value="">Chọn loại hình</option>
                <option value="apartment">Căn hộ chung cư</option>
                <option value="house">Nhà riêng</option>
                <option value="villa">Biệt thự</option>
                <option value="room">Phòng trọ</option>
                <option value="office">Văn phòng</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Phòng ngủ</label>
              <select 
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={filters.bedrooms}
                onChange={(e) => setFilters({...filters, bedrooms: e.target.value})}
              >
                <option value="">Chọn số phòng</option>
                <option value="1">1 phòng</option>
                <option value="2">2 phòng</option>
                <option value="3">3 phòng</option>
                <option value="4+">4+ phòng</option>
              </select>
            </div>
          </div>
          <div className="mt-4 flex justify-center">
            <button className="bg-blue-600 text-white px-8 py-2 rounded-md hover:bg-blue-700 transition-colors">
              Tìm kiếm
            </button>
          </div>
        </div>

        {/* Results */}
        <div className="bg-white rounded-lg shadow-md">
          <div className="p-6 border-b">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Có {properties.length} bất động sản cho thuê</h2>
              <div className="flex items-center space-x-4">
                <select className="px-3 py-2 border border-gray-300 rounded-md text-sm">
                  <option>Sắp xếp theo</option>
                  <option>Giá tăng dần</option>
                  <option>Giá giảm dần</option>
                  <option>Diện tích tăng dần</option>
                  <option>Mới nhất</option>
                </select>
              </div>
            </div>
          </div>
          
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {properties.map((property) => (
                <Link 
                  key={property.id} 
                  to={`/property/${property.id}`}
                  className="group"
                >
                  <div className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow">
                    <div className="relative">
                      <img 
                        src={property.image} 
                        alt={property.title}
                        className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      {property.isHot && (
                        <span className="absolute top-2 left-2 bg-red-500 text-white px-2 py-1 rounded text-xs font-medium">
                          HOT
                        </span>
                      )}
                    </div>
                    <div className="p-4">
                      <h3 className="font-medium text-gray-900 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
                        {property.title}
                      </h3>
                      <p className="text-red-600 font-bold text-lg mb-2">{property.price}</p>
                      <div className="flex items-center text-gray-600 text-sm mb-2">
                        <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                        </svg>
                        {property.location}
                      </div>
                      <div className="flex justify-between text-sm text-gray-600">
                        <span>{property.area}</span>
                        <span>{property.bedrooms} PN, {property.bathrooms} WC</span>
                      </div>
                      <div className="mt-2 text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                        {property.type}
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RentPage;