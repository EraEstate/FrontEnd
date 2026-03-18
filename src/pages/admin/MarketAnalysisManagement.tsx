import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Search, ExternalLink, Trash2, TrendingUp } from 'lucide-react';
import { marketAnalysisAPI } from '../../api/marketAnalysis';

const MarketAnalysisManagement: React.FC = () => {
  const { t } = useTranslation();
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchList();
  }, [currentPage]);

  const fetchList = async () => {
    try {
      setLoading(true);
      const response = await marketAnalysisAPI.getAll({ page: currentPage, size: 12 });
      setItems(response.content || response || []);
      setTotalPages(response.totalPages || 1);
    } catch (error) {
      console.error('Failed to fetch market analyses:', error);
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Xóa bài phân tích này?')) return;
    try {
      await marketAnalysisAPI.delete(id);
      fetchList();
    } catch (e) {
      console.error(e);
    }
  };

  const filtered = items.filter((a) => {
    if (!searchTerm.trim()) return true;
    const q = searchTerm.toLowerCase();
    return (
      (a.title && String(a.title).toLowerCase().includes(q)) ||
      (a.slug && String(a.slug).toLowerCase().includes(q))
    );
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <TrendingUp className="w-7 h-7 text-blue-600" />
            {t('admin.menu.marketAnalysis')}
          </h1>
          <p className="text-sm text-gray-500 mt-1">Xem và quản lý bài phân tích (đồng bộ với trang công khai)</p>
        </div>
        <Link
          to="/market-analysis"
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700"
        >
          <ExternalLink className="w-4 h-4" />
          Xem trên site
        </Link>
      </div>

      <div className="bg-white rounded-xl shadow-md p-4">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="search"
            placeholder="Tìm theo tiêu đề hoặc slug…"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-gray-500">{t('common.loading')}</div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center text-gray-500">Chưa có bài phân tích hoặc không khớp bộ lọc.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600">Tiêu đề</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600">Danh mục</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600">Trang công khai</th>
                  <th className="w-24 px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y">
                {filtered.map((row) => (
                  <tr key={row.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-gray-900">{row.title}</td>
                    <td className="px-4 py-3 text-gray-600">{row.category || '—'}</td>
                    <td className="px-4 py-3">
                      {row.slug ? (
                        <Link
                          to={`/market-analysis/${row.slug}`}
                          className="text-blue-600 hover:underline inline-flex items-center gap-1"
                        >
                          Mở <ExternalLink className="w-3 h-3" />
                        </Link>
                      ) : (
                        '—'
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <button
                        type="button"
                        onClick={() => handleDelete(String(row.id))}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                        title="Xóa"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {totalPages > 1 && (
        <div className="flex justify-center gap-2">
          <button
            type="button"
            onClick={() => setCurrentPage((p) => Math.max(0, p - 1))}
            disabled={currentPage === 0}
            className="px-4 py-2 border rounded-lg disabled:opacity-50"
          >
            Trước
          </button>
          <span className="px-4 py-2 text-sm">
            {currentPage + 1} / {totalPages}
          </span>
          <button
            type="button"
            onClick={() => setCurrentPage((p) => Math.min(totalPages - 1, p + 1))}
            disabled={currentPage >= totalPages - 1}
            className="px-4 py-2 border rounded-lg disabled:opacity-50"
          >
            Sau
          </button>
        </div>
      )}
    </div>
  );
};

export default MarketAnalysisManagement;
