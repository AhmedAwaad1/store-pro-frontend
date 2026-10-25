<template>
  <main class="categories-page">
    <section class="categories-intro">
      <div class="container">
        <span class="eyebrow">{{ t('categoriesTitle') }}</span>
        <h1>{{ t('chooseCategory') }}</h1>
        <p>{{ t('categoriesIntro') }}</p>
      </div>
    </section>

    <section
      v-for="(category, index) in categories"
      :key="category.id"
      class="category-feature-section"
      :class="{ 'category-feature-section-tinted': index % 2 === 1 }"
    >
      <div class="container">
        <article class="category-feature">
          <NuxtLink :to="`/category/${category.slug}`" class="category-feature-image" :aria-label="t('exploreCategory', { category: categoryName(category) })">
            <img
              :src="categoryImage(category)"
              :alt="categoryName(category)"
              width="1536"
              height="1024"
              :loading="index === 0 ? 'eager' : 'lazy'"
              decoding="async"
              @error="handleCategoryImageError($event, category)"
            >
          </NuxtLink>
          <div class="category-feature-copy">
            <span class="eyebrow">{{ t('store') }}</span>
            <h2>{{ categoryName(category) }}</h2>
            <p>{{ subCategoryName(category.id) }}</p>
            <NuxtLink :to="`/category/${category.slug}`" class="btn primary">{{ t('browseCategory') }} <ArrowLeft /></NuxtLink>
          </div>
        </article>
      </div>
    </section>
  </main>
</template>

<script setup lang="ts">
import { ArrowLeft } from 'lucide-vue-next'
import type { Category } from '~/types/catalog'
import { getLocalizedFirst } from '~/utils/catalog'

const { categories, getSubCategoriesByCategory } = useCatalog()
const { locale, t } = useLocale()
const categoryName = (category: Category) => getLocalizedFirst(locale.value, category.name_ar, category.name_en, category.name)
const subCategoryName = (categoryId: number) => {
  const subCategory = getSubCategoriesByCategory(categoryId)[0]
  return subCategory ? getLocalizedFirst(locale.value, subCategory.name_ar, subCategory.name_en, subCategory.name) : t('discoverCategory')
}
const categoryImageCandidates = (category: Category) => [
  category.thumbnails?.medium,
  category.image,
  '/images/hero.jpg',
].filter((image, index, images): image is string => Boolean(image) && images.indexOf(image) === index)
const categoryImage = (category: Category) => categoryImageCandidates(category)[0] || '/images/hero.jpg'
const handleCategoryImageError = (event: Event, category: Category) => {
  const image = event.currentTarget as HTMLImageElement
  const nextIndex = Number(image.dataset.imageIndex || 0) + 1
  const candidates = categoryImageCandidates(category)
  if (nextIndex >= candidates.length) return
  image.dataset.imageIndex = String(nextIndex)
  image.src = candidates[nextIndex]
}
</script>

<style scoped>
.categories-intro{padding:38px 0 26px;text-align:start}.categories-intro h1{font-size:clamp(2rem,3vw,3rem);line-height:1.25;margin:6px 0}.categories-intro p{color:var(--muted);margin:0}
.category-feature-section{padding:clamp(28px,3.5vw,44px) 0;border-top:1px solid var(--line)}.category-feature-section-tinted{background:var(--cream)}
.category-feature{display:grid;grid-template-columns:minmax(0,1.1fr) minmax(0,.9fr);align-items:center;gap:clamp(24px,4vw,60px)}
.category-feature-image{position:relative;display:block;width:100%;aspect-ratio:3 / 2;min-width:0;overflow:hidden;border-radius:18px;background:#fff}.category-feature-image img{position:absolute;inset:0;display:block;width:100%;height:100%;object-fit:cover;object-position:center}
.category-feature-image:focus-visible{outline:3px solid var(--coral);outline-offset:4px}.category-feature-copy{padding:16px 4px}.category-feature-copy h2{font-size:clamp(2rem,3.4vw,3.3rem);line-height:1.2;margin:8px 0;text-wrap:balance}.category-feature-copy p{font-size:1rem;color:var(--muted);margin:0 0 22px}.category-feature-copy .btn{width:max-content;gap:9px}
@media(max-width:800px){.category-feature{grid-template-columns:minmax(0,1.05fr) minmax(0,.95fr);gap:24px}.categories-intro{padding-top:28px}}
@media(max-width:560px){.categories-intro{padding:24px 0 20px}.category-feature-section{padding:22px 0}.category-feature{grid-template-columns:1fr;gap:12px}.category-feature-image{border-radius:15px}.category-feature-copy{padding:4px 2px 8px}.category-feature-copy h2{font-size:1.8rem;margin:4px 0}.category-feature-copy p{margin-bottom:14px}}
</style>
