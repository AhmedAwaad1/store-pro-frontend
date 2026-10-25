<template>
  <main>
    <PageHero
      :eyebrow="isEnglish ? 'BRANDS' : 'العلامات التجارية'"
      :title="isEnglish ? 'Shop by brand' : 'تسوق حسب العلامة التجارية'"
      :description="isEnglish ? 'Explore products from brands available at 3B.' : 'اكتشف منتجات العلامات التجارية المتوفرة لدى 3B.'"
    />
    <section class="section">
      <div class="container">
        <div v-if="brands.length" class="brand-directory">
          <NuxtLink v-for="brand in brands" :key="brand.id" :to="`/brands/${brand.slug}`" class="brand-card">
            <div class="brand-logo" :class="{ 'brand-logo--dark': brandLogoNeedsDarkSurface(brand), 'brand-logo--wordmark': brandLogoNeedsWordmarkScale(brand) }">
              <img v-if="brandLogoUrl(brand)" :src="brandLogoUrl(brand)!" alt="" width="120" height="52" loading="lazy" decoding="async">
              <span v-else aria-hidden="true">{{ brandName(brand).slice(0, 1) }}</span>
            </div>
            <strong>{{ brandName(brand) }}</strong>
          </NuxtLink>
        </div>
        <EmptyState v-else
          :title="isEnglish ? 'Brands are being added' : 'تتم إضافة العلامات التجارية'"
          :text="isEnglish ? 'Check back soon to explore our brand collection.' : 'تابعنا قريباً لاكتشاف العلامات التجارية المتاحة.'"
          :action="t('allProducts')"
          action-to="/products"
        />
      </div>
    </section>
  </main>
</template>

<script setup lang="ts">
import { brandLogoNeedsDarkSurface, brandLogoNeedsWordmarkScale, brandLogoUrl } from '~/utils/brand-logo'

type Brand = { id: number; name_en: string; name_ar: string; slug: string; logo_url?: string | null }

const { locale, isEnglish, t } = useLocale()
const config = useRuntimeConfig()
const { data: brands } = await useAsyncData('brand-directory', async () => {
  try {
    const response = await $fetch<{ data?: { data?: Brand[] } }>('/brands?per_page=100', {
      baseURL: config.public.apiBase,
    })
    return response.data?.data || []
  } catch {
    return []
  }
})
const brandName = (brand: Brand) => locale.value === 'ar' ? brand.name_ar : brand.name_en

useSeoMeta({
  title: () => isEnglish.value ? 'Shop by brand | 3B' : 'تسوق حسب العلامة التجارية | 3B',
  description: () => isEnglish.value ? 'Explore products from brands available at 3B.' : 'اكتشف منتجات العلامات التجارية المتوفرة لدى 3B.',
})
useCanonicalLinks('/brands')
</script>

<style scoped>
.brand-directory{display:grid;grid-template-columns:repeat(auto-fill,minmax(190px,1fr));gap:14px}.brand-card{display:grid;justify-items:center;gap:12px;padding:16px;border:1px solid var(--line);border-radius:14px;background:var(--theme-surface);color:var(--theme-text);text-align:center;transition:transform .2s ease,border-color .2s ease,box-shadow .2s ease}.brand-card:hover{transform:translateY(-2px);border-color:var(--theme-accent);box-shadow:var(--shadow)}.brand-card:focus-visible{outline:3px solid var(--theme-accent);outline-offset:3px}.brand-logo{display:grid;place-items:center;width:100%;height:120px;overflow:hidden;border-radius:10px;background:var(--theme-page)}.brand-logo--dark{background:#171717}.brand-logo img{width:min(100%,120px);height:52px;object-fit:contain}.brand-logo--wordmark img{transform:scale(2)}.brand-logo span{font-size:2rem;font-weight:800;color:var(--theme-primary)}
</style>
