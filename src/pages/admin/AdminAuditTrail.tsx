import React, { useState, useEffect, useCallback } from 'react';
import { ScrollText, Search, Filter, Calendar, User, Shield, Eye, FileText, Settings } from 'lucide-react';
import { activityAPI, type ActivityResponse } from '../../api/activity';
import { useAdminTheme } from '../../contexts/AdminThemeContext';
import toast from '../../utils/toast';

const AdminAuditTrail: React.FC = () => {
  const { theme } = useAdminTheme();
  const isDark = theme === 'dark';
  const [events, setEvents] = useState<ActivityResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const fetchAudit = useCallback(async () => {
    try {
      setLoading(true);
      const data = await activityAPI.getUserActivities(page, 30, typeFilter || undefined);
      setEvents(data.content || []);
      setTotalPages(data.totalPages || 1);
    } catch { toast.error('Không thể tải audit trail'); } finally { setLoading(false); }
  }, [page, typeFilter]);

  useEffect(() => { fetchAudit(); }, [fetchAudit]);

  const getActionMeta = (type: string) => {
    const m: Record<string, { icon: React.ElementType; color: string; bg: string }> = {
      PROPERTY_VIEWED: { icon: Eye, color: 'text-green-600', bg: isDark?'bg-green-900/30':'bg-green-50' },
      PROPERTY_POSTED: { icon: FileText, color: 'text-blue-600', bg: isDark?'bg-blue-900/30':'bg-blue-50' },
      PROPERTY_UPDATED: { icon: Settings, color: 'text-amber-600', bg: isDark?'bg-amber-900/30':'bg-amber-50' },
      PROPERTY_INQUIRY: { icon: User, color: 'text-purple-600', bg: isDark?'bg-purple-900/30':'bg-purple-50' },
    };
    return m[type] || { icon: ScrollText, color: 'text-gray-600', bg: isDark?'bg-gray-800':'bg-gray-50' };
  };

  const cardCls = isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-100';
  const filtered = events.filter(e => !searchQuery || e.title?.toLowerCase().includes(searchQuery.toLowerCase()) || e.description?.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <div className="space-y-6">
      <div>
        <h1 className={`text-2xl font-bold ${isDark?'text-white':'text-gray-900'}`}>Audit Trail</h1>
        <p className={`text-sm mt-1 ${isDark?'text-slate-400':'text-gray-500'}`}>Nhật ký hoạt động toàn hệ thống</p>
      </div>

      {/* Filters */}
      <div className={`flex flex-wrap gap-3 p-4 rounded-2xl border ${cardCls}`}>
        <div className="relative flex-1 min-w-[200px]">
          <Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${isDark?'text-slate-400':'text-gray-400'}`}/>
          <input type="text" placeholder="Tìm kiếm sự kiện..." value={searchQuery} onChange={e=>setSearchQuery(e.target.value)}
            className={`w-full pl-10 pr-4 py-2.5 rounded-xl text-sm border ${isDark?'bg-slate-700 border-slate-600 text-white':'bg-gray-50 border-gray-200'}`}/>
        </div>
        <select value={typeFilter} onChange={e=>{setTypeFilter(e.target.value);setPage(0);}}
          className={`px-4 py-2.5 rounded-xl text-sm border ${isDark?'bg-slate-700 border-slate-600 text-white':'bg-gray-50 border-gray-200'}`}>
          <option value="">Tất cả</option>
          <option value="VIEWED">Xem BĐS</option>
          <option value="POSTED">Đăng tin</option>
          <option value="INQUIRY">Tư vấn</option>
        </select>
      </div>

      {/* Event Stream */}
      <div className={`rounded-2xl border overflow-hidden ${cardCls}`}>
        <div className={`p-5 border-b flex items-center gap-2 ${isDark?'border-slate-700':'border-gray-100'}`}>
          <ScrollText className={`w-5 h-5 ${isDark?'text-slate-400':'text-gray-500'}`}/>
          <h2 className={`text-base font-semibold ${isDark?'text-white':'text-gray-900'}`}>Event Stream</h2>
          <span className={`ml-auto text-xs px-2 py-0.5 rounded-full ${isDark?'bg-slate-700 text-slate-300':'bg-gray-100 text-gray-600'}`}>{filtered.length} sự kiện</span>
        </div>

        {loading ? (
          <div className="p-6 space-y-3">{[1,2,3,4,5].map(i=><div key={i} className="flex gap-4 animate-pulse"><div className={`w-8 h-8 rounded-lg ${isDark?'bg-slate-700':'bg-gray-200'}`}/><div className="flex-1 space-y-2"><div className={`h-4 rounded w-3/4 ${isDark?'bg-slate-700':'bg-gray-200'}`}/><div className={`h-3 rounded w-1/2 ${isDark?'bg-slate-700':'bg-gray-200'}`}/></div></div>)}</div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center">
            <ScrollText className={`w-12 h-12 mx-auto mb-3 ${isDark?'text-slate-600':'text-gray-300'}`}/>
            <p className={`text-sm ${isDark?'text-slate-400':'text-gray-500'}`}>Không có sự kiện nào</p>
          </div>
        ) : (
          <div className={`divide-y ${isDark?'divide-slate-700':'divide-gray-50'}`}>
            {filtered.map((evt, idx) => {
              const meta = getActionMeta(evt.type); const Icon = meta.icon;
              return (
                <div key={evt.id||idx} className={`p-4 transition-colors ${isDark?'hover:bg-slate-700/50':'hover:bg-gray-50'}`}>
                  <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-lg ${meta.bg} flex-shrink-0`}><Icon className={`w-4 h-4 ${meta.color}`}/></div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-medium ${isDark?'text-white':'text-gray-900'}`}>{evt.title}</p>
                      <p className={`text-xs mt-0.5 ${isDark?'text-slate-400':'text-gray-500'}`}>{evt.description}</p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className={`text-xs ${isDark?'text-slate-500':'text-gray-400'}`}>{new Date(evt.timestamp).toLocaleString('vi-VN')}</p>
                      <p className={`text-xs mt-0.5 font-medium ${isDark?'text-slate-400':'text-gray-500'}`}>{evt.type}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2">
          <button disabled={page===0} onClick={()=>setPage(p=>p-1)} className={`px-4 py-2 rounded-xl text-sm font-medium disabled:opacity-50 ${isDark?'bg-slate-700 text-white':'bg-white border border-gray-200 text-gray-700'}`}>Trước</button>
          <span className={`px-4 py-2 text-sm ${isDark?'text-slate-400':'text-gray-500'}`}>{page+1}/{totalPages}</span>
          <button disabled={page>=totalPages-1} onClick={()=>setPage(p=>p+1)} className={`px-4 py-2 rounded-xl text-sm font-medium disabled:opacity-50 ${isDark?'bg-slate-700 text-white':'bg-white border border-gray-200 text-gray-700'}`}>Sau</button>
        </div>
      )}
    </div>
  );
};

export default AdminAuditTrail;
