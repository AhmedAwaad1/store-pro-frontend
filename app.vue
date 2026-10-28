<template>
  <NuxtPage />
</template>

<script setup lang="ts">
import { nouranSiteContent } from '~/data/nouranSiteContent'

useHead(() => ({
  htmlAttrs: {
    lang: 'ar',
    dir: 'rtl',
    'data-theme': 'light',
  },
  title: nouranSiteContent.seo.title,
  link: [{ rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' }],
  meta: [
    { name: 'color-scheme', content: 'light' },
    { name: 'theme-color', content: '#f9f8f3' },
    { name: 'description', content: nouranSiteContent.seo.description },
    { name: 'robots', content: 'index,follow' },
  ],
}))
</script>
