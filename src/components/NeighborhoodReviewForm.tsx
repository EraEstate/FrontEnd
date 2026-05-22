import React, { useState } from 'react';
import { Star, X } from 'lucide-react';

type RatingField = 'overallRating' | 'safetyRating' | 'amenitiesRating' | 'transportRating';

interface FormValue {
  overallRating: number;
  safetyRating: number;
  amenitiesRating: number;
  transportRating: number;
  comment: string;
}

interface NeighborhoodReviewFormProps {
  isOpen: boolean;
  submitting?: boolean;
  onClose: () => void;
  onSubmit: (value: FormValue) => void;
}

const ratingRows: Array<{ key: RatingField; label: string }> = [
  { key: 'overallRating', label: 'Tong the' },
  { key: 'safetyRating', label: 'An ninh' },
  { key: 'amenitiesRating', label: 'Tien ich' },
  { key: 'transportRating', label: 'Giao thong' },
];

const NeighborhoodReviewForm: React.FC<NeighborhoodReviewFormProps> = ({
  isOpen,
  submitting = false,
  onClose,
  onSubmit,
}) => {
  const [form, setForm] = useState<FormValue>({
    overallRating: 5,
    safetyRating: 5,
    amenitiesRating: 5,
    transportRating: 5,
    comment: '',
  });

  const remaining = 1000 - form.comment.length;

  if (!isOpen) {
    return null;
  }

  const setRating = (field: RatingField, value: number) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-2xl rounded-2xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b px-6 py-4">
          <h3 className="text-xl font-semibold text-gray-900">Viet danh gia khu vuc</h3>
          <button onClick={onClose} className="rounded-full p-2 text-gray-500 hover:bg-gray-100">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-5 px-6 py-5">
          {ratingRows.map((row) => (
            <div key={row.key} className="flex flex-wrap items-center justify-between gap-3">
              <p className="font-semibold text-gray-800">{row.label}</p>
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(row.key, star)}
                    className="rounded-full p-1 transition hover:bg-red-50"
                  >
                    <Star
                      className={`h-6 w-6 ${
                        star <= form[row.key] ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>
          ))}

          <div>
            <textarea
              value={form.comment}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, comment: event.target.value.slice(0, 1000) }))
              }
              rows={5}
              className="w-full rounded-2xl border border-red-100 px-4 py-3 text-sm outline-none focus:border-red-500"
              placeholder="Chia se trai nghiem song tai khu vuc nay..."
            />
            <p className="mt-2 text-right text-xs text-gray-500">{remaining} ky tu con lai</p>
          </div>
        </div>

        <div className="flex justify-end gap-3 border-t px-6 py-4">
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-gray-300 px-5 py-2 font-semibold text-gray-700 hover:bg-gray-50"
          >
            Huy
          </button>
          <button
            type="button"
            disabled={submitting}
            onClick={() => onSubmit(form)}
            className="rounded-full bg-red-600 px-5 py-2 font-semibold text-white hover:bg-red-700 disabled:opacity-60"
          >
            {submitting ? 'Dang gui...' : 'Gui danh gia'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default NeighborhoodReviewForm;
