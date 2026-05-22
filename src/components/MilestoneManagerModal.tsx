import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2, Edit2, Check, AlertCircle } from 'lucide-react';
import { paymentMilestoneApi, type PaymentMilestone } from '../api/paymentMilestone';
import toast from '../utils/toast';

interface MilestoneManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  transactionId: string;
  totalAmount: number;
  onSuccess: () => void;
}

const formatDate = (dateStr: string) => {
  if (!dateStr) return '';
  try {
    return new Date(dateStr).toLocaleDateString('vi-VN');
  } catch (e) {
    return dateStr;
  }
};

const MilestoneManagerModal: React.FC<MilestoneManagerModalProps> = ({
  isOpen,
  onClose,
  transactionId,
  totalAmount,
  onSuccess
}) => {
  const [milestones, setMilestones] = useState<PaymentMilestone[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  
  // Form state
  const [editingId, setEditingId] = useState<number | null>(null);
  const [title, setTitle] = useState('');
  const [percentage, setPercentage] = useState<number>(0);
  const [dueDate, setDueDate] = useState('');

  useEffect(() => {
    if (isOpen) {
      loadMilestones();
    } else {
      resetForm();
    }
  }, [isOpen, transactionId]);

  const loadMilestones = async () => {
    setLoading(true);
    try {
      const res = await paymentMilestoneApi.getMilestonesByTransaction(transactionId);
      setMilestones(res.data);
    } catch (error) {
      toast.error('Không thể tải tiến độ thanh toán');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setEditingId(null);
    setTitle('');
    setPercentage(0);
    setDueDate('');
  };

  const handlePercentageChange = (val: number) => {
    setPercentage(val);
  };

  const handleSave = async () => {
    if (!title || percentage <= 0 || !dueDate) {
      toast.error('Vui lòng điền đầy đủ thông tin (Tên đợt, % thanh toán, Hạn chót)');
      return;
    }

    const currentTotalPercent = milestones
      .filter(m => m.id !== editingId)
      .reduce((sum, m) => sum + m.percentage, 0);

    if (currentTotalPercent + percentage > 100) {
      toast.error(`Tổng tỷ lệ không được vượt quá 100%. (Đã dùng: ${currentTotalPercent}%)`);
      return;
    }

    setSaving(true);
    try {
      const amount = (totalAmount * percentage) / 100;
      const data = {
        transactionId,
        title,
        amount,
        percentage,
        dueDate
      };

      if (editingId) {
        await paymentMilestoneApi.updateMilestone(editingId, data);
        toast.success('Cập nhật đợt thanh toán thành công');
      } else {
        await paymentMilestoneApi.createMilestone(data);
        toast.success('Thêm đợt thanh toán thành công');
      }
      
      resetForm();
      await loadMilestones();
      onSuccess();
    } catch (error) {
      toast.error('Lỗi khi lưu đợt thanh toán');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa đợt thanh toán này?')) return;
    try {
      await paymentMilestoneApi.deleteMilestone(id);
      toast.success('Xóa đợt thanh toán thành công');
      loadMilestones();
      onSuccess();
    } catch (error) {
      toast.error('Lỗi khi xóa đợt thanh toán');
    }
  };

  const handleEdit = (m: PaymentMilestone) => {
    setEditingId(m.id);
    setTitle(m.title);
    setPercentage(m.percentage);
    
    // Convert YYYY-MM-DD or ISO string to YYYY-MM-DD for input type="date"
    const dateStr = m.dueDate.split('T')[0];
    setDueDate(dateStr);
  };

  const formatPrice = (price: number) => {
    return price.toLocaleString('vi-VN');
  };

  if (!isOpen) return null;

  const totalAllocated = milestones.reduce((sum, m) => sum + m.percentage, 0);

  return (
    <div className="fixed inset-0 bg-gray-950 bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="flex items-center justify-between p-6 border-b border-gray-100 bg-gray-50/50 sticky top-0 z-10">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Quản lý Tiến độ Thanh toán</h2>
            <p className="text-sm text-gray-500 mt-1">Tổng tiền: <span className="font-semibold text-red-600">{formatPrice(totalAmount)} VND</span></p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full transition-colors text-gray-500">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Progress Bar */}
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
            <div className="flex justify-between text-sm mb-2">
              <span className="font-medium text-gray-700">Đã phân bổ</span>
              <span className={`font-bold ${totalAllocated === 100 ? 'text-green-600' : totalAllocated > 100 ? 'text-red-600' : 'text-gray-900'}`}>
                {totalAllocated.toFixed(1)}%
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div 
                className={`h-2.5 rounded-full ${totalAllocated === 100 ? 'bg-green-500' : totalAllocated > 100 ? 'bg-red-500' : 'bg-red-500'}`}
                style={{ width: `${Math.min(totalAllocated, 100)}%` }}
              ></div>
            </div>
            {totalAllocated !== 100 && (
              <p className="text-xs text-orange-500 mt-2 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" />
                Tổng tỷ lệ thanh toán nên là 100% để đảm bảo thu đủ tiền.
              </p>
            )}
          </div>

          {/* Form */}
          <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm">
            <h3 className="font-semibold text-gray-900 mb-4">{editingId ? 'Sửa đợt thanh toán' : 'Thêm đợt mới'}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label htmlFor="milestone-title" className="block text-sm font-medium text-gray-700 mb-1">Tên đợt thanh toán</label>
                <input 
                  id="milestone-title"

                  type="text" 
                  value={title} 
                  onChange={e => setTitle(e.target.value)} 
                  className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                  placeholder="VD: Đặt cọc, Đợt 1, Bàn giao nhà..."
                />
              </div>
              <div>
                <label htmlFor="milestone-percentage" className="block text-sm font-medium text-gray-700 mb-1">Tỷ lệ (%)</label>
                <div className="relative">
                  <input 
                    id="milestone-percentage"

                    type="number" 
                    min="0" max="100" step="0.1"
                    value={percentage || ''} 
                    onChange={e => handlePercentageChange(parseFloat(e.target.value) || 0)} 
                    className="w-full p-2.5 pr-8 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                  />
                  <span className="absolute right-3 top-2.5 text-gray-500">%</span>
                </div>
                {percentage > 0 && (
                  <p className="text-xs text-gray-500 mt-1">Tương đương: {formatPrice((totalAmount * percentage) / 100)} đ</p>
                )}
              </div>
              <div>
                <label htmlFor="milestone-due-date" className="block text-sm font-medium text-gray-700 mb-1">Hạn thanh toán</label>
                <input 
                  id="milestone-due-date"

                  type="date" 
                  value={dueDate} 
                  onChange={e => setDueDate(e.target.value)} 
                  className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                />
              </div>
            </div>
            <div className="mt-4 flex gap-2 justify-end">
              {editingId && (
                <button 
                  onClick={resetForm}
                  className="px-4 py-2 text-sm text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Hủy sửa
                </button>
              )}
              <button 
                onClick={handleSave}
                disabled={saving}
                className="px-4 py-2 text-sm text-white bg-red-600 rounded-lg hover:bg-red-700 flex items-center gap-2 disabled:opacity-50"
              >
                {editingId ? <Check className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                {saving ? 'Đang lưu...' : (editingId ? 'Lưu thay đổi' : 'Thêm đợt')}
              </button>
            </div>
          </div>

          {/* List */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-3">Danh sách đợt thanh toán</h3>
            {loading ? (
              <div className="py-8 text-center text-gray-500">Đang tải…</div>
            ) : milestones.length === 0 ? (
              <div className="py-8 text-center bg-gray-50 rounded-lg border border-dashed border-gray-300 text-gray-500">
                Chưa có đợt thanh toán nào được thiết lập.
              </div>
            ) : (
              <div className="space-y-3">
                {milestones.map((m, idx) => (
                  <div key={m.id} className={`flex items-center justify-between p-4 bg-white border rounded-lg hover:shadow-sm transition-shadow ${editingId === m.id ? 'border-red-400 ring-1 ring-red-400' : 'border-gray-200'}`}>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="bg-red-100 text-red-700 text-xs font-bold px-2 py-0.5 rounded">Đợt {idx + 1}</span>
                        <h4 className="font-semibold text-gray-900">{m.title}</h4>
                      </div>
                      <div className="text-sm text-gray-500 flex items-center gap-3">
                        <span>{m.percentage}% ({formatPrice(m.amount)} đ)</span>
                        <span className="w-1 h-1 rounded-full bg-gray-300"></span>
                        <span suppressHydrationWarning>Hạn: {formatDate(m.dueDate)}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {m.status === 'PENDING' || m.status === 'OVERDUE' ? (
                        <>
                          <button 
                            onClick={() => handleEdit(m)}
                            className="p-2 text-[#6b7280] hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Sửa"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => handleDelete(m.id)}
                            className="p-2 text-[#6b7280] hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Xóa"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </>
                      ) : (
                        <span className="text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded border border-green-100">
                          Đã thanh toán
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MilestoneManagerModal;
