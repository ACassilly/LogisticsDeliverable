'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';

interface CompanyInfo {
  id: number;
  name: string;
  phone?: string;
  email?: string;
  website?: string;
  street?: string;
  city?: string;
  state_id?: [number, string];
  zip?: string;
  logo_web?: string;
  social_facebook?: string;
  social_twitter?: string;
  social_linkedin?: string;
}

interface OdooBrandingProps {
  companyId?: number;
  className?: string;
  showLogo?: boolean;
  showContact?: boolean;
  showSocial?: boolean;
}

/**
 * Component that fetches and displays company branding information from Odoo
 * Perfect for use in footer/header components
 */
export function OdooBranding({
  companyId = 3,
  className = '',
  showLogo = true,
  showContact = true,
  showSocial = true,
}: OdooBrandingProps): React.ReactElement {
  const [company, setCompany] = useState<CompanyInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchCompanyInfo(): Promise<void> {
      try {
        const response = await fetch(`/api/cms/company?companyId=${companyId}`);
        if (!response.ok) {
          throw new Error('Failed to fetch company info');
        }
        const data = await response.json();
        if (data.success) {
          setCompany(data.data);
        } else {
          setError(data.error || 'Failed to load company information');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    }

    fetchCompanyInfo();
  }, [companyId]);

  if (loading) {
    return <div className={className}>Loading company information...</div>;
  }

  if (error || !company) {
    return <div className={className}>Unable to load company branding</div>;
  }

  return (
    <div className={className}>
      {/* Logo */}
      {showLogo && company.logo_web && (
        <div className="mb-4">
          <Image
            src={company.logo_web}
            alt={company.name}
            width={200}
            height={100}
            className="h-auto w-auto"
          />
        </div>
      )}

      {/* Company Name */}
      <h3 className="mb-2 text-lg font-semibold">{company.name}</h3>

      {/* Contact Information */}
      {showContact && (
        <div className="mb-4 space-y-1 text-sm text-gray-600">
          {company.street && (
            <p>
              {company.street}
              {company.city && `, ${company.city}`}
              {company.state_id && ` ${company.state_id[1]}`}
              {company.zip && ` ${company.zip}`}
            </p>
          )}
          {company.phone && (
            <p>
              Phone:{' '}
              <a href={`tel:${company.phone}`} className="hover:underline">
                {company.phone}
              </a>
            </p>
          )}
          {company.email && (
            <p>
              Email:{' '}
              <a href={`mailto:${company.email}`} className="hover:underline">
                {company.email}
              </a>
            </p>
          )}
          {company.website && (
            <p>
              Website:{' '}
              <a
                href={company.website}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:underline"
              >
                {company.website}
              </a>
            </p>
          )}
        </div>
      )}

      {/* Social Media Links */}
      {showSocial && (company.social_facebook || company.social_twitter || company.social_linkedin) && (
        <div className="flex gap-4">
          {company.social_facebook && (
            <a
              href={company.social_facebook}
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-600 hover:text-blue-600"
              aria-label="Facebook"
            >
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
              </svg>
            </a>
          )}
          {company.social_twitter && (
            <a
              href={company.social_twitter}
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-600 hover:text-blue-400"
              aria-label="Twitter"
            >
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M23.953 4.57a10 10 0 002.856-3.515 9.953 9.953 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" />
              </svg>
            </a>
          )}
          {company.social_linkedin && (
            <a
              href={company.social_linkedin}
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-600 hover:text-blue-500"
              aria-label="LinkedIn"
            >
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.475-2.236-1.986-2.236-1.081 0-1.722.731-2.004 1.44-.103.249-.129.597-.129.946v5.419h-3.554s.05-8.736 0-9.643h3.554v1.364c.429-.662 1.196-1.608 2.902-1.608 2.12 0 3.71 1.384 3.71 4.362v5.525zM5.337 5.432a2.062 2.062 0 110-4.124 2.062 2.062 0 010 4.124zm1.782 15.02H3.555V5.809h3.564v14.643zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.225 0z" />
              </svg>
            </a>
          )}
        </div>
      )}
    </div>
  );
}

export default OdooBranding;
