<template>
  <main class="static-page">
    <div class="container">
      <nav class="page-breadcrumb" :aria-label="t('pagePath')">
        <NuxtLink to="/">{{ t('home') }}</NuxtLink>
        <span aria-hidden="true">/</span>
        <span>{{ title || t('pagePath') }}</span>
      </nav>

      <div v-if="pending" class="page-status" role="status">{{ t('loadingPage') }}</div>
      <div v-else-if="error || !page" class="page-status">
        <h1>{{ t('pageUnavailable') }}</h1>
        <p>{{ t('pageUnavailableText') }}</p>
        <NuxtLink to="/" class="btn primary">{{ t('backHome') }}</NuxtLink>
      </div>
      <article v-else class="page-article">
        <header class="page-heading">
          <span class="eyebrow">StorePro · {{ isEnglish ? 'Information' : 'معلومات' }}</span>
          <h1>{{ title }}</h1>
          <span class="page-heading-line" aria-hidden="true"></span>
        </header>
        <img v-if="page.image_url" class="page-image" :src="page.image_url" :alt="title" />
        <div v-if="html" class="page-content" :dir="contentDirection" v-html="html"></div>
        <p v-else class="page-empty">{{ t('pageSoon') }}</p>
      </article>
    </div>
  </main>
</template>

<script setup lang="ts">
import { sanitizePageHtml } from '~/utils/sanitizePageHtml'
import { getLocalizedContent } from '~/utils/localizedContent'
const { locale, isEnglish, t } = useLocale()

const route = useRoute()
const { find } = useStaticPages()
const key = computed(() => typeof route.query.key === 'string' ? route.query.key : '')
const { data: page, pending, error } = await useAsyncData(
  () => `storefront-page-${key.value}`,
  () => key.value ? find(key.value) : Promise.resolve(null),
  { server: false, default: () => null },
)
const title = computed(() => page.value ? getLocalizedContent(locale.value, page.value.title_ar, page.value.title_en) : '')
const description = computed(() => page.value ? getLocalizedContent(locale.value, page.value.description_ar, page.value.description_en) : '')
const seoTitle = computed(() => page.value ? getLocalizedContent(locale.value, page.value.meta_title_ar, page.value.meta_title_en, title.value) : title.value)
const seoDescription = computed(() => page.value ? getLocalizedContent(locale.value, page.value.meta_description_ar, page.value.meta_description_en, description.value) : description.value)
const canonicalPath = computed(() => key.value ? `/page?key=${encodeURIComponent(key.value)}` : '/page')
useCanonicalLinks(canonicalPath)
useSeoMeta({ title: seoTitle, description: seoDescription, ogTitle: seoTitle, ogDescription: seoDescription })
const contentDirection = computed(() => locale.value === 'ar' ? 'rtl' : 'ltr')
const html = computed(() => sanitizePageHtml(description.value))

useHead(() => ({ title: seoTitle.value ? `${seoTitle.value} | StorePro` : t('pagePath') }))
</script>

<style scoped>
.static-page{padding:28px 0 96px;min-height:55vh}
.page-breadcrumb{display:flex;align-items:center;gap:10px;color:var(--muted);font-size:.85rem;margin-bottom:35px}
.page-breadcrumb a:hover{color:var(--green);text-decoration:underline}
.page-article{max-width:900px;margin-inline:auto}
.page-heading{text-align:center;margin:0 auto 40px}
.page-heading h1{font-size:clamp(2rem,4vw,3.25rem);line-height:1.3;margin:8px 0 18px;text-wrap:balance}
.page-heading-line{display:block;width:64px;height:3px;border-radius:4px;background:var(--coral);margin-inline:auto}
.page-image{display:block;width:100%;max-height:440px;object-fit:cover;border-radius:var(--radius);margin-bottom:36px}
.page-content{background:var(--theme-surface);border:1px solid var(--line);border-radius:var(--radius);padding:clamp(24px,5vw,56px);font-size:1.04rem;line-height:2;color:var(--ink);overflow-wrap:anywhere}
.page-content :deep(> :first-child){margin-top:0}
.page-content :deep(> :last-child){margin-bottom:0}
.page-content :deep(h2),.page-content :deep(h3),.page-content :deep(h4){line-height:1.45;color:var(--green);margin:1.6em 0 .6em}
.page-content :deep(p){margin:0 0 1.15em}
.page-content :deep(ul),.page-content :deep(ol){padding-inline-start:1.7em;margin:0 0 1.3em}
.page-content :deep(li){margin-bottom:.35em}
.page-content :deep(a){color:var(--green);text-decoration:underline;text-underline-offset:3px}
.page-content :deep(blockquote){border-inline-start:3px solid var(--coral);margin:1.5em 0;padding-inline-start:1.25em;color:var(--muted)}
.page-status,.page-empty{text-align:center;color:var(--muted);padding:64px 16px}
.page-status h1{color:var(--ink);margin:0 0 8px}.page-status p{margin:0 0 20px}
@media(max-width:600px){.static-page{padding:20px 0 64px}.page-breadcrumb{margin-bottom:24px}.page-heading{margin-bottom:28px}.page-content{font-size:1rem;line-height:1.9}.page-image{margin-bottom:24px}}
</style>
