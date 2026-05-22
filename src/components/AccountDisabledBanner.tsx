import React from 'react';
import { AlertTriangle, X } from 'lucide-react';
import { useAuthStore } from '../store/authStore';

const AccountDisabledBanner: React.FC = () => {
  const { user } = useAuthStore();

  // Chỉ hiển thị nếu user đã đăng nhập và account chưa được kích hoạt
  if (!user || user.enabled !== false) {
    return null;
  }

  return (
    <div className="bg-yellow-50 border-l-2 border-yellow-400 p-4 mb-4">
      <div className="flex items-start">
        <div className="flex-shrink-0">
          <AlertTriangle className="h-5 w-5 text-yellow-400" />
        </div>
        <div className="ml-3 flex-1">
          <p className="text-sm text-yellow-800">
            <strong>Tài khoản của bạn chưa được kích hoạt.</strong> Vui lòng liên hệ quản trị viên để kích hoạt tài khoản.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AccountDisabledBanner;


