<template>
  <main class="imports-page">
    <header class="page-heading">
      <div><p class="eyebrow">3B / ADMIN</p><h1>Catalog imports</h1><p>Stage catalog records and validate them before they change the store.</p></div>
      <div class="actions"><button class="button secondary" :disabled="busy" @click="downloadTemplate">Download {{ typeLabel }} template</button></div>
    </header>

    <p v-if="error" class="notice error" role="alert">{{ error }}</p>
    <p v-if="notice" class="notice success" role="status">{{ notice }}</p>

    <section class="panel upload-panel">
      <h2>Upload {{ typeLabel.toLowerCase() }} data</h2>
      <p class="muted">Rows are staged, validated, previewed, and applied asynchronously. Import batches never delete records omitted from a file.</p>
      <form @submit.prevent="upload">
        <label>Data type<select v-model="importType"><option value="products">Products, variants, prices and stock</option><option value="brands">Brands</option><option value="categories">Categories and subcategories</option><option value="media">Product images and documents</option><option value="relationships">Product relationships</option></select></label>
        <label>CSV file<input type="file" accept=".csv,text/csv" @change="selectFile"></label>
        <button class="button primary" :disabled="busy || !file">{{ busy && !batch ? 'Uploading…' : 'Upload and validate' }}</button>
      </form>
      <details v-if="importType === 'products'"><summary>Product fields and variant format</summary><p>Product rows support stable external IDs, SKUs, bilingual titles and descriptions, category and brand slugs, EGP prices, typed specification JSON, warranty references, localized highlights and box contents, country of origin, lifecycle state, installation handling, and variant JSON.</p><p>Stock fields require inventory permission. Product-level and variant-level stock cannot be mixed in one row. Blank optional cells preserve existing details.</p><pre>[{"external_id":"supplier-variant-1","sku":"TV-55-SILVER","price":12500,"options":{"Color":{"value_en":"Silver","value_ar":"فضي","hex_code":"#C4CAD2"}},"inventory":[{"inventory_location_id":1,"on_hand":12}]}]</pre><p>Variant option types must already exist in catalog settings. Each variant external ID is stable across reimports. Omitted variants are retained; stock entries set absolute branch quantities and record audited movements.</p></details>
      <details v-else-if="importType === 'brands'"><summary>Brand fields</summary><p>Brand imports use a stable slug with English and Arabic names, descriptions, website, featured and active flags, sort order, and localized SEO metadata. Blank optional text preserves existing copy. Logo files can be uploaded through the brand editor.</p></details>
      <details v-else-if="importType === 'categories'"><summary>Category fields</summary><p>Each category CSV row can define one category and one subcategory. Repeat the same category details for each subcategory. Categories and subcategories use stable slugs; omitted records are retained. Category and subcategory images can be uploaded through the taxonomy editor.</p></details>
      <details v-else-if="importType === 'media'"><summary>Image and document fields</summary><p>Upload files through the product editor first, then use their existing storage paths in this manifest. It accepts product image paths under <code>products/</code> or generated demo paths under <code>demo/catalog/</code>; documents must be under that product's <code>products/{id}/documents/</code> folder. The importer never downloads URLs or deletes omitted assets. Use a stable asset_external_id to update the same image or document.</p><p>Set asset_type to image or document. Image rows support variant_external_id, role, localized alt/caption, and is_main. Document rows require document_type and bilingual titles, and support sort_order and is_public.</p></details>
      <details v-else><summary>Product relationship fields</summary><p>Use stable product external IDs for both products. Relationship types are related, compatible, accessory, alternative, and bundle. Reimports update the matching relationship and its display order; omitted links are retained.</p></details>
    </section>

    <section v-if="batch" class="panel batch-panel">
      <div class="batch-heading"><div><p class="eyebrow">IMPORT BATCH</p><h2>{{ batch.source_name }}</h2></div><span class="status" :class="`status-${batch.status}`">{{ label(batch.status) }}</span></div>
      <p v-if="batch.error_message" class="notice error">{{ batch.error_message }}</p>
      <dl class="counts"><div><dt>Rows</dt><dd>{{ batch.total_rows }}</dd></div><div><dt>Valid</dt><dd>{{ batch.valid_rows }}</dd></div><div><dt>Errors</dt><dd>{{ batch.error_rows }}</dd></div><div><dt>Applied</dt><dd>{{ batch.applied_rows }}</dd></div><div><dt>New records</dt><dd>{{ batch.summary?.creates ?? 0 }}</dd></div><div><dt>Updates</dt><dd>{{ batch.summary?.updates ?? 0 }}</dd></div></dl>
      <p v-if="['queued', 'validating', 'applying'].includes(batch.status)" class="muted" role="status">{{ batch.status === 'applying' ? 'Applying validated rows. Progress updates automatically.' : 'Validation is running in the background.' }}</p>
      <div class="actions">
        <button v-if="batch.status === 'preview_ready'" class="button primary" :disabled="busy" @click="applyImport">Apply validated import</button>
        <button v-if="batch.status === 'failed'" class="button secondary" :disabled="busy" @click="retryImport">Retry batch</button>
        <button v-if="batch.error_rows > 0" class="button secondary" :disabled="busy" @click="downloadErrorReport">Download row errors</button>
      </div>

      <div v-if="preview.length" class="table-scroll">
        <h3>Validation preview (first {{ preview.length }} rows)</h3>
        <table><thead><tr><th>Row</th><th>External ID / SKU</th><th>Name / asset / link</th><th v-if="batch.type === 'products'">Variants</th><th>Action</th><th>Validation</th></tr></thead><tbody>
          <tr v-for="row in preview" :key="row.source_row"><td>{{ row.source_row }}</td><td>{{ row.sku || row.external_id || '—' }}</td><td>{{ row.name_en || '—' }}</td><td v-if="batch.type === 'products'">{{ row.variant_count ?? 0 }}</td><td>{{ label(row.action || row.status) }}</td><td><ul v-if="Object.keys(row.errors).length"><li v-for="(messages, field) in row.errors" :key="field"><strong>{{ field }}:</strong> {{ messages.join(' ') }}</li></ul><span v-else class="valid">Ready</span></td></tr>
        </tbody></table>
      </div>
    </section>
  </main>
</template>

<script setup lang="ts">
definePageMeta({ middleware: ['admin'], adminPermission: 'catalog.import' })

type ImportBatch = {
  id: string
  type: string
  source_name: string
  status: string
  total_rows: number
  valid_rows: number
  error_rows: number
  applied_rows: number
  summary?: { creates?: number; updates?: number } | null
  error_message?: string | null
}

const { request } = useApi()
const config = useRuntimeConfig()
const importType = ref<'products' | 'brands' | 'categories' | 'media' | 'relationships'>('products')
const file = ref<File | null>(null)
const batch = ref<ImportBatch | null>(null)
const preview = ref<any[]>([])
const error = ref('')
const notice = ref('')
const busy = ref(false)
let pollTimer: ReturnType<typeof setTimeout> | undefined

const typeLabel = computed(() => ({ products: 'Product', brands: 'Brand', categories: 'Category', media: 'Media and document', relationships: 'Product relationship' })[importType.value])
function label(value: string) { return value.replaceAll('_', ' ').replace(/\b\w/g, letter => letter.toUpperCase()) }
function selectFile(event: Event) { file.value = (event.target as HTMLInputElement).files?.[0] ?? null }

async function download(path: string, name: string) {
  const response = await fetch(`${config.public.apiBase}${path}`, {
    credentials: 'include',
    headers: { Accept: 'text/csv' },
  })
  if (!response.ok) throw new Error('The requested file could not be downloaded.')
  const objectUrl = URL.createObjectURL(await response.blob())
  const link = document.createElement('a')
  link.href = objectUrl
  link.download = name
  link.click()
  URL.revokeObjectURL(objectUrl)
}

async function downloadTemplate() {
  try { await download(`/admin/imports/${importType.value}/template`, `3b-${importType.value}-import-template.csv`) }
  catch (exception: any) { error.value = exception?.message || 'Could not download the CSV template.' }
}

async function upload() {
  if (!file.value) return
  busy.value = true
  error.value = ''
  notice.value = ''
  preview.value = []
  const form = new FormData()
  form.append('file', file.value)
  try {
    const response = await request<ImportBatch>(`/admin/imports/${importType.value}`, { method: 'POST', body: form })
    batch.value = response.data
    await poll()
  } catch (exception: any) {
    error.value = exception?.data?.message || 'Could not upload this import file.'
  } finally {
    busy.value = false
  }
}

async function poll() {
  if (!batch.value) return
  try {
    const response = await request<ImportBatch>(`/admin/imports/${batch.value.id}`)
    batch.value = response.data
    if (['queued', 'validating', 'applying'].includes(batch.value.status)) {
      pollTimer = setTimeout(poll, 2000)
      return
    }
    if (['preview_ready', 'invalid'].includes(batch.value.status)) {
      const result = await request<any>(`/admin/imports/${batch.value.id}/preview`)
      preview.value = result.data.rows || []
    }
  } catch (exception: any) {
    error.value = exception?.data?.message || 'Could not refresh import status.'
  }
}

async function applyImport() {
  if (!batch.value) return
  busy.value = true
  error.value = ''
  try {
    batch.value = (await request<ImportBatch>(`/admin/imports/${batch.value.id}/apply`, { method: 'POST' })).data
    await poll()
  } catch (exception: any) {
    error.value = exception?.data?.message || 'Could not apply the validated import.'
  } finally {
    busy.value = false
  }
}

async function retryImport() {
  if (!batch.value) return
  busy.value = true
  error.value = ''
  try {
    batch.value = (await request<ImportBatch>(`/admin/imports/${batch.value.id}/retry`, { method: 'POST' })).data
    await poll()
  } catch (exception: any) {
    error.value = exception?.data?.message || 'Could not retry this import.'
  } finally {
    busy.value = false
  }
}

async function downloadErrorReport() {
  if (!batch.value) return
  try { await download(`/admin/imports/${batch.value.id}/errors`, `3b-import-errors-${batch.value.id}.csv`) }
  catch (exception: any) { error.value = exception?.message || 'Could not download the validation report.' }
}

onScopeDispose(() => { if (pollTimer) clearTimeout(pollTimer) })
</script>

<style scoped>
.imports-page{max-width:1180px;margin:0 auto;padding:32px 18px 64px;color:var(--theme-text)}.page-heading,.batch-heading,.actions{display:flex;align-items:center;justify-content:space-between;gap:12px}.page-heading{margin-bottom:20px}.page-heading h1{margin:3px 0;font-size:30px}.page-heading p:last-child,.muted{color:var(--theme-muted)}.eyebrow{margin:0;color:var(--theme-primary);font-size:11px;font-weight:800;letter-spacing:.13em}.panel{background:var(--theme-surface);border:1px solid var(--line);border-radius:14px;padding:20px;margin:16px 0}.panel h2{margin:4px 0 8px}.panel h3{margin:18px 0 10px}.upload-panel form{display:flex;align-items:end;gap:12px;flex-wrap:wrap}.upload-panel label{display:grid;gap:6px;min-width:240px;color:var(--theme-muted)}input[type=file]{max-width:100%;padding:8px;border:1px solid var(--line);border-radius:8px}.button{min-height:40px;padding:8px 13px;border:1px solid var(--line);border-radius:8px;background:var(--theme-surface);color:var(--theme-text);font:inherit;font-weight:700;cursor:pointer}.button.primary{background:var(--theme-primary);border-color:var(--theme-primary);color:var(--theme-on-primary)}.button:disabled{opacity:.55;cursor:not-allowed}details{margin-top:16px;color:var(--theme-muted)}summary{cursor:pointer;font-weight:700}details p{overflow-wrap:anywhere;font-size:13px}code{background:color-mix(in srgb,var(--theme-primary) 8%,transparent);padding:2px 4px;border-radius:4px}.notice{padding:11px 13px;border-radius:9px}.notice.error{background:#fff0ef;color:#a52f28}.notice.success{background:#e5f6ec;color:#087443}.status{padding:5px 9px;border-radius:99px;background:#eef2f6;font-size:12px;font-weight:750}.status-completed,.valid{color:#087443}.status-invalid,.status-failed{color:#a52f28}.counts{display:grid;grid-template-columns:repeat(6,minmax(80px,1fr));gap:10px;margin:18px 0}.counts div{padding:10px;border:1px solid var(--line);border-radius:9px}.counts dt{color:var(--theme-muted);font-size:12px}.counts dd{margin:4px 0 0;font-weight:800}.table-scroll{overflow:auto;margin-top:18px}table{width:100%;border-collapse:collapse;font-size:13px}th,td{padding:10px;text-align:left;vertical-align:top;border-bottom:1px solid var(--line)}th{color:var(--theme-muted);font-size:11px;text-transform:uppercase}td ul{margin:0;padding-left:18px;color:#a52f28}.actions{justify-content:flex-start;flex-wrap:wrap}@media(max-width:640px){.page-heading,.batch-heading{align-items:flex-start;flex-direction:column}.counts{grid-template-columns:repeat(3,minmax(70px,1fr))}.panel{padding:15px}}
</style>
