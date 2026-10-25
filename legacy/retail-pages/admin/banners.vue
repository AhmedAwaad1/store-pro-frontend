<template>
  <main class="admin-page section">
    <div class="container">
      <header class="admin-heading"><div><p class="eyebrow">3B ADMIN</p><h1>Homepage banners</h1><p>Manage the campaign carousel and upload separate desktop and mobile artwork.</p></div><button type="button" class="btn secondary" @click="loadBanners">Refresh banners</button></header>
      <p v-if="error" class="notice error" role="alert">{{ error }}</p><p v-if="notice" class="notice success" role="status">{{ notice }}</p>

      <section class="panel editor-panel">
        <div class="panel-heading"><h2>{{ editingId ? 'Edit campaign slide' : 'Add campaign slide' }}</h2><button v-if="editingId" type="button" class="quiet" @click="resetForm">Cancel edit</button></div>
        <form class="banner-form" @submit.prevent="saveBanner">
          <div class="form-grid">
            <label>Campaign location<select v-model="form.banner_type"><option value="home">Homepage carousel</option><option value="middle">Secondary campaign</option></select></label>
            <label>Sort order<input v-model.number="form.sort_order" type="number" min="0" max="65535"></label>
            <label>English title<input v-model.trim="form.title_en" maxlength="255" required></label>
            <label>Arabic title<input v-model.trim="form.title_ar" maxlength="255" dir="rtl" required></label>
            <label>English description<textarea v-model.trim="form.description_en" rows="3" maxlength="2000"></textarea></label>
            <label>Arabic description<textarea v-model.trim="form.description_ar" rows="3" maxlength="2000" dir="rtl"></textarea></label>
            <label>Campaign URL<input v-model.trim="form.url" type="url" placeholder="https://… or /offers"></label>
            <label>English image alt text<input v-model.trim="form.alt_en" maxlength="255"></label>
            <label>Arabic image alt text<input v-model.trim="form.alt_ar" maxlength="255" dir="rtl"></label>
            <label>Desktop image <small>JPEG, PNG, or WebP · up to 2 MB</small><input ref="desktopFile" type="file" accept="image/jpeg,image/png,image/webp" :required="!editingId"></label>
            <label>Mobile image <small>Optional portrait crop · up to 2 MB</small><input ref="mobileFile" type="file" accept="image/jpeg,image/png,image/webp"></label>
            <label class="active-toggle"><input v-model="form.is_active" type="checkbox"> Show this campaign</label>
          </div>
          <div class="form-actions"><button class="btn primary" :disabled="saving">{{ saving ? 'Saving…' : editingId ? 'Save changes' : 'Add campaign' }}</button></div>
        </form>
      </section>

      <section class="panel list-panel">
        <div class="panel-heading"><div><h2>Campaign slides</h2><p>Active slides appear in the customer homepage carousel.</p></div><span>{{ banners.length }} saved</span></div>
        <div v-if="!banners.length" class="empty-state">No banners yet. Add an image and campaign text above.</div>
        <article v-for="banner in banners" :key="banner.id" class="banner-row">
          <img :src="banner.thumbnails?.medium || banner.image" :alt="banner.alt_en || banner.title_en || banner.title || ''" width="160" height="72" loading="lazy">
          <div class="banner-copy"><strong>{{ banner.title_en || banner.title }}</strong><span>{{ banner.banner_type === 'middle' ? 'Secondary campaign' : 'Homepage carousel' }} · order {{ banner.sort_order }}</span><small>{{ banner.is_active ? 'Active' : 'Hidden' }}<template v-if="banner.mobile_image"> · mobile image set</template></small></div>
          <div class="row-actions"><button type="button" class="quiet" @click="editBanner(banner)">Edit</button><button type="button" class="quiet danger" @click="removeBanner(banner)">Delete</button></div>
        </article>
      </section>
    </div>
  </main>
</template>

<script setup lang="ts">
definePageMeta({ middleware: ['admin'], adminPermission: 'merchandising.manage' })
const { request } = useApi()
type Banner = { id: number; title?: string; title_en?: string; title_ar?: string; description_en?: string; description_ar?: string; image: string; mobile_image: string | null; thumbnails?: { medium?: string | null }; alt_en?: string | null; alt_ar?: string | null; url: string | null; banner_type: string; sort_order: number; is_active: boolean }
const banners = ref<Banner[]>([])
const desktopFile = ref<HTMLInputElement | null>(null)
const mobileFile = ref<HTMLInputElement | null>(null)
const editingId = ref<number | null>(null)
const saving = ref(false)
const error = ref('')
const notice = ref('')
const form = reactive({ banner_type: 'home', title_en: '', title_ar: '', description_en: '', description_ar: '', alt_en: '', alt_ar: '', url: '', sort_order: 0, is_active: true })

const loadBanners = async () => {
  error.value = ''
  try {
    const response = await request<Banner[]>('/admin/banners')
    banners.value = (response.data || []).sort((a, b) => a.sort_order - b.sort_order || a.id - b.id)
  } catch (exception: any) {
    error.value = exception?.data?.message || 'Could not load banners. Sign in as an administrator and retry.'
  }
}
const resetForm = () => {
  editingId.value = null
  Object.assign(form, { banner_type: 'home', title_en: '', title_ar: '', description_en: '', description_ar: '', alt_en: '', alt_ar: '', url: '', sort_order: 0, is_active: true })
  if (desktopFile.value) desktopFile.value.value = ''
  if (mobileFile.value) mobileFile.value.value = ''
}
const editBanner = (banner: Banner) => {
  editingId.value = banner.id
  Object.assign(form, { banner_type: banner.banner_type === 'middle' ? 'middle' : 'home', title_en: banner.title_en || banner.title || '', title_ar: banner.title_ar || banner.title || '', description_en: banner.description_en || '', description_ar: banner.description_ar || '', alt_en: banner.alt_en || '', alt_ar: banner.alt_ar || '', url: banner.url || '', sort_order: banner.sort_order || 0, is_active: banner.is_active })
  window.scrollTo({ top: 0, behavior: 'smooth' })
}
const saveBanner = async () => {
  if (saving.value) return
  saving.value = true
  error.value = ''
  notice.value = ''
  const body = new FormData()
  Object.entries(form).forEach(([key, value]) => body.append(key, String(value)))
  if (desktopFile.value?.files?.[0]) body.append('image', desktopFile.value.files[0])
  if (mobileFile.value?.files?.[0]) body.append('mobile_image', mobileFile.value.files[0])
  if (editingId.value) body.append('_method', 'PUT')
  try {
    await request(editingId.value ? `/banner/${editingId.value}` : '/banner', { method: 'POST', body })
    notice.value = editingId.value ? 'Campaign updated.' : 'Campaign added.'
    resetForm()
    await loadBanners()
  } catch (exception: any) {
    error.value = exception?.data?.message || Object.values(exception?.data?.errors || {})[0]?.[0] || 'Could not save this campaign.'
  } finally {
    saving.value = false
  }
}
const removeBanner = async (banner: Banner) => {
  if (!window.confirm(`Delete “${banner.title_en || banner.title || 'this campaign'}”?`)) return
  error.value = ''
  notice.value = ''
  try {
    await request(`/banner/${banner.id}`, { method: 'DELETE' })
    notice.value = 'Campaign deleted.'
    if (editingId.value === banner.id) resetForm()
    await loadBanners()
  } catch (exception: any) {
    error.value = exception?.data?.message || 'Could not delete this campaign.'
  }
}
onMounted(loadBanners)
</script>

<style scoped>
.admin-page{min-height:75vh}.admin-heading,.panel-heading{display:flex;justify-content:space-between;align-items:center;gap:18px}.admin-heading{margin-bottom:24px}.admin-heading h1{margin:0}.admin-heading p,.panel-heading p{margin:3px 0;color:var(--theme-muted)}.panel{margin:18px 0;padding:22px;background:var(--theme-surface);border:1px solid var(--line);border-radius:15px}.panel-heading{margin-bottom:16px}.panel-heading h2{margin:0;font-size:1.2rem}.panel-heading>span{color:var(--theme-muted);font-size:.85rem}.banner-form .form-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:14px}.banner-form label{display:flex;flex-direction:column;gap:6px;font-size:.85rem;font-weight:700}.banner-form label small{font-weight:400;color:var(--theme-muted)}.banner-form input:not([type=checkbox]),.banner-form select,.banner-form textarea{width:100%;padding:10px;border:1px solid var(--line);border-radius:9px;background:var(--theme-surface);color:var(--theme-text)}.banner-form input[type=file]{padding:8px}.banner-form .active-toggle{flex-direction:row;align-items:center}.active-toggle input{width:18px;height:18px}.form-actions{display:flex;justify-content:flex-end;margin-top:16px}.banner-row{display:grid;grid-template-columns:160px 1fr auto;align-items:center;gap:16px;padding:13px 0;border-top:1px solid var(--line)}.banner-row>img{width:160px;height:72px;object-fit:cover;border-radius:8px;background:var(--theme-soft)}.banner-copy strong,.banner-copy span,.banner-copy small{display:block}.banner-copy span,.banner-copy small{color:var(--theme-muted);font-size:.8rem}.row-actions{display:flex;gap:8px}.quiet{border:1px solid var(--line);border-radius:8px;background:var(--theme-surface);padding:8px 11px;color:var(--theme-text)}.danger{color:#b42318}.notice{padding:12px 14px;border-radius:8px}.notice.error{background:#fff0ee;color:#9f2720}.notice.success{background:#e8f5ef;color:#176b45}.empty-state{padding:28px;text-align:center;border:1px dashed var(--line);border-radius:10px;color:var(--theme-muted)}
@media(max-width:700px){.admin-heading{align-items:flex-start;flex-direction:column}.panel{padding:15px}.banner-form .form-grid{grid-template-columns:1fr}.banner-row{grid-template-columns:80px 1fr;gap:11px}.banner-row>img{width:80px;height:66px}.row-actions{grid-column:2;justify-content:flex-end}}
</style>
