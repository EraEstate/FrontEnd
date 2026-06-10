import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Loader2, CheckCircle2, Clock, AlertCircle, FileText, Calendar, Plus, DollarSign, Trash2, X } from 'lucide-react';
import { rentalPaymentAPI, type RentalPaymentResponse, type RentalPaymentRequest } from '../api/rentalPayment';
import { useMyProperties } from '../api/hooks';
import toast from '../utils/toast';

const RentalManagementPage: React.FC = () => {
  const { t } = useTranslation();
  const [payments, setPayments] = useState<RentalPaymentResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'all' | 'pending' | 'paid' | 'overdue'>('all');
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { data: propertiesData } = useMyProperties(0, 100); // Fetch properties for dropdown
  
  // Form State
  const [formData, setFormData] = useState<RentalPaymentRequest>({
    propertyId: '',
    amount: 0,
    dueDate: new Date().toISOString().split('T')[0],
    description: ''
  });
  const [formLoading, setFormLoading] = useState(false);

  const fetchPayments = async () => {
    setLoading(true);
    try {
      const res = await rentalPaymentAPI.getMyPropertyPayments(0, 50);
      setPayments(res.content || []);
    } catch (error) {
      toast.error('Không thể tải danh sách hóa đơn tiền thuê');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, []);

  const handleCreatePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true);
    try {
      await rentalPaymentAPI.createPayment(formData);
      toast.success('Đã tạo hóa đơn thành công');
      setIsModalOpen(false);
      fetchPayments();
    } catch (error) {
      toast.error('Lỗi khi tạo hóa đơn');
    } finally {
      setFormLoading(false);
    }
  };

  const handleMarkAsPaid = async (id: string) => {
    if (!window.confirm('Xác nhận hóa đơn này đã được thanh toán?')) return;
    try {
      await rentalPaymentAPI.markAsPaid(id);
      toast.success('Cập nhật trạng thái thành công');
      fetchPayments();
    } catch (error) {
      toast.error('Lỗi khi cập nhật trạng thái');
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Bạn có chắc muốn xóa hóa đơn này?')) return;
    try {
      await rentalPaymentAPI.deletePayment(id);
      toast.success('Đã xóa hóa đơn');
      fetchPayments();
    } catch (error) {
      toast.error('Lỗi khi xóa hóa đơn');
    }
  };

  const filteredPayments = payments.filter(p => {
    if (activeTab === 'all') return true;
    return p.status.toLowerCase() === activeTab;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PAID':
        return <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border bg-emerald-100 text-emerald-700 border-emerald-200"><CheckCircle2 className="w-3 h-3"/> Đã thanh toán</span>;
      case 'PENDING':
        return <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border bg-amber-100 text-amber-700 border-amber-200"><Clock className="w-3 h-3"/> Chờ thanh toán</span>;
      case 'OVERDUE':
        return <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border bg-red-100 text-red-700 border-red-200"><AlertCircle className="w-3 h-3"/> Quá hạn</span>;
      default:
        return <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border bg-gray-100 text-gray-700 border-gray-200">{status}</span>;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 pt-24 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-semibold text-gray-900 flex items-center gap-3">
              <DollarSign className="w-8 h-8 text-green-600 p-1.5 bg-green-100 rounded-lg" />
              Quản lý dòng tiền cho thuê
            </h1>
            <p className="text-gray-500 mt-2">Theo dõi và quản lý các khoản thu tiền thuê nhà hàng tháng</p>
          </div>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center gap-2 bg-red-600 text-white px-5 py-2.5 rounded-xl hover:bg-red-700 transition font-medium shadow-md"
          >
            <Plus className="w-5 h-5" /> Tạo hóa đơn mới
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <p className="text-gray-500 text-sm font-medium mb-1">Tổng doanh thu</p>
            <h3 className="text-2xl font-semibold text-gray-900">
              {payments.filter(p => p.status === 'PAID').reduce((acc, curr) => acc + curr.amount, 0).toLocaleString()} VNĐ
            </h3>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <p className="text-amber-600 text-sm font-medium mb-1 flex items-center gap-1"><Clock className="w-4 h-4"/> Chờ thu</p>
            <h3 className="text-2xl font-semibold text-amber-600">
              {payments.filter(p => p.status === 'PENDING').reduce((acc, curr) => acc + curr.amount, 0).toLocaleString()} VNĐ
            </h3>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <p className="text-red-600 text-sm font-medium mb-1 flex items-center gap-1"><AlertCircle className="w-4 h-4"/> Quá hạn</p>
            <h3 className="text-2xl font-semibold text-red-600">
              {payments.filter(p => p.status === 'OVERDUE').reduce((acc, curr) => acc + curr.amount, 0).toLocaleString()} VNĐ
            </h3>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-center">
            <p className="text-gray-500 text-sm font-medium mb-1">Tỷ lệ thu hồi</p>
            <h3 className="text-2xl font-semibold text-green-600">
              {payments.length > 0 ? Math.round((payments.filter(p => p.status === 'PAID').length / payments.length) * 100) : 0}%
            </h3>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white p-2 rounded-xl shadow-sm border border-gray-100 inline-flex mb-6 w-full overflow-x-auto">
          {[
            { id: 'all', label: 'Tất cả' },
            { id: 'pending', label: 'Chờ thanh toán' },
            { id: 'paid', label: 'Đã thu' },
            { id: 'overdue', label: 'Quá hạn' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-6 py-2.5 rounded-lg font-medium text-sm whitespace-nowrap transition-all ${
                activeTab === tab.id 
                  ? 'bg-gray-100 text-gray-900' 
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* List */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          {loading ? (
            <div className="p-12 flex justify-center">
              <Loader2 className="w-8 h-8 text-red-500 animate-spin" />
            </div>
          ) : filteredPayments.length === 0 ? (
            <div className="p-12 text-center">
              <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Không có hóa đơn nào</h3>
              <p className="text-gray-500">Chưa có dữ liệu cho mục này.</p>
            </div>
          ) : (
            <>
              {/* Card List for Mobile */}
              <div className="block md:hidden divide-y divide-gray-100">
                {filteredPayments.map(payment => (
                  <div key={payment.id} className="p-4 space-y-3 bg-white hover:bg-gray-50/50">
                    <div className="flex justify-between items-start gap-2">
                      <div>
                        <p className="font-semibold text-gray-900 line-clamp-2">{payment.propertyTitle}</p>
                        <p className="text-xs text-gray-500 mt-1">{payment.description}</p>
                      </div>
                      <div suppressHydrationWarning>
                        {getStatusBadge(payment.status)}
                      </div>
                    </div>
                    
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-500">Người thuê:</span>
                      <span className="font-medium text-gray-700">{payment.tenantName || 'Khách vãng lai'}</span>
                    </div>

                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-500">Số tiền:</span>
                      <span className="font-bold text-red-600">{payment.amount.toLocaleString()} VNĐ</span>
                    </div>

                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-500">Hạn chót:</span>
                      <span className="text-gray-600 flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" /> 
                        <span suppressHydrationWarning>{new Date(payment.dueDate).toLocaleDateString('vi-VN')}</span>
                      </span>
                    </div>

                    <div className="flex justify-end gap-2 pt-2 border-t border-gray-50">
                      {payment.status !== 'PAID' && (
                        <button 
                          onClick={() => handleMarkAsPaid(payment.id)}
                          className="inline-flex items-center gap-1 px-3 py-1.5 bg-green-50 text-green-700 rounded-lg text-xs font-semibold hover:bg-green-100 transition"
                          title="Xác nhận đã thu tiền"
                        >
                          <CheckCircle2 className="w-4 h-4"/> Xác nhận thu
                        </button>
                      )}
                      <button 
                        onClick={() => handleDelete(payment.id)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 bg-red-50 text-red-700 rounded-lg text-xs font-semibold hover:bg-red-100 transition"
                        title="Xóa hóa đơn"
                      >
                        <Trash2 className="w-4 h-4" /> Xóa
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Table for Desktop */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-100">
                      <th className="p-4 text-sm font-medium text-gray-500">Bất động sản</th>
                      <th className="p-4 text-sm font-medium text-gray-500">Người thuê</th>
                      <th className="p-4 text-sm font-medium text-gray-500">Số tiền</th>
                      <th className="p-4 text-sm font-medium text-gray-500">Hạn chót</th>
                      <th className="p-4 text-sm font-medium text-gray-500">Trạng thái</th>
                      <th className="p-4 text-sm font-medium text-gray-500 text-right">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {filteredPayments.map(payment => (
                      <tr key={payment.id} className="hover:bg-gray-50/50">
                        <td className="p-4">
                          <p className="font-semibold text-gray-900 line-clamp-1">{payment.propertyTitle}</p>
                          <p className="text-xs text-gray-500 mt-1">{payment.description}</p>
                        </td>
                        <td className="p-4">
                          <span className="text-sm font-medium text-gray-700">{payment.tenantName || 'Khách vãng lai'}</span>
                        </td>
                        <td className="p-4">
                          <span className="font-bold text-red-600">{payment.amount.toLocaleString()} VNĐ</span>
                        </td>
                        <td className="p-4">
                          <span className="text-sm text-gray-600 flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5" /> 
                            <span suppressHydrationWarning>{new Date(payment.dueDate).toLocaleDateString('vi-VN')}</span>
                          </span>
                        </td>
                        <td className="p-4" suppressHydrationWarning>
                          {getStatusBadge(payment.status)}
                        </td>
                        <td className="p-4 text-right">
                          <div className="flex justify-end gap-2">
                            {payment.status !== 'PAID' && (
                              <button 
                                onClick={() => handleMarkAsPaid(payment.id)}
                                className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition"
                                title="Xác nhận đã thu tiền"
                              >
                                <CheckCircle2 className="w-5 h-5" />
                              </button>
                            )}
                            <button 
                              onClick={() => handleDelete(payment.id)}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                              title="Xóa hóa đơn"
                            >
                              <Trash2 className="w-5 h-5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Modal Tạo Hóa Đơn */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-gray-950/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl animate-fade-in-up">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-900">Tạo hóa đơn thu tiền</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <form onSubmit={handleCreatePayment} className="p-6 space-y-4">
              <div>
                <label htmlFor="rental-payment-property" className="block text-sm font-medium text-gray-700 mb-1">Bất động sản <span className="text-red-500">*</span></label>
                <select id="rental-payment-property" 
                  required
                  value={formData.propertyId}
                  onChange={e => setFormData((prev) => ({ ...prev, propertyId: e.target.value }))}
                  className="w-full border-gray-300 rounded-lg shadow-sm focus:border-red-500 focus:ring-red-500"
                >
                  <option value="">Chọn bất động sản…</option>
                  {propertiesData?.content?.flatMap((p: any) =>
                    p.status === 'RENTED' || p.listingType === 'RENT'
                      ? [<option key={p.id} value={p.id}>{p.title}</option>]
                      : []
                  )}
                </select>
              </div>

              <div>
                <label htmlFor="rental-payment-amount" className="block text-sm font-medium text-gray-700 mb-1">Số tiền (VNĐ) <span className="text-red-500">*</span></label>
                <input id="rental-payment-amount" 
                  type="number" 
                  required
                  min="0"
                  value={formData.amount}
                  onChange={e => setFormData((prev) => ({ ...prev, amount: Number(e.target.value) }))}
                  className="w-full border-gray-300 rounded-lg shadow-sm focus:border-red-500 focus:ring-red-500"
                  placeholder="Nhập số tiền..."
                />
              </div>

              <div>
                <label htmlFor="rental-payment-due-date" className="block text-sm font-medium text-gray-700 mb-1">Hạn thanh toán <span className="text-red-500">*</span></label>
                <input id="rental-payment-due-date" 
                  type="date" 
                  required
                  value={formData.dueDate}
                  onChange={e => setFormData((prev) => ({ ...prev, dueDate: e.target.value }))}
                  className="w-full border-gray-300 rounded-lg shadow-sm focus:border-red-500 focus:ring-red-500"
                />
              </div>

              <div>
                <label htmlFor="rental-payment-description" className="block text-sm font-medium text-gray-700 mb-1">Nội dung / Ghi chú</label>
                <textarea id="rental-payment-description" 
                  rows={3}
                  value={formData.description}
                  onChange={e => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                  className="w-full border-gray-300 rounded-lg shadow-sm focus:border-red-500 focus:ring-red-500"
                  placeholder="Tiền nhà tháng 10/2025 + Điện nước..."
                />
              </div>

              <div className="pt-4 flex gap-3">
                <button 
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition font-medium"
                >
                  Hủy
                </button>
                <button 
                  type="submit"
                  disabled={formLoading}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700 transition font-medium flex items-center justify-center disabled:opacity-70"
                >
                  {formLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Tạo hóa đơn'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default RentalManagementPage;
