import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Star, MapPin, Phone, Mail, Building, Users, Award, Calendar, Search } from 'lucide-react';
import { useAgents, useTopAgents } from '../api/hooks';
import type { Agent } from '../types';
import { useTranslation } from 'react-i18next';

const AgentsPage: React.FC = () => {
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState('');
  const [sortBy, setSortBy] = useState('rating');
  const [currentPage, setCurrentPage] = useState(0);
  const [searchParams, setSearchParams] = useState<any>({});

  // API Hooks
  const { data: agentsData, loading, error, refetch } = useAgents({
    page: currentPage,
    size: 12,
    sortBy,
    ...searchParams
  });

  const { data: topAgents } = useTopAgents(0, 6);

  const locations = [
    { value: '', label: t('agents.allAreas') },
    { value: 'ho-chi-minh', label: 'TP. Hồ Chí Minh' },
    { value: 'ha-noi', label: 'Hà Nội' },
    { value: 'da-nang', label: 'Đà Nẵng' },
    { value: 'can-tho', label: 'Cần Thơ' },
    { value: 'hai-phong', label: 'Hải Phong' },
  ];

  const specialties = [
    { value: '', label: t('agents.allSpecialties') },
    { value: 'apartment', label: t('postProperty.apartment') },
    { value: 'house', label: 'Nhà riêng' },
    { value: 'villa', label: t('postProperty.villa') },
    { value: 'office', label: 'Văn phòng' },
    { value: 'commercial', label: 'Thương mại' },
    { value: 'land', label: t('postProperty.land') },
  ];

  const sortOptions = [
    { value: 'rating', label: 'Đánh giá cao nhất' },
    { value: 'experience', label: t('agents.mostExperienced') },
    { value: 'sales', label: t('agents.mostDeals') },
    { value: 'newest', label: t('agents.newest') },
  ];

  // Xử lý search và filter
  const handleSearch = () => {
    const newParams = {
      keyword: searchTerm || undefined,
      location: selectedLocation || undefined,
      specialty: selectedSpecialty || undefined,
    };
    setSearchParams(newParams);
    setCurrentPage(0);
  };

  // Update search params when filters change
  useEffect(() => {
    if (selectedLocation || selectedSpecialty) {
      handleSearch();
    }
  }, [selectedLocation, selectedSpecialty, sortBy]);

  // Data from API
  const agents = agentsData?.content || [];
  const totalPages = agentsData?.totalPages || 0;
  const topAgentsList = topAgents?.content || [];

  const getSpecialtyLabel = (specialty: string) => {
    return specialties.find(s => s.value === specialty)?.label || specialty;
  };

  const getLocationLabel = (location: string) => {
    return locations.find(l => l.value === location)?.label || location;
  };

  const AgentCard: React.FC<{ agent: Agent }> = ({ agent }) => (
    <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow p-6">
      <div className="flex items-start space-x-4">
        <div className="relative">
          <img
            src={agent.avatar}
            alt={agent.fullName}
            className="w-20 h-20 rounded-full object-cover"
          />
          {agent.isOnline && (
            <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-2 border-white flex items-center justify-center">
              <div className="w-2 h-2 bg-white rounded-full"></div>
            </div>
          )}
          {agent.isVerified && (
            <div className="absolute -top-1 -right-1 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
              <Award className="w-3 h-3 text-white" />
            </div>
          )}
        </div>

        <div className="flex-1">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xl font-bold text-gray-900">{agent.fullName}</h3>
            <div className="flex items-center">
              <Star className="w-4 h-4 text-yellow-400 fill-current" />
              <span className="ml-1 text-sm font-medium text-gray-900">
                {agent.rating}
              </span>
              <span className="ml-1 text-sm text-gray-500">
                ({agent.reviewCount} đánh giá)
              </span>
            </div>
          </div>

          <div className="flex items-center text-sm text-gray-600 mb-2">
            <Building className="w-4 h-4 mr-1" />
            <span>{agent.agency?.name}</span>
            <span className="mx-2">•</span>
            <Calendar className="w-4 h-4 mr-1" />
            <span>{agent.experience} năm kinh nghiệm</span>
          </div>

          <div className="flex items-center text-sm text-gray-600 mb-3">
            <MapPin className="w-4 h-4 mr-1" />
            <span>{agent.workingAreas.map(area => getLocationLabel(area)).join(', ')}</span>
          </div>

          <p className="text-gray-700 text-sm mb-4 line-clamp-2">
            {agent.description}
          </p>

          <div className="flex flex-wrap gap-2 mb-4">
            {agent.specialties.map((specialty) => (
              <span
                key={specialty}
                className="bg-orange-100 text-orange-800 px-2 py-1 rounded-full text-xs font-medium"
              >
                {getSpecialtyLabel(specialty)}
              </span>
            ))}
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4 text-sm text-gray-600">
              <div className="flex items-center">
                <Users className="w-4 h-4 mr-1" />
                <span>{agent.totalSales} giao dịch</span>
              </div>
            </div>

            <div className="flex space-x-2">
              <button className="p-2 text-gray-600 hover:text-orange-600 hover:bg-orange-50 rounded-full transition-colors">
                <Phone className="w-4 h-4" />
              </button>
              <button className="p-2 text-gray-600 hover:text-orange-600 hover:bg-orange-50 rounded-full transition-colors">
                <Mail className="w-4 h-4" />
              </button>
              <Link
                to={`/agents/${agent.id}`}
                className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors text-sm font-medium"
              >
                Xem chi tiết
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const TopAgents: React.FC = () => (
    <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Môi Giới Hàng Đầu</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {topAgentsList.slice(0, 3).map((agent: Agent, index: number) => (
          <div key={agent.id} className="text-center">
            <div className="relative inline-block mb-4">
              <img
                src={agent.avatar}
                alt={agent.fullName}
                className="w-24 h-24 rounded-full object-cover mx-auto"
              />
              <div className={`absolute -top-2 -right-2 w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm ${
                index === 0 ? 'bg-yellow-500' : index === 1 ? 'bg-gray-400' : 'bg-orange-600'
              }`}>
                {index + 1}
              </div>
            </div>
            <h3 className="font-bold text-gray-900 mb-1">{agent.fullName}</h3>
            <p className="text-sm text-gray-600 mb-2">{agent.agency?.name}</p>
            <div className="flex items-center justify-center mb-2">
              <Star className="w-4 h-4 text-yellow-400 fill-current" />
              <span className="ml-1 text-sm font-medium">{agent.rating}</span>
            </div>
            <p className="text-xs text-gray-500">{agent.totalSales} giao dịch thành công</p>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Môi Giới <span className="text-orange-600">Chuyên Nghiệp</span>
            </h1>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Kết nối với các chuyên gia bất động sản uy tín, 
              có kinh nghiệm để tìm kiếm căn nhà mơ ước của bạn
            </p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Top Agents */}
        {!loading && agents.length > 0 && <TopAgents />}

        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Tìm kiếm môi giới..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyPress={(e) => e.key === t('common.enter') && handleSearch()}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Location Filter */}
            <div>
              <select
                value={selectedLocation}
                onChange={(e) => setSelectedLocation(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent appearance-none bg-white"
              >
                {locations.map((location) => (
                  <option key={location.value} value={location.value}>
                    {location.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Specialty Filter */}
            <div>
              <select
                value={selectedSpecialty}
                onChange={(e) => setSelectedSpecialty(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent appearance-none bg-white"
              >
                {specialties.map((specialty) => (
                  <option key={specialty.value} value={specialty.value}>
                    {specialty.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Sort */}
            <div>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent appearance-none bg-white"
              >
                {sortOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Agents List */}
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
          </div>
        ) : error ? (
          <div className="text-center py-20">
            <p className="text-red-600 mb-4">Lỗi tải dữ liệu: {error}</p>
            <button 
              onClick={refetch}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
            >
              Thử lại
            </button>
          </div>
        ) : agents.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-gray-400 mb-4">
              <Users className="w-16 h-16 mx-auto" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Không tìm thấy môi giới nào
            </h3>
            <p className="text-gray-600">
              Hãy thử tìm kiếm với từ khóa khác hoặc thay đổi bộ lọc
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {agents.map((agent: Agent) => (
              <AgentCard key={agent.id} agent={agent} />
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center mt-12">
            <div className="flex space-x-2">
              <button
                onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
                disabled={currentPage === 0}
                className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                Trước
              </button>
              
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const pageNum = Math.max(0, Math.min(totalPages - 5, currentPage - 2)) + i;
                return (
                  <button
                    key={pageNum}
                    onClick={() => setCurrentPage(pageNum)}
                    className={`px-4 py-2 border rounded-lg ${
                      currentPage === pageNum
                        ? 'bg-orange-600 text-white border-orange-600'
                        : 'border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    {pageNum + 1}
                  </button>
                );
              })}
              
              <button
                onClick={() => setCurrentPage(Math.min(totalPages - 1, currentPage + 1))}
                disabled={currentPage >= totalPages - 1}
                className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                Sau
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AgentsPage;