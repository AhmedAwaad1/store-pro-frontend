<template>
  <div v-if="isAdminRoute" class="sp-admin-app">
    <StoreProAdminShell v-if="!isAdminLoginRoute"><NuxtPage /></StoreProAdminShell>
    <NuxtPage v-else />
  </div>
  <div v-else class="sp-app">
    <StoreProHeader />
    <NuxtPage />
    <StoreProFooter />
    <ConsentBanner />
  </div>
</template>

<script setup lang="ts">
const route = useRoute()
const config = useRuntimeConfig()
const { locale, direction } = useLocale()
const { theme } = useStoreProTheme()
const { page, text } = await useSiteContent()
const global = page('global')
const isAdminRoute = computed(() => route.path === '/admin' || route.path.startsWith('/admin/'))
const isAdminLoginRoute = computed(() => route.path.replace(/\/+$/, '') === '/admin/login')
const siteOrigin = computed(() => String(config.public.siteUrl || '').replace(/\/$/, ''))
const noIndexRoute = computed(() => /^(?:\/admin(?:\/|$)|\/auth(?:\/|$)|\/login(?:\/|$)|\/register(?:\/|$))/.test(route.path))

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
  script: [{
    key: 'storepro-organization-jsonld',
    type: 'application/ld+json',
    innerHTML: JSON.stringify({ '@context': 'https://schema.org', '@type': 'Organization', name: text(global.value.brand_name), url: siteOrigin.value, logo: global.value.favicon_image_url || '' }),
  }],
}))
</script>
