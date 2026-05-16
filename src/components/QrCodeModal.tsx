import { useEffect, useMemo, useState } from 'react';
import { Download, Loader2, QrCode, X } from 'lucide-react';
import { propertyAPI } from '../api/property';
import { showError } from '../utils/toast';

interface QrCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  propertyId: string;
  propertyTitle?: string;
}

const QrCodeModal: React.FC<QrCodeModalProps> = ({
  isOpen,
  onClose,
  propertyId,
  propertyTitle,
}) => {
  const [blobUrl, setBlobUrl] = useState<string>('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let mounted = true;
    let currentUrl: string | null = null;

    const load = async () => {
      if (!isOpen || !propertyId) return;
      setLoading(true);
      try {
        const blob = await propertyAPI.getPropertyQr(propertyId);
        currentUrl = URL.createObjectURL(blob);
        if (mounted) {
          setBlobUrl(currentUrl);
        }
      } catch {
        showError('Không thể tải QR code');
      } finally {
        if (mounted) setLoading(false);
      }
    };

    void load();

    return () => {
      mounted = false;
      if (currentUrl) {
        URL.revokeObjectURL(currentUrl);
      }
    };
  }, [isOpen, propertyId]);

  const filename = useMemo(() => {
    const safeTitle = (propertyTitle || `property-${propertyId}`)
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 60);
    return `${safeTitle || `property-${propertyId}`}-qr.png`;
  }, [propertyId, propertyTitle]);

  if (!isOpen) return null;

  const downloadQr = () => {
    if (!blobUrl) return;
    const a = document.createElement('a');
    a.href = blobUrl;
    a.download = filename;
    a.click();
  };

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/55 p-4">
      <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
          <h3 className="flex items-center gap-2 text-lg font-semibold text-gray-900">
            <QrCode className="h-5 w-5 text-red-600" />
            Chia sẻ bằng QR
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-4 px-5 py-5">
          <p className="text-sm text-gray-600">
            Quét mã để mở trực tiếp trang chi tiết tin đăng.
          </p>
          <div className="flex min-h-[280px] items-center justify-center rounded-xl border border-gray-200 bg-gray-50">
            {loading ? (
              <Loader2 className="h-6 w-6 animate-spin text-gray-500" />
            ) : blobUrl ? (
              <img src={blobUrl} alt="Property QR code" className="h-64 w-64 rounded-lg bg-white p-2" />
            ) : (
              <span className="text-sm text-gray-500">Không có dữ liệu QR</span>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={downloadQr}
              disabled={!blobUrl || loading}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-red-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Download className="h-4 w-4" />
              Tải QR
            </button>
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100"
            >
              Đóng
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QrCodeModal;
