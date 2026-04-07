import React, { useState, useEffect, useCallback, useRef } from 'react';
import { 
  CheckCircle, XCircle, Eye, Loader2, Search,
  ChevronDown, ChevronUp, MapPin, User, Calendar, 
  Image as ImageIcon, X, Home, RefreshCw, Filter
} from 'lucide-react';
import { propertyAPI } from '../../api/property';
import { staffDashboardAPI } from '../../api/staffDashboard';
import { relativeTime } from '../../utils/relativeTime';
import { useDebounce } from '../../hooks/useDebounce';
import toast from '../../utils/toast';

// ─── Reject Modal ───
const RejectModal: React.FC<{
  open: boolean;
  onClose: () => void;
  onSubmit: (reason: string) => void;
  loading: boolean;
  propertyTitle: string;
}> = ({ open, onClose, onSubmit, loading, propertyTitle }) => {
  const [selectedReason, setSelectedReason] = useState('');
  const [customReason, setCustomReason] = useState('');

  const reasons = [
    'Thông tin không chính xác',
    'Hình ảnh không phù hợp',
    'Nội dung vi phạm chính sách',
    'Trùng lặp tin đăng',
    'Giá không hợp lý',
    'Thiếu thông tin quan trọng',
    'Khác',
  ];

  const handleSubmit = () => {
    const reason = selectedReason === 'Khác' ? customReason : selectedReason;
    if (!reason.trim()) {
      toast.error('Vui lòng chọn hoặc nhập lý do từ chối');
      return;
    }
    onSubmit(reason);
  };

  useEffect(() => {
    if (!open) { setSelectedReason(''); setCustomReason(''); }
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Từ chối tin đăng</h3>
            <p className="text-sm text-gray-500 mt-0.5 truncate max-w-[280px]">{propertyTitle}</p>
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-gray-100 rounded-lg"><X className="w-5 h-5 text-gray-500" /></button>
        </div>
        <div className="p-5 space-y-3">
          <p className="text-sm font-medium text-gray-700 mb-2">Chọn lý do từ chối:</p>
          {reasons.map(r => (
            <label key={r} className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
              selectedReason === r ? 'border-red-300 bg-red-50' : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
            }`}>
              <input type="radio" name="reason" checked={selectedReason === r} onChange={() => setSelectedReason(r)} className="w-4 h-4 text-red-600 focus:ring-red-500" />
              <span className="text-sm text-gray-700">{r}</span>
            </label>
          ))}
          {selectedReason === 'Khác' && (
            <textarea value={customReason} onChange={e => setCustomReason(e.target.value)} placeholder="Nhập lý do chi tiết..." rows={3}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none" />
          )}
        </div>
        <div className="flex gap-3 p-5 border-t border-gray-100 bg-gray-50">
          <button onClick={onClose} className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-100 text-sm font-medium">Hủy</button>
          <button onClick={handleSubmit} disabled={loading || !selectedReason}
            className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-xl hover:bg-red-700 disabled:opacity-50 text-sm font-medium flex items-center justify-center gap-2">
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <XCircle className="w-4 h-4" />} Từ chối
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Types ───
type ModerationTab = 'PENDING' | 'ACTIVE' | 'REJECTED';

const tabConfig: { key: ModerationTab; label: string; color: string }[] = [
  { key: 'PENDING', label: 'Chờ duyệt', color: 'bg-amber-500' },
  { key: 'ACTIVE', label: 'Đã duyệt', color: 'bg-emerald-500' },
  { key: 'REJECTED', label: 'Đã từ chối', color: 'bg-red-500' },
];

const propertyTypeLabels: Record<string, string> = {
  APARTMENT: 'Căn hộ', HOUSE: 'Nhà phố', VILLA: 'Biệt thự', OFFICE: 'Văn phòng', LAND: 'Đất',
};

// ─── Main ───
const PropertyModerationPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<ModerationTab>('PENDING');
  const [properties, setProperties] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearch = useDebounce(searchQuery, 300);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [bulkProcessing, setBulkProcessing] = useState(false);
  const [confirmApproveId, setConfirmApproveId] = useState<string | null>(null);
  const confirmTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [tabCounts, setTabCounts] = useState<Record<ModerationTab, number>>({ PENDING: 0, ACTIVE: 0, REJECTED: 0 });

  // Reject modal
  const [rejectModal, setRejectModal] = useState<{ open: boolean; id: string; title: string }>({ open: false, id: '', title: '' });
  // Bulk reject modal
  const [bulkRejectModal, setBulkRejectModal] = useState(false);
  const [bulkRejectReason, setBulkRejectReason] = useState('');
  const [bulkRejectCustom, setBulkRejectCustom] = useState('');

  // ── Fetch ──
  const fetchProperties = useCallback(async () => {
    try {
      setLoading(true);
      let response;
      if (activeTab === 'PENDING') {
        response = await propertyAPI.getPendingProperties(currentPage, 20);
      } else {
        response = await propertyAPI.getPropertiesByStatus(activeTab, currentPage, 20);
      }
      setProperties(response.content || []);
      setTotalPages(response.totalPages || 1);
      setTotalElements(response.totalElements || 0);
    } catch {
      toast.error('Không thể tải danh sách tin đăng');
    } finally {
      setLoading(false);
    }
  }, [activeTab, currentPage]);

  const fetchTabCounts = useCallback(async () => {
    try {
      const stats = await staffDashboardAPI.getStats();
      setTabCounts({
        PENDING: stats.pendingCount || 0,
        ACTIVE: stats.activeCount || 0,
        REJECTED: stats.rejectedCount || 0,
      });
    } catch { /* silent */ }
  }, []);

  useEffect(() => { fetchProperties(); }, [fetchProperties]);
  useEffect(() => { fetchTabCounts(); }, [fetchTabCounts]);

  // ── Auto refresh (30s) — chỉ khi tab PENDING ──
  useEffect(() => {
    if (activeTab !== 'PENDING') return;
    const interval = setInterval(async () => {
      try {
        const stats = await staffDashboardAPI.getStats();
        const newCount = stats.pendingCount || 0;
        if (newCount > tabCounts.PENDING) {
          toast.info(`${newCount - tabCounts.PENDING} tin mới vừa được gửi`);
        }
        setTabCounts(prev => ({ ...prev, PENDING: newCount, ACTIVE: stats.activeCount || 0, REJECTED: stats.rejectedCount || 0 }));
      } catch { /* silent */ }
    }, 30000);
    return () => clearInterval(interval);
  }, [activeTab, tabCounts.PENDING]);

  // ── Tab change ──
  const handleTabChange = (tab: ModerationTab) => {
    setActiveTab(tab);
    setCurrentPage(0);
    setSelectedIds(new Set());
    setExpandedId(null);
    setSearchQuery('');
  };

  // ── Approve with confirm ──
  const handleApproveClick = (id: string) => {
    if (confirmApproveId === id) {
      // Second click — confirm
      doApprove(id);
    } else {
      // First click — show confirm
      setConfirmApproveId(id);
      if (confirmTimerRef.current) clearTimeout(confirmTimerRef.current);
      confirmTimerRef.current = setTimeout(() => setConfirmApproveId(null), 3000);
    }
  };

  const doApprove = async (id: string) => {
    setConfirmApproveId(null);
    // Optimistic UI: remove from list immediately
    const backup = [...properties];
    setProperties(prev => prev.filter(p => p.id !== id));
    setSelectedIds(prev => { const n = new Set(prev); n.delete(id); return n; });

    try {
      setProcessingId(id);
      await propertyAPI.approveProperty(id);
      toast.success('Đã duyệt tin đăng');
      fetchTabCounts();
    } catch (error: any) {
      // Rollback
      setProperties(backup);
      toast.error(error.response?.data?.message || 'Không thể duyệt tin đăng');
    } finally {
      setProcessingId(null);
    }
  };

  const handleRejectSubmit = async (reason: string) => {
    const id = rejectModal.id;
    // Optimistic
    const backup = [...properties];
    setProperties(prev => prev.filter(p => p.id !== id));

    try {
      setProcessingId(id);
      await propertyAPI.rejectProperty(id, reason);
      toast.success('Đã từ chối tin đăng');
      setRejectModal({ open: false, id: '', title: '' });
      fetchTabCounts();
    } catch (error: any) {
      setProperties(backup);
      toast.error(error.response?.data?.message || 'Không thể từ chối');
    } finally {
      setProcessingId(null);
    }
  };

  // ── Bulk ──
  const handleBulkApprove = async () => {
    if (selectedIds.size === 0) return;
    setBulkProcessing(true);
    const backup = [...properties];
    setProperties(prev => prev.filter(p => !selectedIds.has(p.id)));
    try {
      const result = await staffDashboardAPI.bulkApprove(Array.from(selectedIds));
      toast.success(result.message || `Đã duyệt ${result.approvedCount} tin`);
      setSelectedIds(new Set());
      fetchTabCounts();
    } catch {
      setProperties(backup);
      toast.error('Không thể duyệt hàng loạt');
    } finally {
      setBulkProcessing(false);
    }
  };

  // ── Bulk Reject ──
  const handleBulkReject = async () => {
    if (selectedIds.size === 0) return;
    const reason = bulkRejectReason === 'Khác' ? bulkRejectCustom : bulkRejectReason;
    if (!reason.trim()) { toast.error('Vui lòng chọn hoặc nhập lý do từ chối'); return; }
    setBulkProcessing(true);
    const backup = [...properties];
    setProperties(prev => prev.filter(p => !selectedIds.has(p.id)));
    try {
      const result = await staffDashboardAPI.bulkReject(Array.from(selectedIds), reason);
      toast.success(result.message || `Đã từ chối ${result.rejectedCount} tin`);
      setSelectedIds(new Set());
      setBulkRejectModal(false);
      setBulkRejectReason('');
      setBulkRejectCustom('');
      fetchTabCounts();
    } catch {
      setProperties(backup);
      toast.error('Không thể từ chối hàng loạt');
    } finally {
      setBulkProcessing(false);
    }
  };

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => { const n = new Set(prev); if (n.has(id)) n.delete(id); else n.add(id); return n; });
  };

  const formatPrice = (price: number) => {
    if (!price) return '0';
    if (price >= 1_000_000_000) return `${(price / 1_000_000_000).toFixed(1)} tỷ`;
    if (price >= 1_000_000) return `${(price / 1_000_000).toFixed(0)} triệu`;
    return price.toLocaleString('vi-VN');
  };

  // ── Filter ──
  const filtered = properties.filter(p => {
    if (!debouncedSearch) return true;
    const q = debouncedSearch.toLowerCase();
    return p.title?.toLowerCase().includes(q) || p.location?.address?.toLowerCase().includes(q) || p.owner?.fullName?.toLowerCase().includes(q);
  });

  const isPending = activeTab === 'PENDING';

  // ── Skeleton ──
  if (loading && properties.length === 0) {
    return (
      <div className="space-y-4">
        <div className="h-8 w-48 bg-gray-200 rounded animate-pulse" />
        <div className="flex gap-2">{[1,2,3].map(i => <div key={i} className="h-10 w-28 bg-gray-200 rounded-xl animate-pulse" />)}</div>
        {[1,2,3].map(i => (
          <div key={i} className="bg-white rounded-2xl p-5 animate-pulse">
            <div className="flex gap-4"><div className="w-20 h-20 bg-gray-200 rounded-xl" /><div className="flex-1 space-y-3"><div className="h-5 bg-gray-200 rounded w-3/4" /><div className="h-4 bg-gray-200 rounded w-1/2" /></div></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Duyệt tin đăng</h1>
          <p className="text-sm text-gray-500 mt-1">Xem xét và quản lý tin đăng trên hệ thống</p>
        </div>
        <button onClick={() => { fetchProperties(); fetchTabCounts(); }} className="p-2 text-gray-400 hover:bg-gray-100 rounded-lg transition-colors" title="Làm mới">
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2">
        {tabConfig.map(tab => (
          <button key={tab.key} onClick={() => handleTabChange(tab.key)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all flex items-center gap-2 ${
              activeTab === tab.key ? 'bg-gray-900 text-white shadow-sm' : 'bg-white text-gray-600 border border-gray-200 hover:border-gray-300'
            }`}>
            {tab.label}
            {tabCounts[tab.key] > 0 && (
              <span className={`px-1.5 py-0.5 text-xs font-bold rounded-full min-w-[20px] text-center ${
                activeTab === tab.key ? 'bg-white/20 text-white' : `${tab.color} text-white`
              }`}>{tabCounts[tab.key] > 999 ? '999+' : tabCounts[tab.key]}</span>
            )}
          </button>
        ))}
      </div>

      {/* Search + Bulk (only for PENDING) */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
            placeholder="Tìm theo tiêu đề, địa chỉ, chủ tin..."
            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-red-500 focus:border-transparent" />
        </div>
        {isPending && selectedIds.size > 0 && (
          <div className="flex gap-2">
            <button onClick={handleBulkApprove} disabled={bulkProcessing}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 disabled:opacity-50 text-sm font-medium">
              {bulkProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
              Duyệt {selectedIds.size} tin
            </button>
            <button onClick={() => setBulkRejectModal(true)} disabled={bulkProcessing}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-red-600 text-white rounded-xl hover:bg-red-700 disabled:opacity-50 text-sm font-medium">
              {bulkProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : <XCircle className="w-4 h-4" />}
              Từ chối {selectedIds.size} tin
            </button>
          </div>
        )}
      </div>

      {/* Select All (PENDING only) */}
      {isPending && filtered.length > 0 && (
        <label className="flex items-center gap-2 cursor-pointer text-sm text-gray-600">
          <input type="checkbox" checked={selectedIds.size === filtered.length && filtered.length > 0}
            onChange={() => selectedIds.size === filtered.length ? setSelectedIds(new Set()) : setSelectedIds(new Set(filtered.map(p => p.id)))}
            className="w-4 h-4 text-red-600 rounded focus:ring-red-500" />
          Chọn tất cả ({filtered.length})
        </label>
      )}

      {/* List */}
      {filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-10 text-center">
          <CheckCircle className="w-14 h-14 text-emerald-400 mx-auto mb-3" />
          <p className="text-gray-600 font-medium">
            {isPending ? 'Không có tin đăng nào chờ duyệt' : `Không có tin ${activeTab === 'ACTIVE' ? 'đã duyệt' : 'đã từ chối'} nào`}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((property) => {
            const isExpanded = expandedId === property.id;
            const isConfirming = confirmApproveId === property.id;

            return (
              <div key={property.id} className="bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
                <div className="p-4 flex items-start gap-3">
                  {/* Checkbox (PENDING only) */}
                  {isPending && (
                    <input type="checkbox" checked={selectedIds.has(property.id)} onChange={() => toggleSelect(property.id)}
                      className="mt-5 w-4 h-4 text-red-600 rounded focus:ring-red-500 flex-shrink-0" />
                  )}

                  {/* Thumbnail */}
                  <div className="w-20 h-20 rounded-xl bg-gray-100 flex-shrink-0 overflow-hidden cursor-pointer"
                    onClick={() => setExpandedId(isExpanded ? null : property.id)}>
                    {property.mainImageUrl ? (
                      <img src={property.mainImageUrl} alt="" className="w-full h-full object-cover" loading="lazy" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center"><Home className="w-8 h-8 text-gray-300" /></div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start gap-2 mb-1">
                      <h3 className="text-base font-semibold text-gray-900 truncate cursor-pointer hover:text-red-600 transition-colors"
                        onClick={() => setExpandedId(isExpanded ? null : property.id)}>
                        {property.title}
                      </h3>
                      {property.propertyType && (
                        <span className="flex-shrink-0 px-2 py-0.5 text-xs font-medium bg-gray-100 text-gray-600 rounded-lg">
                          {propertyTypeLabels[property.propertyType] || property.propertyType}
                        </span>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-500 mb-1">
                      <span className="font-semibold text-blue-600 text-sm">{formatPrice(property.price)}</span>
                      {property.area && <span>{property.area} m²</span>}
                      {property.bedrooms > 0 && <span>{property.bedrooms} PN</span>}
                      {property.location?.address && (
                        <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /><span className="truncate max-w-[180px]">{property.location.address}</span></span>
                      )}
                    </div>

                    <div className="flex items-center gap-3 text-xs text-gray-400">
                      <span className="flex items-center gap-1"><User className="w-3 h-3" />{property.owner?.fullName || 'N/A'}</span>
                      <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{relativeTime(property.createdAt)}</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button onClick={() => setExpandedId(isExpanded ? null : property.id)}
                      className="p-2 text-gray-400 hover:bg-gray-100 rounded-lg transition-colors">
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                    <button onClick={() => window.open(`/properties/${property.id}`, '_blank')}
                      className="p-2 text-gray-400 hover:bg-gray-100 rounded-lg transition-colors" title="Mở tab mới">
                      <Eye className="w-4 h-4" />
                    </button>

                    {isPending && (
                      <>
                        <button onClick={() => handleApproveClick(property.id)} disabled={processingId === property.id}
                          className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-medium transition-all ${
                            isConfirming
                              ? 'bg-amber-500 text-white animate-pulse'
                              : 'bg-emerald-600 text-white hover:bg-emerald-700'
                          } disabled:opacity-50`}>
                          {processingId === property.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                          {isConfirming ? 'Xác nhận?' : 'Duyệt'}
                        </button>
                        <button onClick={() => setRejectModal({ open: true, id: property.id, title: property.title })}
                          disabled={processingId === property.id}
                          className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700 disabled:opacity-50 text-sm font-medium">
                          <XCircle className="w-4 h-4" /> Từ chối
                        </button>
                      </>
                    )}
                  </div>
                </div>

                {/* Expanded Detail */}
                {isExpanded && (
                  <div className="border-t border-gray-100 bg-gray-50 p-5">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                      <div>
                        <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                          <ImageIcon className="w-4 h-4" /> Hình ảnh ({property.images?.length || 0})
                        </h4>
                        {property.images && property.images.length > 0 ? (
                          <div className="grid grid-cols-3 gap-2">
                            {property.images.slice(0, 6).map((img: any, i: number) => (
                              <div key={i} className="aspect-square rounded-lg overflow-hidden bg-gray-200">
                                <img src={img.imageUrl} alt="" className="w-full h-full object-cover hover:scale-110 transition-transform duration-300" loading="lazy" />
                              </div>
                            ))}
                            {property.images.length > 6 && (
                              <div className="aspect-square rounded-lg bg-gray-800/60 flex items-center justify-center text-white text-sm font-medium">+{property.images.length - 6}</div>
                            )}
                          </div>
                        ) : (
                          <div className="bg-white rounded-xl p-6 text-center border border-dashed border-gray-200">
                            <ImageIcon className="w-8 h-8 text-gray-300 mx-auto mb-2" /><p className="text-sm text-gray-400">Không có hình ảnh</p>
                          </div>
                        )}
                      </div>
                      <div>
                        <h4 className="text-sm font-semibold text-gray-700 mb-3">Mô tả chi tiết</h4>
                        <div className="bg-white rounded-xl p-4 border border-gray-200 text-sm text-gray-600 max-h-48 overflow-y-auto whitespace-pre-wrap">
                          {property.description || 'Không có mô tả'}
                        </div>
                        <h4 className="text-sm font-semibold text-gray-700 mt-4 mb-2 flex items-center gap-2"><User className="w-4 h-4" /> Chủ tin</h4>
                        <div className="bg-white rounded-xl p-4 border border-gray-200 text-sm space-y-1">
                          <p><span className="text-gray-500">Họ tên:</span> <span className="font-medium">{property.owner?.fullName || 'N/A'}</span></p>
                          <p><span className="text-gray-500">Email:</span> <span className="font-medium">{property.owner?.email || 'N/A'}</span></p>
                          <p><span className="text-gray-500">SĐT:</span> <span className="font-medium">{property.owner?.phone || 'N/A'}</span></p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-2">
          <button onClick={() => setCurrentPage(p => Math.max(0, p - 1))} disabled={currentPage === 0}
            className="px-4 py-2 border border-gray-200 rounded-xl disabled:opacity-40 hover:bg-gray-50 text-sm">Trước</button>
          <span className="px-4 py-2 text-sm text-gray-500">Trang {currentPage + 1} / {totalPages}</span>
          <button onClick={() => setCurrentPage(p => Math.min(totalPages - 1, p + 1))} disabled={currentPage >= totalPages - 1}
            className="px-4 py-2 border border-gray-200 rounded-xl disabled:opacity-40 hover:bg-gray-50 text-sm">Sau</button>
        </div>
      )}

      <RejectModal open={rejectModal.open} onClose={() => setRejectModal({ open: false, id: '', title: '' })}
        onSubmit={handleRejectSubmit} loading={processingId === rejectModal.id} propertyTitle={rejectModal.title} />

      {/* Bulk Reject Modal */}
      {bulkRejectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={() => setBulkRejectModal(false)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between p-5 border-b border-gray-100">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Từ chối hàng loạt</h3>
                <p className="text-sm text-gray-500 mt-0.5">{selectedIds.size} tin đăng sẽ bị từ chối</p>
              </div>
              <button onClick={() => setBulkRejectModal(false)} className="p-1.5 hover:bg-gray-100 rounded-lg"><X className="w-5 h-5 text-gray-500" /></button>
            </div>
            <div className="p-5 space-y-3">
              <p className="text-sm font-medium text-gray-700 mb-2">Chọn lý do từ chối:</p>
              {['Thông tin không chính xác', 'Hình ảnh không phù hợp', 'Nội dung vi phạm chính sách', 'Trùng lặp tin đăng', 'Giá không hợp lý', 'Thiếu thông tin quan trọng', 'Khác'].map(r => (
                <label key={r} className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                  bulkRejectReason === r ? 'border-red-300 bg-red-50' : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                }`}>
                  <input type="radio" name="bulkReason" checked={bulkRejectReason === r} onChange={() => setBulkRejectReason(r)} className="w-4 h-4 text-red-600 focus:ring-red-500" />
                  <span className="text-sm text-gray-700">{r}</span>
                </label>
              ))}
              {bulkRejectReason === 'Khác' && (
                <textarea value={bulkRejectCustom} onChange={e => setBulkRejectCustom(e.target.value)} placeholder="Nhập lý do chi tiết..." rows={3}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none" />
              )}
            </div>
            <div className="flex gap-3 p-5 border-t border-gray-100 bg-gray-50">
              <button onClick={() => setBulkRejectModal(false)} className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-100 text-sm font-medium">Hủy</button>
              <button onClick={handleBulkReject} disabled={bulkProcessing || !bulkRejectReason}
                className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-xl hover:bg-red-700 disabled:opacity-50 text-sm font-medium flex items-center justify-center gap-2">
                {bulkProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : <XCircle className="w-4 h-4" />} Từ chối {selectedIds.size} tin
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PropertyModerationPage;
