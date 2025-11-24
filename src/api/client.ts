// import axios from 'axios';
// import type { 
//   AuthResponse, 
//   LoginRequest, 
//   RegisterRequest,
//   Property,
//   PropertyCreateRequest,
//   PropertySearchParams,
//   PageResponse
// } from '../types';

// const API_BASE_URL = 'http://localhost:8080/api';

// const api = axios.create({
//   baseURL: API_BASE_URL,
//   headers: {
//     'Content-Type': 'application/json',
//   },
// });

// // Request interceptor to add auth token
// api.interceptors.request.use((config) => {
//   const token = localStorage.getItem('token');
//   if (token) {
//     config.headers.Authorization = `Bearer ${token}`;
//   }
//   return config;
// });

// // Response interceptor for error handling
// api.interceptors.response.use(
//   (response) => response,
//   (error) => {
//     if (error.response?.status === 401) {
//       localStorage.removeItem('token');
//       localStorage.removeItem('user');
//       window.location.href = '/login';
//     }
//     return Promise.reject(error);
//   }
// );

// export const authAPI = {
//   login: (data: LoginRequest): Promise<AuthResponse> =>
//     api.post('/auth/login', data).then(res => res.data),
    
//   register: (data: RegisterRequest): Promise<AuthResponse> =>
//     api.post('/auth/register', data).then(res => res.data),
// };

// export const propertyAPI = {
//   search: (params: PropertySearchParams = {}): Promise<PageResponse<Property>> =>
//     api.get('/properties/search', { params }).then(res => res.data),
    
//   getById: (id: string): Promise<Property> =>
//     api.get(`/properties/${id}`).then(res => res.data),
    
//   create: (data: PropertyCreateRequest): Promise<Property> =>
//     api.post('/properties', data).then(res => res.data),
    
//   getCities: (): Promise<string[]> =>
//     api.get('/properties/cities').then(res => res.data),
    
//   getDistricts: (city: string): Promise<string[]> =>
//     api.get(`/properties/districts/${city}`).then(res => res.data),
// };

// export default api;