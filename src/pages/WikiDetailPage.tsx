import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Calendar,
  User,
  Eye,
  ArrowLeft,
  Share2,
  Bookmark,
  ThumbsUp,
  MessageSquare,
  ChevronRight
} from 'lucide-react';
import { wikiAPI } from '../api/services';
import type { WikiArticle } from '../api/types';
import { useTranslation } from 'react-i18next';
import toast from '../utils/toast';

interface RelatedArticle {
  id: string;
  title: string;
  slug: string;
  summary: string;
  category: string;
  publishedAt?: string;
}

const WikiDetailPage: React.FC = () => {
  const { t } = useTranslation();
  const { slug } = useParams<{ slug: string }>();
  const [article, setArticle] = useState<WikiArticle | null>(null);
  const [relatedArticles, setRelatedArticles] = useState<RelatedArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [liked, setLiked] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);

  useEffect(() => {
    const loadArticle = async () => {
      if (!slug) return;

      try {
        setLoading(true);

        // Load article by slug
        const articleResponse = await wikiAPI.getBySlug(slug);
        setArticle(articleResponse);

        // Load related articles (same category, limit 5)
        if (articleResponse.category) {
          const relatedResponse = await wikiAPI.getByCategory(articleResponse.category, 0, 5);
          // Filter out current article and take first 4
          const filteredRelated = relatedResponse.content
            .filter((item: WikiArticle) => item.id !== articleResponse.id)
            .slice(0, 4)
            .map((item: WikiArticle) => ({
              id: item.id,
              title: item.title,
              slug: item.slug,
              summary: item.summary,
              category: item.category,
              publishedAt: item.publishedAt
            }));
          setRelatedArticles(filteredRelated);
        }

        // Increment view count
        await wikiAPI.incrementViews(articleResponse.id);

      } catch (error) {
        toast.error('Kh�ng th? t?i b�i vi?t Wiki');
        // Could show error message here
      } finally {
        setLoading(false);
      }
    };

    loadArticle();
  }, [slug]);

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: article?.title,
        text: article?.summary,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      // Show toast notification
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 mt-10">
        <div className="w-full max-w-4xl mx-auto px-6 lg:px-12 py-8">
          <div className="bg-white rounded-lg shadow-sm p-6 animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-3/4 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2 mb-6"></div>
            <div className="space-y-3">
              <div className="h-4 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded w-5/6"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!article) {
    return (
      <div className="min-h-screen bg-gray-50 mt-10">
        <div className="w-full max-w-4xl mx-auto px-6 lg:px-12 py-8">
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Không tìm thấy bài viết</h2>
            <p className="text-gray-600 mb-6">Bài viết bạn tìm kiếm có thể đã bị xóa hoặc không tồn tại.</p>
            <Link
              to="/wiki"
              className="inline-flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Quay lại Wiki
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 mt-10">
      <div className="w-full max-w-7xl mx-auto px-6 lg:px-12 py-8">
        {/* Breadcrumb */}
        <nav className="flex items-center space-x-2 text-sm text-gray-600 mb-6">
          <Link to="/" className="hover:text-red-600">Trang chủ</Link>
          <ChevronRight className="h-4 w-4" />
          <Link to="/wiki" className="hover:text-red-600">Wiki BĐS</Link>
          <ChevronRight className="h-4 w-4" />
          <span className="text-gray-900">{article.title}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-3">
            <article className="bg-white rounded-lg shadow-sm">
              {/* Article Header */}
              <header className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between mb-4">
                  <span className="px-3 py-1 bg-red-100 text-red-600 rounded-full text-sm font-medium">
                    {article.category.replace('_', ' ')}
                  </span>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => setBookmarked(!bookmarked)}
                      className={`p-2 rounded-lg transition-colors ${
                        bookmarked ? 'text-red-600 bg-red-50' : 'text-gray-400 hover:text-gray-600'
                      }`}
                    >
                      <Bookmark className="h-5 w-5" />
                    </button>
                    <button
                      onClick={handleShare}
                      className="p-2 text-gray-400 hover:text-gray-600 rounded-lg transition-colors"
                    >
                      <Share2 className="h-5 w-5" />
                    </button>
                  </div>
                </div>

                <h1 className="text-3xl font-bold text-gray-900 mb-4">{article.title}</h1>

                <p className="text-lg text-gray-600 mb-6">{article.summary}</p>

                <div className="flex items-center justify-between text-sm text-gray-500">
                  <div className="flex items-center space-x-6">
                    <div className="flex items-center space-x-2">
                      <User className="h-4 w-4" />
                      <span>{article.author?.fullName || t('common.unknown')}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Calendar className="h-4 w-4" />
                      <span>{article.publishedAt ? new Date(article.publishedAt).toLocaleDateString('vi-VN') : 'N/A'}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Eye className="h-4 w-4" />
                      <span>{article.viewCount} lượt xem</span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-4">
                    <button
                      onClick={() => setLiked(!liked)}
                      className={`flex items-center space-x-1 px-3 py-1 rounded-lg transition-colors ${
                        liked ? 'text-red-600 bg-red-50' : 'text-gray-600 hover:text-red-600'
                      }`}
                    >
                      <ThumbsUp className="h-4 w-4" />
                      <span>Thích</span>
                    </button>
                  </div>
                </div>
              </header>

              {/* Article Content */}
              <div
                className="p-6 prose prose-lg max-w-none"
                dangerouslySetInnerHTML={{ __html: article.content }}
              />

              {/* Article Footer */}
              <footer className="p-6 border-t border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-500">
                    Cập nhật lần cuối: {article.updatedAt ? new Date(article.updatedAt).toLocaleDateString('vi-VN') : 'N/A'}
                  </div>
                </div>
              </footer>
            </article>

            {/* Comments Section */}
            <div className="bg-white rounded-lg shadow-sm mt-6 p-6">
              <div className="flex items-center space-x-2 mb-4">
                <MessageSquare className="h-5 w-5 text-gray-600" />
                <h3 className="text-lg font-semibold text-gray-900">Bình luận</h3>
              </div>

              <div className="text-center py-8 text-gray-500">
                <MessageSquare className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>Tính năng bình luận đang được phát triển</p>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            {/* Related Articles */}
            <div className="bg-white rounded-lg shadow-sm p-6 sticky top-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Bài viết liên quan</h3>

              <div className="space-y-4">
                {relatedArticles.map((relatedArticle) => (
                  <div key={relatedArticle.id} className="border-b border-gray-100 pb-4 last:border-b-0">
                    <Link
                      to={`/wiki/article/${relatedArticle.slug}`}
                      className="block hover:text-red-600 transition-colors"
                    >
                      <h4 className="font-medium text-gray-900 mb-2 line-clamp-2">
                        {relatedArticle.title}
                      </h4>
                      <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                        {relatedArticle.summary}
                      </p>
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <span>{relatedArticle.category.replace('_', ' ')}</span>
                        <span>{relatedArticle.publishedAt ? new Date(relatedArticle.publishedAt).toLocaleDateString('vi-VN') : 'N/A'}</span>
                      </div>
                    </Link>
                  </div>
                ))}
              </div>

              <div className="mt-6 pt-4 border-t border-gray-200">
                <Link
                  to="/wiki"
                  className="inline-flex items-center text-red-600 hover:text-red-700 font-medium"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Quay lại Wiki
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WikiDetailPage;