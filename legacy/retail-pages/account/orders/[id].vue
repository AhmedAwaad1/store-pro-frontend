<template>
  <main>
    <PageHero :eyebrow="t('orderDetails')" :title="order ? `${t('orderNumber')} #${order.order_number}` : t('orderDetails')" :description="t('orderDetailsDescription')" />
    <section class="section"><div class="container account-shell"><AccountNav /><div>
      <div v-if="pending" class="order-state">{{ isEnglish ? 'Loading order details…' : 'جاري تحميل تفاصيل الطلب…' }}</div>
      <div v-else-if="!order" class="order-state error-state">{{ isEnglish ? 'This order is unavailable.' : 'الطلب غير متاح.' }}</div>
      <template v-else>
        <section class="tracking-card" :class="`status-${order.status}`">
          <div class="tracking-head"><div><span class="status-badge">{{ statusLabel(order.status) }}</span><h2>{{ statusHeadline(order.status) }}</h2><p>{{ trackingDescription }}</p></div><component :is="statusIcon" /></div>
          <div v-if="isTerminalStatus" class="terminal-status"><component :is="statusIcon" /><span>{{ statusLabel(order.status) }}</span></div>
          <div v-else class="steps"><div v-for="step in trackingSteps" :key="step.key" class="step" :class="{ done: trackingStep >= step.index, active: trackingStep === step.index }"><span><component :is="step.icon" /></span><b>{{ step.label }}</b><small>{{ step.detail }}</small></div></div>
        </section>
        <div class="order-details-grid">
          <section class="form-card order-card"><h2>{{ t('orderItems') }}</h2><div v-for="item in order.order_items" :key="item.id" class="detail-line"><img :src="item.product_image || '/images/hero.jpg'" :alt="item.product_name"><div><strong>{{ item.product_name }}</strong><small v-if="item.sku">{{ item.sku }}</small><small>{{ t('quantity', { count: item.quantity }) }}</small></div><span>{{ formatPrice(number(item.total_price), locale) }}</span></div><hr><div class="sum-line"><span>{{ t('orderItems') }}</span><strong>{{ formatPrice(number(order.subtotal), locale) }}</strong></div><div class="sum-line"><span>{{ t('shipping') }}</span><strong>{{ formatPrice(number(order.shipping_price), locale) }}</strong></div><div v-if="number(order.discount_amount)" class="sum-line discount"><span>{{ isEnglish ? 'Discount' : 'الخصم' }}</span><strong>−{{ formatPrice(number(order.discount_amount), locale) }}</strong></div><div class="total-line"><span>{{ t('total') }}</span><strong>{{ formatPrice(number(order.grand_total), locale) }}</strong></div></section>
          <section class="form-card info-card"><h2>{{ order.fulfillment?.method === 'pickup' ? pickupHeading : t('deliveryData') }}</h2><div v-if="order.fulfillment?.method === 'pickup'" class="pickup-state"><PackageCheck /><p><strong>{{ pickupStatusLabel }}</strong><br>{{ pickupBranchText }}<small v-if="order.fulfillment.pickup_ready_at">{{ isEnglish ? 'Ready since ' : 'جاهز منذ ' }}{{ formatDate(order.fulfillment.pickup_ready_at) }}</small></p></div><div v-else><MapPin /><p><strong>{{ t('homeAddress') }}</strong><br>{{ addressText }}</p></div><div><Phone /><p><strong>{{ t('mobileNumber') }}</strong><br>{{ order.address?.phone || '—' }}</p></div><div><Banknote /><p><strong>{{ t('payment') }}</strong><br>{{ paymentLabel }}</p></div><div v-if="order.tracking_number || order.shipment?.tracking_number"><PackageCheck /><p><strong>{{ isEnglish ? 'Tracking number' : 'رقم التتبع' }}</strong><br>{{ order.shipment?.tracking_number || order.tracking_number }}</p></div></section>
        </div>
      </template>
    </div></div></section>
  </main>
</template>

<script setup lang="ts">
import { Banknote, Check, CircleX, Home, MapPin, PackageCheck, PackageOpen, Phone, Truck } from 'lucide-vue-next'
import { formatPrice } from '~/data/products'
type OrderItem = { id: number; product_name: string; sku: string | null; product_image: string | null; unit_price: string; total_price: string; quantity: number }
type OrderAddress = { address: string; phone: string; city?: { name?: string; name_ar?: string; name_en?: string } | null; district?: { name?: string; name_ar?: string; name_en?: string } | null }
type CustomerOrder = { id: number; order_number: string; subtotal: string; discount_amount: string; shipping_price: string; grand_total: string; payment_method: 'cod' | 'card'; status: string; tracking_number: string | null; created_at: string; address: OrderAddress | null; order_items: OrderItem[]; shipment?: { tracking_number?: string | null } | null; fulfillment?: { method: string; pickup_status: string | null; pickup_ready_at: string | null; branch?: { name: string; address: string | null } | null } }
type OrderSummary = { order_number: string; tracking_token: string }
const route = useRoute()
const { locale, isEnglish, t } = useLocale()
const { request } = useApi()
const identifier = computed(() => String(route.params.id))
const loadOrder = async () => {
  try {
    return await request<CustomerOrder>(`/order/${encodeURIComponent(identifier.value)}`)
  } catch (originalError) {
    if (/^[A-Za-z0-9]{40}$/.test(identifier.value)) {
      return await request<CustomerOrder>(`/order/track/${encodeURIComponent(identifier.value)}`)
    }

    const ordersResponse = await request<OrderSummary[]>('/order')
    const matchedOrder = ordersResponse.data?.find(order =>
      order.tracking_token === identifier.value || order.order_number === identifier.value,
    )

    if (!matchedOrder) throw originalError
    if (matchedOrder.tracking_token !== identifier.value) {
      await navigateTo(`/account/orders/${matchedOrder.tracking_token}`, { replace: true })
    }

    return await request<CustomerOrder>(`/order/${encodeURIComponent(matchedOrder.tracking_token)}`)
  }
}
const { data, pending, refresh } = await useAsyncData(`customer-order-${identifier.value}`, loadOrder, { watch: [identifier] })
const order = computed(() => data.value?.data || null)
const number = (value: string | number | null | undefined) => Number(value || 0)
const labels: Record<string, [string, string]> = { pending: ['قيد المراجعة', 'Pending review'], processing: ['جاري التجهيز', 'Preparing your order'], approved: ['تم اعتماد الطلب', 'Order approved'], out_for_delivery: ['خرج للتوصيل', 'Out for delivery'], shipped: ['تم الشحن', 'Shipped'], delivered: ['تم التسليم', 'Delivered'], cancelled: ['تم الإلغاء', 'Cancelled'], returned: ['تم الإرجاع', 'Returned'] }
const statusLabel = (status: string) => (labels[status] || [status, status])[isEnglish.value ? 1 : 0]
const statusHeadline = (status: string) => ({ pending: isEnglish.value ? 'We are reviewing your order' : 'بنراجع طلبك دلوقتي', processing: isEnglish.value ? 'Your order is being prepared' : 'طلبك بيتجهز دلوقتي', approved: isEnglish.value ? 'Your order is approved' : 'تم اعتماد طلبك', out_for_delivery: isEnglish.value ? 'Your order is on its way' : 'طلبك في الطريق', shipped: isEnglish.value ? 'Your order has shipped' : 'تم شحن طلبك', delivered: isEnglish.value ? 'Your order has arrived' : 'تم تسليم طلبك', cancelled: isEnglish.value ? 'This order was cancelled' : 'تم إلغاء الطلب', returned: isEnglish.value ? 'This order was returned' : 'تم إرجاع الطلب' }[status] || statusLabel(status))
const trackingStep = computed(() => ({ pending: 0, processing: 1, approved: 1, out_for_delivery: 2, shipped: 2, delivered: 3 }[order.value?.status || 'pending'] ?? 0))
const isTerminalStatus = computed(() => ['cancelled', 'returned'].includes(order.value?.status || ''))
const statusIcon = computed(() => order.value?.status === 'delivered' ? Check : isTerminalStatus.value ? CircleX : order.value?.status === 'out_for_delivery' || order.value?.status === 'shipped' ? Truck : PackageCheck)
const formatDate = (value: string) => new Intl.DateTimeFormat(isEnglish.value ? 'en-EG' : 'ar-EG', { day: 'numeric', month: 'long', year: 'numeric' }).format(new Date(value))
const trackingDescription = computed(() => order.value ? (isEnglish.value ? `Order placed ${formatDate(order.value.created_at)}.` : `تم إنشاء الطلب ${formatDate(order.value.created_at)}.`) : '')
const trackingSteps = computed(() => [{ key: 'placed', index: 0, icon: Check, label: isEnglish.value ? 'Order placed' : 'تم الطلب', detail: order.value ? formatDate(order.value.created_at) : '' }, { key: 'preparing', index: 1, icon: PackageOpen, label: isEnglish.value ? 'Preparing' : 'جاري التجهيز', detail: trackingStep.value >= 1 ? (isEnglish.value ? 'In progress' : 'قيد التنفيذ') : (isEnglish.value ? 'Waiting' : 'في الانتظار') }, { key: 'shipping', index: 2, icon: Truck, label: isEnglish.value ? 'On the way' : 'خرج للشحن', detail: trackingStep.value >= 2 ? (isEnglish.value ? 'In transit' : 'في الطريق') : (isEnglish.value ? 'Waiting' : 'في الانتظار') }, { key: 'delivered', index: 3, icon: Home, label: isEnglish.value ? 'Delivered' : 'تم التوصيل', detail: trackingStep.value >= 3 ? (isEnglish.value ? 'Completed' : 'اكتمل') : (isEnglish.value ? 'Waiting' : 'في الانتظار') }])
const addressText = computed(() => { const address = order.value?.address; if (!address) return '—'; const name = (place?: { name?: string; name_ar?: string; name_en?: string } | null) => isEnglish.value ? (place?.name_en || place?.name) : (place?.name_ar || place?.name); return [address.address, name(address.district), name(address.city)].filter(Boolean).join('، ') })
const paymentLabel = computed(() => order.value?.payment_method === 'card' ? (isEnglish.value ? 'Bank card' : 'بطاقة بنكية') : t('cod'))
const pickupHeading = computed(() => isEnglish.value ? 'Branch pickup' : 'الاستلام من الفرع')
const pickupStatusLabel = computed(() => order.value?.fulfillment?.pickup_status === 'ready_for_pickup' ? (isEnglish.value ? 'Ready for pickup' : 'جاهز للاستلام') : order.value?.fulfillment?.pickup_status === 'collected' ? (isEnglish.value ? 'Collected' : 'تم الاستلام') : (isEnglish.value ? 'Being prepared' : 'قيد التجهيز'))
const pickupBranchText = computed(() => [order.value?.fulfillment?.branch?.name, order.value?.fulfillment?.branch?.address].filter(Boolean).join(' · '))
let timer: number | undefined
onMounted(() => { timer = window.setInterval(refresh, 30000) })
onBeforeUnmount(() => { if (timer) window.clearInterval(timer) })
</script>

<style scoped>
.order-state{min-height:240px;display:grid;place-items:center;background:#fff;border:1px solid #ded3c3;border-radius:18px;color:#4c4035;font-weight:700}.error-state{color:#a0382a;background:#fff7f4}.tracking-card{background:#173d34;color:#fff;border-radius:22px;padding:clamp(22px,3vw,34px);box-shadow:0 12px 28px rgba(20,55,45,.16)}.tracking-card.status-delivered{background:#176347}.tracking-card.status-cancelled,.tracking-card.status-returned{background:#723d35}.tracking-head{display:flex;justify-content:space-between;align-items:flex-start;gap:20px}.tracking-head h2{margin:13px 0 6px;color:#fff}.tracking-head p{margin:0;color:#d8ebe4}.tracking-head>svg{width:48px;height:48px;color:#f7ca55}.status-badge{display:inline-flex;padding:7px 12px;border-radius:999px;background:#fff;color:#173d34;font-size:.78rem;font-weight:800}.steps{display:grid;grid-template-columns:repeat(4,1fr);margin-top:32px;position:relative}.steps:before{content:'';position:absolute;top:19px;right:8%;left:8%;height:2px;background:#75a797}.step{position:relative;text-align:center;color:#c2d8d1}.step>span{width:40px;height:40px;border-radius:50%;background:#2b6456;display:grid;place-items:center;margin:0 auto 8px;position:relative;z-index:2;border:2px solid #173d34}.step svg{width:18px}.step b,.step small{display:block}.step b{font-size:.83rem}.step small{font-size:.72rem;margin-top:3px}.step.done{color:#fff}.step.done>span{background:#f7ca55;color:#173d34}.step.active>span{box-shadow:0 0 0 5px rgba(247,202,85,.25)}.terminal-status{display:flex;align-items:center;gap:10px;margin-top:24px;font-weight:800}.terminal-status svg{width:22px}.order-details-grid{display:grid;grid-template-columns:1.2fr .8fr;gap:18px;margin-top:18px}.form-card{background:#fff;color:#252a27;border:1px solid #ded3c3;box-shadow:0 7px 18px rgba(80,60,38,.06)}.form-card h2{margin-top:0;color:#252a27}.detail-line{display:grid;grid-template-columns:62px 1fr auto;align-items:center;gap:12px;margin:14px 0}.detail-line img{width:62px;height:62px;object-fit:cover;border-radius:10px;background:#f4ede3}.detail-line small{display:block;color:#706b64}.detail-line>span{font-weight:800;color:#2f473e}.form-card hr{border:0;border-top:1px solid #e4dbcf}.sum-line,.total-line{display:flex;justify-content:space-between;margin:10px 0;color:#5f5a53}.discount strong{color:#208059}.total-line{padding-top:12px;border-top:1px solid #e4dbcf;margin-top:16px;color:#252a27;font-size:1.12rem}.total-line strong{color:#176347}.info-card>div{display:flex;gap:11px;align-items:flex-start}.info-card svg{color:#176347;width:20px;margin-top:5px;flex:none}.info-card p{margin:0 0 16px;color:#5f5a53}.info-card strong{color:#252a27}@media(max-width:700px){.steps{grid-template-columns:1fr 1fr;gap:20px}.steps:before{display:none}.order-details-grid{grid-template-columns:1fr}.tracking-head>svg{display:none}.detail-line{grid-template-columns:52px 1fr}.detail-line>span{grid-column:2}.detail-line img{width:52px;height:52px}}
</style>
