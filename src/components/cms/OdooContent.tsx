'use client';

import React, { useMemo } from 'react';
import DOMPurify from 'dompurify';

interface OdooContentProps {
  html?: string;
  className?: string;
}

/**
 * Component that safely renders HTML content from Odoo
 * Sanitizes the HTML using DOMPurify to prevent XSS attacks
 */
export function OdooContent({ html = '', className = '' }: OdooContentProps): React.ReactElement {
  const sanitizedHtml = useMemo(() => {
    if (!html) return '';
    
    // Configure DOMPurify to allow certain tags and attributes
    const config = {
      ALLOWED_TAGS: [
        'div', 'p', 'span', 'a', 'img', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
        'ul', 'ol', 'li', 'br', 'hr', 'strong', 'em', 'b', 'i', 'u', 'table',
        'thead', 'tbody', 'tr', 'td', 'th', 'form', 'input', 'button', 'label',
        'section', 'article', 'header', 'footer', 'nav', 'main',
      ],
      ALLOWED_ATTR: [
        'href', 'src', 'alt', 'title', 'class', 'id', 'style',
        'width', 'height', 'data-*', 'name', 'value', 'type',
      ],
      KEEP_CONTENT: true,
    };

    return DOMPurify.sanitize(html, config);
  }, [html]);

  if (!sanitizedHtml) {
    return <div className={className}>No content available</div>;
  }

  return (
    <div
      className={className}
      dangerouslySetInnerHTML={{ __html: sanitizedHtml }}
    />
  );
}

export default OdooContent;
