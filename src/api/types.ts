// Common API Response Types
export interface ApiResponse<T> {
  data: T;
  message?: string;
  status: number;
  success: boolean;
}

export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
  numberOfElements: number;
}

// Auth Types
export interface LoginRequest {
  username: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  password: string;
  email: string;
  fullName: string;
  phoneNumber: string;
}

export interface AuthResponse {
  token: string;
  user: User;
  expiresIn: number;
}

// User Types
export interface User {
  id: string;
  email: string;
  fullName: string;
  phone: string;
  role: 'USER' | 'AGENT' | 'ADMIN';
  enabled: boolean;
  avatar?: string;
  createdAt: string;
  updatedAt: string;
}

export interface UserProfile {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  avatar?: string;
  address?: string;
  dateOfBirth?: string;
  gender?: 'MALE' | 'FEMALE' | 'OTHER';
  occupation?: string;
  bio?: string;
}

// Property Types
export interface Property {
  id: string;
  title: string;
  description: string;
  propertyType: 'APARTMENT' | 'HOUSE' | 'VILLA' | 'OFFICE' | 'LAND' | 'COMMERCIAL';
  listingType: 'SALE' | 'RENT';
  price: number;
  area: number;
  bedrooms?: number;
  bathrooms?: number;
  address: string;
  city: string;
  district: string;
  ward?: string;
  latitude?: number;
  longitude?: number;
  images: string[];
  features: string[];
  status: 'ACTIVE' | 'SOLD' | 'RENTED' | 'INACTIVE';
  views: number;
  isFeatured: boolean;
  createdAt: string;
  updatedAt: string;
  owner: User;
  agent?: Agent;
}

export interface PropertySearchParams {
  query?: string;
  city?: string;
  district?: string;
  ward?: string;
  propertyType?: string;
  listingType?: string;
  minPrice?: number;
  maxPrice?: number;
  minArea?: number;
  maxArea?: number;
  bedrooms?: number;
  bathrooms?: number;
  page?: number;
  size?: number;
  sortBy?: string;
  sortDir?: 'asc' | 'desc';
}

export interface PropertyCreateRequest {
  title: string;
  description: string;
  propertyType: string;
  listingType: string;
  price: number;
  area: number;
  bedrooms?: number;
  bathrooms?: number;
  address: string;
  city: string;
  district: string;
  ward?: string;
  latitude?: number;
  longitude?: number;
  images: string[];
  features: string[];
}

// Location Types
export interface Province {
  id: string;
  name: string;
  code: string;
}

export interface District {
  id: string;
  name: string;
  code: string;
  provinceId: string;
}

export interface Ward {
  id: string;
  name: string;
  code: string;
  districtId: string;
}

// Agent Types
export interface Agent {
  id: string;
  agentCode: string;
  licenseNumber: string;
  specialization?: string;
  experienceYears?: number;
  isVerified: boolean;
  isFeatured: boolean;
  ratingAverage: number;
  ratingCount: number;
  isActive: boolean;
  user: User;
  agency: Agency;
  createdAt: string;
  updatedAt: string;
}

// Agency Types
export interface Agency {
  id: string;
  name: string;
  description?: string;
  address: string;
  phone: string;
  email: string;
  website?: string;
  licenseNumber: string;
  logo?: string;
  isVerified: boolean;
  ratingAverage: number;
  ratingCount: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// News Types
export interface NewsArticle {
  id: string;
  title: string;
  content: string;
  summary: string;
  category: 'MARKET_NEWS' | 'INVESTMENT_TIPS' | 'LEGAL_GUIDE' | 'TREND_ANALYSIS';
  tags: string[];
  thumbnail?: string;
  images: string[];
  views: number;
  isPublished: boolean;
  publishedAt?: string;
  author: User;
  createdAt: string;
  updatedAt: string;
}

// Property Detail Types
export interface PropertyDetail {
  id: string;
  propertyId: string;
  buildingName?: string;
  floorNumber?: number;
  totalFloors?: number;
  apartmentNumber?: string;
  yearBuilt?: number;
  facingDirection?: 'NORTH' | 'SOUTH' | 'EAST' | 'WEST' | 'NORTHEAST' | 'NORTHWEST' | 'SOUTHEAST' | 'SOUTHWEST';
  hasElevator?: boolean;
  hasParking?: boolean;
  hasGarden?: boolean;
  hasSwimmingPool?: boolean;
  hasSecurity?: boolean;
  furnishedStatus?: 'FURNISHED' | 'SEMI_FURNISHED' | 'UNFURNISHED';
  additionalNotes?: string;
  createdAt?: string;
  updatedAt?: string;
}

// Property Inquiry Types
export interface PropertyInquiry {
  id: string;
  propertyId: string;
  inquirerId?: string;
  agentId?: string;
  inquirerName: string;
  inquirerEmail: string;
  inquirerPhone: string;
  inquiryType: 'GENERAL_INFO' | 'SCHEDULE_VIEWING' | 'PRICE_NEGOTIATION' | 'FINANCING_INFO' | 'PROPERTY_HISTORY' | 'NEIGHBORHOOD_INFO' | 'OTHER';
  message: string;
  preferredContactTime?: string;
  preferredContactMethod?: 'EMAIL' | 'PHONE' | 'SMS' | 'WHATSAPP' | 'ZALO';
  status: 'NEW' | 'IN_PROGRESS' | 'RESPONDED' | 'CLOSED' | 'SPAM';
  agentResponse?: string;
  respondedAt?: string;
  createdAt: string;
  updatedAt?: string;
  
  // Relations
  property?: Property;
  inquirer?: User;
  agent?: Agent;
}

// Property Favorite Types
export interface PropertyFavorite {
  id: string;
  userId: string;
  propertyId: string;
  property?: Property;
  createdAt: string;
  updatedAt?: string;
}

// Notification Types
export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'PROPERTY' | 'PAYMENT' | 'SYSTEM' | 'PROMOTION';
  relatedId?: string;
  isRead: boolean;
  createdAt: string;
}

// Payment Types
export interface Payment {
  id: string;
  userId: string;
  packageId: string;
  amount: number;
  paymentMethod: string;
  status: 'PENDING' | 'SUCCESS' | 'FAILED' | 'CANCELLED';
  gatewayResponse?: string;
  createdAt?: string;
  processedAt?: string;
}

// Listing Package Types
export interface ListingPackage {
  id: string;
  name: string;
  description: string;
  price: number;
  duration: number; // in days
  features: string[];
  maxProperties?: number;
  priority: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// Wiki Article Types
export interface WikiArticle {
  id: string;
  title: string;
  slug: string;
  summary: string;
  content: string;
  featuredImageUrl?: string;
  authorId: string;
  author?: User;
  category: WikiCategory;
  status: WikiArticleStatus;
  viewCount: number;
  isFeatured: boolean;
  publishedAt?: string;
  createdAt: string;
  updatedAt?: string;
}

export type WikiCategory =
  | 'MUA_BDS'
  | 'BAN_BDS'
  | 'THUE_BDS'
  | 'TAI_CHINH_BDS'
  | 'QUY_HOACH_PHAP_LY'
  | 'NOI_NGOAI_THAT'
  | 'PHONG_THUY';

export type WikiArticleStatus = 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';

export interface WikiArticleCreateRequest {
  title: string;
  summary: string;
  content: string;
  category: WikiCategory;
  featuredImageUrl?: string;
}

export interface WikiArticleUpdateRequest {
  title?: string;
  summary?: string;
  content?: string;
  category?: WikiCategory;
  featuredImageUrl?: string;
}

// Error Types
export interface ApiError {
  message: string;
  status: number;
  code?: string;
  details?: any;
}

// Project Types
export interface Project {
  id: number;
  name: string;
  description: string;
  developer: string;
  investor: string;
  projectCode: string;
  province?: Province;
  district?: District;
  ward?: Ward;
  address: string;
  area: number;
  projectType: string;
  projectStatus: string;
  minPrice: number;
  maxPrice: number;
  currency: string;
  featuredImageUrl?: string;
  overview: string;
  utilities: string;
  locationAdvantages: string;
  investmentAttractions: string;
  contactPhone: string;
  contactEmail: string;
  websiteUrl: string;
  status: string;
  viewCount: number;
  createdBy?: User;
  createdAt: string;
  updatedAt: string;
  properties?: Property[];
  images?: ProjectImage[];
}

export interface ProjectImage {
  id: number;
  project: Project;
  imageUrl: string;
  imageType: string;
  caption?: string;
  displayOrder: number;
  status: string;
  createdAt: string;
}

// Company Types
export interface Company {
  id: number;
  name: string;
  shortName?: string;
  taxCode: string;
  address: string;
  province?: Province;
  district?: District;
  phone: string;
  email: string;
  websiteUrl?: string;
  representative?: string;
  companyType: string;
  logoUrl?: string;
  about?: string;
  status: string;
  projectCount: number;
  propertyCount: number;
  createdAt: string;
  updatedAt: string;
  projects?: Project[];
  agencies?: Agency[];
  properties?: Property[];
}

// Market Analysis Types
export interface MarketAnalysis {
  id: number;
  title: string;
  summary?: string;
  content?: string;
  featuredImageUrl?: string;
  slug: string;
  category: 'PRICE_CHART' | 'VIDEO_REVIEW' | 'MARKET_REPORT' | 'EXPERT_VIEW' | 'INTERACTIVE_STORY';
  type: 'MARKET_ANALYSIS' | 'PRICE_ANALYSIS' | 'TREND_ANALYSIS' | 'INVESTMENT_GUIDE' | 'EXPERT_OPINION' | 'NEWS_ANALYSIS';
  author?: string;
  tags?: string | string[];
  publishedAt: string;
  createdAt: string;
  updatedAt: string;
  isPublished: boolean;
  viewCount: number;
  likeCount: number;
  shareCount: number;
  province?: Province;
  district?: District;
  project?: Project;
  company?: Company;
  relatedAnalyses?: MarketAnalysis[];
}

// Location Types (extended)
export interface Province {
  id: string;
  code: string;
  name: string;
  nameEn: string;
  fullName: string;
  fullNameEn: string;
  codeName: string;
  administrativeUnitId: string;
}

export interface District {
  id: string;
  code: string;
  name: string;
  nameEn: string;
  fullName: string;
  fullNameEn: string;
  codeName: string;
  provinceId: string;
  administrativeUnitId: string;
}

export interface Ward {
  id: string;
  code: string;
  name: string;
  nameEn: string;
  fullName: string;
  fullNameEn: string;
  codeName: string;
  districtId: string;
  administrativeUnitId: string;
}