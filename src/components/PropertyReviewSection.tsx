import React, { useState, useEffect } from 'react';
import { Star, ThumbsUp, User, ChevronDown, Loader2, PenLine, ShieldCheck } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { reviewAPI, type Review, type ReviewStats, type ReviewData } from '../api/review';
import { useAuthStore } from '../store/authStore';
import { showSuccess, showError } from '../utils/toast';

interface Props {
  propertyId: string;
}

const StarRating: React.FC<{
  value: number;
  onChange?: (val: number) => void;
  size?: 'sm' | 'md' | 'lg';
  readonly?: boolean;
}> = ({ value, onChange, size = 'md', readonly = false }) => {
  const [hover, setHover] = useState(0);
  const sizeMap = { sm: 'w-4 h-4', md: 'w-5 h-5', lg: 'w-7 h-7' };
  
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={readonly}
          onClick={() => onChange?.(star)}
          onMouseEnter={() => !readonly && setHover(star)}
          onMouseLeave={() => !readonly && setHover(0)}
          className={`${readonly ? 'cursor-default' : 'cursor-pointer hover:scale-110'} transition-transform`}
        >
          <Star
            className={`${sizeMap[size]} ${
              star <= (hover || value) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
            } transition-colors`}
          />
        </button>
      ))}
    </div>
  );
};

const RatingBar: React.FC<{ label: string; count: number; total: number }> = ({ label, count, total }) => {
  const percent = total > 0 ? (count / total) * 100 : 0;
  return (
    <div className="flex items-center gap-2 text-sm">
      <span className="w-8 text-right text-gray-600 font-medium">{label}</span>
      <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
      <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
        <div
          className="h-full bg-yellow-400 rounded-full transition-all duration-500"
          style={{ width: `${percent}%` }}
        />
      </div>
      <span className="w-8 text-gray-500 text-xs">{count}</span>
    </div>
  );
};

const PropertyReviewSection: React.FC<Props> = ({ propertyId }) => {
  const { t } = useTranslation();
  const { isAuthenticated, user } = useAuthStore();

  const [stats, setStats] = useState<ReviewStats | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [hasReviewed, setHasReviewed] = useState(false);

  // Form state
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState<ReviewData>({
    rating: 0,
    title: '',
    content: '',
    locationRating: 0,
    valueRating: 0,
    conditionRating: 0,
    isAnonymous: false,
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadData();
  }, [propertyId, page]);

  useEffect(() => {
    if (isAuthenticated && propertyId) {
      reviewAPI.checkReviewed(propertyId)
        .then(res => setHasReviewed(res.hasReviewed))
        .catch(() => {});
    }
  }, [isAuthenticated, propertyId]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [statsRes, reviewsRes] = await Promise.all([
        reviewAPI.getStats(propertyId),
        reviewAPI.getReviews(propertyId, page, 5),
      ]);
      setStats(statsRes);
      if (page === 0) {
        setReviews(reviewsRes.content);
      } else {
        setReviews(prev => [...prev, ...reviewsRes.content]);
      }
      setTotalPages(reviewsRes.totalPages);
    } catch {
      // Silently fail — reviews are optional
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.rating === 0) {
      showError('Vui lòng chọn số sao đánh giá');
      return;
    }
    setSubmitting(true);
    try {
      await reviewAPI.createReview(propertyId, formData);
      showSuccess('Đã gửi đánh giá thành công!');
      setShowForm(false);
      setHasReviewed(true);
      setFormData({ rating: 0, title: '', content: '', locationRating: 0, valueRating: 0, conditionRating: 0, isAnonymous: false });
      setPage(0);
      loadData();
    } catch (err: any) {
      showError(err.response?.data?.error || err.response?.data?.message || 'Không thể gửi đánh giá');
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('vi-VN', { 
      day: '2-digit', month: '2-digit', year: 'numeric' 
    });
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
      <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
        <Star className="w-6 h-6 text-yellow-500" />
        Đánh giá & Nhận xét
      </h2>

      {/* Stats Overview */}
      {stats && stats.totalReviews > 0 ? (
        <div className="flex flex-col sm:flex-row gap-6 mb-6 p-4 bg-gray-50 rounded-xl">
          {/* Big Number */}
          <div className="flex flex-col items-center justify-center min-w-[100px]">
            <span className="text-4xl font-bold text-gray-900">{stats.averageRating}</span>
            <StarRating value={Math.round(stats.averageRating)} readonly size="sm" />
            <span className="text-sm text-gray-500 mt-1">{stats.totalReviews} đánh giá</span>
          </div>
          {/* Distribution */}
          <div className="flex-1 flex flex-col gap-1.5">
            {[5, 4, 3, 2, 1].map((star) => (
              <RatingBar
                key={star}
                label={`${star}`}
                count={stats.distribution[star] || 0}
                total={stats.totalReviews}
              />
            ))}
          </div>
        </div>
      ) : (
        !loading && (
          <div className="text-center py-8 bg-gray-50 rounded-xl mb-6">
            <Star className="w-10 h-10 text-gray-300 mx-auto mb-2" />
            <p className="text-gray-500 font-medium">Chưa có đánh giá nào</p>
            <p className="text-gray-400 text-sm">Hãy là người đầu tiên đánh giá!</p>
          </div>
        )
      )}

      {/* Write Review Button */}
      {isAuthenticated && !hasReviewed && !showForm && (
        <button
          onClick={() => setShowForm(true)}
          className="w-full py-3 border-2 border-dashed border-red-200 text-red-600 rounded-xl font-medium hover:bg-red-50 hover:border-red-300 transition-all mb-6 flex items-center justify-center gap-2"
        >
          <PenLine className="w-4 h-4" />
          Viết đánh giá
        </button>
      )}

      {/* Review Form */}
      <AnimatePresence>
        {showForm && (
          <motion.form
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            onSubmit={handleSubmit}
            className="border border-gray-200 rounded-xl p-5 mb-6 space-y-4 overflow-hidden"
          >
            <h3 className="font-semibold text-gray-900">Đánh giá của bạn</h3>
            
            {/* Overall Rating */}
            <div>
              <p className="text-sm text-gray-600 block mb-1">Đánh giá tổng thể *</p>
              <StarRating value={formData.rating} onChange={(v) => setFormData(p => ({ ...p, rating: v }))} size="lg" />
            </div>

            {/* Sub ratings row */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <p className="text-xs text-gray-500">Vị trí</p>
                <StarRating value={formData.locationRating || 0} onChange={(v) => setFormData(p => ({ ...p, locationRating: v }))} size="sm" />
              </div>
              <div>
                <p className="text-xs text-gray-500">Giá trị</p>
                <StarRating value={formData.valueRating || 0} onChange={(v) => setFormData(p => ({ ...p, valueRating: v }))} size="sm" />
              </div>
              <div>
                <p className="text-xs text-gray-500">Tình trạng</p>
                <StarRating value={formData.conditionRating || 0} onChange={(v) => setFormData(p => ({ ...p, conditionRating: v }))} size="sm" />
              </div>
            </div>

            {/* Title */}
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData(p => ({ ...p, title: e.target.value }))}
              placeholder="Tiêu đề đánh giá (tuỳ chọn)"
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-red-100 focus:border-red-400 outline-none"
            />

            {/* Content */}
            <textarea
              value={formData.content}
              onChange={(e) => setFormData(p => ({ ...p, content: e.target.value }))}
              placeholder="Chia sẻ trải nghiệm của bạn..."
              rows={3}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-red-100 focus:border-red-400 outline-none resize-none"
            />

            {/* Anonymous checkbox + Actions */}
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.isAnonymous}
                  onChange={(e) => setFormData(p => ({ ...p, isAnonymous: e.target.checked }))}
                  className="rounded border-gray-300 text-red-600 focus:ring-red-500"
                />
                Đánh giá ẩn danh
              </label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  Huỷ
                </button>
                <button
                  type="submit"
                  disabled={submitting || formData.rating === 0}
                  className="px-5 py-2 bg-red-600 text-white text-sm rounded-lg font-medium hover:bg-red-700 disabled:opacity-50 transition-colors flex items-center gap-2"
                >
                  {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                  Gửi đánh giá
                </button>
              </div>
            </div>
          </motion.form>
        )}
      </AnimatePresence>

      {/* Reviews List */}
      {loading && page === 0 ? (
        <div className="flex justify-center py-6">
          <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
        </div>
      ) : (
        <div className="space-y-4">
          {reviews.map((review, index) => (
            <motion.div
              key={review.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="border-b border-gray-100 last:border-0 pb-4 last:pb-0"
            >
              {/* Header */}
              <div className="flex items-start gap-3 mb-2">
                <div className="w-9 h-9 bg-gradient-to-br from-red-100 to-red-200 rounded-full flex items-center justify-center flex-shrink-0">
                  <User className="w-4 h-4 text-red-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-medium text-sm text-gray-900">
                      {review.isAnonymous ? 'Ẩn danh' : (review.user?.fullName || 'Người dùng')}
                    </span>
                    {review.isVerified && (
                      <span className="text-xs bg-green-100 text-green-700 px-1.5 py-0.5 rounded-full font-medium inline-flex items-center gap-0.5"><ShieldCheck className="w-3 h-3" /> Đã xác minh</span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <StarRating value={review.rating} readonly size="sm" />
                    <span className="text-xs text-gray-400">{formatDate(review.createdAt)}</span>
                  </div>
                </div>
              </div>
              
              {/* Content */}
              {review.title && <p className="font-medium text-sm text-gray-800 mb-1">{review.title}</p>}
              {review.content && <p className="text-sm text-gray-600 leading-relaxed">{review.content}</p>}
              
              {/* Sub ratings */}
              {(review.locationRating || review.valueRating || review.conditionRating) && (
                <div className="flex gap-4 mt-2 text-xs text-gray-500">
                  {review.locationRating ? <span className="inline-flex items-center gap-0.5">Vị trí: {review.locationRating}<Star className="w-3 h-3 fill-yellow-400 text-yellow-400" /></span> : null}
                  {review.valueRating ? <span className="inline-flex items-center gap-0.5">Giá trị: {review.valueRating}<Star className="w-3 h-3 fill-yellow-400 text-yellow-400" /></span> : null}
                  {review.conditionRating ? <span className="inline-flex items-center gap-0.5">Tình trạng: {review.conditionRating}<Star className="w-3 h-3 fill-yellow-400 text-yellow-400" /></span> : null}
                </div>
              )}

              {/* Helpful button */}
              <button className="flex items-center gap-1 mt-2 text-xs text-gray-400 hover:text-blue-600 transition-colors">
                <ThumbsUp className="w-3.5 h-3.5" />
                {review.helpfulCount > 0 ? `Hữu ích (${review.helpfulCount})` : 'Hữu ích'}
              </button>
            </motion.div>
          ))}
        </div>
      )}

      {/* Load More */}
      {page + 1 < totalPages && (
        <button
          onClick={() => setPage(p => p + 1)}
          className="w-full mt-4 py-2.5 text-sm text-[#4b5563] hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors flex items-center justify-center gap-1 font-medium"
        >
          <ChevronDown className="w-4 h-4" />
          Xem thêm đánh giá
        </button>
      )}
    </div>
  );
};

export default PropertyReviewSection;
