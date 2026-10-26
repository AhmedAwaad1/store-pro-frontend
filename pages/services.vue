<template>
  <main class="sp-page">
    <section class="sp-page-hero"><div class="sp-container"><span class="sp-eyebrow">{{ text(content.hero?.eyebrow) }}</span><h1>{{ text(content.hero?.title) }}</h1><p>{{ text(content.hero?.description) }}</p></div></section>
    <section class="sp-section"><div class="sp-container"><div class="sp-service-grid sp-service-grid-large"><article v-for="(service, index) in content.items || []" :id="service.id" :key="index" class="sp-service-card"><span class="sp-icon-bubble"><component :is="iconMap[service.icon] || Store" :size="24" /></span><h2>{{ text(service.title) }}</h2><p>{{ text(service.description) }}</p><NuxtLink class="sp-card-link" :to="`/contact?service=${service.id}#inquiry`">{{ text(content.item_button) }} <StoreProDirectionalArrow :size="16" /></NuxtLink></article></div></div></section>
    <section class="sp-section sp-section-soft"><div class="sp-container sp-inline-cta"><div><h2>{{ text(content.cta?.title) }}</h2><p>{{ text(content.cta?.description) }}</p></div><NuxtLink class="sp-btn sp-btn-primary" to="/contact#inquiry">{{ text(content.cta?.button) }} <StoreProDirectionalArrow :size="17" /></NuxtLink></div></section>
  </main>
</template>
<script setup lang="ts">
import { Boxes, CreditCard, LayoutDashboard, LifeBuoy, Smartphone, Store } from 'lucide-vue-next'
const { page, text } = await useSiteContent()
const content = page('services')
const iconMap = { Store, LayoutDashboard, Smartphone, Boxes, CreditCard, LifeBuoy }
useSeoMeta({ title: () => text(content.value.meta_title), description: () => text(content.value.meta_description) })
</script>
