<template>
  <main>
    <PageHero :eyebrow="isEnglish ? 'One more step' : 'خطوة واحدة كمان'" :title="t('cartTitle')" :description="isEnglish ? 'Review your selected products before checkout.' : 'راجع المنتجات المختارة قبل ما تكمّل الطلب.'" />
    <section class="section"><div class="container">
      <div v-if="cart.length" class="cart-layout">
        <div class="cart-lines">
          <article v-for="line in cart" :key="line.key" class="cart-line">
            <img :src="getProductImage(line.product, line.variant)" :alt="getLocalizedFirst(locale, line.product.name_ar, line.product.name_en, line.product.name)">
            <div class="cart-meta">
              <small>{{ getLocalizedFirst(locale, line.product.category.name_ar, line.product.category.name_en, line.product.category.name) }}</small>
              <NuxtLink :to="`/product/${line.product.id}`"><h3>{{ getLocalizedFirst(locale, line.product.name_ar, line.product.name_en, line.product.name) }}</h3></NuxtLink>
              <span v-if="line.variant" class="variant-title">{{ getVariantOptionLabel(line.variant, locale) }} · {{ line.variant.sku }}</span>
              <div class="item-price"><strong>{{ formatPrice(lineUnitPrice(line), locale) }}</strong><del v-if="lineBasePrice(line) > lineUnitPrice(line)">{{ formatPrice(lineBasePrice(line), locale) }}</del></div>
              <small v-if="promotionFor(line)" class="campaign-label">{{ locale === 'ar' ? promotionFor(line)?.badge_ar || promotionFor(line)?.name : promotionFor(line)?.badge_en || promotionFor(line)?.name }}</small>
            </div>
            <div class="qty"><button :aria-label="isEnglish ? 'Decrease quantity' : 'تقليل الكمية'" @click="updateQty(line.key, -1)">−</button><span>{{ line.qty }}</span><button :disabled="line.qty >= getProductStock(line.product, line.variant)" :aria-label="isEnglish ? 'Increase quantity' : 'زيادة الكمية'" @click="updateQty(line.key, 1)">+</button></div>
            <strong class="line-total">{{ formatPrice(lineUnitPrice(line) * line.qty, locale) }}</strong>
            <button class="remove" :aria-label="t('remove')" @click="removeFromCart(line.key)"><Trash2 /></button>
          </article>
        </div>
        <aside class="summary">
          <h2>{{ t('orderSummary') }}</h2>
          <p v-if="pricingChanged" class="price-change">{{ isEnglish ? 'A promotion or price changed. The current server price is shown below.' : 'تغير سعر أو عرض. السعر الحالي من النظام ظاهر أدناه.' }}</p>
          <div><span>{{ t('subtotal') }}</span><strong>{{ formatPrice(displaySubtotal, locale) }}</strong></div>
          <div><span>{{ t('shipping') }}</span><strong>{{ t('calculatedAtCheckout') }}</strong></div>
          <form class="coupon" @submit.prevent="applyCoupon">
            <input v-model.trim="couponCode" :placeholder="t('couponCode')" :aria-label="t('couponCode')" :disabled="couponBusy">
            <button :disabled="couponBusy || !couponCode">{{ couponBusy ? (isEnglish ? 'Checking…' : 'جارٍ التحقق…') : t('apply') }}</button>
          </form>
          <p v-if="couponError" class="coupon-message error">{{ couponError }}</p>
          <p v-if="couponNotice" class="coupon-message">{{ couponNotice }}</p>
          <div v-if="appliedCoupon" class="coupon-applied"><span>{{ isEnglish ? `Coupon ${appliedCoupon}` : `كوبون ${appliedCoupon}` }}</span><button type="button" @click="removeCoupon">{{ isEnglish ? 'Remove' : 'إزالة' }}</button></div>
          <hr>
          <div v-if="couponDiscount > 0"><span>{{ isEnglish ? 'Coupon discount' : 'خصم الكوبون' }}</span><strong>−{{ formatPrice(couponDiscount, locale) }}</strong></div>
          <div class="grand"><span>{{ t('total') }}</span><strong>{{ formatPrice(totalAfterCoupon, locale) }}</strong></div>
          <NuxtLink to="/checkout" class="btn primary full">{{ t('continueOrder') }} <ArrowLeft /></NuxtLink>
          <NuxtLink to="/products" class="continue">{{ t('continueShopping') }}</NuxtLink>
        </aside>
      </div>
      <EmptyState v-else :title="t('emptyCart')" :text="t('emptyCartText')" :action="t('viewProducts')" action-to="/products" />
    </div></section>
  </main>
</template>

<script setup lang="ts">
import { ArrowLeft, Trash2 } from 'lucide-vue-next'
import { formatPrice } from '~/data/products'
import { getLocalizedFirst, getProductImage, getProductOriginalPrice, getProductPrice, getProductStock, getVariantOptionLabel } from '~/utils/catalog'

const { locale, isEnglish, t } = useLocale()
const { cart, subtotal, updateQty, removeFromCart, toCartPayload } = useShop()
const { request } = useApi()
const sessionId = useCookie<string>('3b-session-id', { default: () => crypto.randomUUID() })
const couponCode = ref('')
const appliedCoupon = ref('')
const couponDiscount = ref(0)
const couponBusy = ref(false)
const couponError = ref('')
const couponNotice = ref('')
const serverPricing = ref<any>(null)
const serverUnitPrices = ref<Record<string, { applied: number, base: number, promotion: { name: string, badge_en?: string | null, badge_ar?: string | null } | null }>>({})
const pricingChanged = ref(false)
const displaySubtotal = computed(() => Number(serverPricing.value?.total_price_after_discount ?? subtotal.value))
const totalAfterCoupon = computed(() => Number(serverPricing.value?.grand_total ?? Math.max(0, displaySubtotal.value - couponDiscount.value)))

const promotionFor = (line: typeof cart.value[number]) => linePricing(line)?.promotion || line.variant?.promotion || line.product.promotion || null
const linePricing = (line: typeof cart.value[number]) => serverUnitPrices.value[String(line.variant?.id ?? line.product.id)]
const lineUnitPrice = (line: typeof cart.value[number]) => linePricing(line)?.applied ?? getProductPrice(line.product, line.variant)
const lineBasePrice = (line: typeof cart.value[number]) => linePricing(line)?.base ?? getProductOriginalPrice(line.product, line.variant)

watch(subtotal, () => {
  if (!appliedCoupon.value) return
  appliedCoupon.value = ''
  couponDiscount.value = 0
  couponNotice.value = isEnglish.value ? 'Your cart changed. Apply the coupon again to refresh the discount.' : 'تغيرت السلة. أعد تطبيق الكوبون لتحديث الخصم.'
})

async function syncCart() {
  const response = await request<{ total_price_after_discount: string, grand_total: string, discount_amount: string, coupon_code: string | null, cart_items: Array<any> }>('/cart/sync', {
    method: 'POST', body: { session_id: sessionId.value, ...toCartPayload() },
  })
  serverPricing.value = response.data
  couponDiscount.value = Number(response.data.discount_amount || 0)
  appliedCoupon.value = response.data.coupon_code || ''
  if (appliedCoupon.value) couponCode.value = appliedCoupon.value
  const nextPrices: Record<string, { applied: number, base: number, promotion: { name: string, badge_en?: string | null, badge_ar?: string | null } | null }> = {}
  for (const item of response.data.cart_items || []) {
    const key = String(item.variant?.id ?? item.product_id)
    const applied = Number(item.unit_price_applied || item.unit_price || 0)
    const base = Number(item.unit_price || applied)
    nextPrices[key] = { applied, base, promotion: item.promotion }
    const localLine = cart.value.find(line => String(line.variant?.id ?? line.product.id) === key)
    if (localLine && Math.abs(applied - getProductPrice(localLine.product, localLine.variant)) > 0.01) pricingChanged.value = true
  }
  serverUnitPrices.value = nextPrices
}

async function applyCoupon() {
  if (!couponCode.value || couponBusy.value) return
  couponBusy.value = true
  couponError.value = ''
  couponNotice.value = ''
  try {
    await syncCart()
    const response = await request<{ discount_amount: string, coupon_code: string | null }>('/cart/apply-coupon', {
      method: 'POST', body: { session_id: sessionId.value, coupon_code: couponCode.value },
    })
    serverPricing.value = response.data
    appliedCoupon.value = response.data.coupon_code || couponCode.value
    couponCode.value = appliedCoupon.value
    couponDiscount.value = Number(response.data.discount_amount || 0)
    couponNotice.value = response.message || (isEnglish.value ? 'Coupon applied.' : 'تم تطبيق الكوبون.')
  } catch (error: any) {
    couponError.value = error?.data?.message || (isEnglish.value ? 'This coupon could not be applied.' : 'تعذر تطبيق هذا الكوبون.')
    appliedCoupon.value = ''
    couponDiscount.value = 0
  } finally {
    couponBusy.value = false
  }
}

let cartSyncTimeout: ReturnType<typeof setTimeout> | undefined
watch(() => cart.value.map(line => `${line.variant?.id ?? line.product.id}:${line.qty}`).join('|'), () => {
  if (!import.meta.client || !cart.value.length) return
  if (cartSyncTimeout) clearTimeout(cartSyncTimeout)
  cartSyncTimeout = setTimeout(() => { void syncCart().catch(() => {}) }, 400)
})
onMounted(() => { if (cart.value.length) void syncCart().catch(() => {}) })

async function removeCoupon() {
  couponBusy.value = true
  couponError.value = ''
  try {
    const response = await request<any>('/cart/remove-coupon', { method: 'POST', body: { session_id: sessionId.value } })
    serverPricing.value = response.data
    appliedCoupon.value = ''
    couponDiscount.value = 0
    couponNotice.value = isEnglish.value ? 'Coupon removed.' : 'تمت إزالة الكوبون.'
  } catch (error: any) {
    couponError.value = error?.data?.message || (isEnglish.value ? 'Could not remove the coupon.' : 'تعذرت إزالة الكوبون.')
  } finally {
    couponBusy.value = false
  }
}
</script>

<style scoped>
.cart-layout{display:grid;grid-template-columns:1fr 360px;gap:30px;align-items:start}.cart-lines{border:1px solid var(--line);border-radius:18px;overflow:hidden}.cart-line{display:grid;grid-template-columns:120px 1fr auto auto auto;gap:18px;align-items:center;padding:18px;border-bottom:1px solid var(--line)}.cart-line:last-child{border:0}.cart-line img{width:120px;height:110px;object-fit:cover;border-radius:13px}.cart-meta small{color:var(--muted)}.cart-meta h3{margin:0}.item-price{display:flex;align-items:center;gap:8px}.item-price del{color:var(--muted);font-size:.88rem}.campaign-label{display:block;color:var(--green);font-weight:700}.variant-title{display:block;font-size:.76rem;color:var(--muted);margin:2px 0 4px}.qty{height:42px;border:1px solid var(--line);border-radius:12px;display:flex;align-items:center}.qty button{border:0;background:none;width:34px}.qty button:disabled{opacity:.3}.qty span{width:24px;text-align:center}.remove{border:0;background:none;color:#9a5c50}.summary{background:var(--cream);border-radius:18px;padding:24px;position:sticky;top:120px}.summary h2{margin-top:0}.summary>div{display:flex;justify-content:space-between;gap:8px;margin:13px 0}.summary .coupon{display:flex;margin:18px 0 8px}.coupon input{min-width:0;flex:1;border:1px solid var(--line);border-radius:10px 0 0 10px;padding:10px}.coupon button{border:0;background:var(--green);color:#fff;border-radius:0 10px 10px 0;padding:0 12px}.coupon button:disabled{opacity:.55}.coupon-message{margin:6px 0;color:var(--green);font-size:.83rem}.coupon-message.error{color:#b42318}.price-change{padding:10px;border-radius:9px;background:#fff8e7;color:#805800;font-size:.84rem}.summary .coupon-applied{display:flex;align-items:center;color:var(--green);font-size:.84rem}.coupon-applied button{border:0;background:none;color:inherit;text-decoration:underline}.summary hr{border:0;border-top:1px solid var(--line)}.summary .grand strong{font-size:1.35rem;color:var(--green)}.full{width:100%}.continue{display:block;text-align:center;margin-top:13px;color:var(--green);font-weight:700}
@media(max-width:850px){.cart-layout{grid-template-columns:1fr}.summary{position:static}}@media(max-width:600px){.cart-line{grid-template-columns:82px 1fr auto;gap:10px}.cart-line img{width:82px;height:88px}.qty{grid-column:2}.line-total{display:none}.remove{grid-column:3;grid-row:1}}
</style>
