<template>
  <main class="settings-page">
    <header><div><p class="eyebrow">3B / ADMIN</p><h1>Store settings</h1><p>Manage the active storefront theme and shared brand images.</p></div><button class="button secondary" :disabled="loading" @click="load">Refresh</button></header>
    <p v-if="error" class="notice error" role="alert">{{ error }}</p><p v-if="notice" class="notice success" role="status">{{ notice }}</p>
    <section v-if="settings" class="panel"><h2>Store identity</h2><div class="brand-images"><div><span>Store logo</span><img v-if="settings.logo_url" :src="settings.logo_thumbnails?.medium || settings.logo_url" alt="Current store logo"><small v-else>No store logo uploaded</small><input ref="logoInput" type="file" accept="image/jpeg,image/png,image/webp" @change="uploadImage('logo')"></div><div><span>Registration page image</span><img v-if="settings.registration_image_url" :src="settings.registration_image_url" alt="Current registration image"><small v-else>No registration image uploaded</small><input ref="registrationInput" type="file" accept="image/jpeg,image/png,image/webp" @change="uploadImage('registration_image')"></div></div></section>
    <section v-if="settings" class="panel"><h2>Storefront theme</h2><p class="muted">Choose one theme preset. The selection is saved server-side and shared across visitors.</p><div class="themes"><label v-for="theme in settings.themes" :key="theme.key" class="theme-card" :class="{ active: selectedTheme === theme.key }"><input v-model="selectedTheme" type="radio" name="theme" :value="theme.key"><span class="swatches"><i v-for="color in theme.preview" :key="color" :style="{ background: color }"></i></span><strong>{{ theme.name }}</strong><small>{{ theme.mode }} · {{ theme.key }}</small></label></div><button class="button primary" :disabled="saving || selectedTheme === settings.active_theme_key" @click="saveTheme">{{ saving ? 'Saving…' : 'Apply theme' }}</button></section>
  </main>
</template>

<script setup lang="ts">
import { isThemeKey } from '~/constants/themes'

definePageMeta({ middleware: ['admin'], superAdminOnly: true })

type StoreSettings = { active_theme_key: string; theme: { key: string; name: string }; themes: Array<{ key: string; name: string; mode: string; preview: string[] }>; logo_url: string | null; logo_thumbnails?: { medium?: string | null }; registration_image_url: string | null }
const { request } = useApi()
const { applyTheme } = useTheme()
const settings = ref<StoreSettings | null>(null)
const selectedTheme = ref('')
const logoInput = ref<HTMLInputElement | null>(null)
const registrationInput = ref<HTMLInputElement | null>(null)
const loading = ref(false)
const saving = ref(false)
const error = ref('')
const notice = ref('')

async function load() {
  loading.value = true; error.value = ''
  try { settings.value = (await request<StoreSettings>('/admin/settings')).data; selectedTheme.value = settings.value.active_theme_key }
  catch (exception: any) { error.value = exception?.data?.message || 'Could not load store settings.' }
  finally { loading.value = false }
}

async function saveTheme() {
  if (!selectedTheme.value) return
  saving.value = true; error.value = ''; notice.value = ''
  try {
    settings.value = (await request<StoreSettings>('/admin/settings/theme', { method: 'PUT', body: { theme_key: selectedTheme.value } })).data
    selectedTheme.value = settings.value.active_theme_key
    if (isThemeKey(settings.value.active_theme_key)) applyTheme(settings.value.active_theme_key)
    notice.value = 'Store theme updated.'
  }
  catch (exception: any) { error.value = exception?.data?.message || 'Could not update the store theme.' }
  finally { saving.value = false }
}

async function uploadImage(kind: 'logo' | 'registration_image') {
  const input = kind === 'logo' ? logoInput.value : registrationInput.value
  const file = input?.files?.[0]
  if (!file) return
  const body = new FormData(); body.append(kind, file)
  saving.value = true; error.value = ''; notice.value = ''
  try { settings.value = (await request<StoreSettings>(`/admin/settings/${kind === 'logo' ? 'logo' : 'registration-image'}`, { method: 'POST', body })).data; notice.value = 'Store image updated.' }
  catch (exception: any) { error.value = exception?.data?.message || 'Could not upload this image.' }
  finally { saving.value = false; if (input) input.value = '' }
}

onMounted(load)
</script>

<style scoped>
.settings-page{max-width:1200px;margin:0 auto;padding:32px 18px 64px;color:var(--theme-text)}header{display:flex;justify-content:space-between;align-items:center;gap:14px;margin-bottom:20px}header h1{margin:3px 0;font-size:30px}header p:last-child,.muted{margin:4px 0;color:var(--theme-muted)}.eyebrow{margin:0;color:var(--theme-primary);font-size:11px;font-weight:800;letter-spacing:.13em}.panel{margin-bottom:14px;padding:19px;border:1px solid var(--line);border-radius:14px;background:var(--theme-surface)}h2{margin:0 0 8px;font-size:19px}.button{min-height:39px;padding:8px 12px;border:1px solid var(--line);border-radius:8px;background:var(--theme-surface);color:var(--theme-text);font:inherit;font-weight:700;cursor:pointer}.button.primary{background:var(--theme-primary);border-color:var(--theme-primary);color:var(--theme-on-primary)}.button:disabled{opacity:.5}.brand-images{display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-top:14px}.brand-images>div{display:grid;gap:8px;align-content:start}.brand-images img{width:100%;max-width:300px;height:120px;object-fit:contain;border:1px solid var(--line);border-radius:9px;padding:9px}.brand-images span{font-weight:700}.brand-images small{color:var(--theme-muted)}.themes{display:grid;grid-template-columns:repeat(auto-fit,minmax(190px,1fr));gap:10px;margin:16px 0}.theme-card{display:grid;gap:8px;padding:12px;border:1px solid var(--line);border-radius:10px;cursor:pointer}.theme-card.active{border-color:var(--theme-primary);box-shadow:0 0 0 1px var(--theme-primary)}.swatches{display:flex;height:25px;border-radius:6px;overflow:hidden}.swatches i{flex:1}.theme-card small{color:var(--theme-muted)}.notice{padding:11px 13px;border-radius:9px}.notice.error{background:#fff0ef;color:#a52f28}.notice.success{background:#e5f6ec;color:#087443}@media(max-width:620px){header{align-items:flex-start;flex-direction:column}.brand-images{grid-template-columns:1fr}.panel{padding:14px}}
</style>
