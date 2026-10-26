<template>
  <section v-if="ready && (needsChoice || settingsOpen)" class="consent-panel" role="region" :aria-label="text(consent.region)">
    <template v-if="settingsOpen">
      <div class="consent-copy"><strong>{{ text(consent.title) }}</strong><p>{{ text(consent.settings_description) }}</p></div>
      <label class="consent-option"><span><strong>{{ text(consent.essential) }}</strong><small>{{ text(consent.essential_description) }}</small></span><input type="checkbox" checked disabled></label>
      <label class="consent-option"><span><strong>{{ text(consent.analytics) }}</strong><small>{{ text(consent.analytics_description) }}</small></span><input v-model="analytics" type="checkbox"></label>
      <label class="consent-option"><span><strong>{{ text(consent.marketing) }}</strong><small>{{ text(consent.marketing_description) }}</small></span><input v-model="marketing" type="checkbox"></label>
      <div class="consent-actions"><button type="button" class="secondary" @click="rejectOptional">{{ text(consent.reject) }}</button><button type="button" class="primary" @click="save(analytics, marketing)">{{ text(consent.save) }}</button></div>
    </template>
    <template v-else>
      <div class="consent-copy"><strong>{{ text(consent.title) }}</strong><p>{{ text(consent.description) }}</p></div>
      <div class="consent-actions"><button type="button" class="secondary" @click="rejectOptional">{{ text(consent.reject) }}</button><button type="button" class="secondary" @click="openSettings">{{ text(consent.manage) }}</button><button type="button" class="primary" @click="acceptAll">{{ text(consent.allow) }}</button></div>
    </template>
  </section>
</template>

<script setup lang="ts">
const { page, text } = await useSiteContent()
const global = page('global')
const consent = computed(() => global.value.consent || {})
const { preferences, needsChoice, settingsOpen, ready, acceptAll, rejectOptional, openSettings, save } = useConsent()
const analytics = ref(false)
const marketing = ref(false)
watch(settingsOpen, (open) => {
  if (open) {
    analytics.value = Boolean(preferences.value?.analytics)
    marketing.value = Boolean(preferences.value?.marketing)
  }
}, { immediate: true })
</script>

<style scoped>
.consent-panel{position:fixed;z-index:200;inset-inline:16px;bottom:16px;display:grid;grid-template-columns:minmax(250px,1fr) auto;align-items:center;gap:18px;max-width:1080px;margin-inline:auto;padding:17px 19px;border:1px solid var(--sp-line);border-radius:15px;background:var(--sp-surface);color:var(--sp-text);box-shadow:0 16px 50px #12283b30}.consent-copy strong{font-size:1rem}.consent-copy p{margin:5px 0 0;color:var(--sp-muted);font-size:.82rem;line-height:1.55}.consent-actions{display:flex;align-items:center;justify-content:flex-end;gap:8px;flex-wrap:wrap}.consent-actions button{min-height:38px;padding:7px 11px;border:1px solid var(--sp-line);border-radius:8px;background:var(--sp-surface);color:var(--sp-text);font:inherit;font-size:.8rem;font-weight:750;cursor:pointer}.consent-actions .primary{border-color:var(--sp-blue);background:var(--sp-blue);color:#fff}.consent-option{grid-column:1/-1;display:flex;justify-content:space-between;align-items:center;padding:9px 0;border-top:1px solid var(--sp-line)}.consent-option strong,.consent-option small{display:block}.consent-option small{margin-top:3px;color:var(--sp-muted);font-size:.77rem}.consent-option input{width:18px;height:18px;accent-color:var(--sp-blue)}@media(max-width:760px){.consent-panel{grid-template-columns:1fr;inset-inline:10px;bottom:10px;padding:14px}.consent-actions{justify-content:flex-start}.consent-actions button{flex:1}}
</style>
