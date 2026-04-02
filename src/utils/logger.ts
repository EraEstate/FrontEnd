/**
 * Centralized Logger — chỉ log khi môi trường development.
 * Import duy nhất file này thay vì dùng console.log trực tiếp.
 *
 * Usage:
 *   import { logger } from '@/utils/logger';
 *   logger.info('message');        // chỉ hiện khi DEV
 *   logger.warn('message');        // chỉ hiện khi DEV
 *   logger.error('message');       // LUÔN hiện (kể cả production)
 *   logger.debug('message');       // chỉ hiện khi DEV
 */

const isDev = import.meta.env.DEV;

/* eslint-disable no-console */
export const logger = {
  /** Thông tin chung — ẩn khi production */
  info: (...args: unknown[]) => {
    if (isDev) console.log('[INFO]', ...args);
  },

  /** Cảnh báo — ẩn khi production */
  warn: (...args: unknown[]) => {
    if (isDev) console.warn('[WARN]', ...args);
  },

  /** Lỗi — LUÔN hiển thị để giám sát production */
  error: (...args: unknown[]) => {
    console.error('[ERROR]', ...args);
  },

  /** Debug chi tiết — ẩn khi production */
  debug: (...args: unknown[]) => {
    if (isDev) console.debug('[DEBUG]', ...args);
  },
};
/* eslint-enable no-console */

export default logger;
