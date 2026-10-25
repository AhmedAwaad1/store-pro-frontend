<template>
  <main>
    <PageHero :eyebrow="t('accountTitle')" :title="t('myOrders')" :description="t('ordersDescription')" />
    <section class="section"><div class="container account-shell"><AccountNav/><div>
      <div v-if="pending" class="order-state">{{ isEnglish ? 'Loading your orders…' : 'جاري تحميل طلباتك…' }}</div>
      <div v-else-if="!orders.length" class="order-state">{{ isEnglish ? 'No orders yet.' : 'لا توجد طلبات حتى الآن.' }}</div>
      <article v-for="order in orders" :key="order.id" class="order-card"><div class="order-head"><div><small>{{ t('orderNumber') }}</small><strong>#{{ order.order_number }}</strong></div><div><small>{{ t('orderDate') }}</small><strong>{{ formatDate(order.created_at) }}</strong></div><span :class="['status', `status-${order.status}`]">{{ statusLabel(order.status) }}</span></div><div class="order-body"><div class="thumbs"><img v-for="item in order.order_items.slice(0, 3)" :key="item.id" :src="item.product_image || '/images/hero.jpg'" :alt="item.product_name"></div><div><small>{{ t('productsCount', { count: order.order_items.length }) }}</small><strong>{{ formatPrice(Number(order.grand_total), locale) }}</strong></div><NuxtLink :to="`/account/orders/${order.tracking_token}`" class="btn secondary">{{ t('orderDetails') }}</NuxtLink></div></article>
    </div></div></section>
  </main>
</template>

<script setup lang="ts">
import { formatPrice } from '~/data/products'
type OrderItem = { id: number; product_name: string; product_image: string | null }
type CustomerOrder = { id: number; order_number: string; tracking_token: string; created_at: string; grand_total: string; status: string; order_items: OrderItem[] }
const { locale, isEnglish, t } = useLocale()
const { request } = useApi()
const { data, pending } = await useAsyncData('customer-orders', () => request<CustomerOrder[]>('/order'))
const orders = computed(() => data.value?.data || [])
const labels: Record<string, [string, string]> = { pending: ['قيد المراجعة', 'Pending review'], processing: ['جاري التجهيز', 'Preparing'], approved: ['تم اعتماد الطلب', 'Approved'], out_for_delivery: ['خرج للتوصيل', 'Out for delivery'], shipped: ['تم الشحن', 'Shipped'], delivered: ['تم التسليم', 'Delivered'], cancelled: ['تم الإلغاء', 'Cancelled'], returned: ['تم الإرجاع', 'Returned'] }
const statusLabel = (status: string) => (labels[status] || [status, status])[isEnglish.value ? 1 : 0]
const formatDate = (value: string) => new Intl.DateTimeFormat(isEnglish.value ? 'en-EG' : 'ar-EG', { day: 'numeric', month: 'long', year: 'numeric' }).format(new Date(value))
</script>

<style scoped>
.order-state{min-height:220px;display:grid;place-items:center;background:#fff;border:1px solid #ded3c3;border-radius:17px;color:#4c4035;font-weight:700}.order-card{background:#fff;color:#29251f;border:1px solid #ded3c3;border-radius:17px;margin-bottom:14px;overflow:hidden}.order-head{display:grid;grid-template-columns:1fr 1fr auto;gap:20px;padding:16px 20px;background:#faf4eb}.order-head small,.order-head strong{display:block}.order-head small{color:#6d655b;font-size:.75rem}.status{padding:7px 12px;border-radius:999px;align-self:center;font-size:.78rem;font-weight:800}.status-pending,.status-processing,.status-approved{background:#fff0cc;color:#74510c}.status-out_for_delivery,.status-shipped{background:#dfeffc;color:#155c8a}.status-delivered{background:#dff3e6;color:#176347}.status-cancelled,.status-returned{background:#fee6e2;color:#a33d30}.order-body{display:flex;align-items:center;gap:18px;padding:18px}.thumbs{display:flex}.thumbs img{width:58px;height:58px;object-fit:cover;border-radius:10px;border:2px solid #fff;margin-inline-start:-12px;background:#f4ede3}.order-body>div:nth-child(2) strong,.order-body>div:nth-child(2) small{display:block}.order-body>div:nth-child(2) small{color:#6d655b}.order-body>div:nth-child(2) strong{color:#176347}.order-body .btn{margin-inline-start:auto}@media(max-width:600px){.order-head{grid-template-columns:1fr 1fr}.status{grid-column:1/-1;justify-self:start}.order-body{flex-wrap:wrap}.order-body .btn{width:100%;margin:0}}
</style>
