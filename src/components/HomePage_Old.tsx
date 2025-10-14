import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Search,
  MapPin,
  Home as HomeIcon,
  Building2,
  TreePine,
  Briefcase,
  ChevronDown,
  Star,
  Heart,
  Eye,
  Phone,
  TrendingUp,
  Award,
  Users,
  User,
  Building,
  ChevronRight,
  ArrowRight,
  Clock,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { usePropertyStore } from '../store/propertyStore';
import type { PropertySearchForm } from '../types';

const HomePage: React.FC = () => {
  const { properties, searchProperties } = usePropertyStore();
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('sale');
  const [searchForm, setSearchForm] = useState<PropertySearchForm>({
    transactionType: 'SALE',
    propertyType: '',
    provinceId: undefined,
    districtId: undefined,
    minPrice: undefined,
    maxPrice: undefined,
    minArea: undefined,
    maxArea: undefined,
  });

  useEffect(() => {
    setLoading(true);
    searchProperties({})
      .finally(() => setLoading(false));
  }, [searchProperties]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    searchProperties(searchForm);
  };

  const formatPrice = (price: number) => {
    if (price >= 1000000000) {
      return `${(price / 1000000000).toFixed(1)} tỷ`;
    } else if (price >= 1000000) {
      return `${(price / 1000000).toFixed(0)} triệu`;
    }
    return price.toLocaleString();
  };

  // Featured news articles matching batdongsan.com.vn structure
  const featuredNews = [
    {
      id: 1,
      title: 'Giá Nhà Tập Thể Cũ Hà Nội Tăng, Giao Dịch Cầm Chừng',
      time: '30 phút trước',
      category: 'BĐS Hà Nội'
    },
    {
      id: 2,
      title: 'Bảng Lãi Suất Ngân Hàng Vietcombank Mới Nhất Tháng 10/2025',
      time: '3 giờ trước',
      category: 'Wiki BĐS'
    },
    {
      id: 3,
      title: 'Bất Động Sản Tây Ninh – "Ngôi Sao Mới" Của Thị Trường Phía Nam',
      time: '21 giờ trước',
      category: 'BĐS TPHCM'
    },
    {
      id: 4,
      title: 'Giá Bán Chung Cư Hà Nội Sẽ Diễn Biến Ra Sao Thời Gian Tới?',
      time: '2 ngày trước',
      category: 'Phân tích đánh giá'
    },
    {
      id: 5,
      title: 'Chủ Nhà "Quay Xe" Khi Giá Chung Cư Liên Tục Tăng',
      time: '3 ngày trước',
      category: 'BĐS Hà Nội'
    },
    {
      id: 6,
      title: 'Chung Cư Hà Nội Tăng Giá: Cuộc "Làm Sóng" Của Giới Đầu Tư?',
      time: '6 ngày trước',
      category: 'BĐS Hà Nội'
    },
  ];

  const supportTools = [
    { name: 'Xem tuổi xây nhà', href: '/ho-tro-tien-ich/ht-xem-tuoi-xay-nha' },
    { name: 'Chi phí làm nhà', href: '/ho-tro-tien-ich/ht-du-toan-chi-tiet' },
    { name: 'Tính lãi suất', href: '/ho-tro-tien-ich/ht-tinh-lai-suat' },
    { name: 'Tư vấn phong thủy', href: '/ho-tro-tien-ich/ht-xem-huong-nha' },
  ];

  const locations = [
    { name: 'TP. Hồ Chí Minh', count: '77,810', image: 'https://file4.batdongsan.com.vn/images/newhome/cities1/HCM-web-1.jpg' },
    { name: 'Hà Nội', count: '58.320', image: 'https://file4.batdongsan.com.vn/images/newhome/cities1/HN-web-1.jpg' },
    { name: 'Đà Nẵng', count: '9,964', image: 'https://file4.batdongsan.com.vn/images/newhome/cities1/DDN-web-1.jpg' },
    { name: 'Bình Dương', count: '8,667', image: 'https://file4.batdongsan.com.vn/images/newhome/cities1/BD-web-1.jpg' },
    { name: 'Đồng Nai', count: '3,643', image: 'https://file4.batdongsan.com.vn/images/newhome/cities1/DNA-web-1.jpg' },
  ];

  const projects = [
    {
      name: 'Libera Nha Trang',
      area: '1,83 ha',
      location: 'Nha Trang, Khánh Hòa',
      status: 'Đang mở bán',
      rating: 6
    },
    {
      name: 'Lumiere SpringBay',
      area: '3,23 ha',
      location: 'Văn Giang, Hưng Yên',
      status: 'Đang mở bán',
      rating: 7
    },
    {
      name: 'Jade Square',
      area: '2,1 ha',
      location: 'Quận 9, Hồ Chí Minh',
      status: 'Đang mở bán',
      rating: 8
    },
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Main Search Section - exactly like batdongsan.com.vn */}
      <section className="bg-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Search Tabs */}
          <div className="flex border-b border-gray-200 mb-6">
            <button
              onClick={() => {
                setActiveTab('sale');
                setSearchForm({ ...searchForm, transactionType: 'SALE' });
              }}
              className={`px-6 py-3 font-medium border-b-2 transition-colors ${
                activeTab === 'sale'
                  ? 'border-orange-500 text-orange-600'
                  : 'border-transparent text-gray-600 hover:text-orange-600'
              }`}
            >
              Nhà đất bán
            </button>
            <button
              onClick={() => {
                setActiveTab('rent');
                setSearchForm({ ...searchForm, transactionType: 'RENT' });
              }}
              className={`px-6 py-3 font-medium border-b-2 transition-colors ${
                activeTab === 'rent'
                  ? 'border-orange-500 text-orange-600'
                  : 'border-transparent text-gray-600 hover:text-orange-600'
              }`}
            >
              Nhà đất cho thuê
            </button>
            <button
              onClick={() => setActiveTab('projects')}
              className={`px-6 py-3 font-medium border-b-2 transition-colors ${
                activeTab === 'projects'
                  ? 'border-orange-500 text-orange-600'
                  : 'border-transparent text-gray-600 hover:text-orange-600'
              }`}
            >
              Dự án
            </button>
          </div>

          {/* Search Form */}
          <form onSubmit={handleSearch} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-5 gap-3">
              {/* Location */}
              <div className="relative">
                <select className="w-full p-3 border border-gray-300 rounded focus:ring-2 focus:ring-orange-500 focus:border-transparent appearance-none bg-white">
                  <option>Trên toàn quốc</option>
                  <option>TP. Hồ Chí Minh</option>
                  <option>Hà Nội</option>
                  <option>Đà Nẵng</option>
                  <option>Bình Dương</option>
                  <option>Đồng Nai</option>
                </select>
                <ChevronDown className="absolute right-3 top-3 h-5 w-5 text-gray-400 pointer-events-none" />
              </div>

              {/* Property Type */}
              <div className="relative">
                <select
                  value={searchForm.propertyType || ''}
                  onChange={(e) => setSearchForm({ ...searchForm, propertyType: e.target.value })}
                  className="w-full p-3 border border-gray-300 rounded focus:ring-2 focus:ring-orange-500 focus:border-transparent appearance-none bg-white"
                >
                  <option value="">Loại nhà đất</option>
                  <option value="APARTMENT">Căn hộ chung cư</option>
                  <option value="HOUSE">Nhà riêng</option>
                  <option value="VILLA">Biệt thự</option>
                  <option value="LAND">Đất nền</option>
                  <option value="OFFICE">Văn phòng</option>
                </select>
                <ChevronDown className="absolute right-3 top-3 h-5 w-5 text-gray-400 pointer-events-none" />
              </div>

              {/* Price Range */}
              <div className="relative">
                <select className="w-full p-3 border border-gray-300 rounded focus:ring-2 focus:ring-orange-500 focus:border-transparent appearance-none bg-white">
                  <option>Khoảng giá</option>
                  <option>Dưới 1 tỷ</option>
                  <option>1 - 3 tỷ</option>
                  <option>3 - 5 tỷ</option>
                  <option>5 - 10 tỷ</option>
                  <option>Trên 10 tỷ</option>
                </select>
                <ChevronDown className="absolute right-3 top-3 h-5 w-5 text-gray-400 pointer-events-none" />
              </div>

              {/* Area */}
              <div className="relative">
                <select className="w-full p-3 border border-gray-300 rounded focus:ring-2 focus:ring-orange-500 focus:border-transparent appearance-none bg-white">
                  <option>Diện tích</option>
                  <option>Dưới 30 m²</option>
                  <option>30 - 50 m²</option>
                  <option>50 - 80 m²</option>
                  <option>80 - 100 m²</option>
                  <option>Trên 100 m²</option>
                </select>
                <ChevronDown className="absolute right-3 top-3 h-5 w-5 text-gray-400 pointer-events-none" />
              </div>

              {/* Search Button */}
              <button
                type="submit"
                className="bg-orange-600 text-white px-6 py-3 rounded hover:bg-orange-700 transition-colors font-medium flex items-center justify-center"
              >
                <Search className="h-5 w-5 mr-2" />
                Tìm kiếm
              </button>
            </div>

            {/* Search Input */}
            <div className="relative">
              <input
                type="text"
                placeholder="Tìm kiếm theo từ khóa, tên đường, quận huyện, tên dự án..."
                className="w-full p-3 border border-gray-300 rounded focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                value={searchForm.keyword || ''}
                onChange={(e) => setSearchForm({ ...searchForm, keyword: e.target.value })}
              />
            </div>
          </form>
        </div>
      </section>

      {/* Tin nổi bật Section */}
      <section className="py-8 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Tin nổi bật</h2>
            <Link to="/tin-tuc" className="text-orange-600 hover:text-orange-700 font-medium">
              Xem thêm
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredNews.slice(0, 3).map((article) => (
              <Link key={article.id} to={`/tin-tuc/${article.id}`} className="block group">
                <div className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow overflow-hidden">
                  <div className="h-48 bg-gradient-to-br from-orange-100 to-orange-200 flex items-center justify-center">
                    <div className="text-orange-600 text-4xl font-bold">BDS</div>
                  </div>
                  <div className="p-4">
                    <div className="text-xs text-orange-600 font-medium mb-2">{article.category}</div>
                    <h3 className="font-semibold text-gray-900 line-clamp-2 group-hover:text-orange-600 transition-colors mb-2">
                      {article.title}
                    </h3>
                    <div className="flex items-center text-sm text-gray-500">
                      <Clock className="h-4 w-4 mr-1" />
                      {article.time}
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* News Sections - BĐS TPHCM & BĐS Hà Nội */}
      <section className="py-8 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* BĐS TPHCM */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900">BĐS TPHCM</h2>
                <Link to="/tin-tuc/bat-dong-san-tp-hcm" className="text-orange-600 hover:text-orange-700 text-sm font-medium">
                  Xem thêm
                </Link>
              </div>
              <div className="space-y-3">
                {featuredNews.slice(0, 3).map((article) => (
                  <Link key={article.id} to={`/tin-tuc/${article.id}`} className="block group">
                    <div className="flex items-start space-x-3 py-2 hover:bg-gray-50 rounded">
                      <div className="w-2 h-2 bg-orange-600 rounded-full mt-2 flex-shrink-0"></div>
                      <div className="flex-1">
                        <h3 className="text-sm font-medium text-gray-900 group-hover:text-orange-600 line-clamp-2 mb-1">
                          {article.title}
                        </h3>
                        <div className="text-xs text-gray-500">{article.time}</div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            {/* BĐS Hà Nội */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900">BĐS Hà Nội</h2>
                <Link to="/tin-tuc/bat-dong-san-ha-noi" className="text-orange-600 hover:text-orange-700 text-sm font-medium">
                  Xem thêm
                </Link>
              </div>
              <div className="space-y-3">
                {featuredNews.slice(3, 6).map((article) => (
                  <Link key={article.id} to={`/tin-tuc/${article.id}`} className="block group">
                    <div className="flex items-start space-x-3 py-2 hover:bg-gray-50 rounded">
                      <div className="w-2 h-2 bg-orange-600 rounded-full mt-2 flex-shrink-0"></div>
                      <div className="flex-1">
                        <h3 className="text-sm font-medium text-gray-900 group-hover:text-orange-600 line-clamp-2 mb-1">
                          {article.title}
                        </h3>
                        <div className="text-xs text-gray-500">{article.time}</div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Bất động sản dành cho bạn */}
      <section className="py-8 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Bất động sản dành cho bạn</h2>
            <Link to="/nha-dat-ban" className="text-orange-600 hover:text-orange-700 font-medium">
              Xem thêm
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="bg-white rounded-lg shadow-sm overflow-hidden animate-pulse">
                  <div className="h-48 bg-gray-300"></div>
                  <div className="p-4 space-y-3">
                    <div className="h-4 bg-gray-300 rounded w-3/4"></div>
                    <div className="h-4 bg-gray-300 rounded w-1/2"></div>
                    <div className="h-4 bg-gray-300 rounded w-2/3"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {properties.slice(0, 8).map((property) => (
                <Link key={property.id} to={`/property/${property.id}`} className="block group">
                  <div className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow overflow-hidden">
                    <div className="relative">
                      <img
                        src={property.propertyImages?.[0]?.imageUrl || '/api/placeholder/300/200'}
                        alt={property.title}
                        className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute top-3 left-3 bg-orange-600 text-white px-2 py-1 rounded text-xs font-medium">
                        {property.propertyType}
                      </div>
                      <button className="absolute top-3 right-3 p-1.5 bg-white/90 rounded-full hover:bg-white transition-colors">
                        <Heart className="h-4 w-4 text-gray-600 hover:text-red-500" />
                      </button>
                    </div>
                    
                    <div className="p-4">
                      <h3 className="font-medium text-gray-900 mb-2 line-clamp-2 group-hover:text-orange-600 transition-colors">
                        {property.title}
                      </h3>
                      
                      <div className="flex items-center text-gray-500 mb-2 text-sm">
                        <MapPin className="h-3 w-3 mr-1" />
                        <span className="truncate">{property.address}</span>
                      </div>
                      
                      <div className="flex items-center justify-between mb-2">
                        <div className="text-orange-600 font-bold">
                          {formatPrice(property.price)}
                        </div>
                        <div className="text-sm text-gray-500">
                          {property.area} m²
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <span>{property.propertyDetails?.[0]?.bedrooms || 0} PN</span>
                        <span>{property.propertyDetails?.[0]?.bathrooms || 0} WC</span>
                        <span>T{property.propertyDetails?.[0]?.floors || 1}</span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Dự án bất động sản nổi bật */}
      <section className="py-8 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Dự án bất động sản nổi bật</h2>
            <Link to="/du-an-bat-dong-san" className="text-orange-600 hover:text-orange-700 font-medium">
              Xem thêm
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project, index) => (
              <Link key={index} to={`/du-an/${project.name.toLowerCase().replace(/\s+/g, '-')}`} className="block group">
                <div className="bg-white border border-gray-200 rounded-lg hover:shadow-md transition-shadow overflow-hidden">
                  <div className="h-48 bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center relative">
                    <div className="text-blue-600 text-2xl font-bold">{project.name}</div>
                    <div className="absolute top-3 left-3 bg-green-600 text-white px-2 py-1 rounded text-xs font-medium">
                      {project.status}
                    </div>
                    <div className="absolute top-3 right-3 flex items-center bg-white/90 px-2 py-1 rounded text-xs">
                      <Star className="h-3 w-3 text-yellow-500 mr-1" />
                      {project.rating}
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-gray-900 mb-2 group-hover:text-orange-600 transition-colors">
                      {project.name}
                    </h3>
                    <div className="text-sm text-gray-600 space-y-1">
                      <div>{project.area}</div>
                      <div className="flex items-center">
                        <MapPin className="h-3 w-3 mr-1" />
                        {project.location}
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Bất động sản theo địa điểm */}
      <section className="py-8 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Bất động sản theo địa điểm</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
            {locations.map((location, index) => (
              <Link key={index} to={`/nha-dat-ban-${location.name.toLowerCase().replace(/\s+/g, '-')}`} className="block group">
                <div className="text-center">
                  <div className="relative overflow-hidden rounded-lg mb-3">
                    <img
                      src={location.image}
                      alt={location.name}
                      className="w-full h-32 object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-20 group-hover:bg-opacity-10 transition-all"></div>
                  </div>
                  <h3 className="font-semibold text-gray-900 group-hover:text-orange-600 transition-colors mb-1">
                    {location.name}
                  </h3>
                  <p className="text-sm text-gray-600">{location.count} tin đăng</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Tin tức bất động sản */}
      <section className="py-8 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Tin tức bất động sản</h2>
            <Link to="/tin-tuc" className="text-orange-600 hover:text-orange-700 font-medium">
              Xem thêm
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-6">
            {featuredNews.map((article, index) => (
              <Link key={article.id} to={`/tin-tuc/${article.id}`} className="block group">
                <div className="text-center">
                  <div className="w-8 h-8 bg-orange-600 text-white rounded-full flex items-center justify-center text-sm font-bold mb-3 mx-auto">
                    {String(index + 1).padStart(2, '0')}
                  </div>
                  <h3 className="font-medium text-gray-900 group-hover:text-orange-600 transition-colors line-clamp-3 text-sm">
                    {article.title}
                  </h3>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Hỗ trợ tiện ích */}
      <section className="py-8 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Hỗ trợ tiện ích</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {supportTools.map((tool, index) => (
              <Link key={index} to={tool.href} className="block group">
                <div className="bg-white border border-gray-200 rounded-lg p-4 text-center hover:shadow-md transition-shadow">
                  <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <TrendingUp className="h-6 w-6 text-orange-600" />
                  </div>
                  <h3 className="font-medium text-gray-900 group-hover:text-orange-600 transition-colors">
                    {tool.name}
                  </h3>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;