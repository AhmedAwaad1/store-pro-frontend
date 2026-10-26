<template>
  <main class="sp-page">
    <section class="sp-page-hero"><div class="sp-container"><span class="sp-eyebrow">{{ text(content.hero?.eyebrow) }}</span><h1>{{ text(content.hero?.title) }}</h1><p>{{ text(content.hero?.description) }}</p></div></section>
    <section class="sp-section"><div class="sp-container sp-contact-layout"><div class="sp-contact-aside"><span class="sp-icon-bubble"><MessageCircle :size="24" /></span><h2>{{ text(content.aside?.title) }}</h2><p>{{ text(content.aside?.description) }}</p><ul><li v-for="(point, index) in content.aside?.points || []" :key="index"><CheckCircle2 :size="17" />{{ text(point) }}</li></ul></div><StoreProLeadForm :content="content.form" source="contact-page" /></div></section>
  </main>
</template>
<script setup lang="ts">
import { CheckCircle2, MessageCircle } from 'lucide-vue-next'
const { page, text } = await useSiteContent()
const content = page('contact')
useSeoMeta({ title: () => text(content.value.meta_title), description: () => text(content.value.meta_description) })
</script>
