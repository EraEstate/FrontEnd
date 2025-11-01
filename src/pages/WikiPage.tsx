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
  Wind
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
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>(category || '');

  const categories: WikiCategory[] = [
    {
      id: 'mua-bds',
      name: 'Mua BĐS',
      slug: 'mua-bds',
      description: 'Hướng dẫn mua bất động sản, kinh nghiệm, thủ tục pháp lý',
      icon: ShoppingCart,
      color: 'text-blue-600'
    },
    {
      id: 'ban-bds',
      name: 'Bán BĐS',
      slug: 'ban-bds',
      description: 'Mẹo bán nhà, định giá, marketing bất động sản',
      icon: Home,
      color: 'text-green-600'
    },
    {
      id: 'thue-bds',
      name: 'Thuê BĐS',
      slug: 'thue-bds',
      description: 'Hướng dẫn thuê nhà, cho thuê, hợp đồng thuê',
      icon: FileText,
      color: 'text-purple-600'
    },
    {
      id: 'tai-chinh',
      name: 'Tài chính BĐS',
      slug: 'tai-chinh',
      description: 'Vay mua nhà, lãi suất, đầu tư bất động sản',
      icon: DollarSign,
      color: 'text-red-600'
    },
    {
      id: 'quy-hoach-phap-ly',
      name: 'Quy hoạch - Pháp lý',
      slug: 'quy-hoach-phap-ly',
      description: 'Quy hoạch đô thị, thủ tục pháp lý, luật đất đai',
      icon: FileText,
      color: 'text-orange-600'
    },
    {
      id: 'noi-ngoai-that',
      name: 'Nội - Ngoại thất',
      slug: 'noi-ngoai-that',
      description: 'Thiết kế nhà, nội thất, ngoại thất, phong cách',
      icon: Palette,
      color: 'text-pink-600'
    },
    {
      id: 'phong-thuy',
      name: t('wiki.fengShui'),
      slug: 'phong-thuy',
      description: 'Phong thủy nhà ở, hướng đất, tuổi hợp mệnh',
      icon: Wind,
      color: 'text-indigo-600'
    }
  ];

  useEffect(() => {
    const loadArticles = async () => {
      try {
        setLoading(true);
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

        // Transform API response to match our interface
        const transformedArticles: WikiArticle[] = response.content.map((article: any) => ({
          id: article.id,
          title: article.title,
          slug: article.slug,
          summary: article.summary,
          featuredImageUrl: article.featuredImageUrl,
          category: article.category,
          status: article.status,
          viewCount: article.viewCount,
          publishedAt: article.publishedAt,
          createdAt: article.createdAt,
          author: article.author
        }));

        setArticles(transformedArticles);
      } catch (error) {
        console.error('Error loading wiki articles:', error);
        // Fallback to empty array if API fails
        setArticles([]);
      } finally {
        setLoading(false);
      }
    };

    loadArticles();
  }, [selectedCategory]);

  const filteredArticles = articles.filter(article => {
    const matchesSearch = article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         article.summary.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !selectedCategory || article.category.toLowerCase().includes(selectedCategory.toLowerCase());
    return matchesSearch && matchesCategory;
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
              <h1 className="text-3xl font-bold text-gray-900">Wiki BĐS</h1>
              <p className="text-gray-600 mt-1">
                Cẩm nang kiến thức bất động sản toàn diện
              </p>
            </div>
          </div>

          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              placeholder="Tìm kiếm bài viết..."
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
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Chuyên mục</h2>
              <div className="space-y-2">
                <button
                  onClick={() => setSelectedCategory('')}
                  className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                    selectedCategory === '' ? 'bg-red-50 text-red-600' : 'hover:bg-gray-50'
                  }`}
                >
                  Tất cả bài viết
                </button>
                {categories.map((cat) => {
                  const IconComponent = cat.icon;
                  return (
                    <button
                      key={cat.id}
                      onClick={() => setSelectedCategory(cat.slug)}
                      className={`w-full text-left px-3 py-2 rounded-lg transition-colors flex items-center space-x-2 ${
                        selectedCategory === cat.slug ? 'bg-red-50 text-red-600' : 'hover:bg-gray-50'
                      }`}
                    >
                      <IconComponent className={`h-4 w-4 ${cat.color}`} />
                      <span className="text-sm">{cat.name}</span>
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
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="bg-white rounded-lg shadow-sm p-6 animate-pulse">
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
                    <div className="h-3 bg-gray-200 rounded w-full mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                  </div>
                ))}
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
                            <span>{article.publishedAt ? new Date(article.publishedAt).toLocaleDateString('vi-VN') : 'N/A'}</span>
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
                          <span>Đọc tiếp</span>
                          <ChevronRight className="h-4 w-4" />
                        </Link>
                      </div>
                    </div>
                  </article>
                ))}

                {filteredArticles.length === 0 && (
                  <div className="bg-white rounded-lg shadow-sm p-12 text-center">
                    <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Không tìm thấy bài viết</h3>
                    <p className="text-gray-600">
                      Thử tìm kiếm với từ khóa khác hoặc chọn chuyên mục khác.
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