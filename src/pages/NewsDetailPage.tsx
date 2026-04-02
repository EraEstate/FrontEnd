import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useNewsArticle, useNews } from '../api/hooks';
import type { News } from '../types';
import { useTranslation } from 'react-i18next';
import { newsAPI } from '../api/news';
import { useAuthStore } from '../store/authStore';
import toast from '../utils/toast';
import { getImageUrl, getImagePlaceholder } from '../utils/imageUtils';

const NewsDetailPage = () => {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const { isAuthenticated } = useAuthStore();
  const [comments, setComments] = useState<any[]>([]);
  const [commentText, setCommentText] = useState('');
  const [likeBusy, setLikeBusy] = useState(false);
  const [liked, setLiked] = useState(false);
  
  // Use hooks for API calls
  const { data: article, loading: articleLoading } = useNewsArticle(id || '');
  const { data: newsData } = useNews({ size: 4 });
  
  const relatedNews = newsData?.content?.slice(0, 4) || [];
  const loading = articleLoading;

  useEffect(() => {
    if (!id) return;
    newsAPI
      .getComments(id, 0, 30)
      .then((data: any) => {
        if (Array.isArray(data)) setComments(data);
        else if (data?.content) setComments(data.content);
        else setComments([]);
      })
      .catch(() => setComments([]));
  }, [id]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-300 rounded w-3/4 mb-4"></div>
          <div className="h-4 bg-gray-300 rounded w-1/4 mb-6"></div>
          <div className="h-64 bg-gray-300 rounded mb-6"></div>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-4 bg-gray-300 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!article) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <div className="mb-8">
          <svg className="mx-auto h-24 w-24 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-gray-800 mb-4">{t('news.notFound')}</h1>
        <p className="text-gray-600 mb-6">{t('news.notFound')}</p>
        <Link
          to="/news"
          className="inline-flex items-center px-6 py-3 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 transition-colors"
        >
          {t('news.backToNews')}
        </Link>
      </div>
    );
  }

  // Chuẩn hoá tên tác giả để hỗ trợ cả dạng string và object (vd: { fullName, email })
  const authorName =
    typeof (article as any).author === 'string'
      ? (article as any).author
      : (article as any).author?.fullName ||
        (article as any).author?.name ||
        '';

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <nav className="flex items-center space-x-2 text-sm text-gray-600 mb-8">
        <Link to="/" className="hover:text-red-600">{t('common.home')}</Link>
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
        <Link to="/news" className="hover:text-red-600">{t('common.news')}</Link>
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
        <span className="text-gray-800">{t('news.detail')}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2">
          <article className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="p-8">
              {/* Article Header */}
              <div className="mb-6">
                <div className="flex items-center space-x-4 text-sm text-gray-600 mb-4">
                  <span className="bg-red-600 text-white px-3 py-1 rounded-full font-medium">
                    {article.category}
                  </span>
                  <span>{new Date(article.createdAt).toLocaleDateString('vi-VN')}</span>
                  {article.viewCount && (
                    <>
                      <span>•</span>
                      <span>{article.viewCount.toLocaleString()} {t('common.views')}</span>
                    </>
                  )}
                </div>
                
                <h1 className="text-3xl font-bold text-gray-800 mb-4 leading-tight">
                  {article.title}
                </h1>
                
                <p className="text-lg text-gray-600 leading-relaxed">
                  {article.summary}
                </p>
              </div>

              {/* Featured Image */}
              {article.imageUrl && (
                <div className="mb-8">
                  <img
                    src={getImageUrl(article.imageUrl)}
                    alt={article.title}
                    className="w-full h-auto rounded-lg shadow-sm"
                  />
                </div>
              )}

              {/* Article Content */}
              <div className="prose prose-lg max-w-none">
                <div
                  dangerouslySetInnerHTML={{ __html: article.content || article.summary }}
                  className="text-gray-700 leading-relaxed"
                />
              </div>

              {/* Article Footer */}
              <div className="mt-8 pt-6 border-t border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    {authorName && (
                      <div className="flex items-center space-x-2">
                        <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
                          <span className="text-sm font-medium text-gray-600">
                            {authorName.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-800">
                            {t('common.author')}: {authorName}
                          </p>
                          <p className="text-xs text-gray-600">
                            {new Date(article.createdAt).toLocaleDateString('vi-VN', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            })}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex items-center space-x-4">
                    <button
                      type="button"
                      disabled={likeBusy || !id}
                      onClick={async () => {
                        if (!id) return;
                        setLikeBusy(true);
                        try {
                          if (liked) {
                            await newsAPI.unlike(id);
                            setLiked(false);
                            toast.success('Đã bỏ thích.');
                          } else {
                            await newsAPI.like(id);
                            setLiked(true);
                            toast.success('Đã thích bài viết.');
                          }
                        } catch {
                          toast.error('Không cập nhật được thích.');
                        } finally {
                          setLikeBusy(false);
                        }
                      }}
                      className={`flex items-center space-x-2 transition-colors ${
                        liked ? 'text-red-600' : 'text-gray-600 hover:text-red-600'
                      } disabled:opacity-50`}
                    >
                      <svg
                        className={`w-5 h-5 ${liked ? 'fill-current' : ''}`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                        />
                      </svg>
                      <span className="text-sm">{t('common.like')}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        void navigator.clipboard?.writeText(window.location.href);
                        toast.info('Đã sao chép liên kết bài viết.');
                      }}
                      className="flex items-center space-x-2 text-gray-600 hover:text-blue-600 transition-colors"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
                      </svg>
                      <span className="text-sm">{t('common.share')}</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Bình luận */}
              <div className="mt-8 pt-6 border-t border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Bình luận ({comments.length})</h2>
                {isAuthenticated ? (
                  <form
                    className="mb-6"
                    onSubmit={async (e) => {
                      e.preventDefault();
                      if (!id || !commentText.trim()) return;
                      try {
                        await newsAPI.addComment(id, commentText.trim());
                        setCommentText('');
                        const data = await newsAPI.getComments(id, 0, 30);
                        if (Array.isArray(data)) setComments(data);
                        else if ((data as any)?.content) setComments((data as any).content);
                        toast.success('Đã đăng bình luận.');
                      } catch {
                        toast.error('Không gửi được bình luận.');
                      }
                    }}
                  >
                    <textarea
                      value={commentText}
                      onChange={(e) => setCommentText(e.target.value)}
                      rows={3}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-red-500 focus:border-red-500"
                      placeholder="Chia sẻ ý kiến của bạn…"
                    />
                    <button
                      type="submit"
                      className="mt-2 px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700"
                    >
                      Gửi bình luận
                    </button>
                  </form>
                ) : (
                  <p className="text-sm text-gray-600 mb-6">
                    <Link to="/login" className="text-red-600 font-medium hover:underline">
                      Đăng nhập
                    </Link>{' '}
                    để bình luận.
                  </p>
                )}
                <ul className="space-y-3">
                  {comments.length === 0 ? (
                    <li className="text-sm text-gray-500">Chưa có bình luận. Hãy là người đầu tiên.</li>
                  ) : (
                    comments.map((c, i) => (
                      <li key={c.id || i} className="bg-gray-50 rounded-lg p-3 text-sm text-gray-800">
                        {typeof c === 'string' ? c : c.comment || c.content || c.text || JSON.stringify(c)}
                      </li>
                    ))
                  )}
                </ul>
              </div>
            </div>
          </article>
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-6">Tin tức liên quan</h3>
            
            <div className="space-y-6">
              {relatedNews.map((news: News) => (
                <Link
                  key={news.id}
                  to={`/news/${news.id}`}
                  className="block group"
                >
                  <div className="flex space-x-4">
                    <img
                      src={getImageUrl(news.imageUrl) || getImagePlaceholder(80, 60)}
                      alt={news.title}
                      className="w-20 h-15 object-cover rounded-lg group-hover:opacity-80 transition-opacity"
                    />
                    <div className="flex-1">
                      <h4 className="text-sm font-medium text-gray-800 group-hover:text-red-600 transition-colors line-clamp-2 mb-2">
                        {news.title}
                      </h4>
                      <p className="text-xs text-gray-600">
                        {new Date(news.createdAt).toLocaleDateString('vi-VN')}
                      </p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            <div className="mt-8 pt-6 border-t border-gray-200">
              <Link
                to="/news"
                className="block w-full text-center py-3 px-4 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 transition-colors"
              >
                Xem tất cả tin tức
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewsDetailPage;