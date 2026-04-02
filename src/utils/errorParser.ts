/**
 * Centralized Error Parser — trích xuất message lỗi từ mọi dạng
 * response/error của BE một cách thống nhất.
 *
 * BE có thể trả:
 *   { "error": "..." }
 *   { "error": "...", "message": "..." }
 *   { "message": "..." }
 *   plain string
 *
 * Usage:
 *   import { extractErrorMessage } from '@/utils/errorParser';
 *   catch (err) { showError(extractErrorMessage(err)); }
 */

import type { AxiosError } from 'axios';

interface ErrorResponseData {
  error?: string;
  message?: string;
  detail?: string;
}

/**
 * Trích xuất message lỗi người dùng có thể đọc được.
 * Ưu tiên: error → message → detail → fallback.
 */
export const extractErrorMessage = (
  err: unknown,
  fallback = 'Đã xảy ra lỗi. Vui lòng thử lại.'
): string => {
  if (!err) return fallback;

  // Axios error — có response từ BE
  const axiosErr = err as AxiosError<ErrorResponseData | string>;
  if (axiosErr.response?.data) {
    const data = axiosErr.response.data;

    // Nếu data là string thuần (HTML error page, etc.)
    if (typeof data === 'string') {
      return data.length > 200 ? fallback : data;
    }

    // Ưu tiên trường "error" → "message" → "detail"
    const dataObj = data as ErrorResponseData;
    return dataObj.error || dataObj.message || dataObj.detail || fallback;
  }

  // Network error (không có response)
  if (axiosErr.message) {
    if (axiosErr.message.includes('Network Error')) {
      return 'Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối mạng.';
    }
    if (axiosErr.message.includes('timeout')) {
      return 'Yêu cầu quá thời gian chờ. Vui lòng thử lại.';
    }
    return axiosErr.message;
  }

  // Error thuần JS
  if (err instanceof Error) {
    return err.message || fallback;
  }

  // Fallback cho mọi trường hợp còn lại
  if (typeof err === 'string') return err;

  return fallback;
};

/**
 * Kiểm tra error có phải 401 Unauthorized không.
 */
export const isUnauthorizedError = (err: unknown): boolean => {
  const axiosErr = err as AxiosError;
  return axiosErr.response?.status === 401;
};

/**
 * Kiểm tra error có phải 403 Forbidden không.
 */
export const isForbiddenError = (err: unknown): boolean => {
  const axiosErr = err as AxiosError;
  return axiosErr.response?.status === 403;
};

/**
 * Kiểm tra error có phải network error (mất kết nối) không.
 */
export const isNetworkError = (err: unknown): boolean => {
  const axiosErr = err as AxiosError;
  return !axiosErr.response && !!axiosErr.message;
};

export default extractErrorMessage;
