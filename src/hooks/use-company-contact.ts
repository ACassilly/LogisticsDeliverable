import { useState, useEffect } from 'react';

export interface CompanyContact {
  phone?: string;
  email?: string;
  address?: string;
  city?: string;
  state?: string;
  zip?: string;
  logo_web?: string;
  social_facebook?: string;
  social_twitter?: string;
  social_linkedin?: string;
  social_instagram?: string;
  business_hours?: string;
}

// Fallback values if Odoo API is unavailable
const FALLBACK_COMPANY_CONTACT: CompanyContact = {
  phone: '(502) 385-3399',
  email: 'connect@portlandialogistics.com',
  address: 'Louisville',
  city: 'Louisville',
  state: 'KY',
  zip: '40203',
  business_hours: 'Mon-Fri: 8AM-6PM EST',
};

export function useCompanyContact(companyId: number = 3): {
  contact: CompanyContact;
  loading: boolean;
  error: string | null;
} {
  const [contact, setContact] = useState<CompanyContact>(FALLBACK_COMPANY_CONTACT);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchCompanyContact(): Promise<void> {
      try {
        setLoading(true);
        const response = await fetch(`/api/cms/company?companyId=${companyId}`, {
          // Don't cache this to get fresh data
          cache: 'no-store',
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch company info: ${response.status}`);
        }

        const data = await response.json();

        if (data.success && data.data) {
          // Extract relevant fields from Odoo company data
          const companyData = data.data;
          setContact({
            phone: companyData.phone || FALLBACK_COMPANY_CONTACT.phone,
            email: companyData.email || FALLBACK_COMPANY_CONTACT.email,
            address: companyData.street || FALLBACK_COMPANY_CONTACT.address,
            city: companyData.city || FALLBACK_COMPANY_CONTACT.city,
            state: companyData.state_id?.[1] || FALLBACK_COMPANY_CONTACT.state,
            zip: companyData.zip || FALLBACK_COMPANY_CONTACT.zip,
            logo_web: companyData.logo_web,
            social_facebook: companyData.social_facebook,
            social_twitter: companyData.social_twitter,
            social_linkedin: companyData.social_linkedin,
            business_hours: FALLBACK_COMPANY_CONTACT.business_hours, // Keep hardcoded for now
          });
          setError(null);
        } else {
          setContact(FALLBACK_COMPANY_CONTACT);
          setError('Failed to load company info');
        }
      } catch (err) {
        console.warn(
          'Error fetching company contact info, using fallback:',
          err instanceof Error ? err.message : 'Unknown error'
        );
        setContact(FALLBACK_COMPANY_CONTACT);
        setError(err instanceof Error ? err.message : 'Failed to fetch company contact');
      } finally {
        setLoading(false);
      }
    }

    fetchCompanyContact();
  }, [companyId]);

  return { contact, loading, error };
}
