import React, { useState, useEffect } from 'react';
import { CheckCircle, XCircle, Eye, Loader2 } from 'lucide-react';
import { propertyAPI } from '../../api/property';
import toast from '../../utils/toast';

const PropertyModerationPage: React.FC = () => {
  const [properties, setProperties] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [processingId, setProcessingId] = useState<string | null>(null);

  useEffect(() => {
    fetchPendingProperties();
  }, [currentPage]);

  const fetchPendingProperties = async () => {
    try {
      setLoading(true);
      const response = await propertyAPI.getPendingProperties(currentPage, 20);
      setProperties(response.content || []);
      setTotalPages(response.totalPages || 1);
    } catch (error: any) {
      console.error('Failed to fetch pending properties:', error);
      toast.error('Không thể tải danh sách tin đăng chờ duyệt');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id: string) => {
    try {
      setProcessingId(id);
      await propertyAPI.approveProperty(id);
      toast.success('Đã duyệt tin đăng thành công');
      fetchPendingProperties();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Không thể duyệt tin đăng');
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (id: string, reason?: string) => {
    const rejectReason = reason || prompt('Nhập lý do từ chối (tùy chọn):');
    if (rejectReason === null) return; // User cancelled

    try {
      setProcessingId(id);
      await propertyAPI.rejectProperty(id, rejectReason || '');
      toast.success('Đã từ chối tin đăng');
      fetchPendingProperties();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Không thể từ chối tin đăng');
    } finally {
      setProcessingId(null);
    }
  };

  const formatPrice = (price: number) => {
    if (price >= 1000000000) return `${(price / 1000000000).toFixed(1)} tỷ`;
    if (price >= 1000000) return `${(price / 1000000).toFixed(0)} triệu`;
    return price.toLocaleString('vi-VN');
  };

  if (loading && properties.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Duyệt Tin Đăng</h1>
        <p className="text-sm text-gray-500 mt-1">Xem xét và duyệt/từ chối các tin đăng chờ duyệt</p>
      </div>

      {properties.length === 0 ? (
        <div className="bg-white rounded-xl shadow-md p-8 text-center">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <p className="text-gray-600">Không có tin đăng nào chờ duyệt</p>
        </div>
      ) : (
        <div className="space-y-4">
          {properties.map((property) => (
            <div key={property.id} className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">{property.title}</h3>
                    <span className="px-2 py-1 text-xs font-medium bg-yellow-100 text-yellow-800 rounded">
                      Chờ duyệt
                    </span>
                  </div>
                  
                  <p className="text-gray-600 text-sm mb-3 line-clamp-2">{property.description}</p>
                  
                  <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                    <span className="font-medium text-blue-600">{formatPrice(property.price)}</span>
                    <span>{property.area} m²</span>
                    {property.bedrooms && <span>{property.bedrooms} phòng ngủ</span>}
                    {property.bathrooms && <span>{property.bathrooms} phòng tắm</span>}
                    {property.location?.address && (
                      <span className="flex items-center gap-1">
                        <span>{property.location.address}</span>
                      </span>
                    )}
                  </div>

                  <div className="mt-3 text-xs text-gray-500">
                    Đăng bởi: {property.owner?.fullName || 'N/A'} • {new Date(property.createdAt).toLocaleDateString('vi-VN')}
                  </div>
                </div>

                <div className="flex items-center gap-2 ml-4">
                  <button
                    onClick={() => window.open(`/properties/${property.id}`, '_blank')}
                    className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                    title="Xem chi tiết"
                  >
                    <Eye className="w-5 h-5" />
                  </button>
                  
                  <button
                    onClick={() => handleApprove(property.id)}
                    disabled={processingId === property.id}
                    className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
                  >
                    {processingId === property.id ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <CheckCircle className="w-4 h-4" />
                    )}
                    Duyệt
                  </button>
                  
                  <button
                    onClick={() => handleReject(property.id)}
                    disabled={processingId === property.id}
                    className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors"
                  >
                    {processingId === property.id ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <XCircle className="w-4 h-4" />
                    )}
                    Từ chối
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={() => setCurrentPage(p => Math.max(0, p - 1))}
            disabled={currentPage === 0}
            className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
          >
            Trước
          </button>
          <span className="px-4 py-2 text-sm text-gray-600">
            Trang {currentPage + 1} / {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage(p => Math.min(totalPages - 1, p + 1))}
            disabled={currentPage >= totalPages - 1}
            className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
          >
            Sau
          </button>
        </div>
      )}
    </div>
  );
};

export default PropertyModerationPage;

