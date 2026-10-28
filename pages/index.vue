<template>
  <NouranLandingPage :content="content" :settings="settings" :articles="articles" />
</template>

<script setup lang="ts">
import NouranLandingPage from '~/components/nouran/NouranLandingPage.vue'
import { useNouranCms } from '~/composables/useNouranCms'

const { content, settings, articles } = await useNouranCms()
const config = useRuntimeConfig()
const siteUrl = String(config.public.siteUrl || '').replace(/\/$/, '')
const seo = computed(() => settings.value.seo)

useSeoMeta({
  title: () => seo.value.title,
  description: () => seo.value.description,
  ogTitle: () => seo.value.title,
  ogDescription: () => seo.value.openGraphDescription,
  ogUrl: siteUrl || undefined,
  ogType: 'website',
  ogLocale: 'ar_EG',
  twitterCard: 'summary_large_image',
  ogImage: () => seo.value.social_image_url || undefined,
  twitterImage: () => seo.value.social_image_url || undefined,
})

useHead(() => ({
  htmlAttrs: { lang: 'ar', dir: 'rtl' },
  link: [
    { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
    { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
    { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Tajawal:wght@400;500;600;700;800&display=swap' },
    { rel: 'preload', as: 'image', href: content.value.hero.image_url || '/images/nouran/nouran-hero.webp' },
    ...(siteUrl ? [{ rel: 'canonical' as const, href: siteUrl }] : []),
  ],
  script: [{
    key: 'nouran-person-jsonld',
    type: 'application/ld+json',
    innerHTML: JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'Person',
      name: seo.value.doctorName,
      jobTitle: seo.value.jobTitle,
      sameAs: [settings.value.instagram_url],
      ...(siteUrl ? { url: siteUrl } : {}),
    }),
  }],
}))
</script>
