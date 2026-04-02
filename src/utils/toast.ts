/**
 * Centralized Toast Utility — wrapper thống nhất cho react-toastify.
 * Dùng file này thay vì gọi toast() trực tiếp từ react-toastify.
 *
 * Usage:
 *   import { showSuccess, showError, showWarning, showInfo } from '@/utils/toast';
 *   showSuccess('Đăng nhập thành công!');
 *   showError('Mật khẩu không đúng');
 *   showWarning('Phiên đăng nhập hết hạn');
 *   showInfo('Đang xử lý...');
 */

import { toast, type ExternalToast } from 'sonner';

/** Options mặc định */
const defaultOptions: ExternalToast = {
  duration: 3000,
};

/** Thành công — dùng sau các action mutation (tạo, sửa, xóa) */
export const showSuccess = (message: string, options?: ExternalToast) => {
  toast.success(message, { ...defaultOptions, duration: 2500, ...options });
};

/** Lỗi — dùng khi API trả về error hoặc network lỗi */
export const showError = (message: string, options?: ExternalToast) => {
  toast.error(message, { ...defaultOptions, duration: 4000, ...options });
};

/** Cảnh báo — dùng cho token hết hạn, validation nghiêm trọng */
export const showWarning = (message: string, options?: ExternalToast) => {
  toast.warning(message, { ...defaultOptions, duration: 4000, ...options });
};

/** Thông báo — dùng cho loading, thông tin chung */
export const showInfo = (message: string, options?: ExternalToast) => {
  toast.info(message, { ...defaultOptions, duration: 3000, ...options });
};

/**
 * Toast promise — dùng cho async actions có loading state.
 */
export const showPromise = <T>(
  promise: Promise<T>,
  messages: { pending: string; success: string; error: string },
  options?: ExternalToast,
) => {
  return toast.promise(promise, {
    loading: messages.pending,
    success: messages.success,
    error: messages.error,
    ...defaultOptions,
    ...options
  });
};

export default { 
  success: showSuccess, 
  error: showError, 
  warning: showWarning, 
  info: showInfo, 
  promise: showPromise,
  // Giữ lại tên cũ để tương thích ngược với code hiện tại đang gọi showSuccess trực tiếp
  showSuccess, 
  showError, 
  showWarning, 
  showInfo, 
  showPromise 
};
