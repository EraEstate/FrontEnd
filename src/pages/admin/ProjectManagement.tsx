import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  Search, Plus, Edit2, Trash2, Eye, Download,
  Building2, MapPin, Calendar, Percent, Users
} from 'lucide-react';
import { projectAPI } from '../../api/project';
import { getImageUrl, getImagePlaceholder } from '../../utils/imageUtils';
import toast from '../../utils/toast';

const ProjectManagement: React.FC = () => {
  const { t } = useTranslation();
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  useEffect(() => {
    fetchProjects();
  }, [currentPage, filterStatus]);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchTerm || filterStatus !== 'ALL') {
        setCurrentPage(0); // Reset to first page when search/filter changes
        fetchProjects();
      } else {
        fetchProjects();
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      let response;

      if (filterStatus !== 'ALL') {
        // Fetch by status
        response = await projectAPI.getByStatus(filterStatus, currentPage, 12);
      } else if (searchTerm) {
        // Search projects
        response = await projectAPI.search(searchTerm, currentPage, 12);
      } else {
        // Get all projects
        response = await projectAPI.getAll({ 
          page: currentPage, 
          size: 12,
          sortBy: 'createdAt',
          sortDir: 'desc'
        });
      }



      // Handle both Page format and array format
      let projectsList = [];
      if (response?.content) {
        projectsList = response.content;
      } else if (Array.isArray(response)) {
        projectsList = response;
      } else if (response?.data?.content) {
        projectsList = response.data.content;
      }

      // Map project data to ensure correct field names
      projectsList = projectsList.map((project: any) => ({
        ...project,
        // Map status fields
        status: project.status || project.projectStatus || 'ACTIVE',
        // Map image fields
        mainImageUrl: project.mainImageUrl || project.featuredImageUrl || project.imageUrl,
        imageUrls: project.imageUrls || (project.images ? project.images.map((img: any) => img.imageUrl || img.url) : []),
        // Map location
        location: project.location || project.address || (project.province ? `${project.district?.name || ''} ${project.province?.name || ''}`.trim() : 'N/A'),
        // Map price
        priceFrom: project.priceFrom || project.minPrice || 0,
        priceTo: project.priceTo || project.maxPrice || 0,
        // Map other fields
        completionYear: project.completionYear || project.completedYear || 'TBD',
        totalUnits: project.totalUnits || project.units || 0,
        progress: project.progress || project.constructionProgress || 0
      }));

      // Filter by search term if needed (client-side filtering for status filter)
      if (searchTerm && filterStatus !== 'ALL') {
        projectsList = projectsList.filter((project: any) =>
          project.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          project.location?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          project.developer?.toLowerCase().includes(searchTerm.toLowerCase())
        );
      }



      setProjects(projectsList);
      setTotalPages(response?.totalPages || response?.data?.totalPages || Math.ceil(projectsList.length / 12) || 1);
    } catch (error) {
      toast.error('Không thể tải danh sách dự án');
      setProjects([]);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Xóa dự án này?')) return;
    try {
      await projectAPI.delete(id);
      toast.success('Đã xóa dự án');
      fetchProjects();
    } catch (error) {
      toast.error('Không thể xóa dự án');
    }
  };

  const getStatusBadge = (status: string) => {
    const badges: Record<string, string> = {
      PLANNING: 'bg-blue-100 text-blue-800',
      ONGOING: 'bg-green-100 text-green-800',
      ACTIVE: 'bg-green-100 text-green-800',
      COMPLETED: 'bg-purple-100 text-purple-800',
      PAUSED: 'bg-yellow-100 text-yellow-800',
      INACTIVE: 'bg-gray-100 text-gray-800'
    };
    return badges[status] || 'bg-gray-100 text-gray-800';
  };

  const handleFilterChange = (newStatus: string) => {
    setFilterStatus(newStatus);
    setCurrentPage(0); // Reset to first page when filter changes
  };

  const formatPrice = (price: number) => {
    if (price >= 1000000000) return `${(price / 1000000000).toFixed(1)}B`;
    if (price >= 1000000) return `${(price / 1000000).toFixed(1)}M`;
    if (price >= 1000) return `${(price / 1000).toFixed(1)}K`;
    return price.toString();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">{t('admin.menu.projects')}</h1>
          <p className="text-sm text-gray-500 mt-1">Manage real estate projects</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
          <Plus className="w-4 h-4" />
          Add Project
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
                placeholder="Search projects..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <select
            value={filterStatus}
            onChange={(e) => handleFilterChange(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="ALL">All Status</option>
            <option value="PLANNING">Planning</option>
            <option value="ONGOING">Ongoing</option>
            <option value="ACTIVE">Active</option>
            <option value="COMPLETED">Completed</option>
            <option value="PAUSED">Paused</option>
            <option value="INACTIVE">Inactive</option>
          </select>

          <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
            <Download className="w-4 h-4" />
            Export
          </button>
        </div>
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full py-12 text-center text-gray-500">
            {t('common.loading')}
          </div>
        ) : projects.length === 0 ? (
          <div className="col-span-full py-12 text-center text-gray-500">
            No projects found
          </div>
        ) : (
          projects.map((project) => (
            <div key={project.id} className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all overflow-hidden group">
              {/* Project Image */}
              <div className="relative h-56 bg-gray-200 overflow-hidden">
                <img
                  src={getImageUrl(project.mainImageUrl || project.imageUrls?.[0] || project.images?.[0]?.imageUrl) || getImagePlaceholder(400, 224)}
                  alt={project.name || 'Project'}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = getImagePlaceholder(400, 224);
                  }}
                />
                <div className="absolute top-3 right-3">
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusBadge(project.status)}`}>
                    {project.status}
                  </span>
                </div>
                <div className="absolute bottom-3 left-3 bg-white/90 backdrop-blur-sm px-3 py-2 rounded-lg">
                  <div className="text-xs text-gray-600">Starting from</div>
                  <div className="text-lg font-bold text-gray-900">${formatPrice(project.priceFrom || 0)}</div>
                </div>
              </div>

              {/* Project Info */}
              <div className="p-5">
                <h3 className="font-semibold text-lg text-gray-900 mb-2 line-clamp-1 group-hover:text-blue-600 transition-colors">
                  {project.name}
                </h3>

                {/* Location */}
                <div className="flex items-center gap-2 mb-3 text-sm text-gray-600">
                  <MapPin className="w-4 h-4 flex-shrink-0" />
                  <span className="line-clamp-1">{project.location || 'N/A'}</span>
                </div>

                {/* Developer */}
                <div className="flex items-center gap-2 mb-3 text-sm text-gray-600">
                  <Building2 className="w-4 h-4 flex-shrink-0" />
                  <span className="line-clamp-1">{project.developer || 'N/A'}</span>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-3 gap-2 mb-4 p-3 bg-gray-50 rounded-lg">
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1 mb-1">
                      <Calendar className="w-3 h-3 text-gray-400" />
                    </div>
                    <div className="text-xs text-gray-900 font-semibold">{project.completionYear || 'TBD'}</div>
                    <div className="text-xs text-gray-500">Year</div>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1 mb-1">
                      <Building2 className="w-3 h-3 text-gray-400" />
                    </div>
                    <div className="text-xs text-gray-900 font-semibold">{project.totalUnits || 0}</div>
                    <div className="text-xs text-gray-500">Units</div>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1 mb-1">
                      <Percent className="w-3 h-3 text-gray-400" />
                    </div>
                    <div className="text-xs text-gray-900 font-semibold">{project.progress || 0}%</div>
                    <div className="text-xs text-gray-500">Progress</div>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-gray-600">Construction Progress</span>
                    <span className="text-xs font-semibold text-gray-900">{project.progress || 0}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full transition-all"
                      style={{ width: `${project.progress || 0}%` }}
                    />
                  </div>
                </div>

                {/* Amenities Count */}
                {project.amenities && project.amenities.length > 0 && (
                  <div className="flex items-center gap-2 mb-4 text-sm text-gray-600">
                    <Users className="w-4 h-4" />
                    {project.amenities.length} Amenities
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-2 pt-4 border-t border-gray-100">
                  <button className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors text-sm font-medium">
                    <Eye className="w-4 h-4" />
                    View
                  </button>
                  <button className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors text-sm font-medium">
                    <Edit2 className="w-4 h-4" />
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(project.id)}
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

export default ProjectManagement;
