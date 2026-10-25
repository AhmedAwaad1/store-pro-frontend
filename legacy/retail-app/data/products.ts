/**
 * Formats amounts returned by the catalog API.
 *
 * Catalog fixtures belong in the backend DemoCatalogSeeder. The storefront must
 * never contain fallback product or category data.
 */
export const formatPrice = (value: number, locale: 'ar' | 'en' = 'ar') => locale === 'en'
  ? `${new Intl.NumberFormat('en-EG').format(value)} EGP`
  : `${new Intl.NumberFormat('ar-EG').format(value)} جنيه`
