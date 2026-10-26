<template>
  <main class="sp-home">
    <section id="home" class="sp-hero">
      <div class="sp-container sp-hero-layout">
        <div class="sp-hero-copy" :dir="isEnglish ? 'ltr' : 'rtl'">
          <span class="sp-eyebrow sp-eyebrow-light">{{ text(hero.eyebrow) }}</span>
          <h1>{{ text(hero.title) }}</h1>
          <p>{{ text(hero.description) }}</p>
          <div class="sp-hero-actions">
            <NuxtLink class="sp-btn sp-btn-primary" :to="hero.primary_link">{{ text(hero.primary_button) }} <StoreProDirectionalArrow :size="19" /></NuxtLink>
            <NuxtLink class="sp-btn sp-btn-outline-light" :to="hero.secondary_link">{{ text(hero.secondary_button) }} <CirclePlay :size="18" /></NuxtLink>
          </div>
          <ul class="sp-hero-points"><li v-for="(point, index) in hero.points || []" :key="index"><CheckCircle2 :size="17" />{{ text(point) }}</li></ul>
        </div>
        <div class="sp-hero-visual">
          <img v-if="hero.image_url" :src="hero.image_url" :alt="text(hero.image_alt)" width="1672" height="941" fetchpriority="high" />
          <span class="sp-hero-stat-badge"><BarChart3 :size="17" />{{ text(hero.badge) }}</span>
          <span class="sp-hero-visual-caption"><span class="sp-live-dot"></span>{{ text(hero.caption) }}</span>
        </div>
      </div>
    </section>

    <section class="sp-proof-strip" :aria-label="text(home.proof?.aria_label)">
      <div class="sp-container sp-proof-grid"><span v-for="(item, index) in home.proof?.items || []" :key="index"><CheckCircle2 :size="18" />{{ text(item) }}</span></div>
    </section>

    <section id="services" class="sp-section">
      <div class="sp-container">
        <div class="sp-section-head"><div><span class="sp-eyebrow">{{ text(home.services?.eyebrow) }}</span><h2>{{ text(home.services?.title) }}</h2><p>{{ text(home.services?.description) }}</p></div><NuxtLink class="sp-text-link" to="/services">{{ text(home.services?.link_label) }} <StoreProDirectionalArrow :size="17" /></NuxtLink></div>
        <div class="sp-service-grid"><article v-for="(service, index) in services" :key="index" class="sp-service-card"><span class="sp-icon-bubble"><component :is="iconMap[service.icon] || Store" :size="23" /></span><h3>{{ text(service.title) }}</h3><p>{{ text(service.description) }}</p><NuxtLink :to="`/services#${service.id}`" class="sp-card-link">{{ text(home.services?.item_link_label) }} <StoreProDirectionalArrow :size="15" /></NuxtLink></article></div>
      </div>
    </section>

    <section id="why-storepro" class="sp-section sp-section-soft">
      <div class="sp-container sp-why-layout">
        <div class="sp-why-art">
          <div class="sp-dashboard-window">
            <div class="sp-window-top"><i></i><i></i><i></i><span>{{ text(why.window_title) }}</span><small class="sp-window-range">{{ text(why.demo_label) }}</small></div>
            <div class="sp-window-body"><div class="sp-window-side" aria-hidden="true"><b></b><b></b><b></b><b></b></div><div class="sp-window-main">
              <div class="sp-window-stats"><article v-for="(stat, index) in why.stats || []" :key="index"><small>{{ text(stat.label) }}</small><strong>{{ text(stat.value) }}</strong></article></div>
              <div class="sp-chart"><svg class="sp-chart-graph" viewBox="0 0 420 150" role="img" :aria-label="text(why.chart_alt)"><defs><linearGradient id="storepro-chart-area" x1="0" x2="0" y1="0" y2="1"><stop offset="0%" stop-color="#3B82F6" stop-opacity=".28" /><stop offset="100%" stop-color="#3B82F6" stop-opacity="0" /></linearGradient></defs><path class="sp-chart-grid" d="M8 30H412 M8 70H412 M8 110H412 M8 145H412" /><path class="sp-chart-area" d="M8 121 C38 115 47 96 76 101 S117 74 145 81 S184 55 214 65 S254 47 282 55 S322 28 350 39 S385 18 412 22 V145 H8 Z" /><path class="sp-chart-line" d="M8 121 C38 115 47 96 76 101 S117 74 145 81 S184 55 214 65 S254 47 282 55 S322 28 350 39 S385 18 412 22" /><circle class="sp-chart-point" cx="76" cy="101" r="4" /><circle class="sp-chart-point" cx="145" cy="81" r="4" /><circle class="sp-chart-point" cx="214" cy="65" r="4" /><circle class="sp-chart-point" cx="282" cy="55" r="4" /><circle class="sp-chart-point" cx="350" cy="39" r="4" /><circle class="sp-chart-point" cx="412" cy="22" r="4" /></svg></div>
              <div class="sp-window-products" aria-hidden="true"><b></b><b></b><b></b></div><p class="sp-dashboard-caption">{{ text(why.dashboard_caption) }}</p>
            </div></div>
          </div>
          <span class="sp-art-note"><BarChart3 :size="19" />{{ text(why.art_note) }}</span>
        </div>
        <div class="sp-why-copy"><span class="sp-eyebrow">{{ text(why.eyebrow) }}</span><h2>{{ text(why.title) }}</h2><p>{{ text(why.description) }}</p>
          <div class="sp-benefit-list"><article v-for="benefit in why.benefits || []" :key="benefit.title?.en || benefit.title?.ar"><span><component :is="iconMap[benefit.icon] || Store" :size="20" /></span><div><h3>{{ text(benefit.title) }}</h3><p>{{ text(benefit.description) }}</p></div></article></div>
          <NuxtLink class="sp-btn sp-btn-secondary" :to="why.link">{{ text(why.link_label) }} <StoreProDirectionalArrow :size="17" /></NuxtLink>
        </div>
      </div>
    </section>

    <section id="portfolio" class="sp-section"><div class="sp-container">
      <div class="sp-section-head"><div><span class="sp-eyebrow">{{ text(home.portfolio?.eyebrow) }}</span><h2>{{ text(home.portfolio?.title) }}</h2><p>{{ text(home.portfolio?.description) }}</p></div><NuxtLink class="sp-text-link" to="/portfolio">{{ text(home.portfolio?.link_label) }} <StoreProDirectionalArrow :size="17" /></NuxtLink></div>
      <div class="sp-portfolio-grid"><NuxtLink v-for="(item, index) in portfolio" :key="index" to="/portfolio" class="sp-portfolio-card"><div class="sp-portfolio-image"><img v-if="item.image_url" :src="item.image_url" :alt="text(item.title)" width="1448" height="1200" loading="lazy" decoding="async" /><span>{{ text(home.portfolio?.item_label) }}</span></div><div class="sp-portfolio-info"><div><h3>{{ text(item.title) }}</h3><p>{{ text(item.category) }}</p></div><StoreProDirectionalArrow :size="18" /></div></NuxtLink></div>
    </div></section>

    <section id="pricing" class="sp-section sp-section-soft"><div class="sp-container">
      <div class="sp-section-head sp-section-head-centered"><div><span class="sp-eyebrow">{{ text(home.pricing?.eyebrow) }}</span><h2>{{ text(home.pricing?.title) }}</h2><p>{{ text(home.pricing?.description) }}</p></div></div>
      <div class="sp-pricing-grid"><article v-for="(plan, index) in plans" :key="index" class="sp-price-card" :class="{ 'sp-price-card-featured': plan.popular }"><span v-if="plan.popular" class="sp-popular-tag">{{ text(home.pricing?.popular_label) }}</span><h3>{{ text(plan.title) }}</h3><p>{{ text(plan.description) }}</p><strong class="sp-price-label">{{ text(home.pricing?.custom_price) }}</strong><ul><li v-for="(feature, index) in plan.features || []" :key="index"><Check :size="16" />{{ text(feature) }}</li></ul><NuxtLink class="sp-btn" :class="plan.popular ? 'sp-btn-primary' : 'sp-btn-outline'" :to="`/contact?package=${plan.id}#inquiry`">{{ text(home.pricing?.request_label) }} <StoreProDirectionalArrow :size="16" /></NuxtLink></article></div>
    </div></section>

    <section v-if="testimonials.length" id="testimonials" class="sp-section"><div class="sp-container"><div class="sp-section-head"><div><span class="sp-eyebrow">{{ text(home.testimonials?.eyebrow) }}</span><h2>{{ text(home.testimonials?.title) }}</h2></div></div><div class="sp-testimonial-grid"><article v-for="item in testimonials.slice(0, 3)" :key="item.id" class="sp-testimonial-card"><Quote :size="24" /><blockquote>{{ item.quote }}</blockquote><div class="sp-testimonial-author"><img v-if="item.avatar_url" :src="item.avatar_url" alt="" width="48" height="48" loading="lazy" /><span><strong>{{ item.author_name }}</strong><small>{{ [item.author_title, item.company_name].filter(Boolean).join(' · ') }}</small></span></div></article></div></div></section>
  </main>
</template>

<script setup lang="ts">
import { BarChart3, Boxes, Check, CheckCircle2, CirclePlay, CreditCard, LayoutDashboard, LifeBuoy, Quote, ShieldCheck, Smartphone, Store, TrendingUp, Users, Zap } from 'lucide-vue-next'

const { isEnglish } = useLocale()
const config = useRuntimeConfig()
const { page, text } = await useSiteContent()
const home = page('home')
const hero = computed(() => home.value.hero || {})
const why = computed(() => home.value.why || {})
const services = computed(() => home.value.services?.items || [])
const portfolio = computed(() => home.value.portfolio?.items || [])
const plans = computed(() => home.value.pricing?.plans || [])
const iconMap = { Store, LayoutDashboard, Smartphone, Boxes, CreditCard, LifeBuoy, Users, ShieldCheck, TrendingUp, Zap }
const { data: testimonials } = await useAsyncData('storepro-testimonials', async () => {
  try {
    const response = await $fetch<{ data: any }>('/testimonial', { baseURL: config.public.apiBase })
    return Array.isArray(response.data) ? response.data : []
  } catch {
    return []
  }
}, { server: false, default: () => [] })

useSeoMeta({ title: () => text(home.value.meta_title), description: () => text(home.value.meta_description), ogTitle: () => text(home.value.meta_title), ogDescription: () => text(home.value.meta_description) })
</script>
