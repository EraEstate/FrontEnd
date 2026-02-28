import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  BookOpen,
  Search,
  Calendar,
  User,
  Eye,
  ChevronRight,
  Home,
  ShoppingCart,
  DollarSign,
  FileText,
  Palette,
  Wind,
  Loader2
} from 'lucide-react';
import { wikiAPI } from '../api/services';
import type { WikiArticle } from '../api/types';
import { useTranslation } from 'react-i18next';

interface WikiCategory {
  id: string;
  name: string;
  slug: string;
  description: string;
  icon: React.ComponentType<any>;
  color: string;
}

const WikiPage: React.FC = () => {
  const { t } = useTranslation();
  const { category } = useParams<{ category?: string }>();
  const [articles, setArticles] = useState<WikiArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>(category || '');

  const categories: WikiCategory[] = [
    {
      id: 'mua-bds',
      name: t('wiki.categoriesList.buyRE'),
      slug: 'mua-bds',
      description: t('wiki.categoriesList.buyREDesc'),
      icon: ShoppingCart,
      color: 'text-blue-600'
    },
    {
      id: 'ban-bds',
      name: t('wiki.categoriesList.sellRE'),
      slug: 'ban-bds',
      description: t('wiki.categoriesList.sellREDesc'),
      icon: Home,
      color: 'text-green-600'
    },
    {
      id: 'thue-bds',
      name: t('wiki.categoriesList.rentRE'),
      slug: 'thue-bds',
      description: t('wiki.categoriesList.rentREDesc'),
      icon: FileText,
      color: 'text-purple-600'
    },
    {
      id: 'tai-chinh',
      name: t('wiki.categoriesList.finance'),
      slug: 'tai-chinh',
      description: t('wiki.categoriesList.financeDesc'),
      icon: DollarSign,
      color: 'text-red-600'
    },
    {
      id: 'quy-hoach-phap-ly',
      name: t('wiki.categoriesList.planning'),
      slug: 'quy-hoach-phap-ly',
      description: t('wiki.categoriesList.planningDesc'),
      icon: FileText,
      color: 'text-orange-600'
    },
    {
      id: 'noi-ngoai-that',
      name: t('wiki.categoriesList.interior'),
      slug: 'noi-ngoai-that',
      description: t('wiki.categoriesList.interiorDesc'),
      icon: Palette,
      color: 'text-pink-600'
    },
    {
      id: 'phong-thuy',
      name: t('wiki.fengShui'),
      slug: 'phong-thuy',
      description: t('wiki.categoriesList.fengShuiDesc'),
      icon: Wind,
      color: 'text-indigo-600'
    }
  ];

  useEffect(() => {
    const loadArticles = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Minimum loading time để có cảm giác loading (800ms)
        const minLoadingTime = 800;
        const startTime = Date.now();
        
        let response;

        if (selectedCategory) {
          // Map frontend category slugs to backend enum values
          const categoryMap: { [key: string]: string } = {
            'mua-bds': 'MUA_BDS',
            'ban-bds': 'BAN_BDS',
            'thue-bds': 'THUE_BDS',
            'tai-chinh': 'TAI_CHINH_BDS',
            'quy-hoach-phap-ly': 'QUY_HOACH_PHAP_LY',
            'noi-ngoai-that': 'NOI_NGOAI_THAT',
            'phong-thuy': 'PHONG_THUY'
          };

          const backendCategory = categoryMap[selectedCategory];
          if (backendCategory) {
            response = await wikiAPI.getByCategory(backendCategory as any, 0, 50);
          } else {
            response = await wikiAPI.getAll({ page: 0, size: 50 });
          }
        } else {
          response = await wikiAPI.getAll({ page: 0, size: 50 });
        }

        // Handle different response structures
        // Backend returns Page<WikiArticle> which has a 'content' property
        // But also handle case where response might be array directly
        let articlesData: any[] = [];
        
        console.log('Wiki API Response:', response); // Debug log
        
        if (Array.isArray(response)) {
          articlesData = response;
        } else if (response && response.content && Array.isArray(response.content)) {
          articlesData = response.content;
        } else if (response && Array.isArray(response)) {
          articlesData = response;
        } else {
          console.warn('Unexpected response structure:', response);
          articlesData = [];
        }

        console.log('Extracted articles data:', articlesData); // Debug log

        // Transform API response to match our interface
        const transformedArticles: WikiArticle[] = articlesData.map((article: any) => ({
          id: String(article.id),
          title: article.title,
          slug: article.slug,
          summary: article.summary || '',
          content: article.content || '',
          featuredImageUrl: article.featuredImageUrl,
          category: article.category,
          status: article.status,
          viewCount: article.viewCount || 0,
          isFeatured: article.isFeatured ?? false,
          publishedAt: article.publishedAt,
          createdAt: article.createdAt,
          updatedAt: article.updatedAt,
          authorId: article.authorId || '',
          author: article.author
        }));

        console.log('Transformed articles:', transformedArticles); // Debug log
        
        // Đảm bảo loading indicator hiển thị ít nhất minLoadingTime
        const elapsedTime = Date.now() - startTime;
        const remainingTime = Math.max(0, minLoadingTime - elapsedTime);
        
        await new Promise(resolve => setTimeout(resolve, remainingTime));
        
        setArticles(transformedArticles);
      } catch (error: any) {
        console.error('Error loading wiki articles:', error);
        setError(error.response?.data?.message || error.message || t('wiki.errorLoading'));
        // Fallback to empty array if API fails
        setArticles([]);
      } finally {
        setLoading(false);
      }
    };

    loadArticles();
  }, [selectedCategory]);

  // Filter articles - only by search term, category filtering is done via API
  const filteredArticles = articles.filter(article => {
    if (!searchTerm) return true;
    const matchesSearch = article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (article.summary && article.summary.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesSearch;
  });

  const currentCategory = categories.find(cat => cat.slug === selectedCategory);

  return (
    <div className="min-h-screen bg-gray-50 mt-10">
      <div className="w-full max-w-7xl mx-auto px-6 lg:px-12 py-8">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className="flex items-center space-x-3 mb-4">
            <BookOpen className="h-8 w-8 text-red-600" />
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{t('wiki.pageTitle')}</h1>
              <p className="text-gray-600 mt-1">
                {t('wiki.pageSubtitle')}
              </p>
            </div>
          </div>

          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              placeholder={t('wiki.searchPlaceholder')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar - Categories */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm p-6 sticky top-4">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">{t('wiki.categories')}</h2>
              <div className="space-y-2">
                <button
                  onClick={() => setSelectedCategory('')}
                  disabled={loading}
                  className={`w-full text-left px-3 py-2 rounded-lg transition-colors flex items-center justify-between ${
                    selectedCategory === '' ? 'bg-red-50 text-red-600' : 'hover:bg-gray-50'
                  } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <span>{t('wiki.allArticles')}</span>
                  {loading && selectedCategory === '' && (
                    <Loader2 className="h-4 w-4 animate-spin text-red-600" />
                  )}
                </button>
                {categories.map((cat) => {
                  const IconComponent = cat.icon;
                  const isActive = selectedCategory === cat.slug;
                  return (
                    <button
                      key={cat.id}
                      onClick={() => setSelectedCategory(cat.slug)}
                      disabled={loading}
                      className={`w-full text-left px-3 py-2 rounded-lg transition-colors flex items-center justify-between ${
                        isActive ? 'bg-red-50 text-red-600' : 'hover:bg-gray-50'
                      } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      <div className="flex items-center space-x-2">
                        <IconComponent className={`h-4 w-4 ${cat.color}`} />
                        <span className="text-sm">{cat.name}</span>
                      </div>
                      {loading && isActive && (
                        <Loader2 className="h-4 w-4 animate-spin text-red-600" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Category Header */}
            {currentCategory && (
              <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                <div className="flex items-center space-x-3 mb-2">
                  <currentCategory.icon className={`h-6 w-6 ${currentCategory.color}`} />
                  <h2 className="text-xl font-semibold text-gray-900">{currentCategory.name}</h2>
                </div>
                <p className="text-gray-600">{currentCategory.description}</p>
              </div>
            )}

            {/* Articles List */}
            {loading ? (
              <div className="space-y-4">
                <div className="bg-white rounded-lg shadow-sm p-12 text-center">
                  <Loader2 className="h-12 w-12 text-red-600 animate-spin mx-auto mb-4" />
                  <p className="text-gray-600">{t('wiki.loading')}</p>
                </div>
                {[...Array(2)].map((_, i) => (
                  <div key={i} className="bg-white rounded-lg shadow-sm p-6 animate-pulse">
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
                    <div className="h-3 bg-gray-200 rounded w-full mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                  </div>
                ))}
              </div>
            ) : error ? (
              <div className="bg-white rounded-lg shadow-sm p-12 text-center">
                <BookOpen className="h-16 w-16 text-red-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{t('wiki.errorLoading')}</h3>
                <p className="text-gray-600 mb-4">{error}</p>
                <button
                  onClick={() => {
                    setError(null);
                    setSelectedCategory(selectedCategory); // Trigger reload
                  }}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  {t('wiki.retry')}
                </button>
              </div>
            ) : filteredArticles.length === 0 && articles.length === 0 ? (
              <div className="bg-white rounded-lg shadow-sm p-12 text-center">
                <BookOpen className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{t('wiki.noArticles')}</h3>
                <p className="text-gray-600 mb-4">
                  {t('wiki.noArticlesDesc')}
                </p>
                <p className="text-sm text-gray-500">
                  ({t('common.checkConsole', 'Kiểm tra console để xem chi tiết lỗi nếu có')})
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                {filteredArticles.map((article) => (
                  <article key={article.id} className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow">
                    <div className="p-6">
                      <div className="flex items-start justify-between mb-3">
                        <h3 className="text-xl font-semibold text-gray-900 hover:text-red-600 transition-colors">
                          <Link to={`/wiki/article/${article.slug}`}>
                            {article.title}
                          </Link>
                        </h3>
                        <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                          {article.category.replace('_', ' ')}
                        </span>
                      </div>

                      <p className="text-gray-600 mb-4 line-clamp-2">
                        {article.summary}
                      </p>

                      <div className="flex items-center justify-between text-sm text-gray-500">
                        <div className="flex items-center space-x-4">
                          <div className="flex items-center space-x-1">
                            <User className="h-4 w-4" />
                            <span>{article.author?.fullName || t('common.unknown')}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Calendar className="h-4 w-4" />
                            <span>{article.publishedAt ? new Date(article.publishedAt).toLocaleDateString('vi-VN') : t('common.notAvailable', 'N/A')}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Eye className="h-4 w-4" />
                            <span>{article.viewCount}</span>
                          </div>
                        </div>

                        <Link
                          to={`/wiki/article/${article.slug}`}
                          className="text-red-600 hover:text-red-700 font-medium flex items-center space-x-1"
                        >
                          <span>{t('wiki.readMore')}</span>
                          <ChevronRight className="h-4 w-4" />
                        </Link>
                      </div>
                    </div>
                  </article>
                ))}

                {filteredArticles.length === 0 && articles.length > 0 && (
                  <div className="bg-white rounded-lg shadow-sm p-12 text-center">
                    <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">{t('wiki.noArticlesFound')}</h3>
                    <p className="text-gray-600">
                      {t('wiki.noArticlesFoundDesc')}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default WikiPage;