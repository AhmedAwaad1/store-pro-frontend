<template>
  <AuthLayout :title="t('register')" :subtitle="t('registerIntro')" :visual-image="registrationImageUrl">
    <button type="button" class="google-button" @click="startGoogleSignIn"><GoogleIcon />{{ t('continueWithGoogle') }}</button>
    <div class="auth-divider"><span>{{ t('orContinueWith') }}</span></div>
    <form class="auth-form" @submit.prevent="submit">
      <div class="field"><label>{{ t('fullName') }}</label><input v-model="form.username" required :placeholder="t('namePlaceholder')"></div>
      <div class="field"><label>{{ t('phone') }}</label><input v-model="form.phone" required type="tel" inputmode="numeric" placeholder="01xxxxxxxxx"></div>
      <div class="field"><label>{{ t('email') }}</label><input v-model="form.email" required type="email" placeholder="name@example.com"></div>
      <div class="field"><label>{{ t('password') }}</label><input v-model="form.password" required type="password" minlength="8" :placeholder="t('minPassword')"></div>
      <div class="field"><label>{{ t('confirmPassword') }}</label><input v-model="form.password_confirmation" required type="password" minlength="8" :placeholder="t('repeatPassword')"></div>
      <p v-if="error" class="error">{{ error }}</p>
      <button class="btn primary" :disabled="loading">{{ loading ? t('creatingAccount') : t('createAccountButton') }}</button>
      <p>{{ t('haveAccount') }} <NuxtLink to="/login">{{ t('signIn') }}</NuxtLink></p>
    </form>
  </AuthLayout>
</template>
<script setup lang="ts">
import GoogleIcon from '~/components/GoogleIcon.vue'

const { register } = useApi()
const { registrationImageUrl } = useTheme()
const { startGoogleSignIn } = useGoogleAuth()
const { t } = useLocale()
const form = reactive({ username: '', phone: '', email: '', password: '', password_confirmation: '' })
const loading = ref(false)
const error = ref('')
const submit = async () => {
  if (form.password !== form.password_confirmation) { error.value = t('passwordsMismatch'); return }
  loading.value = true
  error.value = ''
  try { await register(form); await navigateTo({ path: '/verify-email', query: { email: form.email } }) }
  catch (exception) { error.value = exception instanceof Error ? exception.message : t('registerFailed') }
  finally { loading.value = false }
}
</script>
<style scoped>.google-button{position:relative;width:100%;height:50px;display:flex;align-items:center;justify-content:center;border:1px solid #d7d7d7;border-radius:10px;background:#fff;color:#242424;font:inherit;font-weight:700;cursor:pointer;box-shadow:0 1px 2px rgba(0,0,0,.08);transition:border-color .18s ease,box-shadow .18s ease,background-color .18s ease}.google-button:hover{border-color:#a9a9a9;background:#fafafa;box-shadow:0 3px 8px rgba(0,0,0,.12)}.google-button:focus-visible{outline:3px solid rgba(66,133,244,.35);outline-offset:2px}.google-button svg{position:absolute;inset-inline-start:18px;width:20px;height:20px}.auth-divider{display:flex;align-items:center;gap:12px;margin:20px 0;color:var(--muted);font-size:.82rem}.auth-divider::before,.auth-divider::after{content:'';height:1px;flex:1;background:var(--line)}.error{color:#b42318;margin:0}</style>
