import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * Thanh progress mỏng phía trên cùng trang — chạy mỗi khi navigate giữa routes.
 * Giống NProgress nhưng nhẹ hơn, pure CSS.
 */
const TopProgressBar: React.FC = () => {
  const location = useLocation();
  const [progress, setProgress] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    // Start progress animation
    setIsVisible(true);
    setProgress(0);

    // Quick ramp to 30%
    const t1 = setTimeout(() => setProgress(30), 50);
    // Slow crawl to 70%
    const t2 = setTimeout(() => setProgress(70), 200);
    // Jump to 100% and fade out
    const t3 = setTimeout(() => setProgress(100), 400);
    const t4 = setTimeout(() => {
      setIsVisible(false);
      setProgress(0);
    }, 600);

    timerRef.current = t4;

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
    };
  }, [location.pathname + location.search]);

  if (!isVisible && progress === 0) return null;

  return (
    <div
      className="fixed top-0 left-0 right-0 z-[9999] h-[3px] pointer-events-none"
      style={{ opacity: isVisible ? 1 : 0, transition: 'opacity 200ms ease-out' }}
    >
      <div
        className="h-full bg-gradient-to-r from-red-500 via-red-600 to-orange-500 shadow-sm"
        style={{
          width: `${progress}%`,
          transition: progress === 0
            ? 'none'
            : progress < 100
              ? 'width 300ms ease-out'
              : 'width 150ms ease-in',
          boxShadow: '0 0 8px rgba(220, 38, 38, 0.4)',
        }}
      />
    </div>
  );
};

export default TopProgressBar;
