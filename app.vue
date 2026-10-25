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
const isAdminRoute = computed(() => route.path === '/admin' || route.path.startsWith('/admin/'))
const isAdminLoginRoute = computed(() => route.path.replace(/\/+$/, '') === '/admin/login')
const siteOrigin = computed(() => String(config.public.siteUrl || 'https://storepro.com').replace(/\/$/, ''))
const noIndexRoute = computed(() => /^(?:\/admin(?:\/|$)|\/auth(?:\/|$)|\/login(?:\/|$)|\/register(?:\/|$))/.test(route.path))

useHead(() => ({
  htmlAttrs: { lang: locale.value, dir: direction.value, 'data-theme': theme.value },
  link: [{ rel: 'icon', href: '/favicon.svg' }],
  meta: [
    { name: 'color-scheme', content: 'light dark' },
    { name: 'theme-color', content: theme.value === 'dark' ? '#0B0F19' : '#F8FAFC' },
    { name: 'robots', content: noIndexRoute.value ? 'noindex,nofollow' : 'index,follow' },
  ],
  script: [{
    key: 'storepro-organization-jsonld',
    type: 'application/ld+json',
    innerHTML: JSON.stringify({ '@context': 'https://schema.org', '@type': 'Organization', name: 'StorePro', url: siteOrigin.value, logo: `${siteOrigin.value}/favicon.svg` }),
  }],
}))
</script>
