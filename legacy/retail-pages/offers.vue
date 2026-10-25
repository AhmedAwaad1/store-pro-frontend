<template>
  <main class="offers-page">
    <section class="offers-hero-section">
      <div class="container">
        <div class="offers-hero" role="region" :aria-label="isEnglish ? 'Featured offers' : 'العروض المميزة'" aria-roledescription="carousel">
          <picture :key="activeOfferSlide.id" class="offers-hero__media">
            <source v-if="activeOfferSlide.mobile_image" media="(max-width: 640px)" :srcset="activeOfferSlide.mobile_image">
            <img :src="activeOfferSlideImage" :alt="slideAlt(activeOfferSlide)" width="2172" height="724" :fetchpriority="activeOfferSlideIndex === 0 ? 'high' : 'auto'" :loading="activeOfferSlideIndex === 0 ? 'eager' : 'lazy'" decoding="async" @error="useLocalOfferSlideFallback">
          </picture>
          <div class="offers-hero__shade" aria-hidden="true"></div>
          <div class="offers-hero__copy" :dir="isEnglish ? 'ltr' : 'rtl'">
            <span class="offers-hero__eyebrow">3B · {{ isEnglish ? 'Limited-time campaigns' : 'عروض لفترة محدودة' }}</span>
            <h1>{{ slideTitle(activeOfferSlide) }}</h1>
            <p>{{ slideDescription(activeOfferSlide) }}</p>
            <NuxtLink class="btn offers-hero__action" :to="activeOfferSlide.url || '/products?sort=sale'">{{ isEnglish ? 'Shop the offers' : 'تسوق العروض' }} <ArrowLeft :size="18" /></NuxtLink>
          </div>
          <div v-if="offerSlides.length > 1" class="offers-hero__controls">
            <button type="button" :aria-label="isEnglish ? 'Previous slide' : 'الشريحة السابقة'" @click="moveOfferSlide(-1)"><ArrowRight v-if="!isEnglish" :size="19" /><ArrowLeft v-else :size="19" /></button>
            <div class="offers-hero__dots" role="group" :aria-label="isEnglish ? 'Offer slides' : 'شرائح العروض'">
              <button v-for="(slide, index) in offerSlides" :key="slide.id" type="button" :class="{ active: activeOfferSlideIndex === index }" :aria-current="activeOfferSlideIndex === index ? 'true' : undefined" :aria-label="offerSlideLabel(index)" @click="activeOfferSlideIndex = index" />
            </div>
            <button type="button" :aria-label="isEnglish ? 'Next slide' : 'الشريحة التالية'" @click="moveOfferSlide(1)"><ArrowLeft v-if="!isEnglish" :size="19" /><ArrowRight v-else :size="19" /></button>
            <span class="sr-only" aria-live="polite">{{ offerSlideLabel(activeOfferSlideIndex) }}</span>
          </div>
        </div>
      </div>
    </section>
    <section class="section offers-catalog"><div class="container">
      <p v-if="error" class="state error">{{ error }}</p>
      <p v-else-if="loading" class="state">{{ isEnglish ? 'Loading current offers…' : 'جارٍ تحميل العروض الحالية…' }}</p>
      <template v-else>
        <div class="offer-filters">
          <label><span>{{ isEnglish ? 'Find an offer' : 'ابحث عن عرض' }}</span><input v-model.trim="search" type="search" :placeholder="isEnglish ? 'Campaign name' : 'اسم الحملة'"></label>
          <label><span>{{ isEnglish ? 'Offer type' : 'نوع العرض' }}</span><select v-model="targetFilter"><option value="all">{{ isEnglish ? 'All offers' : 'كل العروض' }}</option><option value="product">{{ isEnglish ? 'Products' : 'منتجات' }}</option><option value="category">{{ isEnglish ? 'Categories' : 'فئات' }}</option><option value="brand">{{ isEnglish ? 'Brands' : 'علامات تجارية' }}</option><option value="collection">{{ isEnglish ? 'Collections' : 'مجموعات' }}</option></select></label>
          <span class="offer-count">{{ visiblePromotions.length }} {{ isEnglish ? 'offers' : 'عروض' }}</span>
        </div>
        <div v-if="visiblePromotions.length" class="offer-grid">
          <article v-for="promotion in visiblePromotions" :key="promotion.id" class="offer-card">
            <div v-if="offerCardImage(promotion)" class="offer-card__image">
              <img :src="offerCardImage(promotion)?.src || ''" :alt="offerCardImage(promotion)?.alt || promotion.name" width="2048" height="768" loading="lazy" decoding="async">
              <span class="offer-badge">{{ discountLabel(promotion) }}</span>
            </div>
            <div class="offer-card__content">
              <p class="eyebrow">{{ targetLabel(promotion) }}</p>
              <h2>{{ promotionName(promotion) }}</h2>
              <p v-if="promotionTerms(promotion)" class="terms">{{ promotionTerms(promotion) }}</p>
              <p v-if="promotion.ends_at" class="ends-at">{{ isEnglish ? 'Offer ends' : 'ينتهي العرض' }} · {{ dateLabel(promotion.ends_at) }}</p>
              <NuxtLink class="btn primary" :to="productTarget(promotion) ? `/product/${productTarget(promotion)}` : '/products?sort=sale'">{{ isEnglish ? 'Shop this offer' : 'تسوق العرض' }} <ArrowLeft /></NuxtLink>
            </div>
          </article>
        </div>
        <EmptyState v-else :title="isEnglish ? 'No offers found' : 'لا توجد عروض مطابقة'" :text="isEnglish ? 'Try another search or category.' : 'جرّب بحثاً أو فئة أخرى.'" :action="isEnglish ? 'Browse products' : 'تصفح المنتجات'" action-to="/products" />
      </template>
    </div></section>
  </main>
</template>

<script setup lang="ts">
import { ArrowLeft, ArrowRight } from 'lucide-vue-next'
import { formatPrice } from '~/data/products'

type PromotionTarget = { target_type: string, target_id: number, image_url?: string | null, image_alt_en?: string | null, image_alt_ar?: string | null }
type Promotion = { id: number, name: string, badge_en?: string | null, badge_ar?: string | null, terms_en?: string | null, terms_ar?: string | null, discount_type: 'percentage' | 'fixed', discount_value: number, ends_at?: string | null, targets: PromotionTarget[] }
const { locale, isEnglish } = useLocale()
const { request } = useApi()
const config = useRuntimeConfig()
type OfferSlide = { id: number | string, title_en?: string | null, title_ar?: string | null, description_en?: string | null, description_ar?: string | null, image: string, mobile_image?: string | null, alt_en?: string | null, alt_ar?: string | null, url?: string | null, sort_order?: number, is_active?: boolean }
const starterOfferSlides: OfferSlide[] = [
  { id: 'starter-entertainment', title_en: 'Make every night a big-screen night', title_ar: 'ليالٍ أكبر تبدأ من شاشة أفضل', description_en: 'Explore televisions and home-entertainment picks in our current offers.', description_ar: 'اكتشف عروض التلفزيونات وأجهزة الترفيه المنزلي الحالية.', image: '/images/offers/home-entertainment.jpg', alt_en: 'Television and soundbar in a modern living room', alt_ar: 'تلفزيون ومكبر صوت في غرفة معيشة عصرية', url: '/products?sort=sale' },
  { id: 'starter-tech', title_en: 'Upgrade your everyday tech', title_ar: 'طوّر تجربتك التقنية اليومية', description_en: 'Find a better fit for work, study, and everything in between.', description_ar: 'اختر ما يناسب العمل والدراسة وكل تفاصيل يومك.', image: '/images/offers/tech-bundle.jpg', alt_en: 'Laptop, smartphone, and wireless earbuds on a desk', alt_ar: 'حاسوب محمول وهاتف وسماعات لاسلكية على مكتب', url: '/products?sort=sale' },
  { id: 'starter-appliances', title_en: 'Smarter mornings start at home', title_ar: 'صباح أسهل يبدأ من مطبخك', description_en: 'Shop coffee and kitchen appliances selected for everyday use.', description_ar: 'تسوّق أجهزة القهوة والمطبخ المناسبة لاستخدامك اليومي.', image: '/images/offers/home-appliances.jpg', alt_en: 'Coffee machine, blender, and air fryer in a kitchen', alt_ar: 'ماكينة قهوة وخلاط وقلاية هوائية في مطبخ', url: '/products?sort=sale' },
]
const offerSlideFallbackImages = [
  { src: '/images/offers/home-entertainment.jpg', alt_en: 'Television and soundbar in a modern living room', alt_ar: 'تلفزيون ومكبر صوت في غرفة معيشة عصرية' },
  { src: '/images/offers/tech-bundle.jpg', alt_en: 'Laptop, smartphone, and wireless earbuds on a desk', alt_ar: 'حاسوب محمول وهاتف وسماعات لاسلكية على مكتب' },
  { src: '/images/offers/home-appliances.jpg', alt_en: 'Coffee machine and kitchen appliances', alt_ar: 'ماكينة قهوة وأجهزة منزلية للمطبخ' },
]
const { data: configuredOfferSlides } = await useAsyncData<OfferSlide[] | null>('offers-page-banners', async () => {
  try {
    const response = await $fetch<{ data: OfferSlide[] }>('/banner', { baseURL: config.public.apiBase, params: { placement: 'offers_page' } })
    return response.data || []
  } catch {
    return null
  }
})
const offerSlides = computed(() => {
  const configured = (configuredOfferSlides.value || []).filter(slide => slide.is_active !== false).sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0))
  return configured.length ? configured : starterOfferSlides
})
const activeOfferSlideIndex = ref(0)
const activeOfferSlide = computed(() => offerSlides.value[activeOfferSlideIndex.value] || offerSlides.value[0] || starterOfferSlides[0])
const failedOfferSlideImages = ref<Record<string, boolean>>({})
const activeOfferSlideImage = computed(() => failedOfferSlideImages.value[String(activeOfferSlide.value.id)]
  ? offerSlideFallbackImages[activeOfferSlideIndex.value % offerSlideFallbackImages.length].src
  : activeOfferSlide.value.image)
let offerCarouselTimer: ReturnType<typeof setInterval> | undefined
function moveOfferSlide(direction: number) { activeOfferSlideIndex.value = (activeOfferSlideIndex.value + direction + offerSlides.value.length) % offerSlides.value.length }
function useLocalOfferSlideFallback() { failedOfferSlideImages.value = { ...failedOfferSlideImages.value, [String(activeOfferSlide.value.id)]: true } }
function offerCardImage(promotion: Promotion) {
  const targetImage = promotion.targets.find(target => target.image_url)
  if (!targetImage?.image_url) return null

  return {
    src: targetImage.image_url,
    alt: locale.value === 'ar'
      ? targetImage.image_alt_ar || promotion.name
      : targetImage.image_alt_en || promotion.name,
  }
}
function slideTitle(slide: OfferSlide) { return locale.value === 'ar' ? slide.title_ar || slide.title_en || '' : slide.title_en || slide.title_ar || '' }
function slideDescription(slide: OfferSlide) { return locale.value === 'ar' ? slide.description_ar || slide.description_en || '' : slide.description_en || slide.description_ar || '' }
function slideAlt(slide: OfferSlide) { return locale.value === 'ar' ? slide.alt_ar || slide.alt_en || slideTitle(slide) : slide.alt_en || slide.alt_ar || slideTitle(slide) }
function offerSlideLabel(index: number) { return isEnglish.value ? `Slide ${index + 1} of ${offerSlides.value.length}` : `الشريحة ${index + 1} من ${offerSlides.value.length}` }
const promotions = ref<Promotion[]>([])
const loading = ref(true)
const error = ref('')
const search = ref('')
const targetFilter = ref('all')
const visiblePromotions = computed(() => promotions.value.filter(item => {
  const targetMatches = targetFilter.value === 'all' || item.targets.some(target => target.target_type === targetFilter.value || (targetFilter.value === 'product' && target.target_type === 'variant'))
  const query = search.value.toLocaleLowerCase()
  const textMatches = !query || [item.name, item.badge_en, item.badge_ar].some(value => value?.toLocaleLowerCase().includes(query))
  return targetMatches && textMatches
}))

function promotionName(item: Promotion) { return item.name }
function promotionTerms(item: Promotion) { return locale.value === 'ar' ? item.terms_ar || item.terms_en : item.terms_en || item.terms_ar }
function discountLabel(item: Promotion) {
  return item.discount_type === 'percentage'
    ? `${Number(item.discount_value)}% ${isEnglish.value ? 'OFF' : 'خصم'}`
    : `${isEnglish.value ? 'Save' : 'وفر'} ${formatPrice(Number(item.discount_value), locale.value)}`
}
function targetLabel(item: Promotion) {
  const types = [...new Set(item.targets.map(target => target.target_type))]
  const names: Record<string, [string, string]> = { product: ['Products', 'منتجات'], category: ['Categories', 'فئات'], brand: ['Brands', 'علامات تجارية'], collection: ['Collections', 'مجموعات'], variant: ['Product variants', 'خيارات المنتجات'] }
  return types.map(type => names[type]?.[isEnglish.value ? 0 : 1] || type).join(' · ')
}
function productTarget(item: Promotion) { return item.targets.find(target => target.target_type === 'product')?.target_id || null }
function dateLabel(value: string) { return new Intl.DateTimeFormat(locale.value === 'ar' ? 'ar-EG' : 'en-EG', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value)) }

onMounted(async () => {
  if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches && offerSlides.value.length > 1) {
    offerCarouselTimer = setInterval(() => {
      if (document.visibilityState === 'visible') moveOfferSlide(1)
    }, 5000)
  }
  try {
    const response = await request<{ promotions: Promotion[] }>('/promotions')
    promotions.value = response.promotions ?? []
  } catch (exception: any) {
    error.value = exception?.data?.message || (isEnglish.value ? 'Offers are temporarily unavailable.' : 'العروض غير متاحة مؤقتاً.')
  } finally {
    loading.value = false
  }
})

onUnmounted(() => { if (offerCarouselTimer) clearInterval(offerCarouselTimer) })
</script>

<style scoped>
.offers-hero-section{padding:24px 0 0}
.offers-hero{position:relative;isolation:isolate;overflow:hidden;min-height:clamp(340px,34vw,500px);aspect-ratio:3.05/1;border-radius:22px;background:#171a21;color:#fff;box-shadow:0 18px 42px #11182724}
.offers-hero__media,.offers-hero__media img{position:absolute;inset:0;display:block;width:100%;height:100%}
.offers-hero__media img{object-fit:cover;animation:offer-slide-in .45s ease both}
.offers-hero__shade{position:absolute;inset:0;z-index:0;background:linear-gradient(to left,rgba(16,19,25,.9) 0%,rgba(16,19,25,.74) 36%,rgba(16,19,25,.12) 74%,transparent 100%)}
.offers-hero__copy{position:absolute;z-index:1;right:5.5%;top:50%;transform:translateY(-50%);width:min(39%,560px);text-align:start}
.offers-hero__eyebrow{display:inline-flex;align-items:center;min-height:31px;padding:5px 11px;border:1px solid #ffffff38;border-radius:999px;background:#151820a8;color:#ffdf43;font-size:.8rem;font-weight:800}
.offers-hero__copy h1{max-width:17ch;margin:14px 0 10px;color:#fff;font-size:clamp(2rem,4vw,3.8rem);line-height:1.12;text-wrap:balance}
.offers-hero__copy p{max-width:42ch;margin:0;color:#f2f2f2;font-size:clamp(.95rem,1.3vw,1.1rem);line-height:1.7;text-wrap:pretty}
.offers-hero__action{display:inline-flex;align-items:center;gap:9px;min-height:48px;margin-top:22px;padding:0 19px;border-radius:11px;background:#ffdf43;color:#171717;font-weight:800;text-decoration:none}
.offers-hero__action:hover{background:#ffe76f;color:#111}
.offers-hero__controls{position:absolute;z-index:2;inset-inline-start:22px;bottom:18px;display:flex;align-items:center;gap:10px}
.offers-hero__controls>button{display:grid;place-items:center;width:38px;height:38px;padding:0;border:1px solid #ffffff6e;border-radius:50%;background:#111820b8;color:#fff;cursor:pointer}
.offers-hero__controls>button:hover{background:#111820}
.offers-hero__controls>button:focus-visible,.offers-hero__dots button:focus-visible{outline:3px solid #ffdf43;outline-offset:3px}
.offers-hero__dots{display:flex;align-items:center;gap:7px}
.offers-hero__dots button{width:8px;height:8px;padding:0;border:0;border-radius:50%;background:#ffffff9c;cursor:pointer;transition:width .2s ease}
.offers-hero__dots button.active{width:23px;border-radius:8px;background:#ffdf43}
.offers-catalog{padding-top:28px}
@keyframes offer-slide-in{from{opacity:.7}to{opacity:1}}
.offer-filters{display:flex;align-items:end;gap:14px;margin:0 0 24px}.offer-filters label{display:grid;gap:6px;min-width:220px;color:var(--muted);font-size:.85rem}.offer-filters input,.offer-filters select{height:44px;padding:0 12px;border:1px solid var(--line);border-radius:10px;background:var(--theme-surface);color:var(--theme-text);font:inherit}.offer-count{margin-inline-start:auto;color:var(--muted);font-size:.9rem;padding-bottom:10px}.offer-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:18px}.offer-card{position:relative;min-height:260px;overflow:hidden;border:1px solid var(--line);border-radius:18px;background:var(--theme-surface);box-shadow:0 10px 28px #1731280a;display:flex;flex-direction:column;align-items:stretch}.offer-card__image{position:relative;width:100%;aspect-ratio:2.75/1;overflow:hidden;background:var(--theme-surface)}.offer-card__image img{display:block;width:100%;height:100%;object-fit:cover}.offer-card__content{display:flex;flex:1;flex-direction:column;align-items:flex-start;padding:18px 22px 22px}.offer-badge{position:absolute;top:14px;inset-inline-start:14px;border-radius:999px;padding:8px 12px;background:var(--green);color:white;font-size:.8rem;font-weight:800}.eyebrow{margin:0 0 4px;color:var(--muted);font-size:.76rem;text-transform:uppercase;letter-spacing:.08em}.offer-card h2{margin:0;font-size:1.2rem}.terms{margin:10px 0;color:var(--muted);line-height:1.5}.ends-at{margin-top:auto;color:var(--muted);font-size:.83rem}.offer-card .btn{display:inline-flex;align-items:center;gap:8px;margin-top:14px}.state{padding:18px;color:var(--muted)}.error{color:#b42318}@media(max-width:900px){.offer-grid{grid-template-columns:repeat(2,minmax(0,1fr))}}@media(max-width:600px){.offer-filters{align-items:stretch;flex-direction:column}.offer-filters label{min-width:0}.offer-count{margin:0;padding:0}.offer-grid{grid-template-columns:1fr}}
@media(prefers-reduced-motion:reduce){.offers-hero__media img,.offers-hero__dots button{animation:none;transition:none}}
@media(max-width:640px){.offers-hero-section{padding-top:14px}.offers-hero{min-height:430px;aspect-ratio:1.05/1;border-radius:15px}.offers-hero__media img{object-position:center}.offers-hero__shade{background:linear-gradient(180deg,rgba(16,19,25,.03) 0%,rgba(16,19,25,.12) 25%,rgba(16,19,25,.9) 64%,rgba(16,19,25,.97) 100%)}.offers-hero__copy{top:auto;right:18px;bottom:76px;transform:none;width:auto;max-width:520px}.offers-hero__eyebrow{min-height:27px;font-size:.72rem}.offers-hero__copy h1{max-width:20ch;margin:9px 0 7px;font-size:1.8rem}.offers-hero__copy p{max-width:38ch;font-size:.88rem;line-height:1.5}.offers-hero__action{min-height:42px;margin-top:13px;padding-inline:14px;font-size:.9rem}.offers-hero__controls{inset-inline-start:12px;bottom:12px;gap:7px}.offers-hero__controls>button{width:32px;height:32px}.offers-hero__dots{gap:5px}.offer-filters{align-items:stretch;flex-direction:column}.offer-filters label{min-width:0}.offer-count{margin:0;padding:0}.offer-grid{grid-template-columns:1fr}}
</style>
