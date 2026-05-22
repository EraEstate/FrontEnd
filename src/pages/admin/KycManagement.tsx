import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  Search, Shield, CheckCircle, XCircle, Eye, 
  Clock, Image as ImageIcon, Loader2
} from 'lucide-react';
import { adminKycAPI } from '../../api/adminKyc';
import toast from '../../utils/toast';
import { getImageUrl } from '../../utils/imageUtils';

interface KycRecord {
  id: number;
  userId: string;
  cccdNumber: string;
  fullName: string;
  dateOfBirth: string;
  gender: string;
  nationality: string;
  placeOfOrigin: string;
  placeOfResidence: string;
  expiryDate: string;
  frontImageUrl: string;
  rawOcrText: string;
  status: 'PENDING' | 'VERIFIED' | 'REJECTED';
  createdAt: string;
}

const KycManagement: React.FC = () => {
  const { t } = useTranslation();
  const [kycRecords, setKycRecords] = useState<KycRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [activeTab, setActiveTab] = useState<'PENDING' | 'VERIFIED' | 'REJECTED'>('PENDING');
  
  const [viewModal, setViewModal] = useState<KycRecord | null>(null);
  const [actionLoading, setActionLoading] = useState<number | null>(null);

  useEffect(() => {
    fetchKyc();
  }, [currentPage, activeTab]);

  const fetchKyc = async () => {
    try {
      setLoading(true);
      const res = await adminKycAPI.getAll(currentPage, 20);
      const content = res.content || [];
      // Filter by active tab (since backend gets all, we can filter locally or add status param later)
      // For now, local filter:
      const filtered = content.filter((k: KycRecord) => k.status === activeTab);
      setKycRecords(filtered);
      setTotalPages(res.totalPages || 1);
    } catch (error) {
      // toast already shown below
      toast.error('Lỗi khi tải danh sách KYC');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id: number) => {
    if (!window.confirm('Xác nhận duyệt hồ sơ này?')) return;
    try {
      setActionLoading(id);
      await adminKycAPI.approve(id);
      toast.success('Đã duyệt hồ sơ KYC');
      setViewModal(null);
      fetchKyc();
    } catch (error) {
      toast.error('Lỗi khi duyệt');
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (id: number) => {
    if (!window.confirm('Từ chối hồ sơ này?')) return;
    try {
      setActionLoading(id);
      await adminKycAPI.reject(id);
      toast.success('Đã từ chối hồ sơ');
      setViewModal(null);
      fetchKyc();
    } catch (error) {
      toast.error('Lỗi khi từ chối');
    } finally {
      setActionLoading(null);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'VERIFIED':
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-700 text-xs font-semibold"><CheckCircle className="w-3.5 h-3.5" /> Đã duyệt</span>;
      case 'REJECTED':
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-red-100 text-red-700 text-xs font-semibold"><XCircle className="w-3.5 h-3.5" /> Từ chối</span>;
      default:
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-700 text-xs font-semibold"><Clock className="w-3.5 h-3.5" /> Chờ duyệt</span>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 flex items-center gap-2">
            <Shield className="w-6 h-6 text-blue-600" />
            Quản lý duyệt KYC
          </h1>
          <p className="text-sm text-gray-500 mt-1">Duyệt và kiểm tra hồ sơ xác minh danh tính người dùng</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <div className="border-b border-gray-200">
          <nav className="flex -mb-px">
            {['PENDING', 'VERIFIED', 'REJECTED'].map((status) => (
              <button
                key={status}
                onClick={() => { setActiveTab(status as any); setCurrentPage(0); }}
                className={`flex-1 px-6 py-4 text-center font-medium border-b-2 transition-colors ${
                  activeTab === status
                    ? 'border-blue-600 text-blue-600 bg-blue-50'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {status === 'PENDING' ? 'Chờ duyệt' : status === 'VERIFIED' ? 'Đã duyệt' : 'Đã từ chối'}
              </button>
            ))}
          </nav>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Họ tên</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Số CCCD</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Ngày sinh</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Trạng thái</th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {loading ? (
                <tr><td colSpan={5} className="px-6 py-12 text-center text-gray-500">Đang tải…</td></tr>
              ) : kycRecords.length === 0 ? (
                <tr><td colSpan={5} className="px-6 py-12 text-center text-gray-500">Không có hồ sơ nào</td></tr>
              ) : (
                kycRecords.map((kyc) => (
                  <tr key={kyc.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 font-medium text-gray-900">{kyc.fullName}</td>
                    <td className="px-6 py-4 text-gray-600">{kyc.cccdNumber}</td>
                    <td className="px-6 py-4 text-gray-600">{kyc.dateOfBirth}</td>
                    <td className="px-6 py-4">{getStatusBadge(kyc.status)}</td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => setViewModal(kyc)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors inline-flex items-center gap-1"
                        title="Xem chi tiết"
                      >
                        <Eye className="w-4 h-4" /> Chi tiết
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal View */}
      {viewModal && (
        <div className="fixed inset-0 bg-gray-950 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-semibold text-gray-900">Chi tiết hồ sơ KYC</h2>
                <button onClick={() => setViewModal(null)} className="text-gray-400 hover:text-gray-600">
                  <XCircle className="w-6 h-6" />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                  <p className="text-sm text-gray-500">Họ và tên</p>
                  <p className="font-medium text-lg">{viewModal.fullName}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Số CCCD</p>
                  <p className="font-medium text-lg">{viewModal.cccdNumber}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Ngày sinh</p>
                  <p className="font-medium">{viewModal.dateOfBirth}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Giới tính</p>
                  <p className="font-medium">{viewModal.gender}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-sm text-gray-500">Quê quán</p>
                  <p className="font-medium">{viewModal.placeOfOrigin}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-sm text-gray-500">Nơi thường trú</p>
                  <p className="font-medium">{viewModal.placeOfResidence}</p>
                </div>
              </div>

              <div className="mb-6">
                <p className="text-sm text-gray-500 mb-2">Ảnh CCCD Mặt Trước</p>
                {viewModal.frontImageUrl ? (
                  <img src={getImageUrl(viewModal.frontImageUrl)} alt="CCCD Front" className="w-full max-h-64 object-contain bg-gray-100 rounded-lg" />
                ) : (
                  <div className="w-full h-32 bg-gray-100 rounded-lg flex items-center justify-center text-gray-400">
                    <ImageIcon className="w-8 h-8 mr-2" /> Không có ảnh tải lên (Client-side only)
                  </div>
                )}
              </div>

              {viewModal.status === 'PENDING' && (
                <div className="flex items-center gap-3 pt-4 border-t border-gray-200">
                  <button
                    onClick={() => handleReject(viewModal.id)}
                    disabled={actionLoading !== null}
                    className="flex-1 px-4 py-2 border border-red-200 text-red-600 hover:bg-red-50 rounded-lg font-medium transition-colors"
                  >
                    {actionLoading === viewModal.id ? 'Đang xử lý...' : 'Từ chối'}
                  </button>
                  <button
                    onClick={() => handleApprove(viewModal.id)}
                    disabled={actionLoading !== null}
                    className="flex-1 px-4 py-2 bg-green-600 text-white hover:bg-green-700 rounded-lg font-medium transition-colors"
                  >
                    {actionLoading === viewModal.id ? 'Đang xử lý...' : 'Duyệt hợp lệ'}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default KycManagement;
