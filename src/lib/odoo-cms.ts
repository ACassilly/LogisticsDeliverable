import { odooSearchRead, odooRead } from './odoo-client';

/**
 * Fetch website menus from Odoo
 */
export async function getWebsiteMenus(websiteId: number = 8): Promise<any[]> {
  try {
    const menus = await odooSearchRead(
      'website.menu',
      [['website_id', '=', websiteId], ['is_visible', '=', true]],
      ['id', 'name', 'url', 'page_id', 'sequence', 'menu_type', 'icon_class']
    );
    return menus || [];
  } catch (error) {
    console.error('Error fetching website menus:', error);
    return [];
  }
}

/**
 * Fetch website pages from Odoo
 */
export async function getWebsitePages(websiteId: number = 8): Promise<any[]> {
  try {
    const pages = await odooSearchRead(
      'website.page',
      [['website_id', '=', websiteId], ['is_published', '=', true]],
      ['id', 'name', 'url', 'page_title', 'description', 'create_date', 'write_date']
    );
    return pages || [];
  } catch (error) {
    console.error('Error fetching website pages:', error);
    return [];
  }
}

/**
 * Fetch company information for branding
 */
export async function getCompanyInfo(companyId: number = 3): Promise<any> {
  try {
    const companies = await odooRead(
      'res.company',
      [companyId],
      [
        'name',
        'phone',
        'email',
        'website',
        'street',
        'city',
        'state_id',
        'zip',
        'logo_web',
        'social_facebook',
        'social_twitter',
        'social_linkedin',
      ]
    );
    return companies && companies.length > 0 ? companies[0] : null;
  } catch (error) {
    console.error('Error fetching company info:', error);
    return null;
  }
}

/**
 * Fetch page content HTML from Odoo (ir.ui.view)
 */
export async function getOdooPageContent(pageId: number): Promise<string> {
  try {
    const views = await odooRead(
      'ir.ui.view',
      [pageId],
      ['arch_db', 'name', 'type']
    );
    return views && views.length > 0 ? views[0].arch_db : '';
  } catch (error) {
    console.error('Error fetching page content:', error);
    return '';
  }
}
