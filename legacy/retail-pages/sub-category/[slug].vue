<template>
  <main>
    <div v-if="subCategory?.desktop_banner_url" class="sub-category-banner"><picture><source v-if="subCategory.mobile_banner_url" :srcset="subCategory.mobile_banner_url" media="(max-width: 700px)"><img :src="subCategory.desktop_banner_url" :alt="locale === 'ar' ? (subCategory.banner_alt_ar || subCategoryName) : (subCategory.banner_alt_en || subCategoryName)" fetchpriority="high"></picture></div>
    <nav v-if="parentCategory" class="container category-breadcrumbs" aria-label="Breadcrumb"><NuxtLink to="/">{{ t('home') }}</NuxtLink><span aria-hidden="true">›</span><NuxtLink :to="`/category/${parentCategory.slug}`">{{ getLocalizedFirst(locale, parentCategory.name_ar, parentCategory.name_en, parentCategory.name) }}</NuxtLink><span aria-hidden="true">›</span><span>{{ subCategoryName }}</span></nav>
    <PageHero :eyebrow="t('subCategory')" :title="subCategoryName || t('products')" :description="subCategory ? (getLocalizedFirst(locale, subCategory.description_ar, subCategory.description_en, '') || t('subcategoryIntro', { category: subCategoryName })) : t('browseProducts')">
      <NuxtLink v-if="parentCategory" :to="`/category/${parentCategory.slug}`" class="btn secondary">{{ getLocalizedFirst(locale, parentCategory.name_ar, parentCategory.name_en, parentCategory.name) }}</NuxtLink>
    </PageHero>
    <section class="section">
      <div class="container">
        <nav v-if="subCategory?.children?.length" class="child-category-grid" :aria-label="t('subCategories')"><NuxtLink v-for="child in subCategory.children" :key="child.id" :to="`/sub-category/${child.slug}`"><img v-if="child.image" :src="child.thumbnails?.small || child.image" alt="" loading="lazy"><span>{{ getLocalizedFirst(locale, child.name_ar, child.name_en, child.name) }}</span></NuxtLink></nav>
        <div v-if="filtered.length" class="product-grid">
          <ProductCard v-for="product in filtered" :key="product.id" :product="product" />
        </div>
        <EmptyState v-else :title="t('preparingCategory')" :text="t('newChoicesSoon')" :action="t('viewAllProducts')" action-to="/products" />
        <nav v-if="pageMeta && pageMeta.last_page > 1" class="product-pagination" :aria-label="locale === 'ar' ? 'صفحات المنتجات' : 'Product pages'">
          <button :disabled="pageMeta.current_page <= 1" @click="changePage(pageMeta.current_page - 1)">{{ locale === 'ar' ? 'السابق' : 'Previous' }}</button>
          <span>{{ pageMeta.current_page }} / {{ pageMeta.last_page }}</span>
          <button :disabled="pageMeta.current_page >= pageMeta.last_page" @click="changePage(pageMeta.current_page + 1)">{{ locale === 'ar' ? 'التالي' : 'Next' }}</button>
        </nav>
      </div>
    </section>
  </main>
</template>

<script setup lang="ts">
import { getLocalizedFirst } from '~/utils/catalog'
const { locale, t } = useLocale()
const route = useRoute()
const slug = computed(() => String(route.params.slug))
const { categories, getSubCategoryBySlug, fetchProducts } = useCatalog()
const subCategory = computed(() => getSubCategoryBySlug(slug.value))
const page = computed(() => Math.max(1, Number(route.query.page) || 1))
const { data: subCategoryProductsPage } = await useAsyncData(
  () => `sub-category-products-${slug.value}-${page.value}`,
  async () => subCategory.value ? fetchProducts({ sub_category_id: subCategory.value.id, page: page.value }) : null,
  { watch: [slug, page] },
)
const subCategoryName = computed(() => subCategory.value ? getLocalizedFirst(locale.value, subCategory.value.name_ar, subCategory.value.name_en, subCategory.value.name) : '')
const parentCategory = computed(() => categories.value.find(category => category.id === subCategory.value?.category_id))
const filtered = computed(() => subCategoryProductsPage.value?.products || [])
const pageMeta = computed(() => subCategoryProductsPage.value?.meta || null)
const changePage = (nextPage: number) => navigateTo({ query: { ...route.query, page: String(nextPage) } })
useSeoMeta({ title: () => subCategory.value ? getLocalizedFirst(locale.value, subCategory.value.meta_title_ar, subCategory.value.meta_title_en, subCategoryName.value) : subCategoryName.value, description: () => subCategory.value ? getLocalizedFirst(locale.value, subCategory.value.meta_description_ar, subCategory.value.meta_description_en, '') : '' })
const subCategoryPath = computed(() => `/sub-category/${slug.value}`)
useCanonicalLinks(subCategoryPath)
</script>

<style scoped>
.product-pagination{display:flex;align-items:center;justify-content:center;gap:16px;margin:24px 0}.product-pagination button{min-height:40px;padding:8px 14px;border:1px solid var(--line);border-radius:9px;background:var(--theme-surface);color:var(--theme-text)}.product-pagination button:disabled{opacity:.45;cursor:not-allowed}
.sub-category-banner{width:min(1680px,calc(100% - clamp(28px,6vw,112px)));height:clamp(150px,23vw,330px);margin:22px auto 0;position:relative;overflow:hidden;border-radius:18px;background:var(--cream)}.sub-category-banner picture,.sub-category-banner img{position:absolute;inset:0;width:100%;height:100%;display:block}.sub-category-banner img{object-fit:cover}.category-breadcrumbs{display:flex;gap:9px;align-items:center;padding-top:18px;color:var(--muted);font-size:.85rem}.child-category-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(160px,1fr));gap:12px;margin-bottom:24px}.child-category-grid a{display:flex;align-items:center;gap:10px;min-height:82px;padding:10px;border:1px solid var(--line);border-radius:12px;background:var(--theme-surface);font-weight:700}.child-category-grid img{width:58px;height:58px;object-fit:contain}.child-category-grid a:focus-visible{outline:3px solid var(--theme-accent);outline-offset:3px}@media(max-width:600px){.sub-category-banner{width:calc(100% - 28px)}.child-category-grid{grid-template-columns:repeat(2,minmax(0,1fr))}}
</style>
