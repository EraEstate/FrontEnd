import { type FormEvent, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Loader2, Send } from 'lucide-react';
import { forumAPI } from '../api/forum';
import type { ForumPost } from '../api/types';
import { showError, showSuccess } from '../utils/toast';

const CreateForumPostPage: React.FC = () => {
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState<ForumPost['category']>('QUESTION');
  const [tagsInput, setTagsInput] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (!title.trim() || !content.trim()) {
      showError('Vui long nhap day du tieu de va noi dung');
      return;
    }

    const tags = Array.from(
      new Set(
        tagsInput
          .split(',')
          .flatMap((item) => {
            const trimmed = item.trim();
            return trimmed ? [trimmed] : [];
          })
      )
    ).slice(0, 10);

    setSubmitting(true);
    try {
      const post = await forumAPI.createPost({
        title: title.trim(),
        content: content.trim(),
        category,
        tags,
      });
      showSuccess('Da tao bai viet thanh cong');
      navigate(`/forum/${post.id}`);
    } catch {
      showError('Khong the tao bai viet');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-24">
      <div className="mx-auto w-full max-w-4xl px-4 sm:px-6 lg:px-8">
        <div className="mb-4">
          <Link to="/forum" className="text-sm text-red-700 hover:underline">
            ← Quay lai forum
          </Link>
        </div>

        <div className="rounded-2xl bg-white p-6 shadow-sm">
          <h1 className="text-2xl font-semibold text-gray-900">Tao bai viet forum</h1>
          <p className="mt-1 text-sm text-gray-600">
            Chia se thong tin huu ich cho cong dong. Ban co the dung xuong dong de dinh dang noi dung.
          </p>

          <form className="mt-6 space-y-4" onSubmit={submit}>
            <label className="block text-sm text-gray-700">
              Tieu de
              <input
                type="text"
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-red-400"
                placeholder="Vi du: Co nen mua can ho khu vuc nay khong?"
              />
            </label>

            <label className="block text-sm text-gray-700">
              Danh muc
              <select
                value={category}
                onChange={(event) => setCategory(event.target.value as ForumPost['category'])}
                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
              >
                <option value="AREA_DISCUSS">Khu vuc</option>
                <option value="PROJECT_REVIEW">Review du an</option>
                <option value="EXPERIENCE">Kinh nghiem</option>
                <option value="QUESTION">Hoi dap</option>
              </select>
            </label>

            <label className="block text-sm text-gray-700">
              Tags (phan cach boi dau phay)
              <input
                type="text"
                value={tagsInput}
                onChange={(event) => setTagsInput(event.target.value)}
                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-red-400"
                placeholder="vd: q7, can-ho, kinh-nghiem"
              />
            </label>

            <label className="block text-sm text-gray-700">
              Noi dung
              <textarea
                value={content}
                onChange={(event) => setContent(event.target.value)}
                rows={12}
                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-red-400"
                placeholder="Nhap noi dung bai viet..."
              />
            </label>

            <div className="flex items-center gap-3">
              <button
                type="submit"
                disabled={submitting}
                className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                Dang bai viet
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateForumPostPage;
