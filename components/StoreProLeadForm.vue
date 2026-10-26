<template>
  <section id="inquiry" class="sp-form-panel">
    <div class="sp-form-intro"><span class="sp-eyebrow">{{ text(formContent.eyebrow) }}</span><h2>{{ text(formContent.title) }}</h2><p>{{ text(formContent.description) }}</p></div>
    <form class="sp-lead-form" @submit.prevent="submit">
      <label>{{ text(formContent.fields?.name) }}<input v-model.trim="form.name" name="name" autocomplete="name" required maxlength="120" /></label>
      <label>{{ text(formContent.fields?.business_name) }}<input v-model.trim="form.business_name" name="business_name" autocomplete="organization" maxlength="255" /></label>
      <label>{{ text(formContent.fields?.phone) }}<input v-model.trim="form.phone" name="phone" type="tel" inputmode="tel" autocomplete="tel" maxlength="32" :required="form.preferred_contact_method !== 'email'" /></label>
      <label>{{ text(formContent.fields?.email) }}<input v-model.trim="form.email" name="email" type="email" inputmode="email" autocomplete="email" maxlength="255" :required="form.preferred_contact_method === 'email'" /></label>
      <label>{{ text(formContent.fields?.contact_method) }}<select v-model="form.preferred_contact_method" name="preferred_contact_method"><option value="phone">{{ text(formContent.options?.phone) }}</option><option value="whatsapp">{{ text(formContent.options?.whatsapp) }}</option><option value="email">{{ text(formContent.options?.email) }}</option></select></label>
      <label>{{ text(formContent.fields?.service) }}<select v-model="form.service_interest" name="service_interest"><option value="">{{ text(formContent.options?.choose_service) }}</option><option value="store-design">{{ text(formContent.options?.store_design) }}</option><option value="growth">{{ text(formContent.options?.growth) }}</option><option value="mobile-app">{{ text(formContent.options?.mobile_app) }}</option><option value="custom">{{ text(formContent.options?.custom) }}</option></select></label>
      <label>{{ text(formContent.fields?.package) }}<select v-model="form.package_interest" name="package_interest"><option value="">{{ text(formContent.options?.not_sure) }}</option><option value="starter">{{ text(formContent.options?.starter) }}</option><option value="growth">{{ text(formContent.options?.professional) }}</option><option value="enterprise">{{ text(formContent.options?.business) }}</option></select></label>
      <label class="sp-form-wide">{{ text(formContent.fields?.message) }}<textarea v-model.trim="form.message" name="message" rows="4" maxlength="5000" required /></label>
      <div class="sp-form-wide sp-form-submit"><button class="sp-btn sp-btn-primary" type="submit" :disabled="busy">{{ busy ? text(formContent.sending) : text(formContent.send) }} <StoreProDirectionalArrow v-if="!busy" :size="17" /></button><p v-if="statusMessage" :class="['sp-form-status', { 'sp-form-error': statusError }]" role="status" aria-live="polite">{{ statusMessage }}</p></div>
    </form>
  </section>
</template>

<script setup lang="ts">
const props = withDefaults(defineProps<{ content?: Record<string, any>; source?: string }>(), { content: () => ({}) })
const { text } = await useSiteContent()
const { request } = useApi()
const route = useRoute()
const config = useRuntimeConfig()
const formContent = computed(() => props.content || {})
const busy = ref(false)
const statusMessage = ref('')
const statusError = ref(false)
const form = reactive({ name: '', business_name: '', phone: '', email: '', preferred_contact_method: 'phone', service_interest: '', package_interest: '', message: '' })
const queryValue = (value: unknown) => typeof value === 'string' ? value : undefined

const submit = async () => {
  busy.value = true
  statusMessage.value = ''
  statusError.value = false
  try {
    const sourcePage = new URL(route.fullPath, String(config.public.siteUrl || '')).toString()
    await request('/sales-inquiries', {
      method: 'POST',
      body: {
        ...form,
        source: props.source || 'storepro-website',
        source_page: sourcePage,
        utm_source: queryValue(route.query.utm_source),
        utm_medium: queryValue(route.query.utm_medium),
        utm_campaign: queryValue(route.query.utm_campaign),
        utm_content: queryValue(route.query.utm_content),
        utm_term: queryValue(route.query.utm_term),
      },
    })
    statusMessage.value = text(formContent.value.success)
    Object.assign(form, { name: '', business_name: '', phone: '', email: '', preferred_contact_method: 'phone', service_interest: '', package_interest: '', message: '' })
  } catch {
    statusError.value = true
    statusMessage.value = text(formContent.value.error)
  } finally {
    busy.value = false
  }
}

watch(() => route.query.package, (value) => {
  if (typeof value === 'string' && ['starter', 'growth', 'enterprise'].includes(value)) form.package_interest = value
}, { immediate: true })

watch(() => route.query.service, (value) => {
  if (typeof value !== 'string') return
  const serviceMap: Record<string, string> = { 'custom-store': 'store-design', dashboard: 'store-design', mobile: 'mobile-app', operations: 'growth', integrations: 'growth', support: 'custom' }
  if (serviceMap[value]) form.service_interest = serviceMap[value]
}, { immediate: true })
</script>
