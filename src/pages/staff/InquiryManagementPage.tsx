import React, { useState, useEffect, useCallback } from 'react';
import { 
  MessageSquare, Eye, Loader2, Search, X, 
  Send, User, Mail, Phone, Clock, Tag, RefreshCw
} from 'lucide-react';
import { propertyInquiryAPI } from '../../api/propertyInquiry';
import { relativeTime } from '../../utils/relativeTime';
import { useDebounce } from '../../hooks/useDebounce';
import toast from '../../utils/toast';

// ─── Label maps ───
const statusLabels: Record<string, string> = {
  NEW: 'Mới', IN_PROGRESS: 'Đang xử lý', RESPONDED: 'Đã phản hồi', CLOSED: 'Đã đóng', SPAM: 'Spam',
};
const statusStyles: Record<string, string> = {
  NEW: 'bg-blue-100 text-blue-700', IN_PROGRESS: 'bg-amber-100 text-amber-700',
  RESPONDED: 'bg-emerald-100 text-emerald-700', CLOSED: 'bg-gray-100 text-gray-600', SPAM: 'bg-red-100 text-red-700',
};
const typeLabels: Record<string, string> = {
  GENERAL_INFO: 'Thông tin chung', SCHEDULE_VIEWING: 'Đặt lịch xem nhà',
  PRICE_NEGOTIATION: 'Thương lượng giá', FINANCING_INFO: 'Tài chính',
  PROPERTY_HISTORY: 'Lịch sử BĐS', NEIGHBORHOOD_INFO: 'Khu vực lân cận', OTHER: 'Khác',
};

// ─── Response Modal ───
const ResponseModal: React.FC<{
  open: boolean; onClose: () => void; onSubmit: (response: string) => void; loading: boolean; inquiry: any;
}> = ({ open, onClose, onSubmit, loading, inquiry }) => {
  const [responseText, setResponseText] = useState('');
  useEffect(() => { if (!open) setResponseText(''); }, [open]);
  if (!open || !inquiry) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <button
        type="button"
        aria-label="Close response modal"
        className="absolute inset-0 bg-gray-950/40 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4 overflow-hidden">
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Phản hồi yêu cầu</h3>
            <p className="text-sm text-gray-500 mt-0.5">{inquiry.inquirerName}</p>
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-gray-100 rounded-lg"><X className="w-5 h-5 text-gray-500" /></button>
        </div>
        <div className="p-5 space-y-4">
          <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
            <p className="text-xs font-medium text-gray-500 mb-1.5 flex items-center gap-1"><MessageSquare className="w-3 h-3" /> Nội dung yêu cầu:</p>
            <p className="text-sm text-gray-700">{inquiry.message}</p>
          </div>
          <div>
            <label htmlFor="staff-inquiry-response" className="text-sm font-medium text-gray-700 mb-1.5 block">Nội dung phản hồi:</label>
            <textarea id="staff-inquiry-response" value={responseText} onChange={e => setResponseText(e.target.value)} placeholder="Nhập phản hồi cho khách hàng..."
              rows={5} className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none" />
          </div>
        </div>
        <div className="flex gap-3 p-5 border-t border-gray-100 bg-gray-50">
          <button onClick={onClose} className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-100 text-sm font-medium">Hủy</button>
          <button onClick={() => { if (!responseText.trim()) { toast.error('Vui lòng nhập nội dung phản hồi'); return; } onSubmit(responseText); }}
            disabled={loading || !responseText.trim()}
            className="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 text-sm font-medium flex items-center justify-center gap-2">
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />} Gửi phản hồi
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Main ───
const InquiryManagementPage: React.FC = () => {
  const [inquiries, setInquiries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearch = useDebounce(searchQuery, 300);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [responseModal, setResponseModal] = useState<{ open: boolean; inquiry: any }>({ open: false, inquiry: null });
  const [statusCounts, setStatusCounts] = useState<Record<string, number>>({});

  const fetchInquiries = useCallback(async () => {
    try {
      setLoading(true);
      const response = await propertyInquiryAPI.getAll({
        page: currentPage, size: 20,
        status: filterStatus !== 'ALL' ? (filterStatus as any) : undefined,
      });
      setInquiries(response.content || []);
      setTotalPages(response.totalPages || 1);
    } catch {
      toast.error('Không thể tải danh sách yêu cầu tư vấn');
    } finally {
      setLoading(false);
    }
  }, [currentPage, filterStatus]);

  // Fetch counts per status
  const fetchStatusCounts = useCallback(async () => {
    const statuses = ['NEW', 'IN_PROGRESS', 'RESPONDED', 'CLOSED', 'SPAM'];
    try {
      const results = await Promise.all(
        statuses.map(async (s) => {
          try {
            const res = await propertyInquiryAPI.getAll({ page: 0, size: 1, status: s as any });
            return [s, res.totalElements || 0] as [string, number];
          } catch { return [s, 0] as [string, number]; }
        })
      );
      setStatusCounts(Object.fromEntries(results));
    } catch { /* silent */ }
  }, []);

  useEffect(() => { fetchInquiries(); }, [fetchInquiries]);
  useEffect(() => { fetchStatusCounts(); }, [fetchStatusCounts]);

  const handleRespondSubmit = async (responseText: string) => {
    const id = responseModal.inquiry?.id;
    if (!id) return;
    // Optimistic: update UI immediately
    const backup = [...inquiries];
    setInquiries(prev => prev.map(inq => inq.id === id ? { ...inq, agentResponse: responseText, status: 'RESPONDED', respondedAt: new Date().toISOString() } : inq));

    try {
      setProcessingId(id);
      await propertyInquiryAPI.respondToInquiry(id, responseText);
      toast.success('Đã gửi phản hồi thành công');
      setResponseModal({ open: false, inquiry: null });
      fetchStatusCounts();
    } catch (error: any) {
      setInquiries(backup);
      toast.error(error.response?.data?.message || 'Không thể gửi phản hồi');
    } finally {
      setProcessingId(null);
    }
  };

  const handleUpdateStatus = async (id: string, status: string) => {
    // Optimistic
    const backup = [...inquiries];
    setInquiries(prev => prev.map(inq => inq.id === id ? { ...inq, status } : inq));

    try {
      setProcessingId(id);
      await propertyInquiryAPI.updateInquiryStatus(id, status as any);
      toast.success(`Đã cập nhật: ${statusLabels[status] || status}`);
      fetchStatusCounts();
    } catch (error: any) {
      setInquiries(backup);
      toast.error(error.response?.data?.message || 'Không thể cập nhật trạng thái');
    } finally {
      setProcessingId(null);
    }
  };

  // ── Filter ──
  const filtered = inquiries.filter(inq => {
    if (!debouncedSearch) return true;
    const q = debouncedSearch.toLowerCase();
    return inq.inquirerName?.toLowerCase().includes(q) || inq.inquirerEmail?.toLowerCase().includes(q) ||
      inq.inquirerPhone?.includes(q) || inq.message?.toLowerCase().includes(q);
  });

  const statusTabs = ['ALL', 'NEW', 'IN_PROGRESS', 'RESPONDED', 'CLOSED', 'SPAM'];
  const totalAll = Object.values(statusCounts).reduce((a, b) => a + b, 0);

  // Skeleton
  if (loading && inquiries.length === 0) {
    return (
      <div className="space-y-4">
        <div className="h-8 w-64 bg-gray-200 rounded animate-pulse" />
        <div className="flex gap-2">{[1,2,3,4].map(slot => <div key={`inquiry-tab-skeleton-${slot}`} className="h-10 w-24 bg-gray-200 rounded-xl animate-pulse" />)}</div>
        {[1,2,3].map(slot => (
          <div key={`inquiry-card-skeleton-${slot}`} className="bg-white rounded-2xl p-6 animate-pulse"><div className="space-y-3"><div className="h-5 bg-gray-200 rounded w-2/3" /><div className="h-4 bg-gray-200 rounded w-full" /></div></div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Quản lý yêu cầu tư vấn</h1>
          <p className="text-sm text-gray-500 mt-1">Xem và phản hồi yêu cầu tư vấn từ khách hàng</p>
        </div>
        <button onClick={() => { fetchInquiries(); fetchStatusCounts(); }} className="p-2 text-gray-400 hover:bg-gray-100 rounded-lg" title="Làm mới">
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
          placeholder="Tìm theo tên, email, SĐT..."
          className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
      </div>

      {/* Tabs with counts */}
      <div className="flex flex-wrap gap-2">
        {statusTabs.map(s => {
          const count = s === 'ALL' ? totalAll : (statusCounts[s] || 0);
          return (
            <button key={s} onClick={() => { setFilterStatus(s); setCurrentPage(0); }}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all flex items-center gap-2 ${
                filterStatus === s ? 'bg-gray-900 text-white shadow-sm' : 'bg-white text-gray-600 border border-gray-200 hover:border-gray-300'
              }`}>
              {s === 'ALL' ? 'Tất cả' : statusLabels[s] || s}
              {count > 0 && (
                <span className={`px-1.5 py-0.5 text-xs font-bold rounded-full min-w-[18px] text-center ${
                  filterStatus === s ? 'bg-white/20 text-white' : 'bg-gray-200 text-gray-600'
                }`}>{count}</span>
              )}
            </button>
          );
        })}
      </div>

      {/* List */}
      {filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-10 text-center">
          <MessageSquare className="w-14 h-14 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-600 font-medium">Không có yêu cầu tư vấn nào</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((inquiry) => {
            const isProcessing = processingId === inquiry.id;
            return (
              <div key={inquiry.id} className="bg-white rounded-2xl border border-gray-100 p-5 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-2">
                      <h3 className="text-base font-semibold text-gray-900">{inquiry.inquirerName}</h3>
                      <span className={`px-2 py-0.5 text-xs font-medium rounded-lg ${statusStyles[inquiry.status] || statusStyles.NEW}`}>
                        {statusLabels[inquiry.status] || inquiry.status}
                      </span>
                      <span className="px-2 py-0.5 text-xs font-medium bg-gray-100 text-gray-600 rounded-lg flex items-center gap-1">
                        <Tag className="w-3 h-3" />{typeLabels[inquiry.inquiryType] || inquiry.inquiryType}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-500 mb-3">
                      <span className="flex items-center gap-1"><Mail className="w-3 h-3" />{inquiry.inquirerEmail}</span>
                      {inquiry.inquirerPhone && <span className="flex items-center gap-1"><Phone className="w-3 h-3" />{inquiry.inquirerPhone}</span>}
                      <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{relativeTime(inquiry.createdAt)}</span>
                    </div>

                    <div className="bg-gray-50 rounded-xl p-3 mb-3 border border-gray-100">
                      <p className="text-sm text-gray-700">{inquiry.message}</p>
                    </div>

                    {inquiry.agentResponse && (
                      <div className="bg-blue-50 border-l-2 border-blue-400 rounded-r-xl p-3">
                        <p className="text-xs font-medium text-blue-800 mb-1 flex items-center gap-1"><Send className="w-3 h-3" /> Phản hồi:</p>
                        <p className="text-sm text-blue-700">{inquiry.agentResponse}</p>
                        {inquiry.respondedAt && <p className="text-xs text-blue-500 mt-1">{relativeTime(inquiry.respondedAt)}</p>}
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col gap-2 flex-shrink-0">
                    <button onClick={() => window.open(`/properties/${inquiry.propertyId}`, '_blank')}
                      className="p-2 text-gray-400 hover:bg-gray-100 rounded-lg" title="Xem BĐS"><Eye className="w-4 h-4" /></button>

                    {!inquiry.agentResponse && (
                      <button onClick={() => setResponseModal({ open: true, inquiry })} disabled={isProcessing}
                        className="inline-flex items-center gap-1.5 px-3 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 text-xs font-medium">
                        {isProcessing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />} Phản hồi
                      </button>
                    )}

                    {inquiry.status === 'NEW' && (
                      <button onClick={() => handleUpdateStatus(inquiry.id, 'IN_PROGRESS')} disabled={isProcessing}
                        className="px-3 py-2 bg-amber-100 text-amber-700 rounded-xl hover:bg-amber-200 disabled:opacity-50 text-xs font-medium">Đang xử lý</button>
                    )}

                    {inquiry.status !== 'CLOSED' && inquiry.status !== 'SPAM' && (
                      <button onClick={() => handleUpdateStatus(inquiry.id, 'CLOSED')} disabled={isProcessing}
                        className="px-3 py-2 bg-gray-100 text-gray-600 rounded-xl hover:bg-gray-200 disabled:opacity-50 text-xs font-medium">Đóng</button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-2">
          <button onClick={() => setCurrentPage(p => Math.max(0, p - 1))} disabled={currentPage === 0}
            className="px-4 py-2 border border-gray-200 rounded-xl disabled:opacity-40 hover:bg-gray-50 text-sm">Trước</button>
          <span className="px-4 py-2 text-sm text-gray-500">Trang {currentPage + 1} / {totalPages}</span>
          <button onClick={() => setCurrentPage(p => Math.min(totalPages - 1, p + 1))} disabled={currentPage >= totalPages - 1}
            className="px-4 py-2 border border-gray-200 rounded-xl disabled:opacity-40 hover:bg-gray-50 text-sm">Sau</button>
        </div>
      )}

      <ResponseModal open={responseModal.open} onClose={() => setResponseModal({ open: false, inquiry: null })}
        onSubmit={handleRespondSubmit} loading={processingId === responseModal.inquiry?.id} inquiry={responseModal.inquiry} />
    </div>
  );
};

export default InquiryManagementPage;

