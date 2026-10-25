<template>
  <main class="callback-page"><p>{{ message }}</p></main>
</template>

<script setup lang="ts">
const { setToken, fetchCurrentUser, logout } = useApi()
const { t } = useLocale()
const message = ref(t('loggingIn'))

onMounted(async () => {
  const fragment = new URLSearchParams(window.location.hash.slice(1))
  const error = fragment.get('error')

  window.history.replaceState(null, '', window.location.pathname)

  if (error) {
    message.value = t('googleSignInFailed')
    return
  }

  setToken()
  const user = await fetchCurrentUser(true)

  if (!user) {
    await logout()
    message.value = t('googleSignInFailed')
    return
  }

  await navigateTo('/account')
})
</script>

<style scoped>
.callback-page{min-height:60vh;display:grid;place-items:center;color:var(--muted)}
</style>
