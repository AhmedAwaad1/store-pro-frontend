<template>
  <footer class="sp-footer">
    <div class="sp-container sp-footer-cta">
      <div class="sp-footer-cta-row">
        <div><span class="sp-eyebrow">{{ text(footer.cta_eyebrow) }}</span><h2>{{ text(footer.cta_title) }}</h2><p>{{ text(footer.cta_description) }}</p></div>
        <NuxtLink class="sp-btn sp-btn-light" :to="footer.cta_link">{{ text(footer.cta_button) }} <StoreProDirectionalArrow :size="18" /></NuxtLink>
      </div>
    </div>
    <div class="sp-container sp-footer-main">
      <div class="sp-footer-brand">
        <NuxtLink class="sp-brand" to="/" :aria-label="text(global.brand_name)">
          <img v-if="global.logo_image_url" class="sp-brand-image" :src="global.logo_image_url" :alt="text(global.brand_name)" />
          <span v-else class="sp-brand-mark"><Store :size="23" /></span>
          <span class="sp-brand-copy"><strong>{{ text(global.brand_name) }}</strong><small>{{ text(global.brand_subtitle) }}</small></span>
        </NuxtLink>
        <p>{{ text(footer.brand_description) }}</p>
      </div>
      <div><h3>{{ text(footer.explore_title) }}</h3><NuxtLink v-for="item in footer.explore_links || []" :key="item.path" :to="item.path">{{ text(item.label) }}</NuxtLink></div>
      <div><h3>{{ text(footer.company_title) }}</h3><NuxtLink v-for="item in footer.company_links || []" :key="item.path" :to="item.path">{{ text(item.label) }}</NuxtLink></div>
    </div>
    <div class="sp-container sp-footer-bottom">
      <span>© {{ new Date().getFullYear() }} {{ text(global.brand_name) }} {{ text(footer.copyright) }}</span>
      <NuxtLink :to="footer.contact_path">{{ text(footer.contact_link) }}</NuxtLink>
    </div>
  </footer>
</template>

<script setup lang="ts">
import { Store } from 'lucide-vue-next'

const { page, text } = await useSiteContent()
const global = page('global')
const footer = computed(() => global.value.footer || {})
</script>
