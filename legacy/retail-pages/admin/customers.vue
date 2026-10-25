<template>
  <main class="customers-page">
    <header><div><p class="eyebrow">3B / ADMIN</p><h1>Customers</h1><p>Review account activity and order history totals.</p></div><button class="button secondary" :disabled="loading" @click="load">Refresh</button></header>
    <p v-if="error" class="notice error" role="alert">{{ error }}</p>
    <section class="panel">
      <form class="search" @submit.prevent="applySearch"><label>Find a customer<input v-model.trim="searchInput" type="search" placeholder="Name, email, or phone"></label><button class="button primary" :disabled="loading">Search</button><button class="button secondary" type="button" :disabled="loading" @click="clearSearch">Clear</button></form>
      <p class="muted">{{ total }} customer accounts</p>
      <p v-if="loading" class="muted">Loading customers…</p>
      <div v-else class="table-wrap"><table><thead><tr><th>Customer</th><th>Phone</th><th>Orders</th><th>Order value</th><th>Last order</th><th>Joined</th></tr></thead><tbody>
        <tr v-for="customer in customers" :key="customer.id"><td><strong>{{ customer.username }}</strong><small>{{ customer.email }}</small></td><td>{{ customer.phone || '—' }}</td><td>{{ customer.orders_count }}</td><td>{{ money(customer.orders_total) }}</td><td>{{ dateLabel(customer.last_order_at) }}</td><td>{{ dateLabel(customer.created_at) }}</td></tr>
        <tr v-if="!customers.length"><td colspan="6" class="empty">No customer accounts matched this search.</td></tr>
      </tbody></table></div>
      <div class="pagination"><button class="button secondary" :disabled="loading || page <= 1" @click="changePage(page - 1)">Previous</button><span>Page {{ page }} of {{ totalPages }}</span><button class="button secondary" :disabled="loading || page >= totalPages" @click="changePage(page + 1)">Next</button></div>
    </section>
  </main>
</template>

<script setup lang="ts">
definePageMeta({ middleware: ['admin'], adminPermission: 'customers.manage' })

type Customer = { id: number; username: string; email: string; phone: string | null; orders_count: number; orders_total: string; last_order_at: string | null; created_at: string }
const route = useRoute()
const router = useRouter()
const { request } = useApi()
const customers = ref<Customer[]>([])
const searchInput = ref(String(route.query.search || ''))
const page = ref(Number(route.query.page || 1))
const total = ref(0)
const totalPages = ref(1)
const loading = ref(false)
const error = ref('')

function money(value: string | number) { return `${new Intl.NumberFormat('en-EG', { maximumFractionDigits: 2 }).format(Number(value || 0))} EGP` }
function dateLabel(value: string | null) { return value ? new Intl.DateTimeFormat('en-EG', { dateStyle: 'medium' }).format(new Date(value)) : '—' }

async function load() {
  loading.value = true
  error.value = ''
  try {
    const params = new URLSearchParams({ per_page: '25', page: String(route.query.page || '1') })
    if (route.query.search) params.set('search', String(route.query.search))
    const response = await request<any>(`/admin/customers?${params.toString()}`)
    const payload = response.data
    customers.value = Array.isArray(payload) ? payload : payload?.data || []
    const meta = payload?.meta || payload?.pagination || payload
    total.value = Number(meta?.total || customers.value.length)
    page.value = Number(meta?.current_page || meta?.currentPage || 1)
    totalPages.value = Number(meta?.last_page || meta?.total_pages || meta?.lastPage || 1)
  } catch (exception: any) {
    error.value = exception?.data?.message || 'Could not load customers.'
  } finally {
    loading.value = false
  }
}

async function applySearch() {
  await router.replace({ query: { ...(searchInput.value ? { search: searchInput.value } : {}), page: '1' } })
}
async function clearSearch() { searchInput.value = ''; await applySearch() }
async function changePage(nextPage: number) { await router.replace({ query: { ...route.query, page: String(nextPage) } }) }
watch(() => route.query, () => load())
onMounted(load)
</script>

<style scoped>
.customers-page{max-width:1250px;margin:0 auto;padding:32px 18px 64px;color:var(--theme-text)}header{display:flex;justify-content:space-between;align-items:center;gap:16px;margin-bottom:20px}header h1{margin:3px 0;font-size:30px}header p:last-child{margin:4px 0;color:var(--theme-muted)}.eyebrow{margin:0;color:var(--theme-primary);font-size:11px;font-weight:800;letter-spacing:.13em}.panel{padding:19px;border:1px solid var(--line);border-radius:14px;background:var(--theme-surface)}.search{display:flex;align-items:end;gap:10px;margin-bottom:10px}.search label{display:grid;flex:1;gap:6px;color:var(--theme-muted);font-size:13px}.search input{min-height:40px;padding:8px 10px;border:1px solid var(--line);border-radius:8px;background:var(--theme-surface);color:var(--theme-text);font:inherit}.button{min-height:39px;padding:8px 12px;border:1px solid var(--line);border-radius:8px;background:var(--theme-surface);color:var(--theme-text);font:inherit;font-weight:700;cursor:pointer}.button.primary{background:var(--theme-primary);border-color:var(--theme-primary);color:var(--theme-on-primary)}.button:disabled{opacity:.5}.muted,small{color:var(--theme-muted)}.table-wrap{overflow:auto}table{width:100%;border-collapse:collapse;font-size:13px}th,td{padding:11px 8px;border-bottom:1px solid var(--line);text-align:left;white-space:nowrap}th{color:var(--theme-muted);font-size:11px;text-transform:uppercase}td small{display:block;margin-top:3px}.empty{color:var(--theme-muted)}.pagination{display:flex;justify-content:space-between;align-items:center;gap:8px;margin-top:14px;color:var(--theme-muted);font-size:12px}.notice{padding:11px 13px;border-radius:9px}.notice.error{background:#fff0ef;color:#a52f28}@media(max-width:620px){header{align-items:flex-start;flex-direction:column}.search{align-items:stretch;flex-direction:column}.panel{padding:14px}}
</style>
