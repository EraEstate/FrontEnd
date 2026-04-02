import React, { useState, useEffect } from 'react';
import { MessageSquare, Eye, Loader2, Filter } from 'lucide-react';
import { propertyInquiryAPI } from '../../api/propertyInquiry';
import toast from '../../utils/toast';

const InquiryManagementPage: React.FC = () => {
  const [inquiries, setInquiries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [processingId, setProcessingId] = useState<string | null>(null);

  useEffect(() => {
    fetchInquiries();
  }, [currentPage, filterStatus]);

  const fetchInquiries = async () => {
    try {
      setLoading(true);
      const response = await propertyInquiryAPI.getAll({
        page: currentPage,
        size: 20,
        status: filterStatus !== 'ALL' ? (filterStatus as any) : undefined,
      });
      setInquiries(response.content || []);
      setTotalPages(response.totalPages || 1);
    } catch (error: any) {
      console.error('Failed to fetch inquiries:', error);
      toast.error('Không thể tải danh sách yêu cầu tư vấn');
    } finally {
      setLoading(false);
    }
  };

  const handleRespond = async (id: string) => {
    const response = prompt('Nhập phản hồi:');
    if (!response || response.trim() === '') return;

    try {
      setProcessingId(id);
      await propertyInquiryAPI.respondToInquiry(id, response);
      toast.success('Đã phản hồi yêu cầu thành công');
      fetchInquiries();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Không thể phản hồi');
    } finally {
      setProcessingId(null);
    }
  };

  const handleUpdateStatus = async (id: string, status: string) => {
    try {
      setProcessingId(id);
      await propertyInquiryAPI.updateInquiryStatus(id, status as any);
      toast.success('Đã cập nhật trạng thái');
      fetchInquiries();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Không thể cập nhật trạng thái');
    } finally {
      setProcessingId(null);
    }
  };

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      NEW: 'bg-blue-100 text-blue-800',
      IN_PROGRESS: 'bg-yellow-100 text-yellow-800',
      RESPONDED: 'bg-green-100 text-green-800',
      CLOSED: 'bg-gray-100 text-gray-800',
      SPAM: 'bg-red-100 text-red-800'
    };
    return styles[status] || styles.NEW;
  };

  if (loading && inquiries.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Quản Lý Yêu Cầu Tư Vấn</h1>
        <p className="text-sm text-gray-500 mt-1">Xem và quản lý tất cả yêu cầu tư vấn từ người dùng</p>
      </div>

      {/* Filter */}
      <div className="bg-white rounded-xl shadow-md p-4">
        <div className="flex items-center gap-4">
          <Filter className="w-5 h-5 text-gray-500" />
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="ALL">Tất cả</option>
            <option value="NEW">Mới</option>
            <option value="IN_PROGRESS">Đang xử lý</option>
            <option value="RESPONDED">Đã phản hồi</option>
            <option value="CLOSED">Đã đóng</option>
            <option value="SPAM">Spam</option>
          </select>
        </div>
      </div>

      {inquiries.length === 0 ? (
        <div className="bg-white rounded-xl shadow-md p-8 text-center">
          <MessageSquare className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">Không có yêu cầu tư vấn nào</p>
        </div>
      ) : (
        <div className="space-y-4">
          {inquiries.map((inquiry) => (
            <div key={inquiry.id} className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {inquiry.inquirerName}
                    </h3>
                    <span className={`px-2 py-1 text-xs font-medium rounded ${getStatusBadge(inquiry.status)}`}>
                      {inquiry.status}
                    </span>
                  </div>

                  <div className="text-sm text-gray-600 mb-2">
                    <p><strong>Email:</strong> {inquiry.inquirerEmail}</p>
                    {inquiry.inquirerPhone && <p><strong>Điện thoại:</strong> {inquiry.inquirerPhone}</p>}
                    <p><strong>Loại:</strong> {inquiry.inquiryType}</p>
                  </div>

                  <p className="text-gray-700 mb-3">{inquiry.message}</p>

                  {inquiry.agentResponse && (
                    <div className="bg-blue-50 border-l-4 border-blue-500 p-3 rounded mb-3">
                      <p className="text-sm font-medium text-blue-900 mb-1">Phản hồi:</p>
                      <p className="text-sm text-blue-800">{inquiry.agentResponse}</p>
                    </div>
                  )}

                  <div className="text-xs text-gray-500">
                    {new Date(inquiry.createdAt).toLocaleString('vi-VN')}
                    {inquiry.respondedAt && ` • Phản hồi: ${new Date(inquiry.respondedAt).toLocaleString('vi-VN')}`}
                  </div>
                </div>

                <div className="flex flex-col gap-2 ml-4">
                  <button
                    onClick={() => window.open(`/properties/${inquiry.propertyId}`, '_blank')}
                    className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                    title="Xem property"
                  >
                    <Eye className="w-5 h-5" />
                  </button>

                  {!inquiry.agentResponse && (
                    <button
                      onClick={() => handleRespond(inquiry.id)}
                      disabled={processingId === inquiry.id}
                      className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
                    >
                      {processingId === inquiry.id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <MessageSquare className="w-4 h-4" />
                      )}
                      Phản hồi
                    </button>
                  )}

                  {inquiry.status === 'NEW' && (
                    <button
                      onClick={() => handleUpdateStatus(inquiry.id, 'IN_PROGRESS')}
                      disabled={processingId === inquiry.id}
                      className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 disabled:opacity-50 transition-colors text-sm"
                    >
                      Đang xử lý
                    </button>
                  )}

                  {inquiry.status !== 'CLOSED' && (
                    <button
                      onClick={() => handleUpdateStatus(inquiry.id, 'CLOSED')}
                      disabled={processingId === inquiry.id}
                      className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 disabled:opacity-50 transition-colors text-sm"
                    >
                      Đóng
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={() => setCurrentPage(p => Math.max(0, p - 1))}
            disabled={currentPage === 0}
            className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
          >
            Trước
          </button>
          <span className="px-4 py-2 text-sm text-gray-600">
            Trang {currentPage + 1} / {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage(p => Math.min(totalPages - 1, p + 1))}
            disabled={currentPage >= totalPages - 1}
            className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
          >
            Sau
          </button>
        </div>
      )}
    </div>
  );
};

export default InquiryManagementPage;

