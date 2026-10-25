<template>
  <main>
    <PageHero :eyebrow="t('accountTitle')" :title="t('accountGreeting')" :description="t('accountDescription')" />
    <section class="section"><div class="container account-shell"><AccountNav /><div>
      <div class="stat-row">
        <div class="stat"><strong>{{ ordersCount }}</strong><span>{{ t('previousOrders') }}</span></div>
        <div class="stat"><strong>{{ wishlistCount }}</strong><span>{{ t('favoriteProducts') }}</span></div>
        <div class="stat"><strong>{{ addressesCount }}</strong><span>{{ t('savedAddress') }}</span></div>
      </div>
      <form class="form-card" @submit.prevent="saveProfile">
        <div class="section-head"><div><h2>{{ t('personalInfo') }}</h2><p>{{ t('keepContactUpdated') }}</p></div></div>
        <div class="form-grid">
          <div class="field"><label>{{ t('fullName') }}</label><input v-model.trim="form.username" required></div>
          <div class="field"><label>{{ t('phone') }}</label><input v-model.trim="form.phone" required inputmode="tel"></div>
          <div class="field full"><label>{{ t('email') }}</label><input :value="user?.email || ''" type="email" disabled></div>
        </div>
        <p v-if="error" class="profile-error">{{ error }}</p>
        <button class="btn primary save-btn" :disabled="saving">{{ saved ? t('saved') : t('saveChanges') }}</button>
      </form>
    </div></div></section>
  </main>
</template>

<script setup lang="ts">
const { t } = useLocale()
const { request, token, user, updateStoredUser, fetchCurrentUser } = useApi()
const { wishlist } = useShop()
if (!user.value && token.value) await fetchCurrentUser()
const form = reactive({ username: user.value?.username || '', phone: user.value?.phone || '' })
const saving = ref(false)
const saved = ref(false)
const error = ref('')

watch(user, value => {
  form.username = value?.username || ''
  form.phone = value?.phone || ''
}, { immediate: true })

const { data: summary } = await useAsyncData('account-summary', async () => {
  if (!user.value) return { orders: 0, addresses: 0 }
  const [orders, addresses] = await Promise.allSettled([
    request<unknown[]>('/order'),
    request<unknown[]>('/address'),
  ])
  return {
    orders: orders.status === 'fulfilled' ? orders.value.data.length : 0,
    addresses: addresses.status === 'fulfilled' ? addresses.value.data.length : 0,
  }
})

const ordersCount = computed(() => summary.value?.orders || 0)
const addressesCount = computed(() => summary.value?.addresses || 0)
const wishlistCount = computed(() => wishlist.value.length)

const saveProfile = async () => {
  saving.value = true
  saved.value = false
  error.value = ''
  try {
    const response = await request<{ username: string; phone: string }>('/user-profile', {
      method: 'PUT',
      body: { username: form.username, phone: form.phone },
    })
    updateStoredUser(response.data)
    saved.value = true
  } catch (exception) {
    error.value = exception instanceof Error ? exception.message : 'Unable to save your profile.'
  } finally {
    saving.value = false
  }
}
</script>

<style scoped>
.save-btn{margin-top:20px}.profile-error{margin:16px 0 0;color:#b42318}.field input:disabled{opacity:.7;cursor:not-allowed}
</style>
