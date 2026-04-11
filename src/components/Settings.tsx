import React, { useState, useEffect } from 'react';
import { 
  User, 
  Lock, 
  Camera, 
  Save,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle2
} from 'lucide-react';
import { settingsAPI } from '../api/settings';
import { uploadAPI } from '../api/upload';
import { getImageUrl, getAvatarPlaceholder } from '../utils/imageUtils';
import type { SettingsResponse, UpdateProfileRequest, ChangePasswordRequest } from '../api/settings';
import { useAuthStore } from '../store/authStore';

import { showSuccess, showError } from '../utils/toast';

const Settings: React.FC = () => {
  const { user, updateUser } = useAuthStore();
  const [activeTab, setActiveTab] = useState<'profile' | 'password'>('profile');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // Profile form state
  const [profileData, setProfileData] = useState<UpdateProfileRequest>({
    fullName: '',
    phone: '',
    bio: '',
    address: '',
    avatarUrl: '',
  });

  // Password form state
  const [passwordData, setPasswordData] = useState<ChangePasswordRequest>({
    oldPassword: '',
    newPassword: '',
  });
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPasswords, setShowPasswords] = useState({
    old: false,
    new: false,
    confirm: false,
  });

  // Avatar upload
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      const settings = await settingsAPI.getCurrentSettings();
      setProfileData({
        fullName: settings.fullName || '',
        phone: settings.phone || '',
        bio: settings.bio || '',
        address: settings.address || '',
        avatarUrl: settings.avatarUrl || '',
      });
      // Set avatar preview from server URL (will be processed by getImageUrl)
      // Don't set avatarPreview here - let it use profileData.avatarUrl through getImageUrl
      // avatarPreview is only for preview when selecting new file
    } catch (error: any) {
      showError('Không thể tải thông tin cài đặt: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        showError('Kích thước file không được vượt quá 5MB');
        return;
      }
      if (!file.type.startsWith('image/')) {
        showError('File phải là hình ảnh');
        return;
      }
      setAvatarFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      let updatedSettings: SettingsResponse;

      // Prepare profile data - remove empty strings
      const cleanProfileData: UpdateProfileRequest = {
        fullName: profileData.fullName || undefined,
        phone: profileData.phone && profileData.phone.trim() ? profileData.phone.trim() : undefined,
        bio: profileData.bio || undefined,
        address: profileData.address || undefined,
        avatarUrl: profileData.avatarUrl || undefined,
      };

      // Upload avatar first if changed
      if (avatarFile) {
        try {
          const avatarUrl = await uploadAPI.uploadAvatar(avatarFile);
          // Update profile with new avatar URL
          updatedSettings = await settingsAPI.updateProfile({
            ...cleanProfileData,
            avatarUrl: avatarUrl,
          });
        } catch (error: any) {
          showError('Upload avatar thất bại: ' + (error.response?.data?.error || error.message));
          setSaving(false);
          return;
        }
      } else {
        updatedSettings = await settingsAPI.updateProfile(cleanProfileData);
      }

      // Update auth store
      if (updatedSettings && user) {
        updateUser({
          ...user,
          fullName: updatedSettings.fullName,
          phoneNumber: updatedSettings.phone || user.phoneNumber,
          avatar: updatedSettings.avatarUrl,
        });
      }

      // Reload settings to get latest data from server
      await loadSettings();
      
      // Clear avatar preview to use server URL
      setAvatarPreview(null);
      setAvatarFile(null);
      
      showSuccess('Cập nhật thông tin thành công');
    } catch (error: any) {
      showError('Cập nhật thất bại: ' + (error.response?.data?.message || error.message));
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    // Validation
    if (passwordData.newPassword !== confirmPassword) {
      showError('Mật khẩu mới và xác nhận mật khẩu không khớp');
      setSaving(false);
      return;
    }

    if (passwordData.newPassword.length < 6) {
      showError('Mật khẩu mới phải có ít nhất 6 ký tự');
      setSaving(false);
      return;
    }

    try {
      await settingsAPI.changePassword(passwordData);
      showSuccess('Đổi mật khẩu thành công');
      setPasswordData({ oldPassword: '', newPassword: '' });
      setConfirmPassword('');
    } catch (error: any) {
      showError('Đổi mật khẩu thất bại: ' + (error.response?.data?.message || error.message));
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Tabs */}
      <div className="bg-white rounded-lg shadow-sm p-1 flex space-x-1">
        <button
          onClick={() => setActiveTab('profile')}
          className={`flex-1 flex items-center justify-center px-4 py-3 rounded-lg transition-colors ${
            activeTab === 'profile'
              ? 'bg-red-600 text-white'
              : 'text-gray-600 hover:bg-gray-50'
          }`}
        >
          <User className="w-5 h-5 mr-2" />
          Thông tin cá nhân
        </button>
        <button
          onClick={() => setActiveTab('password')}
          className={`flex-1 flex items-center justify-center px-4 py-3 rounded-lg transition-colors ${
            activeTab === 'password'
              ? 'bg-red-600 text-white'
              : 'text-gray-600 hover:bg-gray-50'
          }`}
        >
          <Lock className="w-5 h-5 mr-2" />
          Đổi mật khẩu
        </button>
      </div>

      {/* Profile Tab */}
      {activeTab === 'profile' && (
        <form onSubmit={handleProfileSubmit} className="bg-white rounded-lg shadow-sm p-6 space-y-6">
          <h3 className="text-xl font-bold text-gray-900">Thông tin cá nhân</h3>

          {/* Avatar Upload */}
          <div className="flex items-center space-x-6">
            <div className="relative">
              <img
                src={
                  avatarPreview || // Preview when selecting new file (data URL)
                  getImageUrl(profileData.avatarUrl) || // URL from server after save
                  getImageUrl(user?.avatar) || // Fallback to user avatar from auth store
                  getAvatarPlaceholder(96) // Final fallback to placeholder
                }
                alt="Avatar"
                className="w-24 h-24 rounded-full object-cover border-2 border-gray-200"
                onError={(e) => {
                  // Fallback to placeholder if image fails to load
                  const target = e.target as HTMLImageElement;
                  if (target.src !== getAvatarPlaceholder(96)) {
                    target.src = getAvatarPlaceholder(96);
                  }
                }}
              />
              <label
                htmlFor="avatar-upload"
                className="absolute bottom-0 right-0 bg-red-600 text-white rounded-full p-2 cursor-pointer hover:bg-red-700 transition-colors"
              >
                <Camera className="w-4 h-4" />
                <input
                  id="avatar-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarChange}
                  className="hidden"
                />
              </label>
            </div>
            <div>
              <p className="text-sm text-gray-600">Ảnh đại diện</p>
              <p className="text-xs text-gray-500">JPG, PNG hoặc GIF. Tối đa 5MB</p>
            </div>
          </div>

          {/* Full Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Họ và tên *
            </label>
            <input
              type="text"
              value={profileData.fullName}
              onChange={(e) => setProfileData({ ...profileData, fullName: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              required
            />
          </div>

          {/* Phone */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Số điện thoại
            </label>
            <input
              type="tel"
              value={profileData.phone}
              onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              placeholder="0123456789"
            />
          </div>

          {/* Email (read-only) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email
            </label>
            <input
              type="email"
              value={user?.email || ''}
              disabled
              className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500 cursor-not-allowed"
            />
            <p className="text-xs text-gray-500 mt-1">Email không thể thay đổi</p>
          </div>

          {/* Bio */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Giới thiệu bản thân
            </label>
            <textarea
              value={profileData.bio}
              onChange={(e) => setProfileData({ ...profileData, bio: e.target.value })}
              rows={4}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              placeholder="Viết một vài dòng giới thiệu về bản thân..."
              maxLength={1000}
            />
            <p className="text-xs text-gray-500 mt-1">
              {profileData.bio?.length || 0}/1000 ký tự
            </p>
          </div>

          {/* Address */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Địa chỉ
            </label>
            <input
              type="text"
              value={profileData.address}
              onChange={(e) => setProfileData({ ...profileData, address: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              placeholder="Nhập địa chỉ của bạn"
            />
          </div>

          {/* Submit Button */}
          <div className="flex justify-end pt-4 border-t">
            <button
              type="submit"
              disabled={saving}
              className="flex items-center px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {saving ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  Đang lưu...
                </>
              ) : (
                <>
                  <Save className="w-5 h-5 mr-2" />
                  Lưu thay đổi
                </>
              )}
            </button>
          </div>
        </form>
      )}

      {/* Password Tab */}
      {activeTab === 'password' && (
        <form onSubmit={handlePasswordSubmit} className="bg-white rounded-lg shadow-sm p-6 space-y-6">
          <h3 className="text-xl font-bold text-gray-900">Đổi mật khẩu</h3>
          <p className="text-sm text-gray-600">
            Để bảo mật tài khoản, vui lòng sử dụng mật khẩu mạnh với ít nhất 6 ký tự
          </p>

          {/* Old Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Mật khẩu hiện tại *
            </label>
            <div className="relative">
              <input
                type={showPasswords.old ? 'text' : 'password'}
                value={passwordData.oldPassword}
                onChange={(e) => setPasswordData({ ...passwordData, oldPassword: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent pr-10"
                required
              />
              <button
                type="button"
                onClick={() => setShowPasswords({ ...showPasswords, old: !showPasswords.old })}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
              >
                {showPasswords.old ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* New Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Mật khẩu mới *
            </label>
            <div className="relative">
              <input
                type={showPasswords.new ? 'text' : 'password'}
                value={passwordData.newPassword}
                onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent pr-10"
                required
                minLength={6}
              />
              <button
                type="button"
                onClick={() => setShowPasswords({ ...showPasswords, new: !showPasswords.new })}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
              >
                {showPasswords.new ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-1">Tối thiểu 6 ký tự</p>
          </div>

          {/* Confirm Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Xác nhận mật khẩu mới *
            </label>
            <div className="relative">
              <input
                type={showPasswords.confirm ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent pr-10"
                required
                minLength={6}
              />
              <button
                type="button"
                onClick={() => setShowPasswords({ ...showPasswords, confirm: !showPasswords.confirm })}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
              >
                {showPasswords.confirm ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
            {confirmPassword && passwordData.newPassword !== confirmPassword && (
              <p className="text-xs text-red-500 mt-1">Mật khẩu không khớp</p>
            )}
          </div>

          {/* Submit Button */}
          <div className="flex justify-end pt-4 border-t">
            <button
              type="submit"
              disabled={saving}
              className="flex items-center px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {saving ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  Đang đổi...
                </>
              ) : (
                <>
                  <Lock className="w-5 h-5 mr-2" />
                  Đổi mật khẩu
                </>
              )}
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default Settings;

