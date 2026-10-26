<template>
  <main class="sp-page">
    <section class="sp-page-hero"><div class="sp-container"><span class="sp-eyebrow">{{ text(content.hero?.eyebrow) }}</span><h1>{{ text(content.hero?.title) }}</h1><p>{{ text(content.hero?.description) }}</p></div></section>
    <section class="sp-section"><div class="sp-container sp-portfolio-grid sp-portfolio-grid-page"><article v-for="(item, index) in content.items || []" :key="index" class="sp-portfolio-card"><div class="sp-portfolio-image"><img v-if="item.image_url" :src="item.image_url" :alt="text(item.title)" width="1448" height="1200" loading="lazy" decoding="async" /><span>{{ text(content.item_label) }}</span></div><div class="sp-portfolio-info"><div><h2>{{ text(item.title) }}</h2><p>{{ text(item.category) }}</p></div><NuxtLink to="/contact#inquiry" :aria-label="text(content.discuss_label)"><StoreProDirectionalArrow :size="18" /></NuxtLink></div></article></div></section>
    <section class="sp-section sp-section-soft"><div class="sp-container sp-inline-cta"><div><h2>{{ text(content.cta?.title) }}</h2><p>{{ text(content.cta?.description) }}</p></div><NuxtLink class="sp-btn sp-btn-primary" to="/contact#inquiry">{{ text(content.cta?.button) }} <StoreProDirectionalArrow :size="17" /></NuxtLink></div></section>
  </main>
</template>
<script setup lang="ts">
const { page, text } = await useSiteContent()
const content = page('portfolio')
useSeoMeta({ title: () => text(content.value.meta_title), description: () => text(content.value.meta_description) })
</script>
