/**
 * Contact Service (Frontend)
 *
 * Submits contact form data to the /api/contact endpoint
 * which creates a CRM lead in Odoo.
 */

import { apiClient } from '@/lib/api';
import { CONTACT_API_ENDPOINTS } from '@/constants';
import type { ContactFormData } from '@/validations/contact.validation';
import type { ContactSubmissionResponse } from '@/types';

/**
 * Submit the contact form to the backend.
 *
 * @param data - Validated contact form data
 * @returns Response with success status and optional lead ID
 */
export async function submitContactForm(
  data: ContactFormData,
): Promise<ContactSubmissionResponse> {
  const response = await apiClient.post<ContactSubmissionResponse>(
    CONTACT_API_ENDPOINTS.SUBMIT,
    data,
  );
  return response.data;
}
