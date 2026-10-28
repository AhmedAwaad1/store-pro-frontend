const staticSiteRoutes = (() => {
  try {
    const routes = JSON.parse(process.env.NUXT_STATIC_SITE_ROUTES || '[]')
    return Array.isArray(routes) ? routes.filter((route) => typeof route === 'string') : []
  } catch {
    return []
  }
})()
const staticDeployment = process.env.NUXT_DEPLOY_MODE === 'static'

export default defineNuxtConfig({
  devtools: { enabled: false },
  ssr: true,
  css: ['~/assets/css/nouran-site.css'],
  runtimeConfig: {
    apiInternalBase: process.env.NUXT_API_INTERNAL_BASE || (process.env.NODE_ENV === 'development' ? 'http://127.0.0.1:8000/api' : ''),
    public: {
      apiBase: process.env.NUXT_PUBLIC_API_BASE || (process.env.NODE_ENV === 'development' ? 'http://localhost:8000/api' : '/api'),
      siteUrl: process.env.NUXT_PUBLIC_SITE_URL || '',
    },
  },
  vite: {
    server: { allowedHosts: ['.trycloudflare.com'] },
  },
  nitro: staticDeployment ? {
    preset: 'static',
    prerender: { routes: staticSiteRoutes, ignore: [/^\/admin(?:\/|$)/], failOnError: false },
  } : {},
  compatibilityDate: '2025-01-01',
})
