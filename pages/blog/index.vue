<template>
  <main class="sp-page"><section class="sp-page-hero"><div class="sp-container"><span class="sp-eyebrow">{{ isEnglish ? 'StorePro articles' : 'مقالات StorePro' }}</span><h1>{{ isEnglish ? 'Ideas for building your online business' : 'أفكار تساعدك على تطوير تجارتك الإلكترونية' }}</h1><p>{{ isEnglish ? 'Guides and practical notes about ecommerce, store operations, and growth.' : 'أدلة ومقالات عملية عن التجارة الإلكترونية وإدارة المتاجر والنمو.' }}</p></div></section><section class="sp-section"><div class="sp-container"><div v-if="pending" class="sp-empty-state" role="status">{{ isEnglish ? 'Loading articles…' : 'جارٍ تحميل المقالات…' }}</div><div v-else-if="articles.length" class="sp-blog-grid"><article v-for="article in articles" :key="article.id" class="sp-blog-card"><NuxtLink :to="`/blog/${article.slug}`"><img v-if="article.image" :src="article.image" :alt="titleOf(article)" width="720" height="480" loading="lazy" /><span v-else class="sp-blog-placeholder"><BookOpen :size="30" /></span><div class="sp-blog-copy"><small>{{ formatDate(article.published_at) }}</small><h2>{{ titleOf(article) }}</h2><p>{{ descriptionOf(article) }}</p><span class="sp-card-link">{{ isEnglish ? 'Read article' : 'اقرأ المقال' }} <ArrowUpLeft :size="15" /></span></div></NuxtLink></article></div><div v-else class="sp-empty-state"><BookOpen :size="30" /><h2>{{ isEnglish ? 'Articles are coming soon' : 'المقالات قريبًا' }}</h2><p>{{ isEnglish ? 'Our team is preparing useful content for store owners.' : 'يعمل فريقنا على إعداد محتوى مفيد لأصحاب المتاجر.' }}</p></div></div></section></main>
</template>
<script setup lang="ts">
import { ArrowUpLeft, BookOpen } from 'lucide-vue-next'
type BlogArticle = { id: number; title?: string; title_en?: string; title_ar?: string; description?: string; description_en?: string; description_ar?: string; slug: string; image?: string | null; published_at?: string | null }
const { isEnglish, locale } = useLocale()
const config = useRuntimeConfig()
const { data: articles, pending } = await useAsyncData<BlogArticle[]>('storepro-blog-list', async () => {
  try {
    const response = await $fetch<{ data: any }>('/blog', { baseURL: config.public.apiBase })
    const collection = response.data
    return Array.isArray(collection) ? collection : Array.isArray(collection?.data) ? collection.data : []
  } catch { return [] }
}, { default: () => [] })
const titleOf = (article: BlogArticle) => locale.value === 'ar' ? article.title_ar || article.title || article.title_en || '' : article.title_en || article.title || article.title_ar || ''
const descriptionOf = (article: BlogArticle) => locale.value === 'ar' ? article.description_ar || article.description || article.description_en || '' : article.description_en || article.description || article.description_ar || ''
const formatDate = (value?: string | null) => value ? new Intl.DateTimeFormat(locale.value === 'ar' ? 'ar-EG' : 'en', { dateStyle: 'medium' }).format(new Date(value)) : ''
useSeoMeta({ title: () => isEnglish.value ? 'StorePro articles' : 'مقالات StorePro', description: () => isEnglish.value ? 'Practical ecommerce guides from StorePro.' : 'مقالات وأدلة عملية عن التجارة الإلكترونية من StorePro.' })
</script>
