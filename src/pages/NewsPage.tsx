import React, { useState } from 'react';
import {
  Clock,
  User,
  Eye,
  MessageCircle,
  Heart,
  Share2,
  TrendingUp,
  ChevronRight,
  Search,
  ArrowRight,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useNews, useFeaturedNews } from '../api/hooks';
import type { News } from '../types';
import { useTranslation } from 'react-i18next';
import { getImageUrl, getImagePlaceholder } from '../utils/imageUtils';

const NewsPage: React.FC = () => {
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [currentPage, setCurrentPage] = useState(0);
  const [searchParams, setSearchParams] = useState<any>({});

  // API Hooks
  const { data: newsData, loading, error, refetch } = useNews({
    page: currentPage,
    size: 12,
    category: selectedCategory !== 'all' ? selectedCategory : undefined,
    ...searchParams
  });

  const { data: featuredNews } = useFeaturedNews(5);
  // const { data: popularNews } = usePopularNews(30, 0, 5);
  // const { data: recentNews } = useRecentNews(7, 0, 10);

  const categories = [
    { id: 'all', name: t('news.allNews'), count: newsData?.totalElements || 0 },
    { id: 'MARKET_NEWS', name: 'Thị trường BDS', count: 0 },
    { id: 'REGULATION', name: 'Chính sách - Pháp luật', count: 0 },
    { id: 'TIPS', name: 'Đầu tư BDS', count: 0 },
    { id: 'TREND', name: 'Thiết kế - Trang trí', count: 0 },
    { id: 'OTHER', name: 'Kinh nghiệm mua bán', count: 0 },
  ];

  // Handle search
  const handleSearch = () => {
    const newParams = {
      keyword: searchQuery || undefined,
    };
    setSearchParams(newParams);
    setCurrentPage(0);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatViewCount = (count: number) => {
    if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}k`;
    }
    return count.toString();
  };

  // Data from API
  const articles = newsData?.content || [];
  // const totalPages = newsData?.totalPages || 0;
  const featuredArticles = featuredNews || [];
  // const popularArticles = popularNews?.content || [];
  // const recentArticles = recentNews?.content || [];

  return (
    <div className="min-h-screen bg-gray-50 mt-10">
      {/* Breadcrumb */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center py-4 text-sm text-gray-600">
            <Link to="/" className="hover:text-orange-600">Trang chủ</Link>
            <ChevronRight className="h-4 w-4 mx-2" />
            <span className="text-gray-900 font-medium">Tin tức bất động sản</span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Tin tức bất động sản</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Cập nhật thông tin thị trường, chính sách và xu hướng bất động sản mới nhất
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar */}
          <div className="lg:w-1/4">
            <div className="space-y-6">
              {/* Search */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="font-semibold text-gray-900 mb-4">Tìm kiếm tin tức</h3>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Nhập từ khóa..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Categories */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="font-semibold text-gray-900 mb-4">Chuyên mục</h3>
                <div className="space-y-2">
                  {categories.map((category) => (
                    <button
                      key={category.id}
                      onClick={() => setSelectedCategory(category.id)}
                      className={`w-full text-left px-3 py-2 rounded-lg transition-colors flex items-center justify-between ${
                        selectedCategory === category.id
                          ? 'bg-orange-100 text-orange-700'
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      <span className="font-medium">{category.name}</span>
                      <span className="text-sm text-gray-500">({category.count})</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Trending Topics */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
                  <TrendingUp className="h-5 w-5 mr-2 text-orange-600" />
                  Chủ đề nổi bật
                </h3>
                <div className="space-y-3">
                  {[
                    'Thị trường Q4/2024',
                    'Dự án mới TP.HCM',
                    'Chính sách lãi suất',
                    'BDS Hà Nội',
                    'Đầu tư căn hộ'
                  ].map((topic, index) => (
                    <button
                      key={index}
                      className="block w-full text-left text-sm text-gray-600 hover:text-orange-600 transition-colors py-1"
                    >
                      #{topic}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:w-3/4">
            {/* Featured Articles */}
            <div className="mb-10">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Tin nổi bật</h2>
                <div className="flex items-center text-orange-600 hover:text-orange-700 cursor-pointer">
                  <span className="text-sm font-medium">Xem tất cả</span>
                  <ArrowRight className="h-4 w-4 ml-1" />
                </div>
              </div>

              {loading ? (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="bg-white rounded-lg shadow-md overflow-hidden animate-pulse">
                      <div className="h-48 bg-gray-300"></div>
                      <div className="p-6 space-y-3">
                        <div className="h-4 bg-gray-300 rounded w-3/4"></div>
                        <div className="h-4 bg-gray-300 rounded w-1/2"></div>
                        <div className="h-4 bg-gray-300 rounded w-2/3"></div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                  {/* Main featured article */}
                  <div className="lg:col-span-1">
                    <Link to={`/news/${featuredArticles[0]?.id}`} className="block group">
                      <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                        <div className="relative">
                          <img
                            src={
                              getImageUrl(featuredArticles[0]?.imageUrl) ||
                              getImagePlaceholder(900, 360)
                            }
                            alt={featuredArticles[0]?.title}
                            className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-300"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.src = getImagePlaceholder(900, 360);
                            }}
                          />
                          <div className="absolute top-4 left-4 bg-orange-600 text-white px-3 py-1 rounded-full text-sm font-medium">
                            Nổi bật
                          </div>
                        </div>
                        <div className="p-6">
                          <h3 className="font-bold text-xl text-gray-900 mb-3 group-hover:text-orange-600 transition-colors line-clamp-2">
                            {featuredArticles[0]?.title}
                          </h3>
                          <p className="text-gray-600 mb-4 line-clamp-3">
                            {featuredArticles[0]?.summary}
                          </p>
                          <div className="flex items-center justify-between text-sm text-gray-500">
                            <div className="flex items-center">
                              <User className="h-4 w-4 mr-1" />
                              <span>{featuredArticles[0]?.author?.fullName || t('news.admin')}</span>
                            </div>
                            <div className="flex items-center space-x-4">
                              <div className="flex items-center">
                                <Eye className="h-4 w-4 mr-1" />
                                <span>{formatViewCount(featuredArticles[0]?.viewCount || 0)}</span>
                              </div>
                              <div className="flex items-center">
                                <MessageCircle className="h-4 w-4 mr-1" />
                                <span>{featuredArticles[0]?.commentCount}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </Link>
                  </div>

                  {/* Secondary featured articles */}
                  <div className="space-y-4">
                    {featuredArticles.slice(1, 3).map((article: News) => (
                      <Link key={article.id} to={`/news/${article.id}`} className="block group">
                        <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                          <div className="flex">
                            <img
                              src={getImageUrl(article.imageUrl) || getImagePlaceholder(300, 200)}
                              alt={article.title}
                              className="w-32 h-24 object-cover group-hover:scale-105 transition-transform duration-300"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.src = getImagePlaceholder(300, 200);
                              }}
                            />
                            <div className="flex-1 p-4">
                              <h4 className="font-semibold text-gray-900 mb-2 group-hover:text-orange-600 transition-colors line-clamp-2">
                                {article.title}
                              </h4>
                              <div className="flex items-center justify-between text-xs text-gray-500">
                                <span>{formatDate(article.createdAt)}</span>
                                <div className="flex items-center space-x-2">
                                  <div className="flex items-center">
                                    <Eye className="h-3 w-3 mr-1" />
                                    <span>{formatViewCount(article.viewCount || 0)}</span>
                                  </div>
                                  <div className="flex items-center">
                                    <MessageCircle className="h-3 w-3 mr-1" />
                                    <span>{article.commentCount}</span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Regular Articles */}
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Tin tức mới nhất</h2>
                <div className="flex items-center text-sm text-gray-600">
                  <span>Tìm thấy {articles.length} bài viết</span>
                </div>
              </div>

              {loading ? (
                <div className="space-y-6">
                  {[...Array(6)].map((_, i) => (
                    <div key={i} className="bg-white rounded-lg shadow-md p-6 animate-pulse">
                      <div className="flex">
                        <div className="w-48 h-32 bg-gray-300 rounded-lg mr-6"></div>
                        <div className="flex-1 space-y-3">
                          <div className="h-4 bg-gray-300 rounded w-3/4"></div>
                          <div className="h-4 bg-gray-300 rounded w-1/2"></div>
                          <div className="h-4 bg-gray-300 rounded w-2/3"></div>
                          <div className="h-4 bg-gray-300 rounded w-1/3"></div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : error ? (
                <div className="text-center py-12">
                  <p className="text-red-600 mb-4">Lỗi tải dữ liệu: {error}</p>
                  <button 
                    onClick={refetch}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                  >
                    Thử lại
                  </button>
                </div>
              ) : articles.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-gray-500">Không tìm thấy bài viết nào</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {articles.map((article: News) => (
                    <Link key={article.id} to={`/news/${article.id}`} className="block group">
                      <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow overflow-hidden">
                        <div className="flex p-6">
                          <img
                            src={getImageUrl(article.imageUrl) || getImagePlaceholder(400, 260)}
                            alt={article.title}
                            className="w-48 h-32 object-cover rounded-lg mr-6 group-hover:scale-105 transition-transform duration-300"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.src = getImagePlaceholder(400, 260);
                            }}
                          />
                          <div className="flex-1">
                            <div className="flex items-center mb-2">
                              <span className="bg-orange-100 text-orange-700 px-2 py-1 rounded text-xs font-medium">
                                {categories.find(cat => cat.id === article.category)?.name}
                              </span>
                            </div>
                            <h3 className="font-bold text-xl text-gray-900 mb-3 group-hover:text-orange-600 transition-colors line-clamp-2">
                              {article.title}
                            </h3>
                            <p className="text-gray-600 mb-4 line-clamp-2">
                              {article.summary}
                            </p>
                            <div className="flex items-center justify-between text-sm text-gray-500">
                              <div className="flex items-center space-x-4">
                                <div className="flex items-center">
                                  <User className="h-4 w-4 mr-1" />
                                  <span>{article.author?.fullName || t('news.admin')}</span>
                                </div>
                                <div className="flex items-center">
                                  <Clock className="h-4 w-4 mr-1" />
                                  <span>{formatDate(article.createdAt)}</span>
                                </div>
                              </div>
                              <div className="flex items-center space-x-4">
                                <button className="flex items-center hover:text-red-500 transition-colors">
                                  <Heart className="h-4 w-4 mr-1" />
                                  <span>Lưu</span>
                                </button>
                                <button className="flex items-center hover:text-blue-500 transition-colors">
                                  <Share2 className="h-4 w-4 mr-1" />
                                  <span>Chia sẻ</span>
                                </button>
                                <div className="flex items-center">
                                  <Eye className="h-4 w-4 mr-1" />
                                  <span>{formatViewCount(article.viewCount || 0)}</span>
                                </div>
                                <div className="flex items-center">
                                  <MessageCircle className="h-4 w-4 mr-1" />
                                  <span>{article.commentCount || 0}</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}

              {/* Pagination */}
              <div className="flex justify-center mt-12">
                <div className="flex items-center space-x-2">
                  {[1, 2, 3, 4, 5].map((page) => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                        currentPage === page
                          ? 'bg-orange-600 text-white'
                          : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewsPage;