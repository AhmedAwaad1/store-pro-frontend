<template>
  <main>
    <PageHero :eyebrow="isEnglish ? '3B CATALOG' : 'كتالوج 3B'" :title="isEnglish ? 'Find the right product' : 'اعثر على المنتج المناسب'" :description="isEnglish ? 'Search by name, brand, model number, SKU, or technical specification.' : 'ابحث بالاسم أو العلامة التجارية أو الموديل أو SKU أو المواصفات الفنية.'" />
    <section class="section"><div class="container">
      <CatalogSearchBox v-model="query" :navigate-on-submit="false" @search="submitSearch" />
      <div class="search-toolbar">
        <p role="status" aria-live="polite">{{ isEnglish ? `${meta.total} results` : `${meta.total} نتيجة` }}<span v-if="query"> · “{{ query }}”</span></p>
        <div class="toolbar-actions"><button class="filter-toggle" :aria-expanded="filtersOpen" @click="filtersOpen = true">{{ isEnglish ? 'Filters' : 'الفلاتر' }} <span v-if="activeFilterCount">({{ activeFilterCount }})</span></button>
          <label><span>{{ isEnglish ? 'Sort' : 'ترتيب' }}</span><select v-model="sort" @change="runSearch"><option value="relevance">{{ isEnglish ? 'Relevance' : 'الأكثر صلة' }}</option><option value="newest">{{ isEnglish ? 'Newest' : 'الأحدث' }}</option><option value="lowest_price">{{ isEnglish ? 'Price: low to high' : 'السعر: الأقل أولاً' }}</option><option value="highest_price">{{ isEnglish ? 'Price: high to low' : 'السعر: الأعلى أولاً' }}</option><option value="discount">{{ isEnglish ? 'Discount' : 'الخصم' }}</option><option value="rating">{{ isEnglish ? 'Rating' : 'التقييم' }}</option><option value="popular">{{ isEnglish ? 'Popular' : 'الأكثر رواجاً' }}</option></select></label>
        </div>
      </div>
      <div v-if="chips.length" class="active-filters" :aria-label="isEnglish ? 'Active filters' : 'الفلاتر المحددة'"><button v-for="chip in chips" :key="chip.key" @click="chip.remove">{{ chip.label }} <span aria-hidden="true">×</span></button><button class="clear" @click="clearFilters">{{ isEnglish ? 'Clear all' : 'مسح الكل' }}</button></div>
      <div class="catalog-results">
        <div v-if="filtersOpen" class="scrim" @click="filtersOpen = false"></div>
        <aside class="filters" :class="{ open: filtersOpen }" :aria-label="isEnglish ? 'Catalog filters' : 'فلاتر المنتجات'">
          <div class="filter-heading"><h2>{{ isEnglish ? 'Filters' : 'الفلاتر' }}</h2><button class="close-filters" :aria-label="isEnglish ? 'Close filters' : 'إغلاق الفلاتر'" @click="filtersOpen = false">×</button></div>
          <label class="filter-label">{{ isEnglish ? 'Category' : 'الفئة' }}<select v-model.number="categoryId" @change="resetSpecifications"><option :value="0">{{ isEnglish ? 'All categories' : 'كل الفئات' }}</option><option v-for="category in categories" :key="category.id" :value="category.id">{{ localized(category) }}</option></select></label>
          <label v-if="categoryId && subCategoriesForCategory.length" class="filter-label">{{ isEnglish ? 'Product type' : 'نوع المنتج' }}<select v-model.number="subCategoryId" @change="runSearch"><option :value="0">{{ isEnglish ? 'All types' : 'كل الأنواع' }}</option><option v-for="item in subCategoriesForCategory" :key="item.id" :value="item.id">{{ localized(item) }}</option></select></label>
          <label class="filter-label">{{ isEnglish ? 'Brand' : 'العلامة التجارية' }}<select v-model.number="brandId" @change="runSearch"><option :value="0">{{ isEnglish ? 'All brands' : 'كل العلامات' }}</option><option v-for="brand in brandOptions" :key="brand.id" :value="brand.id">{{ localized(brand) }}</option></select></label>
          <section v-if="facets.price.max !== null" class="facet-block"><h3>{{ isEnglish ? 'Price range' : 'نطاق السعر' }}</h3><p class="facet-range">{{ money(facets.price.min) }} – {{ money(facets.price.max) }}</p><div class="range-fields"><label><span>{{ isEnglish ? 'From' : 'من' }}</span><input v-model.number="minPrice" type="number" :min="facets.price.min ?? undefined" :max="facets.price.max ?? undefined" @change="runSearch"></label><label><span>{{ isEnglish ? 'To' : 'إلى' }}</span><input v-model.number="maxPrice" type="number" :min="facets.price.min ?? undefined" :max="facets.price.max ?? undefined" @change="runSearch"></label></div></section>
          <label class="stock-filter"><input v-model="inStock" type="checkbox" @change="runSearch">{{ isEnglish ? 'In stock' : 'متوفر بالمخزون' }}</label>
          <label class="stock-filter"><input v-model="onSale" type="checkbox" @change="runSearch">{{ isEnglish ? 'On offer' : 'عليه عرض' }}</label>
          <section v-for="facet in facets.specifications" :key="facet.id" class="facet-block"><h3>{{ locale === 'ar' ? facet.name_ar : facet.name_en }}<small v-if="facet.unit"> ({{ facet.unit }})</small></h3>
            <template v-if="['number', 'measurement'].includes(facet.type) && facet.min !== null && facet.max !== null"><div class="range-fields"><label><span>{{ isEnglish ? 'Min' : 'أقل' }}</span><input v-model.number="specificationFilters[facet.id].min" type="number" :min="facet.min" :max="facet.max" @change="runSearch"></label><label><span>{{ isEnglish ? 'Max' : 'أعلى' }}</span><input v-model.number="specificationFilters[facet.id].max" type="number" :min="facet.min" :max="facet.max" @change="runSearch"></label></div></template>
            <label v-for="option in facet.values" :key="option.value" class="facet-option"><input type="checkbox" :checked="selected(facet.id, option.value)" @change="toggleFacet(facet.id, option.value)"><span>{{ option.value }}</span><small>{{ option.count }}</small></label>
          </section>
        </aside>
        <section class="results" aria-live="polite">
          <p v-if="error" class="error-state">{{ error }}</p><p v-else-if="loading" class="loading-state">{{ isEnglish ? 'Loading products…' : 'جارٍ تحميل المنتجات…' }}</p>
          <div v-else-if="items.length" class="product-grid"><ProductCard v-for="product in items" :key="product.id" :product="product" /></div>
          <div v-else class="empty-results"><h2>{{ isEnglish ? 'No matching products' : 'لا توجد منتجات مطابقة' }}</h2><p>{{ isEnglish ? 'Try another model number or clear some filters.' : 'جرّب موديلًا آخر أو امسح بعض الفلاتر.' }}</p><button @click="clearFilters">{{ isEnglish ? 'Clear filters' : 'مسح الفلاتر' }}</button></div>
          <nav v-if="meta.last_page > 1" class="pagination" :aria-label="isEnglish ? 'Search result pages' : 'صفحات نتائج البحث'"><button :disabled="meta.page <= 1" @click="changePage(meta.page - 1)">‹ {{ isEnglish ? 'Previous' : 'السابق' }}</button><span>{{ meta.page }} / {{ meta.last_page }}</span><button :disabled="meta.page >= meta.last_page" @click="changePage(meta.page + 1)">{{ isEnglish ? 'Next' : 'التالي' }} ›</button></nav>
        </section>
      </div>
    </div></section>
  </main>
</template>

<script setup lang="ts">
import { formatPrice } from '~/data/products'
import type { Category, Product, SubCategory } from '~/types/catalog'

type Facet = { id: number; key: string; name_en: string; name_ar: string; type: string; unit: string | null; min: number | null; max: number | null; values: Array<{ value: string; count: number }> }
const route = useRoute()
const router = useRouter()
const { locale, isEnglish } = useLocale()
const { categories, subCategories, fetchCatalog } = useCatalog()
const { request } = useApi()
const { track } = useAnalytics()
const query = ref(String(route.query.q || ''))
const categoryId = ref(Number(route.query.category_id || 0))
const subCategoryId = ref(0)
const brandId = ref(0)
const inStock = ref(false)
const sortOptions = ['relevance', 'newest', 'lowest_price', 'highest_price', 'discount', 'rating', 'popular']
const sort = ref(sortOptions.includes(String(route.query.sort)) ? String(route.query.sort) : 'relevance')
const onSale = ref(route.query.on_sale === '1')
const minPrice = ref<number | undefined>()
const maxPrice = ref<number | undefined>()
const specificationFilters = reactive<Record<number, { values: string[]; min?: number; max?: number }>>({})
const items = ref<Product[]>([])
const facets = ref<{ specifications: Facet[]; price: { min: number | null; max: number | null }; brands: Array<{ id: number; name_en: string; name_ar: string; count: number }> }>({ specifications: [], price: { min: null, max: null }, brands: [] })
const meta = ref({ page: 1, per_page: 24, total: 0, last_page: 1 })
const loading = ref(false)
const error = ref('')
const filtersOpen = ref(false)
let timer: ReturnType<typeof setTimeout> | undefined
let requestSequence = 0
let lastAnalyticsSignature = ''

const localized = (item: { name_en?: string; name_ar?: string; name?: string }) => locale.value === 'ar' ? item.name_ar || item.name : item.name_en || item.name
const subCategoriesForCategory = computed(() => subCategories.value.filter((item: SubCategory) => item.category_id === categoryId.value && !item.parent_sub_category_id))
const brandOptions = computed(() => facets.value.brands || [])
const money = (value: number | null) => value === null ? '—' : formatPrice(value, locale.value)
const selected = (id: number, value: string) => specificationFilters[id]?.values.includes(value) ?? false

const runSearch = async () => {
  const sequence = ++requestSequence
  loading.value = true
  error.value = ''
  const filters: Record<string, any> = { q: query.value.trim(), sort: sort.value, page: meta.value.page, per_page: 24 }
  if (categoryId.value) filters.category_id = categoryId.value
  if (subCategoryId.value) filters.sub_category_id = subCategoryId.value
  if (brandId.value) filters.brand_id = brandId.value
  if (inStock.value) filters.in_stock = true
  if (onSale.value) filters.on_sale = true
  if (minPrice.value !== undefined && minPrice.value !== null) filters.min_price = minPrice.value
  if (maxPrice.value !== undefined && maxPrice.value !== null) filters.max_price = maxPrice.value
  const specifications = Object.fromEntries(Object.entries(specificationFilters).filter(([, value]) => value.values.length || value.min !== undefined || value.max !== undefined))
  if (Object.keys(specifications).length) filters.specifications = specifications
  try {
    const response = await request<any>('/catalog/search', { query: filters })
    if (sequence !== requestSequence) return
    items.value = response.data.items || []
    facets.value = response.data.facets || { specifications: [], price: { min: null, max: null }, brands: [] }
    for (const facet of facets.value.specifications) specificationFilters[facet.id] ||= { values: [] }
    meta.value = response.data.meta
    const activeFilters = Object.keys(filters).filter(key => !['q', 'sort', 'page', 'per_page'].includes(key))
    const eventName = query.value.trim() ? 'search' : 'filter'
    if (query.value.trim() || activeFilters.length) {
      const signature = JSON.stringify([eventName, query.value.trim(), activeFilters.sort(), meta.value.total])
      if (signature !== lastAnalyticsSignature) {
        lastAnalyticsSignature = signature
        void track(eventName, { properties: { query: query.value.trim() || undefined, result_count: meta.value.total, filter_names: activeFilters } })
      }
    }
  } catch (exception: any) {
    if (sequence === requestSequence) error.value = exception?.data?.message || (isEnglish.value ? 'Search is temporarily unavailable.' : 'البحث غير متاح مؤقتًا.')
  } finally { if (sequence === requestSequence) loading.value = false }
}

watch([query, categoryId], () => {
  clearTimeout(timer)
  meta.value.page = 1
  timer = setTimeout(() => { if (route.query.q !== query.value || String(route.query.category_id || '') !== String(categoryId.value || '')) void router.replace({ path: '/search', query: { ...route.query, q: query.value || undefined, category_id: categoryId.value || undefined } }); else void runSearch() }, 250)
})
watch(() => route.query.q, value => { if (String(value || '') !== query.value) query.value = String(value || '') })
watch(() => route.query.category_id, value => { const id = Number(value || 0); if (id !== categoryId.value) categoryId.value = id })
watch([sort, subCategoryId, brandId, inStock], () => { meta.value.page = 1; void runSearch() })
watch(() => locale.value, () => void runSearch())
onMounted(async () => { await fetchCatalog(); await runSearch() })
onBeforeUnmount(() => clearTimeout(timer))

function submitSearch(value: string) { query.value = value; meta.value.page = 1; void router.replace({ path: '/search', query: { ...route.query, q: value || undefined } }); void runSearch() }
function resetSpecifications() { for (const key of Object.keys(specificationFilters)) delete specificationFilters[Number(key)]; subCategoryId.value = 0; void runSearch() }
function toggleFacet(id: number, value: string) {
  const filter = specificationFilters[id] ||= { values: [] }
  filter.values = filter.values.includes(value) ? filter.values.filter(item => item !== value) : [...filter.values, value]
  void runSearch()
}
function changePage(page: number) { meta.value.page = page; void runSearch(); window.scrollTo({ top: 0, behavior: 'smooth' }) }
function clearFilters() { categoryId.value = 0; subCategoryId.value = 0; brandId.value = 0; inStock.value = false; onSale.value = false; minPrice.value = undefined; maxPrice.value = undefined; for (const key of Object.keys(specificationFilters)) delete specificationFilters[Number(key)]; void router.replace('/search'); void runSearch() }

const chips = computed(() => {
  const active: Array<{ key: string; label: string; remove: () => void }> = []
  const word = isEnglish.value
  if (categoryId.value) active.push({ key: 'category', label: localized(categories.value.find((item: Category) => item.id === categoryId.value) || {}), remove: () => { categoryId.value = 0; resetSpecifications() } })
  if (subCategoryId.value) active.push({ key: 'subcategory', label: localized(subCategories.value.find((item: SubCategory) => item.id === subCategoryId.value) || {}), remove: () => { subCategoryId.value = 0; void runSearch() } })
  if (brandId.value) { const brand = brandOptions.value.find(item => item.id === brandId.value); active.push({ key: 'brand', label: word ? brand?.name_en || 'Brand' : brand?.name_ar || 'علامة تجارية', remove: () => { brandId.value = 0; void runSearch() } }) }
  if (inStock.value) active.push({ key: 'stock', label: word ? 'In stock' : 'متوفر', remove: () => { inStock.value = false; void runSearch() } })
  if (onSale.value) active.push({ key: 'sale', label: word ? 'On offer' : 'عليه عرض', remove: () => { onSale.value = false; void runSearch() } })
  if (minPrice.value !== undefined || maxPrice.value !== undefined) active.push({ key: 'price', label: `${minPrice.value ?? '0'}–${maxPrice.value ?? '∞'}`, remove: () => { minPrice.value = undefined; maxPrice.value = undefined; void runSearch() } })
  for (const facet of facets.value.specifications) {
    const selectedValues = specificationFilters[facet.id]?.values || []
    for (const value of selectedValues) active.push({ key: `spec-${facet.id}-${value}`, label: `${word ? facet.name_en : facet.name_ar}: ${value}`, remove: () => toggleFacet(facet.id, value) })
  }
  return active
})
const activeFilterCount = computed(() => chips.value.length)
</script>

<style scoped>
.section>.container>.catalog-searchbox{max-width:860px;margin:0 auto 26px}.search-toolbar{display:flex;align-items:center;justify-content:space-between;gap:16px;margin:20px 0 12px}.search-toolbar p{margin:0;color:var(--muted)}.toolbar-actions{display:flex;align-items:center;gap:12px}.toolbar-actions label{display:flex;align-items:center;gap:8px}.toolbar-actions select,.filter-label select,.range-fields input{min-height:40px;border:1px solid var(--line);border-radius:9px;background:var(--theme-surface);padding:7px 10px;color:var(--theme-text)}.filter-toggle{display:none}.active-filters{display:flex;gap:8px;flex-wrap:wrap;margin:0 0 16px}.active-filters button{border:1px solid var(--line);border-radius:999px;background:var(--theme-surface);padding:6px 11px;color:var(--theme-text);font-size:.8rem}.active-filters button span{margin-inline-start:6px}.active-filters .clear{border:0;color:var(--theme-accent);font-weight:700}.catalog-results{display:grid;grid-template-columns:260px minmax(0,1fr);gap:24px}.filters{position:sticky;top:120px;align-self:start;max-height:calc(100vh - 140px);overflow:auto;padding:18px;border:1px solid var(--line);border-radius:14px;background:var(--theme-surface)}.filter-heading{display:flex;align-items:center;justify-content:space-between}.filter-heading h2{font-size:1.1rem;margin:0 0 14px}.close-filters{display:none}.filter-label{display:grid;gap:6px;margin:0 0 14px;color:var(--muted);font-size:.83rem}.facet-block{margin:15px 0;border-top:1px solid var(--line);padding-top:12px}.facet-block h3{margin:0 0 9px;font-size:.9rem}.facet-block h3 small{color:var(--muted);font-weight:400}.facet-range{margin:0 0 8px;color:var(--muted);font-size:.78rem}.range-fields{display:flex;gap:7px}.range-fields label{min-width:0;flex:1;display:grid;gap:4px;color:var(--muted);font-size:.7rem}.range-fields input{width:100%;min-width:0;font-size:.78rem}.stock-filter,.facet-option{display:flex;align-items:center;gap:8px;margin:7px 0;font-size:.83rem}.stock-filter input,.facet-option input{accent-color:var(--theme-primary)}.facet-option span{overflow-wrap:anywhere}.facet-option small{margin-inline-start:auto;color:var(--muted)}.loading-state,.error-state{padding:60px 15px;text-align:center;color:var(--muted)}.error-state{color:#b42318}.pagination{display:flex;align-items:center;justify-content:center;gap:18px;margin:26px 0}.pagination button{min-height:40px;padding:7px 13px;border:1px solid var(--line);border-radius:9px;background:var(--theme-surface);color:var(--theme-text)}.pagination button:disabled{opacity:.45;cursor:not-allowed}.pagination span{color:var(--muted);font-variant-numeric:tabular-nums}.scrim{display:none}
.empty-results{text-align:center;padding:60px 15px}.empty-results p{color:var(--muted)}.empty-results button{border:0;border-radius:9px;background:var(--theme-primary);color:var(--theme-on-primary);padding:10px 16px}
@media(max-width:900px){.catalog-results{grid-template-columns:1fr}.filters{position:static;display:none}.filter-toggle{display:inline-flex;min-height:40px;align-items:center;gap:5px;border:1px solid var(--line);border-radius:9px;background:var(--theme-surface);padding:7px 12px;color:var(--theme-text)}.catalog-results .filters.open{display:block;position:fixed;z-index:90;top:0;bottom:0;inset-inline-start:0;width:min(380px,88vw);max-height:none;overflow:auto;border-radius:0 16px 16px 0;box-shadow:0 12px 40px #102b3a2b}.scrim{display:block;position:fixed;inset:0;z-index:89;background:#101b22a0}.close-filters{display:block;border:0;background:transparent;color:var(--theme-text);font-size:1.6rem;line-height:1}}
@media(max-width:560px){.search-toolbar{align-items:flex-start;flex-direction:column}.toolbar-actions{width:100%;justify-content:space-between}.toolbar-actions label span{display:none}.toolbar-actions select{max-width:195px}.catalog-results .filters.open{inset-inline-start:0;border-radius:0}}
</style>
