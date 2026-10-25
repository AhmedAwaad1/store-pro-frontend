<template>
  <header class="sp-header">
    <div class="sp-container sp-header-row">
      <NuxtLink class="sp-brand" to="/" aria-label="StorePro">
        <span class="sp-brand-mark"><Store :size="23" stroke-width="2.5" /></span>
        <span class="sp-brand-copy">
          <strong>StorePro</strong>
          <small>{{ isEnglish ? 'E-commerce solutions' : 'حلول التجارة الإلكترونية' }}</small>
        </span>
      </NuxtLink>

      <nav
        id="storepro-navigation"
        class="sp-nav"
        :class="{ 'sp-nav-open': menuOpen }"
        :aria-label="isEnglish ? 'Main navigation' : 'التنقل الرئيسي'"
      >
        <NuxtLink v-for="item in navItems" :key="item.to" :to="item.to" @click="menuOpen = false">
          {{ item.label }}
        </NuxtLink>
        <div class="sp-mobile-tools">
          <button type="button" :aria-pressed="locale === 'ar'" @click="setLocale('ar')">العربية</button>
          <button type="button" :aria-pressed="locale === 'en'" @click="setLocale('en')">English</button>
          <NuxtLink class="sp-btn sp-btn-primary" to="/contact#inquiry">
            {{ isEnglish ? 'Start your store' : 'ابدأ متجرك الآن' }}
            <StoreProDirectionalArrow :size="16" />
          </NuxtLink>
        </div>
      </nav>

      <div class="sp-header-actions">
        <div class="sp-language" role="group" :aria-label="isEnglish ? 'Choose language' : 'اختيار اللغة'">
          <button type="button" :class="{ active: locale === 'ar' }" :aria-pressed="locale === 'ar'" @click="setLocale('ar')">ع</button>
          <button type="button" :class="{ active: locale === 'en' }" :aria-pressed="locale === 'en'" @click="setLocale('en')">EN</button>
        </div>

        <button
          class="sp-theme-toggle"
          type="button"
          :aria-label="theme === 'dark' ? (isEnglish ? 'Switch to light mode' : 'التبديل إلى الوضع الفاتح') : (isEnglish ? 'Switch to dark mode' : 'التبديل إلى الوضع الداكن')"
          :title="theme === 'dark' ? (isEnglish ? 'Light mode' : 'الوضع الفاتح') : (isEnglish ? 'Dark mode' : 'الوضع الداكن')"
          :aria-pressed="theme === 'dark'"
          @click="toggleTheme"
        >
          <Sun v-show="theme === 'dark'" :size="18" aria-hidden="true" />
          <Moon v-show="theme !== 'dark'" :size="18" aria-hidden="true" />
        </button>

        <NuxtLink class="sp-btn sp-btn-primary sp-header-cta" to="/contact#inquiry">
          {{ isEnglish ? 'Start your store' : 'ابدأ متجرك الآن' }}
          <StoreProDirectionalArrow :size="17" />
        </NuxtLink>
        <button
          class="sp-menu-toggle"
          type="button"
          :aria-label="menuOpen ? (isEnglish ? 'Close menu' : 'إغلاق القائمة') : (isEnglish ? 'Open menu' : 'فتح القائمة')"
          :aria-expanded="menuOpen"
          aria-controls="storepro-navigation"
          @click="menuOpen = !menuOpen"
        >
          <X v-if="menuOpen" :size="23" />
          <Menu v-else :size="23" />
        </button>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import { Menu, Moon, Store, Sun, X } from 'lucide-vue-next'

const menuOpen = ref(false)
const { locale, isEnglish, setLocale } = useLocale()
const { theme, toggleTheme } = useStoreProTheme()
const navItems = computed(() => isEnglish.value
  ? [{ to: '/', label: 'Home' }, { to: '/services', label: 'Services' }, { to: '/portfolio', label: 'Our work' }, { to: '/pricing', label: 'Pricing' }, { to: '/blog', label: 'Articles' }, { to: '/about', label: 'About' }, { to: '/contact', label: 'Contact' }]
  : [{ to: '/', label: 'الرئيسية' }, { to: '/services', label: 'خدماتنا' }, { to: '/portfolio', label: 'أعمالنا' }, { to: '/pricing', label: 'الأسعار' }, { to: '/blog', label: 'مقالات' }, { to: '/about', label: 'من نحن' }, { to: '/contact', label: 'تواصل معنا' }])
const route = useRoute()
watch(() => route.fullPath, () => { menuOpen.value = false })
</script>
