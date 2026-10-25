<template>
  <main class="dashboard-page">
    <header><div><p class="eyebrow">3B / ADMIN</p><h1>Store dashboard</h1><p>Today’s order activity, six-month revenue, and inventory alerts.</p></div><button class="button secondary" :disabled="loading" @click="load">Refresh</button></header>
    <p v-if="error" class="notice error" role="alert">{{ error }}</p>
    <section v-if="stats" class="stat-grid"><article class="panel"><small>Orders today</small><strong>{{ stats.today_performance?.orders ?? 0 }}</strong></article><article class="panel"><small>Today’s order value</small><strong>{{ money(stats.today_performance?.order_value) }}</strong></article><article class="panel"><small>Average order today</small><strong>{{ money(stats.today_performance?.average_order_value) }}</strong></article><article class="panel"><small>Delivered today</small><strong>{{ stats.today_performance?.delivered ?? 0 }}</strong></article><article class="panel"><small>Products</small><strong>{{ stats.products ?? 0 }}</strong></article><article class="panel alert-card"><small>Low stock items</small><strong>{{ stats.low_stock?.count ?? 0 }}</strong></article></section>
    <div v-if="stats" class="report-grid"><section class="panel"><div class="section-heading"><div><h2>Revenue · last six months</h2><p>Delivered order subtotal and shipping value</p></div><strong>{{ money(stats.total_revenue) }}</strong></div><div class="revenue-list"><div v-for="(amount, month) in stats.monthly_revenue" :key="month" class="revenue-row"><span>{{ monthLabel(String(month)) }}</span><div class="bar-track"><span :style="{ width: `${barWidth(Number(amount))}%` }"></span></div><strong>{{ money(amount) }}</strong></div></div></section>
      <section class="panel"><div class="section-heading"><div><h2>Low stock</h2><p>At or below {{ stats.low_stock?.threshold ?? 5 }} units</p></div><NuxtLink to="/admin/inventory">Open inventory</NuxtLink></div><article v-for="item in stats.low_stock?.items || []" :key="`${item.product_id}-${item.variant_sku || item.sku}`" class="stock-row"><img v-if="item.image_url" :src="item.image_url" alt="" width="46" height="46"><span><strong>{{ item.name }}</strong><small>{{ item.variant_sku || item.sku || `Product #${item.product_id}` }}</small></span><b>{{ item.quantity }}</b></article><p v-if="!stats.low_stock?.items?.length" class="muted">No products are currently below the threshold.</p></section></div>
  </main>
</template>

<script setup lang="ts">
definePageMeta({ middleware: ['admin'], adminPermission: 'reports.view' })

const { request } = useApi()
const stats = ref<any>(null)
const loading = ref(false)
const error = ref('')
const maxRevenue = computed(() => Math.max(1, ...Object.values(stats.value?.monthly_revenue || {}).map(Number)))
function money(value: number | string | null | undefined) { return `${new Intl.NumberFormat('en-EG', { maximumFractionDigits: 2 }).format(Number(value || 0))} EGP` }
function barWidth(value: number) { return Math.max(2, value / maxRevenue.value * 100) }
function monthLabel(value: string) { return new Intl.DateTimeFormat('en-EG', { month: 'short', year: 'numeric' }).format(new Date(`${value}-01T00:00:00`)) }
async function load() {
  loading.value = true; error.value = ''
  try { stats.value = (await request<any>('/dashboard/stats')).data }
  catch (exception: any) { error.value = exception?.data?.message || 'Could not load the dashboard.' }
  finally { loading.value = false }
}
onMounted(load)
</script>

<style scoped>
.dashboard-page{max-width:1400px;margin:0 auto;padding:32px 18px 64px;color:var(--theme-text)}header,.section-heading{display:flex;justify-content:space-between;align-items:center;gap:14px}header{margin-bottom:20px}header h1{margin:3px 0;font-size:30px}header p:last-child,.section-heading p{margin:4px 0;color:var(--theme-muted)}.eyebrow{margin:0;color:var(--theme-primary);font-size:11px;font-weight:800;letter-spacing:.13em}.button{min-height:39px;padding:8px 12px;border:1px solid var(--line);border-radius:8px;background:var(--theme-surface);color:var(--theme-text);font:inherit;font-weight:700;cursor:pointer}.button:disabled{opacity:.5}.stat-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:12px}.panel{padding:18px;border:1px solid var(--line);border-radius:14px;background:var(--theme-surface)}.stat-grid article small,.stat-grid article strong{display:block}.stat-grid article small{color:var(--theme-muted)}.stat-grid article strong{margin-top:7px;font-size:24px}.alert-card strong{color:#aa6623}.report-grid{display:grid;grid-template-columns:1.1fr .9fr;gap:14px;margin-top:14px}.section-heading h2{margin:0;font-size:18px}.section-heading p{font-size:12px}.section-heading>a{font-weight:700}.revenue-list{margin-top:16px}.revenue-row{display:grid;grid-template-columns:90px 1fr 105px;gap:10px;align-items:center;padding:8px 0;font-size:12px}.revenue-row>strong{text-align:right}.bar-track{height:9px;border-radius:10px;background:color-mix(in srgb,var(--theme-primary) 10%,transparent)}.bar-track span{display:block;height:100%;border-radius:inherit;background:var(--theme-primary)}.stock-row{display:flex;align-items:center;gap:10px;padding:10px 0;border-bottom:1px solid var(--line)}.stock-row img{object-fit:cover;border-radius:8px}.stock-row span{flex:1}.stock-row strong,.stock-row small{display:block}.stock-row small,.muted{color:var(--theme-muted)}.stock-row>b{color:#a52f28}.notice{padding:11px 13px;border-radius:9px}.notice.error{background:#fff0ef;color:#a52f28}@media(max-width:850px){.report-grid{grid-template-columns:1fr}}@media(max-width:600px){header{align-items:flex-start;flex-direction:column}.stat-grid{grid-template-columns:repeat(2,minmax(0,1fr))}.panel{padding:14px}.revenue-row{grid-template-columns:70px 1fr 90px;font-size:11px}}
</style>
