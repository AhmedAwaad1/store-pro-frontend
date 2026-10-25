<template>
  <div class="header-wrap">
    <div class="announcement">3B · {{ t('electronicsStore') }} <Truck :size="18" /></div>
    <header class="site-header">
      <div class="utility-bar">
        <div class="container utility-row">
          <a v-if="supportPhone" :href="`tel:${supportPhone}`" class="utility-item"><Phone :size="15" />{{ supportPhone }}</a>
          <NuxtLink to="/branches" class="utility-item utility-branches"><MapPin :size="15" />{{ t('branches') }}</NuxtLink>
          <NuxtLink to="/account/orders" class="utility-item utility-track"><PackageSearch :size="15" />{{ t('trackOrder') }}</NuxtLink>
          <label class="delivery-location"><MapPin :size="15" /><span>{{ t('deliveryTo') }}</span><select v-model.number="cityId" :aria-label="t('deliveryLocation')"><option :value="null">{{ t('chooseCity') }}</option><option v-for="city in cities" :key="city.id" :value="city.id">{{ cityName(city) }}</option></select></label>
          <div class="language-toggle" role="group" :aria-label="isEnglish ? 'Choose language' : 'اختيار اللغة'">
            <button type="button" :class="{ active: locale === 'ar' }" :aria-label="t('languageArabic')" :aria-pressed="locale === 'ar'" @click="setLocale('ar')">ع</button>
            <button type="button" :class="{ active: locale === 'en' }" :aria-label="t('languageEnglish')" :aria-pressed="locale === 'en'" @click="setLocale('en')">E</button>
          </div>
        </div>
      </div>
      <div class="container header-row">
        <button class="mobile-menu" :aria-label="t('menu')" :aria-expanded="menuOpen" aria-controls="primary-navigation" @click="menuOpen = !menuOpen"><Menu /></button>
        <NuxtLink to="/" class="brand">
          <img v-if="logoUrl" :src="logoUrl" :alt="isEnglish ? '3B' : '٣ بي'" class="site-logo" />
          <template v-else>3B<span>.</span></template>
        </NuxtLink>
        <CatalogSearchBox class="header-search" />
        <div class="header-actions">
          <NuxtLink to="/search" class="mobile-search" :aria-label="t('search')"><Search /></NuxtLink>
          <NuxtLink to="/compare" class="compare-link" :aria-label="isEnglish ? `Compare products (${comparisonCount})` : `مقارنة المنتجات (${comparisonCount})`"><GitCompareArrows /><b v-if="comparisonCount">{{ comparisonCount }}</b></NuxtLink>
          <NuxtLink to="/wishlist" :aria-label="t('wishlist')"><Heart /></NuxtLink>
          <NuxtLink to="/account" :aria-label="t('account')" class="desktop-only"><UserRound /></NuxtLink>
          <NuxtLink to="/cart" class="cart-link" :aria-label="t('cart')"><ShoppingBag /><b v-if="cartCount">{{ cartCount }}</b></NuxtLink>
        </div>
      </div>
      <nav id="primary-navigation" :class="['main-nav', { open: menuOpen }]" :aria-label="t('categories')">
        <div class="container nav-row">
          <NuxtLink to="/" @click="menuOpen = false">{{ t('home') }}</NuxtLink>
          <div class="catalog-nav">
            <NuxtLink to="/categories" @click="closeMega">{{ t('categories') }}</NuxtLink><button type="button" class="category-toggle" :aria-label="isEnglish ? 'Open category menu' : 'فتح قائمة الفئات'" :aria-expanded="megaOpen" aria-controls="category-mega-menu" @click="toggleMega"><span aria-hidden="true">⌄</span></button>
            <div v-if="megaOpen" id="category-mega-menu" class="mega-menu" @keydown.esc="closeMega">
              <div class="desktop-mega-grid">
                <section v-for="category in navigation.categories" :key="category.id" class="mega-category"><NuxtLink class="mega-category-title" :to="`/category/${category.slug}`" @click="closeMega">{{ categoryLabel(category) }} <span aria-hidden="true">›</span></NuxtLink><div v-for="sub in category.sub_categories || []" :key="sub.id" class="mega-subgroup"><NuxtLink :to="`/sub-category/${sub.slug}`" @click="closeMega">{{ subLabel(sub) }}</NuxtLink><NuxtLink v-for="child in sub.children || []" :key="child.id" class="mega-child" :to="`/sub-category/${child.slug}`" @click="closeMega">{{ subLabel(child) }}</NuxtLink></div></section>
              </div>
              <div v-if="navigation.featured_brands.length" class="featured-nav-brands"><b>{{ isEnglish ? 'Featured brands' : 'العلامات التجارية المميزة' }}</b><NuxtLink v-for="brand in navigation.featured_brands" :key="brand.id" :to="`/brands/${brand.slug}`" @click="closeMega">{{ locale === 'ar' ? brand.name_ar : brand.name_en }}</NuxtLink></div>
              <div class="mobile-mega">
                <template v-if="!selectedMobileCategory"><button v-for="category in navigation.categories" :key="category.id" class="mobile-nav-item" @click="mobileCategoryId = category.id">{{ categoryLabel(category) }} <span>›</span></button></template>
                <template v-else-if="!selectedMobileSubcategory"><button class="mobile-back" @click="mobileCategoryId = null">‹ {{ isEnglish ? 'All categories' : 'كل الفئات' }}</button><NuxtLink class="mobile-nav-item" :to="`/category/${selectedMobileCategory.slug}`" @click="closeMega">{{ categoryLabel(selectedMobileCategory) }}</NuxtLink><button v-for="sub in selectedMobileCategory.sub_categories || []" :key="sub.id" class="mobile-nav-item" @click="sub.children?.length ? mobileSubcategoryId = sub.id : goToSubcategory(sub)">{{ subLabel(sub) }}<span>{{ sub.children?.length ? '›' : '' }}</span></button></template>
                <template v-else><button class="mobile-back" @click="mobileSubcategoryId = null">‹ {{ categoryLabel(selectedMobileCategory!) }}</button><NuxtLink class="mobile-nav-item" :to="`/sub-category/${selectedMobileSubcategory.slug}`" @click="closeMega">{{ subLabel(selectedMobileSubcategory) }}</NuxtLink><NuxtLink v-for="child in selectedMobileSubcategory.children || []" :key="child.id" class="mobile-nav-item" :to="`/sub-category/${child.slug}`" @click="closeMega">{{ subLabel(child) }}</NuxtLink></template>
              </div>
            </div>
          </div>
          <NuxtLink to="/products" @click="menuOpen = false">{{ t('products') }}</NuxtLink>
          <NuxtLink to="/offers" @click="menuOpen = false">{{ t('offers') }}</NuxtLink>
          <NuxtLink to="/branches" class="mobile-branch-link" @click="menuOpen = false">{{ t('branches') }}</NuxtLink>
          <NuxtLink to="/account/orders" class="mobile-track-link" @click="menuOpen = false">{{ t('trackOrder') }}</NuxtLink>
        </div>
      </nav>
    </header>
  </div>
</template>

<script setup lang="ts">
import { GitCompareArrows, Heart, MapPin, Menu, PackageSearch, Phone, Search, ShoppingBag, Truck, UserRound } from 'lucide-vue-next'
import type { Category, SubCategory } from '~/types/catalog'
const menuOpen = ref(false)
const megaOpen = ref(false)
const mobileCategoryId = ref<number | null>(null)
const mobileSubcategoryId = ref<number | null>(null)
const { cartCount } = useShop()
const { count: comparisonCount } = useComparison()
const { logoUrl } = useTheme()
const { locale, isEnglish, setLocale, t } = useLocale()
const { cityId } = useDeliveryLocation()
const config = useRuntimeConfig()
const supportPhone = config.public.supportPhone
const { data: cities } = await useAsyncData('header-delivery-cities', async () => {
  try {
    const response = await $fetch<{ data: Array<{ id: number; name_en: string; name_ar: string }> }>('/city', { baseURL: config.public.apiBase })
    return response.data || []
  } catch {
    return []
  }
})
const { data: navigationData } = await useAsyncData('header-catalog-navigation', async () => {
  try { const response = await $fetch<{ data: any }>('/catalog/navigation', { baseURL: config.public.apiBase }); return response.data }
  catch { return { categories: [], featured_brands: [], collections: [] } }
})
const navigation = computed(() => ({ categories: navigationData.value?.categories || [], featured_brands: navigationData.value?.featured_brands || [], collections: navigationData.value?.collections || [] }))
const selectedMobileCategory = computed(() => navigation.value.categories.find((category: Category) => category.id === mobileCategoryId.value) || null)
const selectedMobileSubcategory = computed(() => selectedMobileCategory.value?.sub_categories?.flatMap(item => [item, ...(item.children || [])]).find((subcategory: SubCategory) => subcategory.id === mobileSubcategoryId.value) || null)
const categoryLabel = (category: Category) => locale.value === 'ar' ? category.name_ar : category.name_en
const subLabel = (subcategory: SubCategory) => locale.value === 'ar' ? subcategory.name_ar : subcategory.name_en
const cityName = (city: { name_en: string; name_ar: string }) => locale.value === 'ar' ? city.name_ar : city.name_en
const toggleMega = () => { megaOpen.value = !megaOpen.value; mobileCategoryId.value = null; mobileSubcategoryId.value = null }
const closeMega = () => { megaOpen.value = false; mobileCategoryId.value = null; mobileSubcategoryId.value = null; menuOpen.value = false }
const goToSubcategory = async (subcategory: SubCategory) => { await navigateTo(`/sub-category/${subcategory.slug}`); closeMega() }
</script>

<style scoped>
.site-logo {
  display: block;
  height: 96px;
  width: auto;
  max-width: 320px;
  object-fit: contain;
}
.header-search{flex:1;max-width:530px;min-width:190px}.mobile-search{display:none}.compare-link b{position:absolute;inset:-10px auto auto -10px;background:var(--theme-accent);color:#fff;border-radius:50%;min-width:20px;height:20px;display:grid;place-items:center;font-size:.7rem}

.language-toggle{display:inline-flex;align-items:center;gap:3px;padding:3px;border:1px solid var(--line);border-radius:999px;background:var(--theme-surface);direction:ltr}
.language-toggle button{width:32px;height:32px;border:0;border-radius:50%;background:transparent;color:var(--theme-muted);font-size:.86rem;font-weight:800;line-height:1}
.language-toggle button.active{background:var(--theme-primary);color:var(--theme-on-primary)}
.language-toggle button:focus-visible{outline:2px solid var(--theme-accent);outline-offset:2px}
.catalog-nav{position:relative}.category-toggle{border:0;background:transparent;color:inherit;font-weight:650;padding:9px 2px}.category-toggle span{margin-inline-start:4px;color:var(--theme-accent)}.category-toggle:focus-visible,.mega-menu a:focus-visible,.mobile-nav-item:focus-visible,.mobile-back:focus-visible{outline:3px solid var(--theme-accent);outline-offset:3px;border-radius:5px}.mega-menu{position:absolute;top:calc(100% + 25px);inset-inline-start:-28px;width:min(1040px,calc(100vw - 40px));padding:22px;background:var(--theme-surface);border:1px solid var(--line);border-radius:14px;box-shadow:0 20px 50px #14252c22;color:var(--theme-text);z-index:60}.desktop-mega-grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:20px}.mega-category-title{display:flex;justify-content:space-between;font-weight:800;color:var(--theme-primary)!important;padding-bottom:9px;border-bottom:1px solid var(--line)}.mega-category-title span{color:var(--theme-accent)}.mega-subgroup{padding-top:10px}.mega-subgroup>a{display:block;padding:4px 0;font-size:.88rem}.mega-subgroup>a.mega-child{padding-inline-start:13px;font-size:.8rem;color:var(--theme-muted)}.featured-nav-brands{border-top:1px solid var(--line);margin-top:18px;padding-top:14px;display:flex;align-items:center;flex-wrap:wrap;gap:8px 18px;font-size:.86rem}.featured-nav-brands b{margin-inline-end:5px}.mobile-mega{display:none}

@media (max-width: 600px) {
  .site-logo {
    height: 64px;
    max-width: 210px;
  }

  .main-nav.open .language-toggle{align-self:flex-start}
}
@media(max-width:900px){.catalog-nav{width:100%}.category-toggle{width:100%;display:flex;justify-content:space-between;text-align:start;padding:10px 0}.mega-menu{position:static;width:100%;padding:10px 0 0;background:transparent;border:0;border-radius:0;box-shadow:none}.desktop-mega-grid,.featured-nav-brands{display:none}.mobile-mega{display:block}.mobile-nav-item,.mobile-back{width:100%;display:flex;justify-content:space-between;align-items:center;text-align:start;padding:11px 8px;border:0;border-bottom:1px solid var(--line);background:transparent;color:var(--theme-text);font:inherit}.mobile-nav-item span{color:var(--theme-accent)}.mobile-back{color:var(--theme-primary);font-weight:700}}
@media(max-width:900px){.header-search{display:none}.mobile-search{display:grid}}
.site-header{height:auto;position:sticky;top:0;z-index:50;background:var(--theme-header);border-bottom:1px solid var(--line);backdrop-filter:blur(14px)}
.utility-bar{background:color-mix(in srgb,var(--theme-soft) 70%,var(--theme-surface));border-bottom:1px solid var(--line);font-size:.78rem}
.utility-row{min-height:36px;display:flex;align-items:center;gap:22px}
.utility-item{display:inline-flex;align-items:center;gap:6px;white-space:nowrap;color:var(--theme-text)}
.delivery-location{display:flex;align-items:center;gap:6px;margin-inline-start:auto;color:var(--theme-text);white-space:nowrap}
.delivery-location select{border:0;padding:2px 4px;max-width:180px;background:transparent!important;color:var(--theme-text);font-weight:650}
.header-row{height:74px;display:flex;align-items:center;gap:clamp(15px,2.7vw,38px)}
.site-logo{height:56px;width:auto;max-width:200px;object-fit:contain}
.header-search{flex:1;max-width:660px;min-width:190px}.mobile-search{display:none}.header-actions{gap:19px}.header-actions svg{width:20px;height:20px}
.mobile-menu{border:0;background:none;color:var(--theme-primary);padding:6px}
.main-nav{display:block;border-top:1px solid var(--line);margin:0;background:var(--theme-header)}
.nav-row{display:flex;align-items:center;gap:28px;min-height:44px}
.nav-row>a,.catalog-nav>a{font-weight:650;color:var(--theme-header-text)}
.nav-row>a:hover,.catalog-nav>a:hover{color:var(--theme-accent)}
.nav-row>.mobile-branch-link,.nav-row>.mobile-track-link{display:none}
.language-toggle{gap:3px;padding:2px;margin-inline-start:0}
.catalog-nav{position:relative;display:flex;align-items:center}
.mega-menu{top:calc(100% + 13px)}
@media(max-width:1000px){
  .header-search{display:none}.mobile-search{display:grid}
  .main-nav{display:none}
  .main-nav.open{display:block;position:absolute;top:100%;inset-inline:14px;max-height:min(75vh,680px);overflow:auto;background:var(--theme-surface);border:1px solid var(--line);border-radius:0 0 16px 16px;box-shadow:var(--shadow)}
  .nav-row{align-items:stretch;flex-direction:column;gap:0;padding-block:8px}
  .nav-row>a,.catalog-nav>a{padding:10px 0}
  .nav-row>.mobile-branch-link,.nav-row>.mobile-track-link{display:block}
  .catalog-nav{width:100%;display:grid;grid-template-columns:1fr auto}
  .category-toggle{width:40px;display:flex;justify-content:center;padding:10px 0}
  .mega-menu{position:static;grid-column:1/-1;width:100%;padding:10px 0 0;background:transparent;border:0;border-radius:0;box-shadow:none}
  .desktop-mega-grid,.featured-nav-brands{display:none}.mobile-mega{display:block}
  .mobile-nav-item,.mobile-back{width:100%;display:flex;justify-content:space-between;align-items:center;text-align:start;padding:11px 8px;border:0;border-bottom:1px solid var(--line);background:transparent;color:var(--theme-text);font:inherit}
  .mobile-nav-item span{color:var(--theme-accent)}.mobile-back{color:var(--theme-primary);font-weight:700}
  .utility-row{gap:14px}.utility-track{display:none}
}
@media(max-width:600px){
  .utility-row{min-height:34px;gap:9px;font-size:.72rem}.utility-branches,.utility-track{display:none}
  .delivery-location{margin-inline-start:0;flex:1}.delivery-location span{display:none}.delivery-location select{max-width:150px;width:100%}
  .language-toggle button{width:28px;height:28px}.header-row{height:62px;gap:9px}
  .site-logo{height:45px;max-width:122px}.header-actions{gap:12px}.header-actions svg{width:19px;height:19px}
  .nav-row{padding-inline:15px}
}
</style>
