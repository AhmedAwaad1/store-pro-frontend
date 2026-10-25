<template>
  <aside class="account-nav">
    <div class="account-person"><div class="avatar">{{ avatarInitial }}</div><div><strong>{{ user?.username || t('accountTitle') }}</strong><small>{{ user?.email || '—' }}</small></div></div>
    <NuxtLink to="/account"><UserRound /> {{ t('profile') }}</NuxtLink>
    <NuxtLink to="/account/orders"><Package /> {{ t('myOrders') }}</NuxtLink>
    <NuxtLink to="/account/addresses"><MapPin /> {{ t('addresses') }}</NuxtLink>
    <NuxtLink to="/wishlist"><Heart /> {{ t('wishlist') }}</NuxtLink>
    <button type="button" class="account-nav-logout" @click="handleLogout"><LogOut /> {{ t('logout') }}</button>
  </aside>
</template>
<script setup lang="ts">
import { Heart, LogOut, MapPin, Package, UserRound } from 'lucide-vue-next'

const { t } = useLocale()
const { request, user, token, fetchCurrentUser, logout } = useApi()
const avatarInitial = computed(() => (user.value?.username || t('accountTitle')).trim().charAt(0).toUpperCase())

onMounted(() => {
  if (!user.value && token.value) fetchCurrentUser()
})

const handleLogout = async () => {
  try {
    await request('/auth/logout', { method: 'POST' })
  } catch {
    // Clear the local session even if the server token has already expired.
  }
  logout()
  await navigateTo('/login')
}
</script>
<style scoped>
.account-nav-logout{display:flex;align-items:center;gap:10px;width:100%;border:0;background:transparent;color:inherit;padding:11px;border-radius:10px;margin:3px 0;text-align:inherit}.account-nav-logout:hover{background:var(--cream);color:var(--green)}.account-nav-logout svg{width:19px}
</style>
