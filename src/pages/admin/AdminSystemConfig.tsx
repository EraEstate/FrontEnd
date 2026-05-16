import React, { useState } from 'react';
import { Settings, Shield, Globe, Package, Bell, ToggleLeft, ToggleRight, Save, Info } from 'lucide-react';
import { useAdminTheme } from '../../contexts/AdminThemeContext';
import toast from '../../utils/toast';

interface FeatureFlag {
  id: string; label: string; desc: string; enabled: boolean;
}

const AdminSystemConfig: React.FC = () => {
  const { theme } = useAdminTheme();
  const isDark = theme === 'dark';
  const cardCls = isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-100';

  const [features, setFeatures] = useState<FeatureFlag[]>([
    { id: 'forum', label: 'Diễn đàn cộng đồng', desc: 'Cho phép người dùng đăng bài & thảo luận', enabled: true },
    { id: 'vr_tour', label: 'VR Tour 360°', desc: 'Tính năng xem nhà ảo', enabled: true },
    { id: 'blockchain', label: 'Blockchain Escrow', desc: 'Thanh toán qua smart contract', enabled: false },
    { id: 'ai_chat', label: 'AI Chat Assistant', desc: 'Trợ lý AI hỗ trợ tìm kiếm', enabled: true },
    { id: 'price_alert', label: 'Cảnh báo giá', desc: 'Thông báo khi giá BĐS thay đổi', enabled: true },
    { id: 'maintenance', label: 'Yêu cầu bảo trì', desc: 'Hệ thống quản lý bảo trì', enabled: true },
  ]);

  const toggleFeature = (id: string) => {
    setFeatures(prev => prev.map(f => f.id === id ? { ...f, enabled: !f.enabled } : f));
  };

  const handleSave = () => {
    toast.success('Cấu hình đã được lưu thành công');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className={`text-2xl font-bold ${isDark?'text-white':'text-gray-900'}`}>Cấu hình Hệ thống</h1>
          <p className={`text-sm mt-1 ${isDark?'text-slate-400':'text-gray-500'}`}>Quản lý các tính năng và cấu hình hệ thống</p>
        </div>
        <button onClick={handleSave} className="inline-flex items-center gap-2 px-5 py-2.5 bg-red-600 text-white rounded-xl hover:bg-red-700 transition font-medium shadow-md">
          <Save className="w-4 h-4"/> Lưu cấu hình
        </button>
      </div>

      {/* Info Banner */}
      <div className={`rounded-2xl p-4 border flex items-start gap-3 ${isDark?'bg-blue-900/20 border-blue-900/50':'bg-blue-50 border-blue-100'}`}>
        <Info className={`w-5 h-5 flex-shrink-0 mt-0.5 ${isDark?'text-blue-400':'text-blue-600'}`}/>
        <div>
          <p className={`text-sm font-medium ${isDark?'text-blue-300':'text-blue-800'}`}>Lưu ý quan trọng</p>
          <p className={`text-xs mt-0.5 ${isDark?'text-blue-200/70':'text-blue-700'}`}>
            Thay đổi cấu hình sẽ ảnh hưởng đến toàn bộ hệ thống. Một số tính năng cần khởi động lại server để áp dụng.
          </p>
        </div>
      </div>

      {/* Feature Flags */}
      <div className={`rounded-2xl border ${cardCls}`}>
        <div className={`p-5 border-b flex items-center gap-2 ${isDark?'border-slate-700':'border-gray-100'}`}>
          <Package className={`w-5 h-5 ${isDark?'text-slate-400':'text-gray-500'}`}/>
          <h2 className={`text-base font-semibold ${isDark?'text-white':'text-gray-900'}`}>Tính năng hệ thống</h2>
        </div>
        <div className={`divide-y ${isDark?'divide-slate-700':'divide-gray-50'}`}>
          {features.map(f => (
            <div key={f.id} className={`p-4 flex items-center justify-between transition-colors ${isDark?'hover:bg-slate-700/30':'hover:bg-gray-50'}`}>
              <div>
                <p className={`text-sm font-medium ${isDark?'text-white':'text-gray-900'}`}>{f.label}</p>
                <p className={`text-xs mt-0.5 ${isDark?'text-slate-400':'text-gray-500'}`}>{f.desc}</p>
              </div>
              <button onClick={() => toggleFeature(f.id)} className="flex-shrink-0">
                {f.enabled ? <ToggleRight className="w-8 h-8 text-emerald-500"/> : <ToggleLeft className={`w-8 h-8 ${isDark?'text-slate-500':'text-gray-300'}`}/>}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Security */}
      <div className={`rounded-2xl border ${cardCls}`}>
        <div className={`p-5 border-b flex items-center gap-2 ${isDark?'border-slate-700':'border-gray-100'}`}>
          <Shield className={`w-5 h-5 ${isDark?'text-slate-400':'text-gray-500'}`}/>
          <h2 className={`text-base font-semibold ${isDark?'text-white':'text-gray-900'}`}>Bảo mật</h2>
        </div>
        <div className="p-5 space-y-4">
          {[
            { label: 'Rate Limiting', value: '100 requests/phút', desc: 'Giới hạn API calls mỗi user' },
            { label: 'Session Timeout', value: '30 phút', desc: 'Thời gian hết hạn phiên đăng nhập' },
            { label: 'Max Upload Size', value: '10 MB', desc: 'Kích thước tối đa cho file upload' },
          ].map(item => (
            <div key={item.label} className={`flex items-center justify-between p-3 rounded-xl ${isDark?'bg-slate-700/50':'bg-gray-50'}`}>
              <div>
                <p className={`text-sm font-medium ${isDark?'text-white':'text-gray-900'}`}>{item.label}</p>
                <p className={`text-xs ${isDark?'text-slate-400':'text-gray-500'}`}>{item.desc}</p>
              </div>
              <span className={`text-sm font-semibold px-3 py-1 rounded-lg ${isDark?'bg-slate-600 text-slate-200':'bg-white border border-gray-200 text-gray-700'}`}>{item.value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Notification Settings */}
      <div className={`rounded-2xl border ${cardCls}`}>
        <div className={`p-5 border-b flex items-center gap-2 ${isDark?'border-slate-700':'border-gray-100'}`}>
          <Bell className={`w-5 h-5 ${isDark?'text-slate-400':'text-gray-500'}`}/>
          <h2 className={`text-base font-semibold ${isDark?'text-white':'text-gray-900'}`}>Thông báo</h2>
        </div>
        <div className="p-5 space-y-3">
          {[
            { label: 'Email thông báo BĐS mới', enabled: true },
            { label: 'Email khi có báo cáo vi phạm', enabled: true },
            { label: 'SMS cho thanh toán', enabled: false },
          ].map(item => (
            <div key={item.label} className={`flex items-center justify-between p-3 rounded-xl ${isDark?'bg-slate-700/50':'bg-gray-50'}`}>
              <span className={`text-sm ${isDark?'text-slate-200':'text-gray-700'}`}>{item.label}</span>
              {item.enabled ? <ToggleRight className="w-7 h-7 text-emerald-500"/> : <ToggleLeft className={`w-7 h-7 ${isDark?'text-slate-500':'text-gray-300'}`}/>}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminSystemConfig;
