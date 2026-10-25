<template>
  <main class="content-page">
    <header><div><p class="eyebrow">STOREPRO / الإدارة</p><h1>صفحات الموقع</h1><p>إدارة الصفحات التعريفية والسياسات المنشورة على الموقع.</p></div><button class="button secondary" :disabled="loading" @click="load">تحديث</button></header>
    <p v-if="error" class="notice error" role="alert">{{ error }}</p><p v-if="notice" class="notice success" role="status">{{ notice }}</p>
    <div class="content-layout">
      <section class="panel page-list"><div class="section-heading"><h2>Store pages</h2><button class="button primary" @click="newPage">Add page</button></div><button v-for="page in pages" :key="page.id" class="page-row" :class="{ selected: editingId === page.id }" @click="edit(page)"><span><strong>{{ page.title_en || page.title }}</strong><small>{{ page.section_key }}</small></span><small>{{ page.is_published ? 'Published' : 'Draft' }} · {{ page.title_ar || 'Arabic title not set' }}</small></button><p v-if="!pages.length && !loading" class="muted">No content pages have been added yet.</p></section>
      <section class="panel editor">
        <h2>{{ editingId ? 'Edit page' : 'Create a page' }}</h2>
        <form @submit.prevent="save">
          <div class="form-grid">
            <label>Page key<input v-model.trim="form.section_key" maxlength="255" placeholder="returns-and-refunds"></label>
            <label>English title<input v-model.trim="form.title_en" maxlength="255" required></label>
            <label>Arabic title<input v-model.trim="form.title_ar" maxlength="255" dir="rtl"></label>
            <label class="wide">English page content<textarea v-model="form.description_en" rows="9" placeholder="Explain the service or policy in clear language."></textarea></label>
            <label class="wide" dir="rtl">محتوى الصفحة بالعربية<textarea v-model="form.description_ar" rows="9" dir="rtl"></textarea></label>
            <label>Publication<select v-model="form.is_published"><option :value="true">Published</option><option :value="false">Draft</option></select></label>
            <label>Publish at<input v-model="form.published_at" type="datetime-local"></label>
            <label>Unpublish at<input v-model="form.publish_until" type="datetime-local"></label>
            <label>English meta title<input v-model.trim="form.meta_title_en" maxlength="255"></label>
            <label>Arabic meta title<input v-model.trim="form.meta_title_ar" maxlength="255" dir="rtl"></label>
            <label class="wide">English meta description<textarea v-model="form.meta_description_en" rows="2" maxlength="1000"></textarea></label>
            <label class="wide" dir="rtl">وصف محركات البحث بالعربية<textarea v-model="form.meta_description_ar" rows="2" maxlength="1000" dir="rtl"></textarea></label>
            <aside class="seo-preview wide"><small>SEARCH RESULT PREVIEW · ENGLISH</small><strong>{{ form.meta_title_en || form.title_en || 'Page title preview' }}</strong><p>{{ form.meta_description_en || form.description_en || 'Add an English description to preview the search result.' }}</p><small>{{ (form.meta_title_en || form.title_en).length }} / 60 title characters · {{ (form.meta_description_en || form.description_en).length }} / 160 description characters</small></aside>
            <label class="wide">Page image<input ref="imageInput" type="file" accept="image/jpeg,image/png,image/webp"></label>
          </div>
          <div class="actions"><button class="button primary" :disabled="saving">{{ saving ? 'Saving…' : editingId ? 'Save changes' : 'Create page' }}</button><button v-if="editingId" type="button" class="button secondary" @click="newPage">Cancel</button><button v-if="editingId" type="button" class="button danger" :disabled="saving" @click="removePage">Delete page</button></div>
        </form>
        <section v-if="editingId" class="revision-history">
          <div class="section-heading"><h2>Revision history</h2><button class="button secondary" :disabled="revisionsLoading" @click="loadRevisions">Refresh</button></div>
          <p v-if="revisionsError" class="notice error">{{ revisionsError }}</p>
          <article v-for="revision in revisions" :key="revision.id" class="revision-row">
            <strong>Revision {{ revision.revision_number }}</strong>
            <span>{{ revision.actor?.username || 'System' }}</span>
            <time>{{ new Date(revision.created_at).toLocaleString() }}</time>
          </article>
          <p v-if="!revisions.length && !revisionsLoading" class="muted">No revisions recorded.</p>
        </section>
      </section>
    </div>
  </main>
</template>

<script setup lang="ts">
definePageMeta({ middleware: ['admin'], adminPermission: 'content.manage' })

type StorePage = { id: number; section_key: string; title_en: string; title_ar: string | null; description_en: string | null; description_ar: string | null; image_url: string | null; is_published: boolean; published_at: string | null; publish_until: string | null; meta_title_en: string | null; meta_title_ar: string | null; meta_description_en: string | null; meta_description_ar: string | null }
type PageRevision = { id: number; revision_number: number; created_at: string; actor?: { username: string } | null }
const { request } = useApi()
const pages = ref<StorePage[]>([])
const editingId = ref<number | null>(null)
const editingKey = ref('')
const imageInput = ref<HTMLInputElement | null>(null)
const loading = ref(false)
const saving = ref(false)
const error = ref('')
const notice = ref('')
const revisions = ref<PageRevision[]>([])
const revisionsLoading = ref(false)
const revisionsError = ref('')
const form = reactive({ section_key: '', title_en: '', title_ar: '', description_en: '', description_ar: '', is_published: true, published_at: '', publish_until: '', meta_title_en: '', meta_title_ar: '', meta_description_en: '', meta_description_ar: '' })
const localDateTime = (value: string | null) => value ? new Date(value).toISOString().slice(0, 16) : ''

async function load() {
  loading.value = true
  error.value = ''
  try { pages.value = (await request<StorePage[]>('/admin/static-pages')).data || [] }
  catch (exception: any) { error.value = exception?.data?.message || 'Could not load store pages.' }
  finally { loading.value = false }
}

function newPage() {
  editingId.value = null
  editingKey.value = ''
  Object.assign(form, { section_key: '', title_en: '', title_ar: '', description_en: '', description_ar: '', is_published: true, published_at: '', publish_until: '', meta_title_en: '', meta_title_ar: '', meta_description_en: '', meta_description_ar: '' })
  revisions.value = []
  if (imageInput.value) imageInput.value.value = ''
}

function edit(page: StorePage) {
  editingId.value = page.id
  editingKey.value = page.section_key
  Object.assign(form, { section_key: page.section_key, title_en: page.title_en || '', title_ar: page.title_ar || '', description_en: page.description_en || '', description_ar: page.description_ar || '', is_published: page.is_published, published_at: localDateTime(page.published_at), publish_until: localDateTime(page.publish_until), meta_title_en: page.meta_title_en || '', meta_title_ar: page.meta_title_ar || '', meta_description_en: page.meta_description_en || '', meta_description_ar: page.meta_description_ar || '' })
  void loadRevisions()
  if (imageInput.value) imageInput.value.value = ''
}

async function save() {
  saving.value = true
  error.value = ''
  notice.value = ''
  try {
    const file = imageInput.value?.files?.[0]
    const payload = { ...form, published_at: form.published_at || null, publish_until: form.publish_until || null }
    const body = file ? new FormData() : payload
    if (body instanceof FormData) {
      Object.entries(payload).forEach(([key, value]) => body.append(key, typeof value === 'boolean' ? (value ? '1' : '0') : String(value ?? '')))
      body.append('image', file as File)
      if (editingId.value) body.append('_method', 'PUT')
    }
    const path = editingId.value ? `/admin/static-pages/${encodeURIComponent(editingKey.value)}` : '/admin/static-pages'
    await request(path, { method: editingId.value && !file ? 'PUT' : 'POST', body })
    notice.value = editingId.value ? 'Store page updated.' : 'Store page created.'
    newPage()
    await load()
  } catch (exception: any) {
    error.value = exception?.data?.message || 'Could not save this page.'
  } finally {
    saving.value = false
  }
}

async function loadRevisions() {
  if (!editingKey.value) return
  revisionsLoading.value = true
  revisionsError.value = ''
  try { revisions.value = (await request<PageRevision[]>(`/admin/static-pages/${encodeURIComponent(editingKey.value)}/revisions`)).data || [] }
  catch (exception: any) { revisionsError.value = exception?.data?.message || 'Could not load revision history.' }
  finally { revisionsLoading.value = false }
}

async function removePage() {
  if (!editingId.value || !window.confirm('Delete this store page?')) return
  saving.value = true
  error.value = ''
  try {
    await request(`/admin/static-pages/${encodeURIComponent(editingKey.value)}`, { method: 'DELETE' })
    notice.value = 'Store page moved to trash.'
    newPage()
    await load()
  } catch (exception: any) { error.value = exception?.data?.message || 'Could not delete this page.' }
  finally { saving.value = false }
}

onMounted(load)
</script>

<style scoped>
.content-page{max-width:1450px;margin:0 auto;padding:32px 18px 64px;color:var(--theme-text)}header,.section-heading{display:flex;justify-content:space-between;align-items:center;gap:16px}header{margin-bottom:20px}header h1{margin:3px 0;font-size:30px}header p:last-child{margin:4px 0;color:var(--theme-muted)}.eyebrow{margin:0;color:var(--theme-primary);font-size:11px;font-weight:800;letter-spacing:.13em}.content-layout{display:grid;grid-template-columns:minmax(250px,.6fr) minmax(0,1.4fr);gap:16px;align-items:start}.panel{padding:18px;border:1px solid var(--line);border-radius:14px;background:var(--theme-surface)}h2{margin:0;font-size:19px}.section-heading{margin-bottom:12px}.button{min-height:39px;padding:8px 12px;border:1px solid var(--line);border-radius:8px;background:var(--theme-surface);color:var(--theme-text);font:inherit;font-weight:700;cursor:pointer}.button.primary{background:var(--theme-primary);border-color:var(--theme-primary);color:var(--theme-on-primary)}.button.danger{color:#a52f28}.button:disabled{opacity:.5}.page-row{display:flex;width:100%;justify-content:space-between;gap:8px;padding:12px 8px;border:0;border-top:1px solid var(--line);background:transparent;color:var(--theme-text);text-align:left;cursor:pointer}.page-row.selected{background:color-mix(in srgb,var(--theme-primary) 9%,transparent)}.page-row span{min-width:0}.page-row strong,.page-row small{display:block}.page-row small,.muted{color:var(--theme-muted)}.page-row>small{text-align:right}.form-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px;margin-top:16px}.form-grid label{display:grid;gap:6px;color:var(--theme-muted);font-size:13px}.form-grid input,.form-grid textarea,.form-grid select{width:100%;padding:9px;border:1px solid var(--line);border-radius:8px;background:var(--theme-surface);color:var(--theme-text);font:inherit}.wide{grid-column:1/-1}.actions{display:flex;gap:8px;margin-top:14px}.notice{padding:11px 13px;border-radius:9px}.notice.error{background:#fff0ef;color:#a52f28}.notice.success{background:#e5f6ec;color:#087443}.seo-preview{display:grid;gap:6px;padding:14px;border:1px solid var(--line);border-radius:10px;background:color-mix(in srgb,var(--theme-primary) 5%,var(--theme-surface))}.seo-preview>small{color:var(--theme-muted);font-size:11px}.seo-preview>strong{color:#1a5a31;font-size:17px}.seo-preview>p{margin:0;color:#4c5964;font-size:13px;line-height:1.5}.revision-history{margin-top:24px;padding-top:18px;border-top:1px solid var(--line)}.revision-history .section-heading{margin-bottom:10px}.revision-row{display:flex;gap:14px;align-items:center;padding:9px 0;border-top:1px solid var(--line);font-size:13px}.revision-row span,.revision-row time{color:var(--theme-muted)}.revision-row time{margin-inline-start:auto}@media(max-width:850px){.content-layout{grid-template-columns:1fr}}@media(max-width:560px){header{align-items:flex-start;flex-direction:column}.form-grid{grid-template-columns:1fr}.wide{grid-column:auto}.panel{padding:14px}}
</style>
