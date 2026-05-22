import { type FormEvent, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Flame, Loader2, MessageSquare, Pin, Plus, Search, ThumbsUp } from 'lucide-react';
import { forumAPI } from '../api/forum';
import type { ForumPost, PageResponse } from '../api/types';
import { useAuthStore } from '../store/authStore';
import { showError } from '../utils/toast';

const CATEGORY_LABELS: Record<ForumPost['category'], string> = {
  AREA_DISCUSS: 'Khu vuc',
  PROJECT_REVIEW: 'Review du an',
  EXPERIENCE: 'Kinh nghiem',
  QUESTION: 'Hoi dap',
};

const truncate = (value: string, limit = 180): string =>
  value.length > limit ? `${value.slice(0, limit)}...` : value;

const ForumPage: React.FC = () => {
  const { isAuthenticated } = useAuthStore();
  const [postsPage, setPostsPage] = useState<PageResponse<ForumPost> | null>(null);
  const [trending, setTrending] = useState<ForumPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [keywordInput, setKeywordInput] = useState('');
  const [categoryInput, setCategoryInput] = useState<ForumPost['category'] | ''>('');
  const [filters, setFilters] = useState<{ keyword?: string; category?: ForumPost['category'] }>({});

  const loadData = async () => {
    setLoading(true);
    try {
      const [postsData, trendingData] = await Promise.all([
        forumAPI.getPosts({
          page,
          size: 10,
          sort: 'recent',
          keyword: filters.keyword,
          category: filters.category,
        }),
        forumAPI.getTrendingPosts(5),
      ]);
      setPostsPage(postsData);
      setTrending(trendingData);
    } catch {
      showError('Khong the tai du lieu forum');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadData();
  }, [page, filters.keyword, filters.category]);

  const handleSearch = (event: FormEvent) => {
    event.preventDefault();
    setPage(0);
    setFilters({
      keyword: keywordInput.trim() || undefined,
      category: categoryInput || undefined,
    });
  };

  const posts = useMemo(() => postsPage?.content || [], [postsPage]);

  return (
    <div className="min-h-screen bg-gray-50 pt-24">
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-6 rounded-2xl bg-white p-6 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">Cong dong Forum</h1>
              <p className="mt-1 text-sm text-gray-600">
                Thao luan ve khu vuc, du an va kinh nghiem mua ban bat dong san.
              </p>
            </div>
            {isAuthenticated ? (
              <Link
                to="/forum/create"
                className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-red-700"
              >
                <Plus className="h-4 w-4" />
                Tao bai viet
              </Link>
            ) : null}
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
            <div className="rounded-2xl bg-white p-5 shadow-sm">
              <form className="grid gap-3 md:grid-cols-4" onSubmit={handleSearch}>
                <div className="md:col-span-2">
                  <label htmlFor="forum-search-keyword" className="text-xs font-medium uppercase text-gray-500">Tim kiem</label>
                  <div className="mt-1 flex items-center rounded-lg border border-gray-300 px-3">
                    <Search className="h-4 w-4 text-gray-500" />
                    <input
                      id="forum-search-keyword"

                      value={keywordInput}
                      onChange={(event) => setKeywordInput(event.target.value)}
                      placeholder="Tieu de, noi dung..."
                      className="w-full border-0 bg-transparent px-2 py-2.5 text-sm outline-none"
                    />
                  </div>
                </div>
                <div>
                  <label htmlFor="forum-search-category" className="text-xs font-medium uppercase text-gray-500">Danh muc</label>
                  <select
                    id="forum-search-category"

                    value={categoryInput}
                    onChange={(event) => setCategoryInput(event.target.value as ForumPost['category'] | '')}
                    className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm"
                  >
                    <option value="">Tat ca</option>
                    <option value="AREA_DISCUSS">Khu vuc</option>
                    <option value="PROJECT_REVIEW">Review du an</option>
                    <option value="EXPERIENCE">Kinh nghiem</option>
                    <option value="QUESTION">Hoi dap</option>
                  </select>
                </div>
                <div className="flex items-end">
                  <button
                    type="submit"
                    className="w-full rounded-lg bg-gray-900 px-3 py-2.5 text-sm font-medium text-white hover:bg-gray-950"
                  >
                    Loc bai viet
                  </button>
                </div>
              </form>
            </div>

            <div className="rounded-2xl bg-white p-5 shadow-sm">
              {loading ? (
                <div className="flex justify-center py-10">
                  <Loader2 className="h-6 w-6 animate-spin text-gray-500" />
                </div>
              ) : posts.length === 0 ? (
                <div className="rounded-lg bg-gray-50 px-4 py-3 text-sm text-gray-600">
                  Chua co bai viet nao theo dieu kien hien tai.
                </div>
              ) : (
                <div className="space-y-4">
                  {posts.map((post) => (
                    <article key={post.id} className="rounded-xl border border-gray-200 p-4">
                      <div className="mb-2 flex items-center gap-2 text-xs text-gray-500">
                        {post.isPinned ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-amber-800">
                            <Pin className="h-3 w-3" />
                            Ghim
                          </span>
                        ) : null}
                        <span className="rounded-full bg-red-50 px-2 py-0.5 text-red-700">
                          {CATEGORY_LABELS[post.category]}
                        </span>
                        <span suppressHydrationWarning>{new Date(post.createdAt).toLocaleString('vi-VN')}</span>
                      </div>

                      <Link to={`/forum/${post.id}`} className="text-lg font-semibold text-gray-900 hover:text-red-700">
                        {post.title}
                      </Link>
                      <p className="mt-2 text-sm text-gray-700" suppressHydrationWarning>{truncate(post.content)}</p>

                      {post.tags?.length ? (
                        <div className="mt-3 flex flex-wrap gap-2">
                          {post.tags.map((tag) => (
                            <span key={`${post.id}-${tag}`} className="rounded-full bg-gray-100 px-2 py-1 text-xs text-gray-600">
                              #{tag}
                            </span>
                          ))}
                        </div>
                      ) : null}

                      <div className="mt-3 flex items-center gap-4 text-xs text-gray-500">
                        <span>{post.userName || 'Nguoi dung'}</span>
                        <span className="inline-flex items-center gap-1">
                          <ThumbsUp className="h-3.5 w-3.5" />
                          {post.upvotes}
                        </span>
                        <span className="inline-flex items-center gap-1">
                          <MessageSquare className="h-3.5 w-3.5" />
                          {post.commentCount}
                        </span>
                      </div>
                    </article>
                  ))}
                </div>
              )}

              <div className="mt-5 flex items-center justify-between border-t border-gray-100 pt-4 text-sm">
                <button
                  type="button"
                  onClick={() => setPage((prev) => Math.max(prev - 1, 0))}
                  disabled={page === 0 || loading}
                  className="rounded-lg border border-gray-300 px-3 py-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Trang truoc
                </button>
                <span className="text-gray-600">
                  Trang {postsPage ? postsPage.number + 1 : 1} / {Math.max(postsPage?.totalPages || 1, 1)}
                </span>
                <button
                  type="button"
                  onClick={() => setPage((prev) => prev + 1)}
                  disabled={loading || !postsPage || postsPage.last}
                  className="rounded-lg border border-gray-300 px-3 py-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Trang sau
                </button>
              </div>
            </div>
          </div>

          <aside className="space-y-4">
            <div className="rounded-2xl bg-white p-5 shadow-sm">
              <h2 className="mb-3 flex items-center gap-2 text-base font-semibold text-gray-900">
                <Flame className="h-5 w-5 text-orange-500" />
                Trending
              </h2>
              <div className="space-y-3">
                {trending.map((post) => (
                  <Link
                    key={`trend-${post.id}`}
                    to={`/forum/${post.id}`}
                    className="block rounded-lg border border-gray-100 p-3 hover:border-red-200 hover:bg-red-50/40"
                  >
                    <p className="line-clamp-2 text-sm font-medium text-gray-900">{post.title}</p>
                    <p className="mt-2 text-xs text-gray-500">
                      {post.upvotes} upvotes • {post.commentCount} comments
                    </p>
                  </Link>
                ))}
                {trending.length === 0 ? (
                  <p className="text-sm text-gray-500">Chua co bai viet trending.</p>
                ) : null}
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
};

export default ForumPage;
