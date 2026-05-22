import React, { useState } from 'react';
import { Shield, Scale, FileText, HelpCircle } from 'lucide-react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

type TabKey = 'blockchain' | 'terms' | 'faq';

const tabs: { key: TabKey; label: string; icon: React.ReactNode }[] = [
  { key: 'blockchain', label: 'Hợp đồng Blockchain', icon: <Shield className="w-4 h-4" /> },
  { key: 'terms', label: 'Điều khoản & Chính sách', icon: <Scale className="w-4 h-4" /> },
  { key: 'faq', label: 'FAQ Pháp lý', icon: <HelpCircle className="w-4 h-4" /> },
];

const LegalCenterPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();

  const searchParams = new URLSearchParams(location.search);
  const initialTab = (searchParams.get('tab') as TabKey) || 'blockchain';

  const [activeTab, setActiveTab] = useState<TabKey>(
    tabs.some((t) => t.key === initialTab) ? initialTab : 'blockchain'
  );

  const handleChangeTab = (key: TabKey) => {
    setActiveTab(key);
    const params = new URLSearchParams(location.search);
    params.set('tab', key);
    navigate({ pathname: location.pathname, search: params.toString() }, { replace: true });
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-2xl md:text-3xl font-semibold text-gray-900">
            {t('legal.title')}
          </h1>
          <p className="mt-2 text-sm text-gray-600">
            {t('legal.description')}
          </p>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 mb-6">
          <div className="flex border-b border-gray-100 overflow-x-auto">
            {tabs.map((tab) => {
              const isActive = tab.key === activeTab;
              return (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => handleChangeTab(tab.key)}
                  className={`flex items-center gap-2 px-4 py-3 text-sm whitespace-nowrap border-b-2 transition-colors ${
                    isActive
                      ? 'border-red-600 text-red-600 bg-red-50/40'
                      : 'border-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  {tab.icon}
                  <span>{t(`legal.tabs.${tab.key}`)}</span>
                </button>
              );
            })}
          </div>

          <div className="p-5 md:p-6">
            {activeTab === 'blockchain' && (
              <div className="space-y-4 text-sm text-gray-700">
                <div className="flex items-center gap-2 mb-2">
                  <Shield className="w-5 h-5 text-red-500" />
                  <h2 className="text-base md:text-lg font-semibold text-gray-900">
                    {t('legal.blockchain.q1Title')}
                  </h2>
                </div>
                <p>
                  {t('legal.blockchain.q1Desc_1')}
                  <span className="font-semibold">{t('legal.blockchain.q1Desc_2')}</span>
                  {t('legal.blockchain.q1Desc_3')}
                </p>
                <ul className="list-disc list-inside space-y-1">
                  <li>{t('legal.blockchain.q1Li1')}</li>
                  <li>{t('legal.blockchain.q1Li2')}</li>
                  <li>{t('legal.blockchain.q1Li3')}</li>
                  <li>{t('legal.blockchain.q1Li4')}</li>
                </ul>
                <p className="pt-1">
                  <Link
                    to="/help/wallet"
                    className="inline-flex items-center text-sm font-medium text-red-600 hover:underline"
                  >
                    {t('legal.blockchain.guideLink')}
                  </Link>
                </p>
                <div className="p-3 rounded-lg bg-amber-50 border border-amber-200 text-xs md:text-sm">
                  <p className="font-semibold text-amber-800 mb-1">
                    {t('legal.blockchain.noteTitle')}
                  </p>
                  <p className="text-amber-800">
                    {t('legal.blockchain.noteDesc_1')}<span className="font-semibold">{t('legal.blockchain.noteDesc_2')}</span>{t('legal.blockchain.noteDesc_3')}
                  </p>
                </div>
                <h3 className="mt-4 font-semibold text-gray-900">
                  {t('legal.blockchain.roleTitle')}
</h3>
                <ul className="list-disc list-inside space-y-1">
                  <li>
                    <span className="font-semibold">{t('legal.blockchain.roleLi1_1')}</span>{t('legal.blockchain.roleLi1_2')}
                  </li>
                  <li>
                    <span className="font-semibold">{t('legal.blockchain.roleLi2_1')}</span>{t('legal.blockchain.roleLi2_2')}
                  </li>
                  <li>
                    <span className="font-semibold">{t('legal.blockchain.roleLi3_1')}</span>{t('legal.blockchain.roleLi3_2')}
                  </li>
                </ul>
                <p className="text-xs text-gray-500">
                  {t('legal.blockchain.disclaimer_1')}<span className="font-semibold">{t('legal.blockchain.disclaimer_2')}</span>{t('legal.blockchain.disclaimer_3')}<span className="font-semibold">{t('legal.blockchain.disclaimer_4')}</span>{t('legal.blockchain.disclaimer_5')}
                </p>
              </div>
            )}

            {activeTab === 'terms' && (
              <div className="space-y-4 text-sm text-gray-700">
                <div className="flex items-center gap-2 mb-2">
                  <FileText className="w-5 h-5 text-red-500" />
                  <h2 className="text-base md:text-lg font-semibold text-gray-900">
                    {t('legal.terms.title')}
                  </h2>
                </div>
                <p>
                  {t('legal.terms.desc')}
                </p>
                <h3 className="font-semibold text-gray-900">{t('legal.terms.mainTermsTitle')}</h3>
                <ul className="list-disc list-inside space-y-1">
                  <li>{t('legal.terms.mainTermsLi1')}</li>
                  <li>{t('legal.terms.mainTermsLi2')}</li>
                  <li>{t('legal.terms.mainTermsLi3')}</li>
                  <li>{t('legal.terms.mainTermsLi4')}</li>
                </ul>
                <h3 className="font-semibold text-gray-900 mt-4">{t('legal.terms.privacyTitle')}</h3>
                <ul className="list-disc list-inside space-y-1">
                  <li>{t('legal.terms.privacyLi1')}</li>
                  <li>
                    {t('legal.terms.privacyLi2_1')}<span className="font-semibold">{t('legal.terms.privacyLi2_2')}</span>{t('legal.terms.privacyLi2_3')}
                  </li>
                  <li>{t('legal.terms.privacyLi3')}</li>
                </ul>
                <p className="text-xs text-gray-500">
                  {t('legal.terms.disclaimer')}
                </p>
              </div>
            )}

            {activeTab === 'faq' && (
              <div className="space-y-4 text-sm text-gray-700">
                <div className="flex items-center gap-2 mb-2">
                  <HelpCircle className="w-5 h-5 text-red-500" />
                  <h2 className="text-base md:text-lg font-semibold text-gray-900">
                    {t('legal.faq.title')}
                  </h2>
                </div>

                <div className="space-y-3">
                  <div className="rounded-lg border border-gray-200 bg-gray-50 p-3">
                    <p className="font-semibold text-gray-900">
                      {t('legal.faq.q1')}
                    </p>
                    <p className="mt-1 text-gray-700">
                      {t('legal.faq.a1')}
                    </p>
                  </div>

                  <div className="rounded-lg border border-gray-200 bg-gray-50 p-3">
                    <p className="font-semibold text-gray-900">
                      {t('legal.faq.q2')}
                    </p>
                    <p className="mt-1 text-gray-700">
                      {t('legal.faq.a2')}
                    </p>
                  </div>

                  <div className="rounded-lg border border-gray-200 bg-gray-50 p-3">
                    <p className="font-semibold text-gray-900">
                      {t('legal.faq.q3')}
                    </p>
                    <p className="mt-1 text-gray-700">
                      {t('legal.faq.a3_1')}
                      <span className="font-semibold">{t('legal.faq.a3_2')}</span>
                      {t('legal.faq.a3_3')}
                    </p>
                  </div>

                  <div className="rounded-lg border border-gray-200 bg-gray-50 p-3">
                    <p className="font-semibold text-gray-900">
                      {t('legal.faq.q4')}
                    </p>
                    <p className="mt-1 text-gray-700">
                      {t('legal.faq.a4')}
                    </p>
                  </div>
                </div>

                <p className="text-xs text-gray-500">
                  {t('legal.faq.disclaimer')}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LegalCenterPage;

