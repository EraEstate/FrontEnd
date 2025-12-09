/**
 * UPDATED API Usage Examples - Bổ sung các API mới
 * 
 * Các API đã được bổ sung:
 * 1. PropertyView API - Theo dõi lượt xem BDS
 * 2. Location API hoàn chỉnh - Province, District, Ward với CRUD
 * 3. Notification API hoàn chỉnh - Quản lý thông báo
 */

import React, { useState, useEffect } from 'react';
import { 
  // Existing APIs
  propertyAPI, 
  agentAPI, 
  newsAPI,
  
  // New APIs
  propertyViewAPI,
  locationAPI,
  notificationAPI,
  
  // New hooks
  usePropertyViews,
  useRecordView,
  useTrendingProperties,
  useMostViewedProperties,
  useNotifications,
  useUnreadCount,
  useMarkAsRead,
  useProvinces,
  useDistricts,
  useWards,
  useMarkAllAsRead,
} from '../api';

// Example 1: PropertyDetailPage với tracking views
export const PropertyDetailWithViewsExample = ({ propertyId }: { propertyId: string }) => {
  const [property, setProperty] = useState<any>(null);
  const { data: viewCount, refetch: refetchViews } = usePropertyViews(propertyId);
  const { mutate: recordView } = useRecordView();
  
  useEffect(() => {
    // Load property details
    const loadProperty = async () => {
      try {
        const data = await propertyAPI.getById(propertyId);
        setProperty(data);
        
        // Record view khi user xem property
        await recordView(propertyId);
        refetchViews(); // Refresh view count
      } catch (error) {
        console.error('Error loading property:', error);
      }
    };
    
    loadProperty();
  }, [propertyId]);

  if (!property) return <div>Loading...</div>;

  return (
    <div className="property-detail">
      <div className="property-header">
        <h1>{property.title}</h1>
        <div className="property-stats">
          <span>👁️ {viewCount || 0} lượt xem</span>
          <span>📅 {new Date(property.createdAt).toLocaleDateString()}</span>
        </div>
      </div>
      
      <div className="property-info">
        <p>Giá: {property.price.toLocaleString()} VND</p>
        <p>Diện tích: {property.area} m²</p>
        <p>Địa chỉ: {property.address}</p>
      </div>
    </div>
  );
};

// Example 2: TrendingPropertiesPage - BDS được xem nhiều
export const TrendingPropertiesExample = () => {
  const [timeRange, setTimeRange] = useState(7);
  const { data: trendingProperties, loading } = useTrendingProperties(20, timeRange);
  const { data: mostViewed } = useMostViewedProperties(undefined, 0, 10);

  return (
    <div className="trending-properties">
      <div className="page-header">
        <h1>Bất động sản HOT - Được xem nhiều nhất</h1>
        
        {/* Time range filter */}
        <div className="time-filter">
          <button 
            onClick={() => setTimeRange(1)}
            className={timeRange === 1 ? 'active' : ''}
          >
            24h qua
          </button>
          <button 
            onClick={() => setTimeRange(7)}
            className={timeRange === 7 ? 'active' : ''}
          >
            7 ngày qua
          </button>
          <button 
            onClick={() => setTimeRange(30)}
            className={timeRange === 30 ? 'active' : ''}
          >
            30 ngày qua
          </button>
        </div>
      </div>

      {loading ? (
        <div>Loading trending properties...</div>
      ) : (
        <div className="properties-grid">
          {trendingProperties?.map((property: any, index: number) => (
            <div key={property.id} className="property-card trending">
              <div className="trend-badge">#{index + 1} HOT</div>
              <h3>{property.title}</h3>
              <p>{property.price.toLocaleString()} VND</p>
              <div className="view-stats">
                <span>👁️ {property.viewCount} lượt xem</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Most viewed section */}
      <section className="most-viewed-section">
        <h2>Xem nhiều nhất mọi thời đại</h2>
        <div className="properties-grid">
          {mostViewed?.content?.map((item: any) => (
            <div key={item[0]} className="property-card">
              <h3>Property ID: {item[0]}</h3>
              <p>Total Views: {item[1]}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

// Example 3: LocationSelector với CRUD operations
export const LocationSelectorExample = () => {
  const [selectedProvince, setSelectedProvince] = useState<string>('');
  const [selectedDistrict, setSelectedDistrict] = useState<string>('');
  const [selectedWard, setSelectedWard] = useState<string>('');
  
  const { data: provinces } = useProvinces();
  const { data: districts, refetch: refetchDistricts } = useDistricts(selectedProvince);
  const { data: wards, refetch: refetchWards } = useWards(selectedDistrict);

  const handleProvinceChange = (provinceId: string) => {
    setSelectedProvince(provinceId);
    setSelectedDistrict('');
    setSelectedWard('');
    if (provinceId) {
      refetchDistricts();
    }
  };

  const handleDistrictChange = (districtId: string) => {
    setSelectedDistrict(districtId);
    setSelectedWard('');
    if (districtId) {
      refetchWards();
    }
  };

  // Search locations
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any>(null);

  const handleSearch = async () => {
    if (searchQuery.trim()) {
      try {
        const results = await locationAPI.autocomplete(searchQuery);
        setSearchResults(results);
      } catch (error) {
        console.error('Search error:', error);
      }
    }
  };

  return (
    <div className="location-selector">
      <h2>Chọn địa điểm</h2>
      
      {/* Location dropdowns */}
      <div className="location-dropdowns">
        <select 
          value={selectedProvince} 
          onChange={(e) => handleProvinceChange(e.target.value)}
        >
          <option value="">Chọn Tỉnh/Thành phố</option>
          {provinces?.map((province: any) => (
            <option key={province.id} value={province.id}>
              {province.name}
            </option>
          ))}
        </select>

        <select 
          value={selectedDistrict} 
          onChange={(e) => handleDistrictChange(e.target.value)}
          disabled={!selectedProvince}
        >
          <option value="">Chọn Quận/Huyện</option>
          {districts?.map((district: any) => (
            <option key={district.id} value={district.id}>
              {district.name}
            </option>
          ))}
        </select>

        <select 
          value={selectedWard} 
          onChange={(e) => setSelectedWard(e.target.value)}
          disabled={!selectedDistrict}
        >
          <option value="">Chọn Phường/Xã</option>
          {wards?.map((ward: any) => (
            <option key={ward.id} value={ward.id}>
              {ward.name}
            </option>
          ))}
        </select>
      </div>

      {/* Location search */}
      <div className="location-search">
        <input
          type="text"
          placeholder="Tìm kiếm địa điểm..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
        />
        <button onClick={handleSearch}>Tìm kiếm</button>
      </div>

      {/* Search results */}
      {searchResults && (
        <div className="search-results">
          {searchResults.districts?.length > 0 && (
            <div>
              <h3>Quận/Huyện</h3>
              {searchResults.districts.map((district: any) => (
                <div key={district.id} onClick={() => handleDistrictChange(district.id)}>
                  {district.name}
                </div>
              ))}
            </div>
          )}
          
          {searchResults.wards?.length > 0 && (
            <div>
              <h3>Phường/Xã</h3>
              {searchResults.wards.map((ward: any) => (
                <div key={ward.id} onClick={() => setSelectedWard(ward.id)}>
                  {ward.name}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// Example 4: NotificationCenter - Trung tâm thông báo
export const NotificationCenterExample = () => {
  const [page, setPage] = useState(0);
  const { data: notifications, loading, refetch } = useNotifications(page, 20);
  const { data: unreadCount, refetch: refetchUnreadCount } = useUnreadCount();
  const { mutate: markAsRead } = useMarkAsRead();
  const { mutate: markAllAsRead } = useMarkAllAsRead();

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      await markAsRead(notificationId);
      refetch();
      refetchUnreadCount();
    } catch (error) {
      console.error('Error marking as read:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await useMarkAllAsRead();
      refetch();
      refetchUnreadCount();
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  return (
    <div className="notification-center">
      <div className="notification-header">
        <h1>Thông báo ({unreadCount || 0})</h1>
        <button onClick={handleMarkAllAsRead} disabled={!unreadCount}>
          Đánh dấu tất cả đã đọc
        </button>
      </div>

      {loading ? (
        <div>Loading notifications...</div>
      ) : (
        <div className="notifications-list">
          {notifications?.content?.map((notification: any) => (
            <div 
              key={notification.id} 
              className={`notification-item ${!notification.isRead ? 'unread' : ''}`}
              onClick={() => !notification.isRead && handleMarkAsRead(notification.id)}
            >
              <div className="notification-content">
                <h3>{notification.title}</h3>
                <p>{notification.message}</p>
                <span className="notification-time">
                  {new Date(notification.createdAt).toLocaleString()}
                </span>
              </div>
              
              {!notification.isRead && (
                <div className="unread-indicator">●</div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      <div className="pagination">
        <button
          onClick={() => setPage(p => Math.max(0, p - 1))}
          disabled={page === 0}
        >
          Trước
        </button>
        <span>Trang {page + 1}</span>
        <button
          onClick={() => setPage(p => p + 1)}
          disabled={notifications?.last}
        >
          Sau
        </button>
      </div>
    </div>
  );
};

// Example 5: AdminDashboard với Property Views Analytics
export const AdminDashboardExample = () => {
  const [viewStats, setViewStats] = useState<any>(null);
  const [dateRange, setDateRange] = useState('7');

  useEffect(() => {
    const loadViewStats = async () => {
      try {
        const stats = await propertyViewAPI.getDailyViewStats();
        setViewStats(stats);
      } catch (error) {
        console.error('Error loading view stats:', error);
      }
    };

    loadViewStats();
  }, [dateRange]);

  return (
    <div className="admin-dashboard">
      <h1>Admin Dashboard - Thống kê lượt xem</h1>
      
      <div className="stats-filters">
        <select value={dateRange} onChange={(e) => setDateRange(e.target.value)}>
          <option value="7">7 ngày qua</option>
          <option value="30">30 ngày qua</option>
          <option value="90">90 ngày qua</option>
        </select>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <h3>Tổng lượt xem</h3>
          <p className="stat-number">{viewStats?.totalViews || 0}</p>
        </div>
        
        <div className="stat-card">
          <h3>Lượt xem hôm nay</h3>
          <p className="stat-number">{viewStats?.todayViews || 0}</p>
        </div>
        
        <div className="stat-card">
          <h3>Trung bình/ngày</h3>
          <p className="stat-number">{viewStats?.averagePerDay || 0}</p>
        </div>
      </div>

      <TrendingPropertiesExample />
    </div>
  );
};

/*
=== CẬP NHẬT API USAGE ===

1. PROPERTY VIEWS:
   - propertyViewAPI.recordView(propertyId) - Ghi nhận lượt xem
   - usePropertyViews(propertyId) - Hook lấy số lượt xem
   - useTrendingProperties() - Hook lấy BDS trending
   - useMostViewedProperties() - Hook lấy BDS xem nhiều nhất

2. LOCATION APIS HOÀN CHỈNH:
   - locationAPI.getProvinces() - Lấy tất cả tỉnh
   - locationAPI.getDistricts(provinceId) - Lấy quận theo tỉnh
   - locationAPI.getWards(districtId) - Lấy phường theo quận
   - locationAPI.searchDistricts(keyword) - Tìm kiếm quận
   - locationAPI.searchWards(keyword) - Tìm kiếm phường
   - locationAPI.autocomplete(query) - Auto-complete địa chỉ

3. NOTIFICATION APIS:
   - notificationAPI.getUserNotifications() - Lấy thông báo user
   - notificationAPI.getUnread() - Lấy thông báo chưa đọc
   - notificationAPI.countUnread() - Đếm thông báo chưa đọc
   - notificationAPI.markAsRead(id) - Đánh dấu đã đọc
   - notificationAPI.markAllAsRead() - Đánh dấu tất cả đã đọc

4. SỬ DỤNG TRONG CÁC TRANG:

   HOMEPAGE:
   - Hiển thị BDS trending với useTrendingProperties()
   - Tracking views khi user click vào property

   PROPERTY DETAIL:
   - Record view khi user xem property
   - Hiển thị số lượt xem với usePropertyViews()

   PROPERTIES PAGE:
   - Location selector với useProvinces(), useDistricts(), useWards()
   - Search với locationAPI.autocomplete()

   ADMIN DASHBOARD:
   - View analytics với propertyViewAPI.getDailyViewStats()
   - Most viewed properties management

   NOTIFICATION CENTER:
   - Real-time notifications với useNotifications()
   - Unread count với useUnreadCount()
   - Mark as read actions

   USER PROFILE:
   - Notification settings
   - View history (có thể implement thêm)

5. PERFORMANCE OPTIMIZATIONS:
   - Sử dụng pagination cho all lists
   - Debounce cho search inputs
   - Cache cho location data
   - Real-time updates cho notifications
   - Lazy loading cho images và heavy content

6. ERROR HANDLING:
   - Try-catch cho all API calls
   - User-friendly error messages
   - Fallback states cho loading/error

7. MOBILE RESPONSIVE:
   - Touch-friendly controls
   - Responsive grids
   - Mobile-optimized selectors
*/