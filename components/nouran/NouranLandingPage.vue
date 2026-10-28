<template>
  <div class="nouran-site">
    <NouranSiteHeader :content="content.header" :brand="content.brand" :instagram-url="settings.instagram_url" :booking-url="bookingUrl" />
    <main id="main">
      <section class="hero" id="home">
        <div class="hero-ambient ambient-one"></div><div class="hero-ambient ambient-two"></div>
        <div class="container hero-grid">
          <div class="hero-copy" :data-reveal="revealEnabled ? '' : undefined">
            <div class="eyebrow"><span class="eyebrow-line"></span>{{ content.hero.eyebrow }}<span class="eyebrow-line"></span></div>
            <h1>{{ content.hero.firstLine }}<br /><span class="serif-highlight">{{ content.hero.emphasizedLine }}</span><br />{{ content.hero.lastLine }}</h1>
            <p class="hero-lead">{{ content.hero.description }}</p>
            <div class="hero-actions"><a class="btn btn-primary" :href="bookingUrl" target="_blank" rel="noopener noreferrer">{{ content.hero.primaryCta }} <span class="arrow-circle" aria-hidden="true">↗</span></a><a class="btn btn-text" href="#about">{{ content.hero.secondaryCta }} <span aria-hidden="true">←</span></a></div>
            <div class="hero-small-note"><span class="note-sparkle" aria-hidden="true">✽</span><span>{{ content.hero.note }}</span></div>
          </div>
          <div class="hero-art" :data-reveal="revealEnabled ? '' : undefined">
            <div class="hero-halo"></div>
            <div class="hero-sun"></div>
            <div class="scribble scribble-top" aria-hidden="true">✳</div>
            <div class="hero-photo-shell">
              <div class="photo-gradient"></div>
              <img class="hero-photo" :src="content.hero.image_url || '/images/nouran/nouran-hero.webp'" :alt="content.hero.imageAlt" width="903" height="1097" fetchpriority="high" decoding="async" />
            </div>
            <div class="floating-card quote-card"><span class="quote-flowers" aria-hidden="true">❀</span><p>{{ content.hero.quote }}<br /><strong>{{ content.hero.quoteEmphasis }}</strong></p></div>
            <div class="floating-card evidence-card"><span class="circle-check" aria-hidden="true">✓</span><span>{{ content.hero.evidence }}<br /><strong>{{ content.hero.evidenceEmphasis }}</strong></span></div>
            <div class="hero-art-caption"><span class="hero-caption-line"></span>{{ content.hero.caption }}</div>
            <div class="leaf-one" aria-hidden="true"><svg viewBox="0 0 160 180" fill="none"><path d="M86 171c-14-59-15-101 16-148" stroke="#839b74" stroke-width="2"/><path d="M90 117c-47-4-58-29-66-47 36 0 58 12 66 47ZM93 73c33-30 50-36 64-32-6 27-23 42-64 32ZM83 144c-39 1-59-13-78-30 37-10 62 1 78 30Z" fill="#95a987" fill-opacity=".57" stroke="#839b74" stroke-width="1.2"/></svg></div>
          </div>
        </div>
        <div class="container hero-bottom"><span class="hero-bottom-label">{{ content.hero.bottomLabel }}</span><a class="scroll-down" href="#about">{{ content.hero.scrollLabel }} <span aria-hidden="true">↓</span></a></div>
      </section>

      <section class="value-strip" aria-label="مبادئ المتابعة"><div class="container value-items"><template v-for="(value, index) in content.values" :key="value"><div><span class="value-icon" aria-hidden="true">{{ valueSymbols[index] }}</span>{{ value }}</div><span v-if="index < content.values.length - 1" class="strip-divider" aria-hidden="true"></span></template></div></section>

      <section class="about section-pad" id="about"><div class="container about-grid">
        <div class="about-visual" :data-reveal="revealEnabled ? '' : undefined">
          <div class="about-visual-bg"><span class="about-flower" aria-hidden="true">✺</span><span class="about-script" aria-hidden="true">{{ content.about.scriptLine }}<br /><i>{{ content.about.scriptEmphasis }}</i></span><div class="about-portrait-wrap"><img :src="content.about.image_url || '/images/nouran/nouran-about.webp'" :alt="content.about.imageAlt" loading="lazy" decoding="async" width="650" height="893" /></div><span class="about-side-label">{{ content.about.sideLabel }}</span></div>
          <div class="about-sticker"><span aria-hidden="true">♡</span><strong>{{ content.about.stickerLine }}<br />{{ content.about.stickerEmphasis }}</strong></div>
        </div>
        <div class="about-copy" :data-reveal="revealEnabled ? '' : undefined"><span class="section-kicker">{{ content.about.eyebrow }}</span><h2>{{ content.about.title }} <em>{{ content.about.doctorName }}</em><span class="dot">.</span></h2><p class="body-big">{{ content.about.lead }}</p><p v-for="paragraph in content.about.paragraphs" :key="paragraph">{{ paragraph }}</p><div class="about-signature">{{ content.brand.full }} <span aria-hidden="true">✿</span></div><a class="text-link" :href="settings.instagram_url" target="_blank" rel="noopener noreferrer">{{ content.about.linkLabel }} <span aria-hidden="true">↗</span></a></div>
      </div></section>

      <section class="approach section-pad" id="approach"><div class="container"><div class="section-intro center" :data-reveal="revealEnabled ? '' : undefined"><span class="section-kicker">{{ content.approach.eyebrow }}</span><h2>{{ content.approach.title }} <em>{{ content.approach.emphasis }}</em></h2><p>{{ content.approach.description }}</p></div><div class="approach-grid">
        <article v-for="(step, index) in content.approach.steps" :key="step.id" class="approach-card" :data-reveal="revealEnabled ? '' : undefined"><span class="step-num">0{{ index + 1 }}</span><div class="illustration" :class="illustrationClasses[index]">
          <svg v-if="step.id === 'understand'" viewBox="0 0 90 90" fill="none" aria-hidden="true"><path d="M45 70S19 53 19 35c0-15 19-20 26-6 7-14 26-9 26 6 0 18-26 35-26 35Z" fill="#e8bec2" stroke="#7c7763" stroke-width="2"/><path d="M31 39h28M45 26v25" stroke="#fff9f3" stroke-linecap="round" stroke-width="2"/></svg>
          <svg v-else-if="step.id === 'flexible'" viewBox="0 0 90 90" fill="none" aria-hidden="true"><path d="M20 48h50c-2 21-13 29-25 29S22 69 20 48Z" fill="#e8dfc3" stroke="#71866c" stroke-width="2"/><path d="M30 46c-12-15 6-23 15-8 5-19 27-16 18 8" stroke="#71866c" stroke-width="3" stroke-linecap="round"/><circle cx="37" cy="44" r="7" fill="#eaa2a1"/></svg>
          <svg v-else viewBox="0 0 90 90" fill="none" aria-hidden="true"><path d="M45 78V33" stroke="#698268" stroke-width="3" stroke-linecap="round"/><path d="M44 56C20 57 15 43 14 31c19-1 31 5 30 25ZM46 42c3-19 15-26 29-28 0 20-10 29-29 28Z" fill="#a2b99a" stroke="#698268" stroke-width="2"/><path d="M28 79h36" stroke="#698268" stroke-linecap="round" stroke-width="3"/></svg>
        </div><h3>{{ step.title }}</h3><p>{{ step.description }}</p></article>
      </div></div></section>

      <section class="services section-pad" id="services"><div class="container service-grid"><div class="service-copy" :data-reveal="revealEnabled ? '' : undefined"><span class="section-kicker">{{ content.services.eyebrow }}</span><h2>{{ content.services.title }}<br /><em>{{ content.services.emphasis }}</em></h2><p>{{ content.services.description }}</p><div class="service-features"><div v-for="service in content.services.items" :key="service.title"><span aria-hidden="true">✓</span><p><strong>{{ service.title }}</strong><small>{{ service.description }}</small></p></div></div><a class="btn btn-light" :href="bookingUrl" target="_blank" rel="noopener noreferrer">{{ content.services.cta }} <span class="arrow-circle" aria-hidden="true">↗</span></a></div>
        <div class="service-art" :data-reveal="revealEnabled ? '' : undefined"><div class="service-ring"></div><div class="service-editorial"><div class="editorial-tag">{{ content.services.artEyebrow }}</div><div class="big-olive" aria-hidden="true">✳</div><div class="service-art-center"><span>{{ content.services.artTitle }}<br /><em>{{ content.services.artEmphasis }}</em></span><p>{{ content.services.artCaption }}</p></div><div class="service-corners" aria-hidden="true"><span>✦</span><span>✦</span></div></div><div class="service-seal">{{ content.services.sealTitle }}<br /><strong>{{ content.services.sealEmphasis }}</strong><span aria-hidden="true">♡</span></div></div>
      </div></section>

      <section class="content section-pad" id="content"><div class="container"><div class="content-heading" :data-reveal="revealEnabled ? '' : undefined"><div><span class="section-kicker">{{ content.content.eyebrow }}</span><h2>{{ content.content.title }} <em>{{ content.content.emphasis }}</em></h2><p>{{ content.content.description }}</p></div><a class="text-link" :href="articles.length ? '/blog' : settings.instagram_url" :target="articles.length ? undefined : '_blank'" :rel="articles.length ? undefined : 'noopener noreferrer'">{{ content.content.linkLabel }} <span aria-hidden="true">↗</span></a></div>
        <div v-if="articles.length" class="topic-grid article-topic-grid"><NuxtLink v-for="article in articles.slice(0, 3)" :key="article.id" class="topic-card article-topic-card" :to="`/blog/${article.slug}`"><span class="topic-index">{{ content.blog.articleLabel }}</span><div class="topic-graphic article-cover"><img v-if="article.image" :src="article.image" :alt="articleTitle(article)" width="720" height="480" loading="lazy" decoding="async" /><span v-else aria-hidden="true">✿</span></div><div class="topic-bottom"><span class="topic-tag">{{ article.published_at ? formatDate(article.published_at) : content.blog.eyebrow }}</span><h3>{{ articleTitle(article) }}</h3><span class="topic-arrow" aria-hidden="true">↗</span></div></NuxtLink></div>
        <div v-else class="topic-grid"><a v-for="(topic, index) in content.content.topics" :key="topic.id" class="topic-card" :class="`topic-${topic.id}`" :href="settings.instagram_url" target="_blank" rel="noopener noreferrer" :data-reveal="revealEnabled ? '' : undefined"><span class="topic-index">0{{ index + 1 }} / {{ topic.category }}</span><div class="topic-graphic" :class="topic.id"><span>{{ topic.symbol }}</span><span :class="topic.id === 'liver' ? 'handdrawn-lines' : topic.id === 'daily' ? 'small-leaves' : 'svg-swirl'">{{ topic.accent }}</span></div><div class="topic-bottom"><span class="topic-tag">{{ topic.tag }}</span><h3>{{ topic.title }}<br />{{ topic.subtitle }}</h3><span class="topic-arrow" aria-hidden="true">↗</span></div></a></div>
      </div></section>

      <section class="reminder section-pad"><div class="container reminder-panel" :data-reveal="revealEnabled ? '' : undefined"><span class="reminder-sparkle" aria-hidden="true">❀</span><span class="section-kicker">{{ content.reminder.eyebrow }}</span><h2>{{ content.reminder.firstLine }}<br /><em>{{ content.reminder.emphasizedLine }}</em></h2><div class="reminder-footer"><span></span><strong>{{ content.brand.full }}</strong><span></span></div></div></section>

      <section class="faq section-pad" id="faq"><div class="container faq-grid"><div :data-reveal="revealEnabled ? '' : undefined"><span class="section-kicker">{{ content.faq.eyebrow }}</span><h2>{{ content.faq.title }}<br /><em>{{ content.faq.emphasis }}</em></h2><p>{{ content.faq.description }}</p><span class="faq-flower" aria-hidden="true">✿</span></div><div class="faq-list" :data-reveal="revealEnabled ? '' : undefined"><details v-for="item in content.faq.items" :key="item.question"><summary>{{ item.question }} <span class="faq-plus" aria-hidden="true">+</span></summary><p>{{ item.answer }}</p></details></div></div></section>

      <section class="contact" id="contact"><div class="container contact-panel"><span class="contact-flower flower-a" aria-hidden="true">✺</span><span class="contact-flower flower-b" aria-hidden="true">✿</span><div class="contact-inner" :data-reveal="revealEnabled ? '' : undefined"><span class="section-kicker">{{ content.contact.eyebrow }}</span><h2>{{ content.contact.title }}<br /><em>{{ content.contact.emphasis }}</em></h2><p>{{ content.contact.description }}</p><a class="btn btn-primary" :href="bookingUrl" target="_blank" rel="noopener noreferrer">{{ content.contact.cta }} <span class="arrow-circle" aria-hidden="true">↗</span></a></div></div></section>
    </main>
    <NouranSiteFooter :content="content.footer" :brand="content.brand" :doctor-name="content.header.doctor" :instagram-url="settings.instagram_url" :whatsapp-url="settings.whatsapp_url" :year="year" />
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, nextTick } from 'vue'
import NouranSiteFooter from './NouranSiteFooter.vue'
import NouranSiteHeader from './NouranSiteHeader.vue'
import type { NouranBlogArticle, NouranGlobalSettings, NouranSiteContent } from '~/data/nouranSiteContent'

const props = defineProps<{ content: NouranSiteContent; settings: NouranGlobalSettings; articles: NouranBlogArticle[] }>()
const content = computed(() => props.content)
const settings = computed(() => props.settings)
const articles = computed(() => props.articles)
const bookingUrl = computed(() => settings.value.booking_url || settings.value.instagram_url)
const year = new Date().getFullYear()
const valueSymbols = ['✳', '♡', '✦', '☼']
const illustrationClasses = ['illo-heart', 'illo-bowl', 'illo-plant']
const revealEnabled = ref(false)
let revealObserver: IntersectionObserver | undefined

const articleTitle = (article: NouranBlogArticle) => article.title_ar || article.title || article.title_en || ''
const formatDate = (date: string) => new Intl.DateTimeFormat('ar-EG', { dateStyle: 'medium' }).format(new Date(date))

onMounted(async () => {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches || !('IntersectionObserver' in window)) return

  revealEnabled.value = true
  await nextTick()
  revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return
      entry.target.classList.add('revealed')
      revealObserver?.unobserve(entry.target)
    })
  }, { threshold: 0.07, rootMargin: '0px 0px 40px 0px' })

  document.querySelectorAll('.nouran-site [data-reveal]').forEach((element) => revealObserver?.observe(element))
})

onBeforeUnmount(() => revealObserver?.disconnect())
</script>
