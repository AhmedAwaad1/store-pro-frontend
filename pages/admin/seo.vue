<template>
  <main class="admin-page">
    <header><div><p class="eyebrow">STOREPRO / الإدارة</p><h1>إعادة توجيه الروابط</h1><p>حافظ على فاعلية الروابط القديمة عند تغيير مسارات صفحات الموقع.</p></div><button class="button secondary" :disabled="loading" @click="load">تحديث</button></header>
    <p v-if="error" class="notice error" role="alert">{{ error }}</p><p v-if="notice" class="notice success" role="status">{{ notice }}</p>
    <section class="panel">
      <h2>{{ editingId ? 'Edit redirect' : 'Add redirect' }}</h2>
      <form class="form-grid" @submit.prevent="save">
        <label>Old path<input v-model.trim="form.source_path" placeholder="/old-product-name" required maxlength="500"></label>
        <label>Response<select v-model.number="form.response_code"><option :value="301">301 · Permanent</option><option :value="302">302 · Temporary</option><option :value="410">410 · Removed</option></select></label>
        <label v-if="form.response_code !== 410">New path<input v-model.trim="form.destination_path" placeholder="/product/new-product-name" maxlength="500" :required="form.response_code !== 410"></label>
        <label v-if="editingId" class="check"><input v-model="form.is_active" type="checkbox"> Active</label>
        <div class="actions"><button class="button primary" :disabled="saving">{{ saving ? 'Saving…' : editingId ? 'Save redirect' : 'Add redirect' }}</button><button v-if="editingId" type="button" class="button secondary" @click="reset">Cancel</button></div>
      </form>
    </section>
    <section class="panel">
      <h2>Configured paths</h2>
      <div class="table-wrap"><table><thead><tr><th>Old path</th><th>Destination</th><th>Code</th><th>Visits</th><th>Status</th><th></th></tr></thead><tbody>
        <tr v-for="item in redirects" :key="item.id"><td><code>{{ item.source_path }}</code></td><td><code>{{ item.destination_path || '—' }}</code></td><td>{{ item.response_code }}</td><td>{{ item.visit_count }}</td><td>{{ item.is_active ? 'Active' : 'Paused' }}</td><td><button class="button secondary" @click="edit(item)">Edit</button> <button class="button danger" @click="remove(item)">Delete</button></td></tr>
        <tr v-if="!redirects.length"><td colspan="6" class="empty">No redirects configured.</td></tr>
      </tbody></table></div>
      <div class="pagination"><button class="button secondary" :disabled="page <= 1 || loading" @click="page--; load()">Previous</button><span>Page {{ page }}<template v-if="lastPage"> of {{ lastPage }}</template></span><button class="button secondary" :disabled="(lastPage && page >= lastPage) || loading" @click="page++; load()">Next</button></div>
    </section>
  </main>
</template>

<script setup lang="ts">
definePageMeta({ middleware: ['admin'], adminPermission: 'content.manage' })

type Redirect = { id: number; source_path: string; destination_path: string | null; response_code: 301 | 302 | 410; is_active: boolean; visit_count: number }
const { request } = useApi()
const redirects = ref<Redirect[]>([])
const page = ref(1)
const lastPage = ref(1)
const loading = ref(false)
const saving = ref(false)
const error = ref('')
const notice = ref('')
const editingId = ref<number | null>(null)
const form = reactive({ source_path: '', destination_path: '', response_code: 301 as 301 | 302 | 410, is_active: true })
function reset() { editingId.value = null; Object.assign(form, { source_path: '', destination_path: '', response_code: 301, is_active: true }) }
function edit(item: Redirect) { editingId.value = item.id; Object.assign(form, { source_path: item.source_path, destination_path: item.destination_path || '', response_code: item.response_code, is_active: item.is_active }) }
async function load() {
  loading.value = true; error.value = ''
  try { const response = await request<any>(`/admin/seo/redirects?page=${page.value}`); redirects.value = response.data?.data || []; lastPage.value = response.data?.last_page || 1 }
  catch (exception: any) { error.value = exception?.data?.message || 'Could not load redirects.' }
  finally { loading.value = false }
}
async function save() {
  saving.value = true; error.value = ''; notice.value = ''
  try {
    const body = { ...form, destination_path: form.response_code === 410 ? null : form.destination_path }
    await request(editingId.value ? `/admin/seo/redirects/${editingId.value}` : '/admin/seo/redirects', { method: editingId.value ? 'PUT' : 'POST', body })
    notice.value = editingId.value ? 'Redirect updated.' : 'Redirect created.'; reset(); await load()
  } catch (exception: any) { error.value = exception?.data?.message || 'Could not save this redirect.' }
  finally { saving.value = false }
}
async function remove(item: Redirect) {
  if (!window.confirm(`Delete redirect for ${item.source_path}?`)) return
  try { await request(`/admin/seo/redirects/${item.id}`, { method: 'DELETE' }); notice.value = 'Redirect deleted.'; await load() }
  catch (exception: any) { error.value = exception?.data?.message || 'Could not delete this redirect.' }
}
onMounted(load)
</script>

<style scoped>
.admin-page{max-width:1400px;margin:0 auto;padding:32px 18px 64px;color:var(--theme-text)}header{display:flex;justify-content:space-between;align-items:center;gap:16px;margin-bottom:20px}header h1{margin:3px 0;font-size:30px}header p:last-child{margin:4px 0;color:var(--theme-muted)}.eyebrow{margin:0;color:var(--theme-primary);font-size:11px;font-weight:800;letter-spacing:.13em}.panel{padding:18px;margin-bottom:14px;border:1px solid var(--line);border-radius:14px;background:var(--theme-surface)}h2{margin:0 0 14px;font-size:19px}.form-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:12px}.form-grid label{display:grid;gap:6px;color:var(--theme-muted);font-size:13px}.form-grid input,.form-grid select{min-height:40px;padding:8px;border:1px solid var(--line);border-radius:8px;background:var(--theme-surface);color:var(--theme-text);font:inherit}.form-grid .check{display:flex;align-items:center;gap:8px}.actions{display:flex;align-items:end;gap:8px}.button{min-height:39px;padding:8px 12px;border:1px solid var(--line);border-radius:8px;background:var(--theme-surface);color:var(--theme-text);font:inherit;font-weight:700;cursor:pointer}.button.primary{background:var(--theme-primary);border-color:var(--theme-primary);color:var(--theme-on-primary)}.button.danger{color:#a52f28}.button:disabled{opacity:.5}.table-wrap{overflow:auto}table{width:100%;border-collapse:collapse;font-size:13px}th,td{padding:10px;text-align:start;border-bottom:1px solid var(--line)}th{color:var(--theme-muted)}code{overflow-wrap:anywhere}.empty{padding:24px;text-align:center;color:var(--theme-muted)}.pagination{display:flex;justify-content:center;align-items:center;gap:14px;margin-top:14px}.notice{padding:11px 13px;border-radius:9px}.notice.error{background:#fff0ef;color:#a52f28}.notice.success{background:#e5f6ec;color:#087443}@media(max-width:760px){header{align-items:flex-start;flex-direction:column}.form-grid{grid-template-columns:1fr}.actions{grid-column:1/-1}}
</style>
