<template>
    <a class="skip-link" href="#main">{{ content.skipLinkLabel }}</a>
    <div class="announcement"><span class="announcement-dot" aria-hidden="true"></span>{{ content.announcement }}<span class="tiny-star" aria-hidden="true">✳</span>{{ brand.full }}</div>
    <header class="site-header" id="top" @keydown.esc="menuOpen = false">
      <div class="container nav-bar">
        <a class="brand" href="#home" :aria-label="`${content.homeLabel} - ${content.doctor}`">
          <span class="brand-icon" aria-hidden="true">{{ brand.first[0] }}<span class="brand-leaf">✦</span></span>
          <span class="brand-copy"><strong>{{ brand.first }} <i>{{ brand.connector }}</i> {{ brand.last }}</strong><small>{{ content.doctor }}</small></span>
        </a>
        <nav class="desktop-nav" :aria-label="content.navigationLabel">
          <a v-for="(item, index) in content.navigation" :key="item.href" :class="{ active: index === 0 }" :href="item.href">{{ item.label }}</a>
        </nav>
        <a class="nav-cta" :href="bookingUrl" target="_blank" rel="noopener noreferrer">{{ content.bookingLabel }} <span aria-hidden="true">↗</span></a>
        <button class="mobile-toggle" type="button" :aria-label="menuOpen ? content.closeMenuLabel : content.openMenuLabel" aria-controls="mobile-menu" :aria-expanded="menuOpen" @click="menuOpen = !menuOpen">
          <span></span><span></span><span></span>
        </button>
      </div>
      <nav id="mobile-menu" class="mobile-nav" :aria-label="content.mobileNavigationLabel" :hidden="!menuOpen">
        <a v-for="item in content.navigation" :key="item.href" :href="item.href" @click="menuOpen = false">{{ item.label }}</a>
        <a :href="bookingUrl" target="_blank" rel="noopener noreferrer" @click="menuOpen = false">{{ content.bookingLabel }} ↗</a>
      </nav>
    </header>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { useRoute } from '#imports'
import type { NouranBrandName, NouranSiteContent } from '~/data/nouranSiteContent'

defineProps<{
  content: NouranSiteContent['header']
  brand: NouranBrandName
  instagramUrl: string
  bookingUrl: string
}>()

const menuOpen = ref(false)
const route = useRoute()
watch(() => route.fullPath, () => { menuOpen.value = false })
</script>
