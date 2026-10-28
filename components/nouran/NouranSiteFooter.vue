<template>
  <footer class="site-footer">
    <div class="container footer-main">
      <a class="brand" href="#top" :aria-label="content.homeLabel">
        <span class="brand-icon" aria-hidden="true">{{ brand.first[0] }}<span class="brand-leaf">✦</span></span>
        <span class="brand-copy"><strong>{{ brand.first }} <i>{{ brand.connector }}</i> {{ brand.last }}</strong><small>{{ doctorName }}</small></span>
      </a>
      <span>{{ content.tagline }}</span>
      <a :href="instagramUrl" target="_blank" rel="noopener noreferrer" class="footer-social" :aria-label="content.instagramLabel">Instagram ↗</a>
      <a v-if="whatsappUrl" :href="whatsappUrl" target="_blank" rel="noopener noreferrer" class="footer-social" aria-label="WhatsApp">WhatsApp ↗</a>
    </div>
    <div class="container footer-bottom">
      <span>© {{ year }} {{ brand.full }}. {{ content.copyright }}</span>
      <span>{{ content.disclaimer }}</span>
    </div>
  </footer>
</template>

<script setup lang="ts">
import type { NouranBrandName, NouranSiteContent } from '~/data/nouranSiteContent'

defineProps<{
  content: NouranSiteContent['footer']
  brand: NouranBrandName
  doctorName: string
  instagramUrl: string
  whatsappUrl: string
  year: number
}>()
</script>
