<template>
  <main v-if="collection">
    <section class="collection-hero"><div class="container collection-inner"><div><span class="eyebrow">{{ collection.type === 'campaign' ? (isEnglish ? 'CAMPAIGN' : 'حملة تسويقية') : (isEnglish ? '3B PICKS' : 'اختيارات 3B') }}</span><h1>{{ collectionName }}</h1><p>{{ collectionDescription }}</p></div><img v-if="collection.image_url" :src="collection.image_url" :alt="collectionName"></div></section>
    <section class="section"><div class="container"><div v-if="collection.products?.length" class="product-grid"><ProductCard v-for="product in collection.products" :key="product.id" :product="product" /></div><EmptyState v-else :title="isEnglish ? 'Products are being added' : 'تتم إضافة المنتجات'" :text="isEnglish ? 'Check back soon for products in this collection.' : 'تابعنا قريباً لاكتشاف منتجات هذه المجموعة.'" :action="t('allProducts')" action-to="/products" /></div></section>
  </main>
  <main v-else><EmptyState :title="isEnglish ? 'Collection unavailable' : 'المجموعة غير متاحة'" :text="isEnglish ? 'This promotion may have ended.' : 'قد يكون العرض قد انتهى.'" :action="t('allProducts')" action-to="/products" /></main>
</template>

<script setup lang="ts">
const route=useRoute();const config=useRuntimeConfig();const {locale,isEnglish,t}=useLocale()
const {data:collection}=await useAsyncData(`collection-${route.params.slug}`,async()=>{try{const response=await $fetch<{data:any}>(`/collections/slug/${route.params.slug}`,{baseURL:config.public.apiBase});return response.data}catch{return null}})
const collectionName=computed(()=>getLocalizedFirst(locale.value,collection.value?.name_ar,collection.value?.name_en,''))
const collectionDescription=computed(()=>getLocalizedFirst(locale.value,collection.value?.description_ar,collection.value?.description_en,''))
const collectionSeoTitle = computed(() => getLocalizedFirst(locale.value, collection.value?.meta_title_ar, collection.value?.meta_title_en, collectionName.value))
const collectionSeoDescription = computed(() => getLocalizedFirst(locale.value, collection.value?.meta_description_ar, collection.value?.meta_description_en, collectionDescription.value))
useSeoMeta({ title: collectionSeoTitle, description: collectionSeoDescription, ogTitle: collectionSeoTitle, ogDescription: collectionSeoDescription })
const collectionPath = computed(() => `/collections/${String(route.params.slug)}`)
useCanonicalLinks(collectionPath)
useHead(() => ({ script: collection.value ? [{ key: '3b-collection-jsonld', type: 'application/ld+json', innerHTML: serializeJsonLd({ '@context': 'https://schema.org', '@type': 'CollectionPage', name: collectionName.value, description: collectionDescription.value || undefined, url: `${String(config.public.siteUrl).replace(/\/$/, '')}${collectionPath.value}` }) }] : [] }))
import { getLocalizedFirst } from '~/utils/catalog'
</script>

<style scoped>
.collection-hero{padding:26px 0;background:var(--cream);border-bottom:1px solid var(--line)}.collection-inner{min-height:180px;display:grid;grid-template-columns:minmax(0,1fr) minmax(220px,.7fr);align-items:center;gap:25px}.collection-inner h1{margin:5px 0;font-size:2.2rem}.collection-inner p{max-width:650px;color:var(--muted)}.collection-inner img{max-width:100%;max-height:220px;justify-self:center;object-fit:contain;border-radius:12px}@media(max-width:650px){.collection-inner{grid-template-columns:1fr}.collection-inner h1{font-size:1.8rem}.collection-inner img{max-height:150px}}
</style>
