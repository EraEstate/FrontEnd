import React, { useState, useEffect, useCallback } from 'react';
import { 
  MessageSquare, Eye, Loader2, Search, X, 
  Send, User, Mail, Phone, Clock, Tag, RefreshCw
} from 'lucide-react';
import { propertyInquiryAPI } from '../../api/propertyInquiry';
import { relativeTime } from '../../utils/relativeTime';
import { useDebounce } from '../../hooks/useDebounce';
import toast from '../../utils/toast';
import { useAdminTheme } from '../../contexts/AdminThemeContext';

// ─── Label maps ───
const statusLabels: Record<string, string> = {
  NEW: 'Mới', IN_PROGRESS: 'Đang xử lý', RESPONDED: 'Đã phản hồi', CLOSED: 'Đã đóng', SPAM: 'Spam',
};

const typeLabels: Record<string, string> = {
  GENERAL_INFO: 'Thông tin chung', SCHEDULE_VIEWING: 'Đặt lịch xem nhà',
  PRICE_NEGOTIATION: 'Thương lượng giá', FINANCING_INFO: 'Tài chính',
  PROPERTY_HISTORY: 'Lịch sử BĐS', NEIGHBORHOOD_INFO: 'Khu vực lân cận', OTHER: 'Khác',
};

// ─── Response Modal ───
const ResponseModal: React.FC<{
  open: boolean; onClose: () => void; onSubmit: (response: string) => void; loading: boolean; inquiry: any; isDark: boolean;
}> = ({ open, onClose, onSubmit, loading, inquiry, isDark }) => {
  const [responseText, setResponseText] = useState('');
  useEffect(() => { if (!open) setResponseText(''); }, [open]);
  if (!open || !inquiry) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <button
        type="button"
        aria-label="Close response modal"
        className="absolute inset-0 bg-slate-950/65 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className={`relative rounded-3xl shadow-2xl w-full max-w-lg mx-4 overflow-hidden border transition-all duration-300 ${
        isDark ? 'bg-slate-800 border-slate-700/80' : 'bg-white border-gray-100'
      }`}>
        <div className={`flex items-center justify-between p-5 border-b ${
          isDark ? 'border-slate-700/80' : 'border-gray-100'
        }`}>
          <div>
            <h3 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>Phản hồi yêu cầu</h3>
            <p className={`text-xs mt-0.5 ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>{inquiry.inquirerName}</p>
          </div>
          <button onClick={onClose} className={`p-2 rounded-xl transition-colors ${
            isDark ? 'hover:bg-slate-700 text-slate-400' : 'hover:bg-gray-100 text-gray-500'
          }`}><X className="w-5 h-5" /></button>
        </div>
        
        <div className="p-5 space-y-4">
          <div className={`rounded-2xl p-4 border ${
            isDark ? 'bg-slate-900/60 border-slate-700/80' : 'bg-gray-50 border-gray-100'
          }`}>
            <p className={`text-xs font-bold mb-1.5 flex items-center gap-1.5 ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>
              <MessageSquare className="w-3.5 h-3.5 text-red-500" /> Nội dung yêu cầu:
            </p>
            <p className={`text-sm ${isDark ? 'text-slate-200' : 'text-gray-700'}`}>{inquiry.message}</p>
          </div>
          
          <div className="space-y-1.5">
            <label htmlFor="staff-inquiry-response" className={`text-sm font-bold ${isDark ? 'text-slate-300' : 'text-gray-700'}`}>
              Nội dung phản hồi:
            </label>
            <textarea 
              id="staff-inquiry-response" 
              value={responseText} 
              onChange={e => setResponseText(e.target.value)} 
              placeholder="Nhập phản hồi chi tiết gửi khách hàng..."
              rows={5} 
              className={`w-full px-4 py-3 rounded-2xl text-sm border focus:ring-1 focus:ring-red-500 resize-none transition-all duration-300 ${
                isDark 
                  ? 'bg-slate-900 border-slate-705 text-white placeholder-slate-500' 
                  : 'bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400'
              }`} 
            />
          </div>
        </div>
        
        <div className={`flex gap-3 p-5 border-t ${
          isDark ? 'border-slate-700/80 bg-slate-800/40' : 'border-gray-100 bg-gray-50'
        }`}>
          <button onClick={onClose} className={`flex-1 px-4 py-3 rounded-2xl font-bold text-sm border transition-all duration-300 ${
            isDark 
              ? 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700 hover:text-white' 
              : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
          }`}>
            Hủy
          </button>
          
          <button onClick={() => { if (!responseText.trim()) { toast.error('Vui lòng nhập nội dung phản hồi'); return; } onSubmit(responseText); }}
            disabled={loading || !responseText.trim()}
            className="flex-1 px-4 py-3 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-755 hover:to-rose-750 text-white rounded-2xl disabled:opacity-50 text-sm font-bold flex items-center justify-center gap-2 transition-all duration-300 btn-press">
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />} 
            Gửi phản hồi
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Main ───
const InquiryManagementPage: React.FC = () => {
  const { theme } = useAdminTheme();
  const isDark = theme === 'dark';

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

  const statusStyles: Record<string, string> = {
    NEW: isDark ? 'bg-blue-500/15 text-blue-300' : 'bg-blue-50 text-blue-700 border border-blue-100',
    IN_PROGRESS: isDark ? 'bg-amber-500/15 text-amber-300' : 'bg-amber-50 text-amber-700 border border-amber-100',
    RESPONDED: isDark ? 'bg-emerald-500/15 text-emerald-300' : 'bg-emerald-50 text-emerald-700 border border-emerald-100',
    CLOSED: isDark ? 'bg-slate-700 text-slate-350' : 'bg-gray-100 text-gray-600 border border-gray-150',
    SPAM: isDark ? 'bg-rose-500/15 text-rose-300' : 'bg-rose-50 text-rose-700 border border-rose-100',
  };

  // Skeleton Loading
  if (loading && inquiries.length === 0) {
    return (
      <div className="space-y-6">
        <div className="space-y-2">
          <div className={`h-8 w-64 rounded-xl animate-pulse ${isDark ? 'bg-slate-800' : 'bg-gray-200'}`} />
          <div className={`h-4 w-96 rounded-lg animate-pulse ${isDark ? 'bg-slate-800' : 'bg-gray-200'}`} />
        </div>
        <div className="flex gap-2">
          {[1,2,3,4,5].map(slot => (
            <div key={`inquiry-tab-skeleton-${slot}`} className={`h-11 w-28 rounded-2xl animate-pulse ${isDark ? 'bg-slate-800' : 'bg-gray-200'}`} />
          ))}
        </div>
        {[1,2,3].map(slot => (
          <div key={`inquiry-card-skeleton-${slot}`} className={`rounded-3xl p-6 border animate-pulse ${
            isDark ? 'bg-slate-800/80 border-slate-700/80' : 'bg-white border-gray-100'
          }`}>
            <div className="space-y-4">
              <div className="flex gap-3">
                <div className={`h-6 w-32 rounded-lg ${isDark ? 'bg-slate-700' : 'bg-gray-200'}`} />
                <div className={`h-6 w-20 rounded-lg ${isDark ? 'bg-slate-700' : 'bg-gray-200'}`} />
              </div>
              <div className={`h-16 w-full rounded-2xl ${isDark ? 'bg-slate-700' : 'bg-gray-200'}`} />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-8">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className={`text-3xl font-extrabold tracking-tight ${isDark ? 'text-white' : 'text-gray-950'}`}>
            Quản lý yêu cầu tư vấn
          </h1>
          <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>
            Xem và phản hồi yêu cầu tư vấn từ khách hàng
          </p>
        </div>
        <button onClick={() => { fetchInquiries(); fetchStatusCounts(); }} 
          className={`p-3 rounded-2xl border transition-all duration-300 ${
            isDark ? 'bg-slate-800 border-slate-700 text-slate-300 hover:text-white' : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50 shadow-sm'
          }`} title="Làm mới">
          <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Toolbar / Search */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input 
          type="text" 
          value={searchQuery} 
          onChange={e => setSearchQuery(e.target.value)}
          placeholder="Tìm theo tên, email, SĐT..."
          className={`w-full pl-11 pr-4 py-3.5 rounded-2xl border transition-all duration-300 text-sm focus:ring-1 focus:ring-red-500 ${
            isDark 
              ? 'bg-slate-800 border-slate-700 text-white placeholder-slate-500' 
              : 'bg-white border-gray-200 text-gray-950 placeholder-gray-400 shadow-sm'
          }`} 
        />
      </div>

      {/* Tabs with counts */}
      <div className="flex flex-wrap gap-2.5">
        {statusTabs.map(s => {
          const count = s === 'ALL' ? totalAll : (statusCounts[s] || 0);
          const isActive = filterStatus === s;
          return (
            <button key={s} onClick={() => { setFilterStatus(s); setCurrentPage(0); }}
              className={`px-5 py-2.5 rounded-2xl text-sm font-bold transition-all duration-300 flex items-center gap-2 border ${
                isActive 
                  ? 'bg-gradient-to-r from-red-600 to-rose-650 text-white border-transparent shadow-md' 
                  : isDark 
                  ? 'bg-slate-850 border-slate-705 text-slate-300 hover:bg-slate-800 hover:text-white' 
                  : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50 shadow-sm'
              }`}>
              {s === 'ALL' ? 'Tất cả' : statusLabels[s] || s}
              {count > 0 && (
                <span className={`px-2 py-0.5 text-xs font-bold rounded-full min-w-[20px] text-center transition-all ${
                  isActive 
                    ? 'bg-white/20 text-white' 
                    : isDark ? 'bg-slate-800 text-slate-400' : 'bg-gray-100 text-gray-500'
                }`}>{count}</span>
              )}
            </button>
          );
        })}
      </div>

      {/* List */}
      {filtered.length === 0 ? (
        <div className={`rounded-3xl border p-16 text-center flex flex-col items-center justify-center ${
          isDark ? 'bg-slate-800/80 border-slate-700/80' : 'bg-white border-gray-100 shadow-sm'
        }`}>
          <div className={`p-4 rounded-3xl mb-4 ${isDark ? 'bg-slate-900 text-slate-500' : 'bg-gray-50 text-gray-400'}`}>
            <MessageSquare className="w-10 h-10" />
          </div>
          <p className={`font-bold mb-1 ${isDark ? 'text-slate-200' : 'text-gray-900'}`}>Không có yêu cầu tư vấn nào</p>
          <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>Bạn chưa nhận được yêu cầu nào trong danh mục này.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((inquiry) => {
            const isProcessing = processingId === inquiry.id;
            return (
              <div key={inquiry.id} className={`rounded-3xl border p-6 transition-all duration-300 hover:shadow-lg ${
                isDark 
                  ? 'bg-slate-850/80 border-slate-700/80 shadow-slate-950/20' 
                  : 'bg-white border-gray-100 shadow-sm shadow-gray-100/30'
              }`}>
                <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
                  <div className="flex-1 min-w-0 space-y-4">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className={`text-lg font-bold leading-tight ${isDark ? 'text-white' : 'text-gray-950'}`}>
                        {inquiry.inquirerName}
                      </h3>
                      <span className={`px-2.5 py-0.5 text-xs font-bold rounded-lg border ${statusStyles[inquiry.status] || statusStyles.NEW}`}>
                        {statusLabels[inquiry.status] || inquiry.status}
                      </span>
                      <span className={`px-2.5 py-0.5 text-xs font-bold rounded-lg flex items-center gap-1 border ${
                        isDark ? 'bg-slate-800 border-slate-700 text-slate-300' : 'bg-gray-50 border-gray-100 text-gray-600'
                      }`}>
                        <Tag className="w-3.5 h-3.5 text-gray-400" />{typeLabels[inquiry.inquiryType] || inquiry.inquiryType}
                      </span>
                    </div>

                    <div className={`flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs ${
                      isDark ? 'text-slate-400' : 'text-gray-500'
                    }`}>
                      <span className="flex items-center gap-1.5"><Mail className="w-3.5 h-3.5 text-gray-400" />{inquiry.inquirerEmail}</span>
                      {inquiry.inquirerPhone && <span className="flex items-center gap-1.5"><Phone className="w-3.5 h-3.5 text-gray-400" />{inquiry.inquirerPhone}</span>}
                      <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5 text-gray-400" />{relativeTime(inquiry.createdAt)}</span>
                    </div>

                    <div className={`rounded-2xl p-4 border leading-relaxed text-sm ${
                      isDark ? 'bg-slate-900 border-slate-750 text-slate-200' : 'bg-gray-50 border-gray-100 text-gray-700'
                    }`}>
                      {inquiry.message}
                    </div>

                    {inquiry.agentResponse && (
                      <div className={`border-l-3 rounded-r-2xl p-4 ${
                        isDark 
                          ? 'bg-rose-500/5 border-rose-500 text-slate-200' 
                          : 'bg-rose-50/50 border-red-500 text-gray-750'
                      }`}>
                        <p className={`text-xs font-bold mb-1.5 flex items-center gap-1.5 ${isDark ? 'text-rose-400' : 'text-red-700'}`}>
                          <Send className="w-3.5 h-3.5" /> Nội dung đã phản hồi:
                        </p>
                        <p className="text-sm leading-relaxed">{inquiry.agentResponse}</p>
                        {inquiry.respondedAt && (
                          <p className={`text-xs mt-2 ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>
                            {relativeTime(inquiry.respondedAt)}
                          </p>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="flex flex-row lg:flex-col gap-2 flex-shrink-0 lg:w-36">
                    <button onClick={() => window.open(`/properties/${inquiry.propertyId}`, '_blank')}
                      className={`flex-1 lg:flex-initial flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl border text-xs font-bold transition-all duration-300 ${
                        isDark 
                          ? 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700 hover:text-white' 
                          : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
                      }`} title="Xem BĐS">
                      <Eye className="w-4 h-4" />
                      Xem BĐS
                    </button>

                    {!inquiry.agentResponse && (
                      <button onClick={() => setResponseModal({ open: true, inquiry })} disabled={isProcessing}
                        className="flex-1 lg:flex-initial flex items-center justify-center gap-1.5 px-4 py-2.5 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white rounded-xl disabled:opacity-50 text-xs font-bold shadow-sm transition-all duration-300 btn-press">
                        {isProcessing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />} 
                        Phản hồi
                      </button>
                    )}

                    {inquiry.status === 'NEW' && (
                      <button onClick={() => handleUpdateStatus(inquiry.id, 'IN_PROGRESS')} disabled={isProcessing}
                        className={`flex-1 lg:flex-initial px-4 py-2.5 rounded-xl text-xs font-bold transition-all duration-300 ${
                          isDark 
                            ? 'bg-amber-500/10 text-amber-400 hover:bg-amber-500/20 border border-amber-500/20' 
                            : 'bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200/50'
                        }`}>
                        Đang xử lý
                      </button>
                    )}

                    {inquiry.status !== 'CLOSED' && inquiry.status !== 'SPAM' && (
                      <button onClick={() => handleUpdateStatus(inquiry.id, 'CLOSED')} disabled={isProcessing}
                        className={`flex-1 lg:flex-initial px-4 py-2.5 rounded-xl text-xs font-bold transition-all duration-300 ${
                          isDark 
                            ? 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-slate-200 border border-slate-700/60' 
                            : 'bg-gray-50 text-gray-500 hover:bg-gray-100 hover:text-gray-700 border border-gray-150'
                        }`}>
                        Đóng yêu cầu
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-6">
          <button onClick={() => setCurrentPage(p => Math.max(0, p - 1))} disabled={currentPage === 0}
            className={`px-4 py-2 border rounded-xl disabled:opacity-40 hover:bg-gray-50 text-sm font-bold transition-all duration-300 ${
              isDark 
                ? 'bg-slate-800 border-slate-700 text-slate-350 hover:bg-slate-700 disabled:pointer-events-none' 
                : 'bg-white border-gray-200 text-gray-600 shadow-sm hover:bg-gray-50'
            }`}>
            Trước
          </button>
          
          <span className={`px-4 py-2 text-sm font-bold rounded-xl ${
            isDark ? 'bg-slate-800/60 text-slate-300' : 'bg-gray-100 text-gray-700'
          }`}>
            Trang {currentPage + 1} / {totalPages}
          </span>
          
          <button onClick={() => setCurrentPage(p => Math.min(totalPages - 1, p + 1))} disabled={currentPage >= totalPages - 1}
            className={`px-4 py-2 border rounded-xl disabled:opacity-40 hover:bg-gray-50 text-sm font-bold transition-all duration-300 ${
              isDark 
                ? 'bg-slate-800 border-slate-700 text-slate-350 hover:bg-slate-700 disabled:pointer-events-none' 
                : 'bg-white border-gray-200 text-gray-600 shadow-sm hover:bg-gray-50'
            }`}>
            Sau
          </button>
        </div>
      )}

      <ResponseModal open={responseModal.open} onClose={() => setResponseModal({ open: false, inquiry: null })}
        onSubmit={handleRespondSubmit} loading={processingId === responseModal.inquiry?.id} inquiry={responseModal.inquiry} isDark={isDark} />
    </div>
  );
};

export default InquiryManagementPage;

