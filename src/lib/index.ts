// Export all lib configurations
export { apiClient, fetchAPI } from './api';
export { queryClient, queryKeys } from './react-query';
export { Providers } from './providers';

// Export Odoo client
export { odooSearchRead, odooRead, odooCreate, odooWrite, PORTAL_GROUP_MAP } from './odoo-client';

// Export CMS functions
export { getWebsiteMenus, getWebsitePages, getCompanyInfo, getOdooPageContent } from './odoo-cms';
