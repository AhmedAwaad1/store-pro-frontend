<template>
  <main>
    <PageHero :eyebrow="isEnglish ? 'Final step' : 'آخر خطوة'" :title="t('checkout')" :description="t('checkoutDescription')" />
    <section class="section">
      <div class="container checkout-grid">
        <form class="checkout-form" @submit.prevent="placeOrder">
          <section class="form-card">
            <div class="form-title"><span>{{ isEnglish ? '1' : '١' }}</span><div><h2>{{ t('contactInfo') }}</h2><p>{{ t('updatesMessage') }}</p></div></div>
            <div class="form-grid"><div class="field"><label>{{ t('fullName') }}</label><input v-model="form.name" name="name" required :placeholder="t('enterName')"></div><div class="field"><label>{{ t('phone') }}</label><input v-model="form.phone" name="phone" required type="tel" placeholder="01xxxxxxxxx"></div><div class="field full"><label>{{ t('email') }}</label><input v-model="form.email" name="email" type="email" placeholder="name@example.com"></div></div>
          </section>

          <section class="form-card">
            <div class="form-title"><span>{{ isEnglish ? '2' : '٢' }}</span><div><h2>{{ isEnglish ? 'Fulfillment method' : 'طريقة الاستلام' }}</h2><p>{{ isEnglish ? 'Choose delivery or collect from a 3B branch.' : 'اختر التوصيل أو الاستلام من أحد فروع 3B.' }}</p></div></div>
            <div class="fulfillment-options"><button type="button" :class="{ selected: form.fulfillment_method === 'delivery' }" @click="form.fulfillment_method = 'delivery'">{{ isEnglish ? 'Home delivery' : 'توصيل للمنزل' }}</button><button type="button" :disabled="!pickupAllowed" :class="{ selected: form.fulfillment_method === 'pickup' }" @click="form.fulfillment_method = 'pickup'">{{ isEnglish ? 'Pick up at a branch' : 'استلام من الفرع' }}</button></div>
            <p v-if="pickupRestriction" class="fulfillment-note">{{ pickupRestriction }}</p>
            <p v-if="hasDigitalItems" class="checkout-error">{{ isEnglish ? 'This cart contains a digital product, and digital delivery is not configured yet.' : 'تحتوي السلة على منتج رقمي، ولم يتم إعداد التسليم الرقمي بعد.' }}</p>
          </section>

          <section v-if="form.fulfillment_method === 'delivery'" class="form-card">
            <div class="form-title"><span>{{ isEnglish ? '3' : '٣' }}</span><div><h2>{{ t('deliveryAddress') }}</h2><p>{{ t('clearAddress') }}</p></div></div>
            <div v-if="locationError" class="location-error">{{ t('locationsUnavailable') }} <button type="button" @click="retryLocations">{{ t('retry') }}</button></div>
            <div class="form-grid">
              <div class="field">
                <label for="checkout-city">{{ t('city') }}</label>
                <select id="checkout-city" v-model="form.city_id" required :disabled="loadingCities">
                  <option :value="null" disabled>{{ loadingCities ? t('loadingLocations') : t('chooseCity') }}</option>
                  <option v-for="city in cities" :key="city.id" :value="city.id">{{ locationName(city) }}</option>
                </select>
              </div>
              <div class="field">
                <label for="checkout-district">{{ t('district') }}</label>
                <select id="checkout-district" v-model="form.district_id" :required="districts.length > 0" :disabled="!form.city_id || loadingDistricts || districts.length === 0">
                  <option :value="null" disabled>{{ loadingDistricts ? t('loadingLocations') : t('chooseDistrict') }}</option>
                  <option v-for="district in districts" :key="district.id" :value="district.id">{{ locationName(district) }}</option>
                </select>
              </div>
              <div class="field full"><label>{{ t('detailedAddress') }}</label><input v-model="form.address" name="address" required :placeholder="t('addressPlaceholder')"></div>
            </div>
          </section>

          <section v-else class="form-card">
            <div class="form-title"><span>{{ isEnglish ? '3' : '٣' }}</span><div><h2>{{ isEnglish ? 'Choose a branch' : 'اختر الفرع' }}</h2><p>{{ isEnglish ? 'Pickup is free. We will notify you when the order is ready.' : 'الاستلام مجاني. سنخبرك عندما يصبح الطلب جاهزاً.' }}</p></div></div>
            <p v-if="branchError" class="location-error">{{ branchError }} <button type="button" @click="loadBranches">{{ t('retry') }}</button></p>
            <label v-for="branch in branches" :key="branch.id" class="branch-option" :class="{ chosen: form.pickup_location_id === branch.id }"><input v-model.number="form.pickup_location_id" type="radio" :value="branch.id"><span><strong>{{ locationName({ name_en: branch.name, name_ar: branch.name }) }}</strong><small>{{ [branch.city, branch.address].filter(Boolean).join(' · ') }}</small></span></label>
            <p v-if="form.pickup_location_id && pickupStockReady === false" class="checkout-error">{{ isEnglish ? 'Some cart items are unavailable at this branch. Choose another branch or use delivery.' : 'بعض المنتجات غير متوفرة في هذا الفرع. اختر فرعاً آخر أو استخدم التوصيل.' }}</p>
            <p v-else-if="form.pickup_location_id && pickupStockReady === true" class="pickup-ready-hint">{{ isEnglish ? 'All items are available at this branch.' : 'جميع المنتجات متوفرة في هذا الفرع.' }}</p>
            <p v-else-if="form.pickup_location_id && checkingPickupStock" class="muted">{{ isEnglish ? 'Checking branch stock…' : 'جارٍ التحقق من مخزون الفرع…' }}</p>
          </section>

          <section class="form-card"><div class="form-title"><span>{{ isEnglish ? '4' : '٤' }}</span><div><h2>{{ t('paymentMethod') }}</h2><p>{{ t('choosePayment') }}</p></div></div><label class="pay-option"><input v-model="form.payment_method" type="radio" value="cod"><Banknote /><div><strong>{{ t('cod') }}</strong><small>{{ t('payOnDelivery') }}</small></div></label><label class="pay-option"><input v-model="form.payment_method" type="radio" value="card"><CreditCard /><div><strong>{{ t('bankCard') }}</strong><small>{{ t('secureOnline') }}</small></div></label>
            <div v-if="form.payment_method === 'card'" class="installment-picker"><label for="installment-plan">{{ isEnglish ? 'Installment plan (optional)' : 'خطة التقسيط (اختياري)' }}</label><select id="installment-plan" v-model.number="installmentPlanId" :disabled="installmentsLoading"><option :value="null">{{ isEnglish ? 'Pay in full' : 'الدفع بالكامل' }}</option><option v-for="plan in installmentPlans" :key="plan.id" :value="plan.id">{{ plan.provider.name }} · {{ plan.name }} · {{ plan.term_months }} {{ isEnglish ? 'months' : 'شهر' }} · {{ formatPrice(plan.monthly_payment, locale) }}{{ isEnglish ? '/month' : '/شهرياً' }}</option></select><small v-if="installmentsLoading" class="muted">{{ isEnglish ? 'Loading available plans…' : 'جارٍ تحميل خطط التقسيط…' }}</small><small v-else-if="installmentPlanId && selectedInstallmentPlan?.provider.terms_url"><a :href="selectedInstallmentPlan.provider.terms_url" target="_blank" rel="noopener">{{ isEnglish ? 'Provider terms' : 'شروط مقدم الخدمة' }}</a></small></div>
          </section>
          <p v-if="error" class="checkout-error">{{ error }}</p>
          <button type="submit" class="btn primary place-order" :disabled="!canSubmit">{{ loading ? t('confirmingOrder') : `${t('confirmOrder')} — ${formatPrice(total, locale)}` }} <ArrowLeft /></button>
        </form>

        <aside class="order-review"><h2>{{ t('yourOrder') }}</h2><p v-if="pricingError" class="checkout-error">{{ pricingError }} <button type="button" @click="syncCheckoutPricing">{{ t('retry') }}</button></p><p v-if="pricesChanged" class="price-change-notice">{{ isEnglish ? 'Current pricing changed since your cart was loaded. Review the prices below before ordering.' : 'تغيرت الأسعار منذ تحميل السلة. راجع الأسعار الحالية قبل تأكيد الطلب.' }}</p><div v-if="cart.length"><div v-for="line in cart" :key="line.key" class="review-line"><img :src="getProductImage(line.product, line.variant)" :alt="getLocalizedFirst(locale, line.product.name_ar, line.product.name_en, line.product.name)"><div><strong>{{ getLocalizedFirst(locale, line.product.name_ar, line.product.name_en, line.product.name) }}</strong><small v-if="line.variant">{{ getVariantOptionLabel(line.variant, locale) }}</small><small>{{ t('quantity', { count: line.qty }) }}</small><small v-if="line.product.warranty_duration_months">{{ isEnglish ? `${line.product.warranty_duration_months}-month warranty` : `ضمان ${line.product.warranty_duration_months} شهر` }}</small><small v-if="line.product.handling_class && line.product.handling_class !== 'standard'">{{ handlingLabel(line.product.handling_class) }}</small><small v-if="line.product.handling_class === 'installation_required'">{{ line.product.installation_fee ? `${isEnglish ? 'Installation service' : 'خدمة التركيب'} · ${formatPrice(line.product.installation_fee, locale)} ${isEnglish ? 'per unit' : 'للوحدة'}` : (isEnglish ? 'Installation included' : 'التركيب مشمول') }}</small></div><span>{{ formatPrice(checkoutUnitPrice(line) * line.qty, locale) }}</span></div></div><p v-else class="muted">{{ t('emptyCartCheckout') }}</p><hr><div class="sum"><span>{{ t('orderItems') }}</span><strong>{{ formatPrice(checkoutSubtotal, locale) }}</strong></div><div v-if="installationServiceTotal > 0" class="sum"><span>{{ isEnglish ? 'Installation services' : 'خدمات التركيب' }}</span><strong>{{ formatPrice(installationServiceTotal, locale) }}</strong></div><div v-if="couponDiscount > 0" class="sum"><span>{{ isEnglish ? `Coupon ${couponCode}` : `كوبون ${couponCode}` }}</span><strong>−{{ formatPrice(couponDiscount, locale) }}</strong></div><div v-if="cardDiscount > 0" class="sum"><span>{{ isEnglish ? `Card payment discount (${cardDiscountPercent}%)` : `خصم الدفع بالبطاقة (${cardDiscountPercent}٪)` }}</span><strong>−{{ formatPrice(cardDiscount, locale) }}</strong></div><div class="sum"><span>{{ t('shipping') }}</span><strong>{{ shippingReady ? formatPrice(shipping, locale) : t('selectLocationForShipping') }}</strong></div><div class="sum total"><span>{{ t('total') }}</span><strong>{{ shippingReady && pricingReady ? formatPrice(total, locale) : '—' }}</strong></div><label v-if="pricesChanged" class="price-acknowledgement"><input v-model="priceChangeAcknowledged" type="checkbox">{{ isEnglish ? 'I reviewed the updated prices.' : 'راجعت الأسعار المحدثة.' }}</label></aside>
      </div>
    </section>
  </main>
</template>

<script setup lang="ts">
import { ArrowLeft, Banknote, CreditCard } from 'lucide-vue-next'
import { formatPrice } from '~/data/products'
import { getLocalizedFirst, getProductImage, getProductPrice, getVariantOptionLabel } from '~/utils/catalog'
const { locale, isEnglish, t } = useLocale()
const route = useRoute()

const { cart, subtotal, clearCart, toCartPayload } = useShop()
const { request } = useApi()
const { track } = useAnalytics()
const { cities, districts, loadingCities, loadingDistricts, loadError: locationError, fetchCities, fetchDistricts, resolveShippingPrice } = useLocations()
const { cityId: preferredCityId } = useDeliveryLocation()
const form = reactive({ name: '', phone: '', email: '', address: '', city_id: null as number | null, district_id: null as number | null, payment_method: 'cod' as 'cod' | 'card', fulfillment_method: (route.query.fulfillment === 'pickup' ? 'pickup' : 'delivery') as 'delivery' | 'pickup', pickup_location_id: null as number | null })
type PickupBranch = { id: number, name: string, city: string | null, address: string | null }
const branches = ref<PickupBranch[]>([]), branchError = ref(''), pickupStockReady = ref<boolean | null>(null), checkingPickupStock = ref(false)
const sessionId = useCookie<string>('3b-session-id', { default: () => crypto.randomUUID() })
const checkoutIdempotencyKey = useCookie<string>('3b-checkout-idempotency-key', { default: () => crypto.randomUUID() })
const loading = ref(false)
const error = ref('')
const pricingError = ref('')
const pricingReady = ref(false)
const pricingLoading = ref(false)
const pricesChanged = ref(false)
const priceChangeAcknowledged = ref(false)
const checkoutPricing = ref<any>(null)
const installmentPlans = ref<any[]>([])
const installmentPlanId = ref<number | null>(null)
const installmentsLoading = ref(false)
let installmentRequest = 0
const checkoutUnitPrices = ref<Record<string, number>>({})
const couponDiscount = computed(() => Number(checkoutPricing.value?.discount_amount || 0))
const couponCode = computed(() => checkoutPricing.value?.coupon_code || '')
const cardDiscountPercent = computed(() => Number(checkoutPricing.value?.card_payment_discount_percent || 0))
const checkoutSubtotal = computed(() => Number(checkoutPricing.value?.total_price_after_discount ?? subtotal.value))
const selectedCity = computed(() => cities.value.find(city => city.id === form.city_id) || null)
const selectedDistrict = computed(() => districts.value.find(district => district.id === form.district_id) || null)
const selectedPickupBranch = computed(() => branches.value.find(branch => branch.id === form.pickup_location_id) || null)
const shippingReady = computed(() => form.fulfillment_method === 'pickup' ? Boolean(selectedPickupBranch.value) && pickupStockReady.value === true : !locationError.value && !loadingCities.value && !loadingDistricts.value && Boolean(selectedCity.value) && (districts.value.length === 0 || Boolean(selectedDistrict.value)))
const shipping = computed(() => form.fulfillment_method === 'pickup' ? 0 : shippingReady.value ? resolveShippingPrice(selectedCity.value, selectedDistrict.value) : 0)
const hasDigitalItems = computed(() => cart.value.some(line => line.product.handling_class === 'digital'))
const pickupAllowed = computed(() => cart.value.every(line => !['oversized', 'installation_required', 'digital'].includes(line.product.handling_class || 'standard')))
const pickupRestriction = computed(() => !pickupAllowed.value ? (isEnglish.value ? 'Oversized, installation-required, and digital products cannot use branch pickup.' : 'لا يمكن استلام المنتجات كبيرة الحجم أو التي تتطلب تركيباً أو المنتجات الرقمية من الفرع.') : '')
const handlingLabel = (handlingClass: string) => ({ oversized: isEnglish.value ? 'Home delivery required' : 'يتطلب التوصيل للمنزل', fragile: isEnglish.value ? 'Fragile item' : 'منتج قابل للكسر', installation_required: isEnglish.value ? 'Installation required' : 'يتطلب تركيباً', digital: isEnglish.value ? 'Digital delivery unavailable' : 'التسليم الرقمي غير متاح' }[handlingClass] || handlingClass)
const installationServiceTotal = computed(() => cart.value.reduce((sum, line) => sum + (line.product.handling_class === 'installation_required' ? Number(line.product.installation_fee || 0) * line.qty : 0), 0))
const orderBeforeCardDiscount = computed(() => Math.max(0, checkoutSubtotal.value - couponDiscount.value) + installationServiceTotal.value + shipping.value)
const cardDiscount = computed(() => form.payment_method === 'card' ? Math.round((Math.max(0, checkoutSubtotal.value - couponDiscount.value) + installationServiceTotal.value) * cardDiscountPercent.value) / 100 : 0)
const total = computed(() => Math.max(0, orderBeforeCardDiscount.value - cardDiscount.value))
const selectedInstallmentPlan = computed(() => installmentPlans.value.find(plan => plan.id === installmentPlanId.value) || null)
const canSubmit = computed(() => cart.value.length > 0 && !hasDigitalItems.value && shippingReady.value && pricingReady.value && (!pricesChanged.value || priceChangeAcknowledged.value) && !loading.value && !pricingLoading.value && !installmentsLoading.value && !loadingCities.value && !loadingDistricts.value)
const checkoutLineKey = (line: typeof cart.value[number]) => String(line.variant?.id ?? line.product.id)
const checkoutUnitPrice = (line: typeof cart.value[number]) => checkoutUnitPrices.value[checkoutLineKey(line)] ?? getProductPrice(line.product, line.variant)
const locationName = (location: { name_ar: string, name_en: string }) => getLocalizedFirst(locale.value, location.name_ar, location.name_en)
const retryLocations = async () => {
  await fetchCities()
  if (form.city_id) await fetchDistricts(form.city_id)
}
const loadBranches = async () => { branchError.value = ''; try { const response = await request<{ branches: PickupBranch[] }>('/inventory/branches'); branches.value = response.branches ?? [] } catch (e) { branchError.value = e instanceof Error ? e.message : 'Unable to load branches.' } }
const loadInstallments = async () => {
  const requestId = ++installmentRequest
  if (form.payment_method !== 'card' || total.value <= 0) { installmentPlans.value = []; installmentPlanId.value = null; installmentsLoading.value = false; return }
  installmentsLoading.value = true
  try {
    const response = await request<{ plans: any[] }>(`/installments?amount=${encodeURIComponent(total.value.toFixed(2))}`)
    if (requestId !== installmentRequest) return
    installmentPlans.value = response.plans ?? []
    if (installmentPlanId.value && !installmentPlans.value.some(plan => plan.id === installmentPlanId.value)) installmentPlanId.value = null
  } catch {
    if (requestId === installmentRequest) { installmentPlans.value = []; installmentPlanId.value = null }
  } finally { if (requestId === installmentRequest) installmentsLoading.value = false }
}
const syncCheckoutPricing = async () => {
  if (!cart.value.length) { pricingReady.value = true; return true }
  pricingLoading.value = true
  pricingError.value = ''
  try {
    const response = await request<any>('/cart/sync', { method: 'POST', body: { session_id: sessionId.value, ...toCartPayload() } })
    const nextPricing = response.data
    if (checkoutPricing.value && Math.abs(Number(checkoutPricing.value.grand_total || 0) - Number(nextPricing.grand_total || 0)) > 0.01) {
      pricesChanged.value = true
      priceChangeAcknowledged.value = false
    }
    const nextPrices: Record<string, number> = {}
    let changedFromCatalog = false
    for (const item of nextPricing.cart_items || []) {
      const key = String(item.variant?.id ?? item.product_id)
      const appliedPrice = Number(item.unit_price_applied || item.unit_price || 0)
      nextPrices[key] = appliedPrice
      const line = cart.value.find(current => checkoutLineKey(current) === key)
      if (line && Math.abs(appliedPrice - getProductPrice(line.product, line.variant)) > 0.01) changedFromCatalog = true
      if (checkoutUnitPrices.value[key] !== undefined && Math.abs(checkoutUnitPrices.value[key] - appliedPrice) > 0.01) {
        pricesChanged.value = true
        priceChangeAcknowledged.value = false
      }
    }
    if (changedFromCatalog) pricesChanged.value = true
    checkoutUnitPrices.value = nextPrices
    checkoutPricing.value = nextPricing
    pricingReady.value = true
    return true
  } catch (exception: any) {
    pricingError.value = exception?.data?.message || (isEnglish.value ? 'Could not validate current prices.' : 'تعذر التحقق من الأسعار الحالية.')
    pricingReady.value = false
    return false
  } finally { pricingLoading.value = false }
}

watch(() => form.city_id, async cityId => {
  form.district_id = null
  if (cityId) preferredCityId.value = cityId
  await fetchDistricts(cityId)
})

watch(() => form.fulfillment_method, method => { if (method === 'pickup' && !pickupAllowed.value) { form.fulfillment_method = 'delivery'; return } if (method === 'pickup') { form.city_id = null; form.district_id = null } else { form.pickup_location_id = null; pickupStockReady.value = null } })
watch([total, () => form.payment_method], () => { void loadInstallments() })
watch(hasDigitalItems, unsupported => { if (unsupported) form.fulfillment_method = 'delivery' })
watch([() => form.pickup_location_id, () => cart.value.map(line => `${line.variant?.id ?? line.product.id}:${line.qty}`).join(',')], async () => {
  pickupStockReady.value = null
  if (form.fulfillment_method !== 'pickup' || !form.pickup_location_id || cart.value.length === 0) return
  checkingPickupStock.value = true
  try {
    const results = await Promise.all(cart.value.map(async line => {
      if (line.product?.id == null) return false
      const type = line.variant?.id ? 'variant' : 'product', id = line.variant?.id ?? line.product.id
      const response = await request<{ availability: Array<{ location_id: number, available: number }> }>(`/inventory/availability/${type}/${id}`)
      return (response.availability ?? []).some(level => level.location_id === form.pickup_location_id && level.available >= line.qty)
    }))
    pickupStockReady.value = results.every(Boolean)
  } catch { pickupStockReady.value = false }
  finally { checkingPickupStock.value = false }
}, { immediate: true })

onMounted(async () => {
  await Promise.all([fetchCities(), loadBranches(), syncCheckoutPricing()])
  if (form.fulfillment_method === 'delivery' && preferredCityId.value && cities.value.some(city => city.id === Number(preferredCityId.value))) {
    form.city_id = Number(preferredCityId.value)
  }
})

const placeOrder = async () => {
  if (!canSubmit.value) return
  loading.value = true
  error.value = ''
  try {
    const checkoutPayload = { ...form, installment_plan_id: installmentPlanId.value, idempotency_key: checkoutIdempotencyKey.value, ...(form.fulfillment_method === 'pickup' ? { address: selectedPickupBranch.value?.address || selectedPickupBranch.value?.name, phone: form.phone } : {}) }
    if (!await syncCheckoutPricing()) throw new Error(pricingError.value)
    if (pricesChanged.value && !priceChangeAcknowledged.value) {
      error.value = isEnglish.value ? 'Review and acknowledge the updated prices before placing the order.' : 'راجع الأسعار المحدثة وأكد مراجعتها قبل إتمام الطلب.'
      return
    }
    const response = await request<{ order: { id: number, tracking_token: string }, redirect_url?: string }>('/order/checkout', { method: 'POST', body: { ...checkoutPayload, session_id: sessionId.value } })
    clearCart()
    checkoutIdempotencyKey.value = crypto.randomUUID()
    if (response.data.redirect_url) { await navigateTo(response.data.redirect_url, { external: true }); return }
    await navigateTo(`/order-success?tracking=${encodeURIComponent(response.data.order.tracking_token)}`)
  } catch (exception) {
    error.value = exception instanceof Error ? exception.message : t('checkoutFailed')
  } finally { loading.value = false }
}

onMounted(() => {
  if (cart.value.length) void track('begin_checkout', {
    properties: { currency: 'EGP', value: total.value, quantity: cart.value.reduce((count, item) => count + item.qty, 0) },
  })
})
</script>

<style scoped>
.checkout-grid{display:grid;grid-template-columns:1fr 390px;gap:30px;align-items:start}.checkout-form{display:flex;flex-direction:column;gap:18px}.form-title{display:flex;gap:13px;align-items:flex-start;margin-bottom:22px}.form-title>span{width:34px;height:34px;border-radius:50%;display:grid;place-items:center;background:var(--green);color:#fff;font-weight:800}.form-title h2{margin:0;font-size:1.25rem}.form-title p{margin:0;color:var(--muted);font-size:.85rem}.pay-option{display:flex;align-items:center;gap:14px;border:1px solid var(--line);border-radius:13px;padding:15px;margin:10px 0}.pay-option:has(input:checked){border-color:var(--green);background:#f7faf8}.pay-option svg{color:var(--green)}.pay-option small{display:block;color:var(--muted)}.place-order{width:100%;height:56px}.place-order:disabled{opacity:.5}.order-review{background:var(--cream);border-radius:20px;padding:24px;position:sticky;top:120px}.order-review h2{margin-top:0}.review-line{display:grid;grid-template-columns:58px 1fr auto;gap:10px;align-items:center;margin:14px 0}.review-line img{width:58px;height:58px;object-fit:cover;border-radius:10px}.review-line small{display:block;color:var(--muted)}.review-line>span{font-size:.82rem}.order-review hr{border:0;border-top:1px solid var(--line)}.sum{display:flex;justify-content:space-between;margin:10px 0}.sum.total{font-size:1.15rem}.sum.total strong{color:var(--green)}.muted{color:var(--muted)}
.checkout-error{margin:0;color:#b42318}.price-change-notice{padding:10px 12px;border-radius:10px;background:#fff8e7;color:#805800;font-size:.85rem;line-height:1.45}.price-acknowledgement{display:flex;gap:8px;align-items:flex-start;margin-top:12px;color:#805800;font-size:.85rem}.price-acknowledgement input{margin-top:3px;accent-color:var(--green)}.location-error{display:flex;align-items:center;justify-content:space-between;gap:12px;margin:-4px 0 18px;padding:11px 13px;border-radius:11px;background:#fff1f0;color:#b42318;font-size:.85rem}.location-error button{border:0;background:transparent;color:inherit;font-weight:800;text-decoration:underline}.field select:disabled{opacity:.58;cursor:not-allowed}
.fulfillment-options{display:grid;grid-template-columns:1fr 1fr;gap:12px}.fulfillment-options button{min-height:48px;border:1px solid var(--line);border-radius:12px;background:#fff;color:var(--ink);font:inherit;font-weight:700}.fulfillment-options button.selected{border-color:var(--green);background:#f7faf8;color:var(--green)}.fulfillment-options button:disabled{opacity:.48;cursor:not-allowed}.fulfillment-note{margin:10px 0 0;color:var(--muted);font-size:.85rem}.installment-picker{margin-top:14px}.installment-picker label,.installment-picker select{display:block;width:100%}.installment-picker label{margin-bottom:7px;font-weight:700}.installment-picker select{min-height:44px;padding:8px 10px;border:1px solid var(--line);border-radius:10px;background:#fff;color:var(--ink)}.installment-picker small{display:block;margin-top:6px}.review-line small{margin-top:3px}.branch-option{display:flex;align-items:flex-start;gap:12px;border:1px solid var(--line);border-radius:12px;padding:14px;margin:10px 0;cursor:pointer}.branch-option.chosen{border-color:var(--green);background:#f7faf8}.branch-option input{margin-top:4px;accent-color:var(--green)}.branch-option strong,.branch-option small{display:block}.branch-option small{margin-top:4px;color:var(--muted)}.pickup-ready-hint{color:var(--green);font-weight:700}
@media(max-width:850px){.checkout-grid{grid-template-columns:1fr}.order-review{grid-row:1;position:static}}
</style>
