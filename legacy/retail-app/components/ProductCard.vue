<template>
  <article class="product-card">
    <NuxtLink
      class="product-card-hit-area"
      :to="productPath"
      :aria-label="productName"
    />
    <div class="product-media">
      <img
        :src="previewImage"
        :alt="productName"
        loading="lazy"
        decoding="async"
      >
      <span v-if="badge" class="badge">{{ badge }}</span>
      <button
        class="wish-btn"
        :class="{ active: wishlist.includes(product.id) }"
        :aria-label="wishlist.includes(product.id) ? t('removeFromWishlist', { name: productName }) : t('addToWishlist', { name: productName })"
        @click="toggleWishlist(product.id)"
      >
        <Heart :size="20" :fill="wishlist.includes(product.id) ? 'currentColor' : 'none'" />
      </button>
      <button class="compare-btn" :class="{ active: productIds.includes(product.id) }" :aria-label="compareLabel" :aria-pressed="productIds.includes(product.id)" @click="toggleCompare">
        <GitCompareArrows :size="18" />
      </button>
    </div>

    <div class="product-info">
      <small class="category-name">{{ categoryName }}<template v-if="product.sub_category"> · {{ subCategoryName }}</template></small>
      <span v-if="product.brand" class="brand-name">{{ getLocalizedFirst(locale, product.brand.name_ar, product.brand.name_en) }}</span>
      <h3>{{ productName }}</h3>
      <div v-if="product.reviews_count > 0" class="rating"><Star :size="14" fill="currentColor" /> {{ Number(product.avg_rating).toFixed(1) }} <span>({{ formatReviewCount(product.reviews_count) }})</span></div>
      <small v-if="product.model_number" class="model-number">{{ isEnglish ? 'Model' : 'الموديل' }}: {{ product.model_number }}</small>

      <div class="product-footer">
        <div class="price-row">
          <div class="price-current">
            <span v-if="product.has_variants" class="from-price">{{ t('from') }}</span>
            <strong>{{ formatPrice(price, locale) }}</strong>
          </div>
          <div class="price-discount">
            <template v-if="originalPrice > price">
              <del>{{ formatPrice(originalPrice, locale) }}</del>
              <small v-if="product.savings_percentage" class="saving">−{{ product.savings_percentage }}%</small>
            </template>
          </div>
        </div>

        <button v-if="product.has_variants && inStock" type="button" class="add-btn choose-options-btn" @click="navigateTo(productPath)">
          <SlidersHorizontal :size="16" />
          <span>{{ t('productDetails') }}</span>
        </button>
        <button
          v-else-if="inStock"
          type="button"
          class="add-btn add-icon-btn"
          :aria-label="t('addToCart')"
          :title="t('addToCart')"
          @click="addToCart(product)"
        >
          <ShoppingCart :size="20" aria-hidden="true" />
        </button>
        <button v-else class="add-btn disabled" disabled>
          <span>{{ t('outOfStock') }}</span>
        </button>
      </div>
    </div>
    <span v-if="compareNotice" class="compare-notice" role="status">{{ compareNotice }}</span>
  </article>
</template>

<script setup lang="ts">
import { GitCompareArrows, Heart, ShoppingCart, SlidersHorizontal, Star } from 'lucide-vue-next'
import { formatPrice } from '~/data/products'
import type { Product } from '~/types/catalog'
import { getLocalizedFirst, getProductBadge, getProductImage, getProductOriginalPrice, getProductPrice, isProductInStock } from '~/utils/catalog'

const props = defineProps<{ product: Product }>()
const { locale, isEnglish, t } = useLocale()
const { wishlist, toggleWishlist, addToCart } = useShop()
const { productIds, toggle: toggleComparison } = useComparison()
const compareNotice = ref('')
const productName = computed(() => getLocalizedFirst(locale.value, props.product.name_ar, props.product.name_en, props.product.name))
const categoryName = computed(() => getLocalizedFirst(locale.value, props.product.category?.name_ar, props.product.category?.name_en, props.product.category?.name))
const subCategoryName = computed(() => props.product.sub_category
  ? getLocalizedFirst(locale.value, props.product.sub_category.name_ar, props.product.sub_category.name_en, props.product.sub_category.name)
  : '')

const productPath = computed(() => {
  const id = Number(props.product.id)
  return Number.isInteger(id) && id > 0 ? `/product/${id}` : '/products'
})
const price = computed(() => getProductPrice(props.product))
const originalPrice = computed(() => getProductOriginalPrice(props.product))
const inStock = computed(() => isProductInStock(props.product))
const formatReviewCount = (count: number) => new Intl.NumberFormat(locale.value === 'ar' ? 'ar-EG' : 'en').format(count)
const badge = computed(() => props.product.promotion
  ? (locale.value === 'ar' ? props.product.promotion.badge_ar : props.product.promotion.badge_en) || getProductBadge(props.product, locale.value)
  : getProductBadge(props.product, locale.value))
const compareLabel = computed(() => locale.value === 'ar' ? `أضف ${productName.value} للمقارنة` : `Compare ${productName.value}`)
const previewImage = computed(() => getProductImage(
  props.product,
  null,
  'small',
))

const toggleCompare = () => {
  const saved = toggleComparison(props.product.id)
  compareNotice.value = saved ? '' : (locale.value === 'ar' ? 'يمكن مقارنة 4 منتجات كحد أقصى.' : 'Compare up to 4 products at a time.')
}
</script>

<style scoped>
.product-card{position:relative;isolation:isolate;display:flex;flex-direction:column;height:100%}.product-card-hit-area{position:absolute;inset:0;z-index:1;border-radius:inherit}.product-card-hit-area:focus-visible{outline:3px solid var(--theme-accent);outline-offset:-3px}.product-card:hover .product-media img{transform:scale(1.08)}.product-media{flex:none}.product-info{display:flex;flex:1;flex-direction:column;min-width:0}.product-footer{display:flex;flex:1;flex-direction:column;margin-top:auto}.product-footer .add-btn{position:relative;z-index:2;margin-top:auto}
.brand-name{display:block;margin-top:3px;color:var(--theme-accent);font-size:.76rem;font-weight:800;letter-spacing:.02em}.product-info h3{overflow-wrap:anywhere;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;margin-top:3px}.model-number{display:block;margin-top:2px;font-size:.72rem;overflow-wrap:anywhere}.add-btn.disabled{background:#d6dde2!important;color:#53616b!important;cursor:not-allowed;transform:none!important}
.product-info h3{font-size:.84rem;line-height:1.35}
.saving{display:inline-flex;margin-inline-start:7px;color:#087443;font-weight:800;font-size:.75rem}
.compare-btn{position:absolute;z-index:2;inset-inline-start:12px;top:52px;width:38px;height:38px;display:grid;place-items:center;border:1px solid #e4e9ed;border-radius:50%;background:#fff;color:var(--theme-primary);box-shadow:0 2px 10px #102b3a15}.compare-btn.active{background:var(--theme-primary);border-color:var(--theme-primary);color:var(--theme-on-primary)}.wish-btn{z-index:2}.compare-notice{position:relative;z-index:2;display:block;padding:0 14px 8px;color:#b42318;font-size:.72rem}
.from-price{font-size:.72rem;color:var(--muted)}
.product-footer .add-icon-btn{align-self:flex-start;width:44px;min-width:44px;height:44px;min-height:44px;padding:0}
.product-info{padding:20px 17px 22px}
.product-info h3{min-height:2.7em;margin:3px 0 16px;font-weight:400}
.product-footer .price-row{margin-top:16px}
.product-footer .add-btn{min-height:46px}
@media(max-width:600px){.product-info{padding:16px 12px 18px}.product-info h3{margin-bottom:12px}.product-footer .price-row{margin-top:12px}}
</style>
