import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { marketAnalysisAPI } from '../api/marketAnalysis';
import type { MarketAnalysis } from '../api/types';
import { useTranslation } from 'react-i18next';
import toast from '../utils/toast';

const MarketAnalysisListPage: React.FC = () => {
  const { t } = useTranslation();
  const [analyses, setAnalyses] = useState<MarketAnalysis[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadAnalyses();
  }, [selectedCategory]);

  const loadAnalyses = async () => {
    try {
      setLoading(true);
      let data;
      if (selectedCategory === 'ALL') {
        data = await marketAnalysisAPI.getAll();
      } else {
        data = await marketAnalysisAPI.getByCategory(selectedCategory);
      }
      setAnalyses(data);
    } catch (err) {
      setError(t('marketAnalysis.loadError'));
      toast.error('Kh�ng th? t?i danh s�ch ph�n t�ch');
    } finally {
      setLoading(false);
    }
  };

  const filteredAnalyses = analyses.filter(analysis =>
    analysis.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (analysis.summary && analysis.summary.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (analysis.tags && (
      Array.isArray(analysis.tags)
        ? analysis.tags.some((tag: string) => tag.toLowerCase().includes(searchTerm.toLowerCase()))
        : (analysis.tags as string).toLowerCase().includes(searchTerm.toLowerCase())
    ))
  );

  const categories = [
    { value: 'ALL', label: t('myProperties.all') },
    { value: 'MARKET_ANALYSIS', label: t('marketAnalysis.marketAnalysis') },
    { value: 'TREND_ANALYSIS', label: t('marketAnalysis.trend') },
    { value: 'PRICE_ANALYSIS', label: t('marketAnalysis.priceAnalysis') },
    { value: 'INVESTMENT_GUIDE', label: t('marketAnalysis.investmentGuide') },
    { value: 'EXPERT_VIEW', label: t('marketAnalysis.expertView') }
  ];

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Đang tải dữ liệu...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <div className="text-red-600">{error}</div>
            <button
              onClick={loadAnalyses}
              className="mt-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              Thử lại
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Phân Tích Thị Trường</h1>
          <p className="text-gray-600">
            Cập nhật những phân tích, đánh giá và xu hướng thị trường bất động sản mới nhất
          </p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <input
                type="text"
                placeholder="Tìm kiếm bài viết..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Category Filter */}
            <div className="md:w-64">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {categories.map(category => (
                  <option key={category.value} value={category.value}>
                    {category.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Analysis Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAnalyses.map((analysis) => (
            <article key={analysis.id} className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow">
              {/* Featured Image */}
              {analysis.featuredImageUrl && (
                <div className="aspect-video overflow-hidden">
                  <img
                    src={analysis.featuredImageUrl}
                    alt={analysis.title}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                  />
                </div>
              )}

              {/* Content */}
              <div className="p-6">
                {/* Category Badge */}
                <div className="mb-3">
                  <span className="inline-block px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                    {categories.find(cat => cat.value === analysis.category)?.label || analysis.category}
                  </span>
                </div>

                {/* Title */}
                <h2 className="text-xl font-semibold text-gray-900 mb-2 overflow-hidden"
                    style={{
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical' as const,
                      lineHeight: '1.5em',
                      maxHeight: '3em'
                    }}>
                  <Link
                    to={`/market-analysis/${analysis.slug}`}
                    className="hover:text-blue-600 transition-colors"
                  >
                    {analysis.title}
                  </Link>
                </h2>

                {/* Summary */}
                <p className="text-gray-600 text-sm mb-4 overflow-hidden"
                   style={{
                     display: '-webkit-box',
                     WebkitLineClamp: 3,
                     WebkitBoxOrient: 'vertical' as const,
                     lineHeight: '1.4em',
                     maxHeight: '4.2em'
                   }}>
                  {analysis.summary}
                </p>

                {/* Meta Info */}
                <div className="flex items-center justify-between text-sm text-gray-500">
                  <div className="flex items-center space-x-4">
                    <span>{analysis.author}</span>
                    <span>{formatDate(analysis.publishedAt)}</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className="flex items-center">
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                      {analysis.viewCount}
                    </span>
                    <span className="flex items-center">
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                      </svg>
                      {analysis.likeCount}
                    </span>
                  </div>
                </div>

                {/* Tags */}
                {analysis.tags && (
                  <div className="mt-4 flex flex-wrap gap-2">
                    {Array.isArray(analysis.tags)
                      ? analysis.tags.slice(0, 3).map((tag: string, index: number) => (
                          <span
                            key={index}
                            className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded"
                          >
                            {tag.trim()}
                          </span>
                        ))
                      : (analysis.tags as string).split(',').slice(0, 3).map((tag: string, index: number) => (
                          <span
                            key={index}
                            className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded"
                          >
                            {tag.trim()}
                          </span>
                        ))
                    }
                    {Array.isArray(analysis.tags)
                      ? analysis.tags.length > 3 && (
                          <span className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded">
                            +{analysis.tags.length - 3}
                          </span>
                        )
                      : (analysis.tags as string).split(',').length > 3 && (
                          <span className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded">
                            +{(analysis.tags as string).split(',').length - 3}
                          </span>
                        )
                    }
                  </div>
                )}
              </div>
            </article>
          ))}
        </div>

        {/* Empty State */}
        {filteredAnalyses.length === 0 && (
          <div className="text-center py-12">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">Không tìm thấy bài viết</h3>
            <p className="mt-1 text-sm text-gray-500">
              Không có bài phân tích nào phù hợp với tiêu chí tìm kiếm.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MarketAnalysisListPage;