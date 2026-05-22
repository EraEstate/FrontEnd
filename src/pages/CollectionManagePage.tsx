import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  Folder, 
  Share2, 
  Trash2, 
  Lock, 
  Globe, 
  ChevronRight, 
  Building, 
  MapPin, 
  Ruler, 
  ExternalLink,
  Plus,
  Loader2,
  AlertCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { propertyCollectionAPI } from '../api';
import type { PropertyCollection } from '../api/types';
import { showSuccess, showError, showWarning } from '../utils/toast';
import { getImageUrl, getImagePlaceholder } from '../utils/imageUtils';
import { Link } from 'react-router-dom';

export const CollectionManagePage: React.FC = () => {
  const { t } = useTranslation();
  
  const [collections, setCollections] = useState<PropertyCollection[]>([]);
  const [selectedCol, setSelectedCol] = useState<PropertyCollection | null>(null);
  const [loading, setLoading] = useState(false);
  const [updating, setUpdating] = useState(false);

  // Edit fields
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState('');
  const [editDesc, setEditDesc] = useState('');
  const [editIsPublic, setEditIsPublic] = useState(false);

  const fetchCollections = async (selectId?: string) => {
    try {
      setLoading(true);
      const data = await propertyCollectionAPI.getMyCollections();
      setCollections(data);
      
      if (data.length > 0) {
        // Retain selection if applicable
        const found = data.find(c => c.id === (selectId || selectedCol?.id));
        setSelectedCol(found || data[0]);
      } else {
        setSelectedCol(null);
      }
    } catch (error) {
      console.error(error);
      showError(t('propertyCollection.loadFailed', 'Không thể tải danh sách bộ sưu tập'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCollections();
  }, []);

  useEffect(() => {
    if (selectedCol) {
      setEditName(selectedCol.name);
      setEditDesc(selectedCol.description || '');
      setEditIsPublic(selectedCol.isPublic);
      setIsEditing(false);
    }
  }, [selectedCol]);

  const handleUpdateCollection = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCol) return;
    if (!editName.trim()) {
      showWarning(t('propertyCollection.emptyName', 'Tên bộ sưu tập không được để trống'));
      return;
    }

    try {
      setUpdating(true);
      const updated = await propertyCollectionAPI.updateCollection(
        selectedCol.id,
        editName.trim(),
        editDesc.trim(),
        editIsPublic
      );
      showSuccess(t('propertyCollection.updateSuccess', 'Cập nhật bộ sưu tập thành công!'));
      setIsEditing(false);
      fetchCollections(updated.id);
    } catch (error) {
      showError(t('propertyCollection.updateError', 'Lỗi khi cập nhật bộ sưu tập'));
    } finally {
      setUpdating(false);
    }
  };

  const handleDeleteCollection = async () => {
    if (!selectedCol) return;
    if (!window.confirm(t('propertyCollection.confirmDelete', 'Bạn có chắc chắn muốn xóa bộ sưu tập này?'))) {
      return;
    }

    try {
      setLoading(true);
      await propertyCollectionAPI.deleteCollection(selectedCol.id);
      showSuccess(t('propertyCollection.deleteSuccess', 'Đã xóa bộ sưu tập thành công!'));
      fetchCollections();
    } catch (error) {
      showError(t('propertyCollection.deleteError', 'Lỗi khi xóa bộ sưu tập'));
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveItem = async (propertyId: number) => {
    if (!selectedCol) return;
    try {
      await propertyCollectionAPI.removeItemFromCollection(selectedCol.id, propertyId);
      showSuccess(t('propertyCollection.removeItemSuccess', 'Đã xóa bất động sản khỏi bộ sưu tập!'));
      fetchCollections(selectedCol.id);
    } catch (error) {
      showError(t('propertyCollection.removeItemError', 'Lỗi khi xóa bất động sản khỏi bộ sưu tập'));
    }
  };

  const handleShareCollection = () => {
    if (!selectedCol) return;
    if (!selectedCol.isPublic) {
      showWarning(t('propertyCollection.sharePrivateWarning', 'Vui lòng chuyển trạng thái bộ sưu tập sang Công Khai để chia sẻ'));
      return;
    }

    const shareUrl = `${window.location.origin}/shared-collection/${selectedCol.shareToken}`;
    void navigator.clipboard?.writeText(shareUrl);
    showSuccess(t('propertyCollection.shareCopied', 'Đã sao chép liên kết chia sẻ bộ sưu tập!'));
  };

  const formatPrice = (price: number) => {
    if (price >= 1000000000) {
      return `${(price / 1000000000).toFixed(1)} tỷ`;
    } else if (price >= 1000000) {
      return `${(price / 1000000).toFixed(0)} triệu`;
    }
    return price.toLocaleString('vi-VN') + ' VND';
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-black text-gray-900 tracking-tight flex items-center gap-2">
            <Folder className="h-7 w-7 text-red-600" />
            Bộ Sưu Tập Của Tôi
          </h1>
          <p className="text-xs text-gray-500 font-semibold mt-1">Lưu trữ, tổ chức và chia sẻ danh sách bất động sản của riêng bạn</p>
        </div>

        {loading && collections.length === 0 ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-red-600" />
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Sidebar list */}
            <div className="lg:col-span-1 space-y-3">
              <div className="bg-white rounded-3xl p-5 border border-gray-100 shadow-sm space-y-4">
                <h3 className="font-extrabold text-sm text-gray-900">Danh sách bộ sưu tập</h3>
                
                {collections.length === 0 ? (
                  <div className="text-center py-8 text-gray-400">
                    <Folder className="h-10 w-10 mx-auto mb-2 text-gray-300" />
                    <p className="text-xs font-bold">Chưa có bộ sưu tập nào.</p>
                    <p className="text-[10px] text-gray-400 mt-1">Thêm từ trang chi tiết bất động sản bất kỳ!</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {collections.map(col => {
                      const isActive = selectedCol?.id === col.id;
                      return (
                        <button
                          key={col.id}
                          onClick={() => setSelectedCol(col)}
                          className={`w-full flex items-center justify-between p-3.5 rounded-2xl border text-left transition-all duration-200 ${
                            isActive 
                              ? 'border-red-500 bg-red-50 text-red-700 shadow-sm font-bold' 
                              : 'border-gray-50 hover:border-gray-200 text-gray-800 bg-gray-50/50 hover:bg-gray-50'
                          }`}
                        >
                          <div className="flex items-center gap-3 truncate">
                            <Folder className={`h-5 w-5 flex-shrink-0 ${isActive ? 'text-red-500' : 'text-gray-400'}`} />
                            <div className="truncate">
                              <div className="text-xs font-extrabold truncate">{col.name}</div>
                              <span className="text-[9px] text-gray-400 font-bold block mt-0.5">
                                {col.items?.length || 0} bất động sản
                              </span>
                            </div>
                          </div>
                          <ChevronRight className={`h-4 w-4 flex-shrink-0 ${isActive ? 'text-red-500' : 'text-gray-300'}`} />
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* Main Detail panel */}
            <div className="lg:col-span-2">
              {selectedCol ? (
                <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 space-y-6">
                  
                  {/* Collection Header */}
                  <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 pb-6 border-b border-gray-100">
                    <div className="space-y-2 flex-1">
                      {!isEditing ? (
                        <>
                          <div className="flex items-center gap-2.5 flex-wrap">
                            <h2 className="text-xl font-black text-gray-900 tracking-tight">{selectedCol.name}</h2>
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-gray-100 border border-gray-200 text-gray-500">
                              {selectedCol.isPublic ? <Globe className="h-3 w-3 text-blue-500" /> : <Lock className="h-3 w-3" />}
                              {selectedCol.isPublic ? 'Công khai' : 'Riêng tư'}
                            </span>
                          </div>
                          {selectedCol.description && (
                            <p className="text-xs text-gray-500 font-semibold leading-relaxed">{selectedCol.description}</p>
                          )}
                        </>
                      ) : (
                        <form onSubmit={handleUpdateCollection} className="space-y-3.5 bg-gray-50 p-4 rounded-2xl border border-gray-100">
                          <div className="space-y-1">
                            <label className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Tên bộ sưu tập</label>
                            <input
                              type="text"
                              required
                              value={editName}
                              onChange={e => setEditName(e.target.value)}
                              className="w-full px-3.5 py-2 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 outline-none text-xs font-bold text-gray-900"
                            />
                          </div>

                          <div className="space-y-1">
                            <label className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Mô tả</label>
                            <textarea
                              value={editDesc}
                              onChange={e => setEditDesc(e.target.value)}
                              className="w-full h-20 px-3.5 py-2 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 outline-none text-xs font-semibold text-gray-900 resize-none"
                            />
                          </div>

                          <div className="flex items-center justify-between">
                            <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider flex items-center gap-1">
                              {editIsPublic ? <Globe className="h-3.5 w-3.5 text-blue-500" /> : <Lock className="h-3.5 w-3.5 text-gray-400" />}
                              Công khai (Cho phép chia sẻ link)
                            </span>
                            <button
                              type="button"
                              onClick={() => setEditIsPublic(!editIsPublic)}
                              className={`relative inline-flex h-5 w-9 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none ${
                                editIsPublic ? 'bg-red-500' : 'bg-gray-200'
                              }`}
                            >
                              <span
                                className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ${
                                  editIsPublic ? 'translate-x-4' : 'translate-x-0'
                               }`}
                              />
                            </button>
                          </div>

                          <div className="flex justify-end gap-2 pt-2">
                            <button
                              type="button"
                              onClick={() => setIsEditing(false)}
                              className="px-4 py-2 border border-gray-200 rounded-xl text-xs font-bold text-gray-600 hover:bg-gray-100 transition-colors"
                            >
                              Hủy
                            </button>
                            <button
                              type="submit"
                              disabled={updating}
                              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold shadow flex items-center gap-1"
                            >
                              {updating && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                              Lưu thay đổi
                            </button>
                          </div>
                        </form>
                      )}
                    </div>

                    {!isEditing && (
                      <div className="flex gap-2 self-start flex-wrap">
                        <button
                          onClick={handleShareCollection}
                          className="px-4 py-2 bg-blue-50 hover:bg-blue-100 text-blue-600 border border-blue-100 rounded-xl text-xs font-bold shadow-sm flex items-center gap-1.5 transition-all duration-200 active:scale-[0.98]"
                        >
                          <Share2 className="h-3.5 w-3.5" />
                          Chia sẻ bộ sưu tập
                        </button>
                        <button
                          onClick={() => setIsEditing(true)}
                          className="px-4 py-2 bg-gray-50 hover:bg-gray-100 text-gray-700 border border-gray-200 rounded-xl text-xs font-bold shadow-sm transition-all duration-200"
                        >
                          Sửa
                        </button>
                        <button
                          onClick={handleDeleteCollection}
                          className="p-2 bg-red-50 hover:bg-red-100 text-red-600 border border-red-100 rounded-xl transition-all duration-200"
                          title="Xóa bộ sưu tập"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Properties list */}
                  <div className="space-y-4">
                    <h3 className="font-extrabold text-xs text-gray-400 uppercase tracking-wider">
                      Bất động sản trong bộ sưu tập ({selectedCol.items?.length || 0})
                    </h3>
                    
                    {(!selectedCol.items || selectedCol.items.length === 0) ? (
                      <div className="text-center py-10 border-2 border-dashed border-gray-100 rounded-2xl text-gray-400">
                        <Building className="h-10 w-10 mx-auto mb-2 text-gray-200 animate-pulse" />
                        <p className="text-xs font-bold">Chưa có bất động sản nào trong bộ sưu tập này.</p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {selectedCol.items.map(item => {
                          const prop = item.property;
                          if (!prop) return null;
                          return (
                            <div 
                              key={item.id}
                              className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-200 relative group"
                            >
                              <div className="aspect-[16/10] overflow-hidden bg-gray-100 relative">
                                <img
                                  src={getImageUrl(prop.images?.[0]?.imageUrl) || getImagePlaceholder(300, 200)}
                                  alt={prop.title}
                                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                />
                                <div className="absolute top-2 left-2 bg-black/60 backdrop-blur-sm text-white px-2 py-0.5 text-[9px] font-black uppercase rounded">
                                  {prop.listingType === 'RENT' ? 'Cho thuê' : 'Bán'}
                                </div>
                              </div>

                              <div className="p-4 space-y-2">
                                <Link 
                                  to={`/properties/${prop.id}`}
                                  className="text-xs font-black text-gray-900 line-clamp-1 hover:text-red-600 flex items-center gap-1.5"
                                >
                                  {prop.title}
                                  <ExternalLink className="h-3.5 w-3.5 inline opacity-50" />
                                </Link>
                                
                                <div className="text-sm font-black text-red-600">{formatPrice(prop.price)}</div>

                                <div className="flex items-center gap-3 text-[10px] text-gray-500 font-bold border-t border-gray-50 pt-2">
                                  <span className="flex items-center gap-0.5">
                                    <Ruler className="h-3.5 w-3.5 text-gray-400" />
                                    {prop.area} m²
                                  </span>
                                  {prop.location && (
                                    <span className="flex items-center gap-0.5 truncate max-w-[120px]">
                                      <MapPin className="h-3.5 w-3.5 text-gray-400" />
                                      {prop.location.district?.name || prop.location.address}
                                    </span>
                                  )}
                                </div>
                              </div>

                              {/* Remove item button */}
                              <button
                                onClick={() => handleRemoveItem(prop.id)}
                                className="absolute top-2 right-2 p-1.5 bg-white/90 hover:bg-red-50 text-gray-400 hover:text-red-600 rounded-lg shadow-sm border border-gray-100 transition-all opacity-0 group-hover:opacity-100"
                                title="Xóa khỏi bộ sưu tập"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>

                </div>
              ) : (
                <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-12 text-center text-gray-400">
                  <Folder className="h-16 w-16 mx-auto mb-4 text-gray-200" />
                  <h3 className="font-extrabold text-base text-gray-900 mb-1">Chưa chọn bộ sưu tập</h3>
                  <p className="text-xs">Vui lòng chọn hoặc tạo bộ sưu tập mới từ danh sách bên trái!</p>
                </div>
              )}
            </div>

          </div>
        )}

      </div>
    </div>
  );
};
