<template>
  <main class="sp-admin-page">
    <header class="sp-admin-page-heading">
      <div><span class="sp-admin-eyebrow">مركز الإدارة</span><h1>لوحة الإدارة</h1><p>نظرة سريعة على أدوات إدارة موقع StorePro.</p></div>
      <NuxtLink class="sp-admin-secondary" to="/">عرض الموقع <ExternalLink :size="16" /></NuxtLink>
    </header>

    <p v-if="error" class="sp-admin-alert" role="status">{{ error }}</p>

    <section class="sp-admin-summary" aria-label="ملخص الموقع">
      <NuxtLink v-for="item in summaries" :key="item.label" :to="item.to" class="sp-admin-summary-card">
        <span class="sp-admin-summary-icon"><component :is="item.icon" :size="20" /></span>
        <span><small>{{ item.label }}</small><strong>{{ counts[item.key] === null ? '—' : counts[item.key] }}</strong></span>
        <ChevronLeft :size="18" class="sp-admin-summary-arrow" />
      </NuxtLink>
    </section>

    <section class="sp-admin-panel sp-admin-shortcuts">
      <div class="sp-admin-section-heading"><div><h2>إجراءات سريعة</h2><p>افتح القسم الذي تريد إدارته.</p></div></div>
      <nav class="sp-admin-shortcut-grid" aria-label="إجراءات الإدارة">
        <NuxtLink v-for="item in shortcuts" :key="item.to" :to="item.to" class="sp-admin-shortcut">
          <component :is="item.icon" :size="19" />
          <span><strong>{{ item.label }}</strong><small>{{ item.description }}</small></span>
          <ChevronLeft :size="17" />
        </NuxtLink>
      </nav>
    </section>
  </main>
</template>

<script setup lang="ts">
import { ChevronLeft, ContactRound, ExternalLink, FileText, MessagesSquare, Search } from 'lucide-vue-next'

definePageMeta({ middleware: ['admin'] })

type SummaryKey = 'inquiries' | 'contacts' | 'articles' | 'pages'
const { request, hasPermission } = useApi()
const counts = reactive<Record<SummaryKey, number | null>>({ inquiries: null, contacts: null, articles: null, pages: null })
const error = ref('')

const summaries = computed(() => [
  { label: 'استفسارات جديدة', key: 'inquiries' as const, to: '/admin/inquiries', icon: MessagesSquare, permission: 'support.manage' },
  { label: 'رسائل التواصل', key: 'contacts' as const, to: '/admin/contacts', icon: ContactRound, permission: 'support.manage' },
  { label: 'مقالات الموقع', key: 'articles' as const, to: '/admin/blog', icon: FileText, permission: 'content.manage' },
  { label: 'صفحات الموقع', key: 'pages' as const, to: '/admin/content', icon: FileText, permission: 'content.manage' },
].filter(item => hasPermission(item.permission)))

const shortcuts = computed(() => [
  { to: '/admin/inquiries', label: 'استفسارات المبيعات', description: 'تابع طلبات العملاء المحتملين.', icon: MessagesSquare, permission: 'support.manage' },
  { to: '/admin/contacts', label: 'رسائل التواصل', description: 'راجع الرسائل الواردة من الموقع.', icon: ContactRound, permission: 'support.manage' },
  { to: '/admin/content', label: 'صفحات الموقع', description: 'حدّث صفحات المعلومات والسياسات.', icon: FileText, permission: 'content.manage' },
  { to: '/admin/blog', label: 'المقالات', description: 'حرّر المقالات العربية والإنجليزية.', icon: FileText, permission: 'content.manage' },
  { to: '/admin/seo', label: 'إعادة توجيه الروابط', description: 'حافظ على الروابط القديمة للموقع.', icon: Search, permission: 'content.manage' },
].filter(item => hasPermission(item.permission)))

function totalFrom(payload: any) {
  return Number(payload?.pagination?.total ?? payload?.total ?? (Array.isArray(payload) ? payload.length : payload?.data?.length ?? 0))
}

onMounted(async () => {
  const requests: Array<[SummaryKey, string]> = []
  if (hasPermission('support.manage')) {
    requests.push(['inquiries', '/admin/sales-inquiries?status=new&per_page=1'])
    requests.push(['contacts', '/admin/contacts?per_page=1'])
  }
  if (hasPermission('content.manage')) {
    requests.push(['articles', '/admin/blogs?per_page=1'])
    requests.push(['pages', '/admin/static-pages'])
  }

  const results = await Promise.allSettled(requests.map(([, path]) => request<any>(path)))
  results.forEach((result, index) => {
    const key = requests[index][0]
    if (result.status === 'fulfilled') counts[key] = totalFrom(result.value.data)
    else error.value = 'تعذّر تحميل بعض بيانات الملخص. يمكنك فتح كل قسم لإعادة المحاولة.'
  })
})
</script>
