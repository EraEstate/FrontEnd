import React, { useState } from 'react';
import { Star, Loader2 } from 'lucide-react';
import { agentReviewApi } from '../api/agentReview';
import toast from '../utils/toast';

interface AgentReviewFormProps {
  agentId: string;
  onSuccess: () => void;
}

const StarRating: React.FC<{ label: string; value: number; onChange: (val: number) => void }> = ({ label, value, onChange }) => {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm font-medium text-gray-700">{label}</span>
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => onChange(s)}
            className="p-0.5 rounded hover:bg-white focus:outline-none"
          >
            <Star
              className={`w-6 h-6 \${s <= value ? 'fill-amber-400 text-amber-400' : 'text-gray-300'}`}
            />
          </button>
        ))}
      </div>
    </div>
  );
};

const AgentReviewForm: React.FC<AgentReviewFormProps> = ({ agentId, onSuccess }) => {
  const [professionalRating, setProfessionalRating] = useState(5);
  const [responsivenessRating, setResponsivenessRating] = useState(5);
  const [marketKnowledgeRating, setMarketKnowledgeRating] = useState(5);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await agentReviewApi.createReview({
        agentId,
        professionalRating,
        responsivenessRating,
        marketKnowledgeRating,
        comment: comment.trim()
      });
      toast.success('Gửi đánh giá thành công! Cảm ơn bạn.');
      setComment('');
      onSuccess();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Không thể gửi đánh giá.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-3 bg-white p-4 rounded-lg border border-gray-100">
        <StarRating 
          label="Chuyên môn nghiệp vụ" 
          value={professionalRating} 
          onChange={setProfessionalRating} 
        />
        <StarRating 
          label="Sự nhiệt tình & Phản hồi" 
          value={responsivenessRating} 
          onChange={setResponsivenessRating} 
        />
        <StarRating 
          label="Am hiểu thị trường" 
          value={marketKnowledgeRating} 
          onChange={setMarketKnowledgeRating} 
        />
      </div>

      <div>
        <label htmlFor="agent-review-comment" className="block text-sm font-medium text-gray-700 mb-1">Nhận xét chi tiết (Tuỳ chọn)</label>
        <textarea
          id="agent-review-comment"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          rows={3}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-red-500 focus:border-red-500"
          placeholder="Chia sẻ trải nghiệm làm việc của bạn với môi giới này..."
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full px-4 py-2.5 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 disabled:opacity-50 inline-flex items-center justify-center gap-2 transition-colors"
      >
        {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Gửi đánh giá đa chiều'}
      </button>
    </form>
  );
};

export default AgentReviewForm;
