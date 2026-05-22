import React, { useState, useEffect } from 'react';
import { ArrowUp } from 'lucide-react';

const ScrollToTop: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const toggleVisibility = () => {
      setIsVisible(window.scrollY > 300);
    };
    window.addEventListener('scroll', toggleVisibility, { passive: true });
    return () => window.removeEventListener('scroll', toggleVisibility);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <button
      onClick={scrollToTop}
      aria-label="Cuộn lên đầu trang"
      className={`
        fixed bottom-40 right-6 z-40
        w-11 h-11 rounded-full
        bg-gradient-to-br from-red-500 to-red-600
        text-white
        flex items-center justify-center
        hover:from-red-600 hover:to-red-700
        hover:shadow-xl hover:shadow-red-500/25
        hover:scale-110
        btn-press
        transition-all duration-300 ease-out
        ${isVisible
          ? 'opacity-100 translate-y-0 pointer-events-auto'
          : 'opacity-0 translate-y-4 pointer-events-none'
        }
      `}
      style={{ boxShadow: isVisible ? 'var(--shadow-lg)' : 'none' }}
    >
      <ArrowUp className="h-5 w-5" />
    </button>
  );
};

export default ScrollToTop;
