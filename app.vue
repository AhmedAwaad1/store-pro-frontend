<template>
  <div v-if="isAdminRoute" class="sp-admin-app">
    <StoreProAdminShell v-if="!isAdminLoginRoute"><NuxtPage /></StoreProAdminShell>
    <NuxtPage v-else />
  </div>
  <div v-else class="sp-app">
    <main v-if="siteContentPending && !hasSiteContent" class="sp-content-status" role="status" aria-live="polite">
      <div class="sp-content-status-card"><span class="sp-content-spinner" aria-hidden="true"></span><p>Loading website content…</p></div>
    </main>
    <main v-else-if="siteContentUnavailable" class="sp-content-status" role="alert">
      <div class="sp-content-status-card"><span class="sp-content-status-mark" aria-hidden="true">!</span><p class="sp-content-status-eyebrow">STOREPRO WEBSITE</p><h1>Website content is unavailable</h1><p>We could not load this page’s content. Check the API connection and try again.</p><button type="button" class="sp-content-retry" :disabled="siteContentPending" @click="refreshSiteContent">Try again</button></div>
    </main>
    <template v-else>
      <StoreProHeader />
      <NuxtPage />
      <StoreProFooter />
      <ConsentBanner />
    </template>
  </div>
</template>

<script setup lang="ts">
const route = useRoute()
const config = useRuntimeConfig()
const { locale, direction } = useLocale()
const { theme } = useStoreProTheme()
const { pages, page, text, pending: siteContentPending, refresh: refreshSiteContent, refreshSilently } = await useSiteContent()
const global = page('global')
const hasSiteContent = computed(() => Boolean(pages.value?.global))

// Refresh prerendered content without hiding the existing page during the request.
onMounted(() => {
  if (!isAdminRoute.value && hasSiteContent.value) refreshSilently()
})
const isAdminRoute = computed(() => route.path === '/admin' || route.path.startsWith('/admin/'))
const isAdminLoginRoute = computed(() => route.path.replace(/\/+$/, '') === '/admin/login')
const siteOrigin = computed(() => String(config.public.siteUrl || '').replace(/\/$/, ''))
const noIndexRoute = computed(() => /^(?:\/admin(?:\/|$)|\/auth(?:\/|$)|\/login(?:\/|$)|\/register(?:\/|$))/.test(route.path))
const requiredContentKey = computed(() => {
  const path = route.path.replace(/\/+$/, '') || '/'
  if (path === '/') return 'home'
  if (path === '/page') return ''
  const keys: Record<string, string> = { '/services': 'services', '/about': 'about', '/portfolio': 'portfolio', '/pricing': 'pricing', '/contact': 'contact', '/blog': 'blog' }
  const prefix = Object.keys(keys).find((candidate) => path === candidate || path.startsWith(`${candidate}/`))
  return prefix ? keys[prefix] : ''
})
const siteContentUnavailable = computed(() => {
  if (siteContentPending.value) return false
  return !pages.value?.global || Boolean(requiredContentKey.value && !pages.value?.[requiredContentKey.value])
})

useHead(() => ({
  htmlAttrs: { lang: locale.value, dir: direction.value, 'data-theme': theme.value },
  title: text(global.value.meta?.site_title),
  link: global.value.favicon_image_url ? [{ rel: 'icon', href: global.value.favicon_image_url }] : [],
  meta: [
    { name: 'color-scheme', content: 'light dark' },
    { name: 'theme-color', content: theme.value === 'dark' ? '#0B0F19' : '#F8FAFC' },
    { name: 'description', content: text(global.value.meta?.site_description) },
    { name: 'robots', content: noIndexRoute.value ? 'noindex,nofollow' : 'index,follow' },
  ],
  script: [{ key: 'storepro-organization-jsonld', type: 'application/ld+json', innerHTML: JSON.stringify({ '@context': 'https://schema.org', '@type': 'Organization', name: text(global.value.brand_name), url: siteOrigin.value, logo: global.value.favicon_image_url || '' }) }],
}))
</script>

<style scoped>
.sp-content-status{display:grid;min-height:100vh;place-items:center;padding:24px;background:var(--sp-bg);color:var(--sp-text)}.sp-content-status-card{display:grid;width:min(100%,430px);justify-items:center;padding:38px 28px;border:1px solid var(--sp-line);border-radius:20px;background:var(--sp-surface);box-shadow:var(--sp-shadow);text-align:center}.sp-content-status-card>p{margin:12px 0 0;color:var(--sp-muted);font-size:.88rem;line-height:1.7}.sp-content-status-card h1{margin:2px 0 0;font-size:1.4rem;line-height:1.3}.sp-content-status-eyebrow{color:var(--sp-blue)!important;font-size:.67rem!important;font-weight:800;letter-spacing:.14em}.sp-content-status-mark{display:grid;width:42px;height:42px;place-items:center;border:1px solid color-mix(in srgb,var(--sp-blue) 20%,var(--sp-line));border-radius:13px;background:var(--sp-blue-pale);color:var(--sp-blue);font-size:1.1rem;font-weight:800}.sp-content-spinner{width:28px;height:28px;border:3px solid var(--sp-line);border-top-color:var(--sp-blue);border-radius:50%;animation:sp-content-spin .8s linear infinite}.sp-content-retry{min-height:42px;margin-top:20px;padding:0 17px;border:0;border-radius:9px;background:var(--sp-blue);color:#fff;font:inherit;font-size:.82rem;font-weight:750;cursor:pointer}.sp-content-retry:hover{background:var(--sp-blue-dark)}.sp-content-retry:focus-visible{outline:3px solid color-mix(in srgb,var(--sp-blue) 45%,transparent);outline-offset:3px}.sp-content-retry:disabled{opacity:.6;cursor:wait}@keyframes sp-content-spin{to{transform:rotate(360deg)}}@media(prefers-reduced-motion:reduce){.sp-content-spinner{animation-duration:1.8s}}
</style>
