type BrandLogoSource = {
  slug?: string | null
  logo_url?: string | null
}

const localBrandMarks: Record<string, string> = {
  acer: 'acer',
  apple: 'apple',
  asus: 'asus',
  bosch: 'bosch',
  dell: 'dell',
  fresh: 'fresh',
  hp: 'hp',
  huawei: 'huawei',
  lenovo: 'lenovo',
  lg: 'lg',
  samsung: 'samsung',
  sony: 'sony',
  'tp-link': 'tplink',
  tplink: 'tplink',
  xiaomi: 'xiaomi',
}

const darkSurfaceBrandMarks = new Set(['fresh', 'sony', 'tp-link', 'tplink'])
const wideWordmarkBrandMarks = new Set(['asus', 'samsung', 'sony'])

export function brandLogoUrl(brand: BrandLogoSource): string | null {
  const slug = (brand.slug || '').replace(/^demo-/, '')
  const localMark = localBrandMarks[slug]

  return localMark ? `/images/brands/${localMark}.svg` : brand.logo_url || null
}

export function brandLogoNeedsDarkSurface(brand: BrandLogoSource): boolean {
  return darkSurfaceBrandMarks.has((brand.slug || '').replace(/^demo-/, ''))
}

export function brandLogoNeedsWordmarkScale(brand: BrandLogoSource): boolean {
  return wideWordmarkBrandMarks.has((brand.slug || '').replace(/^demo-/, ''))
}
