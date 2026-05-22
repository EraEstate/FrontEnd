import { type ChangeEvent, useMemo, useState } from 'react';
import { FileText, Loader2, Upload, X } from 'lucide-react';
import { documentAPI } from '../api/document';
import type { PropertyDocument } from '../api/types';
import { showError, showSuccess } from '../utils/toast';

export type PropertyDocumentType =
  | 'LAND_TITLE'
  | 'BUILDING_PERMIT'
  | 'CONTRACT'
  | 'FLOOR_PLAN'
  | 'OTHER';

export interface PendingPropertyDocument {
  id: string;
  file: File;
  documentType: PropertyDocumentType;
  description: string;
}

interface DocumentUploaderProps {
  propertyId?: string;
  value?: PendingPropertyDocument[];
  onChange?: (documents: PendingPropertyDocument[]) => void;
  onUploaded?: (documents: PropertyDocument[]) => void;
  title?: string;
}

const ALLOWED_EXTENSIONS = new Set([
  'pdf',
  'jpg',
  'jpeg',
  'png',
  'webp',
  'doc',
  'docx',
  'xls',
  'xlsx',
]);

const MAX_FILE_SIZE = 10 * 1024 * 1024;

const DOCUMENT_TYPES: Array<{ value: PropertyDocumentType; label: string }> = [
  { value: 'LAND_TITLE', label: 'Sổ đỏ / Giấy CNQSDĐ' },
  { value: 'BUILDING_PERMIT', label: 'Giấy phép xây dựng' },
  { value: 'CONTRACT', label: 'Hợp đồng' },
  { value: 'FLOOR_PLAN', label: 'Mặt bằng' },
  { value: 'OTHER', label: 'Khác' },
];

const formatFileSize = (bytes: number): string => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
};

const createPendingDocument = (file: File): PendingPropertyDocument => ({
  id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
  file,
  documentType: 'OTHER',
  description: '',
});

const DocumentUploader: React.FC<DocumentUploaderProps> = ({
  propertyId,
  value,
  onChange,
  onUploaded,
  title = 'Tài liệu pháp lý',
}) => {
  const [internalDocuments, setInternalDocuments] = useState<PendingPropertyDocument[]>([]);
  const [uploading, setUploading] = useState(false);

  const documents = value ?? internalDocuments;
  const isControlled = value !== undefined;

  const setDocuments = (
    nextDocumentsOrFn:
      | PendingPropertyDocument[]
      | ((prev: PendingPropertyDocument[]) => PendingPropertyDocument[])
  ) => {
    if (!isControlled) {
      setInternalDocuments((prev) => {
        const next = typeof nextDocumentsOrFn === 'function' ? nextDocumentsOrFn(prev) : nextDocumentsOrFn;
        if (onChange) {
          onChange(next);
        }
        return next;
      });
    } else {
      const next = typeof nextDocumentsOrFn === 'function' ? nextDocumentsOrFn(value || []) : nextDocumentsOrFn;
      if (onChange) {
        onChange(next);
      }
    }
  };

  const canUploadNow = useMemo(() => Boolean(propertyId && documents.length > 0), [propertyId, documents.length]);

  const validateFile = (file: File): boolean => {
    const extension = file.name.split('.').pop()?.toLowerCase() || '';
    if (!ALLOWED_EXTENSIONS.has(extension)) {
      showError(`File ${file.name} không đúng định dạng hỗ trợ`);
      return false;
    }
    if (file.size > MAX_FILE_SIZE) {
      showError(`File ${file.name} vượt quá 10MB`);
      return false;
    }
    return true;
  };

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    if (files.length === 0) return;

    const accepted = files.reduce<PendingPropertyDocument[]>((acc, file) => {
      if (validateFile(file)) {
        acc.push(createPendingDocument(file));
      }
      return acc;
    }, []);
    if (accepted.length === 0) return;

    setDocuments((prev) => [...prev, ...accepted]);
    event.target.value = '';
  };

  const removeDocument = (id: string) => {
    setDocuments((prev) => prev.filter((document) => document.id !== id));
  };

  const updateDocument = (id: string, patch: Partial<PendingPropertyDocument>) => {
    setDocuments((prev) =>
      prev.map((document) => (document.id === id ? { ...document, ...patch } : document))
    );
  };

  const uploadAll = async () => {
    if (!propertyId || documents.length === 0) return;
    setUploading(true);
    const uploaded: PropertyDocument[] = [];
    const failed: PendingPropertyDocument[] = [];

    try {
      const results = await Promise.allSettled(
        documents.map((document) =>
          documentAPI.upload(propertyId, document.file, {
            documentType: document.documentType,
            description: document.description || undefined,
          })
        )
      );

      results.forEach((result, index) => {
        if (result.status === 'fulfilled') {
          uploaded.push(result.value);
        } else {
          failed.push(documents[index]);
        }
      });

      setDocuments(failed);
      if (uploaded.length > 0) {
        showSuccess(`Đã tải lên ${uploaded.length} tài liệu`);
        onUploaded?.(uploaded);
      }
      if (failed.length > 0) {
        showError(`Có ${failed.length} tài liệu tải lên thất bại`);
      }
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h3 className="text-base font-semibold text-gray-900">{title}</h3>
          <p className="mt-1 text-xs text-gray-600">
            Hỗ trợ PDF, ảnh, DOC, XLS. Kích thước tối đa 10MB mỗi file.
          </p>
        </div>
        {propertyId && (
          <button
            type="button"
            onClick={uploadAll}
            disabled={!canUploadNow || uploading}
            className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
            Tải lên
          </button>
        )}
      </div>

      <div className="mt-4">
        <label className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border-2 border-dashed border-gray-300 px-4 py-5 text-sm text-[#374151] transition-colors hover:border-red-400 hover:bg-red-50">
          <Upload className="h-4 w-4" />
          Chọn tài liệu
          <input
            type="file"
            className="hidden"
            multiple
            accept=".pdf,.jpg,.jpeg,.png,.webp,.doc,.docx,.xls,.xlsx"
            onChange={handleFileChange}
          />
        </label>
      </div>

      {documents.length > 0 && (
        <div className="mt-4 space-y-3">
          {documents.map((document) => (
            <div key={document.id} className="rounded-xl border border-gray-200 p-3">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-gray-900">{document.file.name}</p>
                  <p className="text-xs text-gray-500">{formatFileSize(document.file.size)}</p>
                </div>
                <button
                  type="button"
                  onClick={() => removeDocument(document.id)}
                  className="rounded-md p-1 text-gray-500 hover:bg-gray-100 hover:text-red-600"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="mt-3 grid grid-cols-1 gap-2 md:grid-cols-2">
                <label className="text-xs text-gray-600">
                  Loại tài liệu
                  <select
                    value={document.documentType}
                    onChange={(event) =>
                      updateDocument(document.id, {
                        documentType: event.target.value as PropertyDocumentType,
                      })
                    }
                    className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-800 focus:border-red-500 focus:outline-none"
                  >
                    {DOCUMENT_TYPES.map((type) => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="text-xs text-gray-600">
                  Ghi chú
                  <input
                    type="text"
                    value={document.description}
                    onChange={(event) => updateDocument(document.id, { description: event.target.value })}
                    placeholder="Mô tả ngắn"
                    className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-800 focus:border-red-500 focus:outline-none"
                  />
                </label>
              </div>
            </div>
          ))}
        </div>
      )}

      {documents.length === 0 && (
        <div className="mt-4 flex items-center gap-2 rounded-lg bg-gray-50 px-3 py-2 text-sm text-gray-600">
          <FileText className="h-4 w-4" />
          Chưa có tài liệu nào được chọn.
        </div>
      )}
    </div>
  );
};

export default DocumentUploader;
