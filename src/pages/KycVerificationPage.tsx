import React, { useState, useRef, useCallback } from 'react';
import { parseCccdText, validateCccdNumber, type CccdParsedData } from '../utils/cccdParser';
import { kycAPI } from '../api/kyc';
import { useAuthStore } from '../store/authStore';
import {
  Upload, Camera, Loader2, ShieldCheck, AlertTriangle,
  CheckCircle2, XCircle, User, CreditCard, MapPin,
  Calendar, Flag, ScanLine, RotateCcw, Eye, EyeOff, ArrowLeft, Sparkles,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import toast from '../utils/toast';
import { useTranslation } from 'react-i18next';

type Step = 'upload' | 'scanning' | 'review' | 'done';

const KycVerificationPage: React.FC = () => {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const { t } = useTranslation();

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
      toast.error(t('kyc.errImageFormat', { defaultValue: 'Vui lòng chọn file ảnh (JPG, PNG)' }));
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast.error(t('kyc.errImageSize', { defaultValue: 'Ảnh quá lớn (tối đa 10MB)' }));
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
        toast.warning(t('kyc.errOcrFail', { defaultValue: 'Không nhận diện được thông tin CCCD. Vui lòng thử lại với ảnh rõ hơn.' }));
      }
    } catch (error: any) {
      toast.error(t('kyc.errOcrProcess'));
      toast.error(t('kyc.errScan') + (error.message || 'Không xác định'));
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
      toast.success(t('kyc.success'));
    } catch (error: any) {
      toast.error(error?.response?.data?.error || t('kyc.errSubmit'));
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
      setParsedData((prev) => (prev ? { ...prev, [field]: value } : prev));
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
            <h1 className="text-2xl font-semibold text-slate-900 mb-2">{t('kyc.verifiedTitle')}</h1>
            <p className="text-slate-500 text-sm mb-6">
              {t('kyc.verifiedDesc')}
            </p>

            {existingKyc && (
              <div className="bg-emerald-50 rounded-2xl p-5 text-left text-sm space-y-2 mb-6">
                <InfoRow icon={<CreditCard className="w-4 h-4" />} label={t('kyc.cccdNumber')} value={existingKyc.cccdNumber ? `***${existingKyc.cccdNumber.slice(-4)}` : '-'} />
                <InfoRow icon={<User className="w-4 h-4" />} label={t('kyc.fullName')} value={existingKyc.fullName || '-'} />
                <InfoRow icon={<Calendar className="w-4 h-4" />} label={t('common.status', { defaultValue: 'Trạng thái' })} value={
                  <span className="inline-flex items-center gap-1 text-emerald-700 font-semibold">
                    <CheckCircle2 className="w-3.5 h-3.5" /> {t('kyc.statusVerified')}
                  </span>
                } />
              </div>
            )}

            <div className="flex gap-3">
              <button onClick={() => navigate('/profile')} className="flex-1 px-4 py-2.5 rounded-xl bg-slate-100 text-slate-700 text-sm font-medium hover:bg-slate-200 transition-colors">
                {t('kyc.backToProfile')}
              </button>
              <button onClick={resetFlow} className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-sm font-medium hover:bg-slate-50 transition-colors">
                {t('kyc.scanAgain')}
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
          <ArrowLeft className="w-4 h-4 mr-1" /> {t('common.back', { defaultValue: 'Quay lại' })}
        </button>

        <div className="flex items-center gap-3 mb-8">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-md">
            <ScanLine className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-semibold text-slate-900">{t('kyc.title')}</h1>
            <p className="text-slate-500 text-xs">{t('kyc.subtitle')}</p>
          </div>
        </div>

        <div className="flex items-center gap-2 mb-8">
          {[{label: t('kyc.stepUpload')}, {label: t('kyc.stepScanning')}, {label: t('kyc.stepReview')}].map((stepItem, i) => {
            const label = stepItem.label;
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
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  fileInputRef.current?.click();
                }
              }}
              role="button"
              tabIndex={0}
            >
              {imagePreview ? (
                <div className="space-y-4">
                  <img src={imagePreview} alt="CCCD Preview" className="max-h-64 mx-auto rounded-xl shadow-md object-contain" />
                  <p className="text-sm text-slate-600">{t('kyc.imageSelected')}</p>
                </div>
              ) : (
                <>
                  <Upload className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                  <p className="text-slate-700 font-medium mb-1">{t('kyc.dragDrop')}</p>
                  <p className="text-xs text-slate-400">{t('kyc.supportFormat')}</p>
                </>
              )}
              <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileSelect} />
            </div>

            {imagePreview && (
              <div className="flex gap-3">
                <button onClick={resetFlow} className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-sm font-medium hover:bg-slate-50 transition-colors">
                  <RotateCcw className="w-4 h-4 inline mr-1" /> {t('kyc.reselect')}
                </button>
                <button
                  onClick={startOcr}
                  className="flex-1 px-4 py-3 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 text-white text-sm font-semibold shadow-lg shadow-blue-500/25 hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0 transition-all"
                >
                  <ScanLine className="w-4 h-4 inline mr-1" /> {t('kyc.startScan')}
                </button>
              </div>
            )}

            <div className="bg-amber-50 rounded-xl border border-amber-200 p-4 flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
              <div className="text-xs text-amber-800 leading-relaxed">
                <p className="font-semibold mb-1">{t('kyc.importantNote')}</p>
                <ul className="space-y-0.5 list-disc pl-4">
                  <li>{t('kyc.note1')}</li>
                  <li>{t('kyc.note2')}</li>
                  <li>{t('kyc.note3')}</li>
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
            <h2 className="text-lg font-semibold text-slate-900 mb-2">{t('kyc.scanningTitle')}</h2>
            <p className="text-sm text-slate-500 mb-6">{t('kyc.scanningDesc')}</p>

            <div className="w-full bg-slate-100 rounded-full h-3 mb-2 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full transition-all duration-300"
                style={{ width: `${ocrProgress}%` }}
              />
            </div>
            <p className="text-xs text-slate-400">{ocrProgress}% {t('kyc.complete')}</p>
          </div>
        )}

        {/* ─── STEP: REVIEW ─── */}
        {step === 'review' && parsedData && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-blue-500" />
                  {t('kyc.ocrResult')}
                </h2>
                <button onClick={() => setShowRawText(!showRawText)} className="text-xs text-slate-500 hover:text-slate-700 flex items-center gap-1">
                  {showRawText ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  {showRawText ? t('kyc.hideRaw') : t('kyc.showRaw')}
                </button>
              </div>

              {showRawText && (
                <pre className="bg-slate-50 rounded-xl p-3 text-[11px] text-slate-600 font-mono overflow-x-auto mb-4 max-h-40 overflow-y-auto whitespace-pre-wrap">{rawOcrText}</pre>
              )}

              <div className="space-y-3">
                <EditableField icon={<CreditCard className="w-4 h-4" />} label={t('kyc.cccdNumber')} value={parsedData.cccdNumber} onChange={(v) => updateField('cccdNumber', v)} important />
                <EditableField icon={<User className="w-4 h-4" />} label={t('kyc.fullName')} value={parsedData.fullName} onChange={(v) => updateField('fullName', v)} important />
                <EditableField icon={<Calendar className="w-4 h-4" />} label={t('kyc.dob')} value={parsedData.dateOfBirth} onChange={(v) => updateField('dateOfBirth', v)} placeholder="yyyy-MM-dd" />
                <EditableField icon={<User className="w-4 h-4" />} label={t('kyc.gender')} value={parsedData.gender} onChange={(v) => updateField('gender', v)} />
                <EditableField icon={<Flag className="w-4 h-4" />} label={t('kyc.nationality')} value={parsedData.nationality} onChange={(v) => updateField('nationality', v)} />
                <EditableField icon={<MapPin className="w-4 h-4" />} label={t('kyc.origin')} value={parsedData.placeOfOrigin} onChange={(v) => updateField('placeOfOrigin', v)} />
                <EditableField icon={<MapPin className="w-4 h-4" />} label={t('kyc.residence')} value={parsedData.placeOfResidence} onChange={(v) => updateField('placeOfResidence', v)} />
                <EditableField icon={<Calendar className="w-4 h-4" />} label={t('kyc.expiry')} value={parsedData.expiryDate} onChange={(v) => updateField('expiryDate', v)} placeholder="yyyy-MM-dd" />
              </div>

              {/* CCCD Validation Info */}
              {parsedData.cccdNumber && parsedData.cccdNumber.length === 12 && (() => {
                const v = validateCccdNumber(parsedData.cccdNumber);
                if (!v.valid) return (
                  <div className="mt-4 bg-red-50 rounded-xl border border-red-200 p-3 flex items-start gap-2">
                    <XCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                    <p className="text-xs text-red-700">{t('kyc.invalidCccd')}</p>
                  </div>
                );
                return (
                  <div className="mt-4 bg-blue-50 rounded-xl border border-blue-200 p-3">
                    <p className="text-xs font-semibold text-blue-800 mb-2 flex items-center gap-1"><ShieldCheck className="w-3.5 h-3.5" /> {t('kyc.validCccd')}</p>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs text-blue-700">
                      <div><span className="text-blue-400">{t('kyc.issuePlace')}</span> <strong>{v.province}</strong></div>
                      <div><span className="text-blue-400">{t('kyc.gender')}</span> <strong>{v.gender}</strong></div>
                      <div><span className="text-blue-400">{t('kyc.birthYear')}</span> <strong>{v.birthYear}</strong></div>
                    </div>
                  </div>
                );
              })()}
            </div>

            {(!parsedData.cccdNumber || !parsedData.fullName) && (
              <div className="bg-amber-50 rounded-xl border border-amber-200 p-4 flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0" />
                <p className="text-xs text-amber-800">
                  {t('kyc.missingInfo')}
                </p>
              </div>
            )}

            <div className="flex gap-3">
              <button onClick={resetFlow} className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-sm font-medium hover:bg-slate-50 transition-colors">
                <RotateCcw className="w-4 h-4 inline mr-1" /> {t('kyc.scanAgain')}
              </button>
              <button
                onClick={handleSubmit}
                disabled={submitting || !parsedData.cccdNumber || !parsedData.fullName}
                className="flex-1 px-4 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 text-white text-sm font-semibold shadow-lg shadow-emerald-500/25 hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? (
                  <><Loader2 className="w-4 h-4 inline animate-spin mr-1" /> {t('kyc.sending')}</>
                ) : (
                  <><ShieldCheck className="w-4 h-4 inline mr-1" /> {t('kyc.confirmSave')}</>
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
