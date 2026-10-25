<template>
  <main class="sp-admin-login" dir="rtl">
    <form class="sp-admin-login-card" @submit.prevent="submit">
      <NuxtLink class="sp-admin-brand" to="/" aria-label="StorePro">
        <span class="sp-brand-mark"><Store :size="23" stroke-width="2.5" /></span>
        <span><strong>StorePro</strong><small>إدارة المنصة</small></span>
      </NuxtLink>
      <div class="sp-admin-login-copy">
        <span class="sp-admin-eyebrow">مساحة العمل</span>
        <h1>تسجيل دخول الإدارة</h1>
        <p>سجّل الدخول لإدارة استفسارات الموقع ومحتواه.</p>
      </div>
      <p v-if="error" class="sp-admin-alert" role="alert">{{ error }}</p>
      <label>البريد الإلكتروني<input v-model.trim="email" type="email" autocomplete="username" required></label>
      <label>كلمة المرور<input v-model="password" type="password" autocomplete="current-password" required></label>
      <button class="sp-admin-primary" type="submit" :disabled="loading">{{ loading ? 'جارٍ تسجيل الدخول…' : 'تسجيل الدخول' }}</button>
      <NuxtLink class="sp-admin-login-back" to="/">العودة إلى الموقع</NuxtLink>
    </form>
  </main>
</template>

<script setup lang="ts">
import { Store } from 'lucide-vue-next'

const email = ref('')
const password = ref('')
const loading = ref(false)
const error = ref('')
const { login, user, fetchCurrentUser } = useApi()

definePageMeta({ layout: false })

onMounted(async () => {
  if (user.value) return navigateTo('/admin')
  try {
    await fetchCurrentUser()
    await navigateTo('/admin')
  } catch {
    // A missing session is expected on the login screen.
  }
})

async function submit() {
  loading.value = true
  error.value = ''
  try {
    await login(email.value, password.value)
    await navigateTo('/admin')
  } catch (exception: any) {
    error.value = exception?.data?.message || exception?.message || 'تعذر تسجيل الدخول بهذه البيانات.'
  } finally {
    loading.value = false
  }
}
</script>
