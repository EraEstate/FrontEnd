import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Loader2, Wrench } from 'lucide-react';
import { maintenanceAPI, type MaintenanceRequest } from '../api/maintenance';
import { useAuthStore } from '../store/authStore';
import { showError, showSuccess } from '../utils/toast';

const STATUS_OPTIONS = ['OPEN', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'];

const MaintenanceRequestsPage: React.FC = () => {
  const { user } = useAuthStore();
  const [requests, setRequests] = useState<MaintenanceRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);

  const loadRequests = async () => {
    setLoading(true);
    try {
      const data = await maintenanceAPI.getMyRequests();
      setRequests(data);
    } catch {
      showError('Không thể tải yêu cầu bảo trì');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadRequests();
  }, []);

  const updateStatus = async (request: MaintenanceRequest, status: string) => {
    setBusyId(request.id);
    try {
      const updated = await maintenanceAPI.updateStatus(request.id, { status });
      setRequests((prev) => prev.map((item) => (item.id === request.id ? updated : item)));
      showSuccess('Đã cập nhật trạng thái');
    } catch (error: any) {
      showError(error?.response?.data?.message || 'Không thể cập nhật trạng thái');
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-24">
      <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="mb-6 rounded-2xl bg-white p-6 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <Wrench className="h-7 w-7 text-amber-600" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Yêu cầu bảo trì</h1>
                <p className="text-sm text-gray-600">Theo dõi và xử lý các yêu cầu sửa chữa của tenant/landlord.</p>
              </div>
            </div>
            <Link
              to="/maintenance-requests/new"
              className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
            >
              Tạo yêu cầu
            </Link>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="h-7 w-7 animate-spin text-gray-500" />
          </div>
        ) : requests.length === 0 ? (
          <div className="rounded-2xl bg-white p-10 text-center text-gray-600 shadow-sm">
            Chưa có yêu cầu bảo trì nào.
          </div>
        ) : (
          <div className="space-y-3">
            {requests.map((request) => {
              const canManage = user?.role === 'ADMIN' || user?.id === request.landlordId;
              return (
                <div key={request.id} className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-gray-900">{request.title}</p>
                      <p className="mt-1 text-xs text-gray-600">
                        BĐS: {request.propertyTitle || request.propertyId} • Category: {request.category} • Priority: {request.priority}
                      </p>
                      <p className="mt-1 text-xs text-gray-600">
                        Tenant: {request.tenantName || request.tenantId} • Landlord: {request.landlordName || request.landlordId}
                      </p>
                      {request.description ? (
                        <p className="mt-2 text-sm text-gray-700">{request.description}</p>
                      ) : null}
                    </div>
                    <div className="text-right">
                      <span className="rounded-lg bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-700">
                        {request.status}
                      </span>
                      <p className="mt-2 text-xs text-gray-500">
                        {new Date(request.createdAt).toLocaleString('vi-VN')}
                      </p>
                    </div>
                  </div>

                  {canManage ? (
                    <div className="mt-4 flex flex-wrap items-center gap-2">
                      {STATUS_OPTIONS.map((status) => (
                        <button
                          key={status}
                          type="button"
                          disabled={busyId === request.id || request.status === status}
                          onClick={() => updateStatus(request, status)}
                          className={`rounded-lg px-3 py-1.5 text-xs font-medium ${
                            request.status === status
                              ? 'bg-gray-900 text-white'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          } disabled:opacity-60`}
                        >
                          {status}
                        </button>
                      ))}
                    </div>
                  ) : null}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default MaintenanceRequestsPage;
