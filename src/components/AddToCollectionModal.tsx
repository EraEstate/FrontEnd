import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  FolderPlus, 
  Folder, 
  Check, 
  Plus, 
  X, 
  Loader2, 
  Lock, 
  Globe, 
  FileText 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { propertyCollectionAPI } from '../api';
import type { PropertyCollection } from '../api/types';
import { showSuccess, showError, showWarning } from '../utils/toast';

interface AddToCollectionModalProps {
  propertyId: number;
  isOpen: boolean;
  onClose: () => void;
}

export const AddToCollectionModal: React.FC<AddToCollectionModalProps> = ({ propertyId, isOpen, onClose }) => {
  const { t } = useTranslation();
  
  const [collections, setCollections] = useState<PropertyCollection[]>([]);
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  
  // New Collection Form
  const [newName, setNewName] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newIsPublic, setNewIsPublic] = useState(false);

  const fetchCollections = async () => {
    try {
      setLoading(true);
      const data = await propertyCollectionAPI.getMyCollections();
      setCollections(data);
    } catch (error) {
      console.error('Failed to load collections', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchCollections();
      setShowCreateForm(false);
      setNewName('');
      setNewDesc('');
      setNewIsPublic(false);
    }
  }, [isOpen, propertyId]);

  const handleToggleItem = async (collection: PropertyCollection) => {
    const isCurrentlyIn = collection.items?.some(item => item.propertyId === propertyId);

    try {
      if (isCurrentlyIn) {
        await propertyCollectionAPI.removeItemFromCollection(collection.id, propertyId);
        showSuccess(t('propertyCollection.removeSuccess', 'Đã xóa bất động sản khỏi bộ sưu tập!'));
      } else {
        await propertyCollectionAPI.addItemToCollection(collection.id, propertyId);
        showSuccess(t('propertyCollection.addSuccess', 'Đã thêm bất động sản vào bộ sưu tập!'));
      }
      // Refresh to update items check state
      fetchCollections();
    } catch (error) {
      showError(t('propertyCollection.toggleError', 'Lỗi khi cập nhật bộ sưu tập'));
    }
  };

  const handleCreateCollection = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) {
      showWarning(t('propertyCollection.emptyName', 'Vui lòng điền tên bộ sưu tập'));
      return;
    }

    try {
      setCreating(true);
      const newCol = await propertyCollectionAPI.createCollection(
        newName.trim(),
        newDesc.trim(),
        newIsPublic
      );
      
      // Auto add current property to this newly created collection for ultra smooth UX!
      await propertyCollectionAPI.addItemToCollection(newCol.id, propertyId);
      
      showSuccess(t('propertyCollection.createAndAddSuccess', 'Đã tạo bộ sưu tập và thêm bất động sản!'));
      setShowCreateForm(false);
      setNewName('');
      setNewDesc('');
      setNewIsPublic(false);
      fetchCollections();
    } catch (error) {
      showError(t('propertyCollection.createError', 'Lỗi khi tạo bộ sưu tập'));
    } finally {
      setCreating(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop overlay */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        />

        {/* Modal content */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 15 }}
          className="relative w-full max-w-md bg-white rounded-3xl overflow-hidden shadow-2xl z-10 border border-gray-100 flex flex-col max-h-[90vh]"
        >
          {/* Header */}
          <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-red-50 to-white">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-red-100 text-red-600 rounded-xl">
                <FolderPlus className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-extrabold text-gray-900 text-sm">{t('propertyCollection.addToTitle', 'Thêm Vào Bộ Sưu Tập')}</h3>
                <p className="text-[10px] text-gray-400 font-semibold">Tổ chức giỏ hàng hoặc chia sẻ với bạn bè</p>
              </div>
            </div>
            <button 
              onClick={onClose}
              className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Body content */}
          <div className="p-6 overflow-y-auto space-y-4 flex-1 custom-scrollbar">
            {loading ? (
              <div className="flex items-center justify-center py-10">
                <Loader2 className="h-6 w-6 animate-spin text-red-600" />
              </div>
            ) : (
              <div className="space-y-2">
                {collections.length === 0 ? (
                  <div className="text-center py-6 text-gray-400">
                    <Folder className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                    <p className="text-xs font-semibold">Bạn chưa có bộ sưu tập nào.</p>
                  </div>
                ) : (
                  collections.map(col => {
                    const isChecked = col.items?.some(item => item.propertyId === propertyId);
                    return (
                      <button
                        key={col.id}
                        onClick={() => handleToggleItem(col)}
                        className={`w-full flex items-center justify-between p-3.5 rounded-2xl border text-left transition-all duration-200 ${
                          isChecked 
                            ? 'border-red-500 bg-red-50 text-red-700 shadow-sm' 
                            : 'border-gray-100 hover:border-gray-200 text-gray-800 bg-gray-50/50 hover:bg-gray-50'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <Folder className={`h-5 w-5 flex-shrink-0 ${isChecked ? 'text-red-500 fill-red-100' : 'text-gray-400'}`} />
                          <div>
                            <div className="text-xs font-bold truncate max-w-[200px]">{col.name}</div>
                            {col.description && (
                              <p className="text-[10px] text-gray-400 line-clamp-1 mt-0.5">{col.description}</p>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-white border border-gray-100 text-gray-500 flex items-center gap-0.5">
                            {col.isPublic ? <Globe className="h-2.5 w-2.5" /> : <Lock className="h-2.5 w-2.5" />}
                            {col.isPublic ? 'Công khai' : 'Riêng tư'}
                          </span>

                          <div className={`w-5 h-5 rounded-full flex items-center justify-center transition-all ${
                            isChecked ? 'bg-red-500 text-white scale-110' : 'border border-gray-200'
                          }`}>
                            {isChecked && <Check className="h-3 w-3 stroke-[3]" />}
                          </div>
                        </div>
                      </button>
                    );
                  })
                )}
              </div>
            )}

            {/* Expandable Inline Creator Form */}
            <div className="border-t border-gray-100 pt-4 mt-2">
              {!showCreateForm ? (
                <button
                  onClick={() => setShowCreateForm(true)}
                  className="w-full py-3 bg-gray-50 hover:bg-gray-100 rounded-2xl text-xs font-bold text-gray-700 hover:text-gray-900 border border-gray-100 flex items-center justify-center gap-1.5 transition-all duration-200 active:scale-[0.98]"
                >
                  <Plus className="h-4 w-4" />
                  Tạo bộ sưu tập mới
                </button>
              ) : (
                <form onSubmit={handleCreateCollection} className="space-y-3.5 bg-gray-50 p-4 rounded-2xl border border-gray-100/70">
                  <div className="flex justify-between items-center pb-2 border-b border-gray-200/50">
                    <span className="text-xs font-extrabold text-gray-800">Bộ Sưu Tập Mới</span>
                    <button
                      type="button"
                      onClick={() => setShowCreateForm(false)}
                      className="text-gray-400 hover:text-gray-600 text-xs font-medium"
                    >
                      Hủy
                    </button>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Tên bộ sưu tập *</label>
                    <input
                      type="text"
                      required
                      value={newName}
                      onChange={e => setNewName(e.target.value)}
                      placeholder="Ví dụ: Ưu tiên khảo sát Q7..."
                      className="w-full px-3.5 py-2 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none text-xs font-semibold text-gray-900"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Mô tả (Không bắt buộc)</label>
                    <textarea
                      value={newDesc}
                      onChange={e => setNewDesc(e.target.value)}
                      placeholder="Ví dụ: Danh sách các căn hộ hẻm ô tô gần trung tâm..."
                      className="w-full h-16 px-3.5 py-2 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none text-xs font-semibold text-gray-900 resize-none"
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider flex items-center gap-1">
                      {newIsPublic ? <Globe className="h-3.5 w-3.5 text-blue-500" /> : <Lock className="h-3.5 w-3.5 text-gray-400" />}
                      Cho phép chia sẻ công khai
                    </span>
                    <button
                      type="button"
                      onClick={() => setNewIsPublic(!newIsPublic)}
                      className={`relative inline-flex h-5 w-9 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                        newIsPublic ? 'bg-red-500' : 'bg-gray-200'
                      }`}
                    >
                      <span
                        className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                          newIsPublic ? 'translate-x-4' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>

                  <button
                    type="submit"
                    disabled={creating}
                    className="w-full py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold shadow flex items-center justify-center gap-1.5 transition-all duration-200 active:scale-95 disabled:opacity-50"
                  >
                    {creating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                    Tạo và thêm ngay
                  </button>
                </form>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
