import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  Search, Plus, Edit2, Trash2, Eye, 
  Building, MapPin, DollarSign, Download
} from 'lucide-react';
import { propertyAPI } from '../../api/property';
import { getImageUrl, getImagePlaceholder } from '../../utils/imageUtils';

const PropertyManagement: React.FC = () => {
  const { t } = useTranslation();
  const [properties, setProperties] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [filterType, setFilterType] = useState<string>('ALL');
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [selectedProperties, setSelectedProperties] = useState<string[]>([]);

  useEffect(() => {
    fetchProperties();
  }, [currentPage, filterStatus, filterType]);

  const fetchProperties = async () => {
    try {
      setLoading(true);
      const response = await propertyAPI.search({ page: currentPage, size: 20 });
      setProperties(response.content || []);
      setTotalPages(response.totalPages || 1);
    } catch (error) {
      console.error('Failed to fetch properties:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectProperty = (id: string) => {
    setSelectedProperties(prev => 
      prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedProperties.length === properties.length) {
      setSelectedProperties([]);
    } else {
      setSelectedProperties(properties.map(p => p.id));
    }
  };

  const handleDeleteProperty = async (id: string) => {
    if (window.confirm('Delete this property?')) {
      try {
        await propertyAPI.delete(id);
        fetchProperties();
      } catch (error) {
        console.error('Failed to delete property:', error);
      }
    }
  };

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      ACTIVE: 'bg-green-100 text-green-800 border-green-200',
      PENDING: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      SOLD: 'bg-blue-100 text-blue-800 border-blue-200',
      RENTED: 'bg-purple-100 text-purple-800 border-purple-200',
      INACTIVE: 'bg-gray-100 text-gray-800 border-gray-200'
    };
    return styles[status] || styles.ACTIVE;
  };

  const formatPrice = (price: number) => {
    if (price >= 1000000000) return `${(price / 1000000000).toFixed(1)}B`;
    if (price >= 1000000) return `${(price / 1000000).toFixed(0)}M`;
    return price.toLocaleString();
  };

  const getPropertyImage = (property: any) => {
    // Try to get primary image first
    const primaryImage = property.propertyImages?.find((img: any) => img.isMain || img.isPrimary)?.imageUrl ||
                         property.propertyImages?.[0]?.imageUrl;
    
    // Fallback to mainImageUrl
    if (!primaryImage) {
      return property.mainImageUrl || property.mainImage;
    }
    
    return primaryImage;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t('admin.menu.properties')}</h1>
          <p className="text-sm text-gray-500 mt-1">Manage all properties in the system</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
          <Plus className="w-4 h-4" />
          Add Property
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
                placeholder="Search properties..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="ALL">All Status</option>
            <option value="ACTIVE">Active</option>
            <option value="PENDING">Pending</option>
            <option value="SOLD">Sold</option>
            <option value="RENTED">Rented</option>
          </select>

          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="ALL">All Types</option>
            <option value="APARTMENT">Apartment</option>
            <option value="HOUSE">House</option>
            <option value="VILLA">Villa</option>
            <option value="LAND">Land</option>
          </select>

          {selectedProperties.length > 0 && (
            <>
              <div className="h-8 w-px bg-gray-300"></div>
              <button className="flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg">
                <Trash2 className="w-4 h-4" />
                Delete ({selectedProperties.length})
              </button>
            </>
          )}

          <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
            <Download className="w-4 h-4" />
            Export
          </button>
        </div>
      </div>

      {/* Properties Table */}
      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left">
                  <input
                    type="checkbox"
                    checked={selectedProperties.length === properties.length && properties.length > 0}
                    onChange={handleSelectAll}
                    className="w-4 h-4 text-blue-600 rounded"
                  />
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Property</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Type</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Price</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Location</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Views</th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-gray-600 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-gray-500">
                    {t('common.loading')}
                  </td>
                </tr>
              ) : properties.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-gray-500">
                    No properties found
                  </td>
                </tr>
              ) : (
                properties.map((property) => (
                  <tr key={property.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <input
                        type="checkbox"
                        checked={selectedProperties.includes(property.id)}
                        onChange={() => handleSelectProperty(property.id)}
                        className="w-4 h-4 text-blue-600 rounded"
                      />
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                          <img 
                            src={getImageUrl(getPropertyImage(property)) || getImagePlaceholder(64, 64)} 
                            alt={property.title || 'Property'}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.src = getImagePlaceholder(64, 64);
                            }}
                          />
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">{property.title || 'N/A'}</div>
                          <div className="text-sm text-gray-500">{property.area ? `${property.area} m²` : 'N/A'}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        <Building className="w-3 h-3" />
                        {property.type}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1 text-sm font-semibold text-gray-900">
                        <DollarSign className="w-4 h-4 text-green-600" />
                        {formatPrice(property.price)} VNĐ
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1 text-sm text-gray-600">
                        <MapPin className="w-4 h-4" />
                        {property.city || 'N/A'}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusBadge(property.status)}`}>
                        {property.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1 text-sm text-gray-600">
                        <Eye className="w-4 h-4" />
                        {property.viewCount || 0}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="View"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                          title="Edit"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteProperty(property.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
            <div className="text-sm text-gray-600">
              Showing {properties.length} of {totalPages * 20} properties
            </div>
            <div className="flex items-center gap-2">
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
          </div>
        )}
      </div>
    </div>
  );
};

export default PropertyManagement;
