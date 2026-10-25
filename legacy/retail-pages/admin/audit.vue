<template>
  <main class="audit-page">
    <header><div><p class="eyebrow">3B / ADMIN</p><h1>Audit history</h1><p>Review who changed pricing, stock, order state, store settings, and administrator roles.</p></div><button class="button secondary" :disabled="loading" @click="load">Refresh</button></header>
    <p v-if="error" class="notice error" role="alert">{{ error }}</p>
    <section class="panel">
      <form class="filters" @submit.prevent="applyFilters"><label>Record type<select v-model="typeInput"><option value="">All records</option><option v-for="type in subjectTypes" :key="type" :value="type">{{ label(type) }}</option></select></label><label>Event<input v-model.trim="eventInput" placeholder="e.g. productprice.updated"></label><button class="button primary">Apply</button><button class="button secondary" type="button" @click="clearFilters">Clear</button></form>
      <p v-if="loading" class="muted">Loading audit history…</p>
      <div v-else class="table-wrap"><table><thead><tr><th>Date</th><th>Actor</th><th>Event</th><th>Record</th><th>Before</th><th>After</th></tr></thead><tbody>
        <tr v-for="entry in entries" :key="entry.id"><td>{{ dateLabel(entry.created_at) }}</td><td>{{ entry.actor }}</td><td><code>{{ entry.event }}</code></td><td>{{ label(entry.subject_type) }} #{{ entry.subject_id }}</td><td><pre>{{ formatted(entry.before) }}</pre></td><td><pre>{{ formatted(entry.after) }}</pre></td></tr>
        <tr v-if="!entries.length"><td colspan="6" class="empty">No administrator changes have been recorded.</td></tr>
      </tbody></table></div>
      <div class="pagination"><button class="button secondary" :disabled="loading || page <= 1" @click="changePage(page - 1)">Previous</button><span>Page {{ page }} of {{ totalPages }} · {{ total }} changes</span><button class="button secondary" :disabled="loading || page >= totalPages" @click="changePage(page + 1)">Next</button></div>
    </section>
  </main>
</template>

<script setup lang="ts">
definePageMeta({ middleware: ['admin'], superAdminOnly: true })

type AuditEntry = { id: number; actor: string; event: string; subject_type: string; subject_id: number | null; before: Record<string, unknown> | null; after: Record<string, unknown> | null; created_at: string }
const route = useRoute()
const router = useRouter()
const { request } = useApi()
const entries = ref<AuditEntry[]>([])
const typeInput = ref(String(route.query.subject_type || ''))
const eventInput = ref(String(route.query.event || ''))
const page = ref(Number(route.query.page || 1))
const total = ref(0)
const totalPages = ref(1)
const subjectTypes = ['Product', 'ProductPrice', 'ProductVariant', 'Promotion', 'InstallmentPlan', 'InventoryLocation', 'InventoryLevel', 'Order', 'StoreSetting', 'User']
const loading = ref(false)
const error = ref('')
function label(value: string) { return value.replaceAll('_', ' ').replaceAll('.', ' ').replace(/\b\w/g, letter => letter.toUpperCase()) }
function dateLabel(value: string) { return new Intl.DateTimeFormat('en-EG', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value)) }
function formatted(value: Record<string, unknown> | null) { return value ? JSON.stringify(value, null, 2) : '—' }
async function load() {
  loading.value = true; error.value = ''
  try {
    const params = new URLSearchParams({ per_page: '25', page: String(route.query.page || 1) })
    if (route.query.subject_type) params.set('subject_type', String(route.query.subject_type))
    if (route.query.event) params.set('event', String(route.query.event))
    const response = await request<any>(`/admin/audit-logs?${params.toString()}`)
    const data = response.data
    entries.value = data?.data || []
    page.value = Number(data?.pagination?.current_page || 1)
    total.value = Number(data?.pagination?.total || 0)
    totalPages.value = Number(data?.pagination?.total_pages || 1)
  } catch (exception: any) { error.value = exception?.data?.message || 'Could not load audit history.' }
  finally { loading.value = false }
}
async function applyFilters() { await router.replace({ query: { ...(typeInput.value ? { subject_type: typeInput.value } : {}), ...(eventInput.value ? { event: eventInput.value } : {}), page: '1' } }) }
async function clearFilters() { typeInput.value = ''; eventInput.value = ''; await applyFilters() }
async function changePage(nextPage: number) { await router.replace({ query: { ...route.query, page: String(nextPage) } }) }
watch(() => route.query, () => load())
onMounted(load)
</script>

<style scoped>
.audit-page{max-width:1500px;margin:0 auto;padding:32px 18px 64px;color:var(--theme-text)}header{display:flex;justify-content:space-between;align-items:center;gap:14px;margin-bottom:20px}header h1{margin:3px 0;font-size:30px}header p:last-child,.muted{margin:4px 0;color:var(--theme-muted)}.eyebrow{margin:0;color:var(--theme-primary);font-size:11px;font-weight:800;letter-spacing:.13em}.panel{padding:18px;border:1px solid var(--line);border-radius:14px;background:var(--theme-surface)}.filters{display:flex;align-items:end;gap:10px;flex-wrap:wrap;margin-bottom:14px}.filters label{display:grid;flex:1;gap:6px;min-width:190px;color:var(--theme-muted);font-size:13px}.filters input,.filters select{min-height:39px;padding:8px;border:1px solid var(--line);border-radius:8px;background:var(--theme-surface);color:var(--theme-text);font:inherit}.button{min-height:39px;padding:8px 12px;border:1px solid var(--line);border-radius:8px;background:var(--theme-surface);color:var(--theme-text);font:inherit;font-weight:700;cursor:pointer}.button.primary{background:var(--theme-primary);border-color:var(--theme-primary);color:var(--theme-on-primary)}.button:disabled{opacity:.5}.table-wrap{overflow:auto}table{width:100%;border-collapse:collapse;font-size:12px}th,td{padding:10px 8px;border-bottom:1px solid var(--line);text-align:left;vertical-align:top}th{color:var(--theme-muted);font-size:11px;text-transform:uppercase}pre{max-width:300px;max-height:120px;overflow:auto;margin:0;white-space:pre-wrap;overflow-wrap:anywhere;color:var(--theme-muted)}code{overflow-wrap:anywhere}.empty{color:var(--theme-muted)}.pagination{display:flex;justify-content:space-between;align-items:center;gap:8px;margin-top:14px;color:var(--theme-muted);font-size:12px}.notice{padding:11px 13px;border-radius:9px}.notice.error{background:#fff0ef;color:#a52f28}@media(max-width:620px){header{align-items:flex-start;flex-direction:column}.filters{align-items:stretch;flex-direction:column}.filters>*{width:100%}.panel{padding:14px}}
</style>
