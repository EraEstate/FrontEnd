// User types
export interface User {
  id: number;
  username: string;
  email: string;
  fullName: string;
  phoneNumber: string;
  avatar?: string;
  role: 'USER' | 'AGENT' | 'ADMIN';
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface UserProfile {
  id: number;
  userId: number;
  avatar?: string;
  bio?: string;
  address?: string;
  dateOfBirth?: string;
  gender?: 'MALE' | 'FEMALE' | 'OTHER';
}

// Property types
export interface Property {
  id: number;
  title: string;
  description: string;
  price: number;
  area: number;
  address: string;
  latitude?: number;
  longitude?: number;
  propertyType: 'APARTMENT' | 'HOUSE' | 'VILLA' | 'OFFICE' | 'LAND' | 'OTHER';
  transactionType: 'SALE' | 'RENT';
  status: 'AVAILABLE' | 'SOLD' | 'RENTED' | 'PENDING';
  isFeatured: boolean;
  userId: number;
  agentId?: number;
  provinceId: number;
  districtId: number;
  wardId: number;
  createdAt: string;
  updatedAt: string;
  user?: User;
  agent?: Agent;
  province?: Province;
  district?: District;
  ward?: Ward;
  propertyDetails?: PropertyDetail[];
  propertyImages?: PropertyImage[];
}

export interface PropertyDetail {
  id: number;
  propertyId: number;
  bedrooms?: number;
  bathrooms?: number;
  floors?: number;
  yearBuilt?: number;
  furnishing?: 'UNFURNISHED' | 'SEMI_FURNISHED' | 'FULLY_FURNISHED';
  parking?: boolean;
  balcony?: boolean;
  garden?: boolean;
  elevator?: boolean;
  security?: boolean;
  airConditioning?: boolean;
  additionalFeatures?: string;
}

export interface PropertyImage {
  id: number;
  propertyId: number;
  imageUrl: string;
  isPrimary: boolean;
  description?: string;
  createdAt: string;
}

export interface PropertyInquiry {
  id: number;
  propertyId: number;
  userId: number;
  message: string;
  contactPhone?: string;
  contactEmail?: string;
  status: 'PENDING' | 'REPLIED' | 'CLOSED';
  createdAt: string;
  property?: Property;
  user?: User;
}

export interface PropertyFavorite {
  id: number;
  userId: number;
  propertyId: number;
  createdAt: string;
  property?: Property;
}

// Location types
export interface Province {
  id: number;
  name: string;
  code: string;
}

export interface District {
  id: number;
  name: string;
  code: string;
  provinceId: number;
  province?: Province;
}

export interface Ward {
  id: number;
  name: string;
  code: string;
  districtId: number;
  district?: District;
}

// Agency & Agent types
export interface Agency {
  id: number;
  name: string;
  description?: string;
  address?: string;
  phoneNumber?: string;
  email?: string;
  website?: string;
  logo?: string;
  logoUrl?: string;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
  agents?: Agent[];
}

export interface Agent {
  id: number;
  userId: number;
  agencyId?: number;
  fullName: string;
  avatar: string;
  phoneNumber: string;
  email: string;
  licenseNumber: string;
  experience: number;
  rating: number;
  reviewCount: number;
  totalSales: number;
  specialties: string[];
  workingAreas: string[];
  description: string;
  achievements: string[];
  isVerified: boolean;
  isOnline: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  user?: User;
  agency?: Agency;
  properties?: Property[];
}

// News types
export interface News {
  id: string;
  title: string;
  slug: string;
  summary: string;
  content: string;
  category: 'MARKET_NEWS' | 'REGULATION' | 'TIPS' | 'TREND' | 'OTHER';
  imageUrl: string;
  authorId: string;
  status: 'PUBLISHED' | 'DRAFT' | 'ARCHIVED';
  viewCount: number;
  isFeatured: boolean;
  commentCount: number;
  publishedAt: string;
  createdAt: string;
  updatedAt: string;
  author?: {
    id: string;
    fullName: string;
    email: string;
    avatar: string;
  };
}

export interface NewsArticle extends News {
  // Alias for News type for backward compatibility
}

// Market Analysis types
export interface MarketAnalysis {
  id: number;
  title: string;
  summary: string;
  content: string;
  featuredImageUrl?: string;
  slug: string;
  category: 'MARKET_ANALYSIS' | 'TREND_ANALYSIS' | 'PRICE_ANALYSIS' | 'INVESTMENT_GUIDE' | 'EXPERT_VIEW';
  type: 'EXPERT_VIEW' | 'PRICE_CHART' | 'MARKET_REPORT' | 'INVESTMENT_GUIDE';
  author: string;
  tags: string[];
  publishedAt: string;
  createdAt: string;
  updatedAt: string;
  isPublished: boolean;
  viewCount: number;
  likeCount: number;
  shareCount: number;
  provinceId?: string;
  districtId?: string;
}

// Other types
export interface ListingPackage {
  id: number;
  name: string;
  description: string;
  price: number;
  duration: number;
  maxListings: number;
  features: string;
  isActive: boolean;
}

export interface Payment {
  id: number;
  userId: number;
  packageId: number;
  amount: number;
  paymentMethod: 'BANK_TRANSFER' | 'CREDIT_CARD' | 'E_WALLET';
  paymentStatus: 'PENDING' | 'COMPLETED' | 'FAILED' | 'CANCELLED';
  transactionId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Notification {
  id: number;
  userId: number;
  title: string;
  message: string;
  type: 'INFO' | 'SUCCESS' | 'WARNING' | 'ERROR';
  isRead: boolean;
  createdAt: string;
}

// API Response types
export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface PaginatedResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
}

// Form types
export interface LoginForm {
  email: string;
  password: string;
}

export interface RegisterForm {
  email: string;
  password: string;
  confirmPassword: string;
  fullName: string;
  phone: string;
}

export interface PropertySearchForm {
  provinceId?: number;
  districtId?: number;
  wardId?: number;
  propertyType?: string;
  transactionType?: string;
  minPrice?: number;
  maxPrice?: number;
  minArea?: number;
  maxArea?: number;
  bedrooms?: number;
  bathrooms?: number;
  keyword?: string;
  sortBy?: string;
  page?: number;
  size?: number;
}

export interface ContactForm {
  name: string;
  email: string;
  phone: string;
  message: string;
}