<template>
  <section v-if="ready && (needsChoice || settingsOpen)" class="consent-panel" role="region" :aria-label="isEnglish ? 'Privacy preferences' : 'تفضيلات الخصوصية'">
    <template v-if="settingsOpen">
      <div class="consent-copy"><strong>{{ isEnglish ? 'Privacy preferences' : 'تفضيلات الخصوصية' }}</strong><p>{{ isEnglish ? 'Choose which optional measurement tools StorePro may use. Essential storage is always active for site security and saved preferences.' : 'اختر أدوات القياس الاختيارية التي تسمح لـ StorePro باستخدامها. التخزين الضروري يعمل دائمًا لأمان الموقع وحفظ تفضيلاتك.' }}</p></div>
      <label class="consent-option"><span><strong>{{ isEnglish ? 'Essential' : 'ضرورية' }}</strong><small>{{ isEnglish ? 'Site security and preferences' : 'أمان الموقع والتفضيلات' }}</small></span><input type="checkbox" checked disabled></label>
      <label class="consent-option"><span><strong>{{ isEnglish ? 'Analytics' : 'التحليلات' }}</strong><small>{{ isEnglish ? 'Site usage and page performance' : 'استخدام الموقع وأداء الصفحات' }}</small></span><input v-model="analytics" type="checkbox"></label>
      <label class="consent-option"><span><strong>{{ isEnglish ? 'Marketing' : 'التسويق' }}</strong><small>{{ isEnglish ? 'Advertising measurement and conversion events' : 'قياس الإعلانات وأحداث التحويل' }}</small></span><input v-model="marketing" type="checkbox"></label>
      <div class="consent-actions"><button type="button" class="secondary" @click="rejectOptional">{{ isEnglish ? 'Reject optional' : 'رفض الاختياري' }}</button><button type="button" class="primary" @click="save(analytics, marketing)">{{ isEnglish ? 'Save choices' : 'حفظ الاختيارات' }}</button></div>
    </template>
    <template v-else>
      <div class="consent-copy"><strong>{{ isEnglish ? 'Your privacy choices' : 'اختيارات الخصوصية' }}</strong><p>{{ isEnglish ? 'StorePro uses essential storage for site security and saved preferences. Optional analytics and marketing measurement start only if you allow them.' : 'يستخدم StorePro التخزين الضروري لأمان الموقع وحفظ التفضيلات. لا تبدأ التحليلات وقياسات التسويق الاختيارية إلا بعد موافقتك.' }}</p></div>
      <div class="consent-actions"><button type="button" class="secondary" @click="rejectOptional">{{ isEnglish ? 'Reject optional' : 'رفض الاختياري' }}</button><button type="button" class="secondary" @click="openSettings">{{ isEnglish ? 'Manage choices' : 'إدارة الاختيارات' }}</button><button type="button" class="primary" @click="acceptAll">{{ isEnglish ? 'Allow all' : 'السماح للكل' }}</button></div>
    </template>
  </section>
</template>

<script setup lang="ts">
const { isEnglish } = useLocale()
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
