import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  Sparkles, 
  Copy, 
  Check, 
  Languages, 
  Facebook, 
  MessageSquare, 
  Tv, 
  Mail, 
  Send,
  Loader2,
  RefreshCw,
  AlertCircle
} from 'lucide-react';
import { aiListingAPI } from '../api/aiListing';
import { extractErrorMessage } from '../utils/errorParser';

interface AIMarketingHubProps {
  propertyId: string;
  originalTitle: string;
  originalDescription: string;
}

type MarketingChannel = 'Facebook' | 'Zalo' | 'TikTok' | 'Email';
type CampaignTone = 'Elegant' | 'Friendly' | 'Urgency' | 'Professional';

export const AIMarketingHub: React.FC<AIMarketingHubProps> = ({
  propertyId,
  originalTitle,
  originalDescription
}) => {
  const { t } = useTranslation();

  // Campaign State
  const [activeChannel, setActiveChannel] = useState<MarketingChannel>('Facebook');
  const [activeTone, setActiveTone] = useState<CampaignTone>('Elegant');
  const [campaignContent, setCampaignContent] = useState<string>('');
  const [campaignLoading, setCampaignLoading] = useState<boolean>(false);
  const [campaignError, setCampaignError] = useState<string | null>(null);
  const [campaignCopied, setCampaignCopied] = useState<boolean>(false);

  // Translation State
  const [targetLang, setTargetLang] = useState<'English' | 'Japanese'>('English');
  const [translatedTitle, setTranslatedTitle] = useState<string>('');
  const [translatedDesc, setTranslatedDesc] = useState<string>('');
  const [transLoading, setTransLoading] = useState<boolean>(false);
  const [transError, setTransError] = useState<string | null>(null);
  const [transCopied, setTransCopied] = useState<boolean>(false);

  // Copy to clipboard helper
  const handleCopyText = (text: string, type: 'campaign' | 'translation') => {
    navigator.clipboard.writeText(text);
    if (type === 'campaign') {
      setCampaignCopied(true);
      setTimeout(() => setCampaignCopied(false), 2000);
    } else {
      setTransCopied(true);
      setTimeout(() => setTransCopied(false), 2000);
    }
  };

  // Generate marketing campaign
  const handleGenerateCampaign = async () => {
    setCampaignLoading(true);
    setCampaignError(null);
    try {
      const resp = await aiListingAPI.generateCampaign({
        title: originalTitle,
        description: originalDescription,
        channel: activeChannel,
        tone: activeTone
      });
      setCampaignContent(resp.campaignContent);
    } catch (err) {
      setCampaignError(extractErrorMessage(err));
    } finally {
      setCampaignLoading(false);
    }
  };

  // Translate content
  const handleTranslate = async () => {
    setTransLoading(true);
    setTransError(null);
    try {
      const resp = await aiListingAPI.translateListing({
        title: originalTitle,
        description: originalDescription,
        targetLanguage: targetLang
      });
      setTranslatedTitle(resp.title);
      setTranslatedDesc(resp.description);
    } catch (err) {
      setTransError(extractErrorMessage(err));
    } finally {
      setTransLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-3xl border border-gray-100 shadow-xl overflow-hidden mt-8">
      {/* Sleek Gradient Header */}
      <div className="bg-gradient-to-r from-red-600 to-rose-500 p-6 text-white flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-white/10 rounded-2xl backdrop-blur-md">
            <Sparkles className="h-6 w-6 text-yellow-300 animate-pulse" />
          </div>
          <div>
            <h2 className="text-lg font-black tracking-tight">🚀 AI Marketing & Translation Hub</h2>
            <p className="text-xs text-white/80 font-semibold mt-0.5">Tiếp thị đa kênh & dịch thuật tin đăng chuyên nghiệp</p>
          </div>
        </div>
        <span className="text-[10px] bg-white/20 px-3 py-1 rounded-full font-black uppercase tracking-wider backdrop-blur-md">
          Chủ tin đăng
        </span>
      </div>

      <div className="p-6 md:p-8 space-y-8">
        
        {/* SECTION 1: MULTI-CHANNEL COPYWRITING */}
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-gray-100 pb-3">
            <h3 className="text-sm font-black text-gray-900 flex items-center gap-2">
              📢 Chiến dịch tiếp thị đa kênh
            </h3>
            <span className="text-xs text-gray-400 font-bold">Tăng lượt click x3 lần</span>
          </div>

          {/* Channel selector buttons */}
          <div className="grid grid-cols-4 gap-2">
            {[
              { id: 'Facebook', label: 'Facebook', icon: Facebook, color: 'hover:bg-blue-50 hover:text-blue-600 active:bg-blue-100' },
              { id: 'Zalo', label: 'Zalo', icon: MessageSquare, color: 'hover:bg-cyan-50 hover:text-cyan-600 active:bg-cyan-100' },
              { id: 'TikTok', label: 'TikTok Video', icon: Tv, color: 'hover:bg-gray-50 hover:text-black active:bg-gray-100' },
              { id: 'Email', label: 'Email Copy', icon: Mail, color: 'hover:bg-rose-50 hover:text-rose-600 active:bg-rose-100' }
            ].map((ch) => {
              const Icon = ch.icon;
              const isActive = activeChannel === ch.id;
              return (
                <button
                  key={ch.id}
                  onClick={() => {
                    setActiveChannel(ch.id as MarketingChannel);
                    setCampaignContent('');
                  }}
                  className={`flex flex-col items-center justify-center py-3 px-2 rounded-2xl border text-xs font-black transition-all gap-1.5 ${
                    isActive 
                      ? 'border-red-600 bg-red-50 text-red-600 shadow-sm scale-[1.02]' 
                      : `border-gray-100 bg-white text-gray-500 ${ch.color}`
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  <span>{ch.label}</span>
                </button>
              );
            })}
          </div>

          {/* Tone Selector */}
          <div className="bg-gray-50 p-4 rounded-2xl flex flex-wrap items-center gap-3 justify-between">
            <span className="text-xs font-black text-gray-600">Giọng điệu tiếp thị:</span>
            <div className="flex gap-2">
              {[
                { id: 'Elegant', label: 'Sang trọng' },
                { id: 'Friendly', label: 'Thân thiện' },
                { id: 'Urgency', label: 'Hối hả/Gấp' },
                { id: 'Professional', label: 'Chuyên nghiệp' }
              ].map((tone) => {
                const isActive = activeTone === tone.id;
                return (
                  <button
                    key={tone.id}
                    onClick={() => {
                      setActiveTone(tone.id as CampaignTone);
                      setCampaignContent('');
                    }}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                      isActive 
                        ? 'bg-white border-red-500 text-red-600 shadow-xs' 
                        : 'bg-transparent border-transparent text-gray-500 hover:text-gray-900'
                    }`}
                  >
                    {tone.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Action button */}
          <button
            onClick={handleGenerateCampaign}
            disabled={campaignLoading}
            className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3.5 px-4 rounded-2xl flex items-center justify-center gap-2 btn-press shadow-sm text-sm"
          >
            {campaignLoading ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                <span>Đang sáng tạo nội dung tiếp thị...</span>
              </>
            ) : (
              <>
                <Send className="h-4 w-4" />
                <span>Sinh bài viết quảng bá {activeChannel}</span>
              </>
            )}
          </button>

          {/* Error Message */}
          {campaignError && (
            <div className="p-4 bg-red-50 border border-red-100 rounded-2xl flex items-start gap-2 text-red-700 text-xs">
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
              <span>{campaignError}</span>
            </div>
          )}

          {/* Output Card */}
          {campaignContent && (
            <div className="relative group bg-gray-50/60 border border-gray-100 p-5 rounded-2xl animate-fadeIn">
              <div className="absolute top-4 right-4 flex gap-2">
                <button
                  onClick={() => handleCopyText(campaignContent, 'campaign')}
                  className="p-2 bg-white hover:bg-gray-100 text-gray-500 hover:text-gray-900 rounded-xl border border-gray-100 transition-all flex items-center gap-1 shadow-xs"
                >
                  {campaignCopied ? (
                    <>
                      <Check className="h-3.5 w-3.5 text-emerald-500" />
                      <span className="text-[10px] text-emerald-600 font-bold">Đã chép</span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-3.5 w-3.5" />
                      <span className="text-[10px] font-bold">Sao chép</span>
                    </>
                  )}
                </button>
              </div>

              <span className="text-[9px] bg-red-100 text-red-800 px-2 py-0.5 rounded font-black uppercase tracking-wider">
                Kết quả ({activeChannel} - {activeTone})
              </span>

              <p className="text-xs text-gray-800 whitespace-pre-line leading-relaxed font-semibold mt-4 pr-16 max-h-[300px] overflow-y-auto custom-scrollbar">
                {campaignContent}
              </p>
            </div>
          )}
        </div>

        {/* SECTION 2: PROFESSIONAL TRANSLATION */}
        <div className="space-y-4 pt-4 border-t border-gray-100">
          <div className="flex items-center justify-between border-b border-gray-100 pb-3">
            <h3 className="text-sm font-black text-gray-900 flex items-center gap-2">
              <Languages className="h-4 w-4 text-emerald-600" />
              🌐 Dịch thuật tin đăng đa ngôn ngữ
            </h3>
            <span className="text-xs text-gray-400 font-bold">Chuẩn thuật ngữ BĐS</span>
          </div>

          {/* Language selection */}
          <div className="bg-gray-50 p-4 rounded-2xl flex items-center justify-between">
            <span className="text-xs font-black text-gray-600">Dịch sang ngôn ngữ:</span>
            <div className="flex gap-2">
              {[
                { id: 'English', label: '🇬🇧 English (Tiếng Anh)' },
                { id: 'Japanese', label: '🇯🇵 Japanese (Tiếng Nhật)' }
              ].map((lang) => {
                const isActive = targetLang === lang.id;
                return (
                  <button
                    key={lang.id}
                    onClick={() => {
                      setTargetLang(lang.id as 'English' | 'Japanese');
                      setTranslatedTitle('');
                      setTranslatedDesc('');
                    }}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                      isActive 
                        ? 'bg-white border-emerald-500 text-emerald-700 shadow-xs' 
                        : 'bg-transparent border-transparent text-gray-500 hover:text-gray-900'
                    }`}
                  >
                    {lang.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Translate button */}
          <button
            onClick={handleTranslate}
            disabled={transLoading}
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3.5 px-4 rounded-2xl flex items-center justify-center gap-2 btn-press shadow-sm text-sm"
          >
            {transLoading ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                <span>Đang biên dịch tự động...</span>
              </>
            ) : (
              <>
                <RefreshCw className="h-4 w-4" />
                <span>Biên dịch tin đăng ({targetLang})</span>
              </>
            )}
          </button>

          {/* Translation Error */}
          {transError && (
            <div className="p-4 bg-red-50 border border-red-100 rounded-2xl flex items-start gap-2 text-red-700 text-xs">
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
              <span>{transError}</span>
            </div>
          )}

          {/* Translation Output */}
          {(translatedTitle || translatedDesc) && (
            <div className="relative group bg-gray-50/60 border border-gray-100 p-5 rounded-2xl animate-fadeIn space-y-4">
              <div className="absolute top-4 right-4 flex gap-2">
                <button
                  onClick={() => handleCopyText(`Title: ${translatedTitle}\n\nDescription:\n${translatedDesc}`, 'trans')}
                  className="p-2 bg-white hover:bg-gray-100 text-gray-500 hover:text-gray-900 rounded-xl border border-gray-100 transition-all flex items-center gap-1 shadow-xs"
                >
                  {transCopied ? (
                    <>
                      <Check className="h-3.5 w-3.5 text-emerald-500" />
                      <span className="text-[10px] text-emerald-600 font-bold">Đã chép</span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-3.5 w-3.5" />
                      <span className="text-[10px] font-bold">Sao chép bản dịch</span>
                    </>
                  )}
                </button>
              </div>

              <div>
                <span className="text-[9px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded font-black uppercase tracking-wider">
                  Tiêu đề ({targetLang})
                </span>
                <p className="text-sm font-bold text-gray-900 mt-2 pr-16">{translatedTitle}</p>
              </div>

              <div className="border-t border-gray-200/55 pt-3">
                <span className="text-[9px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded font-black uppercase tracking-wider">
                  Mô tả chi tiết ({targetLang})
                </span>
                <p className="text-xs text-gray-800 whitespace-pre-line leading-relaxed font-semibold mt-2 max-h-[240px] overflow-y-auto custom-scrollbar">
                  {translatedDesc}
                </p>
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
};
