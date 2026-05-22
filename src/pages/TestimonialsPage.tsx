import React, { useState, useEffect } from 'react';
import { Star, Quote, Loader2, Filter, ChevronDown } from 'lucide-react';
import { testimonialAPI, type TestimonialResponse } from '../api/testimonial';
import { showError } from '../utils/toast';

const CAT_OPTIONS = [
  { value: '', label: 'Tất cả' },
  { value: 'BUY', label: '🏠 Mua nhà' },
  { value: 'SELL', label: '💰 Bán nhà' },
  { value: 'RENT', label: '🔑 Thuê nhà' },
  { value: 'INVEST', label: '📈 Đầu tư' },
  { value: 'GENERAL', label: '⭐ Chung' },
];

const COLORS = [
  'from-red-50 to-orange-50 border-red-100',
  'from-blue-50 to-indigo-50 border-blue-100',
  'from-emerald-50 to-teal-50 border-emerald-100',
  'from-violet-50 to-purple-50 border-violet-100',
  'from-amber-50 to-yellow-50 border-amber-100',
  'from-pink-50 to-rose-50 border-pink-100',
];

const TestimonialsPage: React.FC = () => {
  const [testimonials, setTestimonials] = useState<TestimonialResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [category, setCategory] = useState('');

  useEffect(() => { fetchData(); }, [page, category]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const data = await testimonialAPI.getApproved(page, 12, category || undefined);
      setTestimonials(data.content || []);
      setTotalPages(data.totalPages || 1);
    } catch {
      showError('Không thể tải câu chuyện');
    } finally {
      setLoading(false);
    }
  };

  const renderStars = (rating: number) => (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map(star => (
        <Star key={`star-${star}`} className={`w-4 h-4 ${star <= rating ? 'text-amber-400 fill-amber-400' : 'text-gray-200'}`} />
      ))}
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <div className="bg-gradient-to-br from-red-600 via-red-700 to-rose-800 text-white">
        <div className="max-w-6xl mx-auto px-4 pt-28 pb-16 text-center">
          <h1 className="text-3xl sm:text-4xl font-semibold mb-3">Câu chuyện thành công</h1>
          <p className="text-red-100 text-lg max-w-2xl mx-auto">
            Khám phá những trải nghiệm thực tế từ khách hàng đã tin tưởng sử dụng EraEstate
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 -mt-6 pb-16">
        {/* Filter */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 mb-8 flex flex-wrap items-center gap-2">
          <Filter className="w-4 h-4 text-gray-400" />
          {CAT_OPTIONS.map(opt => (
            <button key={opt.value} onClick={() => { setCategory(opt.value); setPage(0); }}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                category === opt.value
                  ? 'bg-red-600 text-white shadow-sm'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}>
              {opt.label}
            </button>
          ))}
        </div>

        {/* Loading */}
        {loading && testimonials.length === 0 && (
          <div className="flex justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-red-500" />
          </div>
        )}

        {/* Empty */}
        {!loading && testimonials.length === 0 && (
          <div className="text-center py-20 bg-white rounded-2xl border border-gray-100">
            <Quote className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-700">Chưa có câu chuyện nào</h3>
            <p className="text-sm text-gray-500 mt-1">Hãy là người đầu tiên chia sẻ trải nghiệm!</p>
          </div>
        )}

        {/* Grid */}
        {testimonials.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {testimonials.map((t, i) => (
              <div key={t.id}
                className={`bg-gradient-to-br ${COLORS[i % COLORS.length]} rounded-2xl border p-6 hover:shadow-md transition-all group`}>
                {/* Quote icon */}
                <Quote className="w-8 h-8 text-red-300/60 mb-3" />

                {/* Content */}
                <p className="text-gray-700 text-sm leading-relaxed mb-5 line-clamp-5">
                  "{t.content}"
                </p>

                {/* Rating */}
                <div className="mb-4">{renderStars(t.rating)}</div>

                {/* Property tag */}
                {t.propertyTitle && (
                  <div className="mb-4 px-3 py-1.5 bg-white/60 rounded-lg inline-block">
                    <p className="text-xs text-gray-600">🏠 {t.propertyTitle}</p>
                  </div>
                )}

                {/* Author */}
                <div className="flex items-center gap-3 pt-4 border-t border-white/40">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-red-400 to-rose-500 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                    {t.avatarUrl ? (
                      <img src={t.avatarUrl} alt="" className="w-full h-full rounded-full object-cover" />
                    ) : (
                      t.fullName?.charAt(0)?.toUpperCase() || '?'
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">{t.fullName}</p>
                    {t.roleLabel && <p className="text-xs text-gray-500">{t.roleLabel}</p>}
                  </div>
                  {t.isFeatured && (
                    <span className="ml-auto px-2 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-700">
                      ⭐ Nổi bật
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-3 mt-10">
            <button onClick={() => setPage(p => Math.max(0, p - 1))} disabled={page === 0}
              className="px-4 py-2 rounded-xl border border-gray-200 text-sm font-medium disabled:opacity-40 hover:bg-white">← Trước</button>
            <span className="text-sm text-gray-500">{page + 1} / {totalPages}</span>
            <button onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))} disabled={page >= totalPages - 1}
              className="px-4 py-2 rounded-xl border border-gray-200 text-sm font-medium disabled:opacity-40 hover:bg-white">Sau →</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default TestimonialsPage;
