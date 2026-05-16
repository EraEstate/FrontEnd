import { useEffect, useMemo, useState } from 'react';
import { Loader2, FileText } from 'lucide-react';
import { Link } from 'react-router-dom';
import { rentalContractAPI, type RentalContract } from '../api/rentalContract';
import { showError } from '../utils/toast';

const STATUS_OPTIONS = [
  { label: 'Tất cả', value: '' },
  { label: 'Nháp', value: 'DRAFT' },
  { label: 'Đang hiệu lực', value: 'ACTIVE' },
  { label: 'Đã chấm dứt', value: 'TERMINATED' },
  { label: 'Hết hạn', value: 'EXPIRED' },
];

const RentalContractsPage: React.FC = () => {
  const [contracts, setContracts] = useState<RentalContract[]>([]);
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(true);

  const loadContracts = async (statusFilter?: string) => {
    setLoading(true);
    try {
      const data = await rentalContractAPI.getMyContracts(statusFilter || undefined);
      setContracts(data);
    } catch {
      showError('Không thể tải danh sách hợp đồng');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadContracts(status);
  }, [status]);

  const groupedInfo = useMemo(() => {
    const active = contracts.filter((item) => item.status === 'ACTIVE').length;
    const draft = contracts.filter((item) => item.status === 'DRAFT').length;
    const terminated = contracts.filter((item) => item.status === 'TERMINATED').length;
    return { active, draft, terminated };
  }, [contracts]);

  return (
    <div className="min-h-screen bg-gray-50 pt-24">
      <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="mb-6 rounded-2xl bg-white p-6 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Hợp đồng thuê của tôi</h1>
              <p className="mt-1 text-sm text-gray-600">
                {contracts.length} hợp đồng • {groupedInfo.active} đang hiệu lực • {groupedInfo.draft} bản nháp
              </p>
            </div>
            <div className="flex gap-2">
              {STATUS_OPTIONS.map((option) => (
                <button
                  key={option.value || 'all'}
                  type="button"
                  onClick={() => setStatus(option.value)}
                  className={`rounded-lg px-3 py-2 text-xs font-medium ${
                    status === option.value
                      ? 'bg-red-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="h-7 w-7 animate-spin text-gray-500" />
          </div>
        ) : contracts.length === 0 ? (
          <div className="rounded-2xl bg-white p-10 text-center text-gray-600 shadow-sm">
            Chưa có hợp đồng nào.
          </div>
        ) : (
          <div className="space-y-3">
            {contracts.map((contract) => (
              <Link
                key={contract.id}
                to={`/rental-contracts/${contract.id}`}
                className="block rounded-2xl border border-gray-100 bg-white p-5 shadow-sm transition-colors hover:border-red-200"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-gray-900">
                      {contract.propertyTitle || `Property ${contract.propertyId}`}
                    </p>
                    <p className="mt-1 text-xs text-gray-600">
                      {new Date(contract.startDate).toLocaleDateString('vi-VN')} - {new Date(contract.endDate).toLocaleDateString('vi-VN')}
                    </p>
                    <p className="mt-1 text-xs text-gray-600">
                      Thuê: {contract.monthlyRent.toLocaleString('vi-VN')} VND/tháng
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="inline-flex items-center gap-1 rounded-lg bg-red-50 px-2.5 py-1 text-xs font-medium text-red-700">
                      <FileText className="h-3.5 w-3.5" />
                      {contract.status}
                    </span>
                    <p className="mt-2 text-xs text-gray-500">
                      Ký: {contract.signedByLandlord ? 'Landlord ✓' : 'Landlord ✗'} • {contract.signedByTenant ? 'Tenant ✓' : 'Tenant ✗'}
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default RentalContractsPage;
