<template>
  <main class="sp-home">
    <section id="home" class="sp-hero">
      <div class="sp-container sp-hero-layout">
        <div class="sp-hero-copy" :dir="isEnglish ? 'ltr' : 'rtl'">
          <span class="sp-eyebrow sp-eyebrow-light">
            {{ isEnglish ? 'Your business, online' : 'مشروعك يبدأ من هنا' }}
          </span>
          <h1>
            {{ isEnglish ? 'Build an online store that helps your business grow' : 'ابنِ متجرك الإلكتروني وابدأ رحلتك نحو النمو' }}
          </h1>
          <p>
            {{ isEnglish ? 'StorePro brings store design, management tools, and the integrations you need together in one place.' : 'حلول تجارة إلكترونية متكاملة تجمع تصميم متجرك وأدوات إدارته والتكاملات التي يحتاجها نشاطك.' }}
          </p>

          <div class="sp-hero-actions">
            <NuxtLink class="sp-btn sp-btn-primary" to="/contact#inquiry">
              {{ isEnglish ? 'Start your store' : 'ابدأ متجرك الآن' }}
              <StoreProDirectionalArrow :size="19" />
            </NuxtLink>
            <NuxtLink class="sp-btn sp-btn-outline-light" to="/portfolio">
              {{ isEnglish ? 'Explore our work' : 'اكتشف أعمالنا' }}
              <CirclePlay :size="18" />
            </NuxtLink>
          </div>

          <ul class="sp-hero-points">
            <li><CheckCircle2 :size="17" />{{ isEnglish ? 'A plan shaped around your needs' : 'حل يناسب احتياجات نشاطك' }}</li>
            <li><CheckCircle2 :size="17" />{{ isEnglish ? 'Launch and ongoing support' : 'دعم في الإطلاق وما بعده' }}</li>
          </ul>
        </div>

        <div class="sp-hero-visual">
          <img
            src="/images/storepro/hero-dashboard-cutout.webp"
            :alt="isEnglish ? 'StorePro store dashboard on laptop and mobile' : 'لوحة متجر StorePro على الحاسوب والهاتف'"
            width="1672"
            height="941"
            fetchpriority="high"
          />
          <span class="sp-hero-stat-badge">
            <BarChart3 :size="17" />
            {{ isEnglish ? 'Store tools in one place' : 'أدوات متجرك في مكان واحد' }}
          </span>
          <span class="sp-hero-visual-caption">
            <span class="sp-live-dot"></span>
            {{ isEnglish ? 'Ready for your next step' : 'جاهز لخطوتك القادمة' }}
          </span>
        </div>
      </div>
    </section>

    <section class="sp-proof-strip" :aria-label="isEnglish ? 'StorePro benefits' : 'مميزات StorePro'">
      <div class="sp-container sp-proof-grid">
        <span><CheckCircle2 :size="18" />{{ isEnglish ? 'Quick launch plan' : 'خطة إطلاق واضحة' }}</span>
        <span><CheckCircle2 :size="18" />{{ isEnglish ? 'Ongoing support' : 'دعم مستمر' }}</span>
        <span><CheckCircle2 :size="18" />{{ isEnglish ? 'Built for every business' : 'مناسب لمختلف الأنشطة' }}</span>
      </div>
    </section>

    <section id="services" class="sp-section">
      <div class="sp-container">
        <div class="sp-section-head">
          <div>
            <span class="sp-eyebrow">{{ isEnglish ? 'What we offer' : 'خدماتنا' }}</span>
            <h2>{{ isEnglish ? 'Everything you need to sell online' : 'كل ما تحتاجه لبناء متجرك الإلكتروني' }}</h2>
            <p>{{ isEnglish ? 'A connected set of services to help you launch, manage, and grow.' : 'خدمات متكاملة تساعدك على إطلاق متجرك وإدارته وتطويره.' }}</p>
          </div>
          <NuxtLink class="sp-text-link" to="/services">
            {{ isEnglish ? 'All services' : 'عرض جميع الخدمات' }}
            <StoreProDirectionalArrow :size="17" />
          </NuxtLink>
        </div>

        <div class="sp-service-grid">
          <article v-for="service in services" :key="service.id" class="sp-service-card">
            <span class="sp-icon-bubble">
              <component :is="iconMap[service.icon]" :size="23" />
            </span>
            <h3>{{ storeProText(service.title, isEnglish) }}</h3>
            <p>{{ storeProText(service.description, isEnglish) }}</p>
            <NuxtLink :to="`/services#${service.id}`" class="sp-card-link">
              {{ isEnglish ? 'Learn more' : 'المزيد' }}
              <StoreProDirectionalArrow :size="15" />
            </NuxtLink>
          </article>
        </div>
      </div>
    </section>

    <section id="why-storepro" class="sp-section sp-section-soft">
      <div class="sp-container sp-why-layout">
        <div class="sp-why-art">
          <div class="sp-dashboard-window">
            <div class="sp-window-top">
              <i></i><i></i><i></i>
              <span>{{ isEnglish ? 'Store overview' : 'نظرة عامة على المتجر' }}</span>
              <small class="sp-window-range">{{ isEnglish ? 'Demo' : 'معاينة' }}</small>
            </div>

            <div class="sp-window-body">
              <div class="sp-window-side" aria-hidden="true">
                <b></b><b></b><b></b><b></b>
              </div>

              <div class="sp-window-main">
                <div class="sp-window-stats">
                  <article>
                    <small>{{ isEnglish ? 'Sales' : 'المبيعات' }}</small>
                    <strong>{{ isEnglish ? '12,480 EGP' : '١٢٬٤٨٠ ج.م' }}</strong>
                  </article>
                  <article>
                    <small>{{ isEnglish ? 'Orders' : 'الطلبات' }}</small>
                    <strong>{{ isEnglish ? '128' : '١٢٨' }}</strong>
                  </article>
                  <article>
                    <small>{{ isEnglish ? 'Average order' : 'متوسط الطلب' }}</small>
                    <strong>{{ isEnglish ? '420 EGP' : '٤٢٠ ج.م' }}</strong>
                  </article>
                </div>

                <div class="sp-chart">
                  <svg
                    class="sp-chart-graph"
                    viewBox="0 0 420 150"
                    role="img"
                    :aria-label="isEnglish ? 'Illustrative store analytics chart' : 'رسم توضيحي لتحليلات المتجر'"
                  >
                    <defs>
                      <linearGradient id="storepro-chart-area" x1="0" x2="0" y1="0" y2="1">
                        <stop offset="0%" stop-color="#3B82F6" stop-opacity=".28" />
                        <stop offset="100%" stop-color="#3B82F6" stop-opacity="0" />
                      </linearGradient>
                    </defs>
                    <path class="sp-chart-grid" d="M8 30H412 M8 70H412 M8 110H412 M8 145H412" />
                    <path class="sp-chart-area" d="M8 121 C38 115 47 96 76 101 S117 74 145 81 S184 55 214 65 S254 47 282 55 S322 28 350 39 S385 18 412 22 V145 H8 Z" />
                    <path class="sp-chart-line" d="M8 121 C38 115 47 96 76 101 S117 74 145 81 S184 55 214 65 S254 47 282 55 S322 28 350 39 S385 18 412 22" />
                    <circle class="sp-chart-point" cx="76" cy="101" r="4" />
                    <circle class="sp-chart-point" cx="145" cy="81" r="4" />
                    <circle class="sp-chart-point" cx="214" cy="65" r="4" />
                    <circle class="sp-chart-point" cx="282" cy="55" r="4" />
                    <circle class="sp-chart-point" cx="350" cy="39" r="4" />
                    <circle class="sp-chart-point" cx="412" cy="22" r="4" />
                  </svg>
                </div>

                <div class="sp-window-products" aria-hidden="true"><b></b><b></b><b></b></div>
                <p class="sp-dashboard-caption">{{ isEnglish ? 'Illustrative dashboard preview' : 'واجهة توضيحية للوحة التحكم' }}</p>
              </div>
            </div>
          </div>

          <span class="sp-art-note">
            <BarChart3 :size="19" />
            {{ isEnglish ? 'A clear view of daily activity' : 'صورة واضحة لنشاط متجرك' }}
          </span>
        </div>

        <div class="sp-why-copy">
          <span class="sp-eyebrow">{{ isEnglish ? 'Why StorePro' : 'لماذا StorePro؟' }}</span>
          <h2>{{ isEnglish ? 'From your first idea to a store ready to grow' : 'من فكرتك الأولى إلى متجر جاهز للنمو' }}</h2>
          <p>{{ isEnglish ? 'We bring the technology and practical guidance together so you can focus on your customers and your business.' : 'نجمع التقنية مع خطوات عملية تساعدك على التركيز على عملائك وتطوير أعمالك.' }}</p>

          <div class="sp-benefit-list">
            <article v-for="benefit in benefits" :key="benefit.title.en">
              <span><component :is="iconMap[benefit.icon]" :size="20" /></span>
              <div>
                <h3>{{ storeProText(benefit.title, isEnglish) }}</h3>
                <p>{{ storeProText(benefit.description, isEnglish) }}</p>
              </div>
            </article>
          </div>

          <NuxtLink class="sp-btn sp-btn-secondary" to="/about">
            {{ isEnglish ? 'Meet StorePro' : 'تعرف على StorePro' }}
            <StoreProDirectionalArrow :size="17" />
          </NuxtLink>
        </div>
      </div>
    </section>

    <section id="portfolio" class="sp-section">
      <div class="sp-container">
        <div class="sp-section-head">
          <div>
            <span class="sp-eyebrow">{{ isEnglish ? 'Store examples' : 'نماذج متاجر' }}</span>
            <h2>{{ isEnglish ? 'A storefront for every kind of business' : 'تجربة متجر تناسب طبيعة نشاطك' }}</h2>
            <p>{{ isEnglish ? 'Illustrative storefront concepts showing how a StorePro store can be tailored.' : 'نماذج تصميم توضيحية تبين كيف يمكن تخصيص المتجر حسب طبيعة نشاطك.' }}</p>
          </div>
          <NuxtLink class="sp-text-link" to="/portfolio">
            {{ isEnglish ? 'View all examples' : 'عرض جميع النماذج' }}
            <StoreProDirectionalArrow :size="17" />
          </NuxtLink>
        </div>

        <div class="sp-portfolio-grid">
          <NuxtLink v-for="item in portfolio" :key="item.id" to="/portfolio" class="sp-portfolio-card">
            <div class="sp-portfolio-image">
              <img :src="item.image" :alt="storeProText(item.title, isEnglish)" width="1448" height="1200" loading="lazy" decoding="async" />
              <span>{{ isEnglish ? 'Concept' : 'نموذج توضيحي' }}</span>
            </div>
            <div class="sp-portfolio-info">
              <div>
                <h3>{{ storeProText(item.title, isEnglish) }}</h3>
                <p>{{ storeProText(item.category, isEnglish) }}</p>
              </div>
              <StoreProDirectionalArrow :size="18" />
            </div>
          </NuxtLink>
        </div>
      </div>
    </section>

    <section id="pricing" class="sp-section sp-section-soft">
      <div class="sp-container">
        <div class="sp-section-head sp-section-head-centered">
          <div>
            <span class="sp-eyebrow">{{ isEnglish ? 'Plans' : 'خطط الأسعار' }}</span>
            <h2>{{ isEnglish ? 'Choose a setup that fits your next step' : 'اختر الحل المناسب لخطوتك القادمة' }}</h2>
            <p>{{ isEnglish ? 'Plans are tailored to your business requirements. Request a consultation for a clear quote.' : 'نحدد تفاصيل الباقة حسب احتياجات نشاطك. اطلب استشارة لتحصل على عرض واضح.' }}</p>
          </div>
        </div>

        <div class="sp-pricing-grid">
          <article v-for="plan in plans" :key="plan.id" class="sp-price-card" :class="{ 'sp-price-card-featured': plan.popular }">
            <span v-if="plan.popular" class="sp-popular-tag">{{ isEnglish ? 'Most requested' : 'الأكثر طلبًا' }}</span>
            <h3>{{ storeProText(plan.title, isEnglish) }}</h3>
            <p>{{ storeProText(plan.description, isEnglish) }}</p>
            <strong class="sp-price-label">{{ isEnglish ? 'Custom quote' : 'عرض سعر مخصص' }}</strong>
            <ul>
              <li v-for="feature in plan.features" :key="feature.en">
                <Check :size="16" />
                {{ storeProText(feature, isEnglish) }}
              </li>
            </ul>
            <NuxtLink class="sp-btn" :class="plan.popular ? 'sp-btn-primary' : 'sp-btn-outline'" :to="`/contact?package=${plan.id}#inquiry`">
              {{ isEnglish ? 'Request details' : 'اطلب تفاصيل الباقة' }}
              <StoreProDirectionalArrow :size="16" />
            </NuxtLink>
          </article>
        </div>
      </div>
    </section>

    <section v-if="testimonials.length" id="testimonials" class="sp-section">
      <div class="sp-container">
        <div class="sp-section-head">
          <div>
            <span class="sp-eyebrow">{{ isEnglish ? 'Customer stories' : 'آراء العملاء' }}</span>
            <h2>{{ isEnglish ? 'What our customers say' : 'ماذا يقول عملاؤنا؟' }}</h2>
          </div>
        </div>

        <div class="sp-testimonial-grid">
          <article v-for="item in testimonials.slice(0, 3)" :key="item.id" class="sp-testimonial-card">
            <Quote :size="24" />
            <blockquote>{{ item.quote }}</blockquote>
            <div class="sp-testimonial-author">
              <img v-if="item.avatar_url" :src="item.avatar_url" alt="" width="48" height="48" loading="lazy" />
              <span>
                <strong>{{ item.author_name }}</strong>
                <small>{{ [item.author_title, item.company_name].filter(Boolean).join(' · ') }}</small>
              </span>
            </div>
          </article>
        </div>
      </div>
    </section>
  </main>
</template>

<script setup lang="ts">
import {
  BarChart3,
  Boxes,
  Check,
  CheckCircle2,
  CirclePlay,
  CreditCard,
  LayoutDashboard,
  LifeBuoy,
  Quote,
  ShieldCheck,
  Smartphone,
  Store,
  TrendingUp,
  Users,
  Zap,
} from 'lucide-vue-next'
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
  } catch {
    return []
  }
}, { default: () => [] })

useSeoMeta({
  title: () => isEnglish.value ? 'StorePro | Build and grow your online store' : 'StorePro | ابنِ متجرك الإلكتروني وابدأ النمو',
  description: () => isEnglish.value ? 'StorePro helps businesses launch and manage online stores with design, operations, and integration services.' : 'يساعدك StorePro على إطلاق متجرك الإلكتروني وإدارته من خلال حلول التصميم والتشغيل والتكاملات.',
  ogTitle: () => isEnglish.value ? 'StorePro | E-commerce solutions' : 'StorePro | حلول التجارة الإلكترونية',
  ogDescription: () => isEnglish.value ? 'Build an online store that helps your business grow.' : 'ابنِ متجرك الإلكتروني وابدأ رحلتك نحو النمو.',
})
</script>
