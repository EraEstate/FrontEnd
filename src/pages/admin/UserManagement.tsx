import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  Search, Filter, Plus, Edit2, Trash2, Eye, 
  Check, X, Download, Mail, Phone, MoreVertical,
  UserCheck, UserX, Shield, Loader2, Users, UserCog
} from 'lucide-react';
import { userAPI } from '../../api/user';
import { getImageUrl } from '../../utils/imageUtils';
import api from '../../api/index';
import toast from '../../utils/toast';

interface User {
  id: string;
  fullName?: string;
  email?: string;
  phone?: string;
  role: 'USER' | 'STAFF' | 'ADMIN';
  enabled: boolean;
  createdAt?: string;
  updatedAt?: string;
  avatar?: string;
  avatarUrl?: string;
  profile?: {
    avatarUrl?: string;
  };
}

interface EditUserModalProps {
  user: User | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
}

// Edit User Modal Component
const EditUserModal: React.FC<EditUserModalProps> = ({ user, isOpen, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    role: 'USER' as User['role'],
    enabled: true
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (user) {
      setFormData({
        fullName: user.fullName || '',
        email: user.email || '',
        phone: user.phone || '',
        role: user.role,
        enabled: user.enabled !== undefined ? user.enabled : true
      });
    } else {
      // Reset form for new user
      setFormData({
        fullName: '',
        email: '',
        phone: '',
        role: 'USER',
        enabled: true
      });
    }
    setError('');
  }, [user, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setLoading(true);
    setError('');

    try {
      if (user) {
        // Update existing user
        await userAPI.update(user.id, formData);
      } else {
        // Create new user
        if (!formData.email || !formData.fullName) {
          setError('Email và Họ tên là bắt buộc');
          setLoading(false);
          return;
        }
        // Generate a temporary password (user should change it later)
        const tempPassword = Math.random().toString(36).slice(-8) + 'A1!';
        await userAPI.create({
          email: formData.email,
          password: tempPassword,
          fullName: formData.fullName,
          phone: formData.phone,
          role: formData.role,
          enabled: formData.enabled
        });
      }
      onSave();
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.message || `Có lỗi xảy ra khi ${user ? 'cập nhật' : 'tạo'} user`);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-gray-900">
              {user ? 'Chỉnh sửa User' : 'Tạo User Mới'}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Họ và tên
              </label>
              <input
                type="text"
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
                disabled={!!user}
              />
              {user && (
                <p className="mt-1 text-xs text-gray-500">Email không thể thay đổi</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Số điện thoại
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Vai trò (Role)
              </label>
              <select
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value as User['role'] })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="USER">User</option>
                <option value="STAFF">Staff</option>
                <option value="ADMIN">Admin</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="enabled"
                checked={formData.enabled || false}
                onChange={(e) => setFormData({ ...formData, enabled: e.target.checked })}
                className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
              />
              <label htmlFor="enabled" className="text-sm font-medium text-gray-700">
                Kích hoạt tài khoản
              </label>
              {!formData.enabled && (
                <span className="text-xs text-red-600 ml-2">(Tài khoản chưa được kích hoạt)</span>
              )}
            </div>

            <div className="flex items-center gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Hủy
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Đang {user ? 'lưu' : 'tạo'}...
                  </>
                ) : (
                  user ? 'Lưu thay đổi' : 'Tạo user'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

type RoleTab = 'USER' | 'STAFF' | 'ADMIN';

const UserManagement: React.FC = () => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<RoleTab>('USER');
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);
  
  // Stats for each role
  const [roleStats, setRoleStats] = useState({
    USER: { total: 0, active: 0, inactive: 0 },
    STAFF: { total: 0, active: 0, inactive: 0 },
    ADMIN: { total: 0, active: 0, inactive: 0 }
  });

  useEffect(() => {
    fetchUsers();
    fetchRoleStats();
  }, [currentPage, activeTab]);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchUsers();
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  const fetchRoleStats = async () => {
    try {
      const [userUsers, staffUsers, adminUsers] = await Promise.all([
        userAPI.getByRole('USER', 0, 1000).catch(() => ({ content: [] })),
        userAPI.getByRole('STAFF', 0, 1000).catch(() => ({ content: [] })),
        userAPI.getByRole('ADMIN', 0, 1000).catch(() => ({ content: [] }))
      ]);

      setRoleStats({
        USER: {
          total: userUsers.content?.length || 0,
          active: userUsers.content?.filter((u: User) => u.enabled).length || 0,
          inactive: userUsers.content?.filter((u: User) => !u.enabled).length || 0
        },
        STAFF: {
          total: staffUsers.content?.length || 0,
          active: staffUsers.content?.filter((u: User) => u.enabled).length || 0,
          inactive: staffUsers.content?.filter((u: User) => !u.enabled).length || 0
        },
        ADMIN: {
          total: adminUsers.content?.length || 0,
          active: adminUsers.content?.filter((u: User) => u.enabled).length || 0,
          inactive: adminUsers.content?.filter((u: User) => !u.enabled).length || 0
        }
      });
    } catch (error) {
      console.error('Failed to fetch role stats:', error);
    }
  };

  const fetchUsers = async () => {
    try {
      setLoading(true);
      let response;

      // Always filter by active tab role
      response = await userAPI.getByRole(activeTab, currentPage, 20);

      // Filter by search term if needed
      let filteredContent = response.content || [];
      if (searchTerm) {
        filteredContent = filteredContent.filter((user: User) =>
          user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.phone?.toLowerCase().includes(searchTerm.toLowerCase())
        );
      }

      // Map and normalize user data to ensure createdAt is available
      const mappedUsers = filteredContent.map((user: any) => {
        const createdAt = user.createdAt || user.created_at || user.createdDate || user.dateCreated || null;
        return {
          ...user,
          createdAt: createdAt
        };
      });

      setUsers(mappedUsers);
      setTotalPages(response.totalPages || 1);
      setTotalElements(response.totalElements || 0);
    } catch (error) {
      console.error('Failed to fetch users:', error);
      toast.error('Không thể tải danh sách users. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectUser = (userId: string) => {
    setSelectedUsers(prev => 
      prev.includes(userId) 
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const handleSelectAll = () => {
    if (selectedUsers.length === users.length) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers(users.map(u => u.id));
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa user này?')) {
      try {
        setActionLoading(userId);
        await userAPI.delete(userId);
        toast.success('Xóa user thành công!');
        fetchUsers();
        fetchRoleStats();
      } catch (error: any) {
        toast.error(error.response?.data?.message || 'Không thể xóa user. Vui lòng thử lại.');
      } finally {
        setActionLoading(null);
      }
    }
  };

  const handleBulkDelete = async () => {
    if (window.confirm(`Bạn có chắc chắn muốn xóa ${selectedUsers.length} users?`)) {
      try {
        setActionLoading('bulk');
        await Promise.all(selectedUsers.map(id => userAPI.delete(id)));
        toast.success(`Đã xóa ${selectedUsers.length} users thành công!`);
        setSelectedUsers([]);
        fetchUsers();
        fetchRoleStats();
      } catch (error: any) {
        toast.error('Có lỗi xảy ra khi xóa users. Vui lòng thử lại.');
      } finally {
        setActionLoading(null);
      }
    }
  };

  const handleChangeRole = async (userId: string, newRole: User['role']) => {
    try {
      setActionLoading(userId);
      await userAPI.changeRole(userId, newRole);
      toast.success(`Đã đổi role thành công!`);
      fetchUsers();
      fetchRoleStats();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Không thể đổi role. Vui lòng thử lại.');
    } finally {
      setActionLoading(null);
    }
  };

  const handleToggleEnabled = async (userId: string, currentEnabled: boolean) => {
    const action = currentEnabled ? 'vô hiệu hóa' : 'kích hoạt';
    if (!window.confirm(`Bạn có chắc chắn muốn ${action} tài khoản này?`)) {
      return;
    }

    try {
      setActionLoading(userId);
      let result;
      if (currentEnabled) {
        result = await userAPI.disable(userId);
      } else {
        result = await userAPI.enable(userId);
      }
      
      // Refresh data
      await fetchUsers();
      await fetchRoleStats();
      
      toast.success(`Đã ${action} user thành công!`);
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Không thể thay đổi trạng thái. Vui lòng thử lại.';
      toast.error(errorMessage);
    } finally {
      setActionLoading(null);
    }
  };

  const handleEditUser = (user: User) => {
    setEditingUser(user);
    setShowEditModal(true);
  };

  const handleCreateUser = () => {
    setEditingUser(null);
    setShowEditModal(true);
  };

  const getRoleBadge = (role: string) => {
    const styles = {
      ADMIN: 'bg-purple-100 text-purple-800 border-purple-200',
      STAFF: 'bg-blue-100 text-blue-800 border-blue-200',
      USER: 'bg-gray-100 text-gray-800 border-gray-200'
    };
    return styles[role as keyof typeof styles] || styles.USER;
  };

  const getRoleLabel = (role: string) => {
    const labels: Record<string, string> = {
      ADMIN: 'Admin',
      STAFF: 'Staff',
      USER: 'User'
    };
    return labels[role] || role;
  };

  // Component để hiển thị avatar với fallback
  const UserAvatar: React.FC<{ user: User }> = ({ user }) => {
    const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
      // Nếu đã có avatar trong user object, dùng luôn
      if (user.avatar || user.avatarUrl || user.profile?.avatarUrl) {
        setAvatarUrl(user.avatar || user.avatarUrl || user.profile?.avatarUrl || null);
        setLoading(false);
        return;
      }

      // Nếu không có, thử fetch từ public endpoint
      const fetchAvatar = async () => {
        try {
          const response = await api.get(`/users/${user.id}/public`);
          if (response.data?.avatarUrl) {
            setAvatarUrl(response.data.avatarUrl);
          }
        } catch (error) {
          // Nếu không có avatar, giữ null
          console.debug(`No avatar for user ${user.id}`);
        } finally {
          setLoading(false);
        }
      };

      fetchAvatar();
    }, [user.id, user.avatar, user.avatarUrl, user.profile?.avatarUrl]);

    const imageUrl = avatarUrl ? getImageUrl(avatarUrl) : null;

    return (
      <div className="relative w-10 h-10 flex-shrink-0">
        {/* Fallback div - luôn hiển thị */}
        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
          {user.fullName?.charAt(0).toUpperCase() || user.email?.charAt(0).toUpperCase() || 'U'}
        </div>
        {/* Avatar image - overlay lên trên nếu có */}
        {!loading && imageUrl && (
          <img 
            src={imageUrl} 
            alt={user.fullName || 'User'} 
            className="absolute inset-0 w-10 h-10 rounded-full object-cover"
            onError={(e) => {
              // Ẩn img nếu lỗi, fallback div sẽ hiển thị
              e.currentTarget.style.display = 'none';
            }}
          />
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t('admin.menu.users')}</h1>
          <p className="text-sm text-gray-500 mt-1">{t('admin.userManagement.subtitle')}</p>
        </div>
        <button 
          onClick={handleCreateUser}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Tạo user mới
        </button>
      </div>

      {/* Role Tabs */}
      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <div className="border-b border-gray-200">
          <nav className="flex -mb-px">
            <button
              onClick={() => {
                setActiveTab('USER');
                setCurrentPage(0);
                setSearchTerm('');
              }}
              className={`flex-1 px-6 py-4 text-center font-medium border-b-2 transition-colors ${
                activeTab === 'USER'
                  ? 'border-blue-600 text-blue-600 bg-blue-50'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center justify-center gap-2">
                <Users className="w-5 h-5" />
                <span>Người dùng</span>
                <span className={`ml-2 px-2 py-0.5 rounded-full text-xs ${
                  activeTab === 'USER' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'
                }`}>
                  {roleStats.USER.total}
                </span>
              </div>
            </button>
            <button
              onClick={() => {
                setActiveTab('STAFF');
                setCurrentPage(0);
                setSearchTerm('');
              }}
              className={`flex-1 px-6 py-4 text-center font-medium border-b-2 transition-colors ${
                activeTab === 'STAFF'
                  ? 'border-blue-600 text-blue-600 bg-blue-50'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center justify-center gap-2">
                <UserCog className="w-5 h-5" />
                <span>Nhân viên</span>
                <span className={`ml-2 px-2 py-0.5 rounded-full text-xs ${
                  activeTab === 'STAFF' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'
                }`}>
                  {roleStats.STAFF.total}
                </span>
              </div>
            </button>
            <button
              onClick={() => {
                setActiveTab('ADMIN');
                setCurrentPage(0);
                setSearchTerm('');
              }}
              className={`flex-1 px-6 py-4 text-center font-medium border-b-2 transition-colors ${
                activeTab === 'ADMIN'
                  ? 'border-blue-600 text-blue-600 bg-blue-50'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center justify-center gap-2">
                <Shield className="w-5 h-5" />
                <span>Quản trị viên</span>
                <span className={`ml-2 px-2 py-0.5 rounded-full text-xs ${
                  activeTab === 'ADMIN' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'
                }`}>
                  {roleStats.ADMIN.total}
                </span>
              </div>
            </button>
          </nav>
        </div>

        {/* Stats Cards */}
        <div className="p-4 bg-gray-50 border-b border-gray-200">
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-white rounded-lg p-3 border border-gray-200">
              <div className="text-sm text-gray-600 mb-1">Tổng số</div>
              <div className="text-2xl font-bold text-gray-900">{roleStats[activeTab].total}</div>
            </div>
            <div className="bg-white rounded-lg p-3 border border-green-200 bg-green-50">
              <div className="text-sm text-green-700 mb-1">Đang hoạt động</div>
              <div className="text-2xl font-bold text-green-700">{roleStats[activeTab].active}</div>
            </div>
            <div className="bg-white rounded-lg p-3 border border-red-200 bg-red-50">
              <div className="text-sm text-red-700 mb-1">Đã vô hiệu hóa</div>
              <div className="text-2xl font-bold text-red-700">{roleStats[activeTab].inactive}</div>
            </div>
          </div>
        </div>

        {/* Toolbar */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex flex-wrap items-center gap-4">
            {/* Search */}
            <div className="flex-1 min-w-[300px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder={`Tìm kiếm ${activeTab === 'USER' ? 'người dùng' : activeTab === 'STAFF' ? 'nhân viên' : 'quản trị viên'}...`}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Filter Button */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Filter className="w-4 h-4" />
              {t('common.filter')}
            </button>

          {/* Bulk Actions */}
          {selectedUsers.length > 0 && (
            <>
              <div className="h-8 w-px bg-gray-300"></div>
              <button
                onClick={handleBulkDelete}
                className="flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                {t('admin.deleteSelected')} ({selectedUsers.length})
              </button>
            </>
          )}

          {/* Export */}
          <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
            <Download className="w-4 h-4" />
            {t('admin.export')}
          </button>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-xl shadow-md overflow-hidden border-t border-gray-200">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left">
                  <input
                    type="checkbox"
                    checked={selectedUsers.length === users.length && users.length > 0}
                    onChange={handleSelectAll}
                    className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                  />
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  {t('admin.user')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  {t('admin.role')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  {t('admin.contact')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  {t('admin.status')}
                </th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  {t('admin.actions')}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                    {t('common.loading')}
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                    {t('admin.noUsers')}
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <input
                        type="checkbox"
                        checked={selectedUsers.includes(user.id)}
                        onChange={() => handleSelectUser(user.id)}
                        className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                      />
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <UserAvatar user={user} />
                        <div>
                          <div className="font-medium text-gray-900">{user.fullName || 'N/A'}</div>
                          <div className="text-sm text-gray-500">{user.email || 'N/A'}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getRoleBadge(user.role)}`}>
                          {getRoleLabel(user.role)}
                        </span>
                        <div className="relative">
                          <button
                            onClick={() => setOpenDropdownId(openDropdownId === user.id ? null : user.id)}
                            className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                            disabled={actionLoading === user.id}
                          >
                            {actionLoading === user.id ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <MoreVertical className="w-4 h-4" />
                            )}
                          </button>
                          {openDropdownId === user.id && (
                            <>
                              <div 
                                className="fixed inset-0 z-10" 
                                onClick={() => setOpenDropdownId(null)}
                              />
                              <div className="absolute right-0 mt-1 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-20">
                            <div className="py-1">
                              <button
                                onClick={() => {
                                  handleChangeRole(user.id, 'USER');
                                  setOpenDropdownId(null);
                                }}
                                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                              >
                                <Shield className="w-4 h-4" />
                                Đổi thành User
                              </button>
                              <button
                                onClick={() => {
                                  handleChangeRole(user.id, 'STAFF');
                                  setOpenDropdownId(null);
                                }}
                                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                              >
                                <Shield className="w-4 h-4" />
                                Đổi thành Staff
                              </button>
                              <button
                                onClick={() => {
                                  handleChangeRole(user.id, 'ADMIN');
                                  setOpenDropdownId(null);
                                }}
                                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                              >
                                <Shield className="w-4 h-4" />
                                Đổi thành Admin
                              </button>
                              <div className="border-t border-gray-200 my-1"></div>
                              <button
                                onClick={() => {
                                  handleToggleEnabled(user.id, user.enabled);
                                  setOpenDropdownId(null);
                                }}
                                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                              >
                                {user.enabled ? (
                                  <>
                                    <UserX className="w-4 h-4" />
                                    Vô hiệu hóa
                                  </>
                                ) : (
                                  <>
                                    <UserCheck className="w-4 h-4" />
                                    Kích hoạt
                                  </>
                                )}
                              </button>
                            </div>
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Mail className="w-4 h-4" />
                          {user.email}
                        </div>
                        {user.phone && (
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Phone className="w-4 h-4" />
                            {user.phone}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {user.enabled !== false ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          <Check className="w-3 h-3" />
                          {t('admin.active')}
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                          <X className="w-3 h-3" />
                          {t('admin.inactive')}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title={t('common.view')}
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleEditUser(user)}
                          className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                          title="Chỉnh sửa"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteUser(user.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title={t('common.delete')}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
            <div className="text-sm text-gray-600">
              Hiển thị {users.length} / {totalElements} users
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage(p => Math.max(0, p - 1))}
                disabled={currentPage === 0}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {t('common.previous')}
              </button>
              <span className="px-4 py-2 text-sm font-medium text-gray-700">
                {currentPage + 1} / {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages - 1, p + 1))}
                disabled={currentPage >= totalPages - 1}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {t('common.next')}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Edit User Modal */}
      <EditUserModal
        user={editingUser}
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setEditingUser(null);
        }}
        onSave={() => {
          fetchUsers();
          fetchRoleStats();
        }}
      />
    </div>
  );
};

export default UserManagement;
