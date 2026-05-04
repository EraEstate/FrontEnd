import { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Plus, 
  Edit3, 
  Trash2, 
  Eye, 
  MapPin, 
  DollarSign,
  TrendingUp,
  Home,
  BarChart3,
  Grid3x3,
  List,
  ClipboardList,
  CheckCircle2,
  Circle,
  CircleDot,
  Sparkles,
  X,
  Loader2,
  AlertTriangle,
  ShieldCheck,
  ShieldAlert
} from 'lucide-react';
import { useMyProperties } from '../api/hooks';
import type { Property } from '../types';
import { useTranslation } from 'react-i18next';
import { getImageUrl, getImagePlaceholder } from '../utils/imageUtils';
import { aiAgentAPI, type FullAnalysis } from '../api/aiAgent';
import toast from '../utils/toast';

const MyPropertiesPage = () => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<'all' | 'available' | 'sold' | 'rented'>('all');
  const [currentPage] = useState(0);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [analysisData, setAnalysisData] = useState<FullAnalysis | null>(null);
  const [analysisLoading, setAnalysisLoading] = useState<string | null>(null);
  const [showAnalysis, setShowAnalysis] = useState(false);

  // API Hook
  const { data: propertiesData, loading } = useMyProperties(currentPage, 50);

  // Handle delete property
  // const handleDeleteProperty = async (propertyId: number) => {
  //   if (window.confirm('Bạn có chắc muốn xóa bất động sản này?')) {
  //     try {
  //       await propertyAPI.delete(propertyId.toString());
  //       refetch();
  //       alert('Xóa thành công!');
  //     } catch (error) {
  //       console.error('Error deleting property:', error);
  //       alert('Có lỗi xảy ra khi xóa!');
  //     }
  //   }
  // };

  const properties = propertiesData?.content || [];

  const filteredProperties = properties.filter((property: Property) => {
    if (activeTab === 'all') return true;
    if (activeTab === 'available') return property.status === 'AVAILABLE';
    if (activeTab === 'sold') return property.status === 'SOLD';
    if (activeTab === 'rented') return property.status === 'RENTED';
    return true;
  });

  const getStatusBadge = (status: string) => {
    const badges = {
      'AVAILABLE': { color: 'bg-emerald-100 text-emerald-700 border-emerald-200', text: t('myProperties.selling'), icon: CheckCircle2 },
      'SOLD': { color: 'bg-gray-100 text-gray-700 border-gray-200', text: t('myProperties.sold'), icon: Circle },
      'RENTED': { color: 'bg-blue-100 text-blue-700 border-blue-200', text: t('myProperties.rented'), icon: CircleDot },
      'PENDING': { color: 'bg-amber-100 text-amber-700 border-amber-200', text: t('myProperties.pending'), icon: TrendingUp },
    };
    return badges[status as keyof typeof badges] || badges.AVAILABLE;
  };

  const formatPrice = (price: number) => {
    if (price >= 1000000000) return `${(price / 1000000000).toFixed(1)} ${t('common.billion')}`;
    if (price >= 1000000) return `${(price / 1000000).toFixed(0)} ${t('common.million')}`;
    return price.toLocaleString('vi-VN');
  };

  const stats = [
    { label: t('myProperties.total'), value: properties.length, icon: Home, color: 'text-blue-600 bg-blue-50' },
    { label: t('myProperties.selling'), value: properties.filter((p: Property) => p.status === 'AVAILABLE').length, icon: TrendingUp, color: 'text-green-600 bg-green-50' },
    { label: t('myProperties.sold'), value: properties.filter((p: Property) => p.status === 'SOLD').length, icon: BarChart3, color: 'text-gray-600 bg-gray-50' },
    { label: t('myProperties.rented'), value: properties.filter((p: Property) => p.status === 'RENTED').length, icon: DollarSign, color: 'text-purple-600 bg-purple-50' },
  ];

  const handleAnalyze = async (propertyId: string) => {
    setAnalysisLoading(propertyId);
    try {
      const data = await aiAgentAPI.fullAnalysis(propertyId);
      setAnalysisData(data);
      setShowAnalysis(true);
    } catch {
      toast.error('Không thể phân tích tin đăng. Vui lòng thử lại.');
    } finally {
      setAnalysisLoading(null);
    }
  };

  const getGradeColor = (grade: string) => {
    const colors: Record<string, string> = {
      'A': 'bg-emerald-100 text-emerald-700 border-emerald-300',
      'B': 'bg-blue-100 text-blue-700 border-blue-300',
      'C': 'bg-amber-100 text-amber-700 border-amber-300',
      'D': 'bg-orange-100 text-orange-700 border-orange-300',
      'F': 'bg-red-100 text-red-700 border-red-300',
    };
    return colors[grade] || colors['C'];
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 mt-16">
      {/* Modern Header with Stats */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
            <div className="flex items-center gap-3">
              <ClipboardList className="h-8 w-8 text-red-600" />
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">{t('myProperties.title')}</h1>
                <p className="text-gray-600">{t('myProperties.subtitle')}</p>
              </div>
            </div>
            <div className="mt-4 md:mt-0 flex items-center gap-3">
              <Link
                to="/rental-management"
                className="inline-flex items-center space-x-2 bg-white text-emerald-600 border border-emerald-200 hover:bg-emerald-50 px-5 py-3 rounded-xl font-semibold transition-all duration-200 shadow-sm hover:shadow-md"
              >
                <DollarSign className="h-5 w-5" />
                <span>Quản lý dòng tiền</span>
              </Link>
              <Link
                to="/post-property"
                className="inline-flex items-center space-x-2 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                <Plus className="h-5 w-5" />
                <span>{t('myProperties.newListing')}</span>
              </Link>
            </div>
          </div>

          {/* Stats Cards */}
          {!loading && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {stats.map((stat, index) => (
                <div key={index} className="bg-gradient-to-br from-white to-gray-50 rounded-xl p-4 border border-gray-200 hover:shadow-md transition-shadow">
                  <div className="flex items-center space-x-3">
                    <div className={`p-3 rounded-lg ${stat.color}`}>
                      <stat.icon className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                      <p className="text-xs text-gray-600">{stat.label}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tabs & View Toggle */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
          {/* Tabs */}
          <div className="flex flex-wrap gap-2">
            {[
              { key: 'all', label: t('myProperties.all'), icon: Home, count: properties.length },
              { key: 'available', label: t('myProperties.selling'), icon: TrendingUp, count: properties.filter((p: Property) => p.status === 'AVAILABLE').length },
              { key: 'sold', label: t('myProperties.sold'), icon: BarChart3, count: properties.filter((p: Property) => p.status === 'SOLD').length },
              { key: 'rented', label: t('myProperties.rented'), icon: DollarSign, count: properties.filter((p: Property) => p.status === 'RENTED').length },
            ].map(tab => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key as any)}
                  className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${
                    activeTab === tab.key
                      ? 'bg-red-600 text-white shadow-lg scale-105'
                      : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {tab.label} <span className="opacity-75">({tab.count})</span>
                </button>
              );
            })}
          </div>

          {/* View Mode Toggle */}
          <div className="flex bg-white rounded-xl border border-gray-200 p-1">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-lg transition-all duration-200 ${
                viewMode === 'grid' ? 'bg-red-600 text-white' : 'text-gray-600 hover:bg-gray-100'
              }`}
              title={t('myProperties.gridView')}
            >
              <Grid3x3 className="h-5 w-5" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-lg transition-all duration-200 ${
                viewMode === 'list' ? 'bg-red-600 text-white' : 'text-gray-600 hover:bg-gray-100'
              }`}
              title={t('myProperties.listView')}
            >
              <List className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-4'}>
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl overflow-hidden shadow-sm animate-pulse">
                <div className="h-48 bg-gray-300"></div>
                <div className="p-6 space-y-3">
                  <div className="h-4 bg-gray-300 rounded w-3/4"></div>
                  <div className="h-4 bg-gray-300 rounded w-1/2"></div>
                  <div className="h-10 bg-gray-300 rounded"></div>
                </div>
              </div>
            ))}
          </div>
        ) : filteredProperties.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm p-12 text-center">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Home className="h-12 w-12 text-gray-400" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">
              {activeTab === 'all' ? t('myProperties.noListings') : t('myProperties.noListingsByStatus', { status: getStatusBadge(activeTab.toUpperCase()).text.toLowerCase() })}
            </h3>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              {activeTab === 'all' 
                ? t('myProperties.emptyDescription')
                : t('myProperties.noListingsInStatus')
              }
            </p>
            {activeTab === 'all' && (
              <Link 
                to="/post-property" 
                className="inline-flex items-center space-x-2 px-8 py-4 bg-gradient-to-r from-red-600 to-red-700 text-white font-bold rounded-xl hover:shadow-xl transition-all duration-200"
              >
                <Plus className="h-5 w-5" />
                <span>{t('myProperties.postNow')}</span>
              </Link>
            )}
          </div>
        ) : (
          <div className={viewMode === 'grid' 
            ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' 
            : 'space-y-4'
          }>
            {filteredProperties.map((property: Property) => {
              const badge = getStatusBadge(property.status);
              const imageUrl = getImageUrl(property.propertyImages?.[0]?.imageUrl);
              
              return viewMode === 'grid' ? (
                /* Grid View - Card hiện đại */
                <div key={property.id} className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-300 border border-gray-100">
                  <div className="relative h-56 overflow-hidden bg-gray-100">
                    <img
                      src={imageUrl || getImagePlaceholder(400, 300)}
                      alt={property.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    {/* Status Badge */}
                    <div className="absolute top-4 left-4">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border ${badge.color}`}>
                        {badge.icon && <badge.icon className="h-3 w-3" />}
                        {badge.text}
                      </span>
                    </div>
                    {/* Actions */}
                    <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <Link
                        to={`/edit-property/${property.id}`}
                        className="p-2.5 bg-white/95 backdrop-blur-sm rounded-xl hover:bg-white shadow-lg transition-all hover:scale-110"
                        title={t('myProperties.edit')}
                      >
                        <Edit3 className="h-4 w-4 text-blue-600" />
                      </Link>
                      <button 
                        className="p-2.5 bg-white/95 backdrop-blur-sm rounded-xl hover:bg-white shadow-lg transition-all hover:scale-110"
                        title={t('myProperties.delete')}
                      >
                        <Trash2 className="h-4 w-4 text-red-600" />
                      </button>
                    </div>
                    {/* Property Type */}
                    <div className="absolute bottom-4 left-4">
                      <span className="px-3 py-1.5 bg-black/70 backdrop-blur-sm text-white rounded-lg text-xs font-semibold">
                        {property.propertyType}
                      </span>
                    </div>
                  </div>
                  
                  <div className="p-5">
                    <h3 className="font-bold text-lg text-gray-900 mb-3 line-clamp-2 group-hover:text-red-600 transition-colors">
                      {property.title}
                    </h3>
                    
                    <div className="flex items-center text-gray-600 mb-4">
                      <MapPin className="h-4 w-4 mr-1.5 text-red-600" />
                      <span className="text-sm line-clamp-1">{property.address}</span>
                    </div>
                    
                    {/* Price & Area */}
                    <div className="flex items-center justify-between mb-4 pb-4 border-b border-gray-100">
                      <div>
                        <p className="text-xs text-gray-500 mb-1">{t('myProperties.price')}</p>
                        <p className="text-xl font-bold text-red-600">
                          {formatPrice(property.price)}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-gray-500 mb-1">{t('myProperties.area')}</p>
                        <p className="text-lg font-semibold text-gray-900">
                          {property.area} m²
                        </p>
                      </div>
                    </div>
                    
                    {/* Details */}
                    <div className="flex items-center justify-between text-sm text-gray-600 mb-4">
                      <div className="flex items-center space-x-1">
                        <Home className="h-4 w-4" />
                        <span className="font-medium">{property.propertyDetails?.[0]?.bedrooms || 0} PN</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <span className="font-medium">{property.propertyDetails?.[0]?.bathrooms || 0} WC</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <span className="font-medium">T.{property.propertyDetails?.[0]?.floors || 1}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Eye className="h-4 w-4" />
                        <span>0</span>
                      </div>
                    </div>
                    
                    {/* Actions */}
                    <div className="flex gap-2">
                      <Link
                        to={`/property/${property.id}`}
                        className="flex-1 bg-red-600 text-white text-center py-2.5 px-4 rounded-xl hover:bg-red-700 transition-colors text-sm font-semibold shadow-sm"
                      >
                        {t('myProperties.viewDetails')}
                      </Link>
                      <button 
                        onClick={() => handleAnalyze(String(property.id))}
                        disabled={analysisLoading === String(property.id)}
                        className="px-4 py-2.5 border-2 border-purple-200 text-purple-700 rounded-xl hover:border-purple-500 hover:bg-purple-50 transition-all text-sm font-semibold disabled:opacity-50"
                        title="AI Phan tich"
                      >
                        {analysisLoading === String(property.id) ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                      </button>
                      <button 
                        className="px-4 py-2.5 border-2 border-gray-200 text-gray-700 rounded-xl hover:border-red-600 hover:text-red-600 transition-all text-sm font-semibold"
                        title={t('myProperties.statistics')}
                      >
                        <BarChart3 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                /* List View - Compact */
                <div key={property.id} className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-100">
                  <div className="flex gap-6">
                    <div className="relative w-64 h-40 flex-shrink-0 rounded-xl overflow-hidden bg-gray-100">
                      <img
                        src={imageUrl || getImagePlaceholder(300, 200)}
                        alt={property.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <span className={`absolute top-3 left-3 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border ${badge.color}`}>
                        {badge.icon && <badge.icon className="h-3 w-3" />}
                        {badge.text}
                      </span>
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <h3 className="font-bold text-xl text-gray-900 mb-2 line-clamp-2">
                            {property.title}
                          </h3>
                          <div className="flex items-center text-gray-600 mb-3">
                            <MapPin className="h-4 w-4 mr-1.5 text-red-600" />
                            <span className="text-sm">{property.address}</span>
                          </div>
                        </div>
                        <div className="flex gap-2 ml-4">
                          <Link
                            to={`/edit-property/${property.id}`}
                            className="p-2.5 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-100 transition-colors"
                            title={t('myProperties.edit')}
                          >
                            <Edit3 className="h-4 w-4" />
                          </Link>
                          <button 
                            className="p-2.5 bg-red-50 text-red-600 rounded-xl hover:bg-red-100 transition-colors"
                            title={t('myProperties.delete')}
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-6 mb-4">
                        <div>
                          <p className="text-xs text-gray-500">{t('myProperties.price')}</p>
                          <p className="text-2xl font-bold text-red-600">{formatPrice(property.price)}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">{t('myProperties.area')}</p>
                          <p className="text-lg font-semibold text-gray-900">{property.area} m²</p>
                        </div>
                        <div className="flex items-center space-x-4 text-sm text-gray-600">
                          <span>{property.propertyDetails?.[0]?.bedrooms || 0} PN</span>
                          <span>{property.propertyDetails?.[0]?.bathrooms || 0} WC</span>
                          <span>T.{property.propertyDetails?.[0]?.floors || 1}</span>
                        </div>
                      </div>
                      
                      <div className="flex gap-3">
                        <Link
                          to={`/property/${property.id}`}
                          className="inline-flex items-center space-x-2 bg-red-600 text-white px-6 py-2.5 rounded-xl hover:bg-red-700 transition-colors text-sm font-semibold"
                        >
                          <Eye className="h-4 w-4" />
                          <span>{t('myProperties.viewDetails')}</span>
                        </Link>
                        <button className="inline-flex items-center space-x-2 px-5 py-2.5 border-2 border-gray-200 text-gray-700 rounded-xl hover:border-red-600 hover:text-red-600 transition-all text-sm font-semibold">
                          <BarChart3 className="h-4 w-4" />
                          <span>{t('myProperties.statistics')}</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* AI Analysis Modal */}
      {showAnalysis && analysisData && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[85vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-purple-100 rounded-xl">
                  <Sparkles className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <h3 className="font-bold text-lg text-gray-900">AI Phân tích</h3>
                  <p className="text-xs text-gray-500">Kết quả phân tích tự động</p>
                </div>
              </div>
              <button onClick={() => setShowAnalysis(false)} className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
                <X className="h-5 w-5 text-gray-500" />
              </button>
            </div>

            <div className="p-6 space-y-5">
              {/* Quality Score */}
              <div className="bg-gradient-to-br from-gray-50 to-white rounded-xl p-5 border border-gray-200">
                <div className="flex items-center justify-between mb-3">
                  <span className="font-semibold text-gray-800">Chất lượng tin đăng</span>
                  <span className={`px-3 py-1 rounded-full text-sm font-bold border ${getGradeColor(analysisData.quality.grade)}`}>
                    {analysisData.quality.grade} — {analysisData.quality.score}/100
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5 mb-3">
                  <div
                    className={`h-2.5 rounded-full transition-all duration-500 ${
                      analysisData.quality.score >= 80 ? 'bg-emerald-500' :
                      analysisData.quality.score >= 60 ? 'bg-amber-500' : 'bg-red-500'
                    }`}
                    style={{ width: `${analysisData.quality.score}%` }}
                  />
                </div>
                {analysisData.quality.issues.length > 0 && (
                  <div className="space-y-1.5 mb-2">
                    <p className="text-xs font-semibold text-red-600 flex items-center gap-1"><AlertTriangle className="h-3.5 w-3.5" /> Vấn đề:</p>
                    {analysisData.quality.issues.map((issue, i) => (
                      <p key={i} className="text-xs text-red-600 pl-5">• {issue}</p>
                    ))}
                  </div>
                )}
                {analysisData.quality.suggestions.length > 0 && (
                  <div className="space-y-1.5">
                    <p className="text-xs font-semibold text-blue-600 flex items-center gap-1"><Sparkles className="h-3.5 w-3.5" /> Gợi ý:</p>
                    {analysisData.quality.suggestions.map((s, i) => (
                      <p key={i} className="text-xs text-blue-600 pl-5">• {s}</p>
                    ))}
                  </div>
                )}
              </div>

              {/* Moderation */}
              <div className="bg-gradient-to-br from-gray-50 to-white rounded-xl p-5 border border-gray-200">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold text-gray-800">Kiểm duyệt nội dung</span>
                  <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-bold ${
                    analysisData.moderation.decision === 'APPROVED' ? 'bg-emerald-100 text-emerald-700' :
                    analysisData.moderation.decision === 'FLAGGED' ? 'bg-amber-100 text-amber-700' :
                    'bg-red-100 text-red-700'
                  }`}>
                    {analysisData.moderation.decision === 'APPROVED' && <ShieldCheck className="h-3.5 w-3.5" />}
                    {analysisData.moderation.decision === 'FLAGGED' && <AlertTriangle className="h-3.5 w-3.5" />}
                    {analysisData.moderation.decision === 'REJECTED' && <ShieldAlert className="h-3.5 w-3.5" />}
                    {analysisData.moderation.decision === 'APPROVED' ? 'Đạt' :
                     analysisData.moderation.decision === 'FLAGGED' ? 'Cần xem lại' : 'Vi phạm'}
                  </span>
                </div>
                {analysisData.moderation.flags.length > 0 && (
                  <div className="space-y-1 mt-2">
                    {analysisData.moderation.flags.map((f, i) => (
                      <p key={i} className="text-xs text-amber-700">⚠ {f}</p>
                    ))}
                  </div>
                )}
              </div>

              {/* Price Estimation */}
              {analysisData.priceEstimation.status === 'OK' && (
                <div className="bg-gradient-to-br from-gray-50 to-white rounded-xl p-5 border border-gray-200">
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-semibold text-gray-800">Ước tính giá thị trường</span>
                    <span className={`px-3 py-1 rounded-full text-sm font-bold ${
                      analysisData.priceEstimation.priceAssessment === 'HỢP LÝ' ? 'bg-emerald-100 text-emerald-700' :
                      analysisData.priceEstimation.priceAssessment === 'CAO' ? 'bg-red-100 text-red-700' :
                      'bg-blue-100 text-blue-700'
                    }`}>
                      {analysisData.priceEstimation.priceAssessment}
                    </span>
                  </div>
                  {analysisData.priceEstimation.estimatedPrice && (
                    <p className="text-sm text-gray-600">
                      Giá ước tính: <span className="font-bold text-gray-900">
                        {(analysisData.priceEstimation.estimatedPrice / 1000000000).toFixed(1)} tỷ
                      </span>
                    </p>
                  )}
                  {analysisData.priceEstimation.note && (
                    <p className="text-xs text-gray-500 mt-1">{analysisData.priceEstimation.note}</p>
                  )}
                  <p className="text-xs text-gray-400 mt-2">Dựa trên {analysisData.priceEstimation.sampleSize} BĐS tương tự</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyPropertiesPage;