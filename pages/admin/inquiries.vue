<template>
  <main class="sp-admin-page">
    <header class="sp-admin-page-heading">
      <div><span class="sp-admin-eyebrow">الدعم والمبيعات</span><h1>استفسارات المبيعات</h1><p>تابع الطلبات الواردة من نموذج الموقع وحدّث حالة كل استفسار.</p></div>
      <button class="sp-admin-secondary" type="button" :disabled="loading" @click="load">تحديث</button>
    </header>

    <p v-if="error" class="sp-admin-alert" role="alert">{{ error }}</p>
    <p v-if="notice" class="sp-admin-feedback" role="status">{{ notice }}</p>

    <section class="sp-admin-panel">
      <form class="sp-admin-filters" @submit.prevent="page = 1; load()">
        <label>بحث<input v-model.trim="search" type="search" placeholder="الاسم أو البريد أو رقم الهاتف"></label>
        <label>الحالة<select v-model="status"><option value="">كل الحالات</option><option v-for="item in statuses" :key="item.value" :value="item.value">{{ item.label }}</option></select></label>
        <button class="sp-admin-primary" type="submit" :disabled="loading">{{ loading ? 'جارٍ التحميل…' : 'تطبيق الفلاتر' }}</button>
      </form>

      <div class="sp-admin-table-wrap">
        <table class="sp-admin-table">
          <thead><tr><th>العميل</th><th>النشاط</th><th>الخدمة</th><th>الحالة</th><th>تاريخ الطلب</th><th></th></tr></thead>
          <tbody>
            <template v-for="item in inquiries" :key="item.id">
              <tr>
                <td><strong>{{ item.name }}</strong><a :href="`mailto:${item.email}`">{{ item.email }}</a><a v-if="item.phone" :href="`tel:${item.phone}`" dir="ltr">{{ item.phone }}</a></td>
                <td>{{ item.business_name || '—' }}</td>
                <td>{{ item.service_interest || item.package_interest || '—' }}</td>
                <td><span class="sp-admin-status" :class="`is-${item.status}`">{{ statusLabel(item.status) }}</span></td>
                <td>{{ formatDate(item.created_at) }}</td>
                <td><button class="sp-admin-table-action" type="button" :aria-expanded="selected?.id === item.id" @click="select(item)">{{ selected?.id === item.id ? 'إغلاق' : 'التفاصيل' }}</button></td>
              </tr>
              <tr v-if="selected?.id === item.id" class="sp-admin-detail-row">
                <td colspan="6">
                  <div class="sp-admin-inquiry-detail">
                    <div><strong>رسالة العميل</strong><p>{{ item.message || 'لا توجد رسالة مرفقة.' }}</p><small v-if="item.existing_store_url">المتجر الحالي: <a :href="safeUrl(item.existing_store_url)" target="_blank" rel="noreferrer">{{ item.existing_store_url }}</a></small></div>
                    <form @submit.prevent="save(item)">
                      <label>حالة الاستفسار<select v-model="editForm.status"><option v-for="option in statuses" :key="option.value" :value="option.value">{{ option.label }}</option></select></label>
                      <label>ملاحظة داخلية<textarea v-model.trim="editForm.admin_note" rows="3" maxlength="10000" placeholder="ملاحظة للفريق فقط"></textarea></label>
                      <button class="sp-admin-primary" type="submit" :disabled="saving">{{ saving ? 'جارٍ الحفظ…' : 'حفظ التحديث' }}</button>
                    </form>
                  </div>
                </td>
              </tr>
            </template>
            <tr v-if="!inquiries.length && !loading"><td colspan="6" class="sp-admin-empty">لا توجد استفسارات مطابقة.</td></tr>
          </tbody>
        </table>
      </div>

      <div class="sp-admin-pagination"><button class="sp-admin-secondary" :disabled="page <= 1 || loading" @click="page--; load()">السابق</button><span>صفحة {{ page }} من {{ lastPage }}</span><button class="sp-admin-secondary" :disabled="page >= lastPage || loading" @click="page++; load()">التالي</button></div>
    </section>
  </main>
</template>

<script setup lang="ts">
definePageMeta({ middleware: ['admin'], adminPermission: 'support.manage' })

type Inquiry = {
  id: number
  name: string
  email: string
  phone: string | null
  business_name: string | null
  existing_store_url: string | null
  service_interest: string | null
  package_interest: string | null
  status: string
  message: string | null
  admin_note: string | null
  created_at: string
}

const statuses = [
  { value: 'new', label: 'جديد' },
  { value: 'contacted', label: 'تم التواصل' },
  { value: 'qualified', label: 'مؤهل' },
  { value: 'won', label: 'تم التعاقد' },
  { value: 'lost', label: 'مغلق' },
]
const { request } = useApi()
const inquiries = ref<Inquiry[]>([])
const selected = ref<Inquiry | null>(null)
const editForm = reactive({ status: 'new', admin_note: '' })
const search = ref('')
const status = ref('')
const page = ref(1)
const lastPage = ref(1)
const loading = ref(false)
const saving = ref(false)
const error = ref('')
const notice = ref('')

function statusLabel(value: string) { return statuses.find(item => item.value === value)?.label || value }
function formatDate(value: string) { return new Intl.DateTimeFormat('ar-EG', { dateStyle: 'medium' }).format(new Date(value)) }
function safeUrl(value: string) { return /^https?:\/\//i.test(value) ? value : `https://${value}` }

async function load() {
  loading.value = true
  error.value = ''
  try {
    const params = new URLSearchParams({ per_page: '20', page: String(page.value) })
    if (search.value) params.set('search', search.value)
    if (status.value) params.set('status', status.value)
    const payload = (await request<any>(`/admin/sales-inquiries?${params}`)).data
    inquiries.value = payload?.data || []
    lastPage.value = Number(payload?.pagination?.total_pages || 1)
    if (selected.value) selected.value = inquiries.value.find(item => item.id === selected.value?.id) || null
  } catch (exception: any) {
    error.value = exception?.data?.message || 'تعذر تحميل الاستفسارات.'
  } finally {
    loading.value = false
  }
}

function select(item: Inquiry) {
  if (selected.value?.id === item.id) {
    selected.value = null
    return
  }
  selected.value = item
  Object.assign(editForm, { status: item.status, admin_note: item.admin_note || '' })
}

async function save(item: Inquiry) {
  saving.value = true
  error.value = ''
  notice.value = ''
  try {
    await request(`/admin/sales-inquiries/${item.id}`, { method: 'PATCH', body: { ...editForm } })
    notice.value = 'تم تحديث الاستفسار.'
    await load()
  } catch (exception: any) {
    error.value = exception?.data?.message || 'تعذر حفظ التحديث.'
  } finally {
    saving.value = false
  }
}

onMounted(load)
</script>

<style scoped>
.sp-admin-filters{display:flex;align-items:end;gap:12px;margin-bottom:18px}.sp-admin-filters label,.sp-admin-inquiry-detail form label{display:grid;flex:1;gap:6px;color:var(--theme-muted);font-size:.8rem;font-weight:700}.sp-admin-filters input,.sp-admin-filters select,.sp-admin-inquiry-detail select,.sp-admin-inquiry-detail textarea{width:100%;min-height:42px;padding:9px 11px;border:1px solid var(--line);border-radius:9px;color:var(--theme-text);background:var(--theme-surface);font:inherit}.sp-admin-filters .sp-admin-primary{flex:none}.sp-admin-table-wrap{overflow:auto}.sp-admin-table{width:100%;border-collapse:collapse;text-align:start;font-size:.8rem}.sp-admin-table th,.sp-admin-table td{padding:12px 10px;border-bottom:1px solid var(--line);text-align:start;vertical-align:top}.sp-admin-table th{color:var(--theme-muted);font-size:.72rem;white-space:nowrap}.sp-admin-table td:first-child strong,.sp-admin-table td:first-child a{display:block}.sp-admin-table td:first-child a{margin-top:3px;color:var(--theme-muted);font-size:.74rem}.sp-admin-status{display:inline-flex;padding:4px 8px;border-radius:999px;color:#1D4ED8;background:#EFF6FF;font-size:.72rem;font-weight:800;white-space:nowrap}.sp-admin-status.is-won{color:#047857;background:#D1FAE5}.sp-admin-status.is-lost{color:#64748B;background:#E2E8F0}.sp-admin-status.is-contacted,.sp-admin-status.is-qualified{color:#B45309;background:#FEF3C7}.sp-admin-table-action{padding:6px 9px;border:1px solid var(--line);border-radius:8px;color:var(--theme-primary);background:var(--theme-surface);font:inherit;font-size:.75rem;font-weight:700;cursor:pointer}.sp-admin-detail-row>td{padding:16px;background:color-mix(in srgb,var(--theme-primary) 4%,var(--theme-surface))}.sp-admin-inquiry-detail{display:grid;grid-template-columns:minmax(0,1fr) minmax(240px,.8fr);gap:20px}.sp-admin-inquiry-detail p{white-space:pre-line;color:var(--theme-muted);line-height:1.8}.sp-admin-inquiry-detail form{display:grid;gap:11px}.sp-admin-inquiry-detail textarea{resize:vertical}.sp-admin-feedback{margin:0 0 14px;padding:10px 13px;border-radius:9px;color:#047857;background:#D1FAE5;font-size:.84rem}.sp-admin-empty{text-align:center!important;color:var(--theme-muted)}.sp-admin-pagination{display:flex;align-items:center;justify-content:center;gap:14px;margin-top:16px;color:var(--theme-muted);font-size:.8rem}.sp-admin-pagination .sp-admin-secondary{min-height:36px}@media(max-width:780px){.sp-admin-filters{align-items:stretch;flex-direction:column}.sp-admin-filters .sp-admin-primary{align-self:flex-start}.sp-admin-inquiry-detail{grid-template-columns:1fr}.sp-admin-panel{padding:14px}}
:root[data-theme="dark"] .sp-admin-status{color:#93C5FD;background:rgba(59,130,246,.15)}:root[data-theme="dark"] .sp-admin-status.is-won{color:#6EE7B7;background:rgba(16,185,129,.14)}:root[data-theme="dark"] .sp-admin-status.is-lost{color:#CBD5E1;background:rgba(148,163,184,.14)}:root[data-theme="dark"] .sp-admin-status.is-contacted,:root[data-theme="dark"] .sp-admin-status.is-qualified{color:#FCD34D;background:rgba(245,158,11,.14)}:root[data-theme="dark"] .sp-admin-feedback{color:#6EE7B7;background:rgba(6,78,59,.35)}
</style>
