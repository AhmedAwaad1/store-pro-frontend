<template>
  <main class="compare-page">
    <PageHero :eyebrow="isEnglish ? 'PRODUCT COMPARISON' : 'مقارنة المنتجات'" :title="isEnglish ? 'Compare products side by side' : 'قارن المنتجات جنبًا إلى جنب'" :description="isEnglish ? 'Review the technical details that matter before choosing.' : 'راجع المواصفات الفنية المهمة قبل الاختيار.'" />
    <section class="section"><div class="container">
      <p v-if="error" class="compare-error" role="alert">{{ error }}</p>
      <p v-if="loading" class="compare-state" role="status">{{ isEnglish ? 'Loading comparison…' : 'جارٍ تحميل المقارنة…' }}</p>
      <div v-else-if="productIds.length < 2" class="compare-empty"><GitCompareArrows :size="36"/><h2>{{ isEnglish ? 'Add at least two products' : 'أضف منتجين على الأقل' }}</h2><p>{{ isEnglish ? 'Choose products from a category and use the compare button on their cards.' : 'اختر منتجات من إحدى الفئات واستخدم زر المقارنة على بطاقاتها.' }}</p><NuxtLink class="button" to="/products">{{ isEnglish ? 'Browse products' : 'تصفح المنتجات' }}</NuxtLink></div>
      <div v-else-if="comparison" class="comparison-scroll"><table class="comparison-table"><thead><tr><th class="spec-column">{{ isEnglish ? 'Product details' : 'تفاصيل المنتج' }}</th><th v-for="product in comparison.products" :key="product.id" class="product-column"><div class="product-heading"><NuxtLink :to="`/product/${product.id}`"><img v-if="product.image_url" :src="product.image_url" :alt="label(product)" loading="lazy"><strong>{{ label(product) }}</strong></NuxtLink><span>{{ product.brand ? (locale === 'ar' ? product.brand.name_ar : product.brand.name_en) : '' }}</span><small>{{ product.model_number || product.sku }}</small><span v-if="product.price" class="compare-price">{{ formatPrice(product.price, locale) }} {{ product.currency }}</span><button @click="remove(product.id)">{{ isEnglish ? 'Remove' : 'إزالة' }}</button></div></th></tr></thead>
          <tbody><tr><th>{{ isEnglish ? 'Average rating' : 'متوسط التقييم' }}</th><td v-for="product in comparison.products" :key="product.id">{{ product.avg_rating || '—' }}</td></tr>
            <tr v-for="specification in comparison.specifications" :key="specification.specification_id"><th>{{ locale === 'ar' ? specification.name_ar : specification.name_en }}<small v-if="specification.unit"> ({{ specification.unit }})</small></th><td v-for="product in comparison.products" :key="product.id">{{ displayValue(specification.values[product.id]) }}</td></tr>
          </tbody></table></div>
      <div v-if="productIds.length && productIds.length < 4" class="compare-actions"><NuxtLink to="/products">{{ isEnglish ? 'Add another product' : 'أضف منتجًا آخر' }}</NuxtLink><button @click="clear">{{ isEnglish ? 'Clear comparison' : 'مسح المقارنة' }}</button></div>
    </div></section>
  </main>
</template>

<script setup lang="ts">
import { GitCompareArrows } from 'lucide-vue-next'
import { formatPrice } from '~/data/products'

const { locale, isEnglish } = useLocale()
const { request } = useApi()
const { track } = useAnalytics()
const { productIds, remove: removeProduct, clear } = useComparison()
const comparison = ref<any>(null)
const loading = ref(false)
const error = ref('')
let sequence = 0
const label = (product: any) => locale.value === 'ar' ? product.name_ar || product.name_en : product.name_en || product.name_ar
const displayValue = (value: unknown) => value === null || value === undefined || value === '' ? '—' : Array.isArray(value) ? value.join(', ') : String(value)

async function loadComparison() {
  const current = ++sequence
  comparison.value = null
  error.value = ''
  if (productIds.value.length < 2) return
  loading.value = true
  try {
    const response = await request<any>('/catalog/compare', { method: 'POST', body: { product_ids: productIds.value } })
    if (current === sequence) {
      comparison.value = response.data
      void track('compare', { product_id: productIds.value[0], properties: { filter_names: productIds.value.map(id => `product:${id}`) } })
    }
  } catch (exception: any) {
    if (current === sequence) error.value = exception?.data?.message || (isEnglish.value ? 'These products cannot be compared.' : 'تعذرت مقارنة هذه المنتجات.')
  } finally { if (current === sequence) loading.value = false }
}
function remove(id: number) { removeProduct(id); void loadComparison() }
watch(productIds, () => void loadComparison())
onMounted(() => void loadComparison())
</script>

<style scoped>
.compare-page{min-height:65vh}.compare-state,.compare-error,.compare-empty{padding:56px 16px;text-align:center;color:var(--muted)}.compare-error{color:#b42318}.compare-empty svg{color:var(--theme-accent)}.compare-empty h2{margin:10px 0 3px;color:var(--theme-text)}.compare-empty p{max-width:540px;margin:0 auto 18px}.button{display:inline-flex;padding:10px 16px;border-radius:9px;background:var(--theme-primary);color:var(--theme-on-primary)}.comparison-scroll{overflow:auto;border:1px solid var(--line);border-radius:14px;background:var(--theme-surface)}.comparison-table{width:100%;min-width:680px;border-collapse:separate;border-spacing:0}.comparison-table th,.comparison-table td{min-width:190px;padding:14px;border-bottom:1px solid var(--line);border-inline-end:1px solid var(--line);text-align:start;vertical-align:top}.comparison-table thead th{position:sticky;top:0;z-index:2;background:var(--theme-surface)}.comparison-table .spec-column{position:sticky;inset-inline-start:0;z-index:3;width:190px;min-width:190px;vertical-align:bottom}.comparison-table tbody th{position:sticky;inset-inline-start:0;z-index:1;background:var(--theme-surface);font-size:.88rem}.comparison-table tbody th small{color:var(--muted);font-weight:400}.comparison-table td{color:var(--theme-text);font-size:.88rem}.product-heading{display:grid;justify-items:start;gap:5px}.product-heading>a{display:grid;gap:8px}.product-heading img{width:120px;height:105px;object-fit:contain;border-radius:8px;background:#f3f5f6}.product-heading strong{max-width:220px;line-height:1.4}.product-heading>span,.product-heading small{color:var(--muted);font-size:.78rem}.product-heading .compare-price{color:var(--theme-primary);font-weight:800;font-size:1rem}.product-heading button,.compare-actions button{border:0;background:transparent;color:var(--theme-accent);padding:3px 0;font-size:.8rem}.compare-actions{display:flex;justify-content:space-between;margin:14px 3px}.compare-actions a{color:var(--theme-accent);font-weight:700}
</style>
