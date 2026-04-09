import React, { useState, useRef, useCallback } from 'react';
import { parseCccdText, validateCccdNumber, type CccdParsedData } from '../utils/cccdParser';
import { kycAPI } from '../api/kyc';
import { useAuthStore } from '../store/authStore';
import { toast } from 'react-toastify';
import {
  Upload, Camera, Loader2, ShieldCheck, AlertTriangle,
  CheckCircle2, XCircle, User, CreditCard, MapPin,
  Calendar, Flag, ScanLine, RotateCcw, Eye, EyeOff,
  ArrowLeft, Sparkles
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import toast from '../utils/toast';

type Step = 'upload' | 'scanning' | 'review' | 'done';

const KycVerificationPage: React.FC = () => {
  const { user } = useAuthStore();
  const navigate = useNavigate();

  const [step, setStep] = useState<Step>('upload');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [ocrProgress, setOcrProgress] = useState(0);
  const [rawOcrText, setRawOcrText] = useState('');
  const [parsedData, setParsedData] = useState<CccdParsedData | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [showRawText, setShowRawText] = useState(false);
  const [existingKyc, setExistingKyc] = useState<any>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Check KYC status on mount
  React.useEffect(() => {
    if (user?.id) {
      kycAPI.getStatus(user.id.toString()).then(data => {
        if ('id' in data) {
          setExistingKyc(data);
          if (data.status === 'VERIFIED') setStep('done');
        }
      }).catch(() => {});
    }
  }, [user?.id]);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Vui lòng chọn file ảnh (JPG, PNG)');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast.error('Ảnh quá lớn (tối đa 10MB)');
      return;
    }

    setImageFile(file);
    const reader = new FileReader();
    reader.onload = (ev) => setImagePreview(ev.target?.result as string);
    reader.readAsDataURL(file);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onload = (ev) => setImagePreview(ev.target?.result as string);
      reader.readAsDataURL(file);
    }
  }, []);

  const startOcr = async () => {
    if (!imageFile) return;

    setStep('scanning');
    setOcrProgress(0);

    try {
      // Tesseract.js v7: dùng createWorker API
      const { createWorker } = await import('tesseract.js');
      const worker = await createWorker(['vie', 'eng'], 1, {
        logger: (m: any) => {
          if (m.status === 'recognizing text') {
            setOcrProgress(Math.round(m.progress * 100));
          }
        },
      });

      const result = await worker.recognize(imageFile);
      const rawText = result.data.text;
      setRawOcrText(rawText);

      await worker.terminate();

      const parsed = parseCccdText(rawText);
      setParsedData(parsed);
      setStep('review');

      if (!parsed.cccdNumber && !parsed.fullName) {
        toast.warning('Không nhận diện được thông tin CCCD. Vui lòng thử lại với ảnh rõ hơn.');
      }
    } catch (error: any) {
      toast.error('L?i x? l� ?nh CCCD');
      toast.error('Lỗi quét ảnh: ' + (error.message || 'Không xác định'));
      setStep('upload');
    }
  };

  const handleSubmit = async () => {
    if (!parsedData || !user?.id) return;

    setSubmitting(true);
    try {
      const result = await kycAPI.submit({
        userId: user.id.toString(),
        cccdNumber: parsedData.cccdNumber,
        fullName: parsedData.fullName,
        dateOfBirth: parsedData.dateOfBirth || undefined,
        gender: parsedData.gender || undefined,
        nationality: parsedData.nationality || undefined,
        placeOfOrigin: parsedData.placeOfOrigin || undefined,
        placeOfResidence: parsedData.placeOfResidence || undefined,
        expiryDate: parsedData.expiryDate || undefined,
        rawOcrText: rawOcrText,
      });

      setExistingKyc(result);
      setStep('done');
      toast.success('Xác minh CCCD thành công!');
    } catch (error: any) {
      toast.error(error?.response?.data?.error || 'Lỗi khi gửi thông tin xác minh');
    } finally {
      setSubmitting(false);
    }
  };

  const resetFlow = () => {
    setStep('upload');
    setImageFile(null);
    setImagePreview('');
    setOcrProgress(0);
    setRawOcrText('');
    setParsedData(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const updateField = (field: keyof CccdParsedData, value: string) => {
    if (parsedData) {
      setParsedData({ ...parsedData, [field]: value });
    }
  };

  // ─── STEP: DONE ───
  if (step === 'done') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-blue-50 pt-20">
        <div className="max-w-lg mx-auto px-4 py-16">
          <div className="bg-white rounded-3xl shadow-xl border border-emerald-100 p-10 text-center">
            <div className="w-20 h-20 mx-auto rounded-2xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-500/30 mb-6">
              <ShieldCheck className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-slate-900 mb-2">Đã xác minh danh tính</h1>
            <p className="text-slate-500 text-sm mb-6">
              Tài khoản của bạn đã được xác minh CCCD thành công. Badge "Đã xác minh" sẽ hiển thị trên trang cá nhân và hợp đồng.
            </p>

            {existingKyc && (
              <div className="bg-emerald-50 rounded-2xl p-5 text-left text-sm space-y-2 mb-6">
                <InfoRow icon={<CreditCard className="w-4 h-4" />} label="Số CCCD" value={existingKyc.cccdNumber ? `***${existingKyc.cccdNumber.slice(-4)}` : '—'} />
                <InfoRow icon={<User className="w-4 h-4" />} label="Họ tên" value={existingKyc.fullName || '—'} />
                <InfoRow icon={<Calendar className="w-4 h-4" />} label="Trạng thái" value={
                  <span className="inline-flex items-center gap-1 text-emerald-700 font-semibold">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Đã xác minh
                  </span>
                } />
              </div>
            )}

            <div className="flex gap-3">
              <button onClick={() => navigate('/profile')} className="flex-1 px-4 py-2.5 rounded-xl bg-slate-100 text-slate-700 text-sm font-medium hover:bg-slate-200 transition-colors">
                Về trang cá nhân
              </button>
              <button onClick={resetFlow} className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-sm font-medium hover:bg-slate-50 transition-colors">
                Quét lại
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/40 pt-20">
      <div className="max-w-2xl mx-auto px-4 py-8">

        {/* Header */}
        <button onClick={() => navigate(-1)} className="inline-flex items-center text-sm text-slate-500 hover:text-slate-700 mb-4">
          <ArrowLeft className="w-4 h-4 mr-1" /> Quay lại
        </button>

        <div className="flex items-center gap-3 mb-8">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-md">
            <ScanLine className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900">Xác minh CCCD</h1>
            <p className="text-slate-500 text-xs">Quét ảnh mặt trước CCCD để xác minh danh tính</p>
          </div>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center gap-2 mb-8">
          {['Upload ảnh', 'Đang quét', 'Xác nhận'].map((label, i) => {
            const stepIdx = ['upload', 'scanning', 'review'].indexOf(step);
            const isActive = i <= stepIdx;
            return (
              <React.Fragment key={label}>
                {i > 0 && <div className={`flex-1 h-0.5 rounded ${isActive ? 'bg-blue-500' : 'bg-slate-200'}`} />}
                <div className={`flex items-center gap-1.5 text-xs font-medium ${isActive ? 'text-blue-600' : 'text-slate-400'}`}>
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${isActive ? 'bg-blue-500 text-white' : 'bg-slate-200 text-slate-500'}`}>
                    {i + 1}
                  </div>
                  <span className="hidden sm:inline">{label}</span>
                </div>
              </React.Fragment>
            );
          })}
        </div>

        {/* ─── STEP: UPLOAD ─── */}
        {step === 'upload' && (
          <div className="space-y-6">
            <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDrop}
              className="bg-white rounded-2xl border-2 border-dashed border-slate-200 hover:border-blue-400 p-8 text-center transition-colors cursor-pointer"
              onClick={() => fileInputRef.current?.click()}
            >
              {imagePreview ? (
                <div className="space-y-4">
                  <img src={imagePreview} alt="CCCD Preview" className="max-h-64 mx-auto rounded-xl shadow-md object-contain" />
                  <p className="text-sm text-slate-600">Ảnh đã chọn. Nhấn "Bắt đầu quét" để tiếp tục.</p>
                </div>
              ) : (
                <>
                  <Upload className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                  <p className="text-slate-700 font-medium mb-1">Kéo thả hoặc nhấn để chọn ảnh CCCD</p>
                  <p className="text-xs text-slate-400">Hỗ trợ JPG, PNG · Tối đa 10MB · Mặt trước CCCD</p>
                </>
              )}
              <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileSelect} />
            </div>

            {imagePreview && (
              <div className="flex gap-3">
                <button onClick={resetFlow} className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-sm font-medium hover:bg-slate-50 transition-colors">
                  <RotateCcw className="w-4 h-4 inline mr-1" /> Chọn lại
                </button>
                <button
                  onClick={startOcr}
                  className="flex-1 px-4 py-3 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 text-white text-sm font-semibold shadow-lg shadow-blue-500/25 hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0 transition-all"
                >
                  <ScanLine className="w-4 h-4 inline mr-1" /> Bắt đầu quét
                </button>
              </div>
            )}

            <div className="bg-amber-50 rounded-xl border border-amber-200 p-4 flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
              <div className="text-xs text-amber-800 leading-relaxed">
                <p className="font-semibold mb-1">Lưu ý quan trọng</p>
                <ul className="space-y-0.5 list-disc pl-4">
                  <li>Ảnh chụp rõ nét, đủ ánh sáng, không bị mờ/cắt góc</li>
                  <li>OCR chạy trực tiếp trên trình duyệt — ảnh <strong>không được gửi lên server</strong></li>
                  <li>Chỉ kết quả text trích xuất được gửi về backend để lưu</li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* ─── STEP: SCANNING ─── */}
        {step === 'scanning' && (
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-10 text-center">
            <div className="relative w-20 h-20 mx-auto mb-6">
              <div className="absolute inset-0 rounded-2xl bg-blue-100 animate-ping opacity-30" />
              <div className="relative w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                <ScanLine className="w-10 h-10 text-white animate-pulse" />
              </div>
            </div>
            <h2 className="text-lg font-bold text-slate-900 mb-2">Đang quét CCCD...</h2>
            <p className="text-sm text-slate-500 mb-6">Tesseract.js đang nhận diện chữ trên ảnh</p>

            <div className="w-full bg-slate-100 rounded-full h-3 mb-2 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full transition-all duration-300"
                style={{ width: `${ocrProgress}%` }}
              />
            </div>
            <p className="text-xs text-slate-400">{ocrProgress}% hoàn tất</p>
          </div>
        )}

        {/* ─── STEP: REVIEW ─── */}
        {step === 'review' && parsedData && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-blue-500" />
                  Kết quả quét OCR
                </h2>
                <button onClick={() => setShowRawText(!showRawText)} className="text-xs text-slate-500 hover:text-slate-700 flex items-center gap-1">
                  {showRawText ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  {showRawText ? 'Ẩn raw text' : 'Xem raw text'}
                </button>
              </div>

              {showRawText && (
                <pre className="bg-slate-50 rounded-xl p-3 text-[11px] text-slate-600 font-mono overflow-x-auto mb-4 max-h-40 overflow-y-auto whitespace-pre-wrap">{rawOcrText}</pre>
              )}

              <div className="space-y-3">
                <EditableField icon={<CreditCard className="w-4 h-4" />} label="Số CCCD" value={parsedData.cccdNumber} onChange={(v) => updateField('cccdNumber', v)} important />
                <EditableField icon={<User className="w-4 h-4" />} label="Họ và tên" value={parsedData.fullName} onChange={(v) => updateField('fullName', v)} important />
                <EditableField icon={<Calendar className="w-4 h-4" />} label="Ngày sinh" value={parsedData.dateOfBirth} onChange={(v) => updateField('dateOfBirth', v)} placeholder="yyyy-MM-dd" />
                <EditableField icon={<User className="w-4 h-4" />} label="Giới tính" value={parsedData.gender} onChange={(v) => updateField('gender', v)} />
                <EditableField icon={<Flag className="w-4 h-4" />} label="Quốc tịch" value={parsedData.nationality} onChange={(v) => updateField('nationality', v)} />
                <EditableField icon={<MapPin className="w-4 h-4" />} label="Quê quán" value={parsedData.placeOfOrigin} onChange={(v) => updateField('placeOfOrigin', v)} />
                <EditableField icon={<MapPin className="w-4 h-4" />} label="Nơi thường trú" value={parsedData.placeOfResidence} onChange={(v) => updateField('placeOfResidence', v)} />
                <EditableField icon={<Calendar className="w-4 h-4" />} label="Có giá trị đến" value={parsedData.expiryDate} onChange={(v) => updateField('expiryDate', v)} placeholder="yyyy-MM-dd" />
              </div>

              {/* CCCD Validation Info */}
              {parsedData.cccdNumber && parsedData.cccdNumber.length === 12 && (() => {
                const v = validateCccdNumber(parsedData.cccdNumber);
                if (!v.valid) return (
                  <div className="mt-4 bg-red-50 rounded-xl border border-red-200 p-3 flex items-start gap-2">
                    <XCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                    <p className="text-xs text-red-700">Số CCCD không hợp lệ theo cấu trúc CCCD Việt Nam (mã tỉnh/giới tính). Vui lòng kiểm tra lại.</p>
                  </div>
                );
                return (
                  <div className="mt-4 bg-blue-50 rounded-xl border border-blue-200 p-3">
                    <p className="text-xs font-semibold text-blue-800 mb-2 flex items-center gap-1"><ShieldCheck className="w-3.5 h-3.5" /> Xác thực CCCD hợp lệ</p>
                    <div className="grid grid-cols-3 gap-2 text-xs text-blue-700">
                      <div><span className="text-blue-400">Nơi cấp:</span> <strong>{v.province}</strong></div>
                      <div><span className="text-blue-400">Giới tính:</span> <strong>{v.gender}</strong></div>
                      <div><span className="text-blue-400">Năm sinh:</span> <strong>{v.birthYear}</strong></div>
                    </div>
                  </div>
                );
              })()}
            </div>

            {(!parsedData.cccdNumber || !parsedData.fullName) && (
              <div className="bg-amber-50 rounded-xl border border-amber-200 p-4 flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0" />
                <p className="text-xs text-amber-800">
                  <strong>Thiếu thông tin bắt buộc.</strong> Vui lòng điền số CCCD và họ tên thủ công, hoặc thử quét lại ảnh rõ hơn.
                </p>
              </div>
            )}

            <div className="flex gap-3">
              <button onClick={resetFlow} className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-sm font-medium hover:bg-slate-50 transition-colors">
                <RotateCcw className="w-4 h-4 inline mr-1" /> Quét lại
              </button>
              <button
                onClick={handleSubmit}
                disabled={submitting || !parsedData.cccdNumber || !parsedData.fullName}
                className="flex-1 px-4 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 text-white text-sm font-semibold shadow-lg shadow-emerald-500/25 hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? (
                  <><Loader2 className="w-4 h-4 inline animate-spin mr-1" /> Đang gửi...</>
                ) : (
                  <><ShieldCheck className="w-4 h-4 inline mr-1" /> Xác nhận & Lưu</>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// ─── Sub-components ───

interface EditableFieldProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  important?: boolean;
}

const EditableField: React.FC<EditableFieldProps> = ({ icon, label, value, onChange, placeholder, important }) => {
  const isEmpty = !value || value.trim() === '';
  return (
    <div className="flex items-center gap-3">
      <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${isEmpty && important ? 'bg-red-50 text-red-400' : 'bg-slate-50 text-slate-400'}`}>
        {icon}
      </div>
      <div className="flex-1">
        <label className="text-[10px] uppercase tracking-wider text-slate-400 block mb-0.5">{label} {important && <span className="text-red-400">*</span>}</label>
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder || `Nhập ${label.toLowerCase()}`}
          className={`w-full text-sm bg-transparent border-b ${isEmpty && important ? 'border-red-200' : 'border-slate-100'} focus:border-blue-400 outline-none py-1 text-slate-800 placeholder:text-slate-300`}
        />
      </div>
      {!isEmpty && <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />}
      {isEmpty && important && <XCircle className="w-4 h-4 text-red-300 shrink-0" />}
    </div>
  );
};

interface InfoRowProps {
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
}

const InfoRow: React.FC<InfoRowProps> = ({ icon, label, value }) => (
  <div className="flex items-center gap-3">
    <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">{icon}</div>
    <span className="text-slate-500 text-xs">{label}</span>
    <span className="ml-auto font-medium text-slate-800 text-sm">{value}</span>
  </div>
);

export default KycVerificationPage;
