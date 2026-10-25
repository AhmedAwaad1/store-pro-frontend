<template>
  <main>
    <section class="success section">
      <div class="container">
        <div class="success-icon"><Check /></div>
        <span class="eyebrow">{{ t('orderPlaced') }}</span>
        <h1>{{ isPickup ? (order?.fulfillment?.pickup_status === 'ready_for_pickup' ? pickupReadyLabel : pickupPendingLabel) : t('orderOnWay') }}</h1>
        <p v-if="order">{{ t('orderNumber') }} <strong>#{{ order.order_number }}</strong>. {{ t('orderDetailsSent') }}</p>
        <p v-else>{{ t('orderDetailsSent') }}</p>
        <p v-if="isPickup && order?.fulfillment?.branch" class="pickup-message">{{ pickupStatusMessage }}<strong>{{ order.fulfillment.branch.name }}</strong><span>{{ order.fulfillment.branch.address }}</span></p>
        <div class="success-card">
          <div><span>{{ isPickup ? pickupLocationLabel : t('deliveryEstimate') }}</span><strong>{{ isPickup ? order?.fulfillment?.branch?.name : t('deliveryDays') }}</strong></div>
          <div><span>{{ t('payment') }}</span><strong>{{ paymentLabel }}</strong></div>
        </div>
        <div class="success-actions">
          <NuxtLink v-if="order && trackingToken" :to="`/account/orders/${trackingToken}`" class="btn primary">{{ t('trackYourOrder') }}</NuxtLink>
          <NuxtLink to="/products" class="btn secondary">{{ t('continueShopping') }}</NuxtLink>
        </div>
      </div>
    </section>
  </main>
</template>

<script setup lang="ts">
import { Check } from 'lucide-vue-next'

type OrderConfirmation = { id: number; order_number: string; payment_method: 'cod' | 'card'; payment_status?: string; grand_total?: string; fulfillment?: { method: string; pickup_status: string | null; message: string | null; branch?: { name: string; city: string | null; address: string | null } | null } }
const { t, isEnglish } = useLocale()
const route = useRoute()
const { request } = useApi()
const trackingToken = computed(() => String(route.query.tracking || ''))
const { data } = await useAsyncData(
  `order-success-${trackingToken.value}`,
  async () => trackingToken.value
    ? request<OrderConfirmation>(`/order/track/${encodeURIComponent(trackingToken.value)}`)
    : null,
  { watch: [trackingToken] },
)
const order = computed(() => data.value?.data || null)
const { track } = useAnalytics()
watch(order, (value) => {
  if (!value?.id || (value.payment_method === 'card' && value.payment_status !== 'paid')) return
  void track('purchase', { order_id: value.id, properties: { currency: 'EGP', value: Number(value.grand_total || 0) } })
}, { immediate: true })
const paymentLabel = computed(() => order.value?.payment_method === 'card'
  ? (isEnglish.value ? 'Bank card' : 'بطاقة بنكية')
  : order.value ? t('cod') : '—')
const isPickup = computed(() => order.value?.fulfillment?.method === 'pickup')
const pickupReadyLabel = computed(() => isEnglish.value ? 'Your order is ready for pickup' : 'طلبك جاهز للاستلام')
const pickupPendingLabel = computed(() => isEnglish.value ? 'Your pickup order is being prepared' : 'يجري تجهيز طلبك للاستلام')
const pickupLocationLabel = computed(() => isEnglish.value ? 'Pickup branch' : 'فرع الاستلام')
const pickupStatusMessage = computed(() => isEnglish.value
  ? (order.value?.fulfillment?.pickup_status === 'ready_for_pickup' ? 'Ready at ' : 'We will notify you when your order is ready at ')
  : (order.value?.fulfillment?.pickup_status === 'ready_for_pickup' ? 'طلبك جاهز في ' : 'سنخبرك عندما يصبح طلبك جاهزاً في '))
</script>

<style scoped>
.success{text-align:center;padding-top:90px}.success>.container{max-width:650px}.success-icon{width:90px;height:90px;border-radius:50%;display:grid;place-items:center;background:#e4f0e8;color:var(--green);margin:0 auto 20px}.success-icon svg{width:45px;height:45px}.success h1{font-size:2.5rem;margin:8px 0}.success>div>p{color:var(--muted)}.success-card{display:grid;grid-template-columns:1fr 1fr;text-align:start;background:var(--cream);border-radius:18px;padding:20px;margin:30px 0}.success-card div{padding:5px 18px}.success-card div+div{border-inline-start:1px solid var(--line)}.success-card span,.success-card strong{display:block}.success-card span{color:var(--muted);font-size:.82rem}.success-actions{display:flex;justify-content:center;gap:10px}@media(max-width:550px){.success h1{font-size:2rem}.success-card{grid-template-columns:1fr;gap:15px}.success-card div+div{border:0}.success-actions{flex-direction:column}}
.pickup-message{display:grid;gap:5px;background:#f4f8f5;border-radius:12px;padding:15px}.pickup-message strong{color:var(--green)}.pickup-message span{color:var(--muted)}
</style>
