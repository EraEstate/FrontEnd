import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { maintenanceAPI } from '../api/maintenance';
import { propertyAPI } from '../api/property';
import { rentalContractAPI } from '../api/rentalContract';
import { useAuthStore } from '../store/authStore';
import { showError, showSuccess } from '../utils/toast';

interface PropertyOption {
  id: string;
  title: string;
}

const CreateMaintenanceRequestPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [properties, setProperties] = useState<PropertyOption[]>([]);
  const [submitting, setSubmitting] = useState(false);

  const [propertyId, setPropertyId] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('OTHER');
  const [priority, setPriority] = useState('MEDIUM');
  const [imagesText, setImagesText] = useState('');

  useEffect(() => {
    const loadProperties = async () => {
      const optionMap = new Map<string, string>();

      try {
        const data = await propertyAPI.getMyProperties(0, 100);
        (data?.content || []).forEach((item: any) => {
          if (item?.id) {
            optionMap.set(item.id, item.title || item.id);
          }
        });
      } catch {
        // optional
      }

      try {
        const contracts = await rentalContractAPI.getMyContracts('ACTIVE');
        contracts.forEach((contract) => {
          const canCreateForContract = !user || contract.tenantId === user.id || contract.landlordId === user.id;
          if (canCreateForContract) {
            optionMap.set(contract.propertyId, contract.propertyTitle || contract.propertyId);
          }
        });
      } catch {
        // optional
      }

      setProperties(
        Array.from(optionMap.entries()).map(([id, title]) => ({
          id,
          title,
        }))
      );
    };
    void loadProperties();
  }, [user]);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (!propertyId || !title.trim()) {
      showError('Vui lòng chọn bất động sản và nhập tiêu đề');
      return;
    }

    setSubmitting(true);
    try {
      const images = imagesText
        .split('\n')
        .map((line) => line.trim())
        .filter(Boolean);
      await maintenanceAPI.create({
        propertyId,
        title: title.trim(),
        description: description.trim() || undefined,
        category,
        priority,
        images,
      });
      showSuccess('Đã tạo yêu cầu bảo trì');
      navigate('/maintenance-requests');
    } catch (error: any) {
      showError(error?.response?.data?.message || 'Không thể tạo yêu cầu bảo trì');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-24">
      <div className="mx-auto w-full max-w-3xl px-4 sm:px-6 lg:px-8">
        <div className="rounded-2xl bg-white p-6 shadow-sm">
          <h1 className="text-2xl font-bold text-gray-900">Tạo yêu cầu bảo trì</h1>
          <p className="mt-1 text-sm text-gray-600">Gửi yêu cầu sửa chữa/bảo trì đến chủ nhà.</p>

          <form onSubmit={submit} className="mt-6 space-y-4">
            <label className="block text-sm">
              <span className="mb-1 block text-gray-700">Bất động sản</span>
              <select
                value={propertyId}
                onChange={(e) => setPropertyId(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2"
              >
                <option value="">Chọn bất động sản</option>
                {properties.map((property) => (
                  <option key={property.id} value={property.id}>
                    {property.title}
                  </option>
                ))}
              </select>
            </label>

            <label className="block text-sm">
              <span className="mb-1 block text-gray-700">Tiêu đề</span>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2"
                placeholder="Ví dụ: Rò rỉ nước nhà vệ sinh"
              />
            </label>

            <label className="block text-sm">
              <span className="mb-1 block text-gray-700">Mô tả</span>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                className="w-full rounded-lg border border-gray-300 px-3 py-2"
                placeholder="Mô tả chi tiết tình trạng, thời gian phát sinh..."
              />
            </label>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <label className="block text-sm">
                <span className="mb-1 block text-gray-700">Danh mục</span>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2"
                >
                  <option value="PLUMBING">Plumbing</option>
                  <option value="ELECTRICAL">Electrical</option>
                  <option value="STRUCTURAL">Structural</option>
                  <option value="APPLIANCE">Appliance</option>
                  <option value="OTHER">Other</option>
                </select>
              </label>
              <label className="block text-sm">
                <span className="mb-1 block text-gray-700">Ưu tiên</span>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2"
                >
                  <option value="LOW">Low</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HIGH">High</option>
                  <option value="URGENT">Urgent</option>
                </select>
              </label>
            </div>

            <label className="block text-sm">
              <span className="mb-1 block text-gray-700">Ảnh minh hoạ (mỗi dòng 1 URL)</span>
              <textarea
                value={imagesText}
                onChange={(e) => setImagesText(e.target.value)}
                rows={3}
                className="w-full rounded-lg border border-gray-300 px-3 py-2"
                placeholder="https://.../image1.jpg"
              />
            </label>

            <div className="flex gap-3 pt-2">
              <button
                type="submit"
                disabled={submitting}
                className="rounded-lg bg-red-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-60"
              >
                {submitting ? 'Đang gửi...' : 'Tạo yêu cầu'}
              </button>
              <button
                type="button"
                onClick={() => navigate('/maintenance-requests')}
                className="rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-100"
              >
                Huỷ
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateMaintenanceRequestPage;
