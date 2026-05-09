/**
 * Frontend Services
 * Export all service modules for centralized imports
 */

export { apiClient, fetchAPI } from '@/lib/api';
export { authService } from './auth.service';
export * from './blog.service';
export * from './quote.service';
export * from './contact.service';