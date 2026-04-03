/**
 * Format a number as Vietnamese Dong currency string.
 * - >= 1 tỷ → "X.X tỷ"
 * - >= 1 triệu → "X tr"
 * - Otherwise → locale string
 */
export const formatVND = (val: number): string => {
  if (val >= 1e9) return `${(val / 1e9).toFixed(1)} tỷ`;
  if (val >= 1e6) return `${(val / 1e6).toFixed(0)} tr`;
  return val.toLocaleString('vi-VN');
};

/**
 * Format VND with more decimal precision for large amounts.
 */
export const formatVNDPrecise = (val: number): string => {
  if (val >= 1e9) return `${(val / 1e9).toFixed(2)} tỷ`;
  if (val >= 1e6) return `${(val / 1e6).toFixed(1)} tr`;
  return val.toLocaleString('vi-VN');
};

/**
 * Format a distance in meters to human-readable string.
 */
export const formatDistance = (meters: number): string => {
  if (meters >= 1000) return `${(meters / 1000).toFixed(1)} km`;
  return `${meters} m`;
};
