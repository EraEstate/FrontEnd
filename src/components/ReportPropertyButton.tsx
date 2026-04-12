import React, { useState } from 'react';
import { Flag, X, AlertTriangle, Loader2, CheckCircle } from 'lucide-react';
import { reportAPI, type ReportRequest } from '../api/report';
import { showSuccess, showError } from '../utils/toast';

const REASONS: { value: ReportRequest['reason']; label: string; desc: string }[] = [
  { value: 'SCAM', label: 'Lừa đảo', desc: 'Tin đăng có dấu hiệu lừa đảo, chiếm đoạt tiền' },
  { value: 'FAKE_INFO', label: 'Thông tin sai', desc: 'Ảnh hoặc mô tả không đúng thực tế' },
  { value: 'FAKE_PRICE', label: 'Giá ảo', desc: 'Giá đăng không phù hợp, gây hiểu lầm' },
  { value: 'DUPLICATE', label: 'Tin trùng lặp', desc: 'Bài đăng bị lặp lại nhiều lần' },
  { value: 'INAPPROPRIATE', label: 'Không phù hợp', desc: 'Nội dung vi phạm quy định cộng đồng' },
  { value: 'SPAM', label: 'Spam', desc: 'Tin rác, quảng cáo không liên quan' },
  { value: 'OTHER', label: 'Khác', desc: 'Lý do khác không có trong danh sách' },
];

interface ReportPropertyButtonProps {
  propertyId: string;
  className?: string;
}

const ReportPropertyButton: React.FC<ReportPropertyButtonProps> = ({ propertyId, className }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedReason, setSelectedReason] = useState<ReportRequest['reason'] | ''>('');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async () => {
    if (!selectedReason) {
      showError('Vui lòng chọn lý do báo cáo');
      return;
    }
    try {
      setSubmitting(true);
      await reportAPI.create({
        targetId: propertyId,
        targetType: 'PROPERTY',
        reason: selectedReason,
        description,
      });
      setSubmitted(true);
      showSuccess('Đã gửi báo cáo thành công. Cảm ơn bạn!');
      setTimeout(() => {
        setIsOpen(false);
        setSubmitted(false);
        setSelectedReason('');
        setDescription('');
      }, 2000);
    } catch (err: any) {
      showError(err?.response?.data?.error || 'Không thể gửi báo cáo');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(true)}
        className={`inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-red-600 transition-colors ${className || ''}`}
      >
        <Flag className="w-4 h-4" />
        Báo cáo vi phạm
      </button>

      {/* Modal Overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => !submitting && setIsOpen(false)}
          />

          {/* Modal */}
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between p-5 border-b border-gray-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-red-50 flex items-center justify-center">
                  <AlertTriangle className="w-5 h-5 text-red-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Báo cáo vi phạm</h3>
              </div>
              <button
                onClick={() => !submitting && setIsOpen(false)}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {submitted ? (
              /* Success state */
              <div className="p-8 text-center">
                <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-emerald-50 flex items-center justify-center">
                  <CheckCircle className="w-8 h-8 text-emerald-500" />
                </div>
                <h4 className="text-lg font-semibold text-gray-900">Đã gửi báo cáo</h4>
                <p className="text-sm text-gray-500 mt-1">Chúng tôi sẽ xem xét trong thời gian sớm nhất</p>
              </div>
            ) : (
              /* Form */
              <div className="p-5">
                <p className="text-sm text-gray-600 mb-4">
                  Chọn lý do bạn muốn báo cáo tin đăng này:
                </p>

                {/* Reason Options */}
                <div className="space-y-2 mb-5">
                  {REASONS.map((r) => (
                    <label
                      key={r.value}
                      className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                        selectedReason === r.value
                          ? 'border-red-300 bg-red-50/60'
                          : 'border-gray-100 hover:border-gray-200 hover:bg-gray-50'
                      }`}
                    >
                      <input
                        type="radio"
                        name="report-reason"
                        value={r.value}
                        checked={selectedReason === r.value}
                        onChange={() => setSelectedReason(r.value)}
                        className="mt-0.5 accent-red-600"
                      />
                      <div>
                        <p className="text-sm font-medium text-gray-900">{r.label}</p>
                        <p className="text-xs text-gray-500">{r.desc}</p>
                      </div>
                    </label>
                  ))}
                </div>

                {/* Description */}
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Mô tả thêm chi tiết (không bắt buộc)..."
                  rows={3}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-red-500/20 focus:border-red-400 outline-none resize-none transition-colors"
                />

                {/* Actions */}
                <div className="flex items-center gap-3 mt-5">
                  <button
                    onClick={() => setIsOpen(false)}
                    disabled={submitting}
                    className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
                  >
                    Hủy
                  </button>
                  <button
                    onClick={handleSubmit}
                    disabled={submitting || !selectedReason}
                    className="flex-1 px-4 py-2.5 rounded-xl bg-red-600 text-white text-sm font-medium hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {submitting ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Flag className="w-4 h-4" />
                    )}
                    Gửi báo cáo
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default ReportPropertyButton;
