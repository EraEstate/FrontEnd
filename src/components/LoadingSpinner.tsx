import React from 'react';

interface LoadingSpinnerProps {
  /** Kích thước: sm=16px, md=24px, lg=40px, xl=56px */
  size?: 'sm' | 'md' | 'lg' | 'xl';
  /** Màu spinner — mặc định brand red */
  color?: string;
  /** Text hiển thị bên dưới spinner */
  text?: string;
  /** Full screen overlay */
  fullScreen?: boolean;
  /** Inline nhỏ gọn (dùng trong button, table cell) */
  inline?: boolean;
}

const sizeMap = {
  sm: 'h-4 w-4 border-2',
  md: 'h-6 w-6 border-2',
  lg: 'h-10 w-10 border-[3px]',
  xl: 'h-14 w-14 border-4',
};

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'md',
  color = 'border-red-600',
  text,
  fullScreen = false,
  inline = false,
}) => {
  const spinner = (
    <div
      className={`animate-spin rounded-full border-t-transparent ${sizeMap[size]} ${color}`}
      style={{ animationDuration: '0.7s' }}
    />
  );

  // Inline — dùng trong button, cùng hàng
  if (inline) {
    return (
      <span className="inline-flex items-center gap-2">
        {spinner}
        {text && <span className="text-sm text-gray-500">{text}</span>}
      </span>
    );
  }

  // Full screen — overlay toàn trang với glass effect
  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center glass">
        <div className="flex flex-col items-center gap-4">
          <div
            className={`animate-spin rounded-full border-t-transparent ${sizeMap.xl} ${color}`}
            style={{ animationDuration: '0.7s' }}
          />
          {text && <p className="text-sm text-gray-600 animate-pulse font-medium">{text}</p>}
        </div>
      </div>
    );
  }

  // Default — block, căn giữa
  return (
    <div className="flex flex-col items-center justify-center py-12 gap-3">
      {spinner}
      {text && <p className="text-sm text-gray-500">{text}</p>}
    </div>
  );
};

export default LoadingSpinner;
