<template>
  <main class="brand-page">
    <section class="brand-hero">
      <div class="container brand-hero-inner">
        <img
          v-if="brandLogoUrl(brand || {})"
          :src="brandLogoUrl(brand || {})!"
          :class="{ 'brand-mark--dark': brandLogoNeedsDarkSurface(brand || {}) }"
          alt=""
          width="170"
          height="130"
        >
        <div>
          <span class="eyebrow">{{ isEnglish ? 'OFFICIAL BRAND STORE' : 'متجر العلامة التجارية' }}</span>
          <h1>{{ brandName }}</h1>
          <p v-if="brandDescription">{{ brandDescription }}</p>
          <span class="product-count">{{ brand?.products_count || 0 }} {{ isEnglish ? 'products' : 'منتج' }}</span>
        </div>
      </div>
    </section>

    <section class="section">
      <div class="container">
        <div class="brand-filter-toolbar" role="group" :aria-label="isEnglish ? 'Filter brand products' : 'تصفية منتجات العلامة التجارية'">
          <p class="results-count" role="status" aria-live="polite">
            <strong>{{ meta.total }}</strong> {{ isEnglish ? 'products' : 'منتج' }}
          </p>

          <label class="filter-control category-control">
            <span>{{ isEnglish ? 'Category' : 'الفئة' }}</span>
            <select v-model.number="categoryId" @change="applyFilters">
              <option :value="0">{{ isEnglish ? 'All categories' : 'كل الفئات' }}</option>
              <option v-for="category in categoryOptions" :key="category.id" :value="category.id">
                {{ categoryLabel(category) }} ({{ category.count }})
              </option>
            </select>
          </label>

          <div v-if="priceRange.max !== null" class="price-control">
            <span class="control-label">{{ isEnglish ? 'Price' : 'السعر' }}</span>
            <div class="price-inputs">
              <label>
                <span class="sr-only">{{ isEnglish ? 'Minimum price' : 'أقل سعر' }}</span>
                <input
                  v-model.number="minPrice"
                  type="number"
                  :min="priceRange.min ?? 0"
                  :max="maxPrice ?? priceRange.max ?? undefined"
                  :placeholder="isEnglish ? 'From' : 'من'"
                  @change="applyPriceFilter"
                >
              </label>
              <span aria-hidden="true">–</span>
              <label>
                <span class="sr-only">{{ isEnglish ? 'Maximum price' : 'أعلى سعر' }}</span>
                <input
                  v-model.number="maxPrice"
                  type="number"
                  :min="minPrice ?? priceRange.min ?? 0"
                  :max="priceRange.max ?? undefined"
                  :placeholder="isEnglish ? 'To' : 'إلى'"
                  @change="applyPriceFilter"
                >
              </label>
            </div>
          </div>

          <label class="filter-control sort-control">
            <span>{{ isEnglish ? 'Sort by' : 'ترتيب حسب' }}</span>
            <select v-model="sort" @change="applyFilters">
              <option value="newest">{{ isEnglish ? 'Newest' : 'الأحدث' }}</option>
              <option value="lowest_price">{{ isEnglish ? 'Price: low to high' : 'السعر: الأقل أولاً' }}</option>
              <option value="highest_price">{{ isEnglish ? 'Price: high to low' : 'السعر: الأعلى أولاً' }}</option>
              <option value="discount">{{ isEnglish ? 'Best discount' : 'أفضل خصم' }}</option>
              <option value="popular">{{ isEnglish ? 'Popular' : 'الأكثر رواجاً' }}</option>
            </select>
          </label>

          <label class="filter-check">
            <input v-model="inStock" type="checkbox" @change="applyFilters">
            <span>{{ isEnglish ? 'In stock' : 'متوفر بالمخزون' }}</span>
          </label>
          <label class="filter-check">
            <input v-model="onSale" type="checkbox" @change="applyFilters">
            <span>{{ isEnglish ? 'On offer' : 'عليه عرض' }}</span>
          </label>

          <button v-if="hasActiveFilters" class="clear-filters" type="button" @click="clearFilters">
            {{ isEnglish ? 'Clear filters' : 'مسح الفلاتر' }}
          </button>
        </div>

        <p v-if="error" class="catalog-message error-message" role="alert">{{ error }}</p>
        <p v-else-if="loading" class="catalog-message" role="status">{{ isEnglish ? 'Loading products…' : 'جارٍ تحميل المنتجات…' }}</p>
        <div v-else-if="products.length" class="product-grid">
          <ProductCard v-for="product in products" :key="product.id" :product="product" />
        </div>
        <div v-else-if="hasActiveFilters" class="empty-results">
          <h2>{{ isEnglish ? 'No matching products' : 'لا توجد منتجات مطابقة' }}</h2>
          <p>{{ isEnglish ? 'Change or clear the filters to see more from this brand.' : 'غيّر الفلاتر أو امسحها لرؤية المزيد من منتجات هذه العلامة.' }}</p>
          <button type="button" @click="clearFilters">{{ isEnglish ? 'Clear filters' : 'مسح الفلاتر' }}</button>
        </div>
        <EmptyState v-else :title="isEnglish ? 'No products listed yet' : 'لا توجد منتجات حالياً'" :text="isEnglish ? 'Check back soon for new products from this brand.' : 'تابعنا لاكتشاف منتجات جديدة من هذه العلامة.'" :action="t('allProducts')" action-to="/products" />

        <nav v-if="meta.last_page > 1" class="pagination" :aria-label="isEnglish ? 'Brand product pages' : 'صفحات منتجات العلامة التجارية'">
          <button :disabled="meta.page <= 1 || loading" @click="changePage(meta.page - 1)">{{ isEnglish ? 'Previous' : 'السابق' }}</button>
          <span>{{ meta.page }} / {{ meta.last_page }}</span>
          <button :disabled="meta.page >= meta.last_page || loading" @click="changePage(meta.page + 1)">{{ isEnglish ? 'Next' : 'التالي' }}</button>
        </nav>
      </div>
    </section>
  </main>
</template>

<script setup lang="ts">
import type { Product } from '~/types/catalog'
import { brandLogoNeedsDarkSurface, brandLogoUrl } from '~/utils/brand-logo'

type BrandStore = {
  id: number
  name_en?: string
  name_ar?: string
  slug: string
  logo_url?: string | null
  description_en?: string | null
  description_ar?: string | null
  meta_title_en?: string | null
  meta_title_ar?: string | null
  meta_description_en?: string | null
  meta_description_ar?: string | null
  products_count: number
}
type BrandCategoryFacet = { id: number; name_en: string; name_ar: string; count: number }
type CatalogResult = {
  items: Product[]
  facets: { categories: BrandCategoryFacet[]; price: { min: number | null; max: number | null } }
  meta: { page: number; per_page: number; total: number; last_page: number }
}

const emptyCatalogResult: CatalogResult = {
  items: [],
  facets: { categories: [], price: { min: null, max: null } },
  meta: { page: 1, per_page: 24, total: 0, last_page: 1 },
}

const route = useRoute()
const config = useRuntimeConfig()
const { locale, isEnglish, t } = useLocale()
const { request } = useApi()
const { data: brand } = await useAsyncData<BrandStore | null>(`brand-store-${route.params.slug}`, async () => {
  try {
    const response = await $fetch<{ data: BrandStore }>(`/brands/${route.params.slug}`, { baseURL: config.public.apiBase })
    return response.data
  } catch {
    return null
  }
})

const { data: initialCatalogResult } = await useAsyncData<CatalogResult>(`brand-catalog-${route.params.slug}`, async () => {
  if (!brand.value?.id) return emptyCatalogResult
  try {
    const response = await request<CatalogResult>('/catalog/search', { query: { brand_id: brand.value.id, per_page: 24, sort: 'newest' } })
    return response.data
  } catch {
    return emptyCatalogResult
  }
})

const brandName = computed(() => isEnglish.value ? brand.value?.name_en : brand.value?.name_ar)
const brandDescription = computed(() => isEnglish.value ? brand.value?.description_en : brand.value?.description_ar)
const products = ref<Product[]>(initialCatalogResult.value?.items || [])
const categoryOptions = ref<BrandCategoryFacet[]>(initialCatalogResult.value?.facets?.categories || [])
const priceRange = ref(initialCatalogResult.value?.facets?.price || { min: null, max: null })
const meta = ref(initialCatalogResult.value?.meta || emptyCatalogResult.meta)
const categoryId = ref(0)
const minPrice = ref<number | undefined>()
const maxPrice = ref<number | undefined>()
const sort = ref('newest')
const inStock = ref(false)
const onSale = ref(false)
const loading = ref(false)
const error = ref('')
let requestSequence = 0

const categoryLabel = (category: BrandCategoryFacet) => locale.value === 'ar' ? category.name_ar : category.name_en
const hasActiveFilters = computed(() => Boolean(categoryId.value || Number.isFinite(minPrice.value) || Number.isFinite(maxPrice.value) || inStock.value || onSale.value || sort.value !== 'newest'))

useSeoMeta({
  title: () => isEnglish.value ? (brand.value?.meta_title_en || brandName.value || '3B') : (brand.value?.meta_title_ar || brandName.value || '3B'),
  description: () => isEnglish.value ? brand.value?.meta_description_en : brand.value?.meta_description_ar,
})
const brandPath = computed(() => `/brands/${String(route.params.slug)}`)
useCanonicalLinks(brandPath)
useHead(() => ({ script: brand.value ? [{
  key: '3b-brand-jsonld',
  type: 'application/ld+json',
  innerHTML: serializeJsonLd({
    '@context': 'https://schema.org',
    '@type': 'Brand',
    name: brandName.value,
    description: brandDescription.value || undefined,
    url: `${String(config.public.siteUrl).replace(/\/$/, '')}${brandPath.value}`,
    logo: brandLogoUrl(brand.value) || undefined,
  }),
}] : [] }))

async function runFilters() {
  if (!brand.value?.id) return
  const sequence = ++requestSequence
  loading.value = true
  error.value = ''
  const query: Record<string, string | number | boolean | undefined> = {
    brand_id: brand.value.id,
    page: meta.value.page,
    per_page: 24,
    sort: sort.value,
    category_id: categoryId.value || undefined,
    min_price: Number.isFinite(minPrice.value) ? minPrice.value : undefined,
    max_price: Number.isFinite(maxPrice.value) ? maxPrice.value : undefined,
    in_stock: inStock.value || undefined,
    on_sale: onSale.value || undefined,
  }

  try {
    const response = await request<CatalogResult>('/catalog/search', { query })
    if (sequence !== requestSequence) return
    products.value = response.data.items || []
    meta.value = response.data.meta || emptyCatalogResult.meta
    if (!categoryOptions.value.length) categoryOptions.value = response.data.facets?.categories || []
    if (priceRange.value.max === null) priceRange.value = response.data.facets?.price || priceRange.value
  } catch (exception: any) {
    if (sequence === requestSequence) error.value = exception?.data?.message || (isEnglish.value ? 'Products could not be loaded. Please try again.' : 'تعذر تحميل المنتجات. حاول مرة أخرى.')
  } finally {
    if (sequence === requestSequence) loading.value = false
  }
}

function applyFilters() {
  meta.value.page = 1
  void runFilters()
}

function applyPriceFilter() {
  if (minPrice.value !== undefined && maxPrice.value !== undefined && minPrice.value > maxPrice.value) {
    maxPrice.value = minPrice.value
  }
  applyFilters()
}

function clearFilters() {
  categoryId.value = 0
  minPrice.value = undefined
  maxPrice.value = undefined
  sort.value = 'newest'
  inStock.value = false
  onSale.value = false
  applyFilters()
}

function changePage(page: number) {
  meta.value.page = page
  void runFilters()
}

watch(() => locale.value, () => void runFilters())
</script>

<style scoped>
.brand-hero{padding:30px 0;background:var(--cream);border-bottom:1px solid var(--line)}
.brand-hero-inner{display:flex;align-items:center;gap:28px;min-height:190px}
.brand-hero img{width:170px;height:130px;object-fit:contain;padding:12px;background:white;border:1px solid var(--line);border-radius:14px}
.brand-hero img.brand-mark--dark{background:#171717}
.brand-hero h1{margin:4px 0;font-size:2.3rem}
.brand-hero p{max-width:680px;margin:0;color:var(--muted)}
.eyebrow{color:var(--theme-accent);font-size:.82rem;font-weight:800}
.product-count{display:inline-block;margin-top:12px;color:var(--theme-primary);font-weight:700}
.brand-filter-toolbar{display:flex;align-items:end;gap:12px;flex-wrap:wrap;margin:0 0 22px;padding:14px;border:1px solid var(--line);border-radius:14px;background:var(--theme-surface)}
.results-count{align-self:center;margin:0 auto 0 0;color:var(--muted);font-size:.88rem;white-space:nowrap}
.results-count strong{color:var(--theme-text);font-variant-numeric:tabular-nums}
.filter-control{display:grid;gap:5px;min-width:165px;color:var(--muted);font-size:.76rem;font-weight:700}
.filter-control select,.price-inputs input{height:40px;min-width:0;border:1px solid var(--line);border-radius:9px;background:var(--theme-surface);padding:0 10px;color:var(--theme-text);font:inherit}
.category-control{min-width:210px}
.price-control{display:grid;gap:5px;min-width:210px;color:var(--muted);font-size:.76rem;font-weight:700}
.price-inputs{display:flex;align-items:center;gap:6px}
.price-inputs label{flex:1;min-width:0}
.price-inputs input{width:100%;font-size:.82rem}
.filter-check{display:flex;align-items:center;gap:7px;min-height:40px;padding:0 10px;border:1px solid var(--line);border-radius:9px;background:var(--theme-surface);color:var(--theme-text);font-size:.82rem;cursor:pointer}
.filter-check input{width:16px;height:16px;margin:0;accent-color:var(--theme-primary)}
.clear-filters{min-height:40px;border:0;border-radius:9px;background:transparent;padding:0 9px;color:var(--theme-accent);font:inherit;font-size:.82rem;font-weight:800;cursor:pointer}
.filter-control select:focus-visible,.price-inputs input:focus-visible,.filter-check:focus-within,.clear-filters:focus-visible,.pagination button:focus-visible{outline:2px solid var(--theme-primary);outline-offset:2px}
.catalog-message{padding:50px 12px;text-align:center;color:var(--muted)}
.error-message{color:#b42318}
.empty-results{text-align:center;padding:34px 12px;color:var(--theme-text)}
.empty-results h2{margin:0 0 7px}
.empty-results p{color:var(--muted)}
.empty-results>button{border:0;border-radius:9px;background:var(--theme-primary);padding:10px 15px;color:var(--theme-on-primary);font:inherit;font-weight:700;cursor:pointer}
.pagination{display:flex;align-items:center;justify-content:center;gap:16px;margin:26px 0}
.pagination button{min-height:40px;padding:7px 13px;border:1px solid var(--line);border-radius:9px;background:var(--theme-surface);color:var(--theme-text);font:inherit}
.pagination button:disabled{opacity:.45;cursor:not-allowed}
.pagination span{color:var(--muted);font-variant-numeric:tabular-nums}
.sr-only{position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0}
@media(max-width:800px){.brand-filter-toolbar{align-items:stretch}.results-count{width:100%;margin-bottom:2px}.filter-control{flex:1}.category-control{min-width:min(100%,210px)}.price-control{flex:1}.filter-check{flex:1;justify-content:center}}
@media(max-width:600px){.brand-hero-inner{align-items:flex-start;flex-direction:column;gap:14px}.brand-hero h1{font-size:1.8rem}.brand-filter-toolbar{gap:9px;padding:11px}.category-control,.sort-control{flex:1 1 calc(50% - 9px);min-width:0}.price-control{flex:1 1 100%}.filter-check{min-width:calc(50% - 6px)}.clear-filters{margin-inline-start:auto}}
</style>
