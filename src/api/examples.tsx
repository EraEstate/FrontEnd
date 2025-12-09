// /**
//  * API Usage Examples
//  * 
//  * Hướng dẫn sử dụng các API trong các component React
//  */

// import React, { useState, useEffect } from 'react';
// import { 
//   // Import APIs
//   propertyAPI, 
//   authAPI, 
//   agentAPI, 
//   newsAPI,
//   locationAPI,
//   propertyFavoriteAPI,
//   userAPI,
  
//   // Import hooks
//   useProperties,
//   useProperty,
//   useFeaturedProperties,
//   useMyFavorites,
//   useAgents,
//   useNews,
//   useProvinces,
//   useLogin,
//   useRegister,
//   useToggleFavorite,
  
//   // Import types
//   Property,
//   Agent,
//   NewsArticle,
//   PropertySearchParams
// } from '../api';

// // Example 1: Using hooks in HomePage
// export const HomePageExample = () => {
//   // Lấy properties nổi bật
//   const { data: featuredProperties, loading: propertiesLoading } = useFeaturedProperties(0, 8);
  
//   // Lấy tin tức nổi bật
//   const { data: featuredNews, loading: newsLoading } = useNews({ 
//     size: 5, 
//     sortBy: 'publishedAt', 
//     sortDir: 'desc' 
//   });

//   // Lấy top agents
//   const { data: topAgents, loading: agentsLoading } = useAgents({ 
//     size: 6, 
//     sortBy: 'ratingAverage', 
//     sortDir: 'desc' 
//   });

//   if (propertiesLoading || newsLoading || agentsLoading) {
//     return <div>Loading...</div>;
//   }

//   return (
//     <div>
//       <h1>Trang chủ</h1>
      
//       {/* Featured Properties */}
//       <section>
//         <h2>Bất động sản nổi bật</h2>
//         <div className="grid grid-cols-4 gap-4">
//           {featuredProperties?.content?.map((property: Property) => (
//             <div key={property.id} className="border rounded p-4">
//               <h3>{property.title}</h3>
//               <p>{property.price.toLocaleString()} VND</p>
//               <p>{property.area} m²</p>
//             </div>
//           ))}
//         </div>
//       </section>

//       {/* Featured News */}
//       <section>
//         <h2>Tin tức nổi bật</h2>
//         <div className="grid grid-cols-3 gap-4">
//           {featuredNews?.content?.map((article: NewsArticle) => (
//             <div key={article.id} className="border rounded p-4">
//               <h3>{article.title}</h3>
//               <p>{article.summary}</p>
//             </div>
//           ))}
//         </div>
//       </section>

//       {/* Top Agents */}
//       <section>
//         <h2>Môi giới hàng đầu</h2>
//         <div className="grid grid-cols-6 gap-4">
//           {topAgents?.content?.map((agent: Agent) => (
//             <div key={agent.id} className="border rounded p-4 text-center">
//               <h4>{agent.user.fullName}</h4>
//               <p>⭐ {agent.ratingAverage}</p>
//             </div>
//           ))}
//         </div>
//       </section>
//     </div>
//   );
// };

// // Example 2: Using direct API calls in PropertiesPage
// export const PropertiesPageExample = () => {
//   const [properties, setProperties] = useState<Property[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [searchParams, setSearchParams] = useState<PropertySearchParams>({
//     page: 0,
//     size: 12,
//     sortBy: 'createdAt',
//     sortDir: 'desc'
//   });

//   // Lấy provinces cho filter
//   const { data: provinces } = useProvinces();

//   useEffect(() => {
//     const fetchProperties = async () => {
//       try {
//         setLoading(true);
//         const response = await propertyAPI.search(searchParams);
//         setProperties(response.content);
//       } catch (error) {
//         console.error('Error fetching properties:', error);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchProperties();
//   }, [searchParams]);

//   const handleSearch = (newParams: Partial<PropertySearchParams>) => {
//     setSearchParams(prev => ({ ...prev, ...newParams, page: 0 }));
//   };

//   const handleLoadMore = () => {
//     setSearchParams(prev => ({ ...prev, page: (prev.page || 0) + 1 }));
//   };

//   return (
//     <div>
//       <h1>Mua bán bất động sản</h1>
      
//       {/* Search Filters */}
//       <div className="mb-6 p-4 bg-gray-100 rounded">
//         <div className="grid grid-cols-4 gap-4">
//           <select 
//             onChange={(e) => handleSearch({ city: e.target.value })}
//             className="border rounded p-2"
//           >
//             <option value="">Chọn tỉnh/thành</option>
//             {provinces?.map((province) => (
//               <option key={province.id} value={province.name}>
//                 {province.name}
//               </option>
//             ))}
//           </select>
          
//           <select 
//             onChange={(e) => handleSearch({ propertyType: e.target.value })}
//             className="border rounded p-2"
//           >
//             <option value="">Loại BDS</option>
//             <option value="APARTMENT">Chung cư</option>
//             <option value="HOUSE">Nhà riêng</option>
//             <option value="VILLA">Biệt thự</option>
//           </select>
          
//           <input
//             type="number"
//             placeholder="Giá từ"
//             onChange={(e) => handleSearch({ minPrice: parseInt(e.target.value) })}
//             className="border rounded p-2"
//           />
          
//           <input
//             type="number"
//             placeholder="Giá đến"
//             onChange={(e) => handleSearch({ maxPrice: parseInt(e.target.value) })}
//             className="border rounded p-2"
//           />
//         </div>
//       </div>

//       {/* Properties Grid */}
//       {loading ? (
//         <div>Loading...</div>
//       ) : (
//         <>
//           <div className="grid grid-cols-3 gap-6">
//             {properties.map((property) => (
//               <PropertyCard key={property.id} property={property} />
//             ))}
//           </div>
          
//           <button 
//             onClick={handleLoadMore}
//             className="mt-6 px-4 py-2 bg-blue-500 text-white rounded"
//           >
//             Tải thêm
//           </button>
//         </>
//       )}
//     </div>
//   );
// };

// // Example 3: Property Detail with favorites
// export const PropertyDetailExample = ({ propertyId }: { propertyId: string }) => {
//   const { data: property, loading } = useProperty(propertyId);
//   const { mutate: toggleFavorite, loading: favoriteLoading } = useToggleFavorite();

//   const handleToggleFavorite = async () => {
//     try {
//       await toggleFavorite(propertyId);
//       // Có thể refetch property data hoặc update state
//     } catch (error) {
//       console.error('Error toggling favorite:', error);
//     }
//   };

//   if (loading) return <div>Loading...</div>;
//   if (!property) return <div>Property not found</div>;

//   return (
//     <div>
//       <h1>{property.title}</h1>
//       <p>Giá: {property.price.toLocaleString()} VND</p>
//       <p>Diện tích: {property.area} m²</p>
//       <p>Địa chỉ: {property.address}</p>
      
//       <button 
//         onClick={handleToggleFavorite}
//         disabled={favoriteLoading}
//         className="px-4 py-2 bg-red-500 text-white rounded"
//       >
//         {favoriteLoading ? 'Loading...' : '❤️ Yêu thích'}
//       </button>
//     </div>
//   );
// };

// // Example 4: Login form
// export const LoginExample = () => {
//   const [credentials, setCredentials] = useState({ username: '', password: '' });
//   const { mutate: login, loading, error } = useLogin();

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     try {
//       const response = await login(credentials);
//       localStorage.setItem('token', response.token);
//       localStorage.setItem('user', JSON.stringify(response.user));
//       // Redirect to dashboard
//     } catch (error) {
//       console.error('Login failed:', error);
//     }
//   };

//   return (
//     <form onSubmit={handleSubmit} className="max-w-md mx-auto">
//       <h2>Đăng nhập</h2>
      
//       {error && <div className="text-red-500 mb-4">{error}</div>}
      
//       <div className="mb-4">
//         <input
//           type="text"
//           placeholder="Tên đăng nhập"
//           value={credentials.username}
//           onChange={(e) => setCredentials(prev => ({ ...prev, username: e.target.value }))}
//           className="w-full border rounded p-2"
//           required
//         />
//       </div>
      
//       <div className="mb-4">
//         <input
//           type="password"
//           placeholder="Mật khẩu"
//           value={credentials.password}
//           onChange={(e) => setCredentials(prev => ({ ...prev, password: e.target.value }))}
//           className="w-full border rounded p-2"
//           required
//         />
//       </div>
      
//       <button 
//         type="submit" 
//         disabled={loading}
//         className="w-full bg-blue-500 text-white py-2 rounded"
//       >
//         {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
//       </button>
//     </form>
//   );
// };

// // Example 5: My Favorites page
// export const MyFavoritesExample = () => {
//   const [page, setPage] = useState(0);
//   const { data: favorites, loading, refetch } = useMyFavorites(page, 12);
//   const { mutate: toggleFavorite } = useToggleFavorite();

//   const handleRemoveFromFavorites = async (propertyId: string) => {
//     try {
//       await toggleFavorite(propertyId);
//       refetch(); // Refresh the favorites list
//     } catch (error) {
//       console.error('Error removing from favorites:', error);
//     }
//   };

//   if (loading) return <div>Loading...</div>;

//   return (
//     <div>
//       <h1>Tin đăng yêu thích</h1>
      
//       {favorites?.content?.length === 0 ? (
//         <div>Bạn chưa có tin đăng yêu thích nào</div>
//       ) : (
//         <div className="grid grid-cols-3 gap-6">
//           {favorites?.content?.map((favorite) => (
//             <div key={favorite.id} className="border rounded p-4">
//               <h3>{favorite.property.title}</h3>
//               <p>{favorite.property.price.toLocaleString()} VND</p>
//               <button
//                 onClick={() => handleRemoveFromFavorites(favorite.propertyId)}
//                 className="mt-2 px-4 py-2 bg-red-500 text-white rounded"
//               >
//                 Xóa khỏi yêu thích
//               </button>
//             </div>
//           ))}
//         </div>
//       )}
      
//       {/* Pagination */}
//       <div className="mt-6 flex justify-center gap-2">
//         <button
//           onClick={() => setPage(p => Math.max(0, p - 1))}
//           disabled={page === 0}
//           className="px-4 py-2 border rounded"
//         >
//           Trước
//         </button>
//         <span className="px-4 py-2">Trang {page + 1}</span>
//         <button
//           onClick={() => setPage(p => p + 1)}
//           disabled={favorites?.last}
//           className="px-4 py-2 border rounded"
//         >
//           Sau
//         </button>
//       </div>
//     </div>
//   );
// };

// // Helper component
// const PropertyCard = ({ property }: { property: Property }) => {
//   return (
//     <div className="border rounded-lg overflow-hidden shadow-md">
//       {property.images[0] && (
//         <img 
//           src={property.images[0]} 
//           alt={property.title}
//           className="w-full h-48 object-cover"
//         />
//       )}
//       <div className="p-4">
//         <h3 className="font-semibold mb-2">{property.title}</h3>
//         <p className="text-red-600 font-bold text-lg">
//           {property.price.toLocaleString()} VND
//         </p>
//         <p className="text-gray-600">
//           {property.area} m² • {property.bedrooms} PN • {property.bathrooms} WC
//         </p>
//         <p className="text-gray-500 text-sm mt-2">
//           {property.address}
//         </p>
//       </div>
//     </div>
//   );
// };

// /*
// === HƯỚNG DẪN SỬ DỤNG API TRONG CÁC TRANG ===

// 1. HOMEPAGE (Trang chủ):
//    - useFeaturedProperties() - Lấy BDS nổi bật
//    - useNews() - Lấy tin tức
//    - useAgents() - Lấy top agents

// 2. PROPERTIES PAGE (Trang BDS):
//    - propertyAPI.search() - Tìm kiếm BDS
//    - useProvinces() - Lấy danh sách tỉnh
//    - propertyAPI.getForSale() / getForRent() - BDS bán/cho thuê

// 3. PROPERTY DETAIL (Chi tiết BDS):
//    - useProperty(id) - Lấy chi tiết BDS
//    - useToggleFavorite() - Thêm/xóa yêu thích
//    - propertyInquiryAPI.create() - Gửi yêu cầu tư vấn

// 4. AGENTS PAGE (Trang môi giới):
//    - useAgents() - Lấy danh sách agents
//    - agentAPI.getByCity() - Agents theo thành phố
//    - agentAPI.search() - Tìm kiếm agents

// 5. AGENT DETAIL (Chi tiết môi giới):
//    - useAgent(id) - Lấy chi tiết agent
//    - useAgentProperties() - BDS của agent

// 6. NEWS PAGE (Trang tin tức):
//    - useNews() - Lấy danh sách tin tức
//    - newsAPI.getByCategory() - Tin theo danh mục
//    - newsAPI.search() - Tìm kiếm tin tức

// 7. NEWS DETAIL (Chi tiết tin tức):
//    - useNewsArticle(id) - Lấy chi tiết bài viết
//    - newsAPI.incrementViews() - Tăng lượt xem

// 8. LOGIN/REGISTER:
//    - useLogin() - Đăng nhập
//    - useRegister() - Đăng ký
//    - authAPI.forgotPassword() - Quên mật khẩu

// 9. MY PROPERTIES (BDS của tôi):
//    - useMyProperties() - Lấy BDS của user
//    - useCreateProperty() - Đăng tin mới
//    - useUpdateProperty() - Cập nhật tin
//    - useDeleteProperty() - Xóa tin

// 10. FAVORITES (Yêu thích):
//     - useMyFavorites() - Lấy danh sách yêu thích
//     - useToggleFavorite() - Thêm/xóa yêu thích
//     - useFavoriteStatus() - Kiểm tra trạng thái yêu thích

// 11. PROFILE (Hồ sơ):
//     - useUserProfile() - Lấy thông tin profile
//     - useUpdateProfile() - Cập nhật profile
//     - useChangePassword() - Đổi mật khẩu

// 12. RENT PAGE (Trang cho thuê):
//     - useRentProperties() - Lấy BDS cho thuê
//     - propertyAPI.getForRent() - API cho thuê

// 13. PROJECTS PAGE (Trang dự án):
//     - useProjects() - Lấy danh sách dự án
//     - useProject(id) - Chi tiết dự án

// 14. WIKI PAGE (Trang wiki):
//     - newsAPI.getByCategory('LEGAL_GUIDE') - Hướng dẫn pháp lý
//     - newsAPI.getByCategory('INVESTMENT_TIPS') - Mẹo đầu tư

// 15. UTILITIES PAGE (Tiện ích):
//     - Có thể tích hợp các calculator API
//     - Static utilities

// === BEST PRACTICES ===

// 1. Sử dụng hooks cho data fetching:
//    - useProperties, useProperty, useAgent, etc.

// 2. Sử dụng mutation hooks cho actions:
//    - useLogin, useRegister, useToggleFavorite, etc.

// 3. Handle loading và error states:
//    - Luôn check loading và error từ hooks

// 4. Implement pagination:
//    - Sử dụng page và size parameters

// 5. Implement search và filters:
//    - Sử dụng search parameters cho filtering

// 6. Cache management:
//    - Sử dụng refetch để refresh data khi cần

// 7. Error handling:
//    - Try-catch cho direct API calls
//    - Error state từ hooks

// 8. Authentication:
//    - Check token trong localStorage
//    - Redirect khi unauthorized

// 9. Responsive design:
//    - Grid layouts tương thích mobile

// 10. Performance:
//     - Lazy loading cho images
//     - Pagination thay vì load all
//     - Debounce cho search inputs
// */