/**
 * Chuyển timestamp thành chuỗi thời gian tương đối tiếng Việt.
 * "Vừa xong", "5 phút trước", "2 giờ trước", "Hôm qua", "25/04/2026"
 */
export function relativeTime(dateStr: string | Date): string {
  if (!dateStr) return '';
  
  const date = typeof dateStr === 'string' ? new Date(dateStr) : dateStr;
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  
  if (diffMs < 0) return formatDate(date);
  
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);

  if (diffSec < 60) return 'Vừa xong';
  if (diffMin < 60) return `${diffMin} phút trước`;
  if (diffHour < 24) return `${diffHour} giờ trước`;
  if (diffDay === 1) return 'Hôm qua';
  if (diffDay < 7) return `${diffDay} ngày trước`;
  
  return formatDate(date);
}

function formatDate(date: Date): string {
  return date.toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit', 
    year: 'numeric',
  });
}
