<template>
  <div class="sp-app">
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
const siteOrigin = computed(() => String(config.public.siteUrl || 'https://storepro.com').replace(/\/$/, ''))
const noIndexRoute = computed(() => /^(?:\/auth(?:\/|$)|\/login(?:\/|$)|\/register(?:\/|$))/.test(route.path))
useHead(() => ({
  htmlAttrs: { lang: locale.value, dir: direction.value },
  link: [{ rel: 'icon', href: '/favicon.svg' }],
  meta: [
    { name: 'theme-color', content: '#0b2141' },
    { name: 'robots', content: noIndexRoute.value ? 'noindex,nofollow' : 'index,follow' },
  ],
  script: [{
    key: 'storepro-organization-jsonld',
    type: 'application/ld+json',
    innerHTML: JSON.stringify({ '@context': 'https://schema.org', '@type': 'Organization', name: 'StorePro', url: siteOrigin.value, logo: `${siteOrigin.value}/favicon.svg` }),
  }],
}))
</script>
