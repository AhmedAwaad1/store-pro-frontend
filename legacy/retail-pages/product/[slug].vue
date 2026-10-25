<template>
  <main v-if="product">
    <section class="product-detail section">
      <div class="container detail-grid">
        <div class="product-gallery">
          <div v-if="currentVideo" class="detail-image video-frame">
            <video :key="currentVideo.id" controls preload="metadata" :aria-label="localizedVideoTitle(currentVideo)">
              <source :src="currentVideo.url" :type="currentVideo.mime_type">
            </video>
          </div>
          <button v-else ref="galleryTrigger" type="button" class="detail-image" :aria-label="isEnglish ? 'Zoom product image' : 'تكبير صورة المنتج'" @click="openZoom">
            <img :src="displayImage" :alt="currentImageAlt" fetchpriority="high" decoding="async">
            <span v-if="badge" class="badge">{{ badge }}</span>
          </button>
          <p v-if="currentImageCaption" class="image-caption">{{ currentImageCaption }}</p>
          <div v-if="galleryImages.length > 1" class="gallery-thumbnails" :aria-label="t('productImages')">
            <button
              v-for="(image, index) in galleryImages"
              :key="image.id"
              type="button"
              :class="{ active: activeGalleryImageId === image.id }"
              :aria-label="t('showImage', { count: index + 1 })"
              :aria-pressed="activeGalleryImageId === image.id"
              @click="activeGalleryImageId = image.id; activeVideoId = null"
            >
              <img :src="getImageUrl(image, 'small') || ''" :alt="localizedImageAlt(image, index)" loading="lazy" decoding="async">
            </button>
          </div>
          <div v-if="productVideos.length" class="gallery-thumbnails video-thumbnails" :aria-label="t('productVideos')">
            <button v-for="video in productVideos" :key="`video-${video.id}`" type="button" :class="{ active: activeVideoId === video.id }" :aria-pressed="activeVideoId === video.id" @click="activeVideoId = video.id">
              <span aria-hidden="true">▶</span><small>{{ localizedVideoTitle(video) }}</small>
            </button>
          </div>
          <div v-if="colorOptionGroups.length" class="gallery-color-options">
            <div v-for="group in colorOptionGroups" :key="group.id" class="choice">
              <div class="choice-label">
                <b>{{ t('choose', { name: getLocalizedFirst(locale, group.name_ar, group.name_en, group.name) }) }}</b>
                <span v-if="selectedLabels[group.id]">{{ selectedLabels[group.id] }}</span>
              </div>
              <div class="choice-values colors">
                <button
                  v-for="value in group.values"
                  :key="value.id"
                  :class="{ selected: selectedOptions[group.id] === value.id, unavailable: !isValueAvailable(group.id, value.id) }"
                  :style="{ backgroundColor: value.hex_code || '#ddd' }"
                  :title="getLocalizedFirst(locale, value.value_ar, value.value_en, value.value)"
                  :aria-label="`${getLocalizedFirst(locale, group.name_ar, group.name_en, group.name)}: ${getLocalizedFirst(locale, value.value_ar, value.value_en, value.value)}`"
                  :disabled="!isValueAvailable(group.id, value.id)"
                  @click="selectOption(group.id, value.id)"
                />
              </div>
            </div>
          </div>
        </div>

        <div class="detail-copy">
          <div class="breadcrumbs">
            <NuxtLink to="/">{{ t('home') }}</NuxtLink>
            <template v-if="product.category?.slug"> / <NuxtLink :to="`/category/${product.category.slug}`">{{ categoryName }}</NuxtLink></template>
            <template v-if="product.sub_category?.parent"> /
              <NuxtLink :to="`/sub-category/${product.sub_category.parent.slug}`">{{ getLocalizedFirst(locale, product.sub_category.parent.name_ar, product.sub_category.parent.name_en, product.sub_category.parent.name) }}</NuxtLink>
            </template>
            <template v-if="product.sub_category"> /
              <NuxtLink :to="`/sub-category/${product.sub_category.slug}`">{{ subCategoryName }}</NuxtLink>
            </template>
          </div>

          <h1>{{ productName }}</h1>
          <div v-if="product.reviews_count > 0" class="detail-rating"><Star fill="currentColor" /> {{ product.avg_rating }} · {{ product.reviews_count }}</div>
          <div class="detail-price">
            <strong>{{ formatPrice(currentPrice, locale) }}</strong>
            <del v-if="currentOriginalPrice > currentPrice">{{ formatPrice(currentOriginalPrice, locale) }}</del>
            <small v-if="currentSavingsPercentage" class="saving">−{{ currentSavingsPercentage }}%</small>
          </div>
          <p v-if="currentPromotionTerms" class="promotion-terms">{{ currentPromotionTerms }}</p>
          <section v-if="installmentPlans.length" class="installment-options"><h2>{{ isEnglish ? 'Installment options' : 'خيارات التقسيط' }}</h2><div v-for="plan in installmentPlans" :key="plan.id"><span><strong>{{ plan.provider.name }}</strong> · {{ plan.term_months }} {{ isEnglish ? 'months' : 'شهر' }}</span><b>{{ formatPrice(plan.monthly_payment, locale) }} / {{ isEnglish ? 'month' : 'شهرياً' }}</b></div></section>
          <p :dir="locale === 'ar' ? 'rtl' : 'ltr'">{{ productDescription }}</p>

          <dl v-if="product.brand || product.model_number || product.warranty" class="product-facts">
            <div v-if="product.brand"><dt>{{ t('brand') }}</dt><dd>{{ locale === 'ar' ? product.brand.name_ar : product.brand.name_en }}</dd></div>
            <div v-if="product.model_number"><dt>{{ t('modelNumber') }}</dt><dd>{{ product.model_number }}</dd></div>
            <div v-if="product.warranty"><dt>{{ t('warranty') }}</dt><dd>{{ product.warranty.duration_months / 12 }} {{ locale === 'ar' ? 'سنة' : 'years' }} · {{ product.warranty.provider }}</dd></div>
          </dl>
          <section v-if="product.warranty && (product.warranty.terms_en || product.warranty.terms_ar || product.warranty.service_center_name)" class="catalog-info warranty-details">
            <h2>{{ t('warranty') }}</h2>
            <p>{{ locale === 'ar' ? product.warranty.terms_ar || product.warranty.terms_en : product.warranty.terms_en || product.warranty.terms_ar }}</p>
            <p v-if="product.warranty.service_center_name">{{ product.warranty.service_center_name }}<a v-if="product.warranty.service_center_phone" :href="`tel:${product.warranty.service_center_phone}`"> · {{ product.warranty.service_center_phone }}</a></p>
          </section>

          <section v-if="product.highlights_en?.length || product.highlights_ar?.length" class="catalog-info">
            <h2>{{ t('highlights') }}</h2>
            <ul><li v-for="(item, index) in (locale === 'ar' ? product.highlights_ar : product.highlights_en)" :key="index">{{ item }}</li></ul>
          </section>

          <section v-if="localizedIncludedInBox.length" class="catalog-info">
            <h2>{{ t('includedInBox') }}</h2>
            <ul><li v-for="(item, index) in localizedIncludedInBox" :key="index">{{ item }}</li></ul>
          </section>

          <section v-for="group in product.specification_groups || []" :key="group.id" class="catalog-info">
            <h2>{{ locale === 'ar' ? group.name_ar : group.name_en }}</h2>
            <dl class="specification-table">
              <div v-for="item in group.items" :key="item.id"><dt>{{ locale === 'ar' ? item.name_ar : item.name_en }}</dt><dd>{{ item.value }}<template v-if="item.unit"> {{ item.unit }}</template></dd></div>
            </dl>
          </section>

          <section v-if="product.documents?.length" class="catalog-info">
            <h2>{{ t('documents') }}</h2>
            <ul class="document-list"><li v-for="document in product.documents" :key="document.id"><a :href="document.url" target="_blank" rel="noopener">{{ locale === 'ar' ? document.title_ar : document.title_en }} <span>{{ t('download') }}</span></a></li></ul>
          </section>

          <section class="delivery-panel" aria-live="polite">
            <h2>{{ t('fulfillmentOptions') }}</h2>
            <div class="fulfillment-tabs" role="group" :aria-label="t('fulfillmentOptions')">
              <button type="button" :aria-pressed="fulfillmentMethod === 'delivery'" @click="setFulfillmentMethod('delivery')">{{ t('delivery') }}</button>
              <button type="button" :aria-pressed="fulfillmentMethod === 'pickup'" @click="setFulfillmentMethod('pickup')">{{ t('branchPickup') }}</button>
            </div>
            <div v-if="fulfillmentMethod === 'delivery'" class="location-fields">
              <label>{{ t('city') }}
                <select v-model.number="selectedCityId" @change="onCityChange">
                  <option :value="null">{{ t('chooseCity') }}</option>
                  <option v-for="city in cities" :key="city.id" :value="city.id">{{ localizedLocation(city) }}</option>
                </select>
              </label>
              <label>{{ t('district') }}
                <select v-model.number="selectedDistrictId" :disabled="!selectedCityId || loadingDistricts" @change="loadDeliveryEstimate">
                  <option :value="null">{{ t('chooseDistrictOptional') }}</option>
                  <option v-for="district in districts" :key="district.id" :value="district.id">{{ localizedLocation(district) }}</option>
                </select>
              </label>
            </div>
            <label v-else class="location-fields">{{ t('branchPickup') }}
              <select v-model.number="selectedBranchId" :disabled="!availablePickupBranches.length" @change="loadDeliveryEstimate">
                <option :value="null">{{ t('chooseBranch') }}</option>
                <option v-for="branch in availablePickupBranches" :key="branch.id" :value="branch.id">{{ branch.name }} · {{ branch.city }}</option>
              </select>
            </label>
            <p v-if="deliveryEstimateLoading" class="estimate-message">{{ t('loadingEstimate') }}</p>
            <p v-else-if="deliveryEstimateError" class="estimate-message error-text" role="alert">{{ t('estimateUnavailable') }}</p>
            <p v-else-if="!selectedCityId && fulfillmentMethod === 'delivery'" class="estimate-message">{{ t('selectCityForEstimate') }}</p>
            <p v-else-if="deliveryEstimate && !deliveryEstimate.available" class="estimate-message out-of-stock">{{ t('unavailableAtLocation') }}</p>
            <div v-else-if="deliveryEstimate?.available" class="estimate-details">
              <strong>{{ fulfillmentMethod === 'pickup' ? t('pickupReadyEstimate') : t('deliveryEstimate') }}</strong>
              <span v-if="estimateDateRange">{{ estimateDateRange }}</span>
              <span v-if="fulfillmentMethod === 'delivery' && deliveryEstimate.shipping_price !== null">{{ t('shipping') }}: {{ formatPrice(deliveryEstimate.shipping_price, locale) }}</span>
              <span v-if="deliveryEstimate.available_quantity !== null">{{ t('available', { count: deliveryEstimate.available_quantity }) }}</span>
            </div>
          </section>

          <div v-for="group in otherOptionGroups" :key="group.id" class="choice">
            <div class="choice-label">
              <b>{{ t('choose', { name: getLocalizedFirst(locale, group.name_ar, group.name_en, group.name) }) }}</b>
              <span v-if="selectedLabels[group.id]">{{ selectedLabels[group.id] }}</span>
            </div>
            <div :class="['choice-values', { colors: group.isColor }]">
              <button
                v-for="value in group.values"
                :key="value.id"
                :class="{ selected: selectedOptions[group.id] === value.id, unavailable: !isValueAvailable(group.id, value.id) }"
                :style="group.isColor ? { backgroundColor: value.hex_code || '#ddd' } : undefined"
                :title="getLocalizedFirst(locale, value.value_ar, value.value_en, value.value)"
                :aria-label="`${getLocalizedFirst(locale, group.name_ar, group.name_en, group.name)}: ${getLocalizedFirst(locale, value.value_ar, value.value_en, value.value)}`"
                :disabled="!isValueAvailable(group.id, value.id)"
                @click="selectOption(group.id, value.id)"
              >
                <span v-if="!group.isColor">{{ getLocalizedFirst(locale, value.value_ar, value.value_en, value.value) }}</span>
              </button>
            </div>
          </div>

          <div v-if="selectedVariant" class="variant-meta">
            <span>{{ t('productCode') }} <b>{{ selectedVariant.sku }}</b></span>
            <span v-if="!selectedVariant.in_stock || selectedVariant.quantity > 1" :class="selectedVariant.in_stock ? 'in-stock' : 'out-of-stock'">
              {{ selectedVariant.in_stock ? t('available', { count: selectedVariant.quantity }) : t('unavailable') }}
            </span>
          </div>

          <div class="buy-row">
            <div class="qty">
              <button @click="qty = Math.max(1, qty - 1)">−</button>
              <span>{{ qty }}</span>
              <button :disabled="qty >= availableStock" @click="qty++">+</button>
            </div>
            <button class="btn primary grow" :disabled="!canAdd" @click="handleAddToCart">
              <ShoppingBag /> {{ canAdd ? t('addToCart') : t('chooseUnavailable') }}
            </button>
            <button class="btn secondary square" @click="toggleWishlist(product.id)">
              <Heart :fill="wishlist.includes(product.id) ? 'currentColor' : 'none'" />
            </button>
          </div>

        </div>
      </div>
    </section>

    <div v-if="zoomOpen" ref="zoomDialog" class="zoom-overlay" role="dialog" aria-modal="true" :aria-label="t('productImages')" tabindex="-1" @keydown.esc.prevent="closeZoom" @keydown.left.prevent="stepGallery(-1)" @keydown.right.prevent="stepGallery(1)" @click.self="closeZoom">
      <button class="zoom-close" type="button" :aria-label="isEnglish ? 'Close image' : 'إغلاق الصورة'" @click="closeZoom">×</button>
      <button v-if="galleryImages.length > 1" class="zoom-step previous" type="button" :aria-label="isEnglish ? 'Previous image' : 'الصورة السابقة'" @click="stepGallery(-1)">‹</button>
      <img :src="displayImage" :alt="currentImageAlt">
      <button v-if="galleryImages.length > 1" class="zoom-step next" type="button" :aria-label="isEnglish ? 'Next image' : 'الصورة التالية'" @click="stepGallery(1)">›</button>
      <p v-if="currentImageCaption">{{ currentImageCaption }}</p>
    </div>

    <section v-for="group in recommendationGroups" :key="group.type" class="section soft">
      <div class="container">
        <div class="section-head"><div><span class="eyebrow">{{ t('youMayLike') }}</span><h2>{{ relationshipTitle(group.type) }}</h2></div></div>
        <div class="product-grid"><ProductCard v-for="item in group.items" :key="item.id" :product="item" /></div>
      </div>
    </section>

    <section class="section reviews-section">
      <div class="container">
        <div class="section-head"><div><span class="eyebrow">{{ t('customerFeedback') }}</span><h2>{{ t('reviews') }} · {{ product.reviews_count }}</h2></div></div>
        <p v-if="!productReviews.length" class="estimate-message">{{ t('noReviewsYet') }}</p>
        <div v-else class="review-list"><article v-for="review in productReviews" :key="review.id" class="review-card"><div><strong>{{ review.reviewer_name }}</strong><span>{{ '★'.repeat(review.rating) }}{{ '☆'.repeat(5 - review.rating) }}</span></div><p>{{ review.comment }}</p></article></div>
      </div>
    </section>

    <div v-if="product" class="mobile-purchase-bar">
      <div><strong>{{ formatPrice(currentPrice, locale) }}</strong><small>{{ productName }}</small></div>
      <button class="btn primary" :disabled="!canAdd" @click="handleAddToCart">{{ canAdd ? t('addToCart') : t('chooseUnavailable') }}</button>
    </div>
  </main>

  <main v-else-if="productLoading" class="section">
    <div class="container" role="status" aria-live="polite">{{ isEnglish ? 'Loading product…' : 'جارٍ تحميل المنتج…' }}</div>
  </main>

  <main v-else>
    <EmptyState
      :title="productLoadError ? (isEnglish ? 'Product could not be loaded' : 'تعذر تحميل المنتج') : t('productMissing')"
      :text="productLoadError ? (isEnglish ? 'Please try again or return to the products list.' : 'حاول مرة أخرى أو ارجع إلى قائمة المنتجات.') : t('productMissingText')"
      :action="t('allProducts')"
      action-to="/products"
    />
  </main>
</template>

<script setup lang="ts">
import { Heart, ShoppingBag, Star } from 'lucide-vue-next'
import { formatPrice } from '~/data/products'
import type { Product, ProductImage, ProductOptionValue, ProductVariant } from '~/types/catalog'
import { getLocalizedFirst, getDefaultVariant, getImageUrl, getOptionType, getProductBadge, getProductImage, getProductOriginalPrice, getProductPrice, getProductStock } from '~/utils/catalog'
const { locale, t, isEnglish } = useLocale()

const route = useRoute()
const config = useRuntimeConfig()
const siteOrigin = computed(() => String(config.public.siteUrl || 'http://localhost:3000').replace(/\/$/, ''))
const { request } = useApi()
const product = ref<Product | null>(null)
const productLoading = ref(true)
const productLoadError = ref(false)
let latestProductRequest = 0
const activeVideoId = ref<number | null>(null)
const getProductPayload = (value: unknown): Product | null => {
  const payload = value && typeof value === 'object' && 'data' in value && !('id' in value)
    ? (value as { data?: unknown }).data
    : value

  if (!payload || typeof payload !== 'object' || !Number.isInteger(Number((payload as Product).id))) return null

  return {
    ...(payload as Product),
    images: Array.isArray((payload as Product).images) ? (payload as Product).images : [],
    variants: Array.isArray((payload as Product).variants) ? (payload as Product).variants : [],
    colors: Array.isArray((payload as Product).colors) ? (payload as Product).colors : [],
  }
}
const loadProduct = async () => {
  const requestId = ++latestProductRequest
  const id = Number(route.params.slug)
  productLoading.value = true
  productLoadError.value = false
  if (!Number.isInteger(id) || id <= 0) {
    product.value = null
    productLoading.value = false
    return
  }
  product.value = null
  activeVideoId.value = null
  try {
    const response = await request<Product>(`/products/${id}`, { timeout: 8000 })
    if (requestId !== latestProductRequest) return
    const payload = getProductPayload(response.data)
    product.value = payload && Number(payload.id) === id ? payload : null
    productLoadError.value = !product.value
  } catch {
    if (requestId !== latestProductRequest) return
    product.value = null
    productLoadError.value = true
  } finally {
    if (requestId === latestProductRequest) productLoading.value = false
  }
}
onMounted(() => { void loadProduct() })
watch(() => route.params.slug, () => { void loadProduct() })
const productName = computed(() => product.value ? getLocalizedFirst(locale.value, product.value.name_ar, product.value.name_en, product.value.name) : '')
const productDescription = computed(() => product.value ? getLocalizedFirst(locale.value, product.value.description_ar, product.value.description_en, product.value.description) : '')
const productSeoTitle = computed(() => product.value
  ? getLocalizedFirst(locale.value, product.value.meta_title_ar, product.value.meta_title_en, productName.value) : '3B')
const productSeoDescription = computed(() => product.value
  ? getLocalizedFirst(locale.value, product.value.meta_description_ar, product.value.meta_description_en, productDescription.value) : '')
useSeoMeta({
  title: productSeoTitle,
  description: productSeoDescription,
  ogTitle: productSeoTitle,
  ogDescription: productSeoDescription,
})
const categoryName = computed(() => product.value?.category ? getLocalizedFirst(locale.value, product.value.category.name_ar, product.value.category.name_en, product.value.category.name) : '')
const subCategoryName = computed(() => product.value?.sub_category ? getLocalizedFirst(locale.value, product.value.sub_category.name_ar, product.value.sub_category.name_en, product.value.sub_category.name) : '')
const selectedOptions = reactive<Record<number, number>>({})
const qty = ref(1)
const hasUserSelectedColor = ref(Boolean(route.query.color))
const activeGalleryImageId = ref<number | null>(null)
const zoomOpen = ref(false)
const galleryTrigger = ref<HTMLButtonElement | null>(null)
const zoomDialog = ref<HTMLDivElement | null>(null)
const { addToCart, toggleWishlist, wishlist } = useShop()
const { track } = useAnalytics()
const installmentPlans = ref<Array<{ id: number; term_months: number; monthly_payment: number; provider: { name: string } }>>([])

const availableVariants = computed(() => product.value?.variants.filter(variant => variant.is_active) || [])
const selectedVariant = computed<ProductVariant | null>(() => {
  if (!product.value?.has_variants) return null
  const selectedIds = Object.values(selectedOptions)
  return availableVariants.value.find(variant =>
    selectedIds.length === variant.option_values.length
    && selectedIds.every(id => variant.option_values.some(value => value.id === id)),
  ) || null
})

const optionGroups = computed(() => {
  const groups = new Map<number, { id: number; name: string; name_en?: string | null; name_ar?: string | null; isColor: boolean; values: ProductOptionValue[] }>()
  availableVariants.value.forEach(variant => variant.option_values.forEach(value => {
    const type = getOptionType(value)
    if (!groups.has(type.id)) groups.set(type.id, {
      id: type.id,
      name: type.name,
      name_en: type.name_en,
      name_ar: type.name_ar,
      isColor: (type.name_en || type.name || '').toLowerCase() === 'color',
      values: [],
    })
    const group = groups.get(type.id)!
    if (!group.values.some(item => item.id === value.id)) group.values.push(value)
  }))
  return [...groups.values()].map(group => ({ ...group, values: group.values.sort((a, b) => a.order - b.order) }))
})
const colorOptionGroups = computed(() => optionGroups.value.filter(group => group.isColor))
const otherOptionGroups = computed(() => optionGroups.value.filter(group => !group.isColor))

const selectedLabels = computed(() => Object.fromEntries(optionGroups.value.map(group => [
  group.id,
  (() => { const value = group.values.find(item => item.id === selectedOptions[group.id]); return value ? getLocalizedFirst(locale.value, value.value_ar, value.value_en, value.value) : '' })(),
])))

const selectedColorValueId = computed(() => selectedVariant.value?.option_values.find(value => {
  const type = getOptionType(value)
  return (type.name_en || type.name || '').toLowerCase() === 'color'
})?.id || null)
const galleryImages = computed<ProductImage[]>(() => {
  if (!product.value) return []
  const baseImages = product.value.images || []
  const uniqueImages = (images: ProductImage[]) => images.filter((image, index) => {
    const imageUrl = getImageUrl(image, 'webp') || image.image
    return Boolean(imageUrl) && images.findIndex(item => (getImageUrl(item, 'webp') || item.image) === imageUrl) === index
  })
  if (!hasUserSelectedColor.value || !selectedColorValueId.value) {
    // Keep the product gallery visible before a color is chosen, and include
    // the default variant photo as a selectable thumbnail when it differs.
    return uniqueImages([...baseImages, ...(selectedVariant.value?.images || [])])
  }

  const colorImages = uniqueImages(product.value.variants
    .filter(variant => variant.option_values.some(value => value.id === selectedColorValueId.value))
    .flatMap(variant => variant.images || [])
  ).sort((a, b) => b.is_main - a.is_main)

  return colorImages.length ? colorImages : baseImages
})
const currentGalleryImage = computed(() => galleryImages.value.find(image => image.id === activeGalleryImageId.value)
  || galleryImages.value.find(image => image.is_main === 1)
  || galleryImages.value[0]
  || null)
const displayImage = computed(() => getImageUrl(currentGalleryImage.value, 'webp')
  || (product.value ? getProductImage(product.value, selectedVariant.value, 'webp') : ''))
const localizedImageAlt = (image: ProductImage, index = 0) => (locale.value === 'ar' ? image.alt_ar : image.alt_en) || `${productName.value} - ${index + 1}`
const currentImageAlt = computed(() => currentGalleryImage.value ? localizedImageAlt(currentGalleryImage.value) : productName.value)
const currentImageCaption = computed(() => locale.value === 'ar' ? currentGalleryImage.value?.caption_ar : currentGalleryImage.value?.caption_en)
const productVideos = computed(() => (product.value?.videos || []).filter(video => !video.product_variant_id || video.product_variant_id === selectedVariant.value?.id))
const currentVideo = computed(() => productVideos.value.find(video => video.id === activeVideoId.value) || null)
const localizedVideoTitle = (video: NonNullable<Product['videos']>[number]) => getLocalizedFirst(locale.value, video.title_ar, video.title_en)
const localizedIncludedInBox = computed(() => locale.value === 'ar' ? product.value?.included_in_box_ar || [] : product.value?.included_in_box_en || [])
const openZoom = async () => { zoomOpen.value = true; await nextTick(); zoomDialog.value?.focus() }
const closeZoom = async () => { zoomOpen.value = false; await nextTick(); galleryTrigger.value?.focus() }
const stepGallery = (step: number) => {
  const images = galleryImages.value
  if (images.length < 2) return
  const index = Math.max(0, images.findIndex(image => image.id === currentGalleryImage.value?.id))
  activeGalleryImageId.value = images[(index + step + images.length) % images.length].id
}
const currentPrice = computed(() => product.value ? getProductPrice(product.value, selectedVariant.value) : 0)
const currentOriginalPrice = computed(() => product.value ? getProductOriginalPrice(product.value, selectedVariant.value) : 0)
const productPath = computed(() => `/product/${product.value?.id || route.params.slug}`)
useCanonicalLinks(productPath)
const productJsonLd = computed(() => {
  if (!product.value) return null
  const images = [product.value.main_image_url, ...product.value.images.map(image => image.image)].filter((value): value is string => Boolean(value))
  const schema: Record<string, any> = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: productName.value,
    description: productSeoDescription.value || productDescription.value,
    image: [...new Set(images)],
    sku: selectedVariant.value?.sku || product.value.sku || undefined,
    gtin: product.value.gtin || undefined,
    model: product.value.model_number || undefined,
    category: categoryName.value || undefined,
    brand: product.value.brand ? { '@type': 'Brand', name: locale.value === 'ar' ? product.value.brand.name_ar : product.value.brand.name_en } : undefined,
    offers: {
      '@type': 'Offer',
      url: `${siteOrigin.value}${productPath.value}`,
      priceCurrency: 'EGP',
      price: currentPrice.value,
      availability: availableStock.value > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
      itemCondition: product.value.condition === 'new' ? 'https://schema.org/NewCondition' : 'https://schema.org/UsedCondition',
      seller: { '@type': 'Organization', name: '3B' },
    },
  }
  if (product.value.reviews_count > 0) {
    schema.aggregateRating = { '@type': 'AggregateRating', ratingValue: product.value.avg_rating, reviewCount: product.value.reviews_count }
  }
  return schema
})
const breadcrumbJsonLd = computed(() => ({
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: t('home'), item: siteOrigin.value },
    ...(product.value?.category?.slug ? [{ '@type': 'ListItem', position: 2, name: categoryName.value, item: `${siteOrigin.value}/category/${product.value.category.slug}` }] : []),
    ...(product.value ? [{ '@type': 'ListItem', position: 3, name: productName.value, item: `${siteOrigin.value}${productPath.value}` }] : []),
  ],
}))
useHead(() => ({
  script: productJsonLd.value ? [
    { key: '3b-product-jsonld', type: 'application/ld+json', innerHTML: serializeJsonLd(productJsonLd.value) },
    { key: '3b-product-breadcrumb-jsonld', type: 'application/ld+json', innerHTML: serializeJsonLd(breadcrumbJsonLd.value) },
  ] : [],
}))
const currentPromotion = computed(() => selectedVariant.value ? selectedVariant.value.promotion || null : product.value?.promotion || null)
const currentSavingsPercentage = computed(() => selectedVariant.value ? selectedVariant.value.savings_percentage ?? 0 : product.value?.savings_percentage ?? 0)
const currentPromotionTerms = computed(() => currentPromotion.value ? (locale.value === 'ar' ? currentPromotion.value.terms_ar : currentPromotion.value.terms_en) : '')
const availableStock = computed(() => product.value ? getProductStock(product.value, selectedVariant.value) : 0)
const canAdd = computed(() => Boolean(product.value && (!product.value.has_variants || selectedVariant.value) && availableStock.value > 0))
const badge = computed(() => product.value ? getProductBadge(product.value, locale.value) : '')
const related = computed(() => [])
const recommendationGroups = computed(() => {
  const configured = Object.values(product.value?.product_relationships || {}).filter(group => group.items?.length)
  return configured.length ? configured : (related.value.length ? [{ type: 'related', items: related.value }] : [])
})
const relationshipTitle = (type: string) => t(({ compatible: 'compatibleProducts', accessory: 'compatibleAccessories', alternative: 'alternatives', bundle: 'frequentlyBoughtTogether' } as Record<string, string>)[type] || 'sameCategory')

type EstimateBranch = { id: number; name: string; city: string | null; available: boolean; available_quantity: number }
type DeliveryEstimate = {
  fulfillment_method: 'delivery' | 'pickup'; available: boolean; available_quantity: number | null;
  handling_class: string; shipping_price: number | null; estimated_delivery_from?: string | null;
  estimated_delivery_to?: string | null; estimated_ready_from?: string | null; estimated_ready_to?: string | null;
  stock_location?: { id: number; name: string; type: string; city: string | null } | null;
  branches: EstimateBranch[]; selected_branch: EstimateBranch | null;
}
const { cities, districts, loadingDistricts, fetchCities, fetchDistricts } = useLocations()
const { cityId: savedCityId } = useDeliveryLocation()
const selectedCityId = savedCityId
const selectedDistrictId = ref<number | null>(null)
const selectedBranchId = ref<number | null>(null)
const fulfillmentMethod = ref<'delivery' | 'pickup'>('delivery')
const deliveryEstimate = ref<DeliveryEstimate | null>(null)
const deliveryEstimateLoading = ref(false)
const deliveryEstimateError = ref(false)
const availablePickupBranches = computed(() => (deliveryEstimate.value?.branches || []).filter(branch => branch.available))
const deliveryEstimateRequestId = ref(0)
const estimateDateRange = computed(() => {
  const start = deliveryEstimate.value?.estimated_delivery_from || deliveryEstimate.value?.estimated_ready_from
  const end = deliveryEstimate.value?.estimated_delivery_to || deliveryEstimate.value?.estimated_ready_to
  if (!start || !end) return ''
  const format = (date: string) => new Intl.DateTimeFormat(locale.value === 'ar' ? 'ar-EG' : 'en-GB', { day: 'numeric', month: 'short' }).format(new Date(`${date}T12:00:00`))
  return start === end ? format(start) : `${format(start)} – ${format(end)}`
})
const localizedLocation = (location: { name_en: string; name_ar: string }) => getLocalizedFirst(locale.value, location.name_ar, location.name_en)

const loadDeliveryEstimate = async () => {
  if (!import.meta.client || !product.value) return
  if (fulfillmentMethod.value === 'delivery' && !selectedCityId.value) { deliveryEstimate.value = null; return }
  const requestId = ++deliveryEstimateRequestId.value
  deliveryEstimateLoading.value = true
  deliveryEstimateError.value = false
  const query = {
    fulfillment_method: fulfillmentMethod.value,
    ...(fulfillmentMethod.value === 'delivery' ? { city_id: selectedCityId.value, district_id: selectedDistrictId.value || undefined } : { branch_id: selectedBranchId.value || undefined }),
    ...(selectedVariant.value ? { variant_id: selectedVariant.value.id } : {}),
  }
  try {
    const response = await request<DeliveryEstimate>(`/products/${product.value.id}/delivery-estimate`, { query })
    if (requestId !== deliveryEstimateRequestId.value) return
    deliveryEstimate.value = response.data
    if (fulfillmentMethod.value === 'pickup' && !selectedBranchId.value) {
      const firstAvailable = response.data.branches?.find(branch => branch.available)
      if (firstAvailable) selectedBranchId.value = firstAvailable.id
    }
  } catch {
    if (requestId === deliveryEstimateRequestId.value) { deliveryEstimate.value = null; deliveryEstimateError.value = true }
  } finally {
    if (requestId === deliveryEstimateRequestId.value) deliveryEstimateLoading.value = false
  }
}
const onCityChange = async () => {
  selectedDistrictId.value = null
  if (selectedCityId.value) await fetchDistricts(selectedCityId.value)
  await loadDeliveryEstimate()
}
const setFulfillmentMethod = (method: 'delivery' | 'pickup') => {
  fulfillmentMethod.value = method
  deliveryEstimate.value = null
  if (method === 'pickup') selectedBranchId.value = null
}
watch([fulfillmentMethod, selectedDistrictId, selectedBranchId, () => selectedVariant.value?.id, () => product.value?.id], loadDeliveryEstimate)

type ProductReview = { id: number; rating: number; comment: string; reviewer_name: string; created_at: string }
const productReviews = ref<ProductReview[]>([])
const loadProductReviews = async () => {
  if (!product.value || !import.meta.client) return
  try {
    const response = await request<ProductReview[]>(`/products/${product.value.id}/reviews?per_page=10`)
    productReviews.value = response.data || []
  } catch { productReviews.value = [] }
}
watch(() => product.value?.id, loadProductReviews)

const loadInstallments = async () => {
  if (!import.meta.client || currentPrice.value <= 0) return
  try {
    const response = await request<{ plans: Array<{ id: number; term_months: number; monthly_payment: number; provider: { name: string } }> }>(`/installments?amount=${encodeURIComponent(currentPrice.value)}`)
    installmentPlans.value = response.plans ?? []
  } catch { installmentPlans.value = [] }
}
watch(currentPrice, loadInstallments)
onMounted(async () => {
  await fetchCities()
  if (!selectedCityId.value && cities.value.length) selectedCityId.value = cities.value[0].id
  if (selectedCityId.value) await fetchDistricts(selectedCityId.value)
  await Promise.all([loadInstallments(), loadDeliveryEstimate(), loadProductReviews()])
})

const applyVariantSelection = (variant: ProductVariant | null) => {
  Object.keys(selectedOptions).forEach(key => delete selectedOptions[Number(key)])
  variant?.option_values.forEach(value => { selectedOptions[getOptionType(value).id] = value.id })
  qty.value = 1
}

watch(galleryImages, images => {
  const mainImage = images.find(image => image.is_main === 1) || images[0]
  activeGalleryImageId.value = mainImage?.id ?? null
}, { immediate: true })

watch(
  [product, () => route.query.color],
  ([value, colorQuery]) => {
    const colorId = Number(colorQuery)
    const colorVariant = value && Number.isInteger(colorId) && colorId > 0
      ? value.variants.find(variant => variant.option_values.some(option => option.id === colorId))
      : null
    hasUserSelectedColor.value = Boolean(colorVariant)
    applyVariantSelection(colorVariant || (value ? getDefaultVariant(value) : null))
  },
  { immediate: true },
)

const isValueAvailable = (groupId: number, valueId: number) => availableVariants.value.some(variant => {
  if (!variant.in_stock || !variant.option_values.some(value => value.id === valueId)) return false
  return Object.entries(selectedOptions).every(([typeId, selectedValueId]) =>
    Number(typeId) === groupId || variant.option_values.some(value => value.id === selectedValueId),
  )
})

const selectOption = (groupId: number, valueId: number) => {
  if (optionGroups.value.find(group => group.id === groupId)?.isColor) {
    hasUserSelectedColor.value = true
  }

  const candidate = availableVariants.value.find(variant =>
    variant.in_stock
    && variant.option_values.some(value => value.id === valueId)
    && Object.entries(selectedOptions).every(([typeId, selectedValueId]) =>
      Number(typeId) === groupId || variant.option_values.some(value => value.id === selectedValueId),
    ),
  ) || availableVariants.value.find(variant => variant.in_stock && variant.option_values.some(value => value.id === valueId))
  applyVariantSelection(candidate || null)
}

const handleAddToCart = () => {
  if (!product.value || !canAdd.value) return
  addToCart(product.value, qty.value, selectedVariant.value)
  void track('add_to_cart', {
    product_id: product.value.id,
    variant_id: selectedVariant.value?.id || null,
    promotion_id: currentPromotion.value?.id || product.value.promotion?.id || null,
    properties: { quantity: qty.value, currency: 'EGP', value: currentPrice.value * qty.value },
  })
}

watch(() => product.value?.id, (productId) => {
  if (!productId) return
  void track('product_view', {
    product_id: productId,
    promotion_id: product.value?.promotion?.id || null,
    properties: { currency: 'EGP' },
  })
}, { immediate: true })
</script>

<style scoped>
.product-facts,.specification-table{margin:18px 0;border:1px solid var(--line);border-radius:12px;overflow:hidden}.product-facts>div,.specification-table>div{display:flex;justify-content:space-between;gap:18px;padding:11px 14px;border-bottom:1px solid var(--line)}.product-facts>div:last-child,.specification-table>div:last-child{border:0}.product-facts dt,.specification-table dt{color:var(--muted)}.product-facts dd,.specification-table dd{margin:0;font-weight:700;text-align:end}.catalog-info{margin:22px 0}.catalog-info h2{font-size:1.05rem;margin:0 0 10px}.catalog-info ul{padding-inline-start:22px}.document-list{list-style:none;padding:0}.document-list a{display:flex;justify-content:space-between;padding:10px 0;color:var(--theme-accent);border-bottom:1px solid var(--line)}
.detail-grid{display:grid;grid-template-columns:1.05fr .95fr;gap:60px;align-items:start}.product-gallery{min-width:0;align-self:start}.gallery-color-options{margin-top:14px}.gallery-color-options .choice{margin:0;padding:14px 16px;border:1px solid var(--line);border-radius:14px;background:var(--theme-surface)}.detail-copy{min-width:0}.detail-copy h1{overflow-wrap:anywhere}.specification-table dd{overflow-wrap:anywhere;min-width:0}.detail-image{display:block;width:100%;aspect-ratio:4/3;max-height:min(680px,calc(100vh - 250px));border:0;padding:0;text-align:start;border-radius:26px;overflow:hidden;position:relative;background:#fff;cursor:zoom-in}.detail-image img{width:100%;height:100%;object-fit:contain;object-position:center;transform:none}.image-caption{margin:7px 3px 0;color:var(--muted);font-size:.84rem}.zoom-overlay{position:fixed;inset:0;z-index:100;display:flex;align-items:center;justify-content:center;padding:60px;background:#10191bea}.zoom-overlay>img{max-width:min(1100px,90vw);max-height:82vh;object-fit:contain;background:white;border-radius:8px}.zoom-overlay>p{position:absolute;bottom:16px;left:20px;right:20px;color:white;text-align:center}.zoom-close,.zoom-step{position:absolute;width:46px;height:46px;border:1px solid #ffffff88;border-radius:50%;background:#142027;color:white;font-size:2rem;line-height:1}.zoom-close{top:18px;inset-inline-end:18px}.zoom-step{top:50%;transform:translateY(-50%)}.zoom-step.previous{left:16px}.zoom-step.next{right:16px}.zoom-overlay :focus-visible{outline:3px solid white;outline-offset:4px}.gallery-thumbnails{display:flex;gap:10px;overflow-x:auto;padding:4px 2px 8px;margin-top:12px;scrollbar-width:thin}.gallery-thumbnails button{flex:0 0 78px;width:78px;height:78px;border:1px solid var(--line);border-radius:13px;padding:5px;background:var(--theme-surface);overflow:hidden}.gallery-thumbnails button.active{border:2px solid var(--theme-accent);box-shadow:0 0 0 2px color-mix(in srgb,var(--theme-accent) 20%,transparent)}.gallery-thumbnails img{width:100%;height:100%;object-fit:contain}.breadcrumbs{color:var(--muted);font-size:.84rem}.detail-copy h1{font-size:2.7rem;line-height:1.25;margin:12px 0}.detail-rating{display:flex;align-items:center;gap:7px;color:#d89f29}.detail-rating svg{width:18px}.detail-price{display:flex;align-items:center;gap:14px;margin:17px 0}.detail-price strong{font-size:1.55rem;color:var(--green)}.detail-price del{color:var(--muted)}.detail-copy>p{color:var(--muted);font-size:1.02rem}.choice{margin:22px 0}.choice-label{display:flex;align-items:center;justify-content:space-between;gap:12px}.choice-label span{font-size:.82rem;color:var(--muted)}.choice-values{display:flex;gap:10px;margin-top:9px}.choice-values button{min-width:46px;height:40px;border-radius:10px;border:1px solid var(--line);background:#fff;padding:0 12px}.choice-values button.selected{border-color:var(--green);box-shadow:0 0 0 1px var(--green);color:var(--green);font-weight:800}.choice-values button.unavailable{opacity:.32;text-decoration:line-through;cursor:not-allowed}.choice-values.colors button{min-width:34px;width:34px;height:34px;border-radius:50%;border:3px solid #fff;box-shadow:0 0 0 1px var(--line);padding:0}.choice-values.colors button.selected{box-shadow:0 0 0 2px var(--green)}.variant-meta{display:flex;justify-content:space-between;gap:12px;background:var(--cream);border-radius:12px;padding:10px 13px;margin-bottom:16px;font-size:.8rem;color:var(--muted)}.in-stock{color:var(--green);font-weight:700}.out-of-stock{color:#9a5c50;font-weight:700}.buy-row{display:flex;gap:10px}.qty{height:48px;border:1px solid var(--line);border-radius:13px;display:flex;align-items:center}.qty button{border:0;background:none;width:40px}.qty button:disabled{opacity:.35}.qty span{width:30px;text-align:center}.grow{flex:1}.btn:disabled{opacity:.5;cursor:not-allowed}.square{width:50px;padding:0}.mini-benefits{display:flex;gap:14px;flex-wrap:wrap;border-top:1px solid var(--line);margin-top:25px;padding-top:20px}.mini-benefits span{display:flex;align-items:center;gap:6px;font-size:.82rem;color:var(--muted)}.mini-benefits svg{width:17px;color:var(--green)}
.saving{color:#087443;font-size:.84rem;font-weight:800}.promotion-terms{padding:10px 13px;background:#fff8e8;border-radius:9px;color:#765821;font-size:.88rem}.installment-options{margin:18px 0;padding:15px;border:1px solid var(--line);border-radius:14px}.installment-options h2{font-size:1rem;margin:0 0 9px}.installment-options>div{display:flex;justify-content:space-between;gap:12px;padding:8px 0;border-top:1px solid var(--line);font-size:.83rem}.installment-options b{color:var(--green)}
@media(max-width:800px){.detail-grid{grid-template-columns:1fr;gap:30px}.detail-image{height:460px}.detail-copy h1{font-size:2.1rem}}
@media(max-width:500px){.detail-image{height:380px}.gallery-thumbnails button{flex-basis:64px;width:64px;height:64px}.buy-row{flex-wrap:wrap}.grow{order:3;flex-basis:100%}.variant-meta{align-items:flex-start;flex-direction:column}}
.detail-image video{width:100%;height:100%;object-fit:contain;background:#101820}.video-frame{cursor:default}.video-thumbnails button{flex:0 0 145px;width:145px;min-height:78px;display:flex;align-items:center;justify-content:center;gap:8px;color:var(--theme-primary);font-weight:800}.video-thumbnails small{font-size:.72rem;font-weight:650;text-align:start}.delivery-panel{margin:20px 0;padding:16px;border:1px solid var(--line);border-radius:14px;background:var(--theme-surface)}.delivery-panel h2{margin:0 0 12px;font-size:1rem}.fulfillment-tabs{display:flex;gap:8px;margin-bottom:12px}.fulfillment-tabs button{min-height:38px;padding:0 14px;border:1px solid var(--line);border-radius:9px;background:white;color:var(--ink)}.fulfillment-tabs button[aria-pressed=true]{border-color:var(--theme-primary);background:var(--theme-primary);color:white}.location-fields{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px;margin:10px 0}.location-fields label{display:flex;flex-direction:column;gap:5px;font-size:.8rem;color:var(--muted)}.location-fields select{min-width:0;min-height:40px;border:1px solid var(--line);border-radius:8px;padding:7px 9px;background:white;color:var(--ink)}.estimate-message{margin:10px 0 0;color:var(--muted);font-size:.85rem}.estimate-details{display:flex;flex-wrap:wrap;gap:6px 16px;margin-top:12px;font-size:.84rem}.estimate-details strong{flex-basis:100%;color:var(--theme-primary)}.error-text{color:#a52f28}.review-list{display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:12px}.review-card{padding:15px;border:1px solid var(--line);border-radius:12px;background:var(--theme-surface)}.review-card>div{display:flex;justify-content:space-between;gap:12px}.review-card>div span{color:#c68b13;letter-spacing:.08em}.review-card p{margin:10px 0 0;white-space:pre-wrap}.mobile-purchase-bar{display:none}
@media(max-width:800px){.mobile-purchase-bar{position:fixed;inset-inline:0;bottom:0;z-index:50;display:flex;align-items:center;justify-content:space-between;gap:12px;padding:10px 14px calc(10px + env(safe-area-inset-bottom));background:var(--theme-surface);border-top:1px solid var(--line);box-shadow:0 -5px 18px #102b3a14}.mobile-purchase-bar>div{min-width:0;display:flex;flex-direction:column}.mobile-purchase-bar strong{color:var(--theme-primary);font-size:1rem}.mobile-purchase-bar small{max-width:45vw;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;color:var(--muted);font-size:.72rem}.mobile-purchase-bar .btn{min-height:42px;padding-inline:15px}.product-detail{padding-bottom:94px}}
@media(max-width:500px){.location-fields{grid-template-columns:1fr}.video-thumbnails button{flex-basis:135px;width:135px}}
.detail-image{background:var(--theme-surface)}
.detail-image img{object-fit:cover}
@media(max-width:800px){.detail-image img{object-fit:contain}}
</style>
