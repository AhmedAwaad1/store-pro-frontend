<template>
  <main class="sp-admin-page">
    <header class="sp-admin-page-heading">
      <div><span class="sp-admin-eyebrow">الدعم والمبيعات</span><h1>رسائل التواصل</h1><p>راجع رسائل العملاء وعلّم الرسائل التي تمت متابعتها.</p></div>
      <button class="sp-admin-secondary" type="button" :disabled="loading" @click="load">تحديث</button>
    </header>

    <p v-if="error" class="sp-admin-alert" role="alert">{{ error }}</p>
    <p v-if="notice" class="sp-admin-feedback" role="status">{{ notice }}</p>

    <section class="sp-admin-panel">
      <div class="sp-admin-table-wrap">
        <table class="sp-admin-table">
          <thead><tr><th>العميل</th><th>الرسالة</th><th>التاريخ</th><th>الحالة</th><th></th></tr></thead>
          <tbody>
            <tr v-for="item in contacts" :key="item.id" :class="{ 'is-unread': !item.checked }">
              <td><strong>{{ item.name }}</strong><a :href="`mailto:${item.email}`">{{ item.email }}</a><a v-if="item.phone" :href="`tel:${item.phone}`" dir="ltr">{{ item.phone }}</a></td>
              <td class="contact-message">{{ item.message }}</td>
              <td>{{ formatDate(item.created_at) }}</td>
              <td><span class="sp-admin-status" :class="item.checked ? 'is-won' : 'is-new'">{{ item.checked ? 'تمت المتابعة' : 'بحاجة للمتابعة' }}</span></td>
              <td><button v-if="!item.checked" class="sp-admin-table-action" type="button" :disabled="savingId === item.id" @click="markChecked(item)">{{ savingId === item.id ? 'جارٍ الحفظ…' : 'تمت المتابعة' }}</button></td>
            </tr>
            <tr v-if="!contacts.length && !loading"><td colspan="5" class="sp-admin-empty">لا توجد رسائل تواصل.</td></tr>
          </tbody>
        </table>
      </div>
      <div class="sp-admin-pagination"><button class="sp-admin-secondary" :disabled="page <= 1 || loading" @click="page--; load()">السابق</button><span>صفحة {{ page }} من {{ lastPage }}</span><button class="sp-admin-secondary" :disabled="page >= lastPage || loading" @click="page++; load()">التالي</button></div>
    </section>
  </main>
</template>

<script setup lang="ts">
definePageMeta({ middleware: ['admin'], adminPermission: 'support.manage' })

type ContactMessage = { id: number; name: string; email: string; phone: string | null; message: string; checked: boolean; created_at: string }
const { request } = useApi()
const contacts = ref<ContactMessage[]>([])
const page = ref(1)
const lastPage = ref(1)
const loading = ref(false)
const savingId = ref<number | null>(null)
const error = ref('')
const notice = ref('')

function formatDate(value: string) { return new Intl.DateTimeFormat('ar-EG', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value)) }

async function load() {
  loading.value = true
  error.value = ''
  try {
    const payload = (await request<any>(`/admin/contacts?per_page=20&page=${page.value}`)).data
    contacts.value = payload?.data || []
    lastPage.value = Number(payload?.pagination?.total_pages || 1)
  } catch (exception: any) {
    error.value = exception?.data?.message || 'تعذر تحميل الرسائل.'
  } finally {
    loading.value = false
  }
}

async function markChecked(item: ContactMessage) {
  savingId.value = item.id
  error.value = ''
  notice.value = ''
  try {
    await request(`/admin/contacts/${item.id}/mark-checked`, { method: 'PUT', body: { checked: true } })
    item.checked = true
    notice.value = 'تم تحديث حالة الرسالة.'
  } catch (exception: any) {
    error.value = exception?.data?.message || 'تعذر تحديث الرسالة.'
  } finally {
    savingId.value = null
  }
}

onMounted(load)
</script>

<style scoped>
.sp-admin-table-wrap{overflow:auto}.sp-admin-table{width:100%;border-collapse:collapse;text-align:start;font-size:.8rem}.sp-admin-table th,.sp-admin-table td{padding:12px 10px;border-bottom:1px solid var(--line);text-align:start;vertical-align:top}.sp-admin-table th{color:var(--theme-muted);font-size:.72rem;white-space:nowrap}.sp-admin-table td:first-child strong,.sp-admin-table td:first-child a{display:block}.sp-admin-table td:first-child a{margin-top:3px;color:var(--theme-muted);font-size:.74rem}.contact-message{min-width:260px;max-width:540px;white-space:pre-line;line-height:1.75}.sp-admin-table tr.is-unread td:first-child strong{color:var(--theme-primary)}.sp-admin-status{display:inline-flex;padding:4px 8px;border-radius:999px;color:#B45309;background:#FEF3C7;font-size:.72rem;font-weight:800;white-space:nowrap}.sp-admin-status.is-won{color:#047857;background:#D1FAE5}.sp-admin-table-action{padding:6px 9px;border:1px solid var(--line);border-radius:8px;color:var(--theme-primary);background:var(--theme-surface);font:inherit;font-size:.75rem;font-weight:700;cursor:pointer}.sp-admin-table-action:disabled{opacity:.55;cursor:wait}.sp-admin-empty{text-align:center!important;color:var(--theme-muted)}.sp-admin-pagination{display:flex;align-items:center;justify-content:center;gap:14px;margin-top:16px;color:var(--theme-muted);font-size:.8rem}.sp-admin-pagination .sp-admin-secondary{min-height:36px}.sp-admin-feedback{margin:0 0 14px;padding:10px 13px;border-radius:9px;color:#047857;background:#D1FAE5;font-size:.84rem}@media(max-width:780px){.sp-admin-panel{padding:14px}}
:root[data-theme="dark"] .sp-admin-status{color:#FCD34D;background:rgba(245,158,11,.14)}:root[data-theme="dark"] .sp-admin-status.is-won,:root[data-theme="dark"] .sp-admin-feedback{color:#6EE7B7;background:rgba(6,78,59,.35)}
</style>
