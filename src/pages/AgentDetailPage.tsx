import { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAgent, useAgentProperties } from '../api/hooks';
import { useTranslation } from 'react-i18next';
import { agentAPI } from '../api/agent';
import { useAuthStore } from '../store/authStore';
import toast from '../utils/toast';
import { Star, Loader2 } from 'lucide-react';
import { getImageUrl, getImagePlaceholder } from '../utils/imageUtils';
import AgentReviewForm from '../components/AgentReviewForm';
import AgentReviewRadar from '../components/AgentReviewRadar';
import { agentReviewApi, type AgentReview } from '../api/agentReview';
import { useEffect } from 'react';

const AgentDetailPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { isAuthenticated } = useAuthStore();
  const [activeTab, setActiveTab] = useState<'about' | 'properties' | 'reviews'>('about');
  const [ratingScore, setRatingScore] = useState(5);
  const [reviewText, setReviewText] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  // API Hooks
  const { data: agent, loading } = useAgent(id || '');
  const { data: propertiesData } = useAgentProperties(id || '');
  const properties = propertiesData?.content || [];
  const [reviews, setReviews] = useState<AgentReview[]>([]);

  useEffect(() => {
    if (id && activeTab === 'reviews') {
      agentReviewApi.getAgentReviews(id)
        .then(res => setReviews(res.data))
        .catch(console.error);
    }
  }, [id, activeTab]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="flex items-center space-x-6 mb-8">
            <div className="w-32 h-32 bg-gray-300 rounded-full"></div>
            <div className="flex-1">
              <div className="h-8 bg-gray-300 rounded w-1/3 mb-4"></div>
              <div className="h-4 bg-gray-300 rounded w-1/4 mb-2"></div>
              <div className="h-4 bg-gray-300 rounded w-1/2"></div>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-gray-300 h-64 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!agent) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <div className="mb-8">
          <svg className="mx-auto h-24 w-24 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-gray-800 mb-4">Không tìm thấy môi giới</h1>
        <p className="text-gray-600 mb-6">Môi giới bạn đang tìm kiếm không tồn tại.</p>
        <Link
          to="/agents"
          className="inline-flex items-center px-6 py-3 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 transition-colors"
        >
          Về trang môi giới
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <nav className="flex items-center space-x-2 text-sm text-gray-600 mb-8">
        <Link to="/" className="hover:text-red-600">Trang chủ</Link>
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
        <Link to="/agents" className="hover:text-red-600">Môi giới</Link>
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
        <span className="text-gray-800">{agent.fullName}</span>
      </nav>

      {/* Agent Header */}
      <div className="bg-white rounded-lg shadow-md p-8 mb-8">
        <div className="flex flex-col md:flex-row items-start space-y-6 md:space-y-0 md:space-x-8">
          <div className="flex-shrink-0">
            <img
              src={agent.avatar || '/api/placeholder/150/150'}
              alt={agent.fullName}
              className="w-32 h-32 md:w-40 md:h-40 rounded-full object-cover border-4 border-white shadow-lg"
            />
            {agent.isOnline && (
              <div className="absolute -mt-6 ml-28 md:ml-32 w-4 h-4 bg-green-500 border-2 border-white rounded-full"></div>
            )}
          </div>

          <div className="flex-1">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
              <div>
                <h1 className="text-3xl font-bold text-gray-800 mb-2">{agent.fullName}</h1>
                <div className="flex items-center space-x-4 text-gray-600 mb-2">
                  {agent.isVerified && (
                    <span className="flex items-center text-green-600">
                      <svg className="w-5 h-5 mr-1" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      Đã xác minh
                    </span>
                  )}
                  <span>{agent.experience} năm kinh nghiệm</span>
                  <span>{agent.licenseNumber}</span>
                </div>
                
                <div className="flex items-center space-x-6 mb-4">
                  <div className="flex items-center">
                    <div className="flex text-yellow-400">
                      {[...Array(5)].map((_, i) => (
                        <svg key={i} className={`w-5 h-5 ${i < Math.floor(agent.rating) ? 'fill-current' : 'text-gray-300'}`} viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      ))}
                    </div>
                    <span className="ml-2 text-gray-600">
                      {agent.rating.toFixed(1)} ({agent.reviewCount} đánh giá)
                    </span>
                  </div>
                  
                  <div className="text-gray-600">
                    <span className="font-semibold">{agent.totalSales}</span> giao dịch thành công
                  </div>
                </div>
              </div>

              <div className="flex flex-col space-y-2">
                <button className="bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition-colors font-medium">
                  Liên hệ ngay
                </button>
                <button className="border border-gray-300 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-50 transition-colors font-medium">
                  Lưu môi giới
                </button>
              </div>
            </div>

            {/* Contact Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div className="flex items-center text-gray-600">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                {agent.phoneNumber}
              </div>
              
              <div className="flex items-center text-gray-600">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                {agent.email}
              </div>
            </div>

            {/* Specialties */}
            <div className="mb-4">
              <h3 className="text-sm font-medium text-gray-700 mb-2">Chuyên môn:</h3>
              <div className="flex flex-wrap gap-2">
                {agent.specialties.map((specialty: string, index: number) => (
                  <span key={index} className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm">
                    {specialty}
                  </span>
                ))}
              </div>
            </div>

            {/* Working Areas */}
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-2">Khu vực hoạt động:</h3>
              <div className="flex flex-wrap gap-2">
                {agent.workingAreas.map((area: string, index: number) => (
                  <span key={index} className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                    {area}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 mb-6 bg-gray-100 p-1 rounded-lg w-fit">
        {[
          { key: 'about', label: t('agents.introduction') },
          { key: 'properties', label: `Tin đăng (${properties.length})` },
          { key: 'reviews', label: `Đánh giá (${agent.reviewCount})` },
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as any)}
            className={`px-6 py-3 rounded-md text-sm font-medium transition-colors ${
              activeTab === tab.key
                ? 'bg-white text-red-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === 'about' && (
        <div className="bg-white rounded-lg shadow-md p-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-6">Giới thiệu về {agent.fullName}</h2>
          
          <div className="prose max-w-none mb-8">
            <p className="text-gray-700 leading-relaxed">
              {agent.description || `${agent.fullName} là một môi giới bất động sản có kinh nghiệm ${agent.experience} năm trong ngành. Với chuyên môn sâu về các loại hình bất động sản và hiểu biết thấu đáo về thị trường, tôi cam kết mang đến cho khách hàng những dịch vụ tư vấn và hỗ trợ tốt nhất.`}
            </p>
          </div>

          {agent.achievements.length > 0 && (
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Thành tích</h3>
              <ul className="space-y-2">
                {agent.achievements.map((achievement: string, index: number) => (
                  <li key={index} className="flex items-start text-gray-700">
                    <svg className="w-5 h-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    {achievement}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {agent.agency && (
            <div className="border-t border-gray-200 pt-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Công ty</h3>
              <div className="flex items-center space-x-4">
                {agent.agency.logoUrl && (
                  <img
                    src={agent.agency.logoUrl}
                    alt={agent.agency.name}
                    className="w-16 h-16 object-contain"
                  />
                )}
                <div>
                  <h4 className="font-semibold text-gray-800">{agent.agency.name}</h4>
                  {agent.agency.address && (
                    <p className="text-gray-600">{agent.agency.address}</p>
                  )}
                  {agent.agency.phoneNumber && (
                    <p className="text-gray-600">{agent.agency.phoneNumber}</p>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === 'properties' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {properties.map((property: any) => (
            <div key={property.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
              <div className="relative">
                <img
                  src={getImageUrl(property.propertyImages?.[0]?.imageUrl) || getImagePlaceholder(400, 192)}
                  alt={property.title}
                  className="w-full h-48 object-cover"
                />
                <div className="absolute top-3 left-3 bg-red-600 text-white px-2 py-1 rounded text-sm font-medium">
                  {property.propertyType}
                </div>
              </div>
              
              <div className="p-4">
                <h3 className="font-semibold text-lg text-gray-800 mb-2 line-clamp-2">
                  {property.title}
                </h3>
                
                <div className="flex items-center text-gray-600 mb-2">
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span className="text-sm">{property.address}</span>
                </div>
                
                <div className="flex items-center justify-between mb-3">
                  <div className="text-red-600 font-bold text-lg">
                    {property.price?.toLocaleString('vi-VN')} tỷ
                  </div>
                  <div className="text-sm text-gray-500">
                    {property.area} m²
                  </div>
                </div>
                
                <div className="flex items-center justify-between text-sm text-gray-600 mb-4">
                  <span>{property.propertyDetails?.[0]?.bedrooms || 0} PN</span>
                  <span>{property.propertyDetails?.[0]?.bathrooms || 0} WC</span>
                  <span>Tầng {property.propertyDetails?.[0]?.floors || 1}</span>
                </div>
                
                <div className="flex gap-2">
                  <Link
                    to={`/properties/${property.id}`}
                    className="flex-1 bg-red-600 text-white text-center py-2 px-4 rounded-lg hover:bg-red-700 transition-colors text-sm font-medium"
                  >
                    Xem chi tiết
                  </Link>
                  <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium">
                    Liên hệ
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'reviews' && (
        <div className="bg-white rounded-lg shadow-md p-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-6">
            Đánh giá từ khách hàng ({reviews.length || agent.reviewCount})
          </h2>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-1">
              <div className="bg-gray-50 rounded-xl p-5 border border-gray-100 h-full">
                <h3 className="font-semibold text-gray-900 mb-4 text-center">Biểu đồ Kỹ năng</h3>
                {reviews.length > 0 ? (
                  <AgentReviewRadar 
                    professionalRating={reviews.reduce((acc, r) => acc + r.professionalRating, 0) / reviews.length}
                    responsivenessRating={reviews.reduce((acc, r) => acc + r.responsivenessRating, 0) / reviews.length}
                    marketKnowledgeRating={reviews.reduce((acc, r) => acc + r.marketKnowledgeRating, 0) / reviews.length}
                  />
                ) : (
                  <div className="flex items-center justify-center h-64 text-sm text-gray-400">
                    Chưa có đủ dữ liệu
                  </div>
                )}
              </div>
            </div>

            <div className="lg:col-span-2 space-y-8">
              <div className="border border-gray-200 rounded-xl p-5 bg-gray-50/50">
                <h3 className="text-base font-semibold text-gray-900 mb-4">Bạn đã làm việc với môi giới này?</h3>
                {!isAuthenticated ? (
                  <p className="text-sm text-gray-600">
                    <button type="button" onClick={() => navigate('/login')} className="text-red-600 font-medium hover:underline">
                      Đăng nhập
                    </button>{' '}
                    để gửi đánh giá đa chiều.
                  </p>
                ) : (
                  <AgentReviewForm 
                    agentId={id!} 
                    onSuccess={() => {
                      agentReviewApi.getAgentReviews(id!)
                        .then(res => setReviews(res.data))
                        .catch(console.error);
                    }} 
                  />
                )}
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Nhận xét chi tiết</h3>
                {reviews.length === 0 ? (
                  <p className="text-sm text-gray-500 py-4 text-center border-2 border-dashed border-gray-200 rounded-lg">
                    Chưa có bài đánh giá nào. Hãy là người đầu tiên!
                  </p>
                ) : (
                  <div className="space-y-4">
                    {reviews.map(review => (
                      <div key={review.id} className="p-4 border border-gray-100 rounded-xl bg-white shadow-sm">
                        <div className="flex items-center justify-between mb-2">
                          <div className="font-medium text-gray-900">Người dùng ẩn danh</div>
                          <div className="text-xs text-gray-500">{new Date(review.createdAt).toLocaleDateString('vi-VN')}</div>
                        </div>
                        <div className="flex items-center gap-1 text-amber-400 mb-3">
                          {[1,2,3,4,5].map(s => (
                            <Star key={s} className={`w-4 h-4 \${s <= review.averageRating ? 'fill-current' : 'text-gray-200'}`} />
                          ))}
                          <span className="text-sm text-gray-600 ml-1 font-medium">{review.averageRating.toFixed(1)}/5</span>
                        </div>
                        {review.comment && (
                          <p className="text-gray-700 text-sm mt-2 p-3 bg-gray-50 rounded-lg italic">"{review.comment}"</p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AgentDetailPage;