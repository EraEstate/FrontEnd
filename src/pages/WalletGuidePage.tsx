import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Wallet, Shield, Network, Coins, FileText } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import {
  REALESTATE_CONTRACT_ADDRESS,
  BLOCKCHAIN_NETWORK_NAME,
  BLOCKCHAIN_EXPLORER_URL,
} from '../config/blockchain';

const WalletGuidePage: React.FC = () => {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-gray-50 pt-20 pb-16">
      <div className="max-w-3xl mx-auto px-4">
        <Link
          to="/"
          className="inline-flex items-center gap-1 text-sm text-gray-600 hover:text-red-600 mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          {t('walletGuide.backHome')}
        </Link>

        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-gray-100 bg-red-50/50">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-white border border-red-100 shadow-sm">
                <Wallet className="w-8 h-8 text-red-600" />
              </div>
              <div>
                <h1 className="text-2xl font-semibold text-gray-900">{t('walletGuide.title')}</h1>
                <p className="text-sm text-gray-600 mt-1">{t('walletGuide.subtitle')}</p>
              </div>
            </div>
          </div>

          <div className="p-6 space-y-8 text-gray-700">
            <section>
              <h2 className="flex items-center gap-2 text-lg font-semibold text-gray-900 mb-3">
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-red-100 text-sm font-bold text-red-700">
                  1
                </span>
                {t('walletGuide.step1Title')}
              </h2>
              <p className="text-sm leading-relaxed mb-3">{t('walletGuide.step1Body')}</p>
              <ul className="list-disc list-inside text-sm space-y-1 text-gray-600">
                <li>{t('walletGuide.step1Item1')}</li>
                <li>{t('walletGuide.step1Item2')}</li>
              </ul>
            </section>

            <section>
              <h2 className="flex items-center gap-2 text-lg font-semibold text-gray-900 mb-3">
                <Network className="w-5 h-5 text-red-600" />
                {t('walletGuide.step2Title')}
              </h2>
              <p className="text-sm leading-relaxed mb-3">{t('walletGuide.step2Body')}</p>
              <div className="rounded-lg bg-gray-50 border border-gray-100 px-4 py-3 text-sm font-mono text-gray-800">
                {t('walletGuide.networkLabel')}: <span className="text-red-700">{BLOCKCHAIN_NETWORK_NAME}</span>
              </div>
              <p className="text-xs text-gray-500 mt-2">{t('walletGuide.networkHint')}</p>
            </section>

            <section>
              <h2 className="flex items-center gap-2 text-lg font-semibold text-gray-900 mb-3">
                <Coins className="w-5 h-5 text-red-600" />
                {t('walletGuide.step3Title')}
              </h2>
              <p className="text-sm leading-relaxed">{t('walletGuide.step3Body')}</p>
            </section>

            <section>
              <h2 className="flex items-center gap-2 text-lg font-semibold text-gray-900 mb-3">
                <FileText className="w-5 h-5 text-red-600" />
                {t('walletGuide.step4Title')}
              </h2>
              <p className="text-sm leading-relaxed mb-3">{t('walletGuide.step4Body')}</p>
              <div className="rounded-lg bg-gray-50 border border-gray-100 px-4 py-3 text-xs font-mono break-all text-gray-700">
                {REALESTATE_CONTRACT_ADDRESS && REALESTATE_CONTRACT_ADDRESS !==
                '0x0000000000000000000000000000000000000000'
                  ? REALESTATE_CONTRACT_ADDRESS
                  : t('walletGuide.contractNotConfigured')}
              </div>
            </section>

            <section className="border-t border-gray-100 pt-6">
              <h2 className="flex items-center gap-2 text-lg font-semibold text-gray-900 mb-3">
                <Shield className="w-5 h-5 text-red-600" />
                {t('walletGuide.legalTitle')}
              </h2>
              <p className="text-sm leading-relaxed text-gray-600 mb-4">{t('walletGuide.legalBody')}</p>
              <div className="flex flex-wrap gap-3">
                <Link
                  to="/legal?tab=blockchain"
                  className="inline-flex items-center text-sm font-medium text-red-600 hover:underline"
                >
                  {t('walletGuide.linkLegal')} →
                </Link>
                <Link
                  to="/security"
                  className="inline-flex items-center text-sm font-medium text-red-600 hover:underline"
                >
                  {t('walletGuide.linkSecurity')} →
                </Link>
                {BLOCKCHAIN_EXPLORER_URL ? (
                  <a
                    href={BLOCKCHAIN_EXPLORER_URL.replace(/\/$/, '')}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center text-sm font-medium text-red-600 hover:underline"
                  >
                    {t('walletGuide.linkExplorer')} →
                  </a>
                ) : null}
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WalletGuidePage;
