import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, User, Eye, MessageSquare, Search, Grid, List } from 'lucide-react';
import { api } from '../api';
import type { News } from '../types';
import { useTranslation } from 'react-i18next';

const NewsPage: React.FC = () => {
  const { t } = useTranslation();
  const [news, setNews] = useState<News[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [sortBy, setSortBy] = useState('latest');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;

  const categories = [
    { value: '', label: t('news.allNews') },
    { value: 'market-news', label: 'Tin thị trường' },
    { value: 'legal-news', label: 'Pháp lý' },
    { value: 'investment-guide', label: 'Hướng dẫn đầu tư' },
    { value: 'market-analysis', label: 'Phân tích thị trường' },
    { value: 'trends', label: t('news.trends') },
    { value: 'advice', label: t('news.consulting') },
  ];

  const sortOptions = [
    { value: 'latest', label: t('news.newest') },
    { value: 'oldest', label: 'Cũ nhất' },
    { value: 'most-viewed', label: t('news.mostViewed') },
    { value: 'most-commented', label: 'Bình luận nhiều nhất' },
  ];

  useEffect(() => {
    fetchNews();
  }, []);

  const fetchNews = async () => {
    try {
      setLoading(true);
      const response = await api.get('/news', {
        params: {
          page: 0,
          size: 100,
          category: selectedCategory || undefined,
          search: searchTerm || undefined,
          sortBy: sortBy === 'latest' ? 'createdAt' : sortBy === 'oldest' ? 'createdAt' : sortBy,
          sortDirection: sortBy === 'oldest' ? 'ASC' : 'DESC',
        }
      });
      setNews(response.data.content || []);
    } catch (error) {
      console.error('Error fetching news:', error);
      // Use mock data for demo
      setNews([
        {
          id: '1',
          title: 'Thị trường bất động sản TP.HCM quý 4/2024: Sôi động trở lại',
          summary: 'Thị trường bất động sản TP.HCM ghi nhận nhiều tín hiệu tích cực trong quý 4/2024 với việc tăng nguồn cung và thanh khoản.',
          content: 'Nội dung chi tiết về thị trường bất động sản...',
          category: 'MARKET_NEWS',
          imageUrl: 'https://via.placeholder.com/600x300?text=Thị+trường+BDS+TPHCM',
          authorId: 'author-1',
          createdAt: '2024-12-15T10:00:00Z',
          slug: 'thi-truong-bds-tphcm-q4-2024',
          publishedAt: '2024-12-15T10:00:00Z',
          viewCount: 1250,
          commentCount: 45,
          status: 'PUBLISHED',
          isFeatured: true,
        },
        {
          id: '2',
          title: 'Luật Đất đai mới có hiệu lực: Những thay đổi quan trọng',
          summary: 'Luật Đất đai 2024 chính thức có hiệu lực từ 1/8/2024 với nhiều quy định mới tạo thuận lợi cho người dân.',
          content: 'Chi tiết về các thay đổi trong Luật Đất đai mới...',
          category: 'REGULATION',
          imageUrl: 'https://via.placeholder.com/600x300?text=Luật+Đất+đai+mới',
          authorId: 'author-2',
          createdAt: '2024-12-14T09:30:00Z',
          slug: 'luat-dat-dai-moi-2024',
          publishedAt: '2024-12-14T09:30:00Z',
          viewCount: 890,
          commentCount: 23,
          status: 'PUBLISHED',
          isFeatured: false,
        },
        {
          id: '3',
          title: 'Xu hướng đầu tư bất động sản 2025: Cơ hội và thách thức',
          summary: 'Năm 2025 sẽ là năm đầy thử thách nhưng cũng mở ra nhiều cơ hội đầu tư BDS cho các nhà đầu tư thông minh.',
          content: 'Phân tích xu hướng đầu tư BDS 2025...',
          category: 'TIPS',
          imageUrl: 'https://via.placeholder.com/600x300?text=Xu+hướng+đầu+tư+2025',
          authorId: 'author-3',
          createdAt: '2024-12-13T14:15:00Z',
          slug: 'xu-huong-dau-tu-bds-2025',
          publishedAt: '2024-12-13T14:15:00Z',
          viewCount: 567,
          commentCount: 12,
          status: 'PUBLISHED',
          isFeatured: false,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNews();
  }, [selectedCategory, sortBy]);

  const handleSearch = () => {
    setCurrentPage(1);
    fetchNews();
  };

  const filteredNews = news.filter(item =>
    item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.summary.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredNews.length / itemsPerPage);
  const currentNews = filteredNews.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getReadingTime = (content: string) => {
    const wordsPerMinute = 200;
    const wordCount = content.split(' ').length;
    const minutes = Math.ceil(wordCount / wordsPerMinute);
    return `${minutes} phút đọc`;
  };

  const NewsCard: React.FC<{ article: News; isGrid: boolean }> = ({ article, isGrid }) => (
    <div className={`bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow ${
      isGrid ? '' : 'flex'
    }`}>
      <div className={`${isGrid ? 'h-48' : 'w-64 h-48 flex-shrink-0'}`}>
        <img
          src={article.imageUrl || 'https://via.placeholder.com/400x200?text=Tin+tức'}
          alt={article.title}
          className="w-full h-full object-cover"
        />
      </div>
      <div className={`p-6 ${isGrid ? '' : 'flex-1'}`}>
        <div className="flex items-center text-sm text-gray-500 mb-3">
          <span className="bg-orange-100 text-orange-800 px-2 py-1 rounded-full text-xs font-medium mr-3">
            {categories.find(cat => cat.value === article.category)?.label || t('news.news')}
          </span>
          <Calendar className="w-4 h-4 mr-1" />
          <span className="mr-4">{formatDate(article.createdAt)}</span>
          <Eye className="w-4 h-4 mr-1" />
          <span className="mr-4">{article.viewCount || 0}</span>
          <MessageSquare className="w-4 h-4 mr-1" />
          <span>{article.commentCount || 0}</span>
        </div>
        
        <h3 className={`font-bold text-gray-900 mb-3 line-clamp-2 hover:text-orange-600 transition-colors ${
          isGrid ? 'text-lg' : 'text-xl'
        }`}>
          <Link to={`/news/${article.id}`}>
            {article.title}
          </Link>
        </h3>
        
        <p className={`text-gray-600 mb-4 line-clamp-3 ${isGrid ? 'text-sm' : ''}`}>
          {article.summary}
        </p>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <User className="w-4 h-4 mr-2 text-gray-400" />
            <span className="text-sm text-gray-600">
              {typeof article.author === 'string'
                ? article.author
                : article.author?.fullName || 'BDSPortal'}
            </span>
          </div>
          <span className="text-xs text-gray-500">
            {getReadingTime(article.content)}
          </span>
        </div>
      </div>
    </div>
  );

  const FeaturedNews: React.FC<{ article: News }> = ({ article }) => (
    <div className="relative bg-white rounded-lg shadow-lg overflow-hidden">
      <div className="h-80">
        <img
          src={article.imageUrl || 'https://via.placeholder.com/800x400?text=Tin+nổi+bật'}
          alt={article.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
      </div>
      <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
        <span className="bg-orange-600 px-3 py-1 rounded-full text-sm font-medium mb-3 inline-block">
          Tin nổi bật
        </span>
        <h2 className="text-2xl font-bold mb-2 line-clamp-2">
          <Link to={`/news/${article.id}`} className="hover:text-orange-300 transition-colors">
            {article.title}
          </Link>
        </h2>
        <p className="text-gray-200 line-clamp-2 mb-3">{article.summary}</p>
        <div className="flex items-center text-sm">
          <Calendar className="w-4 h-4 mr-1" />
          <span className="mr-4">{formatDate(article.createdAt)}</span>
          <Eye className="w-4 h-4 mr-1" />
          <span>{article.viewCount || 0}</span>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Tin Tức <span className="text-orange-600">Bất Động Sản</span>
            </h1>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Cập nhật những thông tin mới nhất về thị trường bất động sản, 
              các chính sách pháp lý và xu hướng đầu tư
            </p>
          </div>
        </div>
      </div>

      {/* Featured News */}
      {!loading && news.length > 0 && (
        <div className="container mx-auto px-4 py-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Tin Nổi Bật</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
            {news.slice(0, 2).map((article) => (
              <FeaturedNews key={article.id} article={article} />
            ))}
          </div>
        </div>
      )}

      {/* Search and Filters */}
      <div className="container mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div className="md:col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Tìm kiếm tin tức..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyPress={(e) => e.key === t('common.enter') && handleSearch()}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Category Filter */}
            <div>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent appearance-none bg-white"
              >
                {categories.map((category) => (
                  <option key={category.value} value={category.value}>
                    {category.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Sort */}
            <div>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent appearance-none bg-white"
              >
                {sortOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* View Mode Toggle */}
          <div className="flex items-center justify-between mt-6">
            <div className="text-sm text-gray-600">
              Hiển thị {filteredNews.length} tin tức
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded ${
                  viewMode === 'grid'
                    ? 'bg-orange-600 text-white'
                    : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                }`}
              >
                <Grid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded ${
                  viewMode === 'list'
                    ? 'bg-orange-600 text-white'
                    : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                }`}
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* News Grid/List */}
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
          </div>
        ) : currentNews.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-gray-400 mb-4">
              <Search className="w-16 h-16 mx-auto" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Không tìm thấy tin tức nào
            </h3>
            <p className="text-gray-600">
              Hãy thử tìm kiếm với từ khóa khác hoặc thay đổi bộ lọc
            </p>
          </div>
        ) : (
          <div className={
            viewMode === 'grid'
              ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8'
              : 'space-y-6'
          }>
            {currentNews.map((article) => (
              <NewsCard
                key={article.id}
                article={article}
                isGrid={viewMode === 'grid'}
              />
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center mt-12">
            <div className="flex space-x-2">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                Trước
              </button>
              
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const pageNum = Math.max(1, Math.min(totalPages - 4, currentPage - 2)) + i;
                return (
                  <button
                    key={pageNum}
                    onClick={() => setCurrentPage(pageNum)}
                    className={`px-4 py-2 border rounded-lg ${
                      currentPage === pageNum
                        ? 'bg-orange-600 text-white border-orange-600'
                        : 'border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
              
              <button
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                Sau
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default NewsPage;