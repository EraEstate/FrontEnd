import React, { useState } from 'react';
import { Search, MapPin, Phone, Mail, Users, Star } from 'lucide-react';
import { useAgencies } from '../api/hooks';
import type { Agency } from '../types';
import { useTranslation } from 'react-i18next';

const AgenciesPage: React.FC = () => {
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(0);

  const { data: agencies, loading, error, refetch } = useAgencies({
    page: currentPage,
    size: 12,
    ...(searchTerm && { name: searchTerm })
  });

  const handleSearch = () => {
    setCurrentPage(0);
    refetch();
  };

  return (
    <div className="min-h-screen bg-gray-50 mt-10">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="w-full px-6 lg:px-12 py-6">
          <h1 className="text-3xl font-semibold text-gray-900 mb-4">
            {t('header.companies')}
          </h1>
          <p className="text-gray-600 mb-6">
            {t('agencies.subtitle')}
          </p>

          {/* Search Bar */}
          <div className="flex items-center gap-x-4">
            <div className="flex-1 relative">
              <div className="flex items-center bg-gray-100 rounded-lg">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder={t('agencies.searchPlaceholder')}
                  className="flex-1 px-4 py-3 bg-transparent border-none focus:outline-none text-sm"
                />
                <button
                  onClick={handleSearch}
                  className="px-6 py-3 bg-red-600 text-white rounded-r-lg hover:bg-red-700 transition-colors flex items-center"
                >
                  <Search className="h-4 w-4 mr-2" />
                  {t('common.search')}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="w-full px-6 lg:px-12 py-6">
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin h-8 w-8 text-red-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">{t('common.loading')}</p>
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <p className="text-red-600 mb-4">{t('common.loadError')}: {error}</p>
            <button
              onClick={refetch}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
            >
              {t('common.retry')}
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {agencies?.content?.map((agency: Agency) => (
              <AgencyCard key={agency.id} agency={agency} />
            )) || (
              <div className="col-span-full text-center py-8 text-gray-500">
                {t('agencies.noCompanies')}
              </div>
            )}
          </div>
        )}

        {/* Pagination */}
        {agencies && agencies.totalPages > 1 && (
          <div className="flex justify-center mt-8">
            <div className="flex gap-x-2">
              {Array.from({ length: agencies.totalPages }, (_, pageNumber) => pageNumber).map((pageNumber) => (
                <button
                  key={`page-${pageNumber}`}
                  onClick={() => setCurrentPage(pageNumber)}
                  className={`px-3 py-2 rounded-lg ${
                    pageNumber === currentPage
                      ? 'bg-red-600 text-white'
                      : 'bg-white text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {pageNumber + 1}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Agency Card Component
const AgencyCard: React.FC<{ agency: Agency }> = ({ agency }) => {
  return (
    <div className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-300 overflow-hidden border border-gray-200">
      <div className="p-6">
        {/* Logo and Name */}
        <div className="flex items-center mb-4">
          <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center mr-3">
            {agency.logo ? (
              <img src={agency.logo} alt={agency.name} className="w-full h-full object-cover rounded-lg" />
            ) : (
              <span className="text-gray-600 font-bold text-lg">
                {agency.name.charAt(0)}
              </span>
            )}
          </div>
          <div>
            <h3 className="font-semibold text-lg text-gray-900 line-clamp-1">
              {agency.name}
            </h3>
            <div className="flex items-center text-sm text-gray-500">
              <Star className="h-4 w-4 text-yellow-400 mr-1" />
              <span>4.5</span>
              <span className="mx-2">•</span>
              <Users className="h-4 w-4 mr-1" />
              <span>{agency.agents?.length || 0} agents</span>
            </div>
          </div>
        </div>

        {/* Description */}
        <p className="text-gray-600 text-sm mb-4 line-clamp-3">
          {agency.description}
        </p>

        {/* Contact Info */}
        <div className="space-y-2 mb-4">
          {agency.address && (
            <div className="flex items-center text-sm text-gray-600">
              <MapPin className="h-4 w-4 mr-2 flex-shrink-0" />
              <span className="line-clamp-1">{agency.address}</span>
            </div>
          )}
          {agency.phoneNumber && (
            <div className="flex items-center text-sm text-gray-600">
              <Phone className="h-4 w-4 mr-2 flex-shrink-0" />
              <span>{agency.phoneNumber}</span>
            </div>
          )}
          {agency.email && (
            <div className="flex items-center text-sm text-gray-600">
              <Mail className="h-4 w-4 mr-2 flex-shrink-0" />
              <span className="line-clamp-1">{agency.email}</span>
            </div>
          )}
        </div>

        {/* Action Button */}
        <button className="w-full bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 transition-colors text-sm font-medium">
          Xem chi tiết
        </button>
      </div>
    </div>
  );
};

export default AgenciesPage;
