import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  MessageSquare, 
  Phone, 
  Mail, 
  Calendar, 
  User, 
  MapPin, 
  Reply, 
  Filter,
  Search,
  MoreVertical,
  Eye,
  Trash2,
  Clock,
  MessageCircle
} from 'lucide-react';
import { 
  useInquiriesByStatus, 
  useUpdateInquiryStatus, 
  useDeleteInquiry
} from '../api/hooks';const InquiryPage: React.FC = () => {
  const { t } = useTranslation();
  const [selectedInquiry, setSelectedInquiry] = useState<any>(null);
  const [response, setResponse] = useState('');
  const [statusFilter, setStatusFilter] = useState<'NEW' | 'IN_PROGRESS' | 'RESPONDED' | 'CLOSED' | 'SPAM'>('NEW');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(0);
  const [showFilters, setShowFilters] = useState(false);

  const { data: inquiriesData, loading, error, refetch } = useInquiriesByStatus(statusFilter, currentPage, 20);
  const { mutate: updateStatus, loading: updatingStatus } = useUpdateInquiryStatus();
  const { mutate: deleteInquiry, loading: deleting } = useDeleteInquiry();

  const inquiries = inquiriesData?.content || [];
  const totalPages = inquiriesData?.totalPages || 0;

  const handleStatusUpdate = async (inquiryId: string, newStatus: string, agentResponse?: string) => {
    try {
      await updateStatus({
        id: inquiryId,
        status: newStatus as any,
        agentResponse
      });
      refetch();
      if (selectedInquiry?.id === inquiryId) {
        setSelectedInquiry(null);
        setResponse('');
      }
    } catch (error) {
      toast.error('C?p nh?t tr?ng th�i th?t b?i');
    }
  };

  const handleDelete = async (inquiryId: string) => {
    if (window.confirm('Bạn có chắc muốn xóa yêu cầu này?')) {
      try {
        await deleteInquiry(inquiryId);
        refetch();
        if (selectedInquiry?.id === inquiryId) {
          setSelectedInquiry(null);
        }
      } catch (error) {
        toast.error('X�a y�u c?u th?t b?i');
      }
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'NEW':
        return 'bg-blue-100 text-blue-800';
      case 'IN_PROGRESS':
        return 'bg-yellow-100 text-yellow-800';
      case 'RESPONDED':
        return 'bg-green-100 text-green-800';
      case 'CLOSED':
        return 'bg-gray-100 text-gray-800';
      case 'SPAM':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'NEW':
        return t('common.new');
      case 'IN_PROGRESS':
        return t('myProperties.processing');
      case 'RESPONDED':
        return 'Đã phản hồi';
      case 'CLOSED':
        return t('inquiry.closed');
      case 'SPAM':
        return t('common.spam');
      default:
        return status;
    }
  };

  const getInquiryTypeText = (type: string) => {
    switch (type) {
      case 'GENERAL_INFO':
        return t('inquiry.generalInfo');
      case 'SCHEDULE_VIEWING':
        return 'Đặt lịch xem';
      case 'PRICE_NEGOTIATION':
        return 'Thương lượng giá';
      case 'FINANCING_INFO':
        return 'Thông tin tài chính';
      case 'PROPERTY_HISTORY':
        return 'Lịch sử BĐS';
      case 'NEIGHBORHOOD_INFO':
        return t('inquiry.areaInfo');
      case 'OTHER':
        return 'Khác';
      default:
        return type;
    }
  };

  const getContactMethodText = (method?: string) => {
    switch (method) {
      case 'EMAIL':
        return t('common.email');
      case 'PHONE':
        return 'Điện thoại';
      case 'SMS':
        return 'SMS';
      case 'WHATSAPP':
        return 'WhatsApp';
      case 'ZALO':
        return t('common.zalo');
      default:
        return t('common.notSelected');
    }
  };

  const filteredInquiries = inquiries.filter((inquiry: any) => {
    if (!searchTerm) return true;
    const searchLower = searchTerm.toLowerCase();
    return (
      inquiry.inquirerName?.toLowerCase().includes(searchLower) ||
      inquiry.inquirerEmail?.toLowerCase().includes(searchLower) ||
      inquiry.property?.title?.toLowerCase().includes(searchLower) ||
      inquiry.message?.toLowerCase().includes(searchLower)
    );
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 mt-10 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin h-8 w-8 text-red-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Đang tải danh sách yêu cầu...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 mt-10 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Lỗi tải dữ liệu</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={refetch}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            Thử lại
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 mt-10">
      <div className="w-full max-w-7xl mx-auto px-6 lg:px-12 py-8">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <MessageSquare className="h-8 w-8 text-red-600" />
              <h1 className="text-3xl font-bold text-gray-900">Quản lý yêu cầu liên hệ</h1>
            </div>
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Search className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Tìm kiếm yêu cầu..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                />
              </div>
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center space-x-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
              >
                <Filter className="h-4 w-4" />
                <span>Lọc</span>
              </button>
            </div>
          </div>
          <p className="text-gray-600">
            Quản lý và phản hồi các yêu cầu liên hệ từ khách hàng quan tâm đến bất động sản.
          </p>
        </div>

        {/* Filters */}
        {showFilters && (
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Trạng thái</label>
                <select
                  value={statusFilter}
                  onChange={(e) => {
                    setStatusFilter(e.target.value as any);
                    setCurrentPage(0);
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                >
                  <option value="NEW">Mới</option>
                  <option value="IN_PROGRESS">Đang xử lý</option>
                  <option value="RESPONDED">Đã phản hồi</option>
                  <option value="CLOSED">Đã đóng</option>
                  <option value="SPAM">Spam</option>
                </select>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Inquiries List */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm">
              <div className="p-6 border-b border-gray-200">
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-semibold text-gray-900">
                    Danh sách yêu cầu ({filteredInquiries.length})
                  </h2>
                  <span className="text-sm text-gray-500">
                    Trang {currentPage + 1} / {totalPages}
                  </span>
                </div>
              </div>

              <div className="divide-y divide-gray-200">
                {filteredInquiries.length ? (
                  filteredInquiries.map((inquiry: any) => (
                    <div
                      key={inquiry.id}
                      className={`p-6 hover:bg-gray-50 cursor-pointer transition-colors ${
                        selectedInquiry?.id === inquiry.id ? 'bg-red-50 border-r-4 border-red-600' : ''
                      }`}
                      onClick={() => setSelectedInquiry(inquiry)}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <h3 className="font-semibold text-gray-900">
                              {inquiry.property?.title || t('common.realEstate')}
                            </h3>
                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(inquiry.status)}`}>
                              {getStatusText(inquiry.status)}
                            </span>
                            <span className="px-2 py-1 text-xs font-medium rounded-full bg-purple-100 text-purple-800">
                              {getInquiryTypeText(inquiry.inquiryType)}
                            </span>
                          </div>

                          <div className="flex items-center space-x-4 text-sm text-gray-600 mb-2">
                            <div className="flex items-center space-x-1">
                              <User className="h-4 w-4" />
                              <span>{inquiry.inquirerName}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Calendar className="h-4 w-4" />
                              <span>
                                {new Date(inquiry.createdAt).toLocaleDateString('vi-VN')}
                              </span>
                            </div>
                          </div>

                          <p className="text-gray-700 text-sm line-clamp-2 mb-2">
                            {inquiry.message}
                          </p>

                          {inquiry.preferredContactTime && (
                            <div className="flex items-center space-x-2 text-sm text-gray-500">
                              <Clock className="h-4 w-4" />
                              <span>Thời gian liên hệ: {inquiry.preferredContactTime}</span>
                            </div>
                          )}
                        </div>

                        <div className="flex flex-col items-end space-y-2">
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedInquiry(inquiry);
                              }}
                              className="p-1 text-gray-400 hover:text-gray-600"
                              title={t('inquiry.viewDetails')}
                            >
                              <Eye className="h-4 w-4" />
                            </button>
                            <div className="relative">
                              <button
                                onClick={(e) => e.stopPropagation()}
                                className="p-1 text-gray-400 hover:text-gray-600"
                              >
                                <MoreVertical className="h-4 w-4" />
                              </button>
                              {/* Dropdown menu would go here */}
                            </div>
                          </div>

                          {inquiry.inquirerPhone && (
                            <div className="flex items-center space-x-1 text-sm text-gray-600">
                              <Phone className="h-4 w-4" />
                              <span>{inquiry.inquirerPhone}</span>
                            </div>
                          )}
                          {inquiry.inquirerEmail && (
                            <div className="flex items-center space-x-1 text-sm text-gray-600">
                              <Mail className="h-4 w-4" />
                              <span>{inquiry.inquirerEmail}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {inquiry.property && (
                        <div className="flex items-center space-x-2 text-sm text-gray-500">
                          <MapPin className="h-4 w-4" />
                          <span>{inquiry.property.address}, {inquiry.property.district}, {inquiry.property.city}</span>
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="p-12 text-center">
                    <MessageSquare className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      Không có yêu cầu nào
                    </h3>
                    <p className="text-gray-600">
                      {searchTerm ? 'Không tìm thấy yêu cầu phù hợp với từ khóa tìm kiếm.' : 'Chưa có yêu cầu nào trong trạng thái này.'}
                    </p>
                  </div>
                )}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="p-6 border-t border-gray-200">
                  <div className="flex justify-between items-center">
                    <button
                      onClick={() => setCurrentPage(prev => Math.max(0, prev - 1))}
                      disabled={currentPage === 0}
                      className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Trước
                    </button>
                    <div className="flex space-x-2">
                      {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                        const pageNum = Math.max(0, Math.min(totalPages - 1, currentPage - 2 + i));
                        return (
                          <button
                            key={pageNum}
                            onClick={() => setCurrentPage(pageNum)}
                            className={`px-3 py-2 rounded-lg ${
                              pageNum === currentPage
                                ? 'bg-red-600 text-white'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                          >
                            {pageNum + 1}
                          </button>
                        );
                      })}
                    </div>
                    <button
                      onClick={() => setCurrentPage(prev => Math.min(totalPages - 1, prev + 1))}
                      disabled={currentPage === totalPages - 1}
                      className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Sau
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Inquiry Details */}
          <div className="lg:col-span-1">
            {selectedInquiry ? (
              <div className="bg-white rounded-lg shadow-sm">
                <div className="p-6 border-b border-gray-200">
                  <div className="flex justify-between items-center">
                    <h2 className="text-xl font-semibold text-gray-900">Chi tiết yêu cầu</h2>
                    <div className="flex space-x-2">
                      {selectedInquiry.status === 'NEW' && (
                        <button
                          onClick={() => handleStatusUpdate(selectedInquiry.id, 'IN_PROGRESS')}
                          disabled={updatingStatus}
                          className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded text-sm hover:bg-yellow-200"
                        >
                          Bắt đầu xử lý
                        </button>
                      )}
                      {selectedInquiry.status === 'IN_PROGRESS' && (
                        <button
                          onClick={() => handleStatusUpdate(selectedInquiry.id, 'CLOSED')}
                          disabled={updatingStatus}
                          className="px-3 py-1 bg-gray-100 text-gray-800 rounded text-sm hover:bg-gray-200"
                        >
                          Đóng
                        </button>
                      )}
                      <button
                        onClick={() => handleDelete(selectedInquiry.id)}
                        disabled={deleting}
                        className="px-3 py-1 bg-red-100 text-red-800 rounded text-sm hover:bg-red-200"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>

                <div className="p-6 space-y-6">
                  {/* Status and Type */}
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(selectedInquiry.status)}`}>
                      {getStatusText(selectedInquiry.status)}
                    </span>
                    <span className="px-2 py-1 text-xs font-medium rounded-full bg-purple-100 text-purple-800">
                      {getInquiryTypeText(selectedInquiry.inquiryType)}
                    </span>
                  </div>

                  {/* Customer Info */}
                  <div>
                    <h3 className="font-medium text-gray-900 mb-3">Thông tin khách hàng</h3>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <User className="h-4 w-4 text-gray-400" />
                        <span className="text-sm">{selectedInquiry.inquirerName}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Mail className="h-4 w-4 text-gray-400" />
                        <span className="text-sm">{selectedInquiry.inquirerEmail}</span>
                      </div>
                      {selectedInquiry.inquirerPhone && (
                        <div className="flex items-center space-x-2">
                          <Phone className="h-4 w-4 text-gray-400" />
                          <span className="text-sm">{selectedInquiry.inquirerPhone}</span>
                        </div>
                      )}
                      {selectedInquiry.preferredContactMethod && (
                        <div className="flex items-center space-x-2">
                          <MessageCircle className="h-4 w-4 text-gray-400" />
                          <span className="text-sm">Liên hệ qua: {getContactMethodText(selectedInquiry.preferredContactMethod)}</span>
                        </div>
                      )}
                      {selectedInquiry.preferredContactTime && (
                        <div className="flex items-center space-x-2">
                          <Clock className="h-4 w-4 text-gray-400" />
                          <span className="text-sm">Thời gian: {selectedInquiry.preferredContactTime}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Property Info */}
                  {selectedInquiry.property && (
                    <div>
                      <h3 className="font-medium text-gray-900 mb-3">Bất động sản quan tâm</h3>
                      <div className="bg-gray-50 rounded-lg p-4">
                        <h4 className="font-medium text-gray-900 mb-2">
                          {selectedInquiry.property.title}
                        </h4>
                        <div className="flex items-center space-x-2 text-sm text-gray-600 mb-2">
                          <MapPin className="h-4 w-4" />
                          <span>{selectedInquiry.property.address}</span>
                        </div>
                        <div className="text-sm text-gray-600">
                          {selectedInquiry.property.city} • {selectedInquiry.property.district}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Agent Info */}
                  {selectedInquiry.agent && (
                    <div>
                      <h3 className="font-medium text-gray-900 mb-3">Nhân viên phụ trách</h3>
                      <div className="bg-blue-50 rounded-lg p-4">
                        <div className="flex items-center space-x-3">
                          <User className="h-8 w-8 text-blue-600" />
                          <div>
                            <p className="font-medium text-blue-900">{selectedInquiry.agent.fullName}</p>
                            <p className="text-sm text-blue-700">{selectedInquiry.agent.email}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Message */}
                  <div>
                    <h3 className="font-medium text-gray-900 mb-3">Nội dung yêu cầu</h3>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <p className="text-sm text-gray-700">{selectedInquiry.message}</p>
                    </div>
                  </div>

                  {/* Response */}
                  {(selectedInquiry.status === 'NEW' || selectedInquiry.status === 'IN_PROGRESS') && (
                    <div>
                      <h3 className="font-medium text-gray-900 mb-3">Phản hồi</h3>
                      <textarea
                        value={response}
                        onChange={(e) => setResponse(e.target.value)}
                        placeholder="Nhập phản hồi của bạn..."
                        rows={4}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none"
                      />
                      <button
                        onClick={() => handleStatusUpdate(selectedInquiry.id, 'RESPONDED', response)}
                        disabled={updatingStatus || !response.trim()}
                        className="mt-3 w-full bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                      >
                        {updatingStatus ? (
                          <>
                            <div className="animate-spin h-4 w-4 mr-2"></div>
                            Đang gửi...
                          </>
                        ) : (
                          <>
                            <Reply className="h-4 w-4 mr-2" />
                            Gửi phản hồi
                          </>
                        )}
                      </button>
                    </div>
                  )}

                  {/* Previous Response */}
                  {selectedInquiry.agentResponse && (
                    <div>
                      <h3 className="font-medium text-gray-900 mb-3">Phản hồi trước đó</h3>
                      <div className="bg-blue-50 rounded-lg p-4">
                        <p className="text-sm text-blue-800">{selectedInquiry.agentResponse}</p>
                        {selectedInquiry.respondedAt && (
                          <p className="text-xs text-blue-600 mt-2">
                            Phản hồi lúc: {new Date(selectedInquiry.respondedAt).toLocaleString('vi-VN')}
                          </p>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Timestamps */}
                  <div className="text-xs text-gray-500 space-y-1">
                    <p>Tạo: {new Date(selectedInquiry.createdAt).toLocaleString('vi-VN')}</p>
                    {selectedInquiry.updatedAt && (
                      <p>Cập nhật: {new Date(selectedInquiry.updatedAt).toLocaleString('vi-VN')}</p>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-sm p-12 text-center">
                <MessageSquare className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Chọn yêu cầu để xem chi tiết
                </h3>
                <p className="text-gray-600">
                  Nhấp vào một yêu cầu từ danh sách để xem chi tiết và quản lý.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default InquiryPage;