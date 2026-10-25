<template>
  <footer class="footer">
    <div class="container footer-grid">
      <div>
        <div class="brand footer-brand">
          <img v-if="logoUrl" :src="logoUrl" :alt="isEnglish ? '3B' : '٣ بي'" class="site-logo-footer" />
          <template v-else>3B<span>.</span></template>
        </div>
        <p>{{ t('footerTagline') }}</p>
      </div>
      <div><h4>{{ t('store') }}</h4><NuxtLink to="/products">{{ t('allProducts') }}</NuxtLink><NuxtLink to="/wishlist">{{ t('wishlist') }}</NuxtLink><NuxtLink to="/cart">{{ t('cart') }}</NuxtLink></div>
      <div>
        <h4>{{ t('help') }}</h4>
        <NuxtLink to="/account/orders">{{ t('trackOrder') }}</NuxtLink>
        <NuxtLink v-for="page in pages" :key="page.id" :to="{ path: '/page', query: { key: page.section_key } }">{{ getLocalizedFirst(locale, page.title_ar, page.title_en) }}</NuxtLink>
      </div>
      <div><h4>{{ t('stayClose') }}</h4><p>{{ t('newsletterText') }}</p><NuxtLink to="/#newsletter" class="newsletter-link">{{ t('subscribe') }}</NuxtLink><button type="button" class="privacy-link" @click="openSettings">{{ isEnglish ? 'Privacy choices' : 'اختيارات الخصوصية' }}</button></div>
    </div>
    <div class="container footer-bottom"><span>{{ t('copyright') }}</span><span>{{ t('footerTagline') }}</span></div>
  </footer>
</template>

<script setup lang="ts">
import { getLocalizedFirst } from '~/utils/catalog'
const { logoUrl } = useTheme()
const { locale, isEnglish, t } = useLocale()
const { list } = useStaticPages()
const route = useRoute()
const { openSettings } = useConsent()
const { data: pages, refresh } = await useAsyncData('storefront-static-pages', list, {
  server: false,
  default: () => [],
})
watch(() => route.fullPath, () => refresh())
</script>

<style scoped>
.site-logo-footer {
  height: 40px;
  width: auto;
  object-fit: contain;
}
.newsletter-link{display:inline-flex;margin-top:8px;padding:8px 14px;border-radius:8px;background:var(--theme-accent);color:var(--theme-on-primary);font-weight:750}
.privacy-link{display:block;margin-top:12px;padding:0;border:0;background:none;color:var(--theme-muted);font:inherit;font-size:.8rem;text-decoration:underline;text-underline-offset:3px;cursor:pointer}
</style>
