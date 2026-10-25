<template>
  <main>
    <section class="section category-content">
      <div class="container">
        <div v-if="categories.length" class="main-category-section">
          <div
            class="category-showcase"
            role="region"
            :aria-label="t('mainCategories')"
            aria-roledescription="carousel"
            @mouseenter="categoryCarouselHovered = true"
            @mouseleave="categoryCarouselHovered = false"
            @focusin="categoryCarouselFocused = true"
            @focusout="handleCategoryFocusOut"
          >
            <div class="category-showcase-copy">
              <span class="category-showcase-eyebrow">{{ t('categoriesEyebrow') }}</span>
              <h2>{{ t('mainCategories') }}</h2>
              <p class="category-showcase-active-name">{{ activeMainCategoryName }}</p>
              <div v-if="categorySlideCount > 1" class="category-showcase-controls">
                <div class="category-showcase-arrows">
                  <button type="button" :aria-label="t('previousSlide')" @click="moveCategorySlide(-1)">
                    <span aria-hidden="true">{{ locale === 'ar' ? '→' : '←' }}</span>
                  </button>
                  <button type="button" :aria-label="t('nextSlide')" @click="moveCategorySlide(1)">
                    <span aria-hidden="true">{{ locale === 'ar' ? '←' : '→' }}</span>
                  </button>
                </div>
                <span class="category-showcase-count">{{ categorySlideIndex + 1 }} / {{ categorySlideCount }}</span>
              </div>
              <div v-if="categorySlideCount > 1" class="category-showcase-dots" role="group" :aria-label="t('mainCategories')">
                <button
                  v-for="index in categorySlideCount"
                  :key="index"
                  type="button"
                  :class="{ active: categorySlideIndex === index - 1 }"
                  :aria-current="categorySlideIndex === index - 1 ? 'true' : undefined"
                  :aria-label="t('slideNumber', { current: index, total: categorySlideCount })"
                  @click="setCategorySlide(index - 1)"
                />
              </div>
            </div>

            <TransitionGroup
              name="category-slide"
              tag="nav"
              class="category-carousel-track"
              :style="{ '--visible-category-count': visibleMainCategories.length }"
              :aria-label="t('mainCategories')"
            >
              <NuxtLink
                v-for="item in visibleMainCategories"
                :key="item.id"
                :to="`/category/${item.slug}`"
                class="category-feature-card"
                :class="{
                  'is-active': item.carouselDistance === 0,
                  'is-neighbor': Math.abs(item.carouselDistance) === 1,
                  'is-edge': Math.abs(item.carouselDistance) === 2,
                  'is-left-edge': item.carouselDistance === -2,
                  'is-right-edge': item.carouselDistance === 2,
                }"
                :style="{ gridColumn: item.carouselPosition + 1 }"
                :aria-label="item.localizedName"
                :aria-current="item.id === category?.id ? 'page' : undefined"
              >
                <span class="category-feature-visual">
                  <span class="category-feature-image">
                    <img v-if="item.thumbnails?.medium || item.image" :src="item.thumbnails?.medium || item.image || ''" alt="" loading="lazy" decoding="async">
                    <span v-else class="category-feature-placeholder" aria-hidden="true">3B</span>
                  </span>
                </span>
              </NuxtLink>
            </TransitionGroup>
          </div>
        </div>

        <div v-if="subCategoryCards.length" class="sub-category-section">
          <div
            class="sub-category-showcase"
            role="region"
            :aria-label="t('subCategories')"
            aria-roledescription="carousel"
            @mouseenter="subCategoryCarouselHovered = true"
            @mouseleave="subCategoryCarouselHovered = false"
            @focusin="subCategoryCarouselFocused = true"
            @focusout="handleSubCategoryFocusOut"
          >
            <div class="sub-category-showcase-copy">
              <span class="category-showcase-eyebrow">{{ t('subCategories') }}</span>
              <h2>{{ t('chooseType') }}</h2>
              <p class="sub-category-active-name">{{ activeSubCategoryName }}</p>
              <div v-if="subCategorySlideCount > 1" class="sub-category-controls">
                <div class="sub-category-arrows">
                  <button type="button" :aria-label="t('previousSlide')" @click="moveSubCategorySlide(-1)">
                    <span aria-hidden="true">{{ locale === 'ar' ? '→' : '←' }}</span>
                  </button>
                  <button type="button" :aria-label="t('nextSlide')" @click="moveSubCategorySlide(1)">
                    <span aria-hidden="true">{{ locale === 'ar' ? '←' : '→' }}</span>
                  </button>
                </div>
                <span class="sub-category-count">{{ subCategorySlideIndex + 1 }} / {{ subCategorySlideCount }}</span>
              </div>
              <div v-if="subCategorySlideCount > 1" class="sub-category-dots" role="group" :aria-label="t('subCategories')">
                <button
                  v-for="index in subCategorySlideCount"
                  :key="index"
                  type="button"
                  :class="{ active: subCategorySlideIndex === index - 1 }"
                  :aria-current="subCategorySlideIndex === index - 1 ? 'true' : undefined"
                  :aria-label="t('slideNumber', { current: index, total: subCategorySlideCount })"
                  @click="setSubCategorySlide(index - 1)"
                />
              </div>
            </div>

            <TransitionGroup
              name="category-slide"
              tag="nav"
              class="category-carousel-track"
              :style="{ '--visible-category-count': visibleSubCategories.length }"
              :aria-label="t('subCategories')"
            >
              <NuxtLink
                v-for="item in visibleSubCategories"
                :key="item.id"
                :to="`/sub-category/${item.slug}`"
                class="category-feature-card"
                :class="{
                  'is-active': item.carouselDistance === 0,
                  'is-neighbor': Math.abs(item.carouselDistance) === 1,
                  'is-edge': Math.abs(item.carouselDistance) === 2,
                  'is-left-edge': item.carouselDistance === -2,
                  'is-right-edge': item.carouselDistance === 2,
                }"
                :style="{ gridColumn: item.carouselPosition + 1 }"
                :aria-label="item.localizedName"
              >
                <span class="category-feature-visual">
                  <span class="category-feature-image">
                    <img v-if="item.previewImage" :src="item.previewImage" alt="" loading="lazy" decoding="async">
                    <span v-else class="category-feature-placeholder" aria-hidden="true">3B</span>
                  </span>
                </span>
              </NuxtLink>
            </TransitionGroup>
          </div>
        </div>

        <section v-if="category" class="category-hero" aria-labelledby="category-title">
          <div class="category-hero-inner" :class="{ 'without-image': !categoryImage && !category?.desktop_banner_url }">
            <div class="category-hero-copy">
              <h1 id="category-title">{{ categoryName }}</h1>
              <p>{{ categoryDescription || t('categoryIntro', { category: categoryName }) }}</p>
              <span class="eyebrow category-type-marker">{{ t('mainCategory') }}</span>
            </div>
            <div v-if="categoryImage || category?.desktop_banner_url" class="category-hero-art">
              <div class="category-hero-image-frame">
                <picture><source v-if="category?.mobile_banner_url" :srcset="category.mobile_banner_url" media="(max-width: 700px)"><img :src="category?.desktop_banner_url || categoryImage || ''" :alt="locale === 'ar' ? (category?.banner_alt_ar || category?.name || '') : (category?.banner_alt_en || category?.name || '')" fetchpriority="high"></picture>
              </div>
            </div>
          </div>
        </section>

        <div v-if="filtered.length" class="products-section">
          <div class="products-heading">
            <div class="products-heading-copy">
              <h2>{{ t('productsSection') }}</h2>
              <span>{{ t('productCount', { count: productTotal }) }}</span>
            </div>
            <div v-if="brandOptions?.length" ref="brandFilterRoot" class="brand-filter" @keydown.esc.stop.prevent="brandFilterOpen = false">
              <span id="brand-filter-label">{{ brandFilterLabel }}</span>
              <div class="brand-filter-control">
                <button
                  type="button"
                  class="brand-filter-trigger"
                  :aria-label="`${brandFilterLabel}: ${selectedBrandName}`"
                  aria-controls="category-brand-options"
                  :aria-expanded="brandFilterOpen"
                  @click="brandFilterOpen = !brandFilterOpen"
                >
                  <span class="brand-filter-value">
                    <span class="brand-logo-chip" :class="{ 'brand-logo-chip--dark': selectedBrand && brandLogoNeedsDarkSurface(selectedBrand) }" aria-hidden="true">
                      <img v-if="selectedBrand && brandLogoSrc(selectedBrand)" :src="brandLogoSrc(selectedBrand)!" alt="" @error="markBrandLogoUnavailable(selectedBrand.id)">
                      <Tags v-else-if="!selectedBrand" :size="17" />
                      <span v-else>{{ brandInitial(selectedBrand) }}</span>
                    </span>
                    <span class="brand-filter-name">{{ selectedBrandName }}</span>
                  </span>
                  <ChevronDown :size="17" aria-hidden="true" />
                </button>
                <fieldset v-if="brandFilterOpen" id="category-brand-options" class="brand-filter-menu" :aria-label="brandFilterLabel">
                  <label class="brand-filter-option" :class="{ selected: !brandId }">
                    <input type="radio" name="category-brand-filter" :checked="!brandId" @change="selectBrand('')">
                    <span class="brand-logo-chip" aria-hidden="true"><Tags :size="17" /></span>
                    <span class="brand-filter-name">{{ allBrandsLabel }}</span>
                    <Check v-if="!brandId" class="brand-filter-check" :size="17" aria-hidden="true" />
                  </label>
                  <label v-for="brand in brandOptions" :key="brand.id" class="brand-filter-option" :class="{ selected: brandId === brand.id }">
                    <input type="radio" name="category-brand-filter" :checked="brandId === brand.id" @change="selectBrand(String(brand.id))">
                    <span class="brand-logo-chip" :class="{ 'brand-logo-chip--dark': brandLogoNeedsDarkSurface(brand) }" aria-hidden="true">
                      <img v-if="brandLogoSrc(brand)" :src="brandLogoSrc(brand)!" alt="" loading="lazy" @error="markBrandLogoUnavailable(brand.id)">
                      <span v-else>{{ brandInitial(brand) }}</span>
                    </span>
                    <span class="brand-filter-name">{{ localizedBrandName(brand) }}</span>
                    <Check v-if="brandId === brand.id" class="brand-filter-check" :size="17" aria-hidden="true" />
                  </label>
                </fieldset>
              </div>
            </div>
          </div>
          <div class="product-grid">
            <ProductCard v-for="product in filtered" :key="product.id" :product="product" />
          </div>
        </div>
        <div v-else-if="brandId" class="brand-filter-empty">
          <p>{{ locale === 'ar' ? 'لا توجد منتجات من هذه العلامة التجارية في هذا القسم.' : 'This brand has no products in this category.' }}</p>
          <button type="button" @click="selectedBrandId = ''">{{ locale === 'ar' ? 'عرض كل العلامات التجارية' : 'Show all brands' }}</button>
        </div>
        <EmptyState v-else :title="t('preparingCategory')" :text="t('newChoicesSoon')" :action="t('viewAllProducts')" action-to="/products" />
        <nav v-if="pageMeta && pageMeta.last_page > 1" class="product-pagination" :aria-label="locale === 'ar' ? 'صفحات المنتجات' : 'Product pages'">
          <button :disabled="pageMeta.current_page <= 1" @click="changePage(pageMeta.current_page - 1)">{{ locale === 'ar' ? 'السابق' : 'Previous' }}</button>
          <span>{{ pageMeta.current_page }} / {{ pageMeta.last_page }}</span>
          <button :disabled="pageMeta.current_page >= pageMeta.last_page" @click="changePage(pageMeta.current_page + 1)">{{ locale === 'ar' ? 'التالي' : 'Next' }}</button>
        </nav>
      </div>
    </section>
  </main>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, ref, watch } from 'vue'
import { Check, ChevronDown, Tags } from 'lucide-vue-next'
import { brandLogoNeedsDarkSurface, brandLogoUrl } from '~/utils/brand-logo'
import { getLocalizedFirst, getProductImage } from '~/utils/catalog'
const { locale, t } = useLocale()

type BrandOption = { id: number; name_en: string; name_ar: string; slug: string; logo_url?: string | null }
const route = useRoute()
const config = useRuntimeConfig()
const siteOrigin = computed(() => String(config.public.siteUrl || 'http://localhost:3000').replace(/\/$/, ''))
const slug = computed(() => String(route.params.slug))
const { categories, getCategoryBySlug, getSubCategoriesByCategory, fetchProducts } = useCatalog()
const category = computed(() => getCategoryBySlug(slug.value))
const brandId = computed(() => {
  const id = Number(route.query.brand_id)
  return Number.isInteger(id) && id > 0 ? id : 0
})
const selectedBrandId = computed({
  get: () => brandId.value ? String(brandId.value) : '',
  set: (value: string) => {
    void navigateTo({ query: { ...route.query, brand_id: value || undefined, page: undefined } })
  },
})
const brandFilterOpen = ref(false)
const brandFilterRoot = ref<HTMLElement | null>(null)
const unavailableBrandLogos = ref(new Set<number>())
const brandFilterLabel = computed(() => locale.value === 'ar' ? 'العلامة التجارية' : 'Brand')
const allBrandsLabel = computed(() => locale.value === 'ar' ? 'كل العلامات التجارية' : 'All brands')
const localizedBrandName = (brand: BrandOption) => getLocalizedFirst(locale.value, brand.name_ar, brand.name_en)
const brandInitial = (brand: BrandOption) => localizedBrandName(brand).trim().slice(0, 1)
const markBrandLogoUnavailable = (brandId: number) => {
  unavailableBrandLogos.value = new Set([...unavailableBrandLogos.value, brandId])
}
const selectBrand = (value: string) => {
  selectedBrandId.value = value
  brandFilterOpen.value = false
}
const closeBrandFilterOnOutsidePointer = (event: PointerEvent) => {
  if (!brandFilterRoot.value?.contains(event.target as Node)) brandFilterOpen.value = false
}
const { data: brandOptions } = await useAsyncData(
  () => `category-brands-${slug.value}`,
  async () => {
    if (!category.value) return []
    try {
      const response = await $fetch<{ data?: { data?: BrandOption[] } }>('/brands', {
        baseURL: config.public.apiBase,
        query: { category_id: category.value.id, per_page: 100 },
      })
      return response.data?.data || []
    } catch {
      return []
    }
  },
  { watch: [slug, () => category.value?.id] },
)
const selectedBrand = computed(() => brandOptions.value?.find(brand => brand.id === brandId.value) || null)
const selectedBrandName = computed(() => selectedBrand.value ? localizedBrandName(selectedBrand.value) : allBrandsLabel.value)
const brandLogoSrc = (brand: BrandOption) => unavailableBrandLogos.value.has(brand.id) ? null : brandLogoUrl(brand)
const categorySlideIndex = ref(0)
const categoryVisibleCount = ref(5)
const categorySlideCount = computed(() => categories.value.length)
const categoryCarouselHovered = ref(false)
const categoryCarouselFocused = ref(false)
const visibleMainCategories = computed(() => {
  const totalCategories = categories.value.length
  if (!totalCategories) return []

  const requestedCount = Math.min(categoryVisibleCount.value, totalCategories)
  const visibleCount = requestedCount % 2 === 0 ? requestedCount - 1 : requestedCount
  const centerPosition = Math.floor(visibleCount / 2)

  return Array.from({ length: visibleCount }, (_, position) => {
    const carouselDistance = position - centerPosition
    const categoryIndex = (categorySlideIndex.value + carouselDistance + totalCategories) % totalCategories
    const item = categories.value[categoryIndex]

    return {
      ...item,
      carouselDistance,
      carouselPosition: position,
      localizedName: getLocalizedFirst(locale.value, item.name_ar, item.name_en, item.name),
    }
  })
})
const activeMainCategoryName = computed(() => visibleMainCategories.value.find(item => item.carouselDistance === 0)?.localizedName || '')
const moveCategorySlide = (step: number) => {
  const totalCategories = categorySlideCount.value
  if (totalCategories <= 1) return
  categorySlideIndex.value = (categorySlideIndex.value + step + totalCategories) % totalCategories
}
const setCategorySlide = (index: number) => {
  if (index >= 0 && index < categorySlideCount.value) categorySlideIndex.value = index
}
const handleCategoryFocusOut = (event: FocusEvent) => {
  const carousel = event.currentTarget as HTMLElement
  if (!carousel.contains(event.relatedTarget as Node | null)) categoryCarouselFocused.value = false
}
let categoryCarouselTimer: ReturnType<typeof setInterval> | undefined
const syncCategoryCarouselAutoplay = () => {
  if (import.meta.client && categoryCarouselTimer) window.clearInterval(categoryCarouselTimer)
  categoryCarouselTimer = undefined
  if (!import.meta.client || categorySlideCount.value <= 1 || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

  categoryCarouselTimer = window.setInterval(() => {
    if (!categoryCarouselHovered.value && !categoryCarouselFocused.value && document.visibilityState === 'visible') {
      moveCategorySlide(1)
    }
  }, 3000)
}
const syncCategoryVisibleCount = () => {
  categoryVisibleCount.value = window.matchMedia('(max-width: 700px)').matches
    ? 1
    : window.matchMedia('(max-width: 1100px)').matches ? 3 : 5
}
watch([() => categories.value.length, () => category.value?.id], () => {
  const currentCategoryIndex = categories.value.findIndex(item => item.id === category.value?.id)
  categorySlideIndex.value = currentCategoryIndex >= 0
    ? currentCategoryIndex
    : categorySlideCount.value ? categorySlideIndex.value % categorySlideCount.value : 0
  syncCategoryCarouselAutoplay()
})
onMounted(() => {
  syncCategoryVisibleCount()
  window.addEventListener('resize', syncCategoryVisibleCount, { passive: true })
  document.addEventListener('pointerdown', closeBrandFilterOnOutsidePointer)
  syncCategoryCarouselAutoplay()
  syncSubCategoryCarouselAutoplay()
})
onUnmounted(() => {
  if (categoryCarouselTimer) window.clearInterval(categoryCarouselTimer)
  if (subCategoryCarouselTimer) window.clearInterval(subCategoryCarouselTimer)
  window.removeEventListener('resize', syncCategoryVisibleCount)
  document.removeEventListener('pointerdown', closeBrandFilterOnOutsidePointer)
})
const page = computed(() => Math.max(1, Number(route.query.page) || 1))
const { data: categoryProductsPage } = await useAsyncData(
  () => `category-products-${slug.value}-${brandId.value}-${page.value}`,
  async () => category.value ? fetchProducts({ category_id: category.value.id, brand_id: brandId.value || undefined, page: page.value }) : null,
  { watch: [slug, page, brandId] },
)
const categoryName = computed(() => category.value ? getLocalizedFirst(locale.value, category.value.name_ar, category.value.name_en, category.value.name) : t('products'))
const categoryDescription = computed(() => category.value ? getLocalizedFirst(locale.value, category.value.description_ar, category.value.description_en, '') : '')
const subCategories = computed(() => category.value ? getSubCategoriesByCategory(category.value.id) : [])
const subCategoryCards = computed(() => subCategories.value.map((item) => {
  return {
    ...item,
    name: getLocalizedFirst(locale.value, item.name_ar, item.name_en, item.name),
    previewImage: item.thumbnails?.small || item.image,
  }
}))
const subCategorySlideIndex = ref(0)
const subCategorySlideCount = computed(() => subCategoryCards.value.length)
const subCategoryCarouselHovered = ref(false)
const subCategoryCarouselFocused = ref(false)
const visibleSubCategories = computed(() => {
  const totalSubCategories = subCategoryCards.value.length
  if (!totalSubCategories) return []

  const requestedCount = Math.min(categoryVisibleCount.value, totalSubCategories)
  const visibleCount = requestedCount % 2 === 0 ? requestedCount - 1 : requestedCount
  const centerPosition = Math.floor(visibleCount / 2)

  return Array.from({ length: visibleCount }, (_, position) => {
    const carouselDistance = position - centerPosition
    const subCategoryIndex = (subCategorySlideIndex.value + carouselDistance + totalSubCategories) % totalSubCategories
    const item = subCategoryCards.value[subCategoryIndex]

    return {
      ...item,
      carouselDistance,
      carouselPosition: position,
      localizedName: item.name,
    }
  })
})
const activeSubCategoryName = computed(() => visibleSubCategories.value.find(item => item.carouselDistance === 0)?.localizedName || '')
const moveSubCategorySlide = (step: number) => {
  const totalSubCategories = subCategorySlideCount.value
  if (totalSubCategories <= 1) return
  subCategorySlideIndex.value = (subCategorySlideIndex.value + step + totalSubCategories) % totalSubCategories
}
const setSubCategorySlide = (index: number) => {
  if (index >= 0 && index < subCategorySlideCount.value) subCategorySlideIndex.value = index
}
const handleSubCategoryFocusOut = (event: FocusEvent) => {
  const carousel = event.currentTarget as HTMLElement
  if (!carousel.contains(event.relatedTarget as Node | null)) subCategoryCarouselFocused.value = false
}
let subCategoryCarouselTimer: ReturnType<typeof setInterval> | undefined
const syncSubCategoryCarouselAutoplay = () => {
  if (import.meta.client && subCategoryCarouselTimer) window.clearInterval(subCategoryCarouselTimer)
  subCategoryCarouselTimer = undefined
  if (!import.meta.client || subCategorySlideCount.value <= 1 || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

  subCategoryCarouselTimer = window.setInterval(() => {
    if (!subCategoryCarouselHovered.value && !subCategoryCarouselFocused.value && document.visibilityState === 'visible') {
      moveSubCategorySlide(1)
    }
  }, 3000)
}
watch([() => subCategoryCards.value.length, () => category.value?.id], ([, categoryId], [, previousCategoryId]) => {
  if (categoryId !== previousCategoryId) subCategorySlideIndex.value = 0
  else subCategorySlideIndex.value = subCategorySlideCount.value ? subCategorySlideIndex.value % subCategorySlideCount.value : 0
  syncSubCategoryCarouselAutoplay()
})
const filtered = computed(() => categoryProductsPage.value?.products || [])
const pageMeta = computed(() => categoryProductsPage.value?.meta || null)
const productTotal = computed(() => pageMeta.value?.total || 0)
const changePage = (nextPage: number) => navigateTo({ query: { ...route.query, page: String(nextPage) } })
const categoryImage = computed(() => category.value?.thumbnails?.medium
  || category.value?.image
  || (filtered.value[0] ? getProductImage(filtered.value[0], null, 'medium') : null))
useSeoMeta({ title: () => category.value ? getLocalizedFirst(locale.value, category.value.meta_title_ar, category.value.meta_title_en, categoryName.value) : categoryName.value, description: () => category.value ? getLocalizedFirst(locale.value, category.value.meta_description_ar, category.value.meta_description_en, categoryDescription.value) : categoryDescription.value })
const categoryPath = computed(() => `/category/${slug.value}`)
useCanonicalLinks(categoryPath)
useHead(() => ({
  script: category.value ? [{
    key: '3b-category-jsonld',
    type: 'application/ld+json',
    innerHTML: serializeJsonLd({ '@context': 'https://schema.org', '@type': 'CollectionPage', name: categoryName.value, description: categoryDescription.value || undefined, url: `${siteOrigin.value}${categoryPath.value}` }),
  }] : [],
}))
</script>

<style scoped>
.category-hero{padding:24px 0 0}.category-hero-inner{min-height:190px;display:grid;grid-template-columns:minmax(0,.9fr) minmax(0,1.1fr);overflow:hidden;border-radius:20px;background:color-mix(in srgb,var(--coral) 10%,var(--cream))}.category-hero-inner.without-image{grid-template-columns:1fr}.category-hero-copy{align-self:center;padding:26px 34px}.category-hero-copy h1{margin:4px 0;font-size:2.35rem;line-height:1.25}.category-hero-copy p{max-width:500px;margin:0;color:var(--muted)}.category-hero-art{min-height:190px;display:grid;place-items:center;background:color-mix(in srgb,var(--green) 8%,var(--paper));position:relative}.category-hero-image-frame{position:relative;box-sizing:border-box;width:min(52%,360px);aspect-ratio:3/2;overflow:hidden;border:4px solid var(--theme-accent);border-radius:16px;background:var(--theme-surface);box-shadow:0 8px 18px color-mix(in srgb,var(--theme-accent) 20%,transparent)}.category-hero-art img,.category-hero-art picture{position:absolute;inset:0;width:100%;height:100%;display:block}.category-hero-art picture{overflow:hidden;border-radius:11px}.category-hero-art img{object-fit:contain}
.category-content{padding-top:40px}.main-category-section{margin-bottom:36px}
.category-content .category-hero{padding:0}.category-type-marker{display:block;margin-top:12px}
.category-showcase{min-height:410px;display:grid;grid-template-columns:minmax(250px,.68fr) minmax(0,1.75fr);align-items:center;gap:28px;padding:24px 30px;overflow:hidden;border:1px solid color-mix(in srgb,var(--theme-on-primary) 16%,transparent);border-radius:28px;background:var(--theme-primary);color:var(--theme-on-primary);box-shadow:var(--shadow)}
.category-showcase-copy{max-width:440px}.category-showcase-eyebrow{display:block;color:var(--theme-accent);font-size:.84rem;font-weight:800;letter-spacing:.04em}.category-showcase-copy h2{margin:8px 0 10px;color:var(--theme-on-primary);font-size:clamp(1.8rem,2.6vw,2.65rem);line-height:1.2;text-wrap:balance}.category-showcase-copy .category-showcase-active-name{max-width:28ch;min-height:1.4em;margin:0;color:var(--theme-on-primary);font-size:clamp(1.15rem,1.8vw,1.55rem);font-weight:800;line-height:1.4;text-wrap:balance}
.category-showcase-controls{display:flex;align-items:center;gap:13px;margin-top:24px}.category-showcase-arrows{display:flex;gap:8px}.category-showcase-arrows button{width:42px;height:42px;display:grid;place-items:center;border:1px solid color-mix(in srgb,var(--theme-on-primary) 30%,transparent);border-radius:50%;background:color-mix(in srgb,var(--theme-on-primary) 10%,transparent);color:var(--theme-on-primary);font-size:1.2rem;transition:transform .2s ease,background-color .2s ease}.category-showcase-arrows button:hover{transform:translateY(-2px);background:color-mix(in srgb,var(--theme-on-primary) 20%,transparent)}.category-showcase-count{color:color-mix(in srgb,var(--theme-on-primary) 68%,transparent);font-size:.84rem;font-variant-numeric:tabular-nums}.category-showcase-dots{display:flex;align-items:center;gap:7px;margin-top:14px}.category-showcase-dots button{width:8px;height:8px;padding:0;border:1px solid color-mix(in srgb,var(--theme-on-primary) 52%,transparent);border-radius:50%;background:transparent;transition:width .2s ease,background-color .2s ease}.category-showcase-dots button.active{width:22px;border-color:var(--theme-accent);border-radius:8px;background:var(--theme-accent)}
.category-carousel-track{position:relative;width:100%;max-width:1100px;display:grid;grid-template-columns:repeat(var(--visible-category-count,5),minmax(0,1fr));align-items:center;gap:clamp(5px,.9vw,14px);justify-self:stretch;direction:ltr;overflow:visible}.category-feature-card{position:relative;z-index:1;min-width:0;display:block;color:inherit;text-decoration:none;opacity:.58;transition:opacity .55s ease}.category-feature-card.is-neighbor{z-index:2;opacity:.82}.category-feature-card.is-edge{opacity:.65}.category-feature-visual{display:block;width:100%;aspect-ratio:.84;overflow:hidden;transform:scale(.76);transform-origin:center;border:1px solid color-mix(in srgb,var(--theme-text) 12%,transparent);border-radius:20px;background:var(--theme-surface);box-shadow:0 8px 22px #00000020;transition:transform .55s cubic-bezier(.2,.75,.25,1),border-color .35s ease,box-shadow .35s ease}.category-feature-card.is-neighbor .category-feature-visual{transform:scale(.86)}.category-feature-card.is-active{z-index:4;opacity:1}.category-feature-card.is-active .category-feature-visual{transform:scale(1.08);border-color:var(--theme-accent);box-shadow:0 0 0 2px var(--theme-accent),0 15px 30px #00000032}.category-feature-card:hover .category-feature-visual{border-color:var(--theme-accent)}.category-feature-image{width:100%;height:100%;display:grid;place-items:center;overflow:hidden;padding:8px;background:color-mix(in srgb,var(--theme-soft) 45%,var(--theme-surface));box-sizing:border-box}.category-feature-image img{display:block;width:100%;height:100%;object-fit:contain}.category-feature-placeholder{display:grid;width:100%;height:100%;place-items:center;background:var(--theme-soft);color:var(--theme-primary);font-size:2rem;font-weight:850}.category-slide-enter-active,.category-slide-leave-active{transition:opacity .55s ease,transform .55s cubic-bezier(.2,.75,.25,1)}.category-slide-move{transition:transform .55s cubic-bezier(.2,.75,.25,1)}.category-slide-enter-from{opacity:0;transform:translateX(35px)}.category-slide-leave-to{opacity:0;transform:translateX(-35px)}.category-showcase :focus-visible{outline:3px solid var(--theme-accent);outline-offset:5px}
.sub-category-section{margin-bottom:34px}
.products-section{margin-top:28px}.products-heading{display:flex;align-items:center;justify-content:space-between;gap:16px;margin-bottom:14px}.products-heading-copy{display:grid;gap:2px}.products-heading h2{margin:0;font-size:1.25rem}.products-heading-copy span{color:var(--muted);font-size:.85rem}.brand-filter{position:relative;z-index:5;display:grid;gap:5px;min-width:220px;color:var(--muted);font-size:.78rem;font-weight:700}.brand-filter-control{position:relative}.brand-filter-trigger{width:100%;min-height:44px;display:flex;align-items:center;justify-content:space-between;gap:10px;padding:6px 10px;border:1px solid var(--line);border-radius:11px;background:var(--theme-surface);color:var(--theme-text);font:inherit;text-align:start;cursor:pointer;transition:border-color .18s ease,box-shadow .18s ease}.brand-filter-trigger:hover,.brand-filter-trigger[aria-expanded="true"]{border-color:var(--theme-accent);box-shadow:0 0 0 3px color-mix(in srgb,var(--theme-accent) 14%,transparent)}.brand-filter-trigger:focus-visible,.brand-filter-option:focus-within,.brand-filter-empty button:focus-visible{outline:2px solid var(--theme-primary);outline-offset:2px}.brand-filter-value{display:flex;align-items:center;gap:9px;min-width:0}.brand-filter-name{overflow:hidden;color:var(--theme-text);font-size:.84rem;font-weight:700;text-overflow:ellipsis;white-space:nowrap}.brand-logo-chip{flex:none;width:30px;height:30px;display:grid;place-items:center;overflow:hidden;padding:3px;border:1px solid color-mix(in srgb,var(--theme-primary) 12%,var(--line));border-radius:8px;background:var(--theme-page);color:var(--theme-primary);font-size:.74rem;font-weight:800;box-sizing:border-box}.brand-logo-chip--dark{background:#171717}.brand-logo-chip img{display:block;width:100%;height:100%;object-fit:contain}.brand-filter-menu{position:absolute;inset-inline:0;top:calc(100% + 6px);max-height:min(340px,60vh);overflow-y:auto;display:grid;gap:3px;margin:0;padding:6px;border:1px solid var(--line);border-radius:13px;background:var(--theme-surface);box-shadow:0 16px 38px color-mix(in srgb,var(--theme-text) 18%,transparent)}.brand-filter-option{position:relative;min-height:42px;display:flex;align-items:center;gap:9px;padding:5px 9px;border:1px solid transparent;border-radius:9px;cursor:pointer;transition:background-color .15s ease,border-color .15s ease}.brand-filter-option:hover{background:color-mix(in srgb,var(--theme-accent) 9%,var(--theme-surface))}.brand-filter-option.selected{border-color:color-mix(in srgb,var(--theme-accent) 35%,transparent);background:color-mix(in srgb,var(--theme-accent) 10%,var(--theme-surface))}.brand-filter-option input{position:absolute;width:1px;height:1px;overflow:hidden;opacity:0}.brand-filter-option:focus-within{outline-offset:1px}.brand-filter-check{flex:none;margin-inline-start:auto;color:var(--theme-primary)}.brand-filter-empty{padding:34px 16px;border:1px solid var(--line);border-radius:14px;background:var(--theme-surface);text-align:center}.brand-filter-empty p{margin:0 0 12px;color:var(--muted)}.brand-filter-empty button{min-height:40px;padding:8px 13px;border:0;border-radius:9px;background:var(--theme-primary);color:var(--theme-on-primary);font:inherit;font-weight:700;cursor:pointer}
.product-pagination{display:flex;align-items:center;justify-content:center;gap:16px;margin:24px 0}.product-pagination button{min-height:40px;padding:8px 14px;border:1px solid var(--line);border-radius:9px;background:var(--theme-surface);color:var(--theme-text)}.product-pagination button:disabled{opacity:.45;cursor:not-allowed}
@media(max-width:1100px){.category-showcase{grid-template-columns:minmax(210px,.72fr) minmax(0,1.28fr);gap:20px;padding:22px}.category-carousel-track{gap:8px}.category-feature-visual{transform:scale(.78)}.category-feature-card.is-neighbor .category-feature-visual{transform:scale(.88)}.category-feature-card.is-active .category-feature-visual{transform:scale(1.06)}}
@media(max-width:900px){.category-showcase{grid-template-columns:minmax(190px,.7fr) minmax(0,1.3fr)}.category-showcase-copy h2{font-size:clamp(1.65rem,3vw,2.1rem)}}
@media(max-width:700px){.category-hero{padding-top:14px}.category-hero-inner{grid-template-columns:1fr}.category-hero-copy{padding:22px 20px}.category-hero-copy h1{font-size:1.9rem}.category-hero-art{min-height:150px}.category-hero-image-frame{width:min(56%,360px)}.category-content{padding-top:34px}.category-showcase{grid-template-columns:1fr;gap:18px;padding:21px;border-radius:22px}.category-showcase-copy{max-width:none;text-align:center;margin-inline:auto}.category-showcase-copy h2{font-size:1.75rem}.category-showcase-copy .category-showcase-active-name{max-width:52ch;margin-inline:auto}.category-showcase-controls,.category-showcase-arrows,.category-showcase-dots{justify-content:center}.category-showcase-controls{margin-top:17px}.category-showcase-dots{margin-top:11px}.category-carousel-track{width:min(100%,320px);max-width:100%;margin-inline:auto;gap:0}.category-feature-visual,.category-feature-card.is-neighbor .category-feature-visual,.category-feature-card.is-active .category-feature-visual{aspect-ratio:1;transform:scale(1)}.products-heading{align-items:stretch;flex-direction:column}.brand-filter{min-width:0;width:100%}}
@media(max-width:420px){.category-showcase{padding:17px}}
@media(prefers-reduced-motion:reduce){.category-slide-enter-active,.category-slide-leave-active,.category-slide-move,.category-feature-card,.category-feature-visual,.category-showcase-arrows button,.category-showcase-dots button{transition:none}}
.category-slide-leave-active{position:absolute}
.category-carousel-track{gap:0!important}
.category-feature-card,.category-feature-card.is-neighbor,.category-feature-card.is-edge{opacity:1}
.category-feature-visual{transform:scale(.95)}
.category-feature-card.is-neighbor .category-feature-visual{transform:scale(1)}
.category-feature-card.is-edge .category-feature-visual{transform:scale(.95)}
.category-feature-card.is-left-edge .category-feature-visual{transform:translateX(30%) scale(.95)}
.category-feature-card.is-right-edge .category-feature-visual{transform:translateX(-30%) scale(.95)}
.category-feature-card.is-active .category-feature-visual{transform:scale(1.16)}
.category-feature-image{padding:0;background:transparent}
.category-feature-image img{object-fit:cover}
.category-slide-leave-active{position:static;display:none}
.sub-category-showcase{min-height:410px;display:grid;grid-template-columns:minmax(250px,.68fr) minmax(0,1.75fr);align-items:center;gap:28px;padding:24px 30px;overflow:hidden;border:1px solid color-mix(in srgb,var(--theme-text) 12%,var(--theme-border));border-radius:28px;background:color-mix(in srgb,var(--theme-accent) 14%,var(--theme-page));color:var(--theme-text);box-shadow:var(--shadow)}
.sub-category-showcase-copy{max-width:440px}
.sub-category-showcase-copy h2{margin:8px 0 10px;color:var(--theme-text);font-size:clamp(1.8rem,2.6vw,2.65rem);line-height:1.2;text-wrap:balance}
.sub-category-active-name{max-width:28ch;min-height:1.4em;margin:0;color:var(--theme-text);font-size:clamp(1.15rem,1.8vw,1.55rem);font-weight:800;line-height:1.4;text-wrap:balance}
.sub-category-controls{display:flex;align-items:center;gap:13px;margin-top:24px}
.sub-category-arrows{display:flex;gap:8px}
.sub-category-arrows button{width:42px;height:42px;display:grid;place-items:center;border:1px solid color-mix(in srgb,var(--theme-text) 24%,transparent);border-radius:50%;background:color-mix(in srgb,var(--theme-text) 5%,var(--theme-surface));color:var(--theme-text);font-size:1.2rem;transition:transform .2s ease,background-color .2s ease}
.sub-category-arrows button:hover{transform:translateY(-2px);background:color-mix(in srgb,var(--theme-text) 10%,var(--theme-surface))}
.sub-category-count{color:var(--muted);font-size:.84rem;font-variant-numeric:tabular-nums}
.sub-category-dots{display:flex;align-items:center;gap:7px;margin-top:14px}
.sub-category-dots button{width:8px;height:8px;padding:0;border:1px solid color-mix(in srgb,var(--theme-text) 40%,transparent);border-radius:50%;background:transparent;transition:width .2s ease,background-color .2s ease}
.sub-category-dots button.active{width:22px;border-color:var(--theme-accent);border-radius:8px;background:var(--theme-accent)}
@media(max-width:700px){.category-feature-visual,.category-feature-card.is-neighbor .category-feature-visual,.category-feature-card.is-edge .category-feature-visual,.category-feature-card.is-active .category-feature-visual{transform:scale(1)}}
@media(max-width:1100px){.sub-category-showcase{grid-template-columns:minmax(210px,.72fr) minmax(0,1.28fr);gap:20px;padding:22px}}
@media(max-width:900px){.sub-category-showcase{grid-template-columns:minmax(190px,.7fr) minmax(0,1.3fr)}.sub-category-showcase-copy h2{font-size:clamp(1.65rem,3vw,2.1rem)}}
@media(max-width:700px){.sub-category-showcase{min-height:0;grid-template-columns:1fr;gap:18px;padding:21px;border-radius:22px}.sub-category-showcase-copy{max-width:none;text-align:center;margin-inline:auto}.sub-category-showcase-copy h2{font-size:1.75rem}.sub-category-active-name{max-width:52ch;margin-inline:auto}.sub-category-controls,.sub-category-arrows,.sub-category-dots{justify-content:center}.sub-category-controls{margin-top:17px}.sub-category-dots{margin-top:11px}}
@media(max-width:420px){.sub-category-showcase{padding:17px}}
.brand-filter-menu{min-inline-size:0}
</style>
