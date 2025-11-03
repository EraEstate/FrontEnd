import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { marketAnalysisAPI } from '../api/marketAnalysis';
import type { MarketAnalysis } from '../api/types';
import { useTranslation } from 'react-i18next';

const MarketAnalysisDetailPage: React.FC = () => {
  const { t } = useTranslation();
  const { slug } = useParams<{ slug: string }>();
  const [analysis, setAnalysis] = useState<MarketAnalysis | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [relatedAnalyses, setRelatedAnalyses] = useState<MarketAnalysis[]>([]);

  useEffect(() => {
    if (slug) {
      loadAnalysis();
    }
  }, [slug]);

  const loadAnalysis = async () => {
    if (!slug) return;

    try {
      setLoading(true);
      const data = await marketAnalysisAPI.getBySlug(slug);
      setAnalysis(data);

      // Increment view count
      await marketAnalysisAPI.incrementViewCount(data.id.toString());

      // Load related analyses
      const related = await marketAnalysisAPI.getByCategory(data.category);
      setRelatedAnalyses(related.filter((item: MarketAnalysis) => item.id !== data.id).slice(0, 3));

    } catch (err) {
      setError(t('marketAnalysis.loadArticleError'));
      console.error('Error loading market analysis:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async () => {
    if (!analysis) return;
    try {
      await marketAnalysisAPI.incrementLikeCount(analysis.id.toString());
      setAnalysis(prev => prev ? { ...prev, likeCount: prev.likeCount + 1 } : null);
    } catch (err) {
      console.error('Error incrementing like count:', err);
    }
  };

  const handleShare = async () => {
    if (!analysis) return;
    try {
      await marketAnalysisAPI.incrementShareCount(analysis.id.toString());
      setAnalysis(prev => prev ? { ...prev, shareCount: prev.shareCount + 1 } : null);

      // Copy URL to clipboard
      if (navigator.share) {
        navigator.share({
          title: analysis.title,
          text: analysis.summary,
          url: window.location.href,
        });
      } else {
        navigator.clipboard.writeText(window.location.href);
        alert(t('common.linkCopied'));
      }
    } catch (err) {
      console.error('Error incrementing share count:', err);
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getCategoryLabel = (category: string) => {
    const categories: { [key: string]: string } = {
      'MARKET_ANALYSIS': t('marketAnalysis.marketAnalysis'),
      'TREND_ANALYSIS': t('marketAnalysis.trend'),
      'PRICE_ANALYSIS': t('marketAnalysis.priceAnalysis'),
      'INVESTMENT_GUIDE': t('marketAnalysis.investmentGuide'),
      'EXPERT_VIEW': t('marketAnalysis.expertView')
    };
    return categories[category] || category;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Đang tải bài viết...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !analysis) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <div className="text-red-600">{error || t('marketAnalysis.articleNotFound')}</div>
            <Link
              to="/market-analysis"
              className="mt-4 inline-block bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              Quay lại danh sách
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <nav className="mb-6">
          <ol className="flex items-center space-x-2 text-sm text-gray-500">
            <li><Link to="/" className="hover:text-blue-600">Trang chủ</Link></li>
            <li>/</li>
            <li><Link to="/market-analysis" className="hover:text-blue-600">Phân tích thị trường</Link></li>
            <li>/</li>
            <li className="text-gray-900">{analysis.title}</li>
          </ol>
        </nav>

        {/* Header */}
        <header className="mb-8">
          {/* Category Badge */}
          <div className="mb-4">
            <span className="inline-block px-3 py-1 text-sm font-medium bg-blue-100 text-blue-800 rounded-full">
              {getCategoryLabel(analysis.category)}
            </span>
          </div>

          {/* Title */}
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 leading-tight">
            {analysis.title}
          </h1>

          {/* Summary */}
          <p className="text-xl text-gray-600 mb-6 leading-relaxed">
            {analysis.summary}
          </p>

          {/* Meta Info */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-gray-200 pb-6">
            <div className="flex items-center space-x-4 mb-4 sm:mb-0">
              <div className="flex items-center space-x-2">
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                <span className="text-gray-600">{analysis.author}</span>
              </div>
              <div className="flex items-center space-x-2">
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span className="text-gray-600">{formatDate(analysis.publishedAt)}</span>
              </div>
            </div>

            {/* Social Stats */}
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-1">
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                <span className="text-sm text-gray-600">{analysis.viewCount}</span>
              </div>
              <button
                onClick={handleLike}
                className="flex items-center space-x-1 hover:text-red-600 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
                <span className="text-sm">{analysis.likeCount}</span>
              </button>
              <button
                onClick={handleShare}
                className="flex items-center space-x-1 hover:text-blue-600 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
                </svg>
                <span className="text-sm">{analysis.shareCount}</span>
              </button>
            </div>
          </div>
        </header>

        {/* Featured Image */}
        {analysis.featuredImageUrl && (
          <div className="mb-8">
            <img
              src={analysis.featuredImageUrl}
              alt={analysis.title}
              className="w-full h-64 md:h-96 object-cover rounded-lg shadow-sm"
            />
          </div>
        )}

        {/* Content */}
        <div
          className="prose prose-lg max-w-none mb-12"
          dangerouslySetInnerHTML={{ __html: analysis.content || '' }}
        />

        {/* Tags */}
        {analysis.tags && (
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Tags</h3>
            <div className="flex flex-wrap gap-2">
              {Array.isArray(analysis.tags)
                ? analysis.tags.slice(0, 3).map((tag: string, index: number) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm hover:bg-gray-200 transition-colors"
                    >
                      {tag.trim()}
                    </span>
                  ))
                : (analysis.tags as string).split(',').slice(0, 3).map((tag: string, index: number) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm hover:bg-gray-200 transition-colors"
                    >
                      {tag.trim()}
                    </span>
                  ))
              }
            </div>
          </div>
        )}

        {/* Related Articles */}
        {relatedAnalyses.length > 0 && (
          <div className="border-t border-gray-200 pt-8">
            <h3 className="text-xl font-semibold text-gray-900 mb-6">Bài viết liên quan</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {relatedAnalyses.map((related) => (
                <article key={related.id} className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow">
                  {related.featuredImageUrl && (
                    <div className="aspect-video overflow-hidden">
                      <img
                        src={related.featuredImageUrl}
                        alt={related.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  <div className="p-4">
                    <h4 className="font-semibold text-gray-900 mb-2 line-clamp-2">
                      <Link
                        to={`/market-analysis/${related.slug}`}
                        className="hover:text-blue-600 transition-colors"
                      >
                        {related.title}
                      </Link>
                    </h4>
                    <p className="text-sm text-gray-600 line-clamp-2 mb-2">
                      {related.summary}
                    </p>
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>{related.author}</span>
                      <span>{formatDate(related.publishedAt)}</span>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        )}

        {/* Back to List */}
        <div className="mt-12 text-center">
          <Link
            to="/market-analysis"
            className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Quay lại danh sách phân tích
          </Link>
        </div>
      </article>
    </div>
  );
};

export default MarketAnalysisDetailPage;