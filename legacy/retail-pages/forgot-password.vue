<template>
  <AuthLayout :title="t('recoverAccount')" :subtitle="t('recoverIntro')">
    <form class="auth-form" @submit.prevent="submit">
      <div class="field"><label>{{ isEnglish ? 'Email' : 'البريد الإلكتروني' }}</label><input v-model="form.email" required type="email" autocomplete="email" placeholder="name@example.com"></div>
      <template v-if="codeSent">
        <div class="field"><label>{{ isEnglish ? 'Reset code' : 'رمز إعادة التعيين' }}</label><input v-model="form.code" required inputmode="numeric" pattern="[0-9]{6}" maxlength="6" autocomplete="one-time-code"></div>
        <div class="field"><label>{{ t('password') }}</label><input v-model="form.password" required type="password" minlength="8" autocomplete="new-password"></div>
        <div class="field"><label>{{ t('confirmPassword') }}</label><input v-model="form.password_confirmation" required type="password" minlength="8" autocomplete="new-password"></div>
      </template>
      <p v-if="message" class="message">{{ message }}</p>
      <p v-if="error" class="error">{{ error }}</p>
      <button class="btn primary" :disabled="loading">{{ loading ? (isEnglish ? 'Please wait…' : 'يرجى الانتظار…') : codeSent ? (isEnglish ? 'Reset password' : 'إعادة تعيين كلمة المرور') : t('sendLink') }}</button>
      <NuxtLink to="/login" class="back-link">{{ t('backToLogin') }}</NuxtLink>
    </form>
  </AuthLayout>
</template>

<script setup lang="ts">
const { request } = useApi()
const { t, isEnglish } = useLocale()
const form = reactive({ email: '', code: '', password: '', password_confirmation: '' })
const codeSent = ref(false)
const loading = ref(false)
const error = ref('')
const message = ref('')

const submit = async () => {
  loading.value = true
  error.value = ''
  message.value = ''
  try {
    if (!codeSent.value) {
      await request('/auth/send-reset-code', { method: 'POST', body: { email: form.email } })
      codeSent.value = true
      message.value = isEnglish.value ? 'If the account exists, a reset code has been sent.' : 'إذا كان الحساب موجوداً، فسيصلك رمز إعادة التعيين.'
      return
    }

    if (form.password !== form.password_confirmation) {
      error.value = isEnglish.value ? 'The passwords do not match.' : 'كلمتا المرور غير متطابقتين.'
      return
    }

    await request('/auth/reset-password', {
      method: 'POST',
      body: {
        email: form.email,
        code: form.code,
        password: form.password,
        password_confirmation: form.password_confirmation,
      },
    })
    await navigateTo('/login?passwordReset=1')
  } catch (exception: any) {
    error.value = exception?.data?.message || (isEnglish.value ? 'Unable to reset the password. Check the code and try again.' : 'تعذر إعادة تعيين كلمة المرور. تحقق من الرمز وحاول مجدداً.')
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.error{color:#b42318;margin:0}.message{color:#176347;margin:0}
</style>
