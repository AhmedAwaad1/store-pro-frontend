<template>
  <form class="catalog-searchbox" role="search" @submit.prevent="submit">
    <Search class="search-icon" :size="19" aria-hidden="true" />
    <input
      v-model="query"
      role="combobox"
      :aria-label="isEnglish ? 'Search products' : 'ابحث عن المنتجات'"
      :aria-expanded="open"
      aria-controls="catalog-search-suggestions"
      aria-autocomplete="list"
      :aria-activedescendant="activeIndex >= 0 ? `catalog-suggestion-${activeIndex}` : undefined"
      :placeholder="isEnglish ? 'Search by product, brand, model or SKU' : 'ابحث بالمنتج أو العلامة أو الموديل أو SKU'"
      autocomplete="off"
      @focus="open = true"
      @keydown.down.prevent="moveActive(1)"
      @keydown.up.prevent="moveActive(-1)"
      @keydown.esc="open = false"
    >
    <button type="submit" class="submit-search" :aria-label="isEnglish ? 'Search' : 'بحث'"><Search :size="18" /></button>
    <div v-if="open && (loading || entries.length)" id="catalog-search-suggestions" class="suggestions" role="listbox">
      <p v-if="loading" class="suggestion-status" role="status">{{ isEnglish ? 'Searching…' : 'جارٍ البحث…' }}</p>
      <template v-for="group in groups" :key="group.key">
        <p v-if="group.rows.length" class="group-label">{{ group.label }}</p>
        <button
          v-for="row in group.rows"
          :id="`catalog-suggestion-${entryIndex(row)}`"
          :key="row.key"
          type="button"
          role="option"
          :aria-selected="activeIndex === entryIndex(row)"
          :class="{ active: activeIndex === entryIndex(row) }"
          class="suggestion-row"
          @mousedown.prevent="choose(row)"
        >
          <img v-if="row.kind === 'product' && row.value.main_image_url" :src="row.value.main_image_url" alt="" loading="lazy">
          <span v-else class="suggestion-mark" aria-hidden="true">{{ row.kind === 'brand' ? 'B' : row.kind === 'category' ? 'C' : '⌕' }}</span>
          <span>{{ row.label }}</span>
          <small v-if="row.kind === 'product'">{{ row.value.model_number || row.value.sku || '' }}</small>
        </button>
      </template>
    </div>
  </form>
</template>

<script setup lang="ts">
import { Search } from 'lucide-vue-next'

type Suggestion = { key: string; kind: 'product' | 'brand' | 'category' | 'popular'; value: any; label: string }
const props = withDefaults(defineProps<{ navigateOnSubmit?: boolean }>(), { navigateOnSubmit: true })
const emit = defineEmits<{ search: [query: string] }>()
const query = defineModel<string>({ default: '' })
const { locale, isEnglish } = useLocale()
const { request } = useApi()
const result = ref<any>(null)
const loading = ref(false)
const open = ref(false)
const activeIndex = ref(-1)
let timer: ReturnType<typeof setTimeout> | undefined
let latestRequest = 0

const groups = computed(() => {
  const data = result.value || {}
  const localized = (row: any) => locale.value === 'ar' ? row.name_ar || row.name_en : row.name_en || row.name_ar
  return [
    { key: 'products', label: isEnglish.value ? 'Products' : 'المنتجات', rows: (data.products || []).map((value: any) => ({ key: `product-${value.id}`, kind: 'product' as const, value, label: localized(value) })) },
    { key: 'brands', label: isEnglish.value ? 'Brands' : 'العلامات التجارية', rows: (data.brands || []).map((value: any) => ({ key: `brand-${value.id}`, kind: 'brand' as const, value, label: localized(value) })) },
    { key: 'categories', label: isEnglish.value ? 'Categories' : 'الفئات', rows: (data.categories || []).map((value: any) => ({ key: `category-${value.id}`, kind: 'category' as const, value, label: localized(value) })) },
    { key: 'popular', label: isEnglish.value ? 'Popular searches' : 'عمليات البحث الشائعة', rows: (data.popular || []).map((value: any) => ({ key: `popular-${value.query}`, kind: 'popular' as const, value, label: value.query })) },
  ]
})
const entries = computed<Suggestion[]>(() => groups.value.flatMap(group => group.rows))
const entryIndex = (row: Suggestion) => entries.value.findIndex(item => item.key === row.key)

watch(query, (value) => {
  clearTimeout(timer)
  activeIndex.value = -1
  if (value.trim().length < 2) { result.value = null; loading.value = false; return }
  timer = setTimeout(async () => {
    const requestId = ++latestRequest
    loading.value = true
    try {
      const response = await request<any>('/catalog/search/autocomplete', { query: { q: value.trim() } })
      if (requestId === latestRequest) result.value = response.data
    } catch {
      if (requestId === latestRequest) result.value = null
    } finally {
      if (requestId === latestRequest) loading.value = false
    }
  }, 180)
})

const moveActive = (direction: number) => {
  open.value = true
  if (!entries.value.length) return
  activeIndex.value = (activeIndex.value + direction + entries.value.length) % entries.value.length
}
const choose = async (row: Suggestion) => {
  query.value = row.label
  open.value = false
  if (row.kind === 'product') await navigateTo(`/product/${row.value.id}`)
  else if (row.kind === 'brand') await navigateTo(`/brands/${row.value.slug}`)
  else if (row.kind === 'category') await navigateTo(`/category/${row.value.slug}`)
  else await navigateTo({ path: '/search', query: { q: row.label } })
}
const submit = async () => {
  const active = entries.value[activeIndex.value]
  if (active) return choose(active)
  open.value = false
  emit('search', query.value.trim())
  if (props.navigateOnSubmit && query.value.trim()) await navigateTo({ path: '/search', query: { q: query.value.trim() } })
}
onBeforeUnmount(() => clearTimeout(timer))
</script>

<style scoped>
.catalog-searchbox{position:relative;display:flex;align-items:center;gap:10px;min-width:0;height:48px;padding:0 8px 0 14px;border:1px solid var(--line);border-radius:12px;background:var(--theme-surface,#fff);color:var(--theme-text,#182631);box-shadow:0 2px 9px #132c3510}.catalog-searchbox:focus-within{border-color:var(--theme-accent,#2872c6);box-shadow:0 0 0 3px color-mix(in srgb,var(--theme-accent,#2872c6) 17%,transparent)}.search-icon{flex:none;color:var(--theme-muted,#71808b)}.catalog-searchbox input{width:100%;min-width:0;height:100%;border:0;outline:0;background:transparent;color:inherit;font-size:.88rem}.submit-search{display:grid;place-items:center;flex:none;width:34px;height:34px;border:0;border-radius:9px;background:var(--theme-primary,#153e57);color:var(--theme-on-primary,#fff)}.suggestions{position:absolute;top:calc(100% + 8px);left:0;right:0;z-index:100;max-height:min(70vh,520px);overflow:auto;padding:9px;background:var(--theme-surface,#fff);border:1px solid var(--line);border-radius:13px;box-shadow:0 16px 40px #102b3a24}.group-label{margin:8px 7px 4px;color:var(--theme-muted,#71808b);font-size:.72rem;font-weight:800}.suggestion-row{width:100%;display:flex;align-items:center;gap:10px;min-height:42px;padding:7px;border:0;border-radius:8px;background:transparent;color:inherit;text-align:start}.suggestion-row:hover,.suggestion-row.active{background:color-mix(in srgb,var(--theme-accent,#2872c6) 10%,transparent)}.suggestion-row img,.suggestion-mark{width:30px;height:30px;flex:none;object-fit:contain;border-radius:6px;background:#f1f4f6}.suggestion-mark{display:grid;place-items:center;font-size:.78rem;font-weight:800;color:var(--theme-primary,#153e57)}.suggestion-row small{margin-inline-start:auto;color:var(--theme-muted,#71808b);font-size:.7rem}.suggestion-status{margin:8px;color:var(--theme-muted,#71808b);font-size:.8rem}
</style>
