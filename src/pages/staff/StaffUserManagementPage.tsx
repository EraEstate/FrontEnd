import React, { useState, useEffect, useCallback } from 'react';
import {
  Users, UserCog, Shield, Search, Eye, Lock, Unlock,
  Edit2, X, Loader2, Mail, Phone, Calendar, RefreshCw,
  CheckCircle, XCircle, ChevronDown, ChevronUp
} from 'lucide-react';
import { userAPI } from '../../api/user';
import { relativeTime } from '../../utils/relativeTime';
import { useDebounce } from '../../hooks/useDebounce';
import toast from '../../utils/toast';

// ─── Types ───
interface UserRecord {
  id: string;
  fullName?: string;
  email?: string;
  phone?: string;
  role: 'USER' | 'STAFF' | 'ADMIN';
  enabled: boolean;
  createdAt?: string;
  updatedAt?: string;
}

type RoleTab = 'ALL' | 'USER' | 'STAFF' | 'ADMIN';

const roleConfig: { key: RoleTab; label: string; icon: React.ReactNode; color: string }[] = [
  { key: 'ALL', label: 'Tất cả', icon: <Users className="w-4 h-4" />, color: 'bg-gray-500' },
  { key: 'USER', label: 'Người dùng', icon: <Users className="w-4 h-4" />, color: 'bg-blue-500' },
  { key: 'STAFF', label: 'Nhân viên', icon: <UserCog className="w-4 h-4" />, color: 'bg-emerald-500' },
  { key: 'ADMIN', label: 'Quản trị', icon: <Shield className="w-4 h-4" />, color: 'bg-purple-500' },
];

const getRoleBadge = (role: string) => {
  const map: Record<string, string> = {
    ADMIN: 'bg-purple-100 text-purple-700',
    STAFF: 'bg-emerald-100 text-emerald-700',
    USER: 'bg-blue-100 text-blue-700',
  };
  return map[role] || map.USER;
};

const getRoleLabel = (role: string) => {
  const labels: Record<string, string> = { ADMIN: 'Admin', STAFF: 'Staff', USER: 'User' };
  return labels[role] || role;
};

// ─── Edit Modal (Staff version: no role change, no delete) ───
const EditUserModal: React.FC<{
  user: UserRecord | null;
  open: boolean;
  onClose: () => void;
  onSave: () => void;
}> = ({ user, open, onClose, onSave }) => {
  const [formData, setFormData] = useState({ fullName: '', phone: '' });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user && open) {
      setFormData({ fullName: user.fullName || '', phone: user.phone || '' });
    }
  }, [user, open]);

  if (!open || !user) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.fullName.trim()) { toast.error('Họ tên không được để trống'); return; }
    try {
      setLoading(true);
      await userAPI.update(user.id, { fullName: formData.fullName, phone: formData.phone });
      toast.success('Đã cập nhật thông tin');
      onSave();
      onClose();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Không thể cập nhật');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <button
        type="button"
        aria-label="Close edit user modal"
        className="absolute inset-0 bg-gray-950/40 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden">
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Chỉnh sửa thông tin</h3>
            <p className="text-sm text-gray-500 mt-0.5">{user.email}</p>
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-gray-100 rounded-lg"><X className="w-5 h-5 text-gray-500" /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label htmlFor="staff-user-full-name" className="text-sm font-medium text-gray-700 mb-1.5 block">Họ và tên</label>
            <input id="staff-user-full-name" type="text" value={formData.fullName} onChange={e => setFormData(prev => ({ ...prev, fullName: e.target.value }))}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-red-500 focus:border-transparent" required />
          </div>
          <div>
            <label htmlFor="staff-user-phone" className="text-sm font-medium text-gray-700 mb-1.5 block">Số điện thoại</label>
            <input id="staff-user-phone" type="tel" value={formData.phone} onChange={e => setFormData(prev => ({ ...prev, phone: e.target.value }))}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-red-500 focus:border-transparent" />
          </div>
          <div className="bg-gray-50 rounded-xl p-3 border border-gray-100">
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <Shield className="w-3.5 h-3.5" />
              <span>Role: <span className={`px-1.5 py-0.5 rounded-md text-xs font-medium ${getRoleBadge(user.role)}`}>{getRoleLabel(user.role)}</span></span>
              <span className="text-gray-300">•</span>
              <span>Chỉ Admin mới có thể đổi role</span>
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-100 text-sm font-medium">Hủy</button>
            <button type="submit" disabled={loading}
              className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-xl hover:bg-red-700 disabled:opacity-50 text-sm font-medium flex items-center justify-center gap-2">
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Edit2 className="w-4 h-4" />} Lưu
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ─── Main ───
const StaffUserManagementPage: React.FC = () => {
  const [users, setUsers] = useState<UserRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<RoleTab>('ALL');
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearch = useDebounce(searchQuery, 300);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [editModal, setEditModal] = useState<{ open: boolean; user: UserRecord | null }>({ open: false, user: null });
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [tabCounts, setTabCounts] = useState<Record<RoleTab, number>>({ ALL: 0, USER: 0, STAFF: 0, ADMIN: 0 });

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      let response;
      if (activeTab === 'ALL') {
        response = await userAPI.getAll(currentPage, 20);
      } else {
        response = await userAPI.getByRole(activeTab, currentPage, 20);
      }
      setUsers(response.content || []);
      setTotalPages(response.totalPages || 1);
    } catch {
      toast.error('Không thể tải danh sách người dùng');
    } finally {
      setLoading(false);
    }
  }, [activeTab, currentPage]);

  const fetchTabCounts = useCallback(async () => {
    try {
      const [userRes, staffRes, adminRes] = await Promise.all([
        userAPI.getByRole('USER', 0, 1).catch(() => ({ totalElements: 0 })),
        userAPI.getByRole('STAFF', 0, 1).catch(() => ({ totalElements: 0 })),
        userAPI.getByRole('ADMIN', 0, 1).catch(() => ({ totalElements: 0 })),
      ]);
      const u = userRes.totalElements || 0;
      const s = staffRes.totalElements || 0;
      const a = adminRes.totalElements || 0;
      setTabCounts({ ALL: u + s + a, USER: u, STAFF: s, ADMIN: a });
    } catch { /* silent */ }
  }, []);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);
  useEffect(() => { fetchTabCounts(); }, [fetchTabCounts]);

  const handleToggleEnabled = async (user: UserRecord) => {
    const action = user.enabled ? 'khóa' : 'mở khóa';
    const backup = [...users];
    // Optimistic
    setUsers(prev => prev.map(u => u.id === user.id ? { ...u, enabled: !u.enabled } : u));
    try {
      setProcessingId(user.id);
      if (user.enabled) {
        await userAPI.disable(user.id);
      } else {
        await userAPI.enable(user.id);
      }
      toast.success(`Đã ${action} tài khoản ${user.fullName || user.email}`);
      fetchTabCounts();
    } catch (err: any) {
      setUsers(backup);
      toast.error(err.response?.data?.message || `Không thể ${action} tài khoản`);
    } finally {
      setProcessingId(null);
    }
  };

  // Filter by search
  const filtered = users.filter(u => {
    if (!debouncedSearch) return true;
    const q = debouncedSearch.toLowerCase();
    return u.fullName?.toLowerCase().includes(q) || u.email?.toLowerCase().includes(q) || u.phone?.includes(q);
  });

  const handleTabChange = (tab: RoleTab) => {
    setActiveTab(tab);
    setCurrentPage(0);
    setSearchQuery('');
    setExpandedId(null);
  };

  // Skeleton
  if (loading && users.length === 0) {
    return (
      <div className="space-y-4">
        <div className="h-8 w-56 bg-gray-200 rounded animate-pulse" />
        <div className="flex gap-2">{[1, 2, 3, 4].map(slot => <div key={`staff-user-tab-skeleton-${slot}`} className="h-10 w-24 bg-gray-200 rounded-xl animate-pulse" />)}</div>
        {[1, 2, 3, 4].map(slot => (
          <div key={`staff-user-card-skeleton-${slot}`} className="bg-white rounded-2xl p-5 animate-pulse">
            <div className="flex gap-4"><div className="w-10 h-10 bg-gray-200 rounded-full" /><div className="flex-1 space-y-2"><div className="h-4 bg-gray-200 rounded w-1/3" /><div className="h-3 bg-gray-200 rounded w-1/2" /></div></div>
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
          <h1 className="text-2xl font-semibold text-gray-900">Quản lý người dùng</h1>
          <p className="text-sm text-gray-500 mt-1">Xem thông tin, chỉnh sửa và khóa/mở khóa tài khoản</p>
        </div>
        <button onClick={() => { fetchUsers(); fetchTabCounts(); }} className="p-2 text-gray-400 hover:bg-gray-100 rounded-lg transition-colors" title="Làm mới">
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
          placeholder="Tìm theo tên, email, SĐT..."
          className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-red-500 focus:border-transparent" />
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2">
        {roleConfig.map(tab => (
          <button key={tab.key} onClick={() => handleTabChange(tab.key)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all flex items-center gap-2 ${
              activeTab === tab.key ? 'bg-gray-900 text-white shadow-sm' : 'bg-white text-gray-600 border border-gray-200 hover:border-gray-300'
            }`}>
            {tab.icon} {tab.label}
            {tabCounts[tab.key] > 0 && (
              <span className={`px-1.5 py-0.5 text-xs font-bold rounded-full min-w-[18px] text-center ${
                activeTab === tab.key ? 'bg-white/20 text-white' : 'bg-gray-200 text-gray-600'
              }`}>{tabCounts[tab.key]}</span>
            )}
          </button>
        ))}
      </div>

      {/* List */}
      {filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-10 text-center">
          <Users className="w-14 h-14 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-600 font-medium">Không có người dùng nào</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(user => {
            const isProcessing = processingId === user.id;
            const isExpanded = expandedId === user.id;

            return (
              <div key={user.id} className="bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
                <div className="p-4 flex items-center gap-4">
                  {/* Avatar */}
                  <div className="w-11 h-11 rounded-full bg-gradient-to-br from-red-400 to-red-600 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                    {user.fullName?.charAt(0)?.toUpperCase() || user.email?.charAt(0)?.toUpperCase() || 'U'}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-0.5">
                      <h3 className="text-base font-semibold text-gray-900 truncate">{user.fullName || 'Chưa đặt tên'}</h3>
                      <span className={`px-2 py-0.5 text-xs font-medium rounded-lg ${getRoleBadge(user.role)}`}>
                        {getRoleLabel(user.role)}
                      </span>
                      {!user.enabled && (
                        <span className="px-2 py-0.5 text-xs font-medium bg-red-100 text-red-700 rounded-lg flex items-center gap-1">
                          <Lock className="w-3 h-3" /> Đã khóa
                        </span>
                      )}
                    </div>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-500">
                      <span className="flex items-center gap-1"><Mail className="w-3 h-3" />{user.email}</span>
                      {user.phone && <span className="flex items-center gap-1"><Phone className="w-3 h-3" />{user.phone}</span>}
                      {user.createdAt && <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{relativeTime(user.createdAt)}</span>}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button onClick={() => setExpandedId(isExpanded ? null : user.id)}
                      className="p-2 text-gray-400 hover:bg-gray-100 rounded-lg transition-colors">
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                    <button onClick={() => setEditModal({ open: true, user })}
                      className="p-2 text-gray-400 hover:bg-gray-100 rounded-lg transition-colors" title="Chỉnh sửa">
                      <Edit2 className="w-4 h-4" />
                    </button>

                    {/* Lock/Unlock — không cho lock Admin */}
                    {user.role !== 'ADMIN' && (
                      <button onClick={() => handleToggleEnabled(user)} disabled={isProcessing}
                        className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium transition-all disabled:opacity-50 ${
                          user.enabled
                            ? 'bg-red-100 text-red-700 hover:bg-red-200'
                            : 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
                        }`}>
                        {isProcessing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : user.enabled ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
                        {user.enabled ? 'Khóa' : 'Mở khóa'}
                      </button>
                    )}
                  </div>
                </div>

                {/* Expanded Detail */}
                {isExpanded && (
                  <div className="border-t border-gray-100 bg-gray-50 p-5">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                      <div className="bg-white rounded-xl p-3 border border-gray-200">
                        <p className="text-xs text-gray-500 mb-1">ID</p>
                        <p className="text-sm font-mono text-gray-700 truncate" title={user.id}>{user.id}</p>
                      </div>
                      <div className="bg-white rounded-xl p-3 border border-gray-200">
                        <p className="text-xs text-gray-500 mb-1">Email</p>
                        <p className="text-sm text-gray-700">{user.email || 'N/A'}</p>
                      </div>
                      <div className="bg-white rounded-xl p-3 border border-gray-200">
                        <p className="text-xs text-gray-500 mb-1">Trạng thái</p>
                        <p className="text-sm font-medium flex items-center gap-1.5">
                          {user.enabled ? <><CheckCircle className="w-4 h-4 text-emerald-500" /> Đang hoạt động</> : <><XCircle className="w-4 h-4 text-red-500" /> Đã khóa</>}
                        </p>
                      </div>
                      <div className="bg-white rounded-xl p-3 border border-gray-200">
                        <p className="text-xs text-gray-500 mb-1">Ngày tạo</p>
                        <p suppressHydrationWarning className="text-sm text-gray-700">{user.createdAt ? new Date(user.createdAt).toLocaleDateString('vi-VN') : 'N/A'}</p>
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

      <EditUserModal open={editModal.open} user={editModal.user}
        onClose={() => setEditModal({ open: false, user: null })}
        onSave={() => { fetchUsers(); fetchTabCounts(); }} />
    </div>
  );
};

export default StaffUserManagementPage;
