import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  Search, Eye, Download, MessageSquare, User, Phone, Mail, 
  Calendar, CheckCircle, XCircle, Clock, AlertCircle
} from 'lucide-react';
import { propertyInquiryAPI } from '../../api/propertyInquiry';
import { adminAPI } from '../../api/admin';

const InquiryManagement: React.FC = () => {
  const { t } = useTranslation();
  const [inquiries, setInquiries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [stats, setStats] = useState({
    pending: 0,
    inProgress: 0,
    resolved: 0,
    closed: 0
  });

  useEffect(() => {
    fetchInquiries();
  }, [currentPage, filterStatus]);

  useEffect(() => {
    fetchStats();
  }, []);

  const handleFilterChange = (newStatus: string) => {
    setFilterStatus(newStatus);
    setCurrentPage(0); // Reset to first page when filter changes
  };

  const fetchStats = async () => {
    try {
      const breakdown = await adminAPI.getInquiryStatusBreakdown();
      setStats({
        pending: breakdown.find(s => s.status === 'New')?.count || 0,
        inProgress: breakdown.find(s => s.status === 'In Progress')?.count || 0,
        resolved: breakdown.find(s => s.status === 'Responded')?.count || 0,
        closed: breakdown.find(s => s.status === 'Closed')?.count || 0
      });
    } catch (error) {
      console.error('Failed to fetch inquiry stats:', error);
    }
  };

  const fetchInquiries = async () => {
    try {
      setLoading(true);
      const params: any = {
        page: currentPage,
        size: 20,
        sortBy: 'createdAt',
        sortDir: 'desc'
      };
      
      if (filterStatus !== 'ALL') {
        // Map UI status to API status
        const statusMap: Record<string, string> = {
          'PENDING': 'NEW',
          'IN_PROGRESS': 'IN_PROGRESS',
          'RESOLVED': 'RESPONDED',
          'CLOSED': 'CLOSED'
        };
        params.status = statusMap[filterStatus] || filterStatus;
      }
      
      const response = await propertyInquiryAPI.getAll(params);
      setInquiries(response.content || []);
      setTotalPages(response.totalPages || 1);
    } catch (error) {
      console.error('Failed to fetch inquiries:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const badges: Record<string, { bg: string; text: string; icon: any; label: string }> = {
      NEW: { bg: 'bg-yellow-100', text: 'text-yellow-800', icon: Clock, label: 'NEW' },
      IN_PROGRESS: { bg: 'bg-blue-100', text: 'text-blue-800', icon: AlertCircle, label: 'IN PROGRESS' },
      RESPONDED: { bg: 'bg-green-100', text: 'text-green-800', icon: CheckCircle, label: 'RESOLVED' },
      CLOSED: { bg: 'bg-gray-100', text: 'text-gray-800', icon: XCircle, label: 'CLOSED' },
      SPAM: { bg: 'bg-red-100', text: 'text-red-800', icon: XCircle, label: 'SPAM' }
    };
    return badges[status] || badges.NEW;
  };

  // Filter inquiries by search term
  const filteredInquiries = inquiries.filter(inquiry => {
    if (!searchTerm) return true;
    const searchLower = searchTerm.toLowerCase();
    return (
      inquiry.inquirerName?.toLowerCase().includes(searchLower) ||
      inquiry.inquirerEmail?.toLowerCase().includes(searchLower) ||
      inquiry.inquirerPhone?.toLowerCase().includes(searchLower) ||
      inquiry.message?.toLowerCase().includes(searchLower) ||
      inquiry.property?.title?.toLowerCase().includes(searchLower)
    );
  });

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t('admin.menu.inquiries')}</h1>
          <p className="text-sm text-gray-500 mt-1">Manage property inquiries</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-xl p-6 text-white shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <Clock className="w-8 h-8 opacity-80" />
          </div>
          <div className="text-3xl font-bold mb-1">{stats.pending}</div>
          <div className="text-sm opacity-80">Pending Inquiries</div>
        </div>

        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <AlertCircle className="w-8 h-8 opacity-80" />
          </div>
          <div className="text-3xl font-bold mb-1">{stats.inProgress}</div>
          <div className="text-sm opacity-80">In Progress</div>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-6 text-white shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <CheckCircle className="w-8 h-8 opacity-80" />
          </div>
          <div className="text-3xl font-bold mb-1">{stats.resolved}</div>
          <div className="text-sm opacity-80">Resolved</div>
        </div>

        <div className="bg-gradient-to-br from-gray-500 to-gray-600 rounded-xl p-6 text-white shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <XCircle className="w-8 h-8 opacity-80" />
          </div>
          <div className="text-3xl font-bold mb-1">{stats.closed}</div>
          <div className="text-sm opacity-80">Closed</div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="bg-white rounded-xl shadow-md p-4">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex-1 min-w-[300px]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search inquiries..."
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
            <option value="PENDING">Pending</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="RESOLVED">Resolved</option>
            <option value="CLOSED">Closed</option>
          </select>

          <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
            <Download className="w-4 h-4" />
            Export
          </button>
        </div>
      </div>

      {/* Inquiries Table */}
      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Customer</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Property</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Message</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Status</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Date</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                    {t('common.loading')}
                  </td>
                </tr>
              ) : filteredInquiries.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                    {searchTerm ? 'No inquiries found matching your search' : 'No inquiries found'}
                  </td>
                </tr>
              ) : (
                filteredInquiries.map((inquiry) => {
                  const status = getStatusBadge(inquiry.status);
                  const StatusIcon = status.icon;
                  
                  return (
                    <tr key={inquiry.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                            <User className="w-5 h-5 text-blue-600" />
                          </div>
                          <div>
                            <div className="font-medium text-gray-900">{inquiry.inquirerName || 'N/A'}</div>
                            {inquiry.inquirerPhone && (
                              <div className="flex items-center gap-2 mt-1">
                                <Phone className="w-3 h-3 text-gray-400" />
                                <span className="text-xs text-gray-500">{inquiry.inquirerPhone}</span>
                              </div>
                            )}
                            {inquiry.inquirerEmail && (
                              <div className="flex items-center gap-2 mt-1">
                                <Mail className="w-3 h-3 text-gray-400" />
                                <span className="text-xs text-gray-500">{inquiry.inquirerEmail}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900 font-medium max-w-[200px] line-clamp-2">
                          {inquiry.property?.title || 'N/A'}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="max-w-[300px]">
                          <div className="flex items-start gap-2">
                            <MessageSquare className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" />
                            <p className="text-sm text-gray-600 line-clamp-3">
                              {inquiry.message || 'No message provided'}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold ${status.bg} ${status.text}`}>
                          <StatusIcon className="w-3 h-3" />
                          {status.label}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Calendar className="w-4 h-4" />
                          {formatDate(inquiry.createdAt)}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <button className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                          <Eye className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
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

export default InquiryManagement;
