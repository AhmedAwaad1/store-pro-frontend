<template>
  <main class="nouran-articles-page">
    <section class="nouran-articles-heading">
      <div class="container">
        <NuxtLink class="nouran-articles-back" to="/">{{ content.header.homeLabel }} ←</NuxtLink>
        <span class="section-kicker">{{ content.blog.eyebrow }}</span>
        <h1>{{ content.blog.title }}</h1>
        <p>{{ content.blog.description }}</p>
      </div>
    </section>
    <section class="container nouran-articles-section" aria-live="polite">
      <p v-if="pending" class="nouran-articles-empty" role="status">{{ content.blog.loading }}</p>
      <div v-else-if="articles.length" class="nouran-articles-grid">
        <article v-for="article in articles" :key="article.id" class="nouran-article-card">
          <NuxtLink :to="`/blog/${article.slug}`" :aria-label="`${titleOf(article)} — ${content.blog.readArticle}`">
            <img v-if="article.image" :src="article.image" :alt="titleOf(article)" width="720" height="480" loading="lazy" decoding="async" />
            <div v-else class="nouran-article-placeholder" aria-hidden="true">✿</div>
            <div class="nouran-article-card-copy">
              <small v-if="article.published_at">{{ formatDate(article.published_at) }}</small>
              <h2>{{ titleOf(article) }}</h2>
              <p>{{ descriptionOf(article) }}</p>
              <span>{{ content.blog.readArticle }} <span aria-hidden="true">↗</span></span>
            </div>
          </NuxtLink>
        </article>
      </div>
      <div v-else class="nouran-articles-empty">
        <span aria-hidden="true">✿</span>
        <h2>{{ content.blog.emptyTitle }}</h2>
        <p>{{ content.blog.emptyDescription }}</p>
        <a class="text-link" :href="settings.instagram_url" target="_blank" rel="noopener noreferrer">{{ content.about.linkLabel }} ↗</a>
      </div>
    </section>
    <NouranSiteFooter :content="content.footer" :brand="content.brand" :doctor-name="content.header.doctor" :instagram-url="settings.instagram_url" :whatsapp-url="settings.whatsapp_url" :year="year" />
  </main>
</template>

<script setup lang="ts">
import type { NouranBlogArticle } from '~/data/nouranSiteContent'
import NouranSiteFooter from '~/components/nouran/NouranSiteFooter.vue'

const { content, settings, articles, pending } = await useNouranCms()
const config = useRuntimeConfig()
const titleOf = (article: NouranBlogArticle) => article.title_ar || article.title || article.title_en || ''
const descriptionOf = (article: NouranBlogArticle) => article.description_ar || article.description || article.description_en || ''
const formatDate = (value: string) => new Intl.DateTimeFormat('ar-EG', { dateStyle: 'medium' }).format(new Date(value))
const year = new Date().getFullYear()
const seoTitle = computed(() => `${content.value.blog.title} | ${settings.value.website_name}`)
const siteUrl = String(config.public.siteUrl || '').replace(/\/$/, '')

useSeoMeta({ title: () => seoTitle.value, description: () => content.value.blog.description, ogTitle: () => seoTitle.value, ogDescription: () => content.value.blog.description, ogType: 'website', ogLocale: 'ar_EG' })
useHead(() => ({ htmlAttrs: { lang: 'ar', dir: 'rtl' }, link: siteUrl ? [{ rel: 'canonical', href: `${siteUrl}/blog` }] : [] }))
</script>
