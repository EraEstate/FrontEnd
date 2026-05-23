import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  Search, Plus, Edit2, Trash2, Eye, Download,
  Calendar, User, Tag, TrendingUp
} from 'lucide-react';
import { newsAPI } from '../../api/news';
import toast from '../../utils/toast';
import { useAdminTheme } from '../../contexts/AdminThemeContext';

const NewsManagement: React.FC = () => {
  const { t } = useTranslation();
  const { theme } = useAdminTheme();
  const isDark = theme === 'dark';

  const [news, setNews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('ALL');
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  useEffect(() => {
    fetchNews();
  }, [currentPage, filterCategory]);

  const fetchNews = async () => {
    try {
      setLoading(true);
      const response = await newsAPI.getAll({ page: currentPage, size: 12 });
      setNews(response.content || []);
      setTotalPages(response.totalPages || 1);
    } catch (error) {
      toast.error('Không thể tải danh sách tin tức');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa bài viết này không?')) return;
    try {
      await newsAPI.delete(id);
      toast.success('Đã xóa bài viết thành công');
      fetchNews();
    } catch (error) {
      toast.error('Không thể xóa bài viết');
    }
  };

  const getCategoryBadge = (category: string) => {
    const badges: Record<string, string> = {
      MARKET: isDark ? 'bg-blue-500/20 text-blue-300' : 'bg-blue-50 text-blue-700 border-blue-100',
      POLICY: isDark ? 'bg-purple-500/20 text-purple-300' : 'bg-purple-50 text-purple-700 border-purple-100',
      GUIDE: isDark ? 'bg-emerald-500/20 text-emerald-300' : 'bg-emerald-50 text-emerald-700 border-emerald-100',
      TREND: isDark ? 'bg-orange-500/20 text-orange-300' : 'bg-orange-50 text-orange-700 border-orange-100',
      INVESTMENT: isDark ? 'bg-rose-500/20 text-rose-300' : 'bg-rose-50 text-rose-700 border-rose-100'
    };
    return badges[category] || (isDark ? 'bg-slate-700 text-slate-350' : 'bg-gray-50 text-gray-700 border-gray-100');
  };

  const getCategoryLabel = (category: string) => {
    const labels: Record<string, string> = {
      MARKET: 'TIN THỊ TRƯỜNG',
      POLICY: 'CHÍNH SÁCH',
      GUIDE: 'HƯỚNG DẪN',
      TREND: 'XU HƯỚNG',
      INVESTMENT: 'ĐẦU TƯ'
    };
    return labels[category] || category;
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('vi-VN', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  return (
    <div className="space-y-8 pb-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className={`text-3xl font-extrabold tracking-tight ${isDark ? 'text-white' : 'text-gray-950'}`}>
            {t('admin.menu.news') || 'Quản lý Tin tức'}
          </h1>
          <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>
            Quản lý và cập nhật các bài viết tin tức, hướng dẫn và thị trường.
          </p>
        </div>
        <button className="flex items-center justify-center gap-2 px-5 py-3.5 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-750 text-white font-bold rounded-2xl shadow-md hover:shadow-lg transition-all duration-300 btn-press text-sm">
          <Plus className="w-5 h-5 stroke-[2.5px]" />
          Thêm tin tức
        </button>
      </div>

      {/* Toolbar */}
      <div className={`rounded-3xl border p-5 shadow-sm transition-all duration-300 ${
        isDark ? 'bg-slate-800/80 border-slate-700/80' : 'bg-white border-gray-100'
      }`}>
        <div className="flex flex-col md:flex-row md:items-center gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Tìm kiếm bài viết..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`w-full pl-11 pr-4 py-3 rounded-2xl border transition-all duration-300 ${
                  isDark 
                    ? 'bg-slate-900 border-slate-700 text-white placeholder-slate-500 focus:border-red-500 focus:ring-1 focus:ring-red-500' 
                    : 'bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400 focus:border-red-600 focus:ring-1 focus:ring-red-600'
                }`}
              />
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className={`px-4 py-3 rounded-2xl border transition-all duration-300 font-medium ${
                isDark 
                  ? 'bg-slate-900 border-slate-700 text-white focus:border-red-500' 
                  : 'bg-gray-50 border-gray-200 text-gray-900 focus:border-red-600'
              }`}
            >
              <option value="ALL">Tất cả danh mục</option>
              <option value="MARKET">Tin thị trường</option>
              <option value="POLICY">Cập nhật chính sách</option>
              <option value="GUIDE">Hướng dẫn</option>
              <option value="TREND">Xu hướng</option>
              <option value="INVESTMENT">Đầu tư</option>
            </select>

            <button className={`flex items-center gap-2 px-5 py-3 rounded-2xl border font-bold transition-all duration-300 ${
              isDark 
                ? 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700 hover:text-white' 
                : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50 shadow-sm'
            }`}>
              <Download className="w-4 h-4 stroke-[2.5px]" />
              Xuất file
            </button>
          </div>
        </div>
      </div>

      {/* News Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full py-20 text-center">
            <div className="inline-block w-8 h-8 border-4 border-red-600 border-t-transparent rounded-full animate-spin mb-4" />
            <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>{t('common.loading') || 'Đang tải dữ liệu...'}</p>
          </div>
        ) : news.length === 0 ? (
          <div className="col-span-full py-20 text-center">
            <div className={`p-4 rounded-3xl w-fit mx-auto mb-4 ${isDark ? 'bg-slate-800 text-slate-500' : 'bg-gray-100 text-gray-400'}`}>
              <Newspaper className="w-10 h-10" />
            </div>
            <h4 className={`text-base font-bold mb-1 ${isDark ? 'text-slate-200' : 'text-gray-900'}`}>Không có bài viết nào</h4>
            <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>Không tìm thấy tin tức phù hợp với bộ lọc hiện tại.</p>
          </div>
        ) : (
          news.map((article) => (
            <div key={article.id} className={`rounded-3xl border overflow-hidden group shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl ${
              isDark 
                ? 'bg-slate-800/80 border-slate-700/80 shadow-slate-950/20' 
                : 'bg-white border-gray-100 shadow-gray-100/50'
            }`}>
              {/* Featured Image */}
              <div className="relative h-48 bg-gray-200 overflow-hidden">
                <img
                  src={article.imageUrl || '/default-news.jpg'}
                  alt={article.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  loading="lazy"
                />
                <div className="absolute top-3 left-3">
                  <span className={`px-3 py-1.5 rounded-full text-xs font-bold border backdrop-blur-md shadow-sm ${getCategoryBadge(article.category)}`}>
                    {getCategoryLabel(article.category)}
                  </span>
                </div>
              </div>

              {/* Content */}
              <div className="p-5 space-y-4">
                <div className="space-y-2">
                  <h3 className={`font-bold text-lg leading-snug line-clamp-2 transition-colors ${
                    isDark ? 'text-white group-hover:text-red-400' : 'text-gray-950 group-hover:text-red-600'
                  }`}>
                    {article.title}
                  </h3>
                  
                  <p className={`text-sm line-clamp-3 leading-relaxed ${isDark ? 'text-slate-400' : 'text-gray-600'}`}>
                    {article.summary || article.content}
                  </p>
                </div>

                {/* Meta Grid */}
                <div className={`grid grid-cols-2 gap-3 py-3.5 border-y text-xs ${
                  isDark ? 'border-slate-700/60 text-slate-400' : 'border-gray-100 text-gray-500'
                }`}>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-gray-400 flex-shrink-0" />
                    <span className="truncate">{formatDate(article.publishedAt || article.createdAt)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-gray-400 flex-shrink-0" />
                    <span className="truncate">{article.authorName || 'Ban quản trị'}</span>
                  </div>
                  <div className="flex items-center gap-2 col-span-2">
                    <TrendingUp className="w-4 h-4 text-gray-400 flex-shrink-0" />
                    <span>{article.viewCount || 0} lượt xem</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 pt-1">
                  <button className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-bold transition-all duration-300 text-xs ${
                    isDark 
                      ? 'bg-slate-700 text-slate-200 hover:bg-slate-650 hover:text-white' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}>
                    <Eye className="w-4 h-4" />
                    Xem
                  </button>
                  <button className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-bold transition-all duration-300 text-xs ${
                    isDark 
                      ? 'bg-red-500/10 text-red-400 hover:bg-red-500/20' 
                      : 'bg-red-50 text-red-700 hover:bg-red-100 border border-red-200/20'
                  }`}>
                    <Edit2 className="w-4 h-4" />
                    Sửa
                  </button>
                  <button
                    onClick={() => handleDelete(article.id)}
                    className={`p-2.5 rounded-xl transition-all duration-300 ${
                      isDark 
                        ? 'bg-rose-500/10 text-rose-400 hover:bg-rose-500/20' 
                        : 'bg-rose-50 text-rose-700 hover:bg-rose-100'
                    }`}
                    title="Xóa bài viết"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-6">
          <button
            onClick={() => setCurrentPage(p => Math.max(0, p - 1))}
            disabled={currentPage === 0}
            className={`px-4 py-2 text-sm font-bold rounded-xl border transition-all duration-300 disabled:opacity-40 disabled:pointer-events-none ${
              isDark 
                ? 'bg-slate-800 border-slate-700 text-slate-350 hover:bg-slate-700' 
                : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50 shadow-sm'
            }`}
          >
            Trước
          </button>
          
          <span className={`px-4 py-2 text-sm font-bold rounded-xl ${
            isDark ? 'bg-slate-800/60 text-slate-300' : 'bg-gray-100 text-gray-700'
          }`}>
            {currentPage + 1} / {totalPages}
          </span>
          
          <button
            onClick={() => setCurrentPage(p => Math.min(totalPages - 1, p + 1))}
            disabled={currentPage >= totalPages - 1}
            className={`px-4 py-2 text-sm font-bold rounded-xl border transition-all duration-300 disabled:opacity-40 disabled:pointer-events-none ${
              isDark 
                ? 'bg-slate-800 border-slate-700 text-slate-350 hover:bg-slate-700' 
                : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50 shadow-sm'
            }`}
          >
            Sau
          </button>
        </div>
      )}
    </div>
  );
};

export default NewsManagement;
