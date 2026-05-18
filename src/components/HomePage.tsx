import React, { useState, useEffect } from "react";
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
  CheckCircle2,
  Brain,
  ShieldCheck,
  HeadphonesIcon,
  BarChart3,
  Scale,
  PhoneCall,
  KeyRound,
  ChevronUp,
  Users,
  Home,
  Building2,
  Check,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import {
  useFeaturedProperties,
  useFeaturedNews,
  useTopAgents,
  useProvinces,
  useRecentNews,
} from "../api/hooks";
import { useTranslation } from "react-i18next";
import { useAuthStore } from "../store/authStore";
import MapPicker from "./MapPicker";
import { motion } from "framer-motion";
import { propertyViewAPI } from "../api/propertyView";
import { propertyAPI } from "../api/property";
import { getImageUrl, getImagePlaceholder } from "../utils/imageUtils";
import LazyImage from "./LazyImage";

const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const [searchLocation, setSearchLocation] = useState("");
  const [activeTab, setActiveTab] = useState("sale");
  const [currentSlide, setCurrentSlide] = useState(0);
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  const { t } = useTranslation();
  const { isAuthenticated } = useAuthStore();

  // API Hooks
  const { data: provinces } = useProvinces();

  // Dropdown states
  const [isLocationOpen, setIsLocationOpen] = useState(false);
  const [isPropertyTypeOpen, setIsPropertyTypeOpen] = useState(false);
  const [isPriceOpen, setIsPriceOpen] = useState(false);
  const [isAreaOpen, setIsAreaOpen] = useState(false);

  // Selected values
  const [selectedLocation, setSelectedLocation] = useState("");
  const [selectedPropertyType, setSelectedPropertyType] = useState("");
  const [selectedPrice, setSelectedPrice] = useState("");
  const [selectedArea, setSelectedArea] = useState("");

  // Map picker state
  const [isMapPickerOpen, setIsMapPickerOpen] = useState(false);

  // API Hooks
  const { data: featuredProperties } = useFeaturedProperties(0, 8);
  const { data: featuredNews } = useFeaturedNews(5);
  const { data: topAgents } = useTopAgents(0, 6);
  const { data: recentNews } = useRecentNews(30, 0, 6);

  const [mostViewed, setMostViewed] = useState<any[]>([]);
  const [mostViewedLoading, setMostViewedLoading] = useState(true);
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [recommendationsLoading, setRecommendationsLoading] = useState(false);
  const featuredPropertyItems = Array.isArray(featuredProperties)
    ? featuredProperties
    : (featuredProperties as any)?.content || [];
  const featuredRecommendationFallback = featuredPropertyItems.slice(0, 4);
  const recommendationItems =
    recommendations.length > 0
      ? recommendations
      : featuredRecommendationFallback;
  const showRecommendationSection =
    (isAuthenticated && recommendationsLoading) ||
    recommendationItems.length > 0;

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const page = await propertyViewAPI.getMostViewedProperties(
          undefined,
          0,
          8,
        );
        const rows: unknown[] = (page as any)?.content ?? [];
        const enriched = await Promise.all(
          rows.slice(0, 8).map(async (row: unknown) => {
            const r = row as unknown[];
            const pid = Array.isArray(r) ? r[0] : (row as any)?.propertyId;
            const viewCount = Array.isArray(r) ? r[1] : (row as any)?.viewCount;
            if (!pid) return null;
            try {
              const prop = await propertyAPI.getById(String(pid));
              return { ...prop, weekViews: viewCount };
            } catch {
              return null;
            }
          }),
        );
        if (alive) setMostViewed(enriched.filter(Boolean) as any[]);
      } catch {
        if (alive) setMostViewed([]);
      } finally {
        if (alive) setMostViewedLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  // Fetch recommendations
  useEffect(() => {
    let alive = true;
    if (isAuthenticated) {
      setRecommendationsLoading(true);
      propertyAPI
        .getRecommendationsForYou(4)
        .then((res) => {
          if (alive) setRecommendations(res);
        })
        .catch((err) => console.error("Failed to load recommendations", err))
        .finally(() => {
          if (alive) setRecommendationsLoading(false);
        });
    }
    return () => {
      alive = false;
    };
  }, [isAuthenticated]);

  // Chuẩn hoá dữ liệu news để tránh lệch kiểu trả về (list hoặc Page)
  const realEstateNewsArticles: any[] =
    (recentNews as any)?.content ??
    (Array.isArray(recentNews) ? (recentNews as any[]) : []);

  const bannerSlides = [
    {
      id: 1,
      title: t("home.banner.slide1.title"),
      subtitle: t("home.banner.slide1.subtitle"),
      image:
        "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80",
      alt: t("home.banner.slide1.alt"),
    },
    {
      id: 2,
      title: t("home.banner.slide2.title"),
      subtitle: t("home.banner.slide2.subtitle"),
      image:
        "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80",
      alt: t("home.banner.slide2.alt"),
    },
    {
      id: 3,
      title: t("home.banner.slide3.title"),
      subtitle: t("home.banner.slide3.subtitle"),
      image:
        "https://images.unsplash.com/photo-1560518883-ce09059eeffa?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80",
      alt: t("home.banner.slide3.alt"),
    },
    {
      id: 4,
      title: t("home.banner.slide4.title"),
      subtitle: t("home.banner.slide4.subtitle"),
      image:
        "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80",
      alt: t("home.banner.slide4.alt"),
    },
    {
      id: 5,
      title: t("home.banner.slide5.title"),
      subtitle: t("home.banner.slide5.subtitle"),
      image:
        "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80",
      alt: t("home.banner.slide5.alt"),
    },
    {
      id: 6,
      title: t("home.banner.slide6.title"),
      subtitle: t("home.banner.slide6.subtitle"),
      image:
        "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80",
      alt: t("home.banner.slide6.alt"),
    },
    {
      id: 7,
      title: t("home.banner.slide7.title"),
      subtitle: t("home.banner.slide7.subtitle"),
      image:
        "https://images.unsplash.com/photo-1497366216548-37526070297c?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80",
      alt: t("home.banner.slide7.alt"),
    },
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
      const province = provinces.find(
        (p: any) =>
          p.name.includes(selectedLocation) ||
          selectedLocation.includes(p.name) ||
          p.name.replace(/Thành phố|Tỉnh|TP\.?/g, "").trim() ===
            selectedLocation.replace(/Thành phố|Tỉnh|TP\.?/g, "").trim(),
      );
      if (province) {
        searchParams.set("provinceId", province.id.toString());
      }
    }

    // Map propertyType from Vietnamese text to enum
    const propertyTypeMap: { [key: string]: string } = {
      "Căn hộ/Chung cư": "APARTMENT",
      "Nhà riêng": "HOUSE",
      "Biệt thự": "VILLA",
      "Nhà mặt phố": "HOUSE",
      "Đất nền": "LAND",
      Shophouse: "OFFICE",
    };
    if (selectedPropertyType && propertyTypeMap[selectedPropertyType]) {
      searchParams.set("propertyType", propertyTypeMap[selectedPropertyType]);
    }

    // Map price range to minPrice/maxPrice
    const priceRangeMap: { [key: string]: { min: number; max?: number } } = {
      "Dưới 1 tỷ": { min: 0, max: 1000000000 },
      "1-3 tỷ": { min: 1000000000, max: 3000000000 },
      "3-5 tỷ": { min: 3000000000, max: 5000000000 },
      "5-10 tỷ": { min: 5000000000, max: 10000000000 },
      "10-20 tỷ": { min: 10000000000, max: 20000000000 },
      "Trên 20 tỷ": { min: 20000000000 },
    };
    if (selectedPrice && priceRangeMap[selectedPrice]) {
      const range = priceRangeMap[selectedPrice];
      searchParams.set("minPrice", range.min.toString());
      if (range.max) {
        searchParams.set("maxPrice", range.max.toString());
      }
    }

    // Map area range to minArea/maxArea
    const areaRangeMap: { [key: string]: { min: number; max?: number } } = {
      "Dưới 30m²": { min: 0, max: 30 },
      "30-50m²": { min: 30, max: 50 },
      "50-80m²": { min: 50, max: 80 },
      "80-100m²": { min: 80, max: 100 },
      "100-150m²": { min: 100, max: 150 },
      "Trên 150m²": { min: 150 },
    };
    if (selectedArea && areaRangeMap[selectedArea]) {
      const range = areaRangeMap[selectedArea];
      searchParams.set("minArea", range.min.toString());
      if (range.max) {
        searchParams.set("maxArea", range.max.toString());
      }
    }

    // Map listingType from activeTab
    if (activeTab === "sale") {
      searchParams.set("listingType", "SALE");
    } else if (activeTab === "rent") {
      searchParams.set("listingType", "RENT");
    }

    // Add keyword search
    if (searchLocation.trim()) {
      searchParams.set("query", searchLocation.trim());
    }

    // Navigate to properties page with search params
    navigate(`/properties?${searchParams.toString()}`);
  };

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % bannerSlides.length);
  };

  const prevSlide = () => {
    setCurrentSlide(
      (prev) => (prev - 1 + bannerSlides.length) % bannerSlides.length,
    );
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
                index === currentSlide
                  ? "opacity-100 scale-100"
                  : "opacity-0 scale-105"
              }`}
            >
              {/* Real estate background image */}
              <div
                className="w-full h-full bg-cover bg-center bg-no-repeat"
                style={{
                  backgroundImage: `url(${slide.image})`,
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
                index === currentSlide
                  ? "bg-white scale-125"
                  : "bg-white bg-opacity-50 hover:bg-opacity-75"
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
                {t("home.hero.title")}
              </h1>
              <p className="text-lg md:text-xl opacity-90 max-w-2xl mx-auto">
                {t("home.hero.subtitle")}
              </p>
            </div>

            {/* Tab Navigation */}
            <div className="flex justify-center space-x-1 mb-6">
              <button
                onClick={() => setActiveTab("sale")}
                className={`px-6 py-3 rounded-t-lg font-bold transition-all duration-200 shadow-lg ${
                  activeTab === "sale"
                    ? "bg-white text-red-600 shadow-xl"
                    : "bg-black bg-opacity-30 text-white hover:bg-opacity-40 hover:shadow-lg"
                }`}
              >
                {t("home.tabs.sale")}
              </button>
              <button
                onClick={() => setActiveTab("rent")}
                className={`px-6 py-3 rounded-t-lg font-bold transition-all duration-200 shadow-lg ${
                  activeTab === "rent"
                    ? "bg-white text-red-600 shadow-xl"
                    : "bg-black bg-opacity-30 text-white hover:bg-opacity-40 hover:shadow-lg"
                }`}
              >
                {t("home.tabs.rent")}
              </button>
              <button
                onClick={() => setActiveTab("project")}
                className={`px-6 py-3 rounded-t-lg font-bold transition-all duration-200 shadow-lg ${
                  activeTab === "project"
                    ? "bg-white text-red-600 shadow-xl"
                    : "bg-black bg-opacity-30 text-white hover:bg-opacity-40 hover:shadow-lg"
                }`}
              >
                {t("home.tabs.project")}
              </button>
            </div>

            {/* Simple 2-Button Search */}
            <div className="max-w-3xl mx-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Map Button - Large and Beautiful */}
                <button
                  type="button"
                  onClick={() => setIsMapPickerOpen(true)}
                  className="group relative bg-white rounded-2xl p-8 card-hover border border-gray-100 hover:border-blue-200"
                  style={{ boxShadow: "var(--shadow-lg)" }}
                >
                  <div className="flex flex-col items-center space-y-4">
                    <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-full p-6 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                      <Map className="h-10 w-10 text-white" />
                    </div>
                    <div className="text-center">
                      <h3 className="text-2xl font-bold text-gray-900 mb-2">
                        {t("home.search.viewMap")}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {t("home.search.viewMapDesc")}
                      </p>
                    </div>
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl" />
                </button>

                {/* Search Button - Large and Beautiful */}
                <button
                  type="button"
                  onClick={handleSearch}
                  className="group relative bg-white rounded-2xl p-8 card-hover border border-gray-100 hover:border-red-200"
                  style={{ boxShadow: "var(--shadow-lg)" }}
                >
                  <div className="flex flex-col items-center space-y-4">
                    <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-full p-6 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                      <Search className="h-10 w-10 text-white" />
                    </div>
                    <div className="text-center">
                      <h3 className="text-2xl font-bold text-gray-900 mb-2">
                        {t("home.search.searchTitle")}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {t("home.search.searchDesc")}
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
        }}
      />

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 lg:px-12 py-8">
        {/* AI Recommendations (Gợi ý cho bạn) */}
        {showRecommendationSection && (
          <section className="mb-12">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <Star className="w-8 h-8 text-yellow-500" />
                <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">
                  Gợi ý cho bạn
                </h2>
              </div>
              <span className="text-sm text-gray-500 italic">
                {isAuthenticated
                  ? "Dựa trên hoạt động của bạn"
                  : "Gợi ý chung. Đăng nhập để cá nhân hóa"}
              </span>
            </div>

            {isAuthenticated && recommendationsLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[...Array(4)].map((_, i) => (
                  <div
                    key={i}
                    className="h-56 bg-gray-200 rounded-lg animate-pulse"
                  />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {recommendationItems.map((property: any) => (
                  <Link
                    key={property.id}
                    to={`/properties/${property.id}`}
                    className="bg-white rounded-xl overflow-hidden card-hover border border-yellow-100/60 relative"
                  >
                    <div className="absolute top-2 left-2 z-10 bg-yellow-500 text-white text-xs font-bold px-2 py-1 rounded shadow-sm flex items-center gap-1">
                      <Star className="w-3 h-3 fill-current" />{" "}
                      {isAuthenticated ? "Phù hợp" : "Đề xuất"}
                    </div>
                    <div className="h-48 relative">
                      <LazyImage
                        src={
                          getImageUrl(
                            property.mainImageUrl || property.imageUrl,
                          ) || getImagePlaceholder(400, 300)
                        }
                        alt={property.title}
                        className="w-full h-full object-cover"
                        containerClassName="absolute inset-0"
                      />
                      <div className="absolute inset-0 bg-black bg-opacity-20 hover:bg-opacity-30 transition-all duration-200" />
                    </div>
                    <div className="p-4">
                      <h3 className="font-semibold text-gray-900 mb-2 text-sm line-clamp-2">
                        {property.title}
                      </h3>
                      <div className="flex items-center justify-between text-sm mb-2">
                        <span className="text-red-600 font-bold">
                          {property.price >= 1000000000
                            ? `${(property.price / 1000000000).toFixed(1)} tỷ`
                            : property.price >= 1000000
                              ? `${(property.price / 1000000).toFixed(0)} triệu`
                              : property.price?.toLocaleString("vi-VN")}{" "}
                          VND
                        </span>
                        <span className="text-gray-600">{property.area}m²</span>
                      </div>
                      <p className="text-xs text-gray-500 truncate">
                        {property.address}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </section>
        )}

        {/* Bất động sản nổi bật Section */}
        <section className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">
              {t("home.sections.featuredProperties")}
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Featured Properties từ API */}
            {featuredPropertyItems.slice(0, 4).map((property: any) => (
              <Link
                key={property.id}
                to={`/properties/${property.id}`}
                className="bg-white rounded-xl overflow-hidden card-hover border border-gray-100"
              >
                <div className="h-48 relative">
                  <LazyImage
                    src={
                      getImageUrl(property.mainImageUrl || property.imageUrl) ||
                      getImagePlaceholder(400, 300)
                    }
                    alt={property.title}
                    className="w-full h-full object-cover"
                    containerClassName="absolute inset-0"
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-20 hover:bg-opacity-30 transition-all duration-200" />
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-gray-900 mb-2 text-sm line-clamp-2">
                    {property.title}
                  </h3>
                  <div className="flex items-center justify-between text-sm mb-2">
                    <span className="text-red-600 font-bold">
                      {property.price >= 1000000000
                        ? `${(property.price / 1000000000).toFixed(1)} tỷ`
                        : property.price >= 1000000
                          ? `${(property.price / 1000000).toFixed(0)} triệu`
                          : property.price?.toLocaleString("vi-VN")}{" "}
                      VND
                    </span>
                    <span className="text-gray-600">{property.area}m²</span>
                  </div>
                  <p className="text-xs text-gray-500 truncate">
                    {property.address}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* Xem nhiều trong 7 ngày — dữ liệu từ API lượt xem */}
        {(mostViewedLoading || mostViewed.length > 0) && (
          <section className="mb-12">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-8 h-8 text-red-600" />
                <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">
                  Bất động sản xem nhiều
                </h2>
              </div>
              <Link
                to="/properties"
                className="text-red-600 hover:text-red-700 font-bold flex items-center transition-all duration-200 hover:scale-105"
              >
                {t("home.viewMore")} <ChevronRight className="h-4 w-4 ml-1" />
              </Link>
            </div>
            {mostViewedLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[...Array(4)].map((_, i) => (
                  <div
                    key={i}
                    className="h-56 bg-gray-200 rounded-lg animate-pulse"
                  />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {mostViewed.map((property: any) => (
                  <motion.div
                    key={property.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    whileHover={{ y: -5 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Link
                      to={`/properties/${property.id}`}
                      className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 block h-full"
                    >
                      <div className="h-48 relative">
                        <LazyImage
                          src={
                            getImageUrl(
                              property.mainImageUrl ||
                                property.propertyImages?.[0]?.imageUrl,
                            ) || getImagePlaceholder(400, 300)
                          }
                          alt={property.title}
                          className="w-full h-full object-cover"
                          containerClassName="absolute inset-0"
                        />
                        <div className="absolute inset-0 bg-black bg-opacity-10 hover:bg-opacity-20 transition-all duration-200" />
                        {property.weekViews != null && (
                          <span className="absolute top-2 right-2 z-10 bg-black/65 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1">
                            <Eye className="w-3 h-3" />
                            {Number(property.weekViews).toLocaleString("vi-VN")}
                          </span>
                        )}
                      </div>
                      <div className="p-4">
                        <h3 className="font-semibold text-gray-900 mb-2 text-sm line-clamp-2">
                          {property.title}
                        </h3>
                        <div className="flex items-center justify-between text-sm mb-2">
                          <span className="text-red-600 font-bold">
                            {property.price >= 1000000000
                              ? `${(property.price / 1000000000).toFixed(1)} tỷ`
                              : property.price >= 1000000
                                ? `${(property.price / 1000000).toFixed(0)} triệu`
                                : property.price?.toLocaleString("vi-VN")}{" "}
                            VND
                          </span>
                          <span className="text-gray-600">
                            {property.area}m²
                          </span>
                        </div>
                        <p className="text-xs text-gray-500 truncate">
                          {property.address}
                        </p>
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </div>
            )}
          </section>
        )}

        {/* Tin nổi bật Section */}
        <section className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">
              {t("home.sections.featuredNews")}
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Featured News Cards với style giống batdongsan.com.vn */}
            {[
              {
                title: t("home.featuredNews.hanoi.title"),
                subtitle: t("home.featuredNews.hanoi.subtitle"),
                image:
                  "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
              },
              {
                title: t("home.featuredNews.hcm.title"),
                subtitle: t("home.featuredNews.hcm.subtitle"),
                image:
                  "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
              },
              {
                title: t("home.featuredNews.wiki.title"),
                subtitle: t("home.featuredNews.wiki.subtitle"),
                image:
                  "https://images.unsplash.com/photo-1560518883-ce09059eeffa?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
              },
            ].map((item, index) => (
              <Link
                key={index}
                to="/news"
                className="bg-white rounded-xl border border-gray-100 overflow-hidden card-hover"
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
                  <p className="text-sm text-gray-600 text-center">
                    {item.subtitle}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* Tin tức Section */}
        <section className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">
              {t("home.sections.news")}
            </h2>
            <Link
              to="/news"
              className="text-red-600 hover:text-red-700 font-bold flex items-center transition-all duration-200 hover:scale-105"
            >
              {t("home.viewMore")} <ChevronRight className="h-4 w-4 ml-1" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Featured News từ API */}
            {(featuredNews?.content || []).slice(0, 6).map((article: any) => (
              <Link
                key={article.id}
                to={`/news/${article.id}`}
                className="bg-white rounded-xl card-hover border border-gray-100 overflow-hidden"
              >
                <div
                  className="h-40 bg-cover bg-center bg-no-repeat"
                  style={{
                    backgroundImage: `url(${article.imageUrl || "https://images.unsplash.com/photo-1560518883-ce09059eeffa?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80"})`,
                  }}
                >
                  <div className="h-full bg-black bg-opacity-30 flex items-end p-4">
                    <span className="text-xs text-white bg-red-600 px-2 py-1 rounded font-medium">
                      {article.category}
                    </span>
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-gray-900 mb-3 line-clamp-2 text-sm leading-tight">
                    {article.title}
                  </h3>
                  <div className="flex items-center text-xs text-gray-500">
                    <Clock className="h-3 w-3 mr-1" />
                    {new Date(article.createdAt).toLocaleDateString("vi-VN")}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* Dự án bất động sản nổi bật */}
        <section className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">
              {t("home.sections.featuredProjects")}
            </h2>
            <Link
              to="/projects"
              className="text-red-600 hover:text-red-700 font-bold flex items-center transition-all duration-200 hover:scale-105"
            >
              {t("home.viewMore")} <ChevronRight className="h-4 w-4 ml-1" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Project Cards */}
            {[
              {
                name: t("home.projects.libera.name"),
                area: "1,83 ha",
                location: t("home.projects.libera.location"),
                status: t("home.projects.status.opening"),
                rating: 6,
                image:
                  "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
              },
              {
                name: t("home.projects.lumiere.name"),
                area: "3,23 ha",
                location: t("home.projects.lumiere.location"),
                status: t("home.projects.status.opening"),
                rating: 7,
                image:
                  "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
              },
              {
                name: t("home.projects.jade.name"),
                area: "2,5 ha",
                location: t("home.projects.jade.location"),
                status: t("home.projects.status.comingSoon"),
                rating: 8,
                image:
                  "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
              },
              {
                name: t("home.projects.masteri.name"),
                area: "4,2 ha",
                location: t("home.projects.masteri.location"),
                status: t("home.projects.status.completed"),
                rating: 16,
                image:
                  "https://images.unsplash.com/photo-1560518883-ce09059eeffa?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
              },
              {
                name: t("home.projects.verosa.name"),
                area: "8,1 ha",
                location: t("home.projects.verosa.location"),
                status: t("home.projects.status.completed"),
                rating: 16,
                image:
                  "https://images.unsplash.com/photo-1570129477492-45c003edd2be?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
              },
              {
                name: t("home.projects.vinhomes.name"),
                area: "271 ha",
                location: t("home.projects.vinhomes.location"),
                status: t("home.projects.status.selling"),
                rating: 20,
                image:
                  "https://images.unsplash.com/photo-1555636222-cae831e670b3?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
              },
            ].map((project, index) => (
              <Link
                key={index}
                to="/projects"
                className="bg-white rounded-xl overflow-hidden card-hover border border-gray-100"
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
                  <h3 className="font-semibold text-gray-900 mb-2 line-clamp-1">
                    {project.name}
                  </h3>
                  <div className="flex items-center justify-between text-sm mb-2">
                    <span className="text-gray-600">{project.area}</span>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        project.status === "Đang mở bán"
                          ? "bg-green-100 text-green-700"
                          : project.status === "Đã bàn giao"
                            ? "bg-blue-100 text-blue-700"
                            : "bg-orange-100 text-orange-700"
                      }`}
                    >
                      {project.status}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 truncate">
                    {project.location}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* Bất động sản theo địa điểm */}
        <section className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">
              {t("home.sections.propertiesByLocation")}
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {/* Location Cards */}
            {[
              {
                name: t("home.locations.hcm.name"),
                listings: t("home.locations.hcm.listings"),
                image:
                  "https://images.unsplash.com/photo-1583417319070-4a69db38a482?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
              },
              {
                name: t("home.locations.hanoi.name"),
                listings: t("home.locations.hanoi.listings"),
                image:
                  "https://images.unsplash.com/photo-1557804506-669a67965ba0?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
              },
              {
                name: t("home.locations.danang.name"),
                listings: t("home.locations.danang.listings"),
                image:
                  "https://images.unsplash.com/photo-1559827260-dc66d52bef19?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
              },
              {
                name: t("home.locations.binhduong.name"),
                listings: t("home.locations.binhduong.listings"),
                image:
                  "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
              },
            ].map((location, index) => (
              <Link
                key={index}
                to="/properties"
                className="bg-white rounded-xl overflow-hidden card-hover border border-gray-100"
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
                  <h3 className="font-semibold text-gray-900 mb-1">
                    {location.name}
                  </h3>
                  <p className="text-sm text-gray-600">{location.listings}</p>
                </div>
              </Link>
            ))}
          </div>

          {/* Dự án nổi bật khác */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
            {[
              t("home.featuredProjects.vinhomesCentral"),
              t("home.featuredProjects.vinhomesGrand"),
              t("home.featuredProjects.vinhomesSmart"),
              t("home.featuredProjects.vinhomesOcean"),
              t("home.featuredProjects.vungTau"),
              t("home.featuredProjects.bcons"),
              t("home.featuredProjects.grandeur"),
              t("home.featuredProjects.diamond"),
              t("home.featuredProjects.haDo"),
              t("home.featuredProjects.sunAvenue"),
            ].map((project, index) => (
              <Link
                key={index}
                to="/projects"
                className="bg-white border border-gray-100 rounded-xl p-4 card-hover text-center"
              >
                <h4 className="font-medium text-gray-900 text-sm line-clamp-2">
                  {project}
                </h4>
              </Link>
            ))}
          </div>
        </section>

        {/* Tin tức bất động sản */}
        <section className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">
              {t("home.sections.realEstateNews")}
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Numbered News Articles - ưu tiên data thật từ DB, fallback text tĩnh */}
            {realEstateNewsArticles.length > 0
              ? realEstateNewsArticles
                  .slice(0, 6)
                  .map((article: any, index: number) => (
                    <Link
                      key={article.id ?? index}
                      to={`/news/${article.id}`}
                      className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow p-6 border-l-4 border-red-600"
                    >
                      <div className="flex items-start space-x-4">
                        <div className="flex-shrink-0">
                          <div className="w-10 h-10 bg-red-600 text-white rounded-full flex items-center justify-center font-bold text-sm">
                            {String(index + 1).padStart(2, "0")}
                          </div>
                        </div>
                        <div className="flex-1">
                          <h3 className="font-bold text-gray-900 mb-2 line-clamp-2 text-sm leading-tight">
                            {article.title}
                          </h3>
                          <p className="text-xs text-gray-600 line-clamp-2 leading-relaxed">
                            {article.summary || article.description || ""}
                          </p>
                        </div>
                      </div>
                    </Link>
                  ))
              : [
                  {
                    number: "01",
                    title: t("home.news.article1.title"),
                    subtitle: t("home.news.article1.subtitle"),
                  },
                  {
                    number: "02",
                    title: t("home.news.article2.title"),
                    subtitle: t("home.news.article2.subtitle"),
                  },
                  {
                    number: "03",
                    title: t("home.news.article3.title"),
                    subtitle: t("home.news.article3.subtitle"),
                  },
                  {
                    number: "04",
                    title: t("home.news.article4.title"),
                    subtitle: t("home.news.article4.subtitle"),
                  },
                  {
                    number: "05",
                    title: t("home.news.article5.title"),
                    subtitle: t("home.news.article5.subtitle"),
                  },
                  {
                    number: "06",
                    title: t("home.news.article6.title"),
                    subtitle: t("home.news.article6.subtitle"),
                  },
                ].map((article, index) => (
                  <Link
                    key={index}
                    to="/news"
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
            <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">
              {t("home.sections.utilitySupport")}
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Utility Cards */}
            {[
              {
                title: t("home.utilities.ageCalculator.title"),
                desc: t("home.utilities.ageCalculator.desc"),
                image:
                  "https://images.unsplash.com/photo-1503387762-592deb58ef4e?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80",
              },
              {
                title: t("home.utilities.constructionCost.title"),
                desc: t("home.utilities.constructionCost.desc"),
                image:
                  "https://images.unsplash.com/photo-1554224155-6726b3ff858f?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80",
              },
              {
                title: t("home.utilities.interestCalculator.title"),
                desc: t("home.utilities.interestCalculator.desc"),
                image:
                  "https://images.unsplash.com/photo-1460925895917-afdab827c52f?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80",
              },
              {
                title: t("home.utilities.fengshui.title"),
                desc: t("home.utilities.fengshui.desc"),
                image:
                  "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80",
              },
            ].map((utility, index) => (
              <Link
                key={index}
                to="/utilities"
                className="bg-white rounded-xl overflow-hidden card-hover border border-gray-100"
              >
                <div
                  className="h-32 bg-cover bg-center bg-no-repeat"
                  style={{ backgroundImage: `url(${utility.image})` }}
                >
                  <div className="h-full bg-black bg-opacity-40 flex items-center justify-center">
                    <h3 className="font-bold text-white text-center">
                      {utility.title}
                    </h3>
                  </div>
                </div>
                <div className="p-4">
                  <p className="text-xs text-gray-600 text-center">
                    {utility.desc}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* Doanh nghiệp tiêu biểu */}
        <section className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">
              {t("home.sections.featuredCompanies")}
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                name: t("home.companies.catTuong"),
                image:
                  "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&q=80",
              },
              {
                name: t("home.companies.spHome"),
                image:
                  "https://images.unsplash.com/photo-1560518883-ce09059eeffa?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&q=80",
              },
              {
                name: t("home.companies.kimOanh"),
                image:
                  "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&q=80",
              },
              {
                name: t("home.companies.seaholdings"),
                image:
                  "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&q=80",
              },
              {
                name: t("home.companies.gamuda"),
                image:
                  "https://images.unsplash.com/photo-1568605114967-8130f3a36994?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&q=80",
              },
              {
                name: t("home.companies.ttRealty"),
                image:
                  "https://images.unsplash.com/photo-1570129477492-45c003edd2be?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&q=80",
              },
            ].map((company, index) => (
              <Link
                key={index}
                to="/companies"
                className="bg-white border border-gray-100 rounded-xl p-4 card-hover"
              >
                <div className="flex items-center space-x-3">
                  <div
                    className="w-12 h-12 rounded-lg bg-cover bg-center bg-no-repeat flex-shrink-0"
                    style={{ backgroundImage: `url(${company.image})` }}
                  >
                    <div className="w-full h-full bg-black bg-opacity-20 rounded-lg" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900 text-sm line-clamp-2">
                      {company.name}
                    </h4>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* Báo chí nói về Batdongsan.com.vn */}
        <section className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">
              {t("home.sections.mediaCoverage")}
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                title: t("home.media.article1.title"),
                source: t("home.media.article1.source"),
                image:
                  "https://images.unsplash.com/photo-1568605114967-8130f3a36994?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
              },
              {
                title: t("home.media.article2.title"),
                source: t("home.media.article2.source"),
                image:
                  "https://images.unsplash.com/photo-1554224155-6726b3ff858f?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
              },
              {
                title: t("home.media.article3.title"),
                source: t("home.media.article3.source"),
                image:
                  "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
              },
              {
                title: t("home.media.article4.title"),
                source: t("home.media.article4.source"),
                image:
                  "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
              },
              {
                title: t("home.media.article5.title"),
                source: t("home.media.article5.source"),
                image:
                  "https://images.unsplash.com/photo-1560518883-ce09059eeffa?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
              },
              {
                title: t("home.media.article6.title"),
                source: t("home.media.article6.source"),
                image:
                  "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
              },
            ].map((article, index) => (
              <Link
                key={index}
                to="/news"
                className="bg-white rounded-xl card-hover border border-gray-100 overflow-hidden"
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
                      <div className="bg-black bg-opacity-50 px-3 py-1 rounded font-medium text-sm">
                        {article.source}
                      </div>
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

        {/* Thống kê nền tảng (Minimalist) */}
        <section className="mb-20 border-y border-gray-100 py-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 divide-x divide-gray-100">
            <div className="text-center px-4">
              <div className="text-4xl font-light text-gray-900 mb-2">2M+</div>
              <div className="text-sm text-gray-500 uppercase tracking-wider">
                {t("home.platformStats.properties")}
              </div>
            </div>
            <div className="text-center px-4">
              <div className="text-4xl font-light text-gray-900 mb-2">5M+</div>
              <div className="text-sm text-gray-500 uppercase tracking-wider">
                {t("home.platformStats.users")}
              </div>
            </div>
            <div className="text-center px-4">
              <div className="text-4xl font-light text-gray-900 mb-2">1M+</div>
              <div className="text-sm text-gray-500 uppercase tracking-wider">
                {t("home.platformStats.transactions")}
              </div>
            </div>
            <div className="text-center px-4">
              <div className="text-4xl font-light text-gray-900 mb-2">63</div>
              <div className="text-sm text-gray-500 uppercase tracking-wider">
                {t("home.platformStats.provinces")}
              </div>
            </div>
          </div>
        </section>

        {/* Tại sao chọn Era Estate (Premium & Clean) */}
        <section className="mb-20">
          <div className="mb-12 flex flex-col md:flex-row md:items-end justify-between border-b border-gray-200 pb-6">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 tracking-tight mb-2">
                {t("home.whyChooseUs.title")}
              </h2>
              <p className="text-gray-500">{t("home.whyChooseUs.subtitle")}</p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-x-12 gap-y-10">
            {[
              { icon: CheckCircle2, key: "verified" },
              { icon: Brain, key: "ai" },
              { icon: ShieldCheck, key: "secure" },
              { icon: HeadphonesIcon, key: "support" },
              { icon: MapPin, key: "map" },
              { icon: BarChart3, key: "analytics" },
            ].map((feature, idx) => {
              const Icon = feature.icon;
              return (
                <div key={idx} className="group">
                  <Icon
                    className="w-8 h-8 text-red-600 mb-4 opacity-90 group-hover:opacity-100 transition-opacity"
                    strokeWidth={1.5}
                  />
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">
                    {t(`home.whyChooseUs.${feature.key}.title`)}
                  </h3>
                  <p className="text-gray-500 text-sm leading-relaxed">
                    {t(`home.whyChooseUs.${feature.key}.desc`)}
                  </p>
                </div>
              );
            })}
          </div>
        </section>

        {/* Hướng dẫn mua bán (Simple Layout) */}
        <section className="mb-20 bg-gray-50 rounded-2xl p-8 md:p-12">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 tracking-tight mb-3">
              {t("home.buyingGuide.title")}
            </h2>
            <p className="text-gray-500">{t("home.buyingGuide.subtitle")}</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {[
              { icon: Search, key: 0 },
              { icon: Scale, key: 1 },
              { icon: PhoneCall, key: 2 },
              { icon: KeyRound, key: 3 },
            ].map((step, idx) => {
              return (
                <div key={idx} className="relative">
                  <div className="text-5xl font-light text-gray-300 mb-4">
                    0{idx + 1}
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {t(`home.buyingGuide.steps.${idx}.title`)}
                  </h3>
                  <p className="text-gray-500 text-sm leading-relaxed">
                    {t(`home.buyingGuide.steps.${idx}.desc`)}
                  </p>
                </div>
              );
            })}
          </div>
        </section>

        {/* Đánh giá khách hàng (Elegant Cards) */}
        <section className="mb-20">
          <div className="mb-12 flex flex-col md:flex-row md:items-end justify-between border-b border-gray-200 pb-6">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 tracking-tight mb-2">
                {t("home.testimonials.title")}
              </h2>
              <p className="text-gray-500">{t("home.testimonials.subtitle")}</p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[0, 1, 2, 3].map((idx) => (
              <div
                key={idx}
                className="bg-white p-8 border border-gray-100 rounded-xl hover:shadow-md transition-shadow"
              >
                <div className="flex text-gray-900 mb-6 space-x-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-current" />
                  ))}
                </div>
                <p className="text-gray-600 text-sm mb-8 leading-relaxed">
                  "{t(`home.testimonials.reviews.${idx}.content`)}"
                </p>
                <div className="flex items-center">
                  <div className="w-10 h-10 rounded-full bg-gray-100 text-gray-600 flex items-center justify-center font-medium text-sm">
                    {t(`home.testimonials.reviews.${idx}.avatar`)}
                  </div>
                  <div className="ml-3">
                    <div className="font-semibold text-gray-900 text-sm">
                      {t(`home.testimonials.reviews.${idx}.name`)}
                    </div>
                    <div className="text-xs text-gray-400 mt-0.5">
                      {t(`home.testimonials.reviews.${idx}.role`)}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* CTA Banner Đăng tin (Clean White Theme) */}
        <section className="mb-20">
          <div className="bg-white rounded-2xl overflow-hidden relative shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100">
            {/* Subtle background pattern to keep it from being entirely flat */}
            <div className="absolute inset-0 opacity-[0.02] bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] bg-repeat"></div>
            
            {/* Subtle red gradient accent at the top right */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-red-50 rounded-full blur-3xl -mr-20 -mt-20"></div>

            <div className="relative p-10 md:p-16 lg:flex items-center justify-between">
              <div className="lg:w-2/3 mb-10 lg:mb-0">
                <h2 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-gray-900">
                  {t("home.ctaBanner.title")}
                </h2>
                <p className="text-gray-500 text-lg mb-8 max-w-xl leading-relaxed">
                  {t("home.ctaBanner.subtitle")}
                </p>
                <div className="flex flex-wrap gap-4">
                  <Link
                    to="/post-property"
                    className="bg-red-600 text-white px-8 py-3.5 rounded-lg font-semibold hover:bg-red-700 transition-colors inline-flex items-center shadow-md shadow-red-100"
                  >
                    {t("home.ctaBanner.postButton")}
                  </Link>
                  <Link
                    to="/about"
                    className="bg-white text-gray-700 border border-gray-200 px-8 py-3.5 rounded-lg font-semibold hover:bg-gray-50 transition-colors inline-flex items-center shadow-sm"
                  >
                    {t("home.ctaBanner.learnMore")}
                  </Link>
                </div>
              </div>
              <div className="lg:w-1/3 flex flex-col gap-8 lg:pl-12 border-t lg:border-t-0 lg:border-l border-gray-100 pt-8 lg:pt-0">
                <div>
                  <div className="text-red-600 font-bold text-5xl mb-2 tracking-tighter">
                    {t("home.ctaBanner.stats1")}
                  </div>
                  <div className="text-gray-400 text-xs uppercase tracking-widest font-bold">
                    {t("home.ctaBanner.stats1Label")}
                  </div>
                </div>
                <div>
                  <div className="text-gray-900 font-bold text-5xl mb-2 tracking-tighter">
                    {t("home.ctaBanner.stats2")}
                  </div>
                  <div className="text-gray-400 text-xs uppercase tracking-widest font-bold">
                    {t("home.ctaBanner.stats2Label")}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ - Câu hỏi thường gặp (Minimal Accordion) */}
        <section className="mb-16">
          <div className="flex flex-col md:flex-row gap-12">
            <div className="md:w-1/3">
              <h2 className="text-3xl font-bold text-gray-900 tracking-tight mb-4">
                {t("home.faq.title")}
              </h2>
              <p className="text-gray-500">{t("home.faq.subtitle")}</p>
            </div>
            <div className="md:w-2/3 space-y-2">
              {[0, 1, 2, 3, 4].map((idx) => (
                <div
                  key={idx}
                  className="border-b border-gray-100 last:border-0"
                >
                  <button
                    onClick={() => setActiveFaq(activeFaq === idx ? null : idx)}
                    className="w-full py-5 flex items-center justify-between text-left focus:outline-none group"
                  >
                    <span className={`font-semibold transition-colors ${activeFaq === idx ? "text-red-600" : "text-gray-900 group-hover:text-gray-600"}`}>
                      {t(`home.faq.items.${idx}.question`)}
                    </span>
                    <div
                      className={`flex-shrink-0 ml-4 transition-transform duration-300 ${activeFaq === idx ? "rotate-180 text-red-600" : "text-gray-400"}`}
                    >
                      <ChevronDown className="w-5 h-5" />
                    </div>
                  </button>
                  <div
                    className={`overflow-hidden transition-all duration-300 ease-in-out ${
                      activeFaq === idx
                        ? "max-h-96 opacity-100 pb-5"
                        : "max-h-0 opacity-0"
                    }`}
                  >
                    <div className="text-gray-500 text-sm leading-relaxed pr-8">
                      {t(`home.faq.items.${idx}.answer`)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default HomePage;
