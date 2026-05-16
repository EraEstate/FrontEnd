import React, { useState, useEffect, useCallback } from 'react';
import { Flag, AlertTriangle, CheckCircle, XCircle, Clock, Search, Users, BarChart3 } from 'lucide-react';
import { reportAPI, type ReportResponse } from '../../api/report';
import { useAdminTheme } from '../../contexts/AdminThemeContext';
import toast from '../../utils/toast';

const AdminReportCenter: React.FC = () => {
  const { theme } = useAdminTheme();
  const isDark = theme === 'dark';
  const [reports, setReports] = useState<ReportResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [stats, setStats] = useState<Record<string, number>>({});
  const [adminNote, setAdminNote] = useState<Record<string, string>>({});

  const fetchReports = useCallback(async () => {
    try {
      setLoading(true);
      const [data, st] = await Promise.all([
        reportAPI.getAll(0, 100, statusFilter || undefined),
        reportAPI.getStats().catch(() => ({})),
      ]);
      setReports(data?.content || data || []);
      setStats(st);
    } catch { toast.error('Không thể tải báo cáo'); } finally { setLoading(false); }
  }, [statusFilter]);

  useEffect(() => { fetchReports(); }, [fetchReports]);

  const handleUpdateStatus = async (id: string, status: string) => {
    try {
      await reportAPI.updateStatus(id, status, adminNote[id]);
      toast.success('Cập nhật thành công');
      fetchReports();
    } catch { toast.error('Lỗi khi cập nhật'); }
  };

  const getStatusBadge = (s: string) => {
    const m: Record<string, { icon: React.ReactNode; label: string; cls: string }> = {
      PENDING: { icon: <Clock className="w-3 h-3"/>, label: 'Chờ xử lý', cls: 'bg-amber-100 text-amber-700 border-amber-200' },
      REVIEWING: { icon: <Search className="w-3 h-3"/>, label: 'Đang xem xét', cls: 'bg-blue-100 text-blue-700 border-blue-200' },
      RESOLVED: { icon: <CheckCircle className="w-3 h-3"/>, label: 'Đã xử lý', cls: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
      DISMISSED: { icon: <XCircle className="w-3 h-3"/>, label: 'Bỏ qua', cls: 'bg-gray-100 text-gray-600 border-gray-200' },
    };
    const st = m[s] || m['PENDING'];
    return <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold border ${st.cls}`}>{st.icon} {st.label}</span>;
  };

  const reasonLabel = (r: string) => ({ SCAM:'Lừa đảo', FAKE_INFO:'Info giả', FAKE_PRICE:'Giá giả', DUPLICATE:'Trùng', INAPPROPRIATE:'Không phù hợp', SPAM:'Spam', OTHER:'Khác' }[r] || r);

  const filtered = reports.filter(r => !searchQuery || r.description?.toLowerCase().includes(searchQuery.toLowerCase()) || r.reporter?.fullName?.toLowerCase().includes(searchQuery.toLowerCase()));

  const cardCls = isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-100';
  const totalReports = Object.values(stats).reduce((a,b)=>a+b, 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className={`text-2xl font-bold ${isDark?'text-white':'text-gray-900'}`}>Trung tâm Báo cáo</h1>
        <p className={`text-sm mt-1 ${isDark?'text-slate-400':'text-gray-500'}`}>Quản lý toàn bộ báo cáo vi phạm (Admin full quyền)</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {[
          { label: 'Tổng báo cáo', value: totalReports, icon: <BarChart3 className="w-5 h-5 text-blue-600"/>, bg: isDark?'bg-blue-900/20':'bg-blue-50' },
          { label: 'Chờ xử lý', value: stats['PENDING']||0, icon: <Clock className="w-5 h-5 text-amber-600"/>, bg: isDark?'bg-amber-900/20':'bg-amber-50' },
          { label: 'Đang xem xét', value: stats['REVIEWING']||0, icon: <Search className="w-5 h-5 text-purple-600"/>, bg: isDark?'bg-purple-900/20':'bg-purple-50' },
          { label: 'Đã xử lý', value: stats['RESOLVED']||0, icon: <CheckCircle className="w-5 h-5 text-emerald-600"/>, bg: isDark?'bg-emerald-900/20':'bg-emerald-50' },
          { label: 'Bỏ qua', value: stats['DISMISSED']||0, icon: <XCircle className="w-5 h-5 text-gray-500"/>, bg: isDark?'bg-gray-800':'bg-gray-50' },
        ].map(s => (
          <div key={s.label} className={`${s.bg} rounded-2xl p-4 border ${isDark?'border-slate-700':'border-gray-100'}`}>
            <div className="flex items-center gap-3">{s.icon}<div>
              <p className={`text-xs font-medium ${isDark?'text-slate-400':'text-gray-500'}`}>{s.label}</p>
              <p className={`text-xl font-bold ${isDark?'text-white':'text-gray-900'}`}>{s.value}</p>
            </div></div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className={`flex flex-wrap gap-3 p-4 rounded-2xl border ${cardCls}`}>
        <div className="relative flex-1 min-w-[200px]">
          <Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${isDark?'text-slate-400':'text-gray-400'}`}/>
          <input type="text" placeholder="Tìm kiếm..." value={searchQuery} onChange={e=>setSearchQuery(e.target.value)}
            className={`w-full pl-10 pr-4 py-2.5 rounded-xl text-sm border ${isDark?'bg-slate-700 border-slate-600 text-white':'bg-gray-50 border-gray-200'}`}/>
        </div>
        <select value={statusFilter} onChange={e=>setStatusFilter(e.target.value)}
          className={`px-4 py-2.5 rounded-xl text-sm border ${isDark?'bg-slate-700 border-slate-600 text-white':'bg-gray-50 border-gray-200'}`}>
          <option value="">Tất cả</option>
          <option value="PENDING">Chờ xử lý</option>
          <option value="REVIEWING">Đang xem xét</option>
          <option value="RESOLVED">Đã xử lý</option>
          <option value="DISMISSED">Bỏ qua</option>
        </select>
      </div>

      {/* List */}
      <div className={`rounded-2xl border overflow-hidden ${cardCls}`}>
        {loading ? (
          <div className="p-8 space-y-4">{[1,2,3].map(i=><div key={i} className="flex gap-4 animate-pulse"><div className={`w-10 h-10 rounded-full ${isDark?'bg-slate-700':'bg-gray-200'}`}/><div className="flex-1 space-y-2"><div className={`h-4 rounded w-3/4 ${isDark?'bg-slate-700':'bg-gray-200'}`}/><div className={`h-3 rounded w-1/2 ${isDark?'bg-slate-700':'bg-gray-200'}`}/></div></div>)}</div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center">
            <Flag className={`w-12 h-12 mx-auto mb-3 ${isDark?'text-slate-600':'text-gray-300'}`}/>
            <p className={`text-sm ${isDark?'text-slate-400':'text-gray-500'}`}>Không có báo cáo</p>
          </div>
        ) : (
          <div className={`divide-y ${isDark?'divide-slate-700':'divide-gray-50'}`}>
            {filtered.map(r=>(
              <div key={r.id} className={`p-4 transition-colors ${isDark?'hover:bg-slate-700/50':'hover:bg-gray-50'}`}>
                <div className="flex items-start gap-4">
                  <div className="p-2 rounded-xl bg-red-50 flex-shrink-0"><AlertTriangle className="w-5 h-5 text-red-600"/></div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`text-sm font-semibold ${isDark?'text-white':'text-gray-900'}`}>{reasonLabel(r.reason)}</span>
                      {getStatusBadge(r.status)}
                      <span className={`text-xs px-2 py-0.5 rounded-full ${isDark?'bg-slate-700 text-slate-300':'bg-gray-100 text-gray-600'}`}>{r.targetType}</span>
                    </div>
                    <p className={`text-sm mt-1 ${isDark?'text-slate-300':'text-gray-600'}`}>{r.description || 'Không có mô tả'}</p>
                    <div className={`flex gap-4 mt-2 text-xs ${isDark?'text-slate-400':'text-gray-500'}`}>
                      <span><Users className="w-3 h-3 inline mr-1"/>{r.reporter?.fullName || 'Ẩn danh'}</span>
                      <span>{new Date(r.createdAt).toLocaleDateString('vi-VN')}</span>
                    </div>
                    {/* Admin note input */}
                    {(r.status === 'PENDING' || r.status === 'REVIEWING') && (
                      <input type="text" placeholder="Ghi chú admin..." value={adminNote[r.id]||''} onChange={e=>setAdminNote(prev=>({...prev,[r.id]:e.target.value}))}
                        className={`mt-2 w-full px-3 py-1.5 rounded-lg text-xs border ${isDark?'bg-slate-700 border-slate-600 text-white':'bg-gray-50 border-gray-200'}`}/>
                    )}
                  </div>
                  <div className="flex gap-2 flex-shrink-0">
                    {r.status === 'PENDING' && (<>
                      <button onClick={()=>handleUpdateStatus(r.id,'REVIEWING')} className="px-3 py-1.5 text-xs font-medium rounded-lg bg-blue-100 text-blue-700 hover:bg-blue-200">Xem xét</button>
                      <button onClick={()=>handleUpdateStatus(r.id,'DISMISSED')} className="px-3 py-1.5 text-xs font-medium rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200">Bỏ qua</button>
                    </>)}
                    {r.status === 'REVIEWING' && (
                      <button onClick={()=>handleUpdateStatus(r.id,'RESOLVED')} className="px-3 py-1.5 text-xs font-medium rounded-lg bg-emerald-100 text-emerald-700 hover:bg-emerald-200">Đã xử lý</button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminReportCenter;
