const legacyRetailPrefixes = [
  '/account', '/admin', '/auth/google', '/branches', '/brands', '/cart', '/categories', '/category', '/checkout', '/collections', '/compare', '/forgot-password', '/login', '/offers', '/order-success', '/product', '/products', '/register', '/search', '/sub-category', '/verify-email', '/wishlist',
]

export default defineNuxtRouteMiddleware(async (to) => {
  const isLegacyRetailRoute = legacyRetailPrefixes.some((prefix) => to.path === prefix || to.path.startsWith(`${prefix}/`))
  if (isLegacyRetailRoute) return navigateTo('/', { redirectCode: 301 })
  if (to.matched.length > 0) return

  const { request } = useApi()
  try {
    const response = await request<{ destination_path: string | null; response_code: number }>(
      `/seo/redirect?path=${encodeURIComponent(to.path)}`,
    )
    const redirect = response.data
    if (redirect.response_code === 410) {
      throw createError({ statusCode: 410, statusMessage: 'This page is no longer available.' })
    }

    if (redirect.destination_path?.startsWith('/') && !redirect.destination_path.startsWith('//')) {
      return navigateTo(redirect.destination_path, { redirectCode: redirect.response_code })
    }
  } catch (error: any) {
    if (error?.statusCode === 410) throw error
  }
})
