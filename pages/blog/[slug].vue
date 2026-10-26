<template>
  <main class="sp-page"><section class="sp-section sp-blog-detail"><div class="sp-container sp-blog-article"><NuxtLink class="sp-text-link" to="/blog"><ArrowUpRight :size="17" />{{ text(content.all_articles) }}</NuxtLink><div v-if="pending" class="sp-empty-state" role="status">{{ text(content.loading_article) }}</div><div v-else-if="article"><header><span class="sp-eyebrow">{{ text(content.article_label) }}</span><h1>{{ articleTitle }}</h1><p>{{ articleDescription }}</p><small>{{ formatDate(article.published_at) }}</small></header><img v-if="article.image" class="sp-blog-cover" :src="article.image" :alt="articleTitle" width="1200" height="720" /><div class="sp-rich-content" :dir="locale === 'ar' ? 'rtl' : 'ltr'" v-html="safeContent" /></div><div v-else class="sp-empty-state"><h1>{{ text(content.not_found) }}</h1><NuxtLink class="sp-btn sp-btn-primary" to="/blog">{{ text(content.back_articles) }}</NuxtLink></div></div></section></main>
</template>
<script setup lang="ts">
import { ArrowUpRight } from 'lucide-vue-next'
import { sanitizePageHtml } from '~/utils/sanitizePageHtml'
type BlogArticle = { title?: string; title_en?: string; title_ar?: string; description?: string; description_en?: string; description_ar?: string; content?: string; content_en?: string; content_ar?: string; slug: string; image?: string | null; published_at?: string | null }
const route = useRoute()
const config = useRuntimeConfig()
const { locale } = useLocale()
const { page, text } = await useSiteContent()
const content = page('blog')
const global = page('global')
const { data: article, pending } = await useAsyncData<BlogArticle | null>(() => `storepro-blog-${String(route.params.slug)}`, async () => {
  try { const response = await $fetch<{ data: BlogArticle }>(`/blog/${encodeURIComponent(String(route.params.slug))}`, { baseURL: config.public.apiBase }); return response.data }
  catch { return null }
}, { server: false, default: () => null })
const articleTitle = computed(() => article.value ? (locale.value === 'ar' ? article.value.title_ar || article.value.title || article.value.title_en : article.value.title_en || article.value.title || article.value.title_ar) || '' : '')
const articleDescription = computed(() => article.value ? (locale.value === 'ar' ? article.value.description_ar || article.value.description || article.value.description_en : article.value.description_en || article.value.description || article.value.description_ar) || '' : '')
const articleContent = computed(() => article.value ? (locale.value === 'ar' ? article.value.content_ar || article.value.content || article.value.content_en : article.value.content_en || article.value.content || article.value.content_ar) || '' : '')
const safeContent = computed(() => sanitizePageHtml(articleContent.value))
const formatDate = (value?: string | null) => value ? new Intl.DateTimeFormat(locale.value === 'ar' ? 'ar-EG' : 'en', { dateStyle: 'medium' }).format(new Date(value)) : ''
useSeoMeta({ title: () => articleTitle.value ? `${articleTitle.value} | ${text(global.value.brand_name)}` : text(content.value.meta_title), description: () => articleDescription.value })
useHead(() => ({ link: [{ rel: 'canonical', href: `${String(config.public.siteUrl).replace(/\/$/, '')}/blog/${encodeURIComponent(String(route.params.slug))}` }] }))
</script>
