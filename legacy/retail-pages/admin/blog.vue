<template>
  <main class="blog-admin">
    <header><div><p class="eyebrow">3B / ADMIN</p><h1>Blog</h1><p>Manage bilingual buying guides and store announcements.</p></div><button class="button secondary" :disabled="loading" @click="load">Refresh</button></header>
    <p v-if="error" class="notice error" role="alert">{{ error }}</p><p v-if="notice" class="notice success" role="status">{{ notice }}</p>
    <div class="blog-layout">
      <section class="panel posts"><div class="section-heading"><h2>Articles</h2><button class="button primary" @click="newPost">New article</button></div>
        <button v-for="post in posts" :key="post.id" class="post-row" :class="{ selected: editingId === post.id }" @click="edit(post)"><span><strong>{{ post.title_en || post.title || post.slug }}</strong><small>/{{ post.slug }}</small></span><span class="state" :class="{ published: post.is_active }">{{ post.is_active ? 'Published' : 'Draft' }}</span></button>
        <p v-if="!posts.length && !loading" class="muted">No articles are available.</p><div class="pagination"><button class="button secondary" :disabled="page <= 1 || loading" @click="changePage(page - 1)">Previous</button><span>Page {{ page }} of {{ totalPages }}</span><button class="button secondary" :disabled="page >= totalPages || loading" @click="changePage(page + 1)">Next</button></div>
      </section>
      <section class="panel editor"><h2>{{ editingId ? 'Edit article' : 'Create article' }}</h2><form @submit.prevent="save"><div class="form-grid">
        <label>English title<input v-model.trim="form.title_en" maxlength="255"></label><label>Arabic title<input v-model.trim="form.title_ar" maxlength="255" dir="rtl"></label>
        <label>URL slug<input v-model.trim="form.slug" maxlength="255" required pattern="[A-Za-z0-9-]+"></label><label>Publish date<input v-model="form.published_at" type="datetime-local"></label>
        <label class="wide">English summary<textarea v-model="form.description_en" rows="3"></textarea></label><label class="wide" dir="rtl">الملخص بالعربية<textarea v-model="form.description_ar" rows="3" dir="rtl"></textarea></label>
        <label class="wide">English article<textarea v-model="form.content_en" rows="9"></textarea></label><label class="wide" dir="rtl">محتوى المقال بالعربية<textarea v-model="form.content_ar" rows="9" dir="rtl"></textarea></label>
        <label class="wide">Cover image<input ref="imageInput" type="file" accept="image/jpeg,image/png,image/webp"></label>
        <label class="check"><input v-model="form.is_active" type="checkbox"> Visible to customers</label>
      </div><div class="actions"><button class="button primary" :disabled="saving">{{ saving ? 'Saving…' : editingId ? 'Save article' : 'Create article' }}</button><button v-if="editingId" class="button secondary" type="button" @click="newPost">Cancel</button><button v-if="editingId" class="button danger" type="button" :disabled="saving" @click="removePost">Delete</button></div></form></section>
    </div>
  </main>
</template>

<script setup lang="ts">
definePageMeta({ middleware: ['admin'], adminPermission: 'content.manage' })

type BlogPost = { id: number; title_en: string | null; title_ar: string | null; title?: string; description_en: string | null; description_ar: string | null; content_en: string | null; content_ar: string | null; slug: string; is_active: boolean; published_at: string | null }
const route = useRoute()
const router = useRouter()
const { request } = useApi()
const posts = ref<BlogPost[]>([])
const editingId = ref<number | null>(null)
const imageInput = ref<HTMLInputElement | null>(null)
const page = ref(Number(route.query.page || 1))
const totalPages = ref(1)
const loading = ref(false)
const saving = ref(false)
const error = ref('')
const notice = ref('')
const emptyForm = () => ({ title_en: '', title_ar: '', slug: '', description_en: '', description_ar: '', content_en: '', content_ar: '', published_at: '', is_active: false })
const form = reactive(emptyForm())

async function load() {
  loading.value = true
  error.value = ''
  try {
    const response = await request<any>(`/admin/blogs?per_page=20&page=${route.query.page || 1}`)
    const payload = response.data
    posts.value = Array.isArray(payload) ? payload : payload?.data || []
    const meta = payload?.pagination || payload?.meta || {}
    page.value = Number(meta.current_page || route.query.page || 1)
    totalPages.value = Number(meta.total_pages || meta.last_page || 1)
  } catch (exception: any) { error.value = exception?.data?.message || 'Could not load articles.' }
  finally { loading.value = false }
}

function newPost() { editingId.value = null; Object.assign(form, emptyForm()); if (imageInput.value) imageInput.value.value = '' }
function edit(post: BlogPost) {
  editingId.value = post.id
  Object.assign(form, { title_en: post.title_en || '', title_ar: post.title_ar || '', slug: post.slug, description_en: post.description_en || '', description_ar: post.description_ar || '', content_en: post.content_en || '', content_ar: post.content_ar || '', published_at: post.published_at ? new Date(post.published_at).toISOString().slice(0, 16) : '', is_active: post.is_active })
  if (imageInput.value) imageInput.value.value = ''
}

async function save() {
  saving.value = true; error.value = ''; notice.value = ''
  try {
    const file = imageInput.value?.files?.[0]
    const body: FormData | Record<string, unknown> = file ? new FormData() : { ...form }
    if (body instanceof FormData) {
      Object.entries(form).forEach(([key, value]) => body.append(key, String(value ?? '')))
      body.append('image', file as File)
      if (editingId.value) body.append('_method', 'PUT')
    }
    const path = editingId.value ? `/admin/blogs/${editingId.value}` : '/admin/blogs'
    await request(path, { method: editingId.value && !file ? 'PUT' : 'POST', body })
    notice.value = editingId.value ? 'Article updated.' : 'Article created.'
    newPost(); await load()
  } catch (exception: any) { error.value = exception?.data?.message || 'Could not save this article.' }
  finally { saving.value = false }
}

async function removePost() {
  if (!editingId.value || !window.confirm('Delete this article?')) return
  saving.value = true; error.value = ''
  try { await request(`/admin/blogs/${editingId.value}`, { method: 'DELETE' }); notice.value = 'Article moved to trash.'; newPost(); await load() }
  catch (exception: any) { error.value = exception?.data?.message || 'Could not delete this article.' }
  finally { saving.value = false }
}

async function changePage(nextPage: number) { await router.replace({ query: { page: String(nextPage) } }) }
watch(() => route.query.page, () => load())
onMounted(load)
</script>

<style scoped>
.blog-admin{max-width:1500px;margin:0 auto;padding:32px 18px 64px;color:var(--theme-text)}header,.section-heading{display:flex;justify-content:space-between;align-items:center;gap:14px}header{margin-bottom:20px}header h1{margin:3px 0;font-size:30px}header p:last-child{margin:4px 0;color:var(--theme-muted)}.eyebrow{margin:0;color:var(--theme-primary);font-size:11px;font-weight:800;letter-spacing:.13em}.blog-layout{display:grid;grid-template-columns:minmax(250px,.6fr) minmax(0,1.4fr);gap:16px;align-items:start}.panel{padding:18px;border:1px solid var(--line);border-radius:14px;background:var(--theme-surface)}h2{margin:0;font-size:19px}.section-heading{margin-bottom:10px}.button{min-height:39px;padding:8px 12px;border:1px solid var(--line);border-radius:8px;background:var(--theme-surface);color:var(--theme-text);font:inherit;font-weight:700;cursor:pointer}.button.primary{background:var(--theme-primary);border-color:var(--theme-primary);color:var(--theme-on-primary)}.button.danger{color:#a52f28}.button:disabled{opacity:.5}.post-row{display:flex;width:100%;justify-content:space-between;gap:8px;padding:12px 7px;border:0;border-top:1px solid var(--line);background:transparent;color:var(--theme-text);text-align:left;cursor:pointer}.post-row.selected{background:color-mix(in srgb,var(--theme-primary) 9%,transparent)}.post-row strong,.post-row small{display:block}.post-row small,.muted{color:var(--theme-muted)}.state{align-self:center;padding:4px 7px;border-radius:99px;background:#f1f3f5;font-size:11px}.state.published{background:#e5f6ec;color:#087443}.form-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px;margin-top:15px}.form-grid label{display:grid;gap:6px;color:var(--theme-muted);font-size:13px}.form-grid input,.form-grid textarea{width:100%;padding:9px;border:1px solid var(--line);border-radius:8px;background:var(--theme-surface);color:var(--theme-text);font:inherit}.form-grid .wide{grid-column:1/-1}.form-grid .check{display:flex;align-items:center}.actions{display:flex;gap:8px;margin-top:14px}.pagination{display:flex;justify-content:space-between;align-items:center;gap:8px;margin-top:14px;color:var(--theme-muted);font-size:12px}.notice{padding:11px 13px;border-radius:9px}.notice.error{background:#fff0ef;color:#a52f28}.notice.success{background:#e5f6ec;color:#087443}@media(max-width:850px){.blog-layout{grid-template-columns:1fr}}@media(max-width:560px){header{align-items:flex-start;flex-direction:column}.form-grid{grid-template-columns:1fr}.form-grid .wide{grid-column:auto}.panel{padding:14px}}
</style>
