<template>
  <main class="sp-page">
    <section class="sp-page-hero"><div class="sp-container"><span class="sp-eyebrow">{{ text(content.hero?.eyebrow) }}</span><h1>{{ text(content.hero?.title) }}</h1><p>{{ text(content.hero?.description) }}</p></div></section>
    <section class="sp-section sp-pricing-page">
      <div class="sp-container">
        <div class="sp-pricing-grid">
          <article
            v-for="(plan, index) in content.plans || []"
            :key="index"
            class="sp-price-card"
            :class="{ 'sp-price-card-featured': plan.popular, 'sp-price-card-sale': plan.current_price }"
          >
            <span v-if="plan.popular" class="sp-popular-tag">{{ text(content.popular_label) }}</span>
            <h2>{{ text(plan.title) }}</h2>
            <span v-if="!isEnglish && text(plan.subtitle)" class="sp-plan-subtitle">{{ text(plan.subtitle) }}</span>
            <p>{{ text(plan.description) }}</p>
            <div v-if="plan.current_price" class="sp-plan-price" :class="{ 'sp-promo-pricing': plan.promo_label || plan.original_price }">
              <span v-if="plan.promo_label" class="sp-promo-label">{{ text(plan.promo_label) }}</span>
              <div class="sp-price-values">
                <span v-if="plan.original_price_label && plan.original_price" class="sp-original-price">
                  <span>{{ text(plan.original_price_label) }}</span>
                  <del><bdi>{{ text(plan.original_price) }}</bdi></del>
                </span>
                <del v-else-if="plan.original_price"><bdi>{{ text(plan.original_price) }}</bdi></del>
                <strong class="sp-price-current"><bdi>{{ text(plan.current_price) }}</bdi></strong>
              </div>
            </div>
            <strong v-else class="sp-price-label">{{ text(content.custom_price) }}</strong>
            <h3 v-if="text(plan.features_heading)" class="sp-plan-features-title">{{ text(plan.features_heading) }}</h3>
            <ul>
              <li v-for="(feature, featureIndex) in plan.features || []" :key="featureIndex">
                <Check :size="16" />{{ text(feature) }}
              </li>
            </ul>
            <NuxtLink class="sp-btn" :class="plan.popular ? 'sp-btn-primary' : 'sp-btn-outline'" :to="`/contact?package=${plan.id}#inquiry`">
              {{ text(plan.action_label || content.request_label) }} <StoreProDirectionalArrow :size="16" />
            </NuxtLink>
          </article>
        </div>
        <p class="sp-pricing-note">{{ text(content.note) }}</p>
      </div>
    </section>
  </main>
</template>
<script setup lang="ts">
import { Check } from 'lucide-vue-next'
const { isEnglish } = useLocale()
const { page, text } = await useSiteContent()
const content = page('pricing')
useSeoMeta({ title: () => text(content.value.meta_title), description: () => text(content.value.meta_description) })
</script>
