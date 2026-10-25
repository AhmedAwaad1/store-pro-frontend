<template>
  <main class="sp-home">
    <section id="home" class="sp-hero">
      <div class="sp-container sp-hero-layout">
        <div class="sp-hero-copy" :dir="isEnglish ? 'ltr' : 'rtl'">
          <span class="sp-eyebrow sp-eyebrow-light">{{ isEnglish ? 'Your business, online' : 'مشروعك يبدأ من هنا' }}</span>
          <h1>{{ isEnglish ? 'Build an online store that helps your business grow' : 'ابنِ متجرك الإلكتروني وابدأ رحلتك نحو النمو' }}</h1>
          <p>{{ isEnglish ? 'StorePro brings store design, management tools, and the integrations you need together in one place.' : 'حلول تجارة إلكترونية متكاملة تجمع تصميم متجرك وأدوات إدارته والتكاملات التي يحتاجها نشاطك.' }}</p>
          <div class="sp-hero-actions"><NuxtLink class="sp-btn sp-btn-primary" to="/contact#inquiry">{{ isEnglish ? 'Start your store' : 'ابدأ متجرك الآن' }} <ArrowUpLeft :size="19" /></NuxtLink><NuxtLink class="sp-btn sp-btn-outline-light" to="/services">{{ isEnglish ? 'Explore services' : 'اكتشف خدماتنا' }} <CirclePlay :size="18" /></NuxtLink></div>
          <ul class="sp-hero-points"><li><CheckCircle2 :size="17" />{{ isEnglish ? 'A plan shaped around your needs' : 'حل يناسب احتياجات نشاطك' }}</li><li><CheckCircle2 :size="17" />{{ isEnglish ? 'Launch and ongoing support' : 'دعم في الإطلاق وما بعده' }}</li></ul>
        </div>
        <div class="sp-hero-visual"><img src="/images/storepro/hero-dashboard.png" alt="" width="1672" height="1000" fetchpriority="high" /><span class="sp-hero-visual-caption"><span class="sp-live-dot"></span>{{ isEnglish ? 'One place to manage your store' : 'كل أدوات متجرك في مكان واحد' }}</span></div>
      </div>
    </section>

    <section class="sp-proof-strip" aria-label="StorePro benefits"><div class="sp-container sp-proof-grid"><span><CheckCircle2 :size="18" />{{ isEnglish ? 'Quick launch plan' : 'خطة إطلاق واضحة' }}</span><span><CheckCircle2 :size="18" />{{ isEnglish ? 'Ongoing support' : 'دعم مستمر' }}</span><span><CheckCircle2 :size="18" />{{ isEnglish ? 'Built for every business' : 'مناسب لمختلف الأنشطة' }}</span></div></section>

    <section id="services" class="sp-section"><div class="sp-container"><div class="sp-section-head"><div><span class="sp-eyebrow">{{ isEnglish ? 'What we offer' : 'خدماتنا' }}</span><h2>{{ isEnglish ? 'Everything you need to sell online' : 'كل ما تحتاجه لبناء متجرك الإلكتروني' }}</h2><p>{{ isEnglish ? 'A connected set of services to help you launch, manage, and grow.' : 'خدمات متكاملة تساعدك على إطلاق متجرك وإدارته وتطويره.' }}</p></div><NuxtLink class="sp-text-link" to="/services">{{ isEnglish ? 'All services' : 'عرض جميع الخدمات' }} <ArrowUpLeft :size="17" /></NuxtLink></div>
      <div class="sp-service-grid"><article v-for="service in services" :key="service.id" class="sp-service-card"><span class="sp-icon-bubble"><component :is="iconMap[service.icon]" :size="23" /></span><h3>{{ storeProText(service.title, isEnglish) }}</h3><p>{{ storeProText(service.description, isEnglish) }}</p><NuxtLink :to="`/services#${service.id}`" class="sp-card-link">{{ isEnglish ? 'Learn more' : 'المزيد' }} <ArrowUpLeft :size="15" /></NuxtLink></article></div>
    </div></section>

    <section id="why-storepro" class="sp-section sp-section-soft"><div class="sp-container sp-why-layout"><div class="sp-why-art"><div class="sp-dashboard-window"><div class="sp-window-top"><i></i><i></i><i></i><span>{{ isEnglish ? 'Store overview' : 'نظرة عامة على المتجر' }}</span></div><div class="sp-window-body"><div class="sp-window-side"><b></b><b></b><b></b><b></b></div><div class="sp-window-main"><div class="sp-window-stats"><b></b><b></b><b></b></div><div class="sp-chart"><span></span><span></span><span></span><span></span><span></span><span></span><span></span></div><div class="sp-window-products"><b></b><b></b><b></b></div></div></div></div><span class="sp-art-note"><BarChart3 :size="19" />{{ isEnglish ? 'Clear tools for daily decisions' : 'أدوات واضحة لقرارات أفضل' }}</span></div>
      <div class="sp-why-copy"><span class="sp-eyebrow">{{ isEnglish ? 'Why StorePro' : 'لماذا StorePro؟' }}</span><h2>{{ isEnglish ? 'From your first idea to a store ready to grow' : 'من فكرتك الأولى إلى متجر جاهز للنمو' }}</h2><p>{{ isEnglish ? 'We bring the technology and practical guidance together so you can focus on your customers and your business.' : 'نجمع التقنية مع خطوات عملية تساعدك على التركيز على عملائك وتطوير أعمالك.' }}</p><div class="sp-benefit-list"><article v-for="benefit in benefits" :key="benefit.title.en"><span><component :is="iconMap[benefit.icon]" :size="20" /></span><div><h3>{{ storeProText(benefit.title, isEnglish) }}</h3><p>{{ storeProText(benefit.description, isEnglish) }}</p></div></article></div><NuxtLink class="sp-btn sp-btn-secondary" to="/about">{{ isEnglish ? 'Meet StorePro' : 'تعرف على StorePro' }} <ArrowUpLeft :size="17" /></NuxtLink></div>
    </div></section>

    <section id="portfolio" class="sp-section"><div class="sp-container"><div class="sp-section-head"><div><span class="sp-eyebrow">{{ isEnglish ? 'Store examples' : 'نماذج متاجر' }}</span><h2>{{ isEnglish ? 'A storefront for every kind of business' : 'تجربة متجر تناسب طبيعة نشاطك' }}</h2><p>{{ isEnglish ? 'Illustrative storefront concepts showing how a StorePro store can be tailored.' : 'نماذج تصميم توضيحية تبين كيف يمكن تخصيص المتجر حسب طبيعة نشاطك.' }}</p></div><NuxtLink class="sp-text-link" to="/portfolio">{{ isEnglish ? 'View all examples' : 'عرض جميع النماذج' }} <ArrowUpLeft :size="17" /></NuxtLink></div><div class="sp-portfolio-grid"><NuxtLink v-for="item in portfolio" :key="item.id" to="/portfolio" class="sp-portfolio-card"><div class="sp-portfolio-image"><img :src="item.image" :alt="storeProText(item.title, isEnglish)" width="1448" height="1200" loading="lazy" decoding="async" /><span>{{ isEnglish ? 'Concept' : 'نموذج توضيحي' }}</span></div><div class="sp-portfolio-info"><div><h3>{{ storeProText(item.title, isEnglish) }}</h3><p>{{ storeProText(item.category, isEnglish) }}</p></div><ArrowUpLeft :size="18" /></div></NuxtLink></div></div></section>

    <section id="pricing" class="sp-section sp-section-soft"><div class="sp-container"><div class="sp-section-head sp-section-head-centered"><div><span class="sp-eyebrow">{{ isEnglish ? 'Plans' : 'خطط الأسعار' }}</span><h2>{{ isEnglish ? 'Choose a setup that fits your next step' : 'اختر الحل المناسب لخطوتك القادمة' }}</h2><p>{{ isEnglish ? 'Plans are tailored to your business requirements. Request a consultation for a clear quote.' : 'نحدد تفاصيل الباقة حسب احتياجات نشاطك. اطلب استشارة لتحصل على عرض واضح.' }}</p></div></div><div class="sp-pricing-grid"><article v-for="plan in plans" :key="plan.id" class="sp-price-card" :class="{ 'sp-price-card-featured': plan.popular }"><span v-if="plan.popular" class="sp-popular-tag">{{ isEnglish ? 'Most requested' : 'الأكثر طلبًا' }}</span><h3>{{ storeProText(plan.title, isEnglish) }}</h3><p>{{ storeProText(plan.description, isEnglish) }}</p><strong class="sp-price-label">{{ isEnglish ? 'Custom quote' : 'عرض سعر مخصص' }}</strong><ul><li v-for="feature in plan.features" :key="feature.en"><Check :size="16" />{{ storeProText(feature, isEnglish) }}</li></ul><NuxtLink class="sp-btn" :class="plan.popular ? 'sp-btn-primary' : 'sp-btn-outline'" :to="`/contact?package=${plan.id}#inquiry`">{{ isEnglish ? 'Request details' : 'اطلب تفاصيل الباقة' }} <ArrowUpLeft :size="16" /></NuxtLink></article></div></div></section>

    <section v-if="testimonials.length" id="testimonials" class="sp-section"><div class="sp-container"><div class="sp-section-head"><div><span class="sp-eyebrow">{{ isEnglish ? 'Customer stories' : 'آراء العملاء' }}</span><h2>{{ isEnglish ? 'What our customers say' : 'ماذا يقول عملاؤنا؟' }}</h2></div></div><div class="sp-testimonial-grid"><article v-for="item in testimonials.slice(0, 3)" :key="item.id" class="sp-testimonial-card"><Quote :size="24" /><blockquote>{{ item.quote }}</blockquote><div class="sp-testimonial-author"><img v-if="item.avatar_url" :src="item.avatar_url" alt="" width="48" height="48" loading="lazy" /><span><strong>{{ item.author_name }}</strong><small>{{ [item.author_title, item.company_name].filter(Boolean).join(' · ') }}</small></span></div></article></div></div></section>

    <section class="sp-section sp-final-cta"><div class="sp-container sp-final-cta-row"><div><span class="sp-eyebrow sp-eyebrow-light">{{ isEnglish ? 'Let’s get started' : 'ابدأ رحلتك الرقمية' }}</span><h2>{{ isEnglish ? 'Build your store with a team that supports you' : 'ابدأ متجرك مع فريق يدعمك في كل خطوة' }}</h2><p>{{ isEnglish ? 'Tell us what you have in mind. We will help you plan the right next step.' : 'شاركنا فكرتك وسنساعدك في تحديد الخطوة المناسبة لمتجرك.' }}</p></div><NuxtLink class="sp-btn sp-btn-primary" to="/contact#inquiry">{{ isEnglish ? 'Request a consultation' : 'اطلب استشارة مجانية' }} <ArrowUpLeft :size="18" /></NuxtLink></div></section>
  </main>
</template>

<script setup lang="ts">
import { ArrowUpLeft, BarChart3, Boxes, Check, CheckCircle2, CirclePlay, CreditCard, LayoutDashboard, LifeBuoy, Quote, ShieldCheck, Smartphone, Store, TrendingUp, Users, Zap } from 'lucide-vue-next'
import { storeProBenefits, storeProPlans, storeProPortfolio, storeProServices, storeProText } from '~/data/storepro'
const { isEnglish } = useLocale()
const config = useRuntimeConfig()
const services = storeProServices
const benefits = storeProBenefits
const plans = storeProPlans
const portfolio = storeProPortfolio
const iconMap = { Store, LayoutDashboard, Smartphone, Boxes, CreditCard, LifeBuoy, Users, ShieldCheck, TrendingUp, Zap }
const { data: testimonials } = await useAsyncData('storepro-testimonials', async () => {
  try {
    const response = await $fetch<{ data: any }>('/testimonial', { baseURL: config.public.apiBase })
    return Array.isArray(response.data) ? response.data : []
  } catch { return [] }
}, { default: () => [] })
useSeoMeta({
  title: () => isEnglish.value ? 'StorePro | Build and grow your online store' : 'StorePro | ابنِ متجرك الإلكتروني وابدأ النمو',
  description: () => isEnglish.value ? 'StorePro helps businesses launch and manage online stores with design, operations, and integration services.' : 'يساعدك StorePro على إطلاق متجرك الإلكتروني وإدارته من خلال حلول التصميم والتشغيل والتكاملات.',
  ogTitle: () => isEnglish.value ? 'StorePro | E-commerce solutions' : 'StorePro | حلول التجارة الإلكترونية',
  ogDescription: () => isEnglish.value ? 'Build an online store that helps your business grow.' : 'ابنِ متجرك الإلكتروني وابدأ رحلتك نحو النمو.',
})
</script>
