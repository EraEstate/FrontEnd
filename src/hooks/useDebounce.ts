import { useState, useEffect } from 'react';

/**
 * Debounce hook — trả về giá trị đã debounce sau delay ms.
 * Dùng cho search input: chỉ filter/fetch sau khi user ngừng gõ.
 */
export function useDebounce<T>(value: T, delay: number = 300): T {
  const [debounced, setDebounced] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debounced;
}
