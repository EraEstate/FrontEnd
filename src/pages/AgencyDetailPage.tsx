import React from 'react';
import { useParams } from 'react-router-dom';
import { MapPin, Phone, Mail, Globe, Users, Star, Award } from 'lucide-react';
import { useAgency, useAgencyAgents } from '../api/hooks';
import type { Agent } from '../types';
import { useTranslation } from 'react-i18next';

const AgencyDetailPage: React.FC = () => {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();

  const { data: agency, loading: agencyLoading, error: agencyError } = useAgency(id!);
  const { data: agents, loading: agentsLoading } = useAgencyAgents(id!, 0, 20);

  if (agencyLoading) {
    return (
      <div className="min-h-screen bg-gray-50 mt-10 flex items-center justify-center">
        <div className="animate-spin h-8 w-8 text-red-600"></div>
      </div>
    );
  }

  if (agencyError || !agency) {
    return (
      <div className="min-h-screen bg-gray-50 mt-10 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">Không tìm thấy công ty</h2>
          <p className="text-gray-600">Công ty bất động sản này không tồn tại hoặc đã bị xóa.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 mt-10">
      {/* Header Section */}
      <div className="bg-white shadow-sm">
        <div className="w-full px-6 lg:px-12 py-8">
          <div className="flex items-center gap-x-6">
            {/* Logo */}
            <div className="w-20 h-20 bg-gray-200 rounded-lg flex items-center justify-center">
              {agency.logo ? (
                <img src={agency.logo} alt={agency.name} className="w-full h-full object-cover rounded-lg" />
              ) : (
                <span className="text-gray-600 font-bold text-2xl">
                  {agency.name.charAt(0)}
                </span>
              )}
            </div>

            {/* Agency Info */}
            <div className="flex-1">
              <h1 className="text-3xl font-semibold text-gray-900 mb-2">{agency.name}</h1>
              <div className="flex items-center gap-x-4 mb-3">
                <div className="flex items-center">
                  <Star className="h-5 w-5 text-yellow-400 mr-1" />
                  <span className="font-medium">4.5</span>
                  <span className="text-gray-500 ml-1">(120 đánh giá)</span>
                </div>
                <div className="flex items-center">
                  <Users className="h-5 w-5 text-gray-400 mr-1" />
                  <span className="text-gray-600">{agents?.totalElements || 0} môi giới</span>
                </div>
                <div className="flex items-center">
                  <Award className="h-5 w-5 text-green-500 mr-1" />
                  <span className="text-green-600">Đã xác thực</span>
                </div>
              </div>
              <p className="text-gray-600 max-w-2xl">{agency.description}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="w-full px-6 lg:px-12 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Agency Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* About Section */}
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Giới thiệu</h2>
              <div className="prose max-w-none text-gray-600">
                <p className="mb-4">{agency.description}</p>
                <p>
                  {agency.name} là một trong những công ty bất động sản hàng đầu tại Việt Nam,
                  chuyên cung cấp các dịch vụ mua bán, cho thuê bất động sản với đội ngũ
                  môi giới chuyên nghiệp và giàu kinh nghiệm.
                </p>
              </div>
            </div>

            {/* Contact Information */}
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Thông tin liên hệ</h2>
              <div className="space-y-4">
                {agency.address && (
                  <div className="flex items-start">
                    <MapPin className="h-5 w-5 text-gray-400 mr-3 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-medium text-gray-900">Địa chỉ</p>
                      <p className="text-gray-600">{agency.address}</p>
                    </div>
                  </div>
                )}
                {agency.phoneNumber && (
                  <div className="flex items-center">
                    <Phone className="h-5 w-5 text-gray-400 mr-3 flex-shrink-0" />
                    <div>
                      <p className="font-medium text-gray-900">Điện thoại</p>
                      <p className="text-gray-600">{agency.phoneNumber}</p>
                    </div>
                  </div>
                )}
                {agency.email && (
                  <div className="flex items-center">
                    <Mail className="h-5 w-5 text-gray-400 mr-3 flex-shrink-0" />
                    <div>
                      <p className="font-medium text-gray-900">Email</p>
                      <p className="text-gray-600">{agency.email}</p>
                    </div>
                  </div>
                )}
                {agency.website && (
                  <div className="flex items-center">
                    <Globe className="h-5 w-5 text-gray-400 mr-3 flex-shrink-0" />
                    <div>
                      <p className="font-medium text-gray-900">Website</p>
                      <a href={agency.website} className="text-blue-600 hover:text-blue-800">
                        {agency.website}
                      </a>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Agents Section */}
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Đội ngũ môi giới</h2>
              {agentsLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin h-6 w-6 text-red-600 mx-auto"></div>
                </div>
              ) : agents?.content?.length ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {agents.content.map((agent: Agent) => (
                    <div key={agent.id} className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                      <img
                        src={agent.avatar || '/api/placeholder/60/60'}
                        alt={agent.fullName}
                        className="w-12 h-12 rounded-full object-cover mr-4"
                      />
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900">{agent.fullName}</h3>
                        <p className="text-sm text-gray-600">{agent.specialties?.join(', ') || t('agency.realEstateSpecialist')}</p>
                        <div className="flex items-center mt-1">
                          <Star className="h-4 w-4 text-yellow-400 mr-1" />
                          <span className="text-sm text-gray-600">{agent.rating}</span>
                          <span className="text-sm text-gray-500 ml-2">
                            {agent.totalSales} giao dịch
                          </span>
                        </div>
                      </div>
                      <button className="text-red-600 hover:text-red-700 text-sm font-medium">
                        Liên hệ
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-600">Chưa có thông tin về đội ngũ môi giới.</p>
              )}
            </div>
          </div>

          {/* Right Column - Sidebar */}
          <div className="space-y-6">
            {/* Quick Stats */}
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <h3 className="font-semibold text-gray-900 mb-4">Thống kê</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Tổng số môi giới</span>
                  <span className="font-medium">{agents?.totalElements || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Năm thành lập</span>
                  <span className="font-medium">2020</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Khu vực hoạt động</span>
                  <span className="font-medium">TP.HCM, Hà Nội</span>
                </div>
              </div>
            </div>

            {/* Contact Button */}
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <button className="w-full bg-red-600 text-white py-3 px-4 rounded-lg hover:bg-red-700 transition-colors font-medium">
                Liên hệ công ty
              </button>
            </div>

            {/* Similar Agencies */}
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <h3 className="font-semibold text-gray-900 mb-4">Công ty tương tự</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-x-3">
                  <div className="w-10 h-10 bg-gray-200 rounded-lg flex items-center justify-center">
                    <span className="text-gray-600 font-semibold">S</span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Savills Vietnam</p>
                    <p className="text-sm text-gray-600">45 môi giới</p>
                  </div>
                </div>
                <div className="flex items-center gap-x-3">
                  <div className="w-10 h-10 bg-gray-200 rounded-lg flex items-center justify-center">
                    <span className="text-gray-600 font-bold">C</span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">CBRE Vietnam</p>
                    <p className="text-sm text-gray-600">32 môi giới</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AgencyDetailPage;