<template>
  <header class="sp-header">
    <div class="sp-container sp-header-row">
      <NuxtLink class="sp-brand" to="/" :aria-label="text(global.brand_name)">
        <img v-if="global.logo_image_url" class="sp-brand-image" :src="global.logo_image_url" :alt="text(global.brand_name)" />
        <span v-else class="sp-brand-mark"><Store :size="23" stroke-width="2.5" /></span>
        <span class="sp-brand-copy"><strong>{{ text(global.brand_name) }}</strong><small>{{ text(global.brand_subtitle) }}</small></span>
      </NuxtLink>

      <nav id="storepro-navigation" class="sp-nav" :class="{ 'sp-nav-open': menuOpen }" :aria-label="text(global.header?.navigation_label)">
        <NuxtLink v-for="item in navItems" :key="item.path" :to="item.path" @click="menuOpen = false">{{ text(item.label) }}</NuxtLink>
        <div class="sp-mobile-tools">
          <button type="button" :aria-pressed="locale === 'ar'" @click="setLocale('ar')">{{ text(global.header?.language_ar) }}</button>
          <button type="button" :aria-pressed="locale === 'en'" @click="setLocale('en')">{{ text(global.header?.language_en) }}</button>
          <NuxtLink class="sp-btn sp-btn-primary" :to="global.header?.cta_link">{{ text(global.header?.cta) }} <StoreProDirectionalArrow :size="16" /></NuxtLink>
        </div>
      </nav>

      <div class="sp-header-actions">
        <div class="sp-language" role="group" :aria-label="text(global.header?.language_label)">
          <button type="button" :class="{ active: locale === 'ar' }" :aria-pressed="locale === 'ar'" @click="setLocale('ar')">{{ text(global.header?.language_short_ar) }}</button>
          <button type="button" :class="{ active: locale === 'en' }" :aria-pressed="locale === 'en'" @click="setLocale('en')">{{ text(global.header?.language_short_en) }}</button>
        </div>
        <button class="sp-theme-toggle" type="button" :aria-label="theme === 'dark' ? text(global.header?.theme_light) : text(global.header?.theme_dark)" :title="theme === 'dark' ? text(global.header?.theme_light) : text(global.header?.theme_dark)" :aria-pressed="theme === 'dark'" @click="toggleTheme">
          <Sun v-show="theme === 'dark'" :size="18" aria-hidden="true" />
          <Moon v-show="theme !== 'dark'" :size="18" aria-hidden="true" />
        </button>
        <NuxtLink class="sp-btn sp-btn-primary sp-header-cta" :to="global.header?.cta_link">{{ text(global.header?.cta) }} <StoreProDirectionalArrow :size="17" /></NuxtLink>
        <button class="sp-menu-toggle" type="button" :aria-label="menuOpen ? text(global.header?.menu_close) : text(global.header?.menu_open)" :aria-expanded="menuOpen" aria-controls="storepro-navigation" @click="menuOpen = !menuOpen">
          <X v-if="menuOpen" :size="23" /><Menu v-else :size="23" />
        </button>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import { Menu, Moon, Store, Sun, X } from 'lucide-vue-next'

const menuOpen = ref(false)
const { locale, setLocale } = useLocale()
const { page, text } = await useSiteContent()
const global = page('global')
const { theme, toggleTheme } = useStoreProTheme()
const navItems = computed(() => global.value.header?.nav || [])
const route = useRoute()
watch(() => route.fullPath, () => { menuOpen.value = false })
</script>
