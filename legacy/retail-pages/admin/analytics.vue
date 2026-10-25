<template>
  <main class="admin-page">
    <header><div><p class="eyebrow">3B / ADMIN</p><h1>Store analytics</h1><p>Consent-aware first-party events from catalog browsing through purchase.</p></div><div class="toolbar"><label>Period<select v-model.number="days" @change="load"><option :value="7">7 days</option><option :value="30">30 days</option><option :value="90">90 days</option></select></label><button class="button secondary" :disabled="loading" @click="load">Refresh</button></div></header>
    <p v-if="error" class="notice error" role="alert">{{ error }}</p>
    <section v-if="report" class="stat-grid">
      <article class="panel"><small>Checkout sessions</small><strong>{{ report.checkout_sessions }}</strong></article><article class="panel"><small>Purchasing sessions</small><strong>{{ report.purchasing_sessions }}</strong></article><article class="panel"><small>Abandoned checkout sessions</small><strong>{{ report.abandoned_checkout_sessions }}</strong></article><article class="panel"><small>Zero-result searches</small><strong>{{ report.zero_result_searches }}</strong></article>
    </section>
    <div v-if="report" class="report-grid">
      <section class="panel"><h2>Checkout funnel</h2><div class="metric-row"><span>Begin checkout events</span><strong>{{ report.events.begin_checkout || 0 }}</strong></div><div class="metric-row"><span>Purchasing sessions</span><strong>{{ report.purchasing_sessions }} · {{ conversionRate }}% of checkout sessions</strong></div><div class="metric-row"><span>Abandoned sessions</span><strong>{{ report.abandoned_checkout_sessions }}</strong></div></section>
      <section class="panel"><h2>Events</h2><div v-for="(count, name) in report.events" :key="name" class="metric-row"><span>{{ eventLabel(String(name)) }}</span><strong>{{ count }}</strong></div><p v-if="!Object.keys(report.events || {}).length" class="empty">No consented analytics events in this period.</p></section>
      <section class="panel"><h2>Promotion activity</h2><div v-for="promotion in report.promotion_events" :key="promotion.promotion_id" class="metric-row"><span>Promotion #{{ promotion.promotion_id }}</span><strong>{{ promotion.event_count }} events</strong></div><p v-if="!report.promotion_events?.length" class="empty">No tracked promotion activity in this period.</p></section>
    </div>
  </main>
</template>

<script setup lang="ts">
definePageMeta({ middleware: ['admin'], adminPermission: 'reports.view' })
type AnalyticsReport = { days: number; events: Record<string, number>; checkout_sessions: number; purchasing_sessions: number; abandoned_checkout_sessions: number; zero_result_searches: number; promotion_events: Array<{ promotion_id: number; event_count: number }> }
const { request } = useApi()
const report = ref<AnalyticsReport | null>(null)
const days = ref(30)
const loading = ref(false)
const error = ref('')
const conversionRate = computed(() => report.value?.checkout_sessions ? (report.value.purchasing_sessions / report.value.checkout_sessions * 100).toFixed(1) : '0.0')
const labels: Record<string, string> = { product_view: 'Product views', search: 'Searches', filter: 'Filter use', compare: 'Comparisons', add_to_cart: 'Add to cart', begin_checkout: 'Begin checkout', purchase: 'Purchases' }
const eventLabel = (name: string) => labels[name] || name
async function load() { loading.value = true; error.value = ''; try { report.value = (await request<AnalyticsReport>(`/admin/analytics/report?days=${days.value}`)).data } catch (exception: any) { error.value = exception?.data?.message || 'Could not load analytics.' } finally { loading.value = false } }
onMounted(load)
</script>

<style scoped>
.admin-page{max-width:1400px;margin:0 auto;padding:32px 18px 64px;color:var(--theme-text)}header{display:flex;justify-content:space-between;align-items:center;gap:16px;margin-bottom:20px}header h1{margin:3px 0;font-size:30px}header p:last-child{margin:4px 0;color:var(--theme-muted)}.eyebrow{margin:0;color:var(--theme-primary);font-size:11px;font-weight:800;letter-spacing:.13em}.toolbar{display:flex;align-items:end;gap:8px}.toolbar label{display:grid;gap:5px;font-size:12px;color:var(--theme-muted)}select{min-height:39px;padding:7px 10px;border:1px solid var(--line);border-radius:8px;background:var(--theme-surface);color:var(--theme-text);font:inherit}.button{min-height:39px;padding:8px 12px;border:1px solid var(--line);border-radius:8px;background:var(--theme-surface);color:var(--theme-text);font:inherit;font-weight:700;cursor:pointer}.button:disabled{opacity:.5}.stat-grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:12px}.panel{padding:18px;border:1px solid var(--line);border-radius:14px;background:var(--theme-surface)}.stat-grid small,.stat-grid strong{display:block}.stat-grid small{color:var(--theme-muted)}.stat-grid strong{margin-top:7px;font-size:25px}.report-grid{display:grid;grid-template-columns:1fr 1fr;gap:14px;margin-top:14px}.report-grid h2{margin:0 0 12px;font-size:18px}.metric-row{display:flex;justify-content:space-between;gap:14px;padding:11px 0;border-top:1px solid var(--line)}.metric-row span{color:var(--theme-muted)}.empty{color:var(--theme-muted);font-size:13px}.notice{padding:11px 13px;border-radius:9px}.notice.error{background:#fff0ef;color:#a52f28}@media(max-width:800px){header{align-items:flex-start;flex-direction:column}.stat-grid{grid-template-columns:repeat(2,minmax(0,1fr))}.report-grid{grid-template-columns:1fr}}
</style>
