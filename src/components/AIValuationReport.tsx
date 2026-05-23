import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  Cpu, 
  Sparkles, 
  TrendingUp, 
  TrendingDown, 
  Minus,
  Award, 
  ThumbsUp, 
  ThumbsDown, 
  BookOpen, 
  ShieldCheck, 
  Loader2, 
  AlertCircle,
  HelpCircle,
  TrendingUp as TrendIcon,
  ChevronRight,
  HelpCircle as QuestionIcon
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { aiValuationAPI } from '../api';
import type { ValuationReport } from '../api/types';
import { useAuthStore } from '../store/authStore';
import { showWarning, showError } from '../utils/toast';

interface AIValuationReportProps {
  propertyId: string;
  currentAskingPrice: number;
}

export const AIValuationReport: React.FC<AIValuationReportProps> = ({ propertyId, currentAskingPrice }) => {
  const { t } = useTranslation();
  const { isAuthenticated } = useAuthStore();
  
  const [report, setReport] = useState<ValuationReport | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);

  const steps = [
    t('aiValuation.step1', 'Thu thập thông số bất động sản...'),
    t('aiValuation.step2', 'Phân tích vị trí & hạ tầng khu vực...'),
    t('aiValuation.step3', 'Đối chiếu dữ liệu giá các căn hộ tương tự...'),
    t('aiValuation.step4', 'Đánh giá xu hướng thị trường chung...'),
    t('aiValuation.step5', 'Hoàn thiện báo cáo thẩm định AI...')
  ];

  const handleRequestReport = async () => {
    if (!isAuthenticated) {
      showWarning(t('savedSearch.loginRequired', 'Vui lòng đăng nhập để sử dụng tính năng này'));
      return;
    }

    setLoading(true);
    setLoadingStep(0);

    // Simulate step progress for highly premium experience
    const interval = setInterval(() => {
      setLoadingStep(prev => {
        if (prev < steps.length - 1) {
          return prev + 1;
        }
        clearInterval(interval);
        return prev;
      });
    }, 1000);

    try {
      const data = await aiValuationAPI.getValuationReport(propertyId);
      clearInterval(interval);
      setLoadingStep(steps.length - 1);
      setTimeout(() => {
        setReport(data);
        setLoading(false);
      }, 500);
    } catch (error) {
      clearInterval(interval);
      setLoading(false);
      showError(t('aiValuation.error', 'Không thể tạo báo cáo thẩm định bằng AI lúc này'));
    }
  };

  const formatPrice = (price: number) => {
    if (price >= 1000000000) {
      return `${(price / 1000000000).toFixed(2)} Tỷ`;
    }
    if (price >= 1000000) {
      return `${(price / 1000000).toFixed(0)} Triệu`;
    }
    return price?.toLocaleString('vi-VN') + ' VND';
  };

  const getSentimentDetails = (sentiment: string) => {
    switch (sentiment) {
      case 'BULLISH':
        return {
          label: 'Tích cực (Tăng trưởng)',
          color: 'bg-green-500/10 text-green-500 border-green-500/20',
          icon: <TrendingUp className="h-4 w-4" />
        };
      case 'BEARISH':
        return {
          label: 'Rủi ro (Xu hướng giảm)',
          color: 'bg-red-500/10 text-red-500 border-red-500/20',
          icon: <TrendingDown className="h-4 w-4" />
        };
      default:
        return {
          label: 'Đi ngang (Ổn định)',
          color: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
          icon: <Minus className="h-4 w-4" />
        };
    }
  };

  const getGradeColor = (grade: string) => {
    switch (grade) {
      case 'A':
        return 'from-yellow-400 to-amber-500 text-white shadow-yellow-500/25';
      case 'B':
        return 'from-blue-500 to-indigo-600 text-white shadow-blue-500/25';
      case 'C':
        return 'from-orange-400 to-red-500 text-white shadow-orange-500/25';
      default:
        return 'from-gray-500 to-gray-700 text-white shadow-gray-500/25';
    }
  };

  return (
    <div className="bg-white text-gray-900 rounded-3xl p-6 md:p-8 shadow-lg relative overflow-hidden border border-gray-100">
      {/* Background decorations */}
      <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 bg-red-50 rounded-full blur-3xl pointer-events-none opacity-70"></div>
      <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 bg-amber-50 rounded-full blur-3xl pointer-events-none opacity-70"></div>

      <div className="relative z-10">
        {/* Header Title */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-gray-100 mb-6">
          <div className="flex items-center gap-3.5">
            <div className="p-3 bg-gradient-to-tr from-red-600 to-amber-500 rounded-2xl shadow-lg relative group">
              <Cpu className="h-6 w-6 text-white animate-pulse" />
              <div className="absolute inset-0 bg-white/20 rounded-2xl scale-0 group-hover:scale-110 transition-transform duration-300"></div>
            </div>
            <div>
              <h3 className="text-xl font-extrabold flex items-center gap-2 tracking-tight text-gray-900">
                AI Thẩm Định Giá BĐS
                <span className="inline-flex items-center gap-0.5 px-2 py-0.5 bg-gradient-to-r from-amber-400 to-yellow-500 text-black text-[9px] font-black uppercase rounded-md shadow-sm">
                  <Sparkles className="h-2.5 w-2.5 fill-current" />
                  Premium
                </span>
              </h3>
              <p className="text-xs text-gray-500 font-semibold mt-0.5">Báo cáo phân tích giá trị, tiềm năng & rủi ro bằng trí tuệ nhân tạo</p>
            </div>
          </div>
          
          {!report && !loading && (
            <button
              onClick={handleRequestReport}
              className="px-6 py-3 bg-gradient-to-r from-red-600 to-amber-500 hover:from-red-700 hover:to-amber-600 text-white rounded-xl text-xs font-bold shadow-lg shadow-red-500/20 flex items-center gap-2 transition-all duration-300 hover:scale-105 active:scale-95"
            >
              <Cpu className="h-4 w-4" />
              Yêu cầu thẩm định ngay
            </button>
          )}
        </div>

        {/* Loading Screen */}
        <AnimatePresence>
          {loading && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center py-12 text-center"
            >
              <div className="relative mb-6">
                <Loader2 className="h-12 w-12 text-red-500 animate-spin" />
                <Sparkles className="h-5 w-5 text-amber-500 absolute inset-0 m-auto animate-bounce" />
              </div>
              <h4 className="font-bold text-base text-gray-900 mb-1.5">AI đang tính toán giá trị...</h4>
              <p className="text-xs text-gray-500 max-w-sm mb-4">
                Trí tuệ nhân tạo đang phân tích sâu dữ liệu lịch sử giá, hạ tầng khu vực và so sánh thông số căn hộ.
              </p>
              
              {/* Progress Indicator */}
              <div className="w-full max-w-xs bg-gray-100 rounded-full h-2 overflow-hidden mb-2">
                <motion.div
                  className="bg-gradient-to-r from-red-500 to-amber-500 h-full rounded-full"
                  initial={{ width: '0%' }}
                  animate={{ width: `${((loadingStep + 1) / steps.length) * 100}%` }}
                  transition={{ duration: 0.5 }}
                />
              </div>
              <span className="text-[10px] text-amber-600 font-bold uppercase tracking-wider">
                {steps[loadingStep]}
              </span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Report Content */}
        {report && !loading && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* Top Grid: Price range & Indicators */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Box 1: Estimated price range */}
              <div className="md:col-span-2 bg-gradient-to-br from-gray-50 to-white border border-gray-200 rounded-2xl p-5 relative flex flex-col justify-between">
                <div>
                  <h4 className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-2">Khoảng giá ước tính (VND)</h4>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-black text-amber-600">{formatPrice(report.estimatedMinPrice)}</span>
                    <span className="text-lg text-gray-400 font-medium">–</span>
                    <span className="text-3xl font-black text-red-600">{formatPrice(report.estimatedMaxPrice)}</span>
                  </div>
                </div>

                {/* Asking Price Comparison Meter */}
                <div className="mt-6 border-t border-gray-100 pt-4 pb-8">
                  <div className="flex justify-between text-[10px] text-gray-500 font-bold mb-2">
                    <span>Thấp nhất: {formatPrice(report.estimatedMinPrice)}</span>
                    <span>Cao nhất: {formatPrice(report.estimatedMaxPrice)}</span>
                  </div>
                  
                  {/* Visual slider */}
                  <div className="w-full bg-gray-100 h-2.5 rounded-full relative">
                    <div className="absolute bg-gradient-to-r from-amber-400 to-red-500 h-full rounded-full w-full"></div>
                    
                    {/* Current Asking Price Pin */}
                    {(() => {
                      const range = report.estimatedMaxPrice - report.estimatedMinPrice;
                      const offset = currentAskingPrice - report.estimatedMinPrice;
                      const percentage = Math.max(0, Math.min(100, (offset / range) * 100));
                      const isOverpriced = currentAskingPrice > report.estimatedMaxPrice;
                      const isBargain = currentAskingPrice < report.estimatedMinPrice;
                      
                      return (
                        <div 
                          className="absolute -top-1.5 -translate-x-1/2 flex flex-col items-center"
                          style={{ left: `${percentage}%` }}
                        >
                          <div className="w-5 h-5 bg-white rounded-full flex items-center justify-center shadow-lg border-2 border-red-600">
                            <div className="w-2 h-2 bg-red-600 rounded-full animate-ping"></div>
                          </div>
                          <span className="absolute top-7 whitespace-nowrap bg-red-600 text-white text-[9px] font-black px-2 py-1 rounded-md shadow-lg">
                            Đang chào bán: {formatPrice(currentAskingPrice)} 
                            {isOverpriced && ' 📈 Cao'}
                            {isBargain && ' 📉 Hời'}
                          </span>
                        </div>
                      );
                    })()}
                  </div>
                </div>
              </div>

              {/* Box 2: Quality & Sentiment Badges */}
              <div className="grid grid-cols-2 md:grid-cols-1 gap-4">
                {/* Grade Badge */}
                <div className="bg-gradient-to-br from-gray-50 to-white border border-gray-200 rounded-2xl p-4 flex items-center gap-3">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${getGradeColor(report.investmentGrade)} flex items-center justify-center font-black text-xl shadow-lg`}>
                    {report.investmentGrade}
                  </div>
                  <div>
                    <h5 className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Điểm đầu tư</h5>
                    <p className="text-sm text-gray-900 font-bold">Grade {report.investmentGrade}</p>
                  </div>
                </div>

                {/* Sentiment Badge */}
                {(() => {
                  const details = getSentimentDetails(report.marketSentiment);
                  return (
                    <div className="bg-gradient-to-br from-gray-50 to-white border border-gray-200 rounded-2xl p-4 flex items-center gap-3">
                      <div className={`p-3 rounded-xl border ${details.color} flex items-center justify-center`}>
                        {details.icon}
                      </div>
                      <div>
                        <h5 className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Xu hướng khu vực</h5>
                        <p className="text-sm text-gray-900 font-bold">{details.label}</p>
                      </div>
                    </div>
                  );
                })()}
              </div>
            </div>

            {/* Advisory note */}
            <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-2xl p-5">
              <h4 className="text-xs text-amber-700 font-bold uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <BookOpen className="h-4 w-4" />
                Ý kiến chuyên gia thẩm định AI
              </h4>
              <p className="text-gray-700 text-sm leading-relaxed font-medium">
                {report.valuationAdvisory}
              </p>
            </div>

            {/* Pros and Cons split list */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Pros */}
              <div className="bg-green-50/60 border border-green-200 rounded-2xl p-5 space-y-3">
                <h4 className="text-xs text-green-700 font-bold uppercase tracking-wider flex items-center gap-1.5">
                  <ThumbsUp className="h-4 w-4" />
                  Lợi thế nổi bật (Pros)
                </h4>
                <ul className="space-y-2.5">
                  {report.pros.map((pro, index) => (
                    <li key={`pro-${index}`} className="text-sm text-gray-700 font-medium leading-relaxed flex items-start gap-2">
                      <span className="w-1.5 h-1.5 bg-green-500 rounded-full mt-1.5 flex-shrink-0"></span>
                      {pro}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Cons */}
              <div className="bg-red-50/60 border border-red-200 rounded-2xl p-5 space-y-3">
                <h4 className="text-xs text-red-700 font-bold uppercase tracking-wider flex items-center gap-1.5">
                  <ThumbsDown className="h-4 w-4" />
                  Rủi ro / Điểm cần lưu ý (Cons)
                </h4>
                <ul className="space-y-2.5">
                  {report.cons.map((con, index) => (
                    <li key={`con-${index}`} className="text-sm text-gray-700 font-medium leading-relaxed flex items-start gap-2">
                      <span className="w-1.5 h-1.5 bg-red-500 rounded-full mt-1.5 flex-shrink-0"></span>
                      {con}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Strategic recommendations */}
            <div className="bg-gradient-to-r from-red-50 to-amber-50 border border-amber-200 rounded-2xl p-5">
              <h4 className="text-xs text-amber-700 font-bold uppercase tracking-wider mb-3 flex items-center gap-1.5">
                <ShieldCheck className="h-4 w-4" />
                Khuyến nghị giao dịch & Đàm phán
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {report.recommendations.map((rec, index) => (
                  <div key={`rec-${index}`} className="bg-white rounded-xl p-3 border border-gray-100 shadow-sm flex items-start gap-2">
                    <ChevronRight className="h-4 w-4 text-amber-600 mt-0.5 flex-shrink-0" />
                    <p className="text-sm text-gray-700 font-medium leading-normal">{rec}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Note disclaimer */}
            <div className="flex items-center gap-1.5 text-[10px] text-gray-400 font-semibold justify-center">
              <AlertCircle className="h-3.5 w-3.5" />
              <span>Kết quả thẩm định AI mang tính tham khảo dựa trên mô hình học máy và thông số thị trường cung cấp.</span>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};
