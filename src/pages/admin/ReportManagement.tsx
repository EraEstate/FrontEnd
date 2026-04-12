import React, { useState, useEffect } from 'react';
import { AlertTriangle, Clock, CheckCircle, XCircle, Eye, Loader2, Filter, MessageSquare } from 'lucide-react';
import { reportAPI, type ReportResponse } from '../../api/report';
import { showSuccess, showError } from '../../utils/toast';

const STATUS_CFG: Record<string, { bg: string; text: string; label: string; icon: React.ReactNode }> = {
  PENDING: { bg: 'bg-amber-50', text: 'text-amber-700', label: 'Chờ xử lý', icon: <Clock className="w-3.5 h-3.5" /> },
  REVIEWING: { bg: 'bg-blue-50', text: 'text-blue-700', label: 'Đang xem', icon: <Eye className="w-3.5 h-3.5" /> },
  RESOLVED: { bg: 'bg-emerald-50', text: 'text-emerald-700', label: 'Đã xử lý', icon: <CheckCircle className="w-3.5 h-3.5" /> },
  DISMISSED: { bg: 'bg-gray-100', text: 'text-gray-600', label: 'Bỏ qua', icon: <XCircle className="w-3.5 h-3.5" /> },
};

const REASON_MAP: Record<string, string> = {
  SCAM: 'Lừa đảo', FAKE_INFO: 'Thông tin sai', FAKE_PRICE: 'Giá ảo',
  DUPLICATE: 'Trùng lặp', INAPPROPRIATE: 'Không phù hợp', SPAM: 'Spam', OTHER: 'Khác',
};

const ReportManagement: React.FC = () => {
  const [reports, setReports] = useState<ReportResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [filterStatus, setFilterStatus] = useState('');
  const [stats, setStats] = useState<Record<string, number>>({});
  const [processingId, setProcessingId] = useState<string | null>(null);

  useEffect(() => { fetchReports(); fetchStats(); }, [page, filterStatus]);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const data = await reportAPI.getAll(page, 20, filterStatus || undefined);
      setReports(data.content || []);
      setTotalPages(data.totalPages || 1);
    } catch { showError('Không thể tải danh sách báo cáo'); }
    finally { setLoading(false); }
  };

  const fetchStats = async () => {
    try { setStats(await reportAPI.getStats()); } catch { /* ignore */ }
  };

  const handleAction = async (id: string, status: string) => {
    try {
      setProcessingId(id);
      await reportAPI.updateStatus(id, status);
      showSuccess('Đã cập nhật báo cáo');
      fetchReports(); fetchStats();
    } catch { showError('Lỗi cập nhật'); }
    finally { setProcessingId(null); }
  };

  return (
    <div>
      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        {[
          { k: 'pending', l: 'Chờ xử lý', c: 'bg-amber-50 text-amber-700 border-amber-200' },
          { k: 'reviewing', l: 'Đang xem', c: 'bg-blue-50 text-blue-700 border-blue-200' },
          { k: 'resolved', l: 'Đã xử lý', c: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
          { k: 'dismissed', l: 'Bỏ qua', c: 'bg-gray-50 text-gray-600 border-gray-200' },
        ].map(s => (
          <div key={s.k} className={`p-4 rounded-xl border ${s.c}`}>
            <p className="text-2xl font-bold">{stats[s.k] ?? 0}</p>
            <p className="text-sm mt-0.5">{s.l}</p>
          </div>
        ))}
      </div>

      {/* Filter */}
      <div className="flex items-center gap-2 mb-4">
        <Filter className="w-4 h-4 text-gray-400" />
        <select value={filterStatus} onChange={e => { setFilterStatus(e.target.value); setPage(0); }}
          className="text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white focus:ring-2 focus:ring-red-500/20 outline-none">
          <option value="">Tất cả</option>
          <option value="PENDING">Chờ xử lý</option>
          <option value="REVIEWING">Đang xem</option>
          <option value="RESOLVED">Đã xử lý</option>
          <option value="DISMISSED">Bỏ qua</option>
        </select>
      </div>

      {/* List */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-20"><Loader2 className="w-7 h-7 animate-spin text-red-500" /></div>
        ) : reports.length === 0 ? (
          <div className="text-center py-16">
            <AlertTriangle className="w-10 h-10 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">Không có báo cáo nào</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {reports.map(r => {
              const sc = STATUS_CFG[r.status] || STATUS_CFG.PENDING;
              return (
                <div key={r.id} className="p-4 hover:bg-gray-50/50 transition-colors">
                  <div className="flex flex-col sm:flex-row sm:items-start gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${sc.bg} ${sc.text}`}>
                          {sc.icon} {sc.label}
                        </span>
                        <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-red-50 text-red-700">
                          {REASON_MAP[r.reason] || r.reason}
                        </span>
                        <span className="text-xs text-gray-400">{r.targetType} #{r.targetId?.slice(0, 8)}</span>
                      </div>
                      {r.description && <p className="text-sm text-gray-700 mt-1">{r.description}</p>}
                      <p className="text-xs text-gray-400 mt-1.5">
                        {r.reporter?.fullName || 'N/A'} · {new Date(r.createdAt).toLocaleString('vi-VN')}
                      </p>
                      {r.adminNote && (
                        <p className="text-xs text-blue-600 mt-1 flex items-center gap-1">
                          <MessageSquare className="w-3 h-3" /> {r.adminNote}
                        </p>
                      )}
                    </div>
                    {(r.status === 'PENDING' || r.status === 'REVIEWING') && (
                      <div className="flex items-center gap-2 flex-shrink-0">
                        {r.status === 'PENDING' && (
                          <button onClick={() => handleAction(r.id, 'REVIEWING')} disabled={processingId === r.id}
                            className="px-3 py-1.5 rounded-lg text-xs font-medium bg-blue-50 text-blue-700 hover:bg-blue-100 disabled:opacity-50">
                            Xem xét
                          </button>
                        )}
                        <button onClick={() => handleAction(r.id, 'RESOLVED')} disabled={processingId === r.id}
                          className="px-3 py-1.5 rounded-lg text-xs font-medium bg-emerald-50 text-emerald-700 hover:bg-emerald-100 disabled:opacity-50">
                          Xử lý
                        </button>
                        <button onClick={() => handleAction(r.id, 'DISMISSED')} disabled={processingId === r.id}
                          className="px-3 py-1.5 rounded-lg text-xs font-medium bg-gray-100 text-gray-600 hover:bg-gray-200 disabled:opacity-50">
                          Bỏ qua
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-3 mt-6">
          <button onClick={() => setPage(p => Math.max(0, p - 1))} disabled={page === 0}
            className="px-4 py-2 rounded-xl border border-gray-200 text-sm font-medium disabled:opacity-40 hover:bg-white">← Trước</button>
          <span className="text-sm text-gray-500">{page + 1} / {totalPages}</span>
          <button onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))} disabled={page >= totalPages - 1}
            className="px-4 py-2 rounded-xl border border-gray-200 text-sm font-medium disabled:opacity-40 hover:bg-white">Sau →</button>
        </div>
      )}
    </div>
  );
};

export default ReportManagement;
