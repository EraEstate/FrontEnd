import { useEffect, useMemo, useState } from 'react';
import { CheckCircle2, ExternalLink, FileText, Loader2, ShieldAlert, Trash2 } from 'lucide-react';
import { documentAPI } from '../api/document';
import type { PropertyDocument } from '../api/types';
import { showError, showSuccess } from '../utils/toast';

interface DocumentListProps {
  propertyId: string;
  canManage?: boolean;
  refreshToken?: number;
}

const formatFileSize = (bytes: number): string => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
};

const formatDocumentType = (value: PropertyDocument['documentType']): string => {
  switch (value) {
    case 'LAND_TITLE':
      return 'Sổ đỏ';
    case 'BUILDING_PERMIT':
      return 'Giấy phép xây dựng';
    case 'CONTRACT':
      return 'Hợp đồng';
    case 'FLOOR_PLAN':
      return 'Mặt bằng';
    default:
      return 'Khác';
  }
};

const DocumentList: React.FC<DocumentListProps> = ({ propertyId, canManage = false, refreshToken }) => {
  const [documents, setDocuments] = useState<PropertyDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyMap, setBusyMap] = useState<Record<string, boolean>>({});

  const loadDocuments = async () => {
    setLoading(true);
    try {
      const data = await documentAPI.getByProperty(propertyId);
      setDocuments(data);
    } catch {
      showError('Không thể tải danh sách tài liệu');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!propertyId) return;
    void loadDocuments();
  }, [propertyId, refreshToken]);

  const verifiedCount = useMemo(
    () => documents.filter((document) => document.isVerified).length,
    [documents]
  );

  const removeDocument = async (documentId: string) => {
    setBusyMap((prev) => ({ ...prev, [documentId]: true }));
    try {
      await documentAPI.delete(propertyId, documentId);
      setDocuments((prev) => prev.filter((item) => item.id !== documentId));
      showSuccess('Đã xóa tài liệu');
    } catch {
      showError('Không thể xóa tài liệu');
    } finally {
      setBusyMap((prev) => ({ ...prev, [documentId]: false }));
    }
  };

  const toggleVerify = async (document: PropertyDocument) => {
    setBusyMap((prev) => ({ ...prev, [document.id]: true }));
    try {
      const updated = await documentAPI.verify(propertyId, document.id, !document.isVerified);
      setDocuments((prev) => prev.map((item) => (item.id === document.id ? updated : item)));
      showSuccess(updated.isVerified ? 'Đã xác minh tài liệu' : 'Đã bỏ xác minh');
    } catch {
      showError('Không thể cập nhật trạng thái xác minh');
    } finally {
      setBusyMap((prev) => ({ ...prev, [document.id]: false }));
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-5 w-5 animate-spin text-gray-500" />
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <h3 className="text-base font-semibold text-gray-900">Hồ sơ pháp lý</h3>
          <p className="mt-1 text-xs text-gray-600">
            Tổng {documents.length} tài liệu
            {canManage ? `, đã xác minh ${verifiedCount}` : ''}
          </p>
        </div>
      </div>

      {documents.length === 0 ? (
        <div className="flex items-center gap-2 rounded-lg bg-gray-50 px-3 py-3 text-sm text-gray-600">
          <FileText className="h-4 w-4" />
          Chưa có tài liệu nào.
        </div>
      ) : (
        <div className="space-y-3">
          {documents.map((document) => (
            <div key={document.id} className="rounded-xl border border-gray-200 p-3">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-gray-900">{document.fileName}</p>
                  <p className="text-xs text-gray-500">
                    {formatDocumentType(document.documentType)} • {formatFileSize(document.fileSize)}
                  </p>
                  {document.description && (
                    <p className="mt-1 text-xs text-gray-600">{document.description}</p>
                  )}
                  <p className="mt-1 text-xs text-gray-500">
                    {new Date(document.createdAt).toLocaleString('vi-VN')}
                    {document.uploadedByName ? ` • ${document.uploadedByName}` : ''}
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  {document.isVerified ? (
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700">
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      Đã xác minh
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-700">
                      <ShieldAlert className="h-3.5 w-3.5" />
                      Chưa xác minh
                    </span>
                  )}

                  <a
                    href={document.fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 rounded-lg border border-gray-300 px-2.5 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50"
                  >
                    <ExternalLink className="h-3.5 w-3.5" />
                    Mở
                  </a>

                  {canManage && (
                    <>
                      <button
                        type="button"
                        disabled={busyMap[document.id]}
                        onClick={() => toggleVerify(document)}
                        className="rounded-lg border border-gray-300 px-2.5 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {document.isVerified ? 'Bỏ xác minh' : 'Xác minh'}
                      </button>
                      <button
                        type="button"
                        disabled={busyMap[document.id]}
                        onClick={() => removeDocument(document.id)}
                        className="inline-flex items-center gap-1 rounded-lg bg-red-50 px-2.5 py-1.5 text-xs font-medium text-red-700 hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        Xóa
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default DocumentList;

