import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  FileText, 
  Trash2, 
  Clock, 
  Search, 
  ChevronRight, 
  Loader2, 
  AlertCircle, 
  Sparkles,
  Lock,
  ArrowRight,
  ExternalLink,
  Edit3,
  Save,
  X
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { propertyNoteAPI, propertyAPI } from '../api';
import type { PropertyNote } from '../api/types';
import { showSuccess, showError, showWarning } from '../utils/toast';
import { useNavigate, Link } from 'react-router-dom';
import { getImageUrl, getImagePlaceholder } from '../utils/imageUtils';

const MyNotesPage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [notes, setNotes] = useState<PropertyNote[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');
  const [saving, setSaving] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchNotes = async () => {
    try {
      setLoading(true);
      const data = await propertyNoteAPI.getMyNotes();
      
      // Fetch corresponding property details for each note to render beautiful listing cards
      const notesWithProperties = await Promise.all(
        data.map(async (note) => {
          try {
            const property = await propertyAPI.getById(note.propertyId.toString());
            return { ...note, property };
          } catch {
            return note;
          }
        })
      );

      setNotes(notesWithProperties);
    } catch (error) {
      showError(t('propertyNote.fetchError', 'Không thể tải danh sách ghi chú riêng tư'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotes();
  }, []);

  const handleStartEdit = (note: PropertyNote) => {
    setEditingId(note.id);
    setEditContent(note.noteContent);
  };

  const handleUpdateNote = async (id: string, propertyId: number) => {
    if (!editContent.trim()) {
      showWarning(t('propertyNote.emptyWarning', 'Nội dung ghi chú không được để trống'));
      return;
    }

    setSaving(true);
    try {
      const updated = await propertyNoteAPI.saveNote(propertyId, editContent.trim());
      setNotes(prev => prev.map(note => note.id === id ? { ...note, noteContent: updated.noteContent, updatedAt: updated.updatedAt } : note));
      showSuccess(t('propertyNote.saveSuccess', 'Đã cập nhật ghi chú thành công!'));
      setEditingId(null);
    } catch (error) {
      showError(t('propertyNote.saveError', 'Lỗi khi cập nhật ghi chú'));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm(t('propertyNote.deleteConfirm', 'Bạn có chắc chắn muốn xóa ghi chú này không?'))) {
      return;
    }

    try {
      await propertyNoteAPI.deleteNote(id);
      setNotes(prev => prev.filter(note => note.id !== id));
      showSuccess(t('propertyNote.deleteSuccess', 'Đã xóa ghi chú thành công!'));
    } catch (error) {
      showError(t('propertyNote.deleteError', 'Lỗi khi xóa ghi chú'));
    }
  };

  const formatPrice = (price: number) => {
    if (price >= 1000000000) {
      return `${(price / 1000000000).toFixed(1)} Tỷ`;
    }
    if (price >= 1000000) {
      return `${(price / 1000000).toFixed(0)} Triệu`;
    }
    return price?.toLocaleString('vi-VN');
  };

  const filteredNotes = notes.filter(note => {
    const contentMatch = note.noteContent.toLowerCase().includes(searchQuery.toLowerCase());
    const titleMatch = note.property?.title?.toLowerCase().includes(searchQuery.toLowerCase());
    return contentMatch || titleMatch;
  });

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 via-gray-100 to-gray-200 py-10 px-4 md:px-8 mt-12">
      <div className="max-w-4xl mx-auto">
        {/* Header Hero */}
        <div className="relative bg-gradient-to-r from-red-600 to-red-800 rounded-3xl p-8 text-white shadow-xl overflow-hidden mb-8">
          <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 bg-white/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-60 h-60 bg-red-400/20 rounded-full blur-2xl"></div>

          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-xs font-bold uppercase tracking-wider mb-3">
                <Lock className="h-3 w-3" />
                Private Notes
              </span>
              <h1 className="text-3xl font-extrabold tracking-tight mb-2">
                {t('propertyNote.pageTitle', 'Sổ Tay Ghi Chú Xem Nhà')}
              </h1>
              <p className="text-red-100 text-sm max-w-xl">
                Nơi bạn lưu trữ tất cả các nhận xét cá nhân, thông tin khảo sát thực tế và đánh giá bảo mật của mình về các dự án bất động sản.
              </p>
            </div>
            <div className="bg-white/15 backdrop-blur-lg p-5 rounded-2xl border border-white/10 flex items-center gap-4">
              <div className="p-3 bg-white text-red-700 rounded-xl shadow-md">
                <FileText className="h-6 w-6" />
              </div>
              <div>
                <div className="text-2xl font-black">{notes.length}</div>
                <div className="text-xs text-red-100 font-semibold uppercase">{t('propertyNote.statsTitle', 'Ghi chú đã tạo')}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Search Filter */}
        {notes.length > 0 && (
          <div className="relative mb-6">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t('propertyNote.searchPlaceholder', 'Tìm ghi chú hoặc tên bất động sản...')}
              className="w-full pl-12 pr-4 py-3.5 bg-white border border-gray-200 rounded-2xl focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none text-gray-900 text-sm font-medium shadow-sm transition-all"
            />
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          </div>
        )}

        {/* Notes list */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl border border-gray-100 shadow-sm">
            <Loader2 className="h-10 w-10 text-red-600 animate-spin mb-4" />
            <p className="text-gray-500 font-medium">{t('common.loading', 'Đang tải dữ liệu...')}</p>
          </div>
        ) : notes.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-16 bg-white rounded-3xl border border-gray-100 shadow-sm p-8"
          >
            <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6 text-red-600 border border-red-100">
              <FileText className="h-8 w-8" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">
              {t('propertyNote.emptyTitle', 'Sổ tay ghi chú còn trống')}
            </h2>
            <p className="text-gray-500 text-sm max-w-sm mx-auto mb-6">
              Bạn có thể dễ dàng lưu lại ý kiến cá nhân khi xem bất kỳ căn hộ nào. Các ghi chú này được mã hóa bảo mật và chỉ thuộc về bạn.
            </p>
            <button
              onClick={() => navigate('/properties')}
              className="inline-flex items-center gap-2 px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-semibold shadow transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0"
            >
              <Search className="h-5 w-5" />
              Tìm kiếm bất động sản
            </button>
          </motion.div>
        ) : filteredNotes.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-3xl border border-gray-100 p-8 shadow-sm">
            <AlertCircle className="h-10 w-10 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-500 font-medium text-sm">Không tìm thấy ghi chú khớp với từ khóa của bạn.</p>
          </div>
        ) : (
          <div className="space-y-6">
            <AnimatePresence>
              {filteredNotes.map((note) => (
                <motion.div
                  key={note.id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm hover:shadow-md transition-all duration-300"
                >
                  <div className="flex flex-col md:flex-row gap-6">
                    {/* Left: Property Preview Image */}
                    {note.property && (
                      <div className="w-full md:w-48 h-32 rounded-2xl overflow-hidden relative flex-shrink-0 bg-gray-100">
                        <img
                          src={getImageUrl(note.property.mainImageUrl || note.property.imageUrl) || getImagePlaceholder(300, 200)}
                          alt={note.property.title}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute top-2 left-2 bg-red-600/90 backdrop-blur-md text-white text-[10px] font-bold px-2 py-0.5 rounded-md">
                          {formatPrice(note.property.price)}
                        </div>
                      </div>
                    )}

                    {/* Right: Property Details & Note Box */}
                    <div className="flex-1 flex flex-col justify-between">
                      <div>
                        {note.property ? (
                          <div className="flex items-start justify-between gap-4 mb-2">
                            <div>
                              <h3 className="font-extrabold text-gray-900 hover:text-red-600 transition-colors text-base line-clamp-1">
                                <Link to={`/properties/${note.propertyId}`}>
                                  {note.property.title}
                                </Link>
                              </h3>
                              <p className="text-xs text-gray-500 truncate">{note.property.address}</p>
                            </div>
                            <Link 
                              to={`/properties/${note.propertyId}`}
                              className="p-2 border border-gray-100 hover:border-red-100 text-gray-400 hover:text-red-600 rounded-xl transition-all flex-shrink-0"
                            >
                              <ExternalLink className="h-4 w-4" />
                            </Link>
                          </div>
                        ) : (
                          <div className="mb-2">
                            <h3 className="font-extrabold text-gray-400 text-base italic">Bất động sản không còn khả dụng</h3>
                          </div>
                        )}

                        {/* Note Editing Area */}
                        {editingId === note.id ? (
                          <div className="space-y-3 mt-3">
                            <textarea
                              value={editContent}
                              onChange={(e) => setEditContent(e.target.value)}
                              className="w-full h-24 px-3 py-2 border border-gray-200 focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none rounded-xl text-gray-900 text-sm font-medium transition-all resize-none"
                            />
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => setEditingId(null)}
                                className="px-3.5 py-1.5 border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors text-xs font-semibold"
                              >
                                Hủy
                              </button>
                              <button
                                onClick={() => handleUpdateNote(note.id, note.propertyId)}
                                disabled={saving}
                                className="px-4 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow disabled:opacity-50"
                              >
                                {saving ? <Loader2 className="h-3 animate-spin" /> : <Save className="h-3 w-3" />}
                                Lưu lại
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100/70 mt-3 relative group">
                            <p className="text-gray-700 text-sm font-semibold leading-relaxed whitespace-pre-wrap">
                              {note.noteContent}
                            </p>

                            <div className="flex items-center justify-between border-t border-gray-200/50 pt-2.5 mt-3 text-[10px] text-gray-400">
                              <span className="flex items-center gap-1">
                                <Clock className="h-3.5 w-3.5" />
                                Cập nhật: {new Date(note.updatedAt || note.createdAt).toLocaleString()}
                              </span>

                              <div className="flex items-center gap-2 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                <button
                                  onClick={() => handleStartEdit(note)}
                                  className="p-1 hover:text-red-600 transition-colors"
                                  title="Chỉnh sửa ghi chú"
                                >
                                  <Edit3 className="h-3.5 w-3.5" />
                                </button>
                                <button
                                  onClick={() => handleDelete(note.id)}
                                  className="p-1 hover:text-red-600 transition-colors"
                                  title="Xóa ghi chú"
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </button>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyNotesPage;
