const staticSiteRoutes = (() => {
  try {
    const routes = JSON.parse(process.env.NUXT_STATIC_SITE_ROUTES || '[]')
    return Array.isArray(routes) ? routes.filter((route) => typeof route === 'string') : []
  } catch {
    return []
  }
})()

export default defineNuxtConfig({
  devtools: { enabled: false },
  ssr: true,
  css: ['~/assets/css/store-pro.css'],
  runtimeConfig: {
    public: {
      apiBase: process.env.NUXT_PUBLIC_API_BASE || 'http://localhost:8000/api',
      siteUrl: process.env.NUXT_PUBLIC_SITE_URL || 'https://storepro.com',
    },
  },
  modules: ['@nuxtjs/google-fonts'],
  googleFonts: {
    families: { Cairo: [400, 500, 600, 700, 800] },
    display: 'swap',
  },
  app: {
    head: {
      htmlAttrs: { lang: 'ar', dir: 'rtl' },
      title: 'StorePro | حلول التجارة الإلكترونية',
      meta: [{ name: 'description', content: 'حلول متكاملة لبناء متجرك الإلكتروني وإدارة أعمالك.' }],
    },
  },
  vite: {
    server: { allowedHosts: ['.trycloudflare.com'] },
  },
  nitro: {
    preset: 'static',
    prerender: { routes: staticSiteRoutes, failOnError: false },
  },
  compatibilityDate: '2025-01-01',
})

