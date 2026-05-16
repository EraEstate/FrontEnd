import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { rentalContractAPI, type RentalContract } from '../api/rentalContract';
import { showError, showSuccess } from '../utils/toast';

const RentalContractDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [contract, setContract] = useState<RentalContract | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [renewEndDate, setRenewEndDate] = useState('');
  const [renewMonthlyRent, setRenewMonthlyRent] = useState('');

  const loadContract = async () => {
    if (!id) return;
    setLoading(true);
    try {
      const data = await rentalContractAPI.getById(id);
      setContract(data);
      setRenewEndDate(data.endDate || '');
      setRenewMonthlyRent(String(data.monthlyRent || ''));
    } catch {
      showError('Không thể tải hợp đồng');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadContract();
  }, [id]);

  const signContract = async () => {
    if (!id) return;
    setBusy(true);
    try {
      const data = await rentalContractAPI.signContract(id);
      setContract(data);
      showSuccess('Đã ký hợp đồng');
    } catch {
      showError('Không thể ký hợp đồng');
    } finally {
      setBusy(false);
    }
  };

  const terminateContract = async () => {
    if (!id) return;
    setBusy(true);
    try {
      const data = await rentalContractAPI.terminateContract(id);
      setContract(data);
      showSuccess('Đã chấm dứt hợp đồng');
    } catch {
      showError('Không thể chấm dứt hợp đồng');
    } finally {
      setBusy(false);
    }
  };

  const renewContract = async (e: FormEvent) => {
    e.preventDefault();
    if (!id) return;
    setBusy(true);
    try {
      const data = await rentalContractAPI.renewContract(id, {
        endDate: renewEndDate || undefined,
        monthlyRent: renewMonthlyRent ? Number(renewMonthlyRent) : undefined,
      });
      setContract(data);
      showSuccess('Đã gia hạn hợp đồng');
    } catch {
      showError('Không thể gia hạn hợp đồng');
    } finally {
      setBusy(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-7 w-7 animate-spin text-gray-500" />
      </div>
    );
  }

  if (!contract) {
    return (
      <div className="min-h-screen bg-gray-50 pt-24">
        <div className="mx-auto w-full max-w-3xl rounded-2xl bg-white p-8 text-center shadow-sm">
          Không tìm thấy hợp đồng.
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-24">
      <div className="mx-auto w-full max-w-4xl px-4 sm:px-6 lg:px-8">
        <div className="mb-5">
          <Link to="/rental-contracts" className="text-sm font-medium text-red-600 hover:underline">
            ← Quay lại danh sách hợp đồng
          </Link>
        </div>

        <div className="rounded-2xl bg-white p-6 shadow-sm">
          <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{contract.propertyTitle || 'Rental Contract'}</h1>
              <p className="mt-1 text-sm text-gray-600">Mã hợp đồng: {contract.id}</p>
            </div>
            <span className="rounded-lg bg-red-50 px-3 py-1 text-sm font-medium text-red-700">
              {contract.status}
            </span>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="rounded-xl border border-gray-200 p-4 text-sm">
              <p><strong>Landlord:</strong> {contract.landlordName || contract.landlordId}</p>
              <p><strong>Tenant:</strong> {contract.tenantName || contract.tenantId}</p>
              <p><strong>Bắt đầu:</strong> {new Date(contract.startDate).toLocaleDateString('vi-VN')}</p>
              <p><strong>Kết thúc:</strong> {new Date(contract.endDate).toLocaleDateString('vi-VN')}</p>
            </div>
            <div className="rounded-xl border border-gray-200 p-4 text-sm">
              <p><strong>Tiền thuê:</strong> {contract.monthlyRent.toLocaleString('vi-VN')} VND/tháng</p>
              <p><strong>Tiền cọc:</strong> {(contract.deposit || 0).toLocaleString('vi-VN')} VND</p>
              <p><strong>Ký landlord:</strong> {contract.signedByLandlord ? 'Đã ký' : 'Chưa ký'}</p>
              <p><strong>Ký tenant:</strong> {contract.signedByTenant ? 'Đã ký' : 'Chưa ký'}</p>
            </div>
          </div>

          {contract.terms ? (
            <div className="mt-4 rounded-xl border border-gray-200 p-4 text-sm text-gray-700">
              <p className="mb-2 font-semibold text-gray-900">Điều khoản</p>
              <p className="whitespace-pre-wrap">{contract.terms}</p>
            </div>
          ) : null}

          <div className="mt-6 grid grid-cols-1 gap-3 md:grid-cols-3">
            <button
              type="button"
              onClick={signContract}
              disabled={busy}
              className="rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-60"
            >
              Ký hợp đồng
            </button>
            <button
              type="button"
              onClick={terminateContract}
              disabled={busy}
              className="rounded-lg bg-red-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-60"
            >
              Chấm dứt
            </button>
            <button
              type="button"
              onClick={() => void loadContract()}
              disabled={busy}
              className="rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-100 disabled:opacity-60"
            >
              Tải lại
            </button>
          </div>

          <form onSubmit={renewContract} className="mt-6 rounded-xl border border-gray-200 p-4">
            <p className="mb-3 text-sm font-semibold text-gray-900">Gia hạn hợp đồng</p>
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              <label className="text-sm">
                <span className="mb-1 block text-gray-700">Ngày kết thúc mới</span>
                <input
                  type="date"
                  value={renewEndDate}
                  onChange={(e) => setRenewEndDate(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2"
                />
              </label>
              <label className="text-sm">
                <span className="mb-1 block text-gray-700">Giá thuê mới (VND/tháng)</span>
                <input
                  type="number"
                  value={renewMonthlyRent}
                  onChange={(e) => setRenewMonthlyRent(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2"
                />
              </label>
            </div>
            <button
              type="submit"
              disabled={busy}
              className="mt-4 rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-60"
            >
              Lưu gia hạn
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default RentalContractDetailPage;
