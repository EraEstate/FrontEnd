import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  Search, Plus, Edit2, Trash2, Eye, Download,
  Building2, MapPin, Phone, Mail, Users, Star
} from 'lucide-react';
import { agencyAPI } from '../../api/agency';

const AgencyManagement: React.FC = () => {
  const { t } = useTranslation();
  const [agencies, setAgencies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  useEffect(() => {
    fetchAgencies();
  }, [currentPage]);

  const fetchAgencies = async () => {
    try {
      setLoading(true);
      const response = await agencyAPI.getAll({ page: currentPage, size: 12 });
      setAgencies(response.content || []);
      setTotalPages(response.totalPages || 1);
    } catch (error) {
      console.error('Failed to fetch agencies:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Delete this agency?')) {
      try {
        await agencyAPI.delete(id);
        fetchAgencies();
      } catch (error) {
        console.error('Failed to delete agency:', error);
      }
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
          <h1 className="text-2xl font-bold text-gray-900">{t('admin.menu.agencies')}</h1>
          <p className="text-sm text-gray-500 mt-1">Manage real estate agencies</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
          <Plus className="w-4 h-4" />
          Add Agency
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
                placeholder="Search agencies..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
            <Download className="w-4 h-4" />
            Export
          </button>
        </div>
      </div>

      {/* Agencies Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full py-12 text-center text-gray-500">
            {t('common.loading')}
          </div>
        ) : agencies.length === 0 ? (
          <div className="col-span-full py-12 text-center text-gray-500">
            No agencies found
          </div>
        ) : (
          agencies.map((agency) => (
            <div key={agency.id} className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all overflow-hidden group">
              {/* Agency Logo/Banner */}
              <div className="relative h-40 bg-gradient-to-br from-blue-500 to-indigo-600">
                <img
                  src={agency.logoUrl || '/default-agency.png'}
                  alt={agency.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                <div className="absolute bottom-3 left-3 flex items-center gap-2">
                  <div className="w-16 h-16 bg-white rounded-lg shadow-lg flex items-center justify-center overflow-hidden">
                    <img
                      src={agency.logoUrl || '/default-agency.png'}
                      alt={agency.name}
                      className="w-full h-full object-contain"
                    />
                  </div>
                </div>
              </div>

              {/* Agency Info */}
              <div className="p-5 pt-6">
                <h3 className="font-bold text-lg text-gray-900 mb-2 line-clamp-1 group-hover:text-blue-600 transition-colors">
                  {agency.name}
                </h3>

                {/* Rating */}
                <div className="flex items-center gap-2 mb-3">
                  <div className="flex">{getRatingStars(agency.rating || 4)}</div>
                  <span className="text-sm text-gray-600">({agency.totalReviews || 0})</span>
                </div>

                {/* Description */}
                <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                  {agency.description || 'Professional real estate agency'}
                </p>

                {/* Contact Info */}
                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <MapPin className="w-4 h-4 flex-shrink-0" />
                    <span className="line-clamp-1">{agency.address || 'N/A'}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Phone className="w-4 h-4 flex-shrink-0" />
                    {agency.phoneNumber || 'N/A'}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Mail className="w-4 h-4 flex-shrink-0" />
                    <span className="line-clamp-1">{agency.email || 'N/A'}</span>
                  </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-2 mb-4 p-3 bg-gray-50 rounded-lg">
                  <div className="text-center">
                    <div className="text-lg font-bold text-gray-900">{agency.totalAgents || 0}</div>
                    <div className="text-xs text-gray-500">Agents</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-gray-900">{agency.totalListings || 0}</div>
                    <div className="text-xs text-gray-500">Listings</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-gray-900">{agency.totalDeals || 0}</div>
                    <div className="text-xs text-gray-500">Deals</div>
                  </div>
                </div>

                {/* Verified Badge */}
                {agency.isVerified && (
                  <div className="mb-4">
                    <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-800 text-xs font-semibold rounded-full">
                      <Building2 className="w-3 h-3" />
                      Verified Agency
                    </span>
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
                    onClick={() => handleDelete(agency.id)}
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

export default AgencyManagement;
