import React from 'react';
import { Link } from 'react-router-dom';
import { Home, Search, ArrowLeft, Building2, MapPin, Phone } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const NotFoundPage: React.FC = () => {
  const { t } = useTranslation();
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="max-w-md w-full text-center">
          {/* 404 Illustration */}
          <div className="mb-8">
            <div className="text-8xl font-bold text-orange-600 mb-4">404</div>
            <div className="flex justify-center mb-6">
              <div className="relative">
                <Building2 className="w-32 h-32 text-gray-300" />
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                  <Search className="w-12 h-12 text-gray-400" />
                </div>
              </div>
            </div>
          </div>

          {/* Error Message */}
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            {t('notFound.title')}
          </h1>
          <p className="text-gray-600 mb-8 leading-relaxed">
            t('notFound.description')
          </p>

          {/* Action Buttons */}
          <div className="space-y-4">
            <Link
              to="/"
              className="inline-flex items-center bg-orange-600 text-white px-6 py-3 rounded-lg hover:bg-orange-700 transition-colors font-medium"
            >
              <Home className="w-5 h-5 mr-2" />
              {t('notFound.backHome')}
            </Link>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/properties"
                className="inline-flex items-center border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <Building2 className="w-4 h-4 mr-2" />
                {t('common.viewProperties')}
              </Link>
              
              <Link
                to="/news"
                className="inline-flex items-center border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <Search className="w-4 h-4 mr-2" />
                {t('common.readNews')}
              </Link>
            </div>

            <button
              onClick={() => window.history.back()}
              className="inline-flex items-center text-gray-500 hover:text-gray-700 transition-colors"
            >
              <ArrowLeft className="w-4 h-4 mr-1" />
              {t('common.goBack')}
            </button>
          </div>
        </div>
      </div>

      {/* Help Section */}
      <div className="bg-white border-t">
        <div className="max-w-4xl mx-auto px-4 py-12">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              {t('common.needHelp')}
            </h2>
            <p className="text-gray-600">
              {t('common.supportTeam')}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-6 bg-gray-50 rounded-lg">
              <div className="bg-orange-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
                <Phone className="w-6 h-6 text-orange-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">{t('common.call')}</h3>
              <p className="text-gray-600 text-sm mb-3">
                {t('common.contactHotline')}
              </p>
              <a
                href="tel:19001881"
                className="text-orange-600 font-medium hover:text-orange-700"
              >
                1900-1881
              </a>
            </div>

            <div className="text-center p-6 bg-gray-50 rounded-lg">
              <div className="bg-blue-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
                <MapPin className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">{t('common.office')}</h3>
              <p className="text-gray-600 text-sm mb-3">
                {t('common.visitOffice')}
              </p>
              <Link
                to="/contact"
                className="text-blue-600 font-medium hover:text-blue-700"
              >
                {t('common.viewAddress')}
              </Link>
            </div>

            <div className="text-center p-6 bg-gray-50 rounded-lg">
              <div className="bg-green-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">{t('common.search')}</h3>
              <p className="text-gray-600 text-sm mb-3">
                {t('common.searchProperties')}
              </p>
              <Link
                to="/properties"
                className="text-green-600 font-medium hover:text-green-700"
              >
                {t('common.startSearching')}
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Popular Links */}
      <div className="bg-gray-100">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <h3 className="font-semibold text-gray-900 mb-4 text-center">
            {t('common.popularLinks')}
          </h3>
          <div className="flex flex-wrap justify-center gap-4">
            {[
              { name: t('common.apartmentHCM'), href: '/properties?location=ho-chi-minh&type=apartment' },
              { name: t('common.houseHanoi'), href: '/properties?location=hanoi&type=house' },
              { name: t('common.villaDaNang'), href: '/properties?location=da-nang&type=villa' },
              { name: t('common.landBinhDuong'), href: '/properties?location=binh-duong&type=land' },
              { name: t('common.officeRent'), href: '/properties?transaction=rent&type=office' },
              { name: t('common.marketNews'), href: '/news?category=market' },
            ].map((link) => (
              <Link
                key={link.name}
                to={link.href}
                className="text-sm text-gray-600 hover:text-orange-600 px-3 py-1 rounded-full border border-gray-300 hover:border-orange-300 transition-colors"
              >
                {link.name}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotFoundPage;