import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  Search, Plus, Edit2, Trash2, Eye, Download,
  Briefcase, Star, MapPin, Phone, Mail, Award
} from 'lucide-react';
import { agentAPI } from '../../api/agent';
import { getImageUrl, getAvatarPlaceholder } from '../../utils/imageUtils';
import api from '../../api/index';
import toast from '../../utils/toast';

const AgentManagement: React.FC = () => {
  const { t } = useTranslation();
  const [agents, setAgents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSpecialty, setFilterSpecialty] = useState('ALL');
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  useEffect(() => {
    fetchAgents();
  }, [currentPage, filterSpecialty]);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchTerm) {
        setCurrentPage(0);
        fetchAgents();
      } else {
        fetchAgents();
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  const fetchAgents = async () => {
    try {
      setLoading(true);
      const response = await agentAPI.getAll({ page: currentPage, size: 20 });
      


      // Handle both Page format and List format
      let agentsList = [];
      if (response?.content) {
        // Page format
        agentsList = response.content;
      } else if (Array.isArray(response)) {
        // List format (backend returns List<Agent>)
        agentsList = response;
      } else if (response?.data) {
        // Nested data
        agentsList = Array.isArray(response.data) ? response.data : (response.data.content || []);
      }

      // Fetch user info for each agent (since user is @JsonIgnore in backend)
      const agentsWithUserInfo = await Promise.all(
        agentsList.map(async (agent: any) => {
          let userInfo: any = null;
          
          // Try to get user info from public endpoint
          if (agent.userId) {
            try {
              const userResponse = await api.get(`/users/${agent.userId}/public`);
              userInfo = userResponse.data;
            } catch (error) {
              console.debug(`Could not fetch user info for agent ${agent.id}:`, error);
            }
          }

          // Map agent data to ensure correct field names
          const mappedAgent = {
            ...agent,
            // Map user fields
            fullName: agent.fullName || userInfo?.fullName || agent.user?.fullName || 'N/A',
            email: agent.email || userInfo?.email || agent.user?.email || 'N/A',
            phoneNumber: agent.phoneNumber || agent.phone || userInfo?.phone || agent.user?.phone || 'N/A',
            avatarUrl: agent.avatarUrl || userInfo?.avatarUrl || agent.user?.avatar || agent.user?.profile?.avatarUrl,
            // Map location from user profile address
            city: agent.city || userInfo?.address || agent.user?.userProfile?.address || agent.location?.city || agent.user?.location?.city || 'N/A',
            location: userInfo?.address || agent.user?.userProfile?.address || agent.location?.address || 'N/A',
            // Map agent-specific fields
            specialty: agent.specialty || agent.specialization || 'Real Estate Agent',
            rating: agent.rating || agent.ratingAverage || agent.averageRating || 0,
            totalReviews: agent.totalReviews || agent.ratingCount || agent.reviewCount || 0,
            // Map stats - use direct field names from Agent entity
            totalListings: agent.totalProperties !== undefined ? agent.totalProperties : (agent.totalListings || agent.propertyCount || 0),
            totalDeals: agent.totalSales !== undefined ? agent.totalSales : (agent.totalDeals || agent.dealCount || 0),
            experienceYears: agent.experienceYears || agent.experience || 0,
            isVerified: agent.isVerified || agent.verified || false
          };
          
          // Debug log for each agent

          
          return mappedAgent;
        })
      );

      // Filter by search term
      let filteredAgents = agentsWithUserInfo;
      if (searchTerm) {
        filteredAgents = filteredAgents.filter((agent: any) =>
          agent.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          agent.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          agent.phoneNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          agent.specialty?.toLowerCase().includes(searchTerm.toLowerCase())
        );
      }

      // Filter by specialty
      if (filterSpecialty !== 'ALL') {
        filteredAgents = filteredAgents.filter((agent: any) =>
          agent.specialty?.toUpperCase() === filterSpecialty ||
          agent.specialization?.toUpperCase() === filterSpecialty
        );
      }

      // Pagination (client-side if backend returns list)
      const totalItems = filteredAgents.length;
      const itemsPerPage = 20;
      const startIndex = currentPage * itemsPerPage;
      const endIndex = startIndex + itemsPerPage;
      const paginatedAgents = filteredAgents.slice(startIndex, endIndex);



      setAgents(paginatedAgents);
      setTotalPages(response?.totalPages || Math.ceil(totalItems / itemsPerPage) || 1);
    } catch (error) {
      toast.error('Không thể tải danh sách đại lý');
      setAgents([]);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Xóa đại lý này?')) return;
    try {
      await agentAPI.deactivate(id);
      toast.success('Đã xóa đại lý');
      fetchAgents();
    } catch (error) {
      toast.error('Không thể xóa đại lý');
    }
  };

  const getRatingStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star 
        key={i} 
        className={`w-4 h-4 ${i < rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`} 
      />
    ));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t('admin.menu.agents')}</h1>
          <p className="text-sm text-gray-500 mt-1">Manage all agents in the system</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
          <Plus className="w-4 h-4" />
          Add Agent
        </button>
      </div>

      {/* Toolbar */}
      <div className="bg-white rounded-xl shadow-md p-4">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex-1 min-w-[300px]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search agents..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <select
            value={filterSpecialty}
            onChange={(e) => setFilterSpecialty(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="ALL">All Specialties</option>
            <option value="APARTMENT">Apartment</option>
            <option value="HOUSE">House</option>
            <option value="VILLA">Villa</option>
            <option value="LAND">Land</option>
          </select>

          <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
            <Download className="w-4 h-4" />
            Export
          </button>
        </div>
      </div>

      {/* Agents Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {loading ? (
          <div className="col-span-full py-12 text-center text-gray-500">
            {t('common.loading')}
          </div>
        ) : agents.length === 0 ? (
          <div className="col-span-full py-12 text-center text-gray-500">
            No agents found
          </div>
        ) : (
          agents.map((agent) => (
            <div key={agent.id} className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all overflow-hidden group">
              {/* Agent Image */}
              <div className="relative h-48 bg-gradient-to-br from-blue-500 to-purple-600">
                <img
                  src={getImageUrl(agent.avatarUrl) || getAvatarPlaceholder(400)}
                  alt={agent.fullName || 'Agent'}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = getAvatarPlaceholder(400);
                  }}
                />
                <div className="absolute top-3 right-3 flex gap-2">
                  {agent.isVerified && (
                    <div className="px-2 py-1 bg-green-500 text-white text-xs font-semibold rounded-full flex items-center gap-1">
                      <Award className="w-3 h-3" />
                      Verified
                    </div>
                  )}
                </div>
              </div>

              {/* Agent Info */}
              <div className="p-4">
                <h3 className="font-bold text-lg text-gray-900 mb-1">{agent.fullName}</h3>
                
                {/* Rating */}
                <div className="flex items-center gap-2 mb-2">
                  <div className="flex">{getRatingStars(Math.round(agent.rating || 0))}</div>
                  <span className="text-sm text-gray-600">({agent.totalReviews || 0})</span>
                </div>

                {/* Specialty */}
                <div className="flex items-center gap-2 mb-2 text-sm text-gray-600">
                  <Briefcase className="w-4 h-4" />
                  {agent.specialty || 'Real Estate Agent'}
                </div>

                {/* Location */}
                <div className="flex items-center gap-2 mb-2 text-sm text-gray-600">
                  <MapPin className="w-4 h-4" />
                  <span className="line-clamp-1">{agent.location || agent.city || 'N/A'}</span>
                </div>

                {/* Contact */}
                <div className="space-y-1 mb-4">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Phone className="w-4 h-4 flex-shrink-0" />
                    <span className="line-clamp-1">{agent.phoneNumber || 'N/A'}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Mail className="w-4 h-4 flex-shrink-0" />
                    <span className="line-clamp-1">{agent.email || 'N/A'}</span>
                  </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-2 mb-4 p-3 bg-gray-50 rounded-lg">
                  <div className="text-center">
                    <div className="text-lg font-bold text-gray-900">{agent.totalListings || 0}</div>
                    <div className="text-xs text-gray-500">Listings</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-gray-900">{agent.totalDeals || 0}</div>
                    <div className="text-xs text-gray-500">Deals</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-gray-900">{agent.experienceYears || 0}</div>
                    <div className="text-xs text-gray-500">Years</div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <button
                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors text-sm font-medium"
                  >
                    <Eye className="w-4 h-4" />
                    View
                  </button>
                  <button
                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors text-sm font-medium"
                  >
                    <Edit2 className="w-4 h-4" />
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(agent.id)}
                    className="p-2 text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={() => setCurrentPage(p => Math.max(0, p - 1))}
            disabled={currentPage === 0}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
          >
            Previous
          </button>
          <span className="px-4 py-2 text-sm font-medium">
            {currentPage + 1} / {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage(p => Math.min(totalPages - 1, p + 1))}
            disabled={currentPage >= totalPages - 1}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default AgentManagement;
