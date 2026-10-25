<template><main><PageHero :eyebrow="t('favorites')" :title="t('wishlist')" :description="isEnglish ? 'Styles you like stay here until you are ready.' : 'الحاجات اللي عجبتك محفوظة هنا لحد ما تقرر.'"/><section class="section"><div class="container"><div v-if="items.length" class="product-grid"><ProductCard v-for="product in items" :key="product.id" :product="product"/></div><EmptyState v-else :title="t('emptyFavorites')" :text="t('emptyFavoritesText')" :action="t('shopNow')" action-to="/products"/></div></section></main></template>
<script setup lang="ts">
import type { Product } from '~/types/catalog'

const { wishlist } = useShop()
const { t, isEnglish } = useLocale()
const config = useRuntimeConfig()
const items = ref<Product[]>([])

watch(wishlist, async (ids) => {
  const responses = await Promise.all(ids.map(id =>
    $fetch<{ data: Product }>(`/products/${id}`, { baseURL: config.public.apiBase }).catch(() => null),
  ))
  items.value = responses.flatMap(response => response?.data ? [response.data] : [])
}, { immediate: true })
</script>
