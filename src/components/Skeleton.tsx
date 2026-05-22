import React from 'react';

interface SkeletonProps {
  /** Chiều rộng — Tailwind class hoặc CSS */
  className?: string;
  /** Số dòng skeleton text */
  lines?: number;
  /** Skeleton hình tròn (avatar) */
  circle?: boolean;
  /** Kích thước circle (px) */
  circleSize?: number;
}

/**
 * Skeleton — placeholder loading animation with shimmer effect.
 * Dùng khi cần hiện khung chờ trước khi data load xong.
 */
const Skeleton: React.FC<SkeletonProps> = ({
  className = '',
  lines = 1,
  circle = false,
  circleSize = 40,
}) => {
  if (circle) {
    return (
      <div
        className="rounded-full animate-shimmer"
        style={{ width: circleSize, height: circleSize }}
      />
    );
  }

  return (
    <div className={`space-y-2.5 ${className}`}>
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={`skel-line-${i}`}
          className={`h-4 rounded-md animate-shimmer ${
            i === lines - 1 && lines > 1 ? 'w-3/4' : 'w-full'
          }`}
          style={{ animationDelay: `${i * 80}ms` }}
        />
      ))}
    </div>
  );
};

/**
 * SkeletonCard — placeholder cho property card, news card, etc.
 * Sử dụng shimmer effect thay vì plain pulse để trông chuyên nghiệp hơn.
 */
export const SkeletonCard: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div className={`bg-white rounded-xl overflow-hidden border border-gray-100 ${className}`}
    style={{ boxShadow: 'var(--shadow-sm)' }}
  >
    {/* Image placeholder */}
    <div className="w-full h-48 animate-shimmer" />
    {/* Content */}
    <div className="p-4 space-y-3">
      <div className="h-5 rounded-md animate-shimmer w-3/4" />
      <div className="h-4 rounded-md animate-shimmer w-1/2" style={{ animationDelay: '80ms' }} />
      <div className="flex justify-between items-center pt-2">
        <div className="h-6 rounded-md animate-shimmer w-1/3" style={{ animationDelay: '160ms' }} />
        <div className="h-4 rounded-md animate-shimmer w-1/4" style={{ animationDelay: '240ms' }} />
      </div>
    </div>
  </div>
);

/**
 * SkeletonList — hiện n skeleton cards dạng grid.
 */
export const SkeletonList: React.FC<{
  count?: number;
  columns?: 1 | 2 | 3 | 4;
}> = ({ count = 6, columns = 3 }) => {
  const gridClass = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4',
  };

  return (
    <div className={`grid ${gridClass[columns]} gap-6`}>
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={`skel-card-${i}`} />
      ))}
    </div>
  );
};

export default Skeleton;
