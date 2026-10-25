<template>
  <section id="inquiry" class="sp-form-panel">
    <div class="sp-form-intro"><span class="sp-eyebrow">{{ isEnglish ? 'Let’s talk' : 'ابدأ من هنا' }}</span><h2>{{ title || (isEnglish ? 'Tell us about your store' : 'احكِ لنا عن متجرك') }}</h2><p>{{ description || (isEnglish ? 'Share a few details and our team will contact you to discuss the right solution.' : 'أرسل بياناتك وسيتواصل معك فريقنا لمناقشة الحل المناسب.') }}</p></div>
    <form class="sp-lead-form" @submit.prevent="submit">
      <label>{{ isEnglish ? 'Your name' : 'الاسم بالكامل' }}<input v-model.trim="form.name" name="name" autocomplete="name" required maxlength="120" /></label>
      <label>{{ isEnglish ? 'Business name' : 'اسم النشاط التجاري' }}<input v-model.trim="form.business_name" name="business_name" autocomplete="organization" maxlength="255" /></label>
      <label>{{ isEnglish ? 'Phone' : 'رقم الهاتف' }}<input v-model.trim="form.phone" name="phone" type="tel" inputmode="tel" autocomplete="tel" maxlength="32" :required="form.preferred_contact_method !== 'email'" /></label>
      <label>{{ isEnglish ? 'Email' : 'البريد الإلكتروني' }}<input v-model.trim="form.email" name="email" type="email" inputmode="email" autocomplete="email" maxlength="255" :required="form.preferred_contact_method === 'email'" /></label>
      <label>{{ isEnglish ? 'How should we contact you?' : 'طريقة التواصل المفضلة' }}<select v-model="form.preferred_contact_method" name="preferred_contact_method"><option value="phone">{{ isEnglish ? 'Phone' : 'الهاتف' }}</option><option value="whatsapp">WhatsApp</option><option value="email">{{ isEnglish ? 'Email' : 'البريد الإلكتروني' }}</option></select></label>
      <label>{{ isEnglish ? 'Interested in' : 'الخدمة المطلوبة' }}<select v-model="form.service_interest" name="service_interest"><option value="">{{ isEnglish ? 'Choose a service' : 'اختر الخدمة' }}</option><option value="store-design">{{ isEnglish ? 'Store design and setup' : 'تصميم وتجهيز متجر' }}</option><option value="growth">{{ isEnglish ? 'Growth and integrations' : 'التوسع والتكاملات' }}</option><option value="mobile-app">{{ isEnglish ? 'Mobile application' : 'تطبيق جوال' }}</option><option value="custom">{{ isEnglish ? 'Custom solution' : 'حل مخصص' }}</option></select></label>
      <label>{{ isEnglish ? 'Package' : 'الباقة' }}<select v-model="form.package_interest" name="package_interest"><option value="">{{ isEnglish ? 'Not sure yet' : 'لم أحدد بعد' }}</option><option value="starter">{{ isEnglish ? 'Essential' : 'الأساسية' }}</option><option value="growth">{{ isEnglish ? 'Professional' : 'الاحترافية' }}</option><option value="enterprise">{{ isEnglish ? 'Business' : 'الشركات' }}</option></select></label>
      <label class="sp-form-wide">{{ isEnglish ? 'What do you need?' : 'كيف يمكننا مساعدتك؟' }}<textarea v-model.trim="form.message" name="message" rows="4" maxlength="5000" required /></label>
      <div class="sp-form-wide sp-form-submit"><button class="sp-btn sp-btn-primary" type="submit" :disabled="busy">{{ busy ? (isEnglish ? 'Sending…' : 'جارٍ الإرسال…') : (isEnglish ? 'Send request' : 'أرسل طلبك') }} <StoreProDirectionalArrow v-if="!busy" :size="17" /></button><p v-if="statusMessage" :class="['sp-form-status', { 'sp-form-error': statusError }]" role="status" aria-live="polite">{{ statusMessage }}</p></div>
    </form>
  </section>
</template>

<script setup lang="ts">
const props = defineProps<{ title?: string; description?: string; source?: string }>()
const { isEnglish } = useLocale()
const { request } = useApi()
const route = useRoute()
const config = useRuntimeConfig()
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
    const sourcePage = new URL(route.fullPath, String(config.public.siteUrl || 'https://storepro.com')).toString()
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
    statusMessage.value = isEnglish.value ? 'Thank you. Our team will contact you soon.' : 'شكرًا لك، سيتواصل معك فريقنا قريبًا.'
    Object.assign(form, { name: '', business_name: '', phone: '', email: '', preferred_contact_method: 'phone', service_interest: '', package_interest: '', message: '' })
  } catch (error: any) {
    statusError.value = true
    statusMessage.value = error?.data?.message || (isEnglish.value ? 'We could not send your request. Please try again.' : 'تعذر إرسال طلبك. حاول مرة أخرى.')
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
