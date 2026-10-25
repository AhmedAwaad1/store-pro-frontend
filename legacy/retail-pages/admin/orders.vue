<template>
  <main class="orders-page">
    <header class="page-heading">
      <div><p class="eyebrow">3B / ADMIN</p><h1>Orders</h1><p>Review customer orders, payment state, fulfillment, and shipment details.</p></div>
      <div class="export-actions">
        <button class="button secondary" :disabled="loading || exportBusy" @click="startExport">{{ exportBusy ? 'Preparing export…' : 'Export filtered orders' }}</button>
        <button v-if="exportState?.status === 'completed'" class="button primary" @click="downloadExport">Download {{ exportState.rows_count }} rows</button>
      </div>
    </header>

    <p v-if="error" class="notice error" role="alert">{{ error }}</p>
    <p v-if="notice" class="notice success" role="status">{{ notice }}</p>
    <p v-if="exportState && exportState.status !== 'completed'" class="muted" role="status">Order export: {{ exportState.status }}<span v-if="exportState.status === 'failed'"> — {{ exportState.error_message }}</span></p>
    <p v-if="exportError" class="notice error" role="alert">{{ exportError }}</p>

    <section class="panel filters">
      <form @submit.prevent="applyFilters">
        <label>Search order or customer<input v-model.trim="searchInput" type="search" placeholder="Order number, name, phone, email"></label>
        <label>Status<select v-model="statusInput"><option value="">All statuses</option><option v-for="status in statuses" :key="status" :value="status">{{ label(status) }}</option></select></label>
        <button class="button primary" :disabled="loading">Apply filters</button>
        <button class="button secondary" type="button" :disabled="loading" @click="resetFilters">Clear</button>
      </form>
    </section>

    <div class="orders-layout">
      <section class="panel table-panel">
        <div class="section-heading"><div><h2>Customer orders</h2><p>{{ pagination.total }} matching orders</p></div><button class="button secondary" :disabled="loading" @click="loadOrders">Refresh</button></div>
        <p v-if="loading" class="muted">Loading orders…</p>
        <div v-else class="table-scroll"><table><thead><tr><th>Order</th><th>Customer</th><th>Date</th><th>Payment</th><th>Status</th><th>Total</th></tr></thead><tbody>
          <tr v-for="order in orders" :key="order.id" :class="{ selected: selectedOrder?.id === order.id }" tabindex="0" @click="selectOrder(order.id)" @keydown.enter="selectOrder(order.id)">
            <td><strong>{{ order.order_number }}</strong><small>#{{ order.id }}</small></td>
            <td>{{ order.user_name || order.address?.name || 'Guest checkout' }}<small>{{ order.address?.phone || order.user?.phone || '' }}</small></td>
            <td>{{ dateLabel(order.created_at) }}</td>
            <td>{{ order.payment_method }}<small>{{ order.payment_status }}</small></td>
            <td><span class="status" :class="`status-${order.status}`">{{ label(order.status) }}</span></td>
            <td>{{ money(order.grand_total) }}</td>
          </tr>
          <tr v-if="!orders.length"><td colspan="6" class="empty">No orders match these filters.</td></tr>
        </tbody></table></div>
        <div class="pagination"><button class="button secondary" :disabled="loading || pagination.current_page <= 1" @click="changePage(pagination.current_page - 1)">Previous</button><span>Page {{ pagination.current_page }} of {{ pagination.total_pages }}</span><button class="button secondary" :disabled="loading || pagination.current_page >= pagination.total_pages" @click="changePage(pagination.current_page + 1)">Next</button></div>
      </section>

      <section class="panel detail-panel">
        <div v-if="detailLoading" class="muted">Loading order details…</div>
        <div v-else-if="!selectedOrder" class="empty-detail"><h2>Select an order</h2><p>Choose a row to inspect its items and update its operational status.</p></div>
        <template v-else>
          <div class="section-heading"><div><p class="eyebrow">ORDER {{ selectedOrder.order_number }}</p><h2>Order details</h2></div><span class="status" :class="`status-${selectedOrder.status}`">{{ label(selectedOrder.status) }}</span></div>
          <dl class="summary">
            <div><dt>Customer</dt><dd>{{ selectedOrder.user_name || selectedOrder.user?.username || 'Guest checkout' }}</dd></div>
            <div><dt>Email</dt><dd>{{ selectedOrder.user?.email || selectedOrder.address?.email || '—' }}</dd></div>
            <div><dt>Phone</dt><dd>{{ selectedOrder.address?.phone || selectedOrder.user?.phone || '—' }}</dd></div>
            <div><dt>Payment</dt><dd>{{ selectedOrder.payment_method }} · {{ selectedOrder.payment_status }}</dd></div>
            <div><dt>Fulfillment</dt><dd>{{ selectedOrder.fulfillment?.method }}<span v-if="selectedOrder.fulfillment?.branch"> · {{ selectedOrder.fulfillment.branch.name }}</span></dd></div>
            <div><dt>Address</dt><dd>{{ deliveryAddress }}</dd></div>
            <div v-if="selectedOrder.shipment"><dt>Shipment</dt><dd>{{ selectedOrder.shipment.carrier }} · {{ selectedOrder.shipment.status || 'pending' }}<span v-if="selectedOrder.shipment.tracking_number"> · {{ selectedOrder.shipment.tracking_number }}</span></dd></div>
            <div><dt>Placed</dt><dd>{{ dateLabel(selectedOrder.created_at) }}</dd></div>
          </dl>

          <h3>Items</h3>
          <ul class="items"><li v-for="item in selectedOrder.order_items || []" :key="item.id"><span>{{ item.name || item.product_name || item.product?.name || 'Product' }} <small>× {{ item.quantity }}</small></span><strong>{{ money(item.total_price ?? Number(item.unit_price || 0) * Number(item.quantity || 1)) }}</strong></li></ul>
          <div class="totals"><p><span>Subtotal</span><strong>{{ money(selectedOrder.subtotal) }}</strong></p><p v-if="Number(selectedOrder.discount_amount)"><span>Discount</span><strong>−{{ money(selectedOrder.discount_amount) }}</strong></p><p><span>Shipping</span><strong>{{ money(selectedOrder.shipping_price) }}</strong></p><p class="grand-total"><span>Total</span><strong>{{ money(selectedOrder.grand_total) }}</strong></p></div>

          <form class="status-form" @submit.prevent="saveStatus">
            <h3>Update order status</h3>
            <label>Status<select v-model="statusEdit"><option v-for="status in statuses" :key="status" :value="status">{{ label(status) }}</option></select></label>
            <label v-if="needsCodConfirmation" class="confirm"><input v-model="confirmCodCollection" type="checkbox"> I confirmed that the card payment is unpaid and the customer will pay {{ money(selectedOrder.cod_collection?.amount || selectedOrder.grand_total) }} in cash on delivery.</label>
            <p v-if="needsCodConfirmation" class="muted">{{ selectedOrder.cod_collection?.notice }}</p>
            <button class="button primary" :disabled="saving || (needsCodConfirmation && !confirmCodCollection)">{{ saving ? 'Saving…' : 'Save status' }}</button>
          </form>
        </template>
      </section>
    </div>
  </main>
</template>

<script setup lang="ts">
definePageMeta({ middleware: ['admin'], adminPermission: 'orders.manage' })

type Pagination = { total: number; current_page: number; total_pages: number }
type AdminOrder = {
  id: number; order_number: string; subtotal: string; discount_amount: string; shipping_price: string; grand_total: string
  payment_method: string; payment_status: string; status: string; created_at: string; user_name?: string | null
  user?: { username?: string; email?: string; phone?: string } | null
  address?: { name?: string; phone?: string; email?: string; address?: string; city?: { name?: string }; district?: { name?: string } } | null
  fulfillment?: { method?: string; branch?: { name: string } | null }
  shipment?: { carrier?: string; status?: string; tracking_number?: string | null } | null
  cod_collection?: { requires_confirmation?: boolean; notice?: string; amount?: string }
  order_items?: Array<{ id: number; name?: string; product_name?: string; quantity: number; unit_price?: number | string; total_price?: number | string; product?: { name?: string } }>
}

const statuses = ['pending', 'processing', 'approved', 'out_for_delivery', 'delivered', 'cancelled', 'returned', 'shipped']
const route = useRoute()
const router = useRouter()
const { request } = useApi()
const { current: exportState, busy: exportBusy, error: exportError, start: startAdminExport, download: downloadAdminExport } = useAdminExport()
const orders = ref<AdminOrder[]>([])
const selectedOrder = ref<AdminOrder | null>(null)
const pagination = ref<Pagination>({ total: 0, current_page: 1, total_pages: 1 })
const searchInput = ref(String(route.query.search || ''))
const statusInput = ref(String(route.query.status || ''))
const statusEdit = ref('')
const confirmCodCollection = ref(false)
const loading = ref(false)
const detailLoading = ref(false)
const saving = ref(false)
const error = ref('')
const notice = ref('')
const needsCodConfirmation = computed(() => statusEdit.value === 'approved' && Boolean(selectedOrder.value?.cod_collection?.requires_confirmation))
const deliveryAddress = computed(() => {
  const address = selectedOrder.value?.address
  if (!address) return selectedOrder.value?.fulfillment?.branch?.name || '—'
  return [address.address, address.district?.name, address.city?.name].filter(Boolean).join(', ') || '—'
})
function label(status: string) { return status.replaceAll('_', ' ').replace(/\b\w/g, value => value.toUpperCase()) }
function money(value: string | number | null | undefined) { return `${new Intl.NumberFormat('en-EG', { maximumFractionDigits: 2 }).format(Number(value || 0))} EGP` }
function dateLabel(value: string) { return value ? new Intl.DateTimeFormat('en-EG', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value)) : '—' }

async function loadOrders() {
  loading.value = true
  error.value = ''
  try {
    const params = new URLSearchParams({ per_page: '20', page: String(route.query.page || '1') })
    if (route.query.search) params.set('search', String(route.query.search))
    if (route.query.status) params.set('status', String(route.query.status))
    const response = await request<any>(`/admin/order?${params.toString()}`)
    const payload = response.data
    orders.value = Array.isArray(payload) ? payload : payload?.data || []
    pagination.value = payload?.pagination || { total: orders.value.length, current_page: 1, total_pages: 1 }
  } catch (exception: any) {
    error.value = exception?.data?.message || 'Could not load orders.'
  } finally {
    loading.value = false
  }
}

async function selectOrder(id: number) {
  if (selectedOrder.value && statusEdit.value !== selectedOrder.value.status && !window.confirm('Discard the unsaved order status change?')) return

  detailLoading.value = true
  error.value = ''
  try {
    selectedOrder.value = (await request<AdminOrder>(`/admin/order/${id}`)).data
    statusEdit.value = selectedOrder.value.status
    confirmCodCollection.value = false
  } catch (exception: any) {
    error.value = exception?.data?.message || 'Could not load this order.'
  } finally {
    detailLoading.value = false
  }
}

async function saveStatus() {
  if (!selectedOrder.value) return
  saving.value = true
  error.value = ''
  notice.value = ''
  try {
    await request(`/admin/order/${selectedOrder.value.id}`, {
      method: 'PUT',
      body: { status: statusEdit.value, confirm_cod_collection: confirmCodCollection.value },
    })
    notice.value = `Order ${selectedOrder.value.order_number} updated.`
    selectedOrder.value.status = statusEdit.value
    await Promise.all([loadOrders(), selectOrder(selectedOrder.value.id)])
  } catch (exception: any) {
    error.value = exception?.data?.message || 'Could not update the order.'
  } finally {
    saving.value = false
  }
}

async function applyFilters() {
  const query: Record<string, string> = { page: '1' }
  if (searchInput.value) query.search = searchInput.value
  if (statusInput.value) query.status = statusInput.value
  await router.replace({ query })
}

async function resetFilters() {
  searchInput.value = ''
  statusInput.value = ''
  await router.replace({ query: { page: '1' } })
}

async function changePage(page: number) {
  await router.replace({ query: { ...route.query, page: String(page) } })
}

watch(() => route.query, () => loadOrders())
onMounted(loadOrders)

onBeforeRouteLeave(() => {
  if (selectedOrder.value && statusEdit.value !== selectedOrder.value.status && !saving.value) {
    return window.confirm('Discard the unsaved order status change?')
  }
})

async function startExport() {
  try {
    const filters: Record<string, string> = {}
    if (route.query.search) filters.search = String(route.query.search)
    if (route.query.status) filters.status = String(route.query.status)
    await startAdminExport('/admin/order/export', '/admin/order/exports', filters)
  } catch (exception: any) {
    error.value = exception?.data?.message || 'Could not start the order export.'
  }
}

async function downloadExport() {
  try { await downloadAdminExport('/admin/order/exports') }
  catch (exception: any) { error.value = exception?.message || 'Could not download the order export.' }
}
</script>

<style scoped>
.orders-page{max-width:1500px;margin:0 auto;padding:32px 18px 64px;color:var(--theme-text)}.page-heading,.section-heading{display:flex;justify-content:space-between;align-items:center;gap:16px}.page-heading{margin-bottom:20px}.page-heading h1{margin:3px 0;font-size:30px}.page-heading p:last-child,.section-heading p{margin:4px 0;color:var(--theme-muted)}.eyebrow{margin:0;color:var(--theme-primary);font-size:11px;font-weight:800;letter-spacing:.13em}.panel{background:var(--theme-surface);border:1px solid var(--line);border-radius:14px;padding:18px}.filters{margin-bottom:16px}.filters form{display:flex;align-items:end;gap:12px;flex-wrap:wrap}.filters label,.status-form>label{display:grid;gap:6px;min-width:190px;flex:1;color:var(--theme-muted);font-size:13px}.filters input,.filters select,.status-form select{min-height:40px;border:1px solid var(--line);border-radius:8px;padding:8px 10px;background:var(--theme-surface);color:var(--theme-text);font:inherit}.button{display:inline-flex;align-items:center;justify-content:center;min-height:39px;padding:8px 12px;border:1px solid var(--line);border-radius:8px;background:var(--theme-surface);color:var(--theme-text);font:inherit;font-weight:700;text-decoration:none;cursor:pointer}.button:disabled{opacity:.5;cursor:not-allowed}.button.primary{background:var(--theme-primary);border-color:var(--theme-primary);color:var(--theme-on-primary)}.orders-layout{display:grid;grid-template-columns:minmax(0,1.2fr) minmax(360px,.8fr);gap:16px;align-items:start}.table-panel{min-width:0}.section-heading{margin-bottom:12px}.section-heading h2{margin:0;font-size:19px}.section-heading p{font-size:13px}.table-scroll{overflow:auto}table{width:100%;border-collapse:collapse;font-size:13px}th,td{text-align:left;padding:10px 8px;border-bottom:1px solid var(--line);white-space:nowrap}th{color:var(--theme-muted);font-size:11px;text-transform:uppercase;letter-spacing:.05em}tbody tr{cursor:pointer}tbody tr:hover,tbody tr.selected{background:color-mix(in srgb,var(--theme-primary) 8%,transparent)}td small{display:block;color:var(--theme-muted);margin-top:3px}.status{display:inline-block;padding:4px 7px;border-radius:99px;background:#eef2f6;color:#425466;font-size:11px;font-weight:750;white-space:nowrap}.status-delivered{background:#e5f6ec;color:#087443}.status-cancelled,.status-returned{background:#fff0ef;color:#a52f28}.status-approved,.status-out_for_delivery,.status-shipped{background:#eaf2ff;color:#1769c2}.pagination{display:flex;justify-content:space-between;align-items:center;gap:8px;margin-top:14px;font-size:12px;color:var(--theme-muted)}.detail-panel{position:sticky;top:215px;max-height:calc(100vh - 235px);overflow:auto}.empty,.empty-detail,.muted{color:var(--theme-muted)}.empty-detail{padding:35px 8px;text-align:center}.empty-detail h2{color:var(--theme-text)}.summary{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin:16px 0}.summary div{min-width:0}.summary dt{color:var(--theme-muted);font-size:11px}.summary dd{margin:3px 0 0;overflow-wrap:anywhere;font-size:13px}.items{list-style:none;padding:0;margin:0}.items li,.totals p{display:flex;justify-content:space-between;gap:12px;padding:9px 0;border-bottom:1px solid var(--line);font-size:13px}.items small{color:var(--theme-muted)}.status-form{display:grid;gap:10px;margin-top:20px;padding-top:16px;border-top:1px solid var(--line)}.status-form h3,.detail-panel h3{margin:0;font-size:16px}.status-form .confirm{display:flex;flex-direction:row;align-items:flex-start;min-width:0}.totals{margin-top:10px}.totals p{margin:0}.totals .grand-total{font-size:16px;font-weight:800}.notice{padding:11px 13px;border-radius:9px}.notice.error{background:#fff0ef;color:#a52f28}.notice.success{background:#e5f6ec;color:#087443}@media(max-width:1000px){.orders-layout{grid-template-columns:1fr}.detail-panel{position:static;max-height:none}}@media(max-width:620px){.page-heading{align-items:flex-start;flex-direction:column}.summary{grid-template-columns:1fr}.filters form>*{width:100%}.panel{padding:14px}}
</style>
