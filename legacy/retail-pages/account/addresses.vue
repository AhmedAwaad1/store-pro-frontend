<template>
  <main>
    <PageHero :eyebrow="t('accountTitle')" :title="t('addresses')" :description="t('addressesDescription')" />
    <section class="section"><div class="container account-shell"><AccountNav /><div>
      <div class="section-head"><div><h2>{{ t('myAddresses') }}</h2><p>{{ addresses.length ? addressCountText : emptyAddressText }}</p></div><button class="btn primary" @click="openCreate"><Plus />{{ t('addAddress') }}</button></div>
      <div v-if="pending" class="address-state">{{ isEnglish ? 'Loading addresses…' : 'جاري تحميل العناوين…' }}</div>
      <div v-else-if="!addresses.length" class="address-state">{{ emptyAddressText }}</div>
      <article v-for="address in addresses" :key="address.id" class="address-card">
        <div class="address-icon"><Home /></div>
        <div><span v-if="address.is_default" class="default-badge">{{ t('defaultAddress') }}</span><h3>{{ isEnglish ? 'Saved address' : 'عنوان محفوظ' }}</h3><p>{{ address.address }}<template v-if="locationText(address)">، {{ locationText(address) }}</template></p><small>{{ user?.username || '—' }} · {{ address.phone }}</small></div>
        <div class="address-actions"><button type="button" :aria-label="isEnglish ? 'Edit address' : 'تعديل العنوان'" @click="openEdit(address)"><Pencil /></button><button type="button" :aria-label="isEnglish ? 'Delete address' : 'حذف العنوان'" @click="removeAddress(address.id)"><Trash2 /></button></div>
      </article>
      <form v-if="showForm" class="form-card new-address" @submit.prevent="saveAddress">
        <h2>{{ editingId ? (isEnglish ? 'Edit address' : 'تعديل العنوان') : t('newAddress') }}</h2>
        <div class="form-grid">
          <div class="field"><label>{{ t('phone') }}</label><input v-model.trim="form.phone" required inputmode="tel"></div>
          <div class="field"><label>{{ t('governorate') }}</label><select v-model.number="form.city_id" required @change="onCityChange"><option :value="null" disabled>{{ isEnglish ? 'Choose a city' : 'اختر المدينة' }}</option><option v-for="city in cities" :key="city.id" :value="city.id">{{ locationName(city) }}</option></select></div>
          <div class="field"><label>{{ isEnglish ? 'District' : 'المنطقة' }}</label><select v-model.number="form.district_id" :disabled="!form.city_id || loadingDistricts"><option :value="null">{{ isEnglish ? 'No district selected' : 'بدون منطقة' }}</option><option v-for="district in districts" :key="district.id" :value="district.id">{{ locationName(district) }}</option></select></div>
          <div class="field full"><label>{{ t('detailedAddress') }}</label><input v-model.trim="form.address" required :placeholder="t('streetAddress')"></div>
          <label class="default-choice"><input v-model="form.is_default" type="checkbox"> {{ t('defaultAddress') }}</label>
        </div>
        <p v-if="formError" class="address-error">{{ formError }}</p>
        <div class="form-actions"><button type="button" class="btn secondary" @click="closeForm">{{ isEnglish ? 'Cancel' : 'إلغاء' }}</button><button class="btn primary" :disabled="saving">{{ t('saveAddress') }}</button></div>
      </form>
    </div></div></section>
  </main>
</template>

<script setup lang="ts">
import { Home, Pencil, Plus, Trash2 } from 'lucide-vue-next'
import type { CheckoutCity, CheckoutDistrict } from '~/composables/useLocations'

type Address = { id: number; address: string; phone: string; is_default: boolean; city: CheckoutCity | null; district: CheckoutDistrict | null }
const { t, isEnglish } = useLocale()
const { request, token, user, fetchCurrentUser } = useApi()
const { cities, districts, loadingDistricts, fetchCities, fetchDistricts } = useLocations()
if (!user.value && token.value) await fetchCurrentUser()
const showForm = ref(false)
const editingId = ref<number | null>(null)
const saving = ref(false)
const formError = ref('')
const form = reactive({ phone: '', address: '', city_id: null as number | null, district_id: null as number | null, is_default: false })
const { data, pending, refresh } = await useAsyncData('customer-addresses', () => request<Address[]>('/address'))
const addresses = computed(() => data.value?.data || [])
const addressCountText = computed(() => isEnglish.value ? `${addresses.value.length} saved address${addresses.value.length === 1 ? '' : 'es'}` : `${addresses.value.length} عنوان محفوظ`)
const emptyAddressText = computed(() => isEnglish.value ? 'No saved addresses yet.' : 'لا توجد عناوين محفوظة بعد.')
const locationName = (location: CheckoutCity | CheckoutDistrict) => isEnglish.value ? location.name_en : location.name_ar
const locationText = (address: Address) => [address.district && locationName(address.district), address.city && locationName(address.city)].filter(Boolean).join('، ')

onMounted(fetchCities)

const resetForm = () => Object.assign(form, { phone: user.value?.phone || '', address: '', city_id: null, district_id: null, is_default: false })
const openCreate = () => { editingId.value = null; resetForm(); formError.value = ''; showForm.value = true }
const closeForm = () => { showForm.value = false; editingId.value = null; formError.value = '' }
const onCityChange = async () => { form.district_id = null; await fetchDistricts(form.city_id) }
const openEdit = async (address: Address) => {
  editingId.value = address.id
  Object.assign(form, { phone: address.phone, address: address.address, city_id: address.city?.id || null, district_id: address.district?.id || null, is_default: Boolean(address.is_default) })
  if (form.city_id) await fetchDistricts(form.city_id)
  formError.value = ''
  showForm.value = true
}
const saveAddress = async () => {
  saving.value = true
  formError.value = ''
  try {
    const payload = { ...form }
    if (editingId.value) await request(`/address/${editingId.value}`, { method: 'PUT', body: payload })
    else await request('/address', { method: 'POST', body: payload })
    await refresh()
    closeForm()
  } catch (exception) {
    formError.value = exception instanceof Error ? exception.message : (isEnglish.value ? 'Unable to save this address.' : 'تعذر حفظ العنوان.')
  } finally {
    saving.value = false
  }
}
const removeAddress = async (id: number) => {
  if (!confirm(isEnglish.value ? 'Delete this address?' : 'هل تريد حذف هذا العنوان؟')) return
  await request(`/address/${id}`, { method: 'DELETE' })
  await refresh()
}
</script>

<style scoped>
.address-state{min-height:180px;display:grid;place-items:center;border:1px solid var(--line);border-radius:17px;color:var(--muted)}.address-card{display:flex;align-items:flex-start;gap:15px;border:1px solid var(--line);border-radius:17px;padding:22px;margin-bottom:14px}.address-icon{width:48px;height:48px;border-radius:12px;display:grid;place-items:center;background:var(--cream);color:var(--green)}.address-card h3{margin:5px 0}.address-card p{margin:0}.address-card small{color:var(--muted)}.default-badge{background:#e4f0e8;color:var(--green);font-size:.7rem;padding:3px 8px;border-radius:999px}.address-actions{margin-inline-start:auto;display:flex;gap:8px}.address-actions button{border:1px solid var(--line);background:#fff;border-radius:9px;width:38px;height:38px;display:grid;place-items:center}.address-actions svg{width:17px}.new-address{margin-top:20px}.default-choice{display:flex;align-items:center;gap:8px;font-weight:700}.form-actions{display:flex;justify-content:flex-end;gap:10px;margin-top:20px}.address-error{margin:16px 0 0;color:#b42318}@media(max-width:600px){.address-card{padding:16px}.address-actions{margin-inline-start:0}.form-actions{flex-direction:column}.form-actions .btn{width:100%}}
</style>
