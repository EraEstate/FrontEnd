import React, { useState, useEffect } from 'react';
import {
  Search,
  ChevronDown,
  MapPin,
  TrendingUp,
  Clock,
  Star,
  Eye,
  Heart,
  ChevronRight,
  Map,
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useFeaturedProperties, useFeaturedNews, useTopAgents, useProvinces } from '../api/hooks';
import { useTranslation } from 'react-i18next';
import MapPicker from './MapPicker';

const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const [searchLocation, setSearchLocation] = useState('');
  const [activeTab, setActiveTab] = useState('sale');
  const [currentSlide, setCurrentSlide] = useState(0);
  const { t } = useTranslation();
  
  // API Hooks
  const { data: provinces } = useProvinces();

  // Dropdown states
  const [isLocationOpen, setIsLocationOpen] = useState(false);
  const [isPropertyTypeOpen, setIsPropertyTypeOpen] = useState(false);
  const [isPriceOpen, setIsPriceOpen] = useState(false);
  const [isAreaOpen, setIsAreaOpen] = useState(false);

  // Selected values
  const [selectedLocation, setSelectedLocation] = useState('');
  const [selectedPropertyType, setSelectedPropertyType] = useState('');
  const [selectedPrice, setSelectedPrice] = useState('');
  const [selectedArea, setSelectedArea] = useState('');

  // Map picker state
  const [isMapPickerOpen, setIsMapPickerOpen] = useState(false);

  // API Hooks
  const { data: featuredProperties } = useFeaturedProperties(0, 8);
  const { data: featuredNews } = useFeaturedNews(5);
  const { data: topAgents } = useTopAgents(0, 6);

  const bannerSlides = [
    {
      id: 1,
      title: t('home.banner.slide1.title'),
      subtitle: t('home.banner.slide1.subtitle'),
      image: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80',
      alt: t('home.banner.slide1.alt')
    },
    {
      id: 2, 
      title: t('home.banner.slide2.title'),
      subtitle: t('home.banner.slide2.subtitle'),
      image: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80',
      alt: t('home.banner.slide2.alt')
    },
    {
      id: 3,
      title: t('home.banner.slide3.title'),
      subtitle: t('home.banner.slide3.subtitle'),
      image: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80',
      alt: t('home.banner.slide3.alt')
    },
    {
      id: 4,
      title: t('home.banner.slide4.title'),
      subtitle: t('home.banner.slide4.subtitle'),
      image: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80',
      alt: t('home.banner.slide4.alt')
    }
  ];



  // Auto slide effect
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % bannerSlides.length);
    }, 4000); // Chuyển slide mỗi 4 giây

    return () => clearInterval(timer);
  }, [bannerSlides.length]);

  // Handle search
  const handleSearch = (e?: React.FormEvent) => {
    if (e) {
      e.preventDefault();
    }

    const searchParams = new URLSearchParams();

    // Map location name to provinceId
    if (selectedLocation && provinces) {
      const province = provinces.find((p: any) => 
        p.name.includes(selectedLocation) || selectedLocation.includes(p.name) ||
        p.name.replace(/Thành phố|Tỉnh|TP\.?/g, '').trim() === selectedLocation.replace(/Thành phố|Tỉnh|TP\.?/g, '').trim()
      );
      if (province) {
        searchParams.set('provinceId', province.id.toString());
      }
    }

    // Map propertyType from Vietnamese text to enum
    const propertyTypeMap: { [key: string]: string } = {
      'Căn hộ/Chung cư': 'APARTMENT',
      'Nhà riêng': 'HOUSE',
      'Biệt thự': 'VILLA',
      'Nhà mặt phố': 'HOUSE',
      'Đất nền': 'LAND',
      'Shophouse': 'OFFICE'
    };
    if (selectedPropertyType && propertyTypeMap[selectedPropertyType]) {
      searchParams.set('propertyType', propertyTypeMap[selectedPropertyType]);
    }

    // Map price range to minPrice/maxPrice
    const priceRangeMap: { [key: string]: { min: number; max?: number } } = {
      'Dưới 1 tỷ': { min: 0, max: 1000000000 },
      '1-3 tỷ': { min: 1000000000, max: 3000000000 },
      '3-5 tỷ': { min: 3000000000, max: 5000000000 },
      '5-10 tỷ': { min: 5000000000, max: 10000000000 },
      '10-20 tỷ': { min: 10000000000, max: 20000000000 },
      'Trên 20 tỷ': { min: 20000000000 }
    };
    if (selectedPrice && priceRangeMap[selectedPrice]) {
      const range = priceRangeMap[selectedPrice];
      searchParams.set('minPrice', range.min.toString());
      if (range.max) {
        searchParams.set('maxPrice', range.max.toString());
      }
    }

    // Map area range to minArea/maxArea
    const areaRangeMap: { [key: string]: { min: number; max?: number } } = {
      'Dưới 30m²': { min: 0, max: 30 },
      '30-50m²': { min: 30, max: 50 },
      '50-80m²': { min: 50, max: 80 },
      '80-100m²': { min: 80, max: 100 },
      '100-150m²': { min: 100, max: 150 },
      'Trên 150m²': { min: 150 }
    };
    if (selectedArea && areaRangeMap[selectedArea]) {
      const range = areaRangeMap[selectedArea];
      searchParams.set('minArea', range.min.toString());
      if (range.max) {
        searchParams.set('maxArea', range.max.toString());
      }
    }

    // Map listingType from activeTab
    if (activeTab === 'sale') {
      searchParams.set('listingType', 'SALE');
    } else if (activeTab === 'rent') {
      searchParams.set('listingType', 'RENT');
    }

    // Add keyword search
    if (searchLocation.trim()) {
      searchParams.set('query', searchLocation.trim());
    }

    // Navigate to properties page with search params
    navigate(`/properties?${searchParams.toString()}`);
  };

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % bannerSlides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + bannerSlides.length) % bannerSlides.length);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section với Banner Background và Search Bar */}
      <section className="relative h-96 md:h-[500px] lg:h-[600px] overflow-hidden">
        {/* Background Banner Slider */}
        <div className="absolute inset-0">
          {bannerSlides.map((slide, index) => (
            <div
              key={slide.id}
              className={`absolute inset-0 transition-all duration-1000 ease-in-out ${
                index === currentSlide ? 'opacity-100 scale-100' : 'opacity-0 scale-105'
              }`}
            >
              {/* Real estate background image */}
              <div 
                className="w-full h-full bg-cover bg-center bg-no-repeat"
                style={{
                  backgroundImage: `url(${slide.image})`
                }}
              >
                {/* Dark overlay for readability */}
                <div className="absolute inset-0 bg-black bg-opacity-50" />
              </div>
            </div>
          ))}
        </div>

        {/* Navigation Controls for Banner */}
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2 z-10">
          {bannerSlides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`w-2 h-2 rounded-full transition-all duration-300 ${
                index === currentSlide ? 'bg-white scale-125' : 'bg-white bg-opacity-50 hover:bg-opacity-75'
              }`}
            />
          ))}
        </div>

        <button 
          onClick={prevSlide}
          className="absolute left-4 top-1/2 transform -translate-y-1/2 w-10 h-10 bg-black bg-opacity-20 hover:bg-opacity-40 rounded-full flex items-center justify-center text-white transition-all duration-200 z-10"
        >
          <ChevronDown className="h-5 w-5 rotate-90" />
        </button>
        <button 
          onClick={nextSlide}
          className="absolute right-4 top-1/2 transform -translate-y-1/2 w-10 h-10 bg-black bg-opacity-20 hover:bg-opacity-40 rounded-full flex items-center justify-center text-white transition-all duration-200 z-10"
        >
          <ChevronDown className="h-5 w-5 -rotate-90" />
        </button>

        {/* Content overlay với Search */}
        <div className="relative z-20 h-full flex flex-col justify-center">
          <div className="max-w-7xl mx-auto px-6 lg:px-12 w-full">
            {/* Hero Title */}
            <div className="text-center text-white mb-8">
              <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold mb-4 leading-tight">
                {t('home.hero.title')}
              </h1>
              <p className="text-lg md:text-xl opacity-90 max-w-2xl mx-auto">
                {t('home.hero.subtitle')}
              </p>
            </div>

            {/* Tab Navigation */}
          <div className="flex justify-center space-x-1 mb-6">
              <button
                onClick={() => setActiveTab('sale')}
                className={`px-6 py-3 rounded-t-lg font-bold transition-all duration-200 shadow-lg ${
                  activeTab === 'sale'
                    ? 'bg-white text-red-600 shadow-xl'
                    : 'bg-black bg-opacity-30 text-white hover:bg-opacity-40 hover:shadow-lg'
                }`}
              >
                {t('home.tabs.sale')}
              </button>
              <button
                onClick={() => setActiveTab('rent')}
                className={`px-6 py-3 rounded-t-lg font-bold transition-all duration-200 shadow-lg ${
                  activeTab === 'rent'
                    ? 'bg-white text-red-600 shadow-xl'
                    : 'bg-black bg-opacity-30 text-white hover:bg-opacity-40 hover:shadow-lg'
                }`}
              >
                {t('home.tabs.rent')}
              </button>
              <button
                onClick={() => setActiveTab('project')}
                className={`px-6 py-3 rounded-t-lg font-bold transition-all duration-200 shadow-lg ${
                  activeTab === 'project'
                    ? 'bg-white text-red-600 shadow-xl'
                    : 'bg-black bg-opacity-30 text-white hover:bg-opacity-40 hover:shadow-lg'
                }`}
              >
                {t('home.tabs.project')}
              </button>
            </div>

          {/* Simple 2-Button Search */}
          <div className="max-w-3xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Map Button - Large and Beautiful */}
              <button 
                type="button"
                onClick={() => setIsMapPickerOpen(true)}
                className="group relative bg-white rounded-2xl p-8 shadow-2xl hover:shadow-3xl transition-all duration-300 hover:-translate-y-1 border-2 border-transparent hover:border-blue-500"
              >
                <div className="flex flex-col items-center space-y-4">
                  <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-full p-6 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                    <Map className="h-10 w-10 text-white" />
                  </div>
                  <div className="text-center">
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">
                      Xem Bản Đồ
                    </h3>
                    <p className="text-sm text-gray-600">
                      Tìm kiếm bất động sản trên bản đồ Việt Nam
                    </p>
                  </div>
                </div>
                <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl" />
              </button>

              {/* Search Button - Large and Beautiful */}
              <button 
                type="button"
                onClick={handleSearch}
                className="group relative bg-white rounded-2xl p-8 shadow-2xl hover:shadow-3xl transition-all duration-300 hover:-translate-y-1 border-2 border-transparent hover:border-red-500"
              >
                <div className="flex flex-col items-center space-y-4">
                  <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-full p-6 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                    <Search className="h-10 w-10 text-white" />
                  </div>
                  <div className="text-center">
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">
                      Tìm Kiếm
                    </h3>
                    <p className="text-sm text-gray-600">
                      Khám phá hàng ngàn bất động sản
                    </p>
                  </div>
                </div>
                <div className="absolute inset-0 bg-gradient-to-br from-red-50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl" />
              </button>
            </div>
          </div>
          </div>
        </div>
      </section>

      {/* Map Picker Modal */}
      <MapPicker
        isOpen={isMapPickerOpen}
        onClose={() => setIsMapPickerOpen(false)}
        onSelectLocation={(location) => {
          setSelectedLocation(location.address);
          setSearchLocation(location.address);
          console.log('Selected location:', location);
        }}
      />

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 lg:px-12 py-8">
        {/* Bất động sản dành cho bạn Section */}
        <section className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">{t('home.sections.featuredProperties')}</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Featured Properties từ API */}
            {(featuredProperties?.content || []).slice(0, 4).map((property: any) => (
              <Link
                key={property.id}
                to={`/property/${property.id}`}
                className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow"
              >
                <div 
                  className="h-48 bg-cover bg-center bg-no-repeat"
                  style={{ backgroundImage: `url(${property.imageUrl || 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80'})` }}
                >
                  <div className="h-full bg-black bg-opacity-20 hover:bg-opacity-30 transition-all duration-200" />
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-gray-900 mb-2 text-sm line-clamp-2">{property.title}</h3>
                  <div className="flex items-center justify-between text-sm mb-2">
                    <span className="text-red-600 font-bold">
                      {property.price >= 1000000000 ? `${(property.price / 1000000000).toFixed(1)} tỷ` : 
                       property.price >= 1000000 ? `${(property.price / 1000000).toFixed(0)} triệu` : 
                       property.price?.toLocaleString('vi-VN')} VND
                    </span>
                    <span className="text-gray-600">{property.area}m²</span>
                  </div>
                  <p className="text-xs text-gray-500 truncate">{property.address}</p>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* Tin nổi bật Section */}
        <section className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">{t('home.sections.featuredNews')}</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Featured News Cards với style giống batdongsan.com.vn */}
            {[
              { title: t('home.featuredNews.hanoi.title'), subtitle: t('home.featuredNews.hanoi.subtitle'), image: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80' },
              { title: t('home.featuredNews.hcm.title'), subtitle: t('home.featuredNews.hcm.subtitle'), image: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80' },
              { title: t('home.featuredNews.wiki.title'), subtitle: t('home.featuredNews.wiki.subtitle'), image: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80' },
            ].map((item, index) => (
              <Link
                key={index}
                to={`/category/${item.title.toLowerCase().replace(/\s+/g, '-')}`}
                className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow"
              >
                <div 
                  className="h-32 bg-cover bg-center bg-no-repeat"
                  style={{ backgroundImage: `url(${item.image})` }}
                >
                  <div className="h-full bg-black bg-opacity-40 flex items-center justify-center">
                    <div className="text-center text-white">
                      <h3 className="font-bold text-lg mb-1">{item.title}</h3>
                    </div>
                  </div>
                </div>
                <div className="p-4">
                  <p className="text-sm text-gray-600 text-center">{item.subtitle}</p>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* Tin tức Section */}
        <section className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">{t('home.sections.news')}</h2>
            <Link to="/news" className="text-red-600 hover:text-red-700 font-bold flex items-center transition-all duration-200 hover:scale-105">
              {t('home.viewMore')} <ChevronRight className="h-4 w-4 ml-1" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Featured News từ API */}
            {(featuredNews?.content || []).slice(0, 6).map((article: any) => (
              <Link 
                key={article.id} 
                to={`/news/${article.id}`}
                className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow overflow-hidden"
              >
                <div 
                  className="h-40 bg-cover bg-center bg-no-repeat"
                  style={{ backgroundImage: `url(${article.imageUrl || 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80'})` }}
                >
                  <div className="h-full bg-black bg-opacity-30 flex items-end p-4">
                    <span className="text-xs text-white bg-red-600 px-2 py-1 rounded font-medium">{article.category}</span>
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-gray-900 mb-3 line-clamp-2 text-sm leading-tight">
                    {article.title}
                  </h3>
                  <div className="flex items-center text-xs text-gray-500">
                    <Clock className="h-3 w-3 mr-1" />
                    {new Date(article.createdAt).toLocaleDateString('vi-VN')}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* Dự án bất động sản nổi bật */}
        <section className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">{t('home.sections.featuredProjects')}</h2>
            <Link to="/du-an" className="text-red-600 hover:text-red-700 font-bold flex items-center transition-all duration-200 hover:scale-105">
              {t('home.viewMore')} <ChevronRight className="h-4 w-4 ml-1" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Project Cards */}
            {[
              { name: t('home.projects.libera.name'), area: '1,83 ha', location: t('home.projects.libera.location'), status: t('home.projects.status.opening'), rating: 6, image: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80' },
              { name: t('home.projects.lumiere.name'), area: '3,23 ha', location: t('home.projects.lumiere.location'), status: t('home.projects.status.opening'), rating: 7, image: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80' },
              { name: t('home.projects.jade.name'), area: '2,5 ha', location: t('home.projects.jade.location'), status: t('home.projects.status.comingSoon'), rating: 8, image: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80' },
              { name: t('home.projects.masteri.name'), area: '4,2 ha', location: t('home.projects.masteri.location'), status: t('home.projects.status.completed'), rating: 16, image: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80' },
              { name: t('home.projects.verosa.name'), area: '8,1 ha', location: t('home.projects.verosa.location'), status: t('home.projects.status.completed'), rating: 16, image: 'https://images.unsplash.com/photo-1570129477492-45c003edd2be?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80' },
              { name: t('home.projects.vinhomes.name'), area: '271 ha', location: t('home.projects.vinhomes.location'), status: t('home.projects.status.selling'), rating: 20, image: 'https://images.unsplash.com/photo-1555636222-cae831e670b3?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80' },
            ].map((project, index) => (
              <Link
                key={index}
                to={`/du-an/${project.name.toLowerCase().replace(/\s+/g, '-')}`}
                className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow"
              >
                <div className="h-48 relative">
                  <div 
                    className="w-full h-full bg-cover bg-center bg-no-repeat"
                    style={{ backgroundImage: `url(${project.image})` }}
                  >
                    <div className="absolute inset-0 bg-black bg-opacity-20" />
                  </div>
                  <div className="absolute top-3 right-3 bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs font-medium">
                    {project.rating}
                  </div>
                  <div className="absolute bottom-3 left-3 text-white">
                    <div className="bg-black bg-opacity-50 px-2 py-1 rounded text-xs font-medium">
                      {project.area}
                    </div>
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-gray-900 mb-2 line-clamp-1">{project.name}</h3>
                  <div className="flex items-center justify-between text-sm mb-2">
                    <span className="text-gray-600">{project.area}</span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      project.status === 'Đang mở bán' ? 'bg-green-100 text-green-700' :
                      project.status === 'Đã bàn giao' ? 'bg-blue-100 text-blue-700' :
                      'bg-orange-100 text-orange-700'
                    }`}>
                      {project.status}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 truncate">{project.location}</p>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* Bất động sản theo địa điểm */}
        <section className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">{t('home.sections.propertiesByLocation')}</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {/* Location Cards */}
            {[
              { name: t('home.locations.hcm.name'), listings: t('home.locations.hcm.listings'), image: 'https://images.unsplash.com/photo-1583417319070-4a69db38a482?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80' },
              { name: t('home.locations.hanoi.name'), listings: t('home.locations.hanoi.listings'), image: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80' },
              { name: t('home.locations.danang.name'), listings: t('home.locations.danang.listings'), image: 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80' },
              { name: t('home.locations.binhduong.name'), listings: t('home.locations.binhduong.listings'), image: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80' },
            ].map((location, index) => (
              <Link
                key={index}
                to={`/nha-dat-ban-${location.name.toLowerCase().replace(/\s+/g, '-')}`}
                className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow"
              >
                <div className="h-48 relative">
                  <div 
                    className="w-full h-full bg-cover bg-center bg-no-repeat"
                    style={{ backgroundImage: `url(${location.image})` }}
                  >
                    <div className="absolute inset-0 bg-black bg-opacity-30" />
                  </div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center text-white">
                      <MapPin className="h-8 w-8 mx-auto mb-2" />
                      <div className="font-bold text-lg">{location.name}</div>
                    </div>
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-gray-900 mb-1">{location.name}</h3>
                  <p className="text-sm text-gray-600">{location.listings}</p>
                </div>
              </Link>
            ))}
          </div>

          {/* Dự án nổi bật khác */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
            {[
              t('home.featuredProjects.vinhomesCentral'),
              t('home.featuredProjects.vinhomesGrand'),
              t('home.featuredProjects.vinhomesSmart'),
              t('home.featuredProjects.vinhomesOcean'),
              t('home.featuredProjects.vungTau'),
              t('home.featuredProjects.bcons'),
              t('home.featuredProjects.grandeur'),
              t('home.featuredProjects.diamond'),
              t('home.featuredProjects.haDo'),
              t('home.featuredProjects.sunAvenue'),
            ].map((project, index) => (
              <Link
                key={index}
                to={`/du-an/${project.toLowerCase().replace(/\s+/g, '-')}`}
                className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow text-center"
              >
                <h4 className="font-medium text-gray-900 text-sm line-clamp-2">{project}</h4>
              </Link>
            ))}
          </div>
        </section>

        {/* Tin tức bất động sản */}
        <section className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">{t('home.sections.realEstateNews')}</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Numbered News Articles */}
            {[
              { 
                number: '01',
                title: t('home.news.article1.title'),
                subtitle: t('home.news.article1.subtitle')
              },
              { 
                number: '02',
                title: t('home.news.article2.title'),
                subtitle: t('home.news.article2.subtitle')
              },
              { 
                number: '03',
                title: t('home.news.article3.title'),
                subtitle: t('home.news.article3.subtitle')
              },
              { 
                number: '04',
                title: t('home.news.article4.title'),
                subtitle: t('home.news.article4.subtitle')
              },
              { 
                number: '05',
                title: t('home.news.article5.title'),
                subtitle: t('home.news.article5.subtitle')
              },
              { 
                number: '06',
                title: t('home.news.article6.title'),
                subtitle: t('home.news.article6.subtitle')
              },
            ].map((article, index) => (
              <Link
                key={index}
                to={`/tin-tuc/${article.title.toLowerCase().replace(/\s+/g, '-')}`}
                className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow p-6 border-l-4 border-red-600"
              >
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 bg-red-600 text-white rounded-full flex items-center justify-center font-bold text-sm">
                      {article.number}
                    </div>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-gray-900 mb-2 line-clamp-2 text-sm leading-tight">
                      {article.title}
                    </h3>
                    <p className="text-xs text-gray-600 line-clamp-2 leading-relaxed">
                      {article.subtitle}
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* Hỗ trợ tiện ích */}
        <section className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">{t('home.sections.utilitySupport')}</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Utility Cards */}
            {[
              { title: t('home.utilities.ageCalculator.title'), desc: t('home.utilities.ageCalculator.desc'), image: 'https://images.unsplash.com/photo-1503387762-592deb58ef4e?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80' },
              { title: t('home.utilities.constructionCost.title'), desc: t('home.utilities.constructionCost.desc'), image: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80' },
              { title: t('home.utilities.interestCalculator.title'), desc: t('home.utilities.interestCalculator.desc'), image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80' },
              { title: t('home.utilities.fengshui.title'), desc: t('home.utilities.fengshui.desc'), image: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80' },
            ].map((utility, index) => (
              <Link
                key={index}
                to={`/ho-tro-tien-ich/${utility.title.toLowerCase().replace(/\s+/g, '-')}`}
                className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-all duration-200 hover:scale-105 border border-gray-200"
              >
                <div 
                  className="h-32 bg-cover bg-center bg-no-repeat"
                  style={{ backgroundImage: `url(${utility.image})` }}
                >
                  <div className="h-full bg-black bg-opacity-40 flex items-center justify-center">
                    <h3 className="font-bold text-white text-center">{utility.title}</h3>
                  </div>
                </div>
                <div className="p-4">
                  <p className="text-xs text-gray-600 text-center">{utility.desc}</p>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* Doanh nghiệp tiêu biểu */}
        <section className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">{t('home.sections.featuredCompanies')}</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { name: t('home.companies.catTuong'), image: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&q=80' },
              { name: t('home.companies.spHome'), image: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&q=80' },
              { name: t('home.companies.kimOanh'), image: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&q=80' },
              { name: t('home.companies.seaholdings'), image: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&q=80' },
              { name: t('home.companies.gamuda'), image: 'https://images.unsplash.com/photo-1568605114967-8130f3a36994?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&q=80' },
              { name: t('home.companies.ttRealty'), image: 'https://images.unsplash.com/photo-1570129477492-45c003edd2be?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&q=80' },
            ].map((company, index) => (
              <Link
                key={index}
                to={`/doanh-nghiep/${company.name.toLowerCase().replace(/\s+/g, '-')}`}
                className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex items-center space-x-3">
                  <div 
                    className="w-12 h-12 rounded-lg bg-cover bg-center bg-no-repeat flex-shrink-0"
                    style={{ backgroundImage: `url(${company.image})` }}
                  >
                    <div className="w-full h-full bg-black bg-opacity-20 rounded-lg" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900 text-sm line-clamp-2">{company.name}</h4>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* Báo chí nói về Batdongsan.com.vn */}
        <section className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">{t('home.sections.mediaCoverage')}</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                title: t('home.media.article1.title'),
                source: t('home.media.article1.source'),
                image: 'https://images.unsplash.com/photo-1568605114967-8130f3a36994?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80'
              },
              {
                title: t('home.media.article2.title'),
                source: t('home.media.article2.source'),
                image: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80'
              },
              {
                title: t('home.media.article3.title'),
                source: t('home.media.article3.source'),
                image: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80'
              },
              {
                title: t('home.media.article4.title'),
                source: t('home.media.article4.source'),
                image: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80'
              },
              {
                title: t('home.media.article5.title'),
                source: t('home.media.article5.source'),
                image: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80'
              },
              {
                title: t('home.media.article6.title'),
                source: t('home.media.article6.source'),
                image: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80'
              },
            ].map((article, index) => (
              <Link
                key={index}
                to={`/bao-chi/${article.title.toLowerCase().replace(/\s+/g, '-')}`}
                className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow overflow-hidden"
              >
                <div className="h-40 relative">
                  <div 
                    className="w-full h-full bg-cover bg-center bg-no-repeat"
                    style={{ backgroundImage: `url(${article.image})` }}
                  >
                    <div className="absolute inset-0 bg-black bg-opacity-40" />
                  </div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center text-white">
                      <div className="bg-black bg-opacity-50 px-3 py-1 rounded font-medium text-sm">{article.source}</div>
                    </div>
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="font-medium text-gray-900 text-sm line-clamp-3 leading-tight">
                    {article.title}
                  </h3>
                </div>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};

export default HomePage;