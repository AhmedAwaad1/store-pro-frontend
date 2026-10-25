<template>
  <main>
    <PageHero :eyebrow="t('storeLabel')" :title="t('branchesTitle')" :description="t('branchesIntro')" />
    <section class="section">
      <div class="container branch-grid">
        <article v-for="branch in branches" :key="branch.id" class="branch-card">
          <div class="branch-icon"><MapPin /></div>
          <div><h2>{{ branch.name }}</h2><p v-if="branch.city">{{ branch.city }}</p><address v-if="branch.address">{{ branch.address }}</address></div>
          <NuxtLink to="/checkout?fulfillment=pickup" class="text-link">{{ t('availablePickup') }} <ArrowLeft :size="17" /></NuxtLink>
        </article>
        <div v-if="!branches.length" class="empty-branches">{{ t('noBranches') }}</div>
      </div>
    </section>
  </main>
</template>

<script setup lang="ts">
import { ArrowLeft, MapPin } from 'lucide-vue-next'
const { t } = useLocale()
const config = useRuntimeConfig()
type Branch = { id: number; name: string; city: string | null; address: string | null }
const { data: branches } = await useAsyncData('store-branches-page', async () => {
  try {
    const response = await $fetch<{ branches: Branch[] }>('/inventory/branches', { baseURL: config.public.apiBase })
    return response.branches || []
  } catch {
    return []
  }
})
</script>

<style scoped>
.branch-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:14px}.branch-card{display:grid;grid-template-columns:52px 1fr;gap:12px;padding:20px;background:var(--theme-surface);border:1px solid var(--line);border-radius:14px}.branch-icon{width:48px;height:48px;display:grid;place-items:center;background:var(--theme-soft);color:var(--theme-primary);border-radius:12px}.branch-card h2{margin:0;font-size:1.1rem}.branch-card p,.branch-card address{margin:4px 0;color:var(--theme-muted);font-style:normal}.branch-card .text-link{grid-column:2}.empty-branches{grid-column:1/-1;padding:42px;text-align:center;background:var(--theme-surface);border:1px solid var(--line);border-radius:14px;color:var(--theme-muted)}
@media(max-width:650px){.branch-grid{grid-template-columns:1fr}.branch-card{grid-template-columns:44px 1fr;padding:16px}.branch-icon{width:42px;height:42px}}
</style>
