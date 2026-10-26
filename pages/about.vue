<template>
  <main class="sp-page">
    <section class="sp-page-hero"><div class="sp-container"><span class="sp-eyebrow">{{ text(content.hero?.eyebrow) }}</span><h1>{{ text(content.hero?.title) }}</h1><p>{{ text(content.hero?.description) }}</p></div></section>
    <section class="sp-section"><div class="sp-container sp-about-layout"><div class="sp-about-copy"><span class="sp-eyebrow">{{ text(content.approach?.eyebrow) }}</span><h2>{{ text(content.approach?.title) }}</h2><p v-for="(paragraph, index) in content.approach?.paragraphs || []" :key="index">{{ text(paragraph) }}</p><NuxtLink class="sp-btn sp-btn-primary" to="/contact#inquiry">{{ text(content.approach?.button) }} <StoreProDirectionalArrow :size="17" /></NuxtLink></div><div class="sp-about-image"><img v-if="content.approach?.image_url" :src="content.approach.image_url" :alt="text(content.approach.image_alt)" width="1672" height="941" loading="lazy" /><div><strong>{{ text(global.brand_name) }}</strong><span>{{ text(content.approach?.image_caption) }}</span></div></div></div></section>
    <section class="sp-section sp-section-soft"><div class="sp-container"><div class="sp-section-head sp-section-head-centered"><div><span class="sp-eyebrow">{{ text(content.process?.eyebrow) }}</span><h2>{{ text(content.process?.title) }}</h2></div></div><div class="sp-process-grid"><article v-for="(step, index) in content.process?.items || []" :key="index"><span>{{ step.number }}</span><h3>{{ text(step.title) }}</h3><p>{{ text(step.description) }}</p></article></div></div></section>
  </main>
</template>
<script setup lang="ts">
const { page, text } = await useSiteContent()
const content = page('about')
const global = page('global')
useSeoMeta({ title: () => text(content.value.meta_title), description: () => text(content.value.meta_description) })
</script>
