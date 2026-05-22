import React, { useState, useEffect, useCallback } from 'react';
import { FileText, CheckCircle, XCircle, Clock, DollarSign, Calendar, User } from 'lucide-react';
import { rentalContractAPI, type RentalContract } from '../../api/rentalContract';
import { useAdminTheme } from '../../contexts/AdminThemeContext';
import toast from '../../utils/toast';

const StaffRentalContractReview: React.FC = () => {
  const { theme } = useAdminTheme();
  const isDark = theme === 'dark';
  const [contracts, setContracts] = useState<RentalContract[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('');

  const fetchContracts = useCallback(async () => {
    try {
      setLoading(true);
      const data = await rentalContractAPI.getMyContracts(statusFilter || undefined);
      setContracts(Array.isArray(data) ? data : []);
    } catch { toast.error('Không thể tải danh sách hợp đồng'); } finally { setLoading(false); }
  }, [statusFilter]);

  useEffect(() => { fetchContracts(); }, [fetchContracts]);

  const getStatusBadge = (s: string) => {
    const map: Record<string, { icon: React.ReactNode; label: string; cls: string }> = {
      DRAFT: { icon: <Clock className="w-3 h-3"/>, label: 'Bản nháp', cls: 'bg-gray-100 text-gray-600 border-gray-200' },
      ACTIVE: { icon: <CheckCircle className="w-3 h-3"/>, label: 'Đang hiệu lực', cls: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
      EXPIRED: { icon: <Calendar className="w-3 h-3"/>, label: 'Hết hạn', cls: 'bg-amber-100 text-amber-700 border-amber-200' },
      TERMINATED: { icon: <XCircle className="w-3 h-3"/>, label: 'Đã chấm dứt', cls: 'bg-red-100 text-red-700 border-red-200' },
    };
    const st = map[s] || map['DRAFT'];
    return <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold border ${st.cls}`}>{st.icon} {st.label}</span>;
  };

  const formatPrice = (p: number) => {
    if (p >= 1e9) return `${(p/1e9).toFixed(1)} tỷ`;
    if (p >= 1e6) return `${(p/1e6).toFixed(0)} triệu`;
    return p.toLocaleString('vi-VN');
  };

  const cardCls = isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-100';
  const filtered = contracts.filter(c => !statusFilter || c.status === statusFilter);

  // Stats
  const total = contracts.length;
  const active = contracts.filter(c => c.status === 'ACTIVE').length;
  const draft = contracts.filter(c => c.status === 'DRAFT').length;
  const totalRent = contracts.filter(c => c.status === 'ACTIVE').reduce((s,c) => s + c.monthlyRent, 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className={`text-2xl font-bold ${isDark?'text-white':'text-gray-900'}`}>Quản lý Hợp đồng Thuê</h1>
        <p className={`text-sm mt-1 ${isDark?'text-slate-400':'text-gray-500'}`}>Xem xét và quản lý các hợp đồng thuê nhà</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Tổng hợp đồng', value: total, icon: <FileText className="w-5 h-5 text-blue-600"/>, bg: isDark?'bg-blue-900/20':'bg-blue-50' },
          { label: 'Đang hiệu lực', value: active, icon: <CheckCircle className="w-5 h-5 text-emerald-600"/>, bg: isDark?'bg-emerald-900/20':'bg-emerald-50' },
          { label: 'Bản nháp', value: draft, icon: <Clock className="w-5 h-5 text-gray-500"/>, bg: isDark?'bg-gray-800':'bg-gray-50' },
          { label: 'Tổng tiền thuê/tháng', value: `${formatPrice(totalRent)} VNĐ`, icon: <DollarSign className="w-5 h-5 text-amber-600"/>, bg: isDark?'bg-amber-900/20':'bg-amber-50' },
        ].map(s => (
          <div key={s.label} className={`${s.bg} rounded-2xl p-4 border ${isDark?'border-slate-700':'border-gray-100'}`}>
            <div className="flex items-center gap-3">{s.icon}<div>
              <p className={`text-xs font-medium ${isDark?'text-slate-400':'text-gray-500'}`}>{s.label}</p>
              <p className={`text-xl font-bold ${isDark?'text-white':'text-gray-900'}`}>{s.value}</p>
            </div></div>
          </div>
        ))}
      </div>

      {/* Filter */}
      <div className={`flex gap-3 p-4 rounded-2xl border ${cardCls}`}>
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
          className={`px-4 py-2.5 rounded-xl text-sm border ${isDark?'bg-slate-700 border-slate-600 text-white':'bg-gray-50 border-gray-200'}`}>
          <option value="">Tất cả trạng thái</option>
          <option value="DRAFT">Bản nháp</option>
          <option value="ACTIVE">Đang hiệu lực</option>
          <option value="EXPIRED">Hết hạn</option>
          <option value="TERMINATED">Đã chấm dứt</option>
        </select>
      </div>

      {/* Contract List */}
      <div className={`rounded-2xl border overflow-hidden ${cardCls}`}>
        {loading ? (
          <div className="p-8 space-y-4">{[1,2,3].map(slot => (
            <div key={`contract-pulse-${slot}`} className="flex gap-4 animate-pulse">
              <div className={`w-10 h-10 rounded-lg ${isDark?'bg-slate-700':'bg-gray-200'}`}/>
              <div className="flex-1 space-y-2">
                <div className={`h-4 rounded w-3/4 ${isDark?'bg-slate-700':'bg-gray-200'}`}/>
                <div className={`h-3 rounded w-1/2 ${isDark?'bg-slate-700':'bg-gray-200'}`}/>
              </div>
            </div>
          ))}</div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center">
            <FileText className={`w-12 h-12 mx-auto mb-3 ${isDark?'text-slate-600':'text-gray-300'}`}/>
            <p className={`text-sm ${isDark?'text-slate-400':'text-gray-500'}`}>Không có hợp đồng nào</p>
          </div>
        ) : (
          <div className={`divide-y ${isDark?'divide-slate-700':'divide-gray-50'}`}>
            {filtered.map(c => (
              <div key={c.id} className={`p-4 transition-colors ${isDark?'hover:bg-slate-700/50':'hover:bg-gray-50'}`}>
                <div className="flex items-start gap-4">
                  <div className={`p-2.5 rounded-xl flex-shrink-0 ${isDark?'bg-blue-900/30':'bg-blue-50'}`}>
                    <FileText className="w-5 h-5 text-blue-600"/>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`text-sm font-semibold ${isDark?'text-white':'text-gray-900'}`}>{c.propertyTitle || `Hợp đồng #${c.id.slice(0,8)}`}</span>
                      {getStatusBadge(c.status)}
                    </div>
                    <div className={`flex flex-wrap gap-4 mt-2 text-xs ${isDark?'text-slate-400':'text-gray-500'}`}>
                      <span className="flex items-center gap-1"><User className="w-3 h-3"/>Chủ: {c.landlordName || 'N/A'}</span>
                      <span className="flex items-center gap-1"><User className="w-3 h-3"/>Thuê: {c.tenantName || 'N/A'}</span>
                      <span className="flex items-center gap-1"><DollarSign className="w-3 h-3"/>{formatPrice(c.monthlyRent)} VNĐ/tháng</span>
                      <span suppressHydrationWarning className="flex items-center gap-1"><Calendar className="w-3 h-3"/>{new Date(c.startDate).toLocaleDateString('vi-VN')} - {new Date(c.endDate).toLocaleDateString('vi-VN')}</span>
                    </div>
                    <div className="flex gap-2 mt-2" suppressHydrationWarning>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${c.signedByLandlord ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-500'}`} suppressHydrationWarning>
                        {c.signedByLandlord ? '✓ Chủ đã ký' : '○ Chủ chưa ký'}
                      </span>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${c.signedByTenant ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-500'}`}>
                        {c.signedByTenant ? '✓ Người thuê đã ký' : '○ Người thuê chưa ký'}
                      </span>
                    </div>
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

export default StaffRentalContractReview;
