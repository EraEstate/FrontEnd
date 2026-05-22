import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  FileText, 
  Lock, 
  Save, 
  Trash2, 
  Loader2, 
  Sparkles, 
  Edit3,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { propertyNoteAPI } from '../api';
import { useAuthStore } from '../store/authStore';
import { showSuccess, showError, showWarning } from '../utils/toast';

interface PropertyNoteSectionProps {
  propertyId: number;
}

export const PropertyNoteSection: React.FC<PropertyNoteSectionProps> = ({ propertyId }) => {
  const { t } = useTranslation();
  const { isAuthenticated } = useAuthStore();
  
  const [noteContent, setNoteContent] = useState('');
  const [noteId, setNoteId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [lastSaved, setLastSaved] = useState<string | null>(null);

  const fetchNote = async () => {
    if (!isAuthenticated) return;
    try {
      setLoading(true);
      const note = await propertyNoteAPI.getNoteByProperty(propertyId);
      if (note) {
        setNoteContent(note.noteContent);
        setNoteId(note.id);
        setLastSaved(new Date(note.updatedAt || note.createdAt).toLocaleTimeString());
      }
    } catch (error) {
      console.error('Failed to fetch property note', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNote();
  }, [propertyId, isAuthenticated]);

  const handleSave = async () => {
    if (!isAuthenticated) {
      showWarning(t('savedSearch.loginRequired', 'Vui lòng đăng nhập để ghi lại ghi chú của bạn'));
      return;
    }

    if (!noteContent.trim()) {
      showWarning(t('propertyNote.emptyWarning', 'Nội dung ghi chú không được bỏ trống'));
      return;
    }

    setSaving(true);
    try {
      const savedNote = await propertyNoteAPI.saveNote(propertyId, noteContent.trim());
      setNoteId(savedNote.id);
      setLastSaved(new Date(savedNote.updatedAt || savedNote.createdAt).toLocaleTimeString());
      showSuccess(t('propertyNote.saveSuccess', 'Đã lưu ghi chú xem nhà riêng tư thành công!'));
      setIsEditing(false);
    } catch (error) {
      showError(t('propertyNote.saveError', 'Lỗi khi lưu ghi chú'));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!noteId) return;
    if (!window.confirm(t('propertyNote.deleteConfirm', 'Bạn có chắc chắn muốn xóa ghi chú này không?'))) {
      return;
    }

    setSaving(true);
    try {
      await propertyNoteAPI.deleteNote(noteId);
      setNoteContent('');
      setNoteId(null);
      setLastSaved(null);
      setIsEditing(false);
      showSuccess(t('propertyNote.deleteSuccess', 'Đã xóa ghi chú riêng tư'));
    } catch (error) {
      showError(t('propertyNote.deleteError', 'Lỗi khi xóa ghi chú'));
    } finally {
      setSaving(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="bg-white/60 backdrop-blur-md border border-gray-100 rounded-2xl p-6 shadow-sm flex flex-col items-center justify-center text-center">
        <Lock className="h-8 w-8 text-gray-400 mb-3" />
        <h4 className="font-bold text-gray-900 mb-1">{t('propertyNote.privateTitle', 'Ghi chú xem nhà riêng tư')}</h4>
        <p className="text-xs text-gray-500 max-w-xs mb-4">
          Hãy lưu trữ các thông tin đánh giá cá nhân, ý kiến khảo sát thực tế hoàn toàn bảo mật và chỉ hiển thị với chính bạn.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white/85 backdrop-blur-lg border border-gray-100 rounded-2xl p-6 shadow-sm transition-all duration-300 hover:shadow">
      {/* Header Info */}
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-50">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-red-50 text-red-600 rounded-xl">
            <FileText className="h-5 w-5" />
          </div>
          <div>
            <h4 className="font-extrabold text-gray-900 text-sm flex items-center gap-1.5">
              {t('propertyNote.title', 'Ghi Chú Xem Nhà')}
              <span className="inline-flex items-center gap-0.5 px-2 py-0.5 bg-gray-100 text-gray-600 text-[10px] rounded-full font-bold">
                <Lock className="h-3 w-3" />
                Cá nhân
              </span>
            </h4>
            <p className="text-[11px] text-gray-400 font-medium">Bảo mật hoàn toàn, chỉ bạn có quyền xem</p>
          </div>
        </div>

        {lastSaved && !isEditing && (
          <button
            onClick={() => setIsEditing(true)}
            className="flex items-center gap-1 text-xs text-red-600 hover:text-red-700 bg-red-50 px-3 py-1.5 rounded-lg font-bold transition-all duration-200"
          >
            <Edit3 className="h-3.5 w-3.5" />
            Sửa
          </button>
        )}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-6">
          <Loader2 className="h-5 w-5 animate-spin text-red-600" />
        </div>
      ) : (
        <div className="space-y-4">
          {isEditing || !noteId ? (
            <div className="space-y-3">
              <textarea
                value={noteContent}
                onChange={(e) => setNoteContent(e.target.value)}
                placeholder={t('propertyNote.placeholder', 'Ví dụ: Hướng nhà mát mẻ, khu dân cư an ninh, cần đàm phán giảm giá thêm khoảng 100tr...')}
                className="w-full h-32 px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none text-gray-900 text-sm font-medium transition-all resize-none"
              />
              
              <div className="flex items-center justify-between gap-3">
                {lastSaved ? (
                  <span className="text-[10px] text-gray-400 font-medium">
                    Lưu lần cuối: {lastSaved}
                  </span>
                ) : (
                  <span className="text-[10px] text-gray-400 font-medium flex items-center gap-1">
                    <Sparkles className="h-3 w-3 text-amber-500 animate-pulse" />
                    Bắt đầu ghi lại ý kiến của bạn
                  </span>
                )}

                <div className="flex items-center gap-2">
                  {noteId && (
                    <button
                      onClick={() => setIsEditing(false)}
                      className="px-4 py-2 border border-gray-200 rounded-xl text-gray-700 hover:bg-gray-50 transition-colors text-xs font-bold"
                    >
                      Hủy
                    </button>
                  )}
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="px-4 py-2 bg-red-600 text-white hover:bg-red-700 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow transition-all duration-200 disabled:opacity-50 active:scale-95"
                  >
                    {saving ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <Save className="h-3.5 w-3.5" />
                    )}
                    Lưu ghi chú
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-gray-50 rounded-xl p-4 border border-gray-100 relative group min-h-[90px] flex flex-col justify-between">
              <p className="text-gray-700 text-sm font-medium leading-relaxed whitespace-pre-wrap">
                {noteContent}
              </p>
              
              <div className="flex items-center justify-between border-t border-gray-200/50 pt-3 mt-4">
                <span className="text-[10px] text-gray-400 font-semibold flex items-center gap-1">
                  <CheckCircle className="h-3.5 w-3.5 text-green-500" />
                  Đã đồng bộ • Cập nhật lúc {lastSaved}
                </span>

                <button
                  onClick={handleDelete}
                  disabled={saving}
                  className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                  title="Xóa ghi chú này"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
