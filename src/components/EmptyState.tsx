import React from 'react';
import { SearchX, Heart, Home, FileText } from 'lucide-react';
import { Link } from 'react-router-dom';

interface EmptyStateProps {
  /** Loại empty state — tự chọn icon phù hợp */
  type?: 'search' | 'favorites' | 'properties' | 'generic';
  /** Tiêu đề chính */
  title?: string;
  /** Mô tả phụ */
  description?: string;
  /** Text của action button */
  actionLabel?: string;
  /** Link của action button */
  actionTo?: string;
  /** Callback thay cho link */
  onAction?: () => void;
}

const iconMap = {
  search: SearchX,
  favorites: Heart,
  properties: Home,
  generic: FileText,
};

const EmptyState: React.FC<EmptyStateProps> = ({
  type = 'generic',
  title = 'Không có dữ liệu',
  description = 'Hiện tại chưa có nội dung nào để hiển thị.',
  actionLabel,
  actionTo,
  onAction,
}) => {
  const Icon = iconMap[type];

  return (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      {/* Decorative circle background */}
      <div className="relative mb-6">
        <div className="w-24 h-24 rounded-full bg-gray-100 flex items-center justify-center">
          <Icon className="w-10 h-10 text-gray-400" />
        </div>
        {/* Floating dots decoration */}
        <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-100 animate-pulse" style={{ animationDuration: '3s' }} />
        <div className="absolute -bottom-2 -left-2 w-3 h-3 rounded-full bg-orange-100 animate-pulse" style={{ animationDuration: '4s', animationDelay: '1s' }} />
        <div className="absolute top-1/2 -right-4 w-2 h-2 rounded-full bg-red-200 animate-pulse" style={{ animationDuration: '3.5s', animationDelay: '0.5s' }} />
      </div>

      <h3 className="text-lg font-semibold text-gray-900 mb-2 text-center">
        {title}
      </h3>
      <p className="text-sm text-gray-500 mb-6 text-center max-w-sm leading-relaxed">
        {description}
      </p>

      {actionLabel && actionTo && (
        <Link
          to={actionTo}
          className="px-5 py-2.5 bg-red-600 text-white text-sm font-medium rounded-xl hover:bg-red-700 btn-press shadow-sm hover:shadow-md"
        >
          {actionLabel}
        </Link>
      )}

      {actionLabel && onAction && !actionTo && (
        <button
          onClick={onAction}
          className="px-5 py-2.5 bg-red-600 text-white text-sm font-medium rounded-xl hover:bg-red-700 btn-press shadow-sm hover:shadow-md"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
};

export default EmptyState;
