import React, { useEffect, useMemo, useState } from 'react';
import { Heart, Star } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { locationAPI } from '../api/location';
import { neighborhoodReviewAPI, type NeighborhoodReview } from '../api/neighborhoodReview';
import NeighborhoodReviewForm from '../components/NeighborhoodReviewForm';
import { useAuthStore } from '../store/authStore';
import { showError, showSuccess } from '../utils/toast';

interface Province {
  id: string;
  name: string;
}

interface District {
  id: string;
  name: string;
}

const ratingRows = [
  { key: 'overall', label: 'Tong the' },
  { key: 'safety', label: 'An ninh' },
  { key: 'amenities', label: 'Tien ich' },
  { key: 'transport', label: 'Giao thong' },
];

const NeighborhoodReviewsPage: React.FC = () => {
  const { isAuthenticated } = useAuthStore();
  const navigate = useNavigate();

  const [provinceId, setProvinceId] = useState('');
  const [districtId, setDistrictId] = useState('');
  const [provinces, setProvinces] = useState<Province[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);
  const [reviews, setReviews] = useState<NeighborhoodReview[]>([]);
  const [average, setAverage] = useState<Record<string, number>>({});
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    locationAPI.getProvinces().then((data) => setProvinces(Array.isArray(data) ? data : [])).catch(() => setProvinces([]));
  }, []);

  useEffect(() => {
    if (!provinceId) {
      setDistricts([]);
      setDistrictId('');
      return;
    }
    locationAPI.getDistricts(provinceId).then((data) => setDistricts(Array.isArray(data) ? data : [])).catch(() => setDistricts([]));
  }, [provinceId]);

  const selectedProvince = useMemo(
    () => provinces.find((item) => item.id === provinceId)?.name ?? '',
    [provinceId, provinces]
  );
  const selectedDistrict = useMemo(
    () => districts.find((item) => item.id === districtId)?.name ?? '',
    [districtId, districts]
  );

  const loadData = async () => {
    if (!selectedProvince || !selectedDistrict) {
      setReviews([]);
      setAverage({});
      return;
    }
    try {
      const [pageData, avgData] = await Promise.all([
        neighborhoodReviewAPI.getReviews({ province: selectedProvince, district: selectedDistrict, page: 0, size: 20 }),
        neighborhoodReviewAPI.getAverageRatings(selectedProvince, selectedDistrict),
      ]);
      setReviews(pageData.content || []);
      setAverage(avgData || {});
    } catch {
      setReviews([]);
      setAverage({});
    }
  };

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedProvince, selectedDistrict]);

  const submitReview = async (payload: {
    overallRating: number;
    safetyRating: number;
    amenitiesRating: number;
    transportRating: number;
    comment: string;
  }) => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    if (!selectedProvince || !selectedDistrict) {
      showError('Vui long chon tinh/thanh va quan/huyen truoc.');
      return;
    }

    setSubmitting(true);
    try {
      await neighborhoodReviewAPI.createReview({
        province: selectedProvince,
        district: selectedDistrict,
        ...payload,
      });
      showSuccess('Da gui danh gia thanh cong.');
      setShowForm(false);
      await loadData();
    } catch {
      showError('Khong the gui danh gia. Vui long thu lai.');
    } finally {
      setSubmitting(false);
    }
  };

  const likeReview = async (id: number) => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    try {
      await neighborhoodReviewAPI.likeReview(id);
      await loadData();
    } catch {
      showError('Khong the like danh gia luc nay.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-12">
      <div className="mx-auto max-w-7xl px-4">
        <div className="rounded-2xl border border-red-200 bg-white p-6 shadow-sm">
          <h1 className="text-3xl font-semibold text-gray-900">Danh gia khu vuc</h1>
          <p className="mt-2 text-gray-600">Xem trai nghiem song thuc te tu cong dong nguoi mua va nguoi thue.</p>

          <div className="mt-5 grid gap-3 md:grid-cols-2">
            <select
              value={provinceId}
              onChange={(event) => setProvinceId(event.target.value)}
              className="rounded-full border border-red-200 px-4 py-2 text-sm font-semibold text-gray-700"
            >
              <option value="">Chon tinh/thanh</option>
              {provinces.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name}
                </option>
              ))}
            </select>
            <select
              value={districtId}
              onChange={(event) => setDistrictId(event.target.value)}
              className="rounded-full border border-red-200 px-4 py-2 text-sm font-semibold text-gray-700"
            >
              <option value="">Chon quan/huyen</option>
              {districts.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="mt-6 rounded-2xl border border-red-100 bg-white p-6 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-xl font-semibold text-gray-900">Tong quan khu vuc</h2>
            <button
              type="button"
              onClick={() => setShowForm(true)}
              className="rounded-full bg-red-600 px-5 py-2 text-sm font-bold text-white hover:bg-red-700"
            >
              Viet danh gia
            </button>
          </div>
          <div className="mt-4 grid gap-3">
            {ratingRows.map((row) => {
              const value = average[row.key] || 0;
              return (
                <div key={row.key}>
                  <div className="mb-1 flex items-center justify-between text-sm">
                    <p className="font-semibold text-gray-700">{row.label}</p>
                    <p className="flex items-center gap-1 font-bold text-gray-900">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      {value.toFixed(1)}
                    </p>
                  </div>
                  <div className="h-2 rounded-full bg-gray-100">
                    <div className="h-2 rounded-full bg-red-500" style={{ width: `${Math.min(100, (value / 5) * 100)}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="mt-6 space-y-4">
          {reviews.map((review) => (
            <article key={review.id} className="rounded-2xl border border-red-100 bg-white p-5 shadow-sm">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="font-semibold text-gray-900">{review.user?.fullName || 'Nguoi dung EraEstate'}</p>
                  <p className="text-xs text-gray-500" suppressHydrationWarning>{new Date(review.createdAt).toLocaleDateString('vi-VN')}</p>
                </div>
                <button suppressHydrationWarning
                  onClick={() => likeReview(review.id)}
                  className="inline-flex items-center gap-1 rounded-full border border-red-200 px-3 py-1 text-xs font-bold text-red-600 hover:bg-red-50"
                >
                  <Heart className="h-3 w-3" />
                  {review.likesCount || 0}
                </button>
              </div>
              <div className="mt-3 grid gap-2 sm:grid-cols-2">
                <p className="text-sm text-gray-700">Tong the: {review.overallRating}/5</p>
                <p className="text-sm text-gray-700">An ninh: {review.safetyRating}/5</p>
                <p className="text-sm text-gray-700">Tien ich: {review.amenitiesRating}/5</p>
                <p className="text-sm text-gray-700">Giao thong: {review.transportRating}/5</p>
              </div>
              <p className="mt-3 rounded-xl bg-gray-50 p-3 text-sm text-gray-700">{review.comment || 'Khong co binh luan.'}</p>
            </article>
          ))}
          {reviews.length === 0 && <p className="text-center text-sm text-gray-500">Chua co danh gia cho khu vuc nay.</p>}
        </div>
      </div>

      <NeighborhoodReviewForm isOpen={showForm} submitting={submitting} onClose={() => setShowForm(false)} onSubmit={submitReview} />
    </div>
  );
};

export default NeighborhoodReviewsPage;

