<template>
  <main class="sp-page">
    <section class="sp-page-hero"><div class="sp-container"><span class="sp-eyebrow">{{ text(content.hero?.eyebrow) }}</span><h1>{{ text(content.hero?.title) }}</h1><p>{{ text(content.hero?.description) }}</p></div></section>
    <section class="sp-section sp-pricing-page"><div class="sp-container"><div class="sp-pricing-grid"><article v-for="(plan, index) in content.plans || []" :key="index" class="sp-price-card" :class="{ 'sp-price-card-featured': plan.popular }"><span v-if="plan.popular" class="sp-popular-tag">{{ text(content.popular_label) }}</span><h2>{{ text(plan.title) }}</h2><p>{{ text(plan.description) }}</p><strong class="sp-price-label">{{ text(content.custom_price) }}</strong><ul><li v-for="(feature, index) in plan.features || []" :key="index"><Check :size="16" />{{ text(feature) }}</li></ul><NuxtLink class="sp-btn" :class="plan.popular ? 'sp-btn-primary' : 'sp-btn-outline'" :to="`/contact?package=${plan.id}#inquiry`">{{ text(content.request_label) }} <StoreProDirectionalArrow :size="16" /></NuxtLink></article></div><p class="sp-pricing-note">{{ text(content.note) }}</p></div></section>
  </main>
</template>
<script setup lang="ts">
import { Check } from 'lucide-vue-next'
const { page, text } = await useSiteContent()
const content = page('pricing')
useSeoMeta({ title: () => text(content.value.meta_title), description: () => text(content.value.meta_description) })
</script>
