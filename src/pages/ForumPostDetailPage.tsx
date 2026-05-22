import { type FormEvent, useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Loader2, MessageSquare, Pin, ShieldCheck, ThumbsUp, X } from 'lucide-react';
import { forumAPI } from '../api/forum';
import type { ForumComment, ForumPost } from '../api/types';
import { useAuthStore } from '../store/authStore';
import { showError, showSuccess } from '../utils/toast';

const categoryLabel: Record<ForumPost['category'], string> = {
  AREA_DISCUSS: 'Khu vuc',
  PROJECT_REVIEW: 'Review du an',
  EXPERIENCE: 'Kinh nghiem',
  QUESTION: 'Hoi dap',
};

const ForumPostDetailPage: React.FC = () => {
  const { id } = useParams();
  const { user, isAuthenticated } = useAuthStore();
  const [post, setPost] = useState<ForumPost | null>(null);
  const [comments, setComments] = useState<ForumComment[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [commentContent, setCommentContent] = useState('');
  const [replyTo, setReplyTo] = useState<string | null>(null);

  const isModerator = user?.role === 'ADMIN' || user?.role === 'STAFF';
  const canManagePost = Boolean(post && user && (isModerator || post.userId === user.id));

  const loadData = async () => {
    if (!id) {
      return;
    }
    setLoading(true);
    try {
      const [postData, commentData] = await Promise.all([forumAPI.getPostById(id), forumAPI.getComments(id)]);
      setPost(postData);
      setComments(commentData);
    } catch {
      showError('Khong the tai chi tiet bai viet');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadData();
  }, [id]);

  const commentsByParent = useMemo(() => {
    const map = new Map<string, ForumComment[]>();
    for (const comment of comments) {
      const key = comment.parentCommentId || 'root';
      const current = map.get(key) || [];
      current.push(comment);
      map.set(key, current);
    }
    return map;
  }, [comments]);

  const votePost = async () => {
    if (!id) {
      return;
    }
    if (!isAuthenticated) {
      showError('Ban can dang nhap de vote');
      return;
    }
    try {
      const updated = await forumAPI.votePost(id);
      setPost(updated);
    } catch {
      showError('Khong the vote bai viet');
    }
  };

  const submitComment = async (event: FormEvent) => {
    event.preventDefault();
    if (!id) {
      return;
    }
    if (!isAuthenticated) {
      showError('Ban can dang nhap de binh luan');
      return;
    }
    if (!commentContent.trim()) {
      showError('Noi dung binh luan khong duoc de trong');
      return;
    }

    setSubmitting(true);
    try {
      await forumAPI.createComment(id, {
        content: commentContent.trim(),
        parentCommentId: replyTo || undefined,
      });
      setCommentContent('');
      setReplyTo(null);
      await loadData();
      showSuccess('Da dang binh luan');
    } catch {
      showError('Khong the gui binh luan');
    } finally {
      setSubmitting(false);
    }
  };

  const voteComment = async (commentId: string) => {
    if (!isAuthenticated) {
      showError('Ban can dang nhap de vote');
      return;
    }
    try {
      const updated = await forumAPI.voteComment(commentId);
      setComments((prev) => prev.map((item) => (item.id === commentId ? updated : item)));
    } catch {
      showError('Khong the vote binh luan');
    }
  };

  const deleteComment = async (commentId: string) => {
    try {
      await forumAPI.deleteComment(commentId);
      await loadData();
      showSuccess('Da xoa binh luan');
    } catch {
      showError('Khong the xoa binh luan');
    }
  };

  const setPinned = async (pinned: boolean) => {
    if (!id) {
      return;
    }
    try {
      const updated = await forumAPI.pinPost(id, pinned);
      setPost(updated);
      showSuccess(pinned ? 'Da ghim bai viet' : 'Da bo ghim bai viet');
    } catch {
      showError('Khong the cap nhat ghim bai viet');
    }
  };

  const updateStatus = async (status: 'ACTIVE' | 'HIDDEN' | 'DELETED') => {
    if (!id) {
      return;
    }
    try {
      const updated = await forumAPI.updatePostStatus(id, status);
      setPost(updated);
      showSuccess('Da cap nhat trang thai bai viet');
    } catch {
      showError('Khong the cap nhat trang thai');
    }
  };

  const renderCommentList = (parentId: string | null, depth = 0): React.ReactNode => {
    const key = parentId || 'root';
    const items = commentsByParent.get(key) || [];
    return items.map((comment) => {
      const canManageComment = Boolean(user && (isModerator || user.id === comment.userId));
      return (
        <div
          key={comment.id}
          className="space-y-2 rounded-lg border border-gray-200 p-3"
          style={{ marginLeft: depth > 0 ? `${Math.min(depth * 20, 60)}px` : 0 }}
        >
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-gray-500">
            <span className="font-medium text-gray-700">{comment.userName || 'Nguoi dung'}</span>
            <span suppressHydrationWarning>{new Date(comment.createdAt).toLocaleString('vi-VN')}</span>
          </div>
          <p className="text-sm text-gray-800">{comment.content}</p>
          <div className="flex items-center gap-3 text-xs">
            <button
              type="button"
              onClick={() => void voteComment(comment.id)}
              className="inline-flex items-center gap-1 rounded-md bg-gray-100 px-2 py-1 text-gray-700 hover:bg-gray-200"
            >
              <ThumbsUp className="h-3.5 w-3.5" />
              {comment.upvotes}
            </button>
            {isAuthenticated ? (
              <button
                type="button"
                onClick={() => setReplyTo(comment.id)}
                className="rounded-md bg-blue-50 px-2 py-1 text-blue-700 hover:bg-blue-100"
              >
                Tra loi
              </button>
            ) : null}
            {canManageComment ? (
              <button
                type="button"
                onClick={() => void deleteComment(comment.id)}
                className="rounded-md bg-red-50 px-2 py-1 text-red-700 hover:bg-red-100"
              >
                Xoa
              </button>
            ) : null}
          </div>

          {renderCommentList(comment.id, depth + 1)}
        </div>
      );
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-24">
      <div className="mx-auto w-full max-w-5xl px-4 sm:px-6 lg:px-8">
        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
          </div>
        ) : !post ? (
          <div className="rounded-2xl bg-white p-6 text-sm text-gray-600 shadow-sm">Khong tim thay bai viet.</div>
        ) : (
          <>
            <div className="mb-4">
              <Link to="/forum" className="text-sm text-red-700 hover:underline">
                ← Quay lai forum
              </Link>
            </div>

            <article className="mb-6 rounded-2xl bg-white p-6 shadow-sm">
              <div className="mb-3 flex flex-wrap items-center gap-2 text-xs text-gray-500">
                <span className="rounded-full bg-red-50 px-2 py-0.5 text-red-700">{categoryLabel[post.category]}</span>
                {post.isPinned ? (
                  <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-amber-800">
                    <Pin className="h-3 w-3" />
                    Ghim
                  </span>
                ) : null}
                {post.status !== 'ACTIVE' ? (
                  <span className="rounded-full bg-gray-100 px-2 py-0.5 text-gray-700">Status: {post.status}</span>
                ) : null}
                <span suppressHydrationWarning>{new Date(post.createdAt).toLocaleString('vi-VN')}</span>
              </div>

              <h1 className="text-2xl font-semibold text-gray-900" suppressHydrationWarning>{post.title}</h1>
              <p className="mt-2 text-sm text-gray-500">
                Dang boi {post.userName || 'Nguoi dung'} • {post.commentCount} binh luan
              </p>

              {post.tags?.length ? (
                <div className="mt-3 flex flex-wrap gap-2">
                  {post.tags.map((tag) => (
                    <span key={`${post.id}-${tag}`} className="rounded-full bg-gray-100 px-2 py-1 text-xs text-gray-600">
                      #{tag}
                    </span>
                  ))}
                </div>
              ) : null}

              <div className="mt-5 whitespace-pre-wrap text-gray-800">{post.content}</div>

              <div className="mt-5 flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={() => void votePost()}
                  className="inline-flex items-center gap-2 rounded-lg bg-gray-900 px-3 py-2 text-sm font-medium text-white hover:bg-gray-950"
                >
                  <ThumbsUp className="h-4 w-4" />
                  {post.hasUpvoted ? 'Bo vote' : 'Vote'} ({post.upvotes})
                </button>
                <span className="inline-flex items-center gap-1 text-sm text-gray-600">
                  <MessageSquare className="h-4 w-4" />
                  {post.commentCount} comments
                </span>
              </div>

              {isModerator && post ? (
                <div className="mt-5 border-t border-gray-100 pt-4">
                  <p className="mb-2 inline-flex items-center gap-1 text-xs font-semibold uppercase text-gray-500">
                    <ShieldCheck className="h-4 w-4" />
                    Moderation
                  </p>
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={() => void setPinned(!post.isPinned)}
                      className="rounded-lg border border-gray-300 px-3 py-2 text-xs font-medium hover:bg-gray-50"
                    >
                      {post.isPinned ? 'Bo ghim' : 'Ghim bai viet'}
                    </button>
                    <button
                      type="button"
                      onClick={() => void updateStatus('ACTIVE')}
                      className="rounded-lg border border-emerald-300 px-3 py-2 text-xs font-medium text-emerald-700 hover:bg-emerald-50"
                    >
                      Set ACTIVE
                    </button>
                    <button
                      type="button"
                      onClick={() => void updateStatus('HIDDEN')}
                      className="rounded-lg border border-amber-300 px-3 py-2 text-xs font-medium text-amber-700 hover:bg-amber-50"
                    >
                      Set HIDDEN
                    </button>
                    <button
                      type="button"
                      onClick={() => void updateStatus('DELETED')}
                      className="rounded-lg border border-red-300 px-3 py-2 text-xs font-medium text-red-700 hover:bg-red-50"
                    >
                      Set DELETED
                    </button>
                  </div>
                </div>
              ) : null}
            </article>

            <section className="mb-6 rounded-2xl bg-white p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-gray-900">Binh luan</h2>

              <form className="mt-4 space-y-3" onSubmit={submitComment}>
                {replyTo ? (
                  <div className="flex items-center justify-between rounded-lg bg-blue-50 px-3 py-2 text-xs text-blue-700">
                    <span>Dang tra loi binh luan</span>
                    <button type="button" onClick={() => setReplyTo(null)} className="inline-flex items-center gap-1">
                      <X className="h-3.5 w-3.5" />
                      Huy
                    </button>
                  </div>
                ) : null}
                <textarea
                  value={commentContent}
                  onChange={(event) => setCommentContent(event.target.value)}
                  rows={4}
                  placeholder="Nhap noi dung binh luan..."
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-red-400"
                />
                <button
                  type="submit"
                  disabled={submitting}
                  className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                  Gui binh luan
                </button>
              </form>

              <div className="mt-6 space-y-3">
                {comments.length === 0 ? (
                  <p className="rounded-lg bg-gray-50 px-4 py-3 text-sm text-gray-600">Chua co binh luan nao.</p>
                ) : (
                  renderCommentList(null)
                )}
              </div>
            </section>

            {canManagePost ? (
              <div className="mb-8 flex justify-end">
                <button
                  type="button"
                  onClick={async () => {
                    if (!id) {
                      return;
                    }
                    try {
                      await forumAPI.deletePost(id);
                      showSuccess('Da xoa bai viet');
                      window.location.href = '/forum';
                    } catch {
                      showError('Khong the xoa bai viet');
                    }
                  }}
                  className="rounded-lg bg-red-50 px-3 py-2 text-sm font-medium text-red-700 hover:bg-red-100"
                >
                  Xoa bai viet
                </button>
              </div>
            ) : null}
          </>
        )}
      </div>
    </div>
  );
};

export default ForumPostDetailPage;
