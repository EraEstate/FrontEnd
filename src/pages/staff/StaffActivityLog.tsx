import React, { useState, useEffect, useCallback } from 'react';
import { Activity, Eye, Heart, MessageSquare, MapPin, FileText, Filter, Calendar } from 'lucide-react';
import { activityAPI, type ActivityResponse } from '../../api/activity';
import { useAdminTheme } from '../../contexts/AdminThemeContext';
import toast from '../../utils/toast';

const StaffActivityLog: React.FC = () => {
  const { theme } = useAdminTheme();
  const isDark = theme === 'dark';
  const [activities, setActivities] = useState<ActivityResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState<string>('');
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const fetchActivities = useCallback(async () => {
    try {
      setLoading(true);
      const data = await activityAPI.getUserActivities(page, 20, typeFilter || undefined);
      setActivities(data.content || []);
      setTotalPages(data.totalPages || 1);
    } catch { toast.error('Không thể tải nhật ký'); } finally { setLoading(false); }
  }, [page, typeFilter]);

  useEffect(() => { fetchActivities(); }, [fetchActivities]);

  const getIcon = (type: string) => {
    const m: Record<string, { icon: React.ElementType; color: string; bg: string; label: string }> = {
      PROPERTY_VIEWED: { icon: Eye, color: 'text-green-600', bg: isDark ? 'bg-green-900/30' : 'bg-green-50', label: 'Xem BĐS' },
      PROPERTY_FAVORITED: { icon: Heart, color: 'text-red-600', bg: isDark ? 'bg-red-900/30' : 'bg-red-50', label: 'Yêu thích' },
      PROPERTY_INQUIRY: { icon: MessageSquare, color: 'text-purple-600', bg: isDark ? 'bg-purple-900/30' : 'bg-purple-50', label: 'Tư vấn' },
      PROPERTY_POSTED: { icon: MapPin, color: 'text-blue-600', bg: isDark ? 'bg-blue-900/30' : 'bg-blue-50', label: 'Đăng tin' },
      PROPERTY_UPDATED: { icon: FileText, color: 'text-amber-600', bg: isDark ? 'bg-amber-900/30' : 'bg-amber-50', label: 'Cập nhật' },
    };
    return m[type] || { icon: Activity, color: 'text-gray-600', bg: 'bg-gray-50', label: type };
  };

  const relTime = (ts: string) => {
    const d = Date.now() - new Date(ts).getTime(), m = Math.floor(d/60000);
    if (m < 1) return 'Vừa xong'; if (m < 60) return `${m} phút trước`;
    const h = Math.floor(m/60); if (h < 24) return `${h} giờ trước`;
    return new Date(ts).toLocaleDateString('vi-VN');
  };

  const grouped = activities.reduce<Record<string, ActivityResponse[]>>((a, act) => {
    const dt = new Date(act.timestamp).toLocaleDateString('vi-VN');
    (a[dt] = a[dt] || []).push(act); return a;
  }, {});

  const cardCls = isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-100';

  return (
    <div className="space-y-6">
      <div>
        <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>Nhật ký Hoạt động</h1>
        <p className={`text-sm mt-1 ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>Theo dõi hoạt động hệ thống</p>
      </div>

      <div className={`flex gap-3 items-center p-4 rounded-2xl border ${cardCls}`}>
        <Filter className={`w-4 h-4 ${isDark ? 'text-slate-400' : 'text-gray-400'}`} />
        <select value={typeFilter} onChange={e => { setTypeFilter(e.target.value); setPage(0); }}
          className={`px-4 py-2.5 rounded-xl text-sm border ${isDark ? 'bg-slate-700 border-slate-600 text-white' : 'bg-gray-50 border-gray-200'}`}>
          <option value="">Tất cả</option>
          <option value="VIEWED">Xem BĐS</option>
          <option value="FAVORITED">Yêu thích</option>
          <option value="INQUIRY">Tư vấn</option>
          <option value="POSTED">Đăng tin</option>
        </select>
      </div>

      {loading ? (
        <div className="space-y-3">{[1,2,3].map(i => (
          <div key={i} className={`p-4 rounded-2xl border animate-pulse ${cardCls}`}>
            <div className="flex gap-4"><div className={`w-10 h-10 rounded-full ${isDark?'bg-slate-700':'bg-gray-200'}`}/><div className="flex-1 space-y-2"><div className={`h-4 rounded w-3/4 ${isDark?'bg-slate-700':'bg-gray-200'}`}/><div className={`h-3 rounded w-1/2 ${isDark?'bg-slate-700':'bg-gray-200'}`}/></div></div>
          </div>
        ))}</div>
      ) : Object.keys(grouped).length === 0 ? (
        <div className={`p-12 text-center rounded-2xl border ${cardCls}`}>
          <Activity className={`w-12 h-12 mx-auto mb-3 ${isDark?'text-slate-600':'text-gray-300'}`}/>
          <p className={`text-sm ${isDark?'text-slate-400':'text-gray-500'}`}>Chưa có hoạt động</p>
        </div>
      ) : Object.entries(grouped).map(([date, items]) => (
        <div key={date}>
          <div className="flex items-center gap-2 mb-3">
            <Calendar className={`w-4 h-4 ${isDark?'text-slate-500':'text-gray-400'}`}/>
            <span className={`text-xs font-bold uppercase tracking-wider ${isDark?'text-slate-500':'text-gray-400'}`}>{date}</span>
            <div className={`flex-1 h-px ${isDark?'bg-slate-700':'bg-gray-200'}`}/>
          </div>
          <div className={`rounded-2xl border overflow-hidden ${cardCls}`}>
            <div className={`divide-y ${isDark?'divide-slate-700':'divide-gray-50'}`}>
              {items.map((act, idx) => {
                const meta = getIcon(act.type); const Icon = meta.icon;
                return (
                  <div key={act.id||idx} className={`p-4 transition-colors ${isDark?'hover:bg-slate-700/50':'hover:bg-gray-50'}`}>
                    <div className="flex items-start gap-3">
                      <div className={`p-2.5 rounded-xl ${meta.bg} flex-shrink-0`}><Icon className={`w-4 h-4 ${meta.color}`}/></div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className={`text-sm font-medium ${isDark?'text-white':'text-gray-900'}`}>{act.title}</span>
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${isDark?'bg-slate-700 text-slate-300':'bg-gray-100 text-gray-600'}`}>{meta.label}</span>
                        </div>
                        <p className={`text-xs mt-0.5 ${isDark?'text-slate-400':'text-gray-500'}`}>{act.description}</p>
                        <p className={`text-xs mt-1 ${isDark?'text-slate-500':'text-gray-400'}`}>{relTime(act.timestamp)}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      ))}

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

export default StaffActivityLog;
