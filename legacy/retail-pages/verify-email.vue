<template>
  <AuthLayout :title="isEnglish ? 'Verify your email' : 'تأكيد البريد الإلكتروني'" :subtitle="isEnglish ? 'Enter the six digit code we sent to your inbox.' : 'أدخل الرمز المكوّن من ستة أرقام الذي أرسلناه إلى بريدك.'">
    <form class="auth-form" @submit.prevent="submit">
      <div class="field"><label>{{ isEnglish ? 'Email' : 'البريد الإلكتروني' }}</label><input v-model="email" required type="email" autocomplete="email"></div>
      <div class="field"><label>{{ isEnglish ? 'Verification code' : 'رمز التحقق' }}</label><input v-model="code" required inputmode="numeric" pattern="[0-9]{6}" maxlength="6" autocomplete="one-time-code"></div>
      <p v-if="message" class="message">{{ message }}</p>
      <p v-if="error" class="error">{{ error }}</p>
      <button class="btn primary" :disabled="loading">{{ loading ? (isEnglish ? 'Verifying…' : 'جارٍ التأكيد…') : (isEnglish ? 'Verify email' : 'تأكيد البريد') }}</button>
      <button type="button" class="text-button" :disabled="loading" @click="resend">{{ isEnglish ? 'Send a new code' : 'إرسال رمز جديد' }}</button>
      <NuxtLink to="/login" class="back-link">{{ t('backToLogin') }}</NuxtLink>
    </form>
  </AuthLayout>
</template>

<script setup lang="ts">
const route = useRoute()
const { request } = useApi()
const { t, isEnglish } = useLocale()
const email = ref(String(route.query.email || ''))
const code = ref('')
const loading = ref(false)
const error = ref('')
const message = ref('')

const submit = async () => {
  loading.value = true
  error.value = ''
  message.value = ''
  try {
    await request('/auth/verify-email', { method: 'POST', body: { email: email.value, verification_code: code.value } })
    message.value = isEnglish.value ? 'Email verified. You can sign in now.' : 'تم تأكيد البريد. يمكنك تسجيل الدخول الآن.'
    await navigateTo('/login')
  } catch {
    error.value = isEnglish.value ? 'That code is invalid or expired.' : 'الرمز غير صحيح أو انتهت صلاحيته.'
  } finally {
    loading.value = false
  }
}

const resend = async () => {
  loading.value = true
  error.value = ''
  message.value = ''
  try {
    await request('/auth/resend-verification-email', { method: 'POST', body: { email: email.value } })
    message.value = isEnglish.value ? 'If the account needs verification, a new code has been sent.' : 'إذا كان الحساب بحاجة إلى تأكيد، فسيصلك رمز جديد.'
  } catch {
    error.value = isEnglish.value ? 'Unable to send a code right now.' : 'تعذر إرسال الرمز الآن.'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.error{color:#b42318;margin:0}.message{color:#176347;margin:0}.text-button{border:0;background:transparent;color:var(--green);font:inherit;font-weight:700;cursor:pointer}.text-button:disabled{opacity:.6;cursor:wait}
</style>
