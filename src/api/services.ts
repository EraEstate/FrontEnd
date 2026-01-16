// Export all API modules
export { authAPI } from './auth';
export { propertyAPI } from './property';
export { userAPI } from './user';
export { profileAPI } from './profile';
export { locationAPI } from './location';
export { agentAPI } from './agent';
export { agencyAPI } from './agency';
export { newsAPI } from './news';
export { wikiAPI } from './wiki';
export { propertyViewAPI } from './propertyView';
export { propertyDetailAPI } from './propertyDetail';
export { propertyInquiryAPI } from './propertyInquiry';
export { propertyFavoriteAPI } from './propertyFavorite';
export { chatAPI } from './chat';
export { paymentAPI as newPaymentAPI } from './payment';
export { projectAPI, companyAPI } from './project';
export { marketAnalysisAPI } from './marketAnalysis';
export {
  notificationAPI,
  paymentAPI,
  listingPackageAPI
} from './misc';
export { bankAccountAPI } from './bankAccount';
export { propertyTransactionAPI } from './propertyTransaction';

// Export combined misc API
export { miscAPI } from './misc';

// Export hooks
export * from './hooks';

// Export the main api instance
export { api } from './index';