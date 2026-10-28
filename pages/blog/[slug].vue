<template>
  <main class="nouran-article-page">
    <article v-if="article" class="nouran-article-detail">
      <header class="nouran-article-heading">
        <div class="container">
          <NuxtLink class="nouran-articles-back" to="/blog">{{ content.blog.allArticles }} ←</NuxtLink>
          <span class="section-kicker">{{ content.blog.articleLabel }}</span>
          <h1>{{ articleTitle }}</h1>
          <p v-if="articleDescription">{{ articleDescription }}</p>
          <time v-if="article.published_at" :datetime="article.published_at">{{ formatDate(article.published_at) }}</time>
        </div>
      </header>
      <div class="container nouran-article-body">
        <img v-if="article.image" class="nouran-article-cover" :src="article.image" :alt="articleTitle" width="1200" height="720" fetchpriority="high" decoding="async" />
        <div class="nouran-rich-content" dir="rtl" v-html="safeContent" />
        <NuxtLink class="nouran-articles-back nouran-article-back-bottom" to="/blog">{{ content.blog.allArticles }} ←</NuxtLink>
      </div>
    </article>
    <section v-else class="container nouran-article-not-found">
      <span class="section-kicker">{{ content.blog.articleLabel }}</span>
      <h1>{{ content.blog.notFound }}</h1>
      <NuxtLink class="btn btn-primary" to="/blog">{{ content.blog.backToArticles }}</NuxtLink>
    </section>
    <NouranSiteFooter :content="content.footer" :brand="content.brand" :doctor-name="content.header.doctor" :instagram-url="settings.instagram_url" :whatsapp-url="settings.whatsapp_url" :year="year" />
  </main>
</template>

<script setup lang="ts">
import { $fetch } from 'ofetch'
import type { NouranBlogArticle } from '~/data/nouranSiteContent'
import { sanitizePageHtml } from '~/utils/sanitizePageHtml'
import NouranSiteFooter from '~/components/nouran/NouranSiteFooter.vue'

const route = useRoute()
const config = useRuntimeConfig()
const apiBase = useApiBaseUrl()
const slug = String(route.params.slug || '')
const { content, settings } = await useNouranCms()
const { data: article } = await useAsyncData<NouranBlogArticle | null>(`nouran-article:${slug}`, async () => {
  try {
    const response = await $fetch(`/blog/${encodeURIComponent(slug)}`, { baseURL: apiBase, timeout: 8000 }) as { data?: NouranBlogArticle }
    return response.data || null
  } catch {
    return null
  }
}, { default: () => null })

if (!article.value && import.meta.server) setResponseStatus(404)

const articleTitle = computed(() => article.value?.title_ar || article.value?.title || article.value?.title_en || '')
const articleDescription = computed(() => article.value?.description_ar || article.value?.description || article.value?.description_en || '')
const articleContent = computed(() => article.value?.content_ar || article.value?.content || article.value?.content_en || '')
const safeContent = computed(() => sanitizePageHtml(articleContent.value))
const formatDate = (value: string) => new Intl.DateTimeFormat('ar-EG', { dateStyle: 'medium' }).format(new Date(value))
const year = new Date().getFullYear()
const siteUrl = String(config.public.siteUrl || '').replace(/\/$/, '')
const seoTitle = computed(() => article.value?.seo_title_ar || articleTitle.value || settings.value.seo.title)
const seoDescription = computed(() => article.value?.seo_description_ar || articleDescription.value || settings.value.seo.description)
const canonical = siteUrl ? `${siteUrl}/blog/${encodeURIComponent(slug)}` : undefined

useSeoMeta({ title: () => `${seoTitle.value} | ${settings.value.website_name}`, description: () => seoDescription.value, ogTitle: () => seoTitle.value, ogDescription: () => seoDescription.value, ogType: 'article', ogLocale: 'ar_EG', ogImage: () => article.value?.image || settings.value.seo.social_image_url || undefined })
useHead(() => ({ htmlAttrs: { lang: 'ar', dir: 'rtl' }, link: canonical ? [{ rel: 'canonical', href: canonical }] : [] }))
</script>
