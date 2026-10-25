<template>
  <main class="inventory-page">
    <header><div><p class="eyebrow">3B ADMIN</p><h1>Inventory</h1><p>Track available quantities across branches and warehouses.</p></div><button @click="load">Refresh</button></header>
    <p v-if="error" class="error">{{ error }}</p><p v-if="notice" class="notice">{{ notice }}</p>
    <p v-if="exportState" class="notice" role="status">Inventory export: {{ exportState.status }}<span v-if="exportState.status === 'completed'"> · {{ exportState.rows_count }} rows <button @click="downloadInventory">Download CSV</button></span><span v-else-if="exportState.status === 'failed'"> · {{ exportState.error_message }}</span></p>
    <p v-if="exportError" class="error" role="alert">{{ exportError }}</p>
    <section class="panel"><h2>Add a branch or warehouse</h2><form @submit.prevent="createLocation">
      <input v-model="location.name" required placeholder="Location name"><input v-model="location.code" required placeholder="Code">
      <select v-model="location.type"><option value="warehouse">Warehouse</option><option value="branch">Branch</option></select>
      <input v-model="location.city" placeholder="City"><input v-model="location.address" placeholder="Address"><button :disabled="busy">Add location</button>
    </form></section>
    <section class="panel"><h2>Register product stock</h2><form @submit.prevent="createLevel">
      <select v-model.number="stock.inventory_location_id" required><option disabled :value="0">Choose location</option><option v-for="loc in locations" :key="loc.id" :value="loc.id">{{ loc.name }}</option></select>
      <select v-model="stock.stockable_type"><option value="product">Product</option><option value="variant">Variant</option></select>
      <input v-model.number="stock.stockable_id" type="number" min="1" required placeholder="Product or variant ID"><input v-model.number="stock.on_hand" type="number" min="0" required placeholder="On hand">
      <input v-model.number="stock.low_stock_threshold" type="number" min="0" placeholder="Low stock threshold"><input v-model="stock.reason" required placeholder="Opening stock reason"><button :disabled="busy">Save stock</button>
    </form></section>
    <section class="panel"><h2>Transfer stock</h2><form @submit.prevent="createTransfer">
      <select v-model.number="transfer.from_location_id" required><option disabled :value="0">From location</option><option v-for="loc in locations" :key="loc.id" :value="loc.id">{{ loc.name }}</option></select>
      <select v-model.number="transfer.to_location_id" required><option disabled :value="0">To location</option><option v-for="loc in locations" :key="loc.id" :value="loc.id">{{ loc.name }}</option></select>
      <select v-model="transfer.stockable_type"><option value="product">Product</option><option value="variant">Variant</option></select><input v-model.number="transfer.stockable_id" type="number" min="1" required placeholder="Product or variant ID">
      <input v-model.number="transfer.quantity" type="number" min="1" required placeholder="Quantity"><input v-model="transfer.reason" required placeholder="Transfer reason"><button :disabled="busy">Create pending transfer</button>
    </form><div v-for="item in transfers" :key="item.id" class="transfer"><span>Transfer #{{ item.id }} · {{ item.status }} · {{ item.reason }}</span><div><button v-if="item.status === 'pending'" @click="transition(item, 'dispatched')">Dispatch</button><button v-if="item.status === 'dispatched'" @click="transition(item, 'received')">Mark received</button><button v-if="item.status === 'pending'" @click="transition(item, 'cancelled')">Cancel</button></div></div></section>
    <section class="panel"><h2>Branch pickup orders</h2><p v-if="!pickupOrders.length" class="empty">No active pickup orders.</p><article v-for="order in pickupOrders" :key="order.id" class="transfer"><span><strong>#{{ order.order_number }}</strong> · {{ order.location }} · {{ order.items_count }} items · {{ order.pickup_status.replaceAll('_', ' ') }}</span><div><button v-if="order.pickup_status === 'pending'" @click="updatePickup(order, 'ready_for_pickup')">Mark ready</button><button v-else @click="updatePickup(order, 'collected')">Mark collected</button></div></article></section>
    <section class="panel"><div class="location-head"><h2>Stock by location</h2><div><span class="summary">{{ summary.low_stock }} low stock · {{ summary.out_of_stock }} out of stock</span><button :disabled="exportBusy" @click="exportInventory">{{ exportBusy ? 'Preparing…' : 'Export CSV' }}</button></div></div><div v-if="!locations.length" class="empty">No inventory locations yet.</div>
      <article v-for="loc in locations" :key="loc.id" class="location"><div class="location-head"><strong>{{ loc.name }}</strong><span>{{ loc.type }}</span></div>
        <table v-if="loc.levels?.length"><thead><tr><th>Item</th><th>On hand</th><th>Reserved</th><th>Available</th><th>Adjust</th></tr></thead><tbody>
          <tr v-for="level in loc.levels" :key="level.id"><td>{{ level.stockable_type.split('\\').pop() }} #{{ level.stockable_id }}</td><td>{{ level.on_hand }}</td><td>{{ level.reserved }}</td><td>{{ level.on_hand - level.reserved }}</td><td><form class="adjust" @submit.prevent="adjust(level)"><input v-model.number="adjustments[level.id].delta" type="number" required placeholder="+/-"><input v-model="adjustments[level.id].reason" required placeholder="Reason"><button>Apply</button></form></td></tr>
        </tbody></table><p v-else class="empty">No stock levels at this location.</p>
      </article>
    </section>
  </main>
</template>

<script setup lang="ts">
definePageMeta({ middleware: ['admin'], adminPermission: 'inventory.manage' })
const { request } = useApi()
const { current: exportState, busy: exportBusy, error: exportError, start: startAdminExport, download: downloadAdminExport } = useAdminExport()
const locations = ref<any[]>([]), busy = ref(false), error = ref(''), notice = ref('')
const summary = ref({ low_stock: 0, out_of_stock: 0 })
const location = reactive({ name: '', code: '', type: 'warehouse', city: '', address: '' })
const stock = reactive({ inventory_location_id: 0, stockable_type: 'product', stockable_id: 0, on_hand: 0, low_stock_threshold: 3, reason: '' })
const adjustments = reactive<Record<number, { delta: number | null; reason: string }>>({})
const transfers = ref<any[]>([])
const pickupOrders = ref<any[]>([])
const transfer = reactive({ from_location_id: 0, to_location_id: 0, stockable_type: 'product', stockable_id: 0, quantity: 1, reason: '' })
async function load() { error.value = ''; try { const [result, pickupResult] = await Promise.all([request('/admin/inventory'), request('/admin/inventory/pickup-orders')]); locations.value = result.locations ?? []; transfers.value = result.transfers ?? []; pickupOrders.value = pickupResult.orders ?? []; summary.value = result.summary ?? summary.value; for (const loc of locations.value) for (const level of loc.levels ?? []) adjustments[level.id] ??= { delta: null, reason: '' } } catch (e: any) { error.value = e?.data?.message ?? 'Could not load inventory.' } }
async function createLocation() { busy.value = true; error.value = ''; try { await request('/admin/inventory/locations', { method: 'POST', body: location }); Object.assign(location, { name: '', code: '', city: '', address: '' }); notice.value = 'Location added.'; await load() } catch (e: any) { error.value = e?.data?.message ?? 'Could not add location.' } finally { busy.value = false } }
async function createLevel() { busy.value = true; error.value = ''; try { await request('/admin/inventory/levels', { method: 'POST', body: stock }); notice.value = 'Stock level saved.'; await load() } catch (e: any) { error.value = e?.data?.message ?? 'Could not save stock level.' } finally { busy.value = false } }
async function adjust(level: any) { busy.value = true; error.value = ''; try { await request(`/admin/inventory/levels/${level.id}/adjustments`, { method: 'POST', body: { quantity_delta: adjustments[level.id].delta, reason: adjustments[level.id].reason } }); notice.value = 'Stock adjustment recorded.'; await load() } catch (e: any) { error.value = e?.data?.message ?? 'Could not adjust stock.' } finally { busy.value = false } }
async function createTransfer() { busy.value = true; error.value = ''; try { await request('/admin/inventory/transfers', { method: 'POST', body: { from_location_id: transfer.from_location_id, to_location_id: transfer.to_location_id, reason: transfer.reason, items: [{ stockable_type: transfer.stockable_type, stockable_id: transfer.stockable_id, quantity: transfer.quantity }] } }); notice.value = 'Pending transfer created.'; transfer.reason = ''; await load() } catch (e: any) { error.value = e?.data?.message ?? 'Could not create transfer.' } finally { busy.value = false } }
async function transition(item: any, status: string) { busy.value = true; error.value = ''; try { await request(`/admin/inventory/transfers/${item.id}`, { method: 'PATCH', body: { status } }); notice.value = `Transfer ${status}.`; await load() } catch (e: any) { error.value = e?.data?.message ?? 'Could not update transfer.' } finally { busy.value = false } }
async function updatePickup(order: any, pickup_status: string) { busy.value = true; error.value = ''; try { await request(`/admin/inventory/pickup-orders/${order.id}`, { method: 'PATCH', body: { pickup_status } }); notice.value = pickup_status === 'collected' ? 'Pickup order marked collected.' : 'Customer can now collect the order.'; await load() } catch (e: any) { error.value = e?.data?.message ?? 'Could not update pickup order.' } finally { busy.value = false } }
async function exportInventory() { try { await startAdminExport('/admin/inventory/export', '/admin/inventory/exports') } catch (e: any) { error.value = e?.data?.message ?? 'Could not start the inventory export.' } }
async function downloadInventory() { try { await downloadAdminExport('/admin/inventory/exports') } catch (e: any) { error.value = e?.message ?? 'Could not download the inventory export.' } }
onMounted(load)
</script>

<style scoped>
.inventory-page{max-width:1180px;margin:0 auto;padding:36px 24px;color:#17202a}.inventory-page header{display:flex;align-items:center;justify-content:space-between;margin-bottom:28px}.eyebrow{font-size:12px;letter-spacing:.14em;font-weight:700;color:#2675d8}h1{font-size:32px;margin:4px 0}h2{font-size:18px;margin:0 0 18px}.panel{background:#fff;border:1px solid #e4e8ed;border-radius:14px;padding:22px;margin-bottom:18px;box-shadow:0 4px 16px #1b32400a}.panel form{display:flex;gap:10px;flex-wrap:wrap}.panel input,.panel select{min-height:42px;border:1px solid #ccd4dc;border-radius:8px;padding:0 12px;flex:1;min-width:140px}.panel button,header button{background:#1769c2;color:white;border:0;border-radius:8px;padding:0 16px;min-height:42px;font-weight:650;cursor:pointer}.panel button:disabled{opacity:.6}.location{border-top:1px solid #e8ebef;padding:18px 0}.location-head{display:flex;justify-content:space-between;margin-bottom:12px}.location-head span{color:#64748b;text-transform:capitalize}.empty{color:#64748b;font-size:14px}.location table{width:100%;border-collapse:collapse;font-size:14px}.location th,.location td{text-align:left;padding:10px;border-bottom:1px solid #edf0f2}.adjust{display:flex;gap:6px}.adjust input{min-width:80px;max-width:140px;min-height:34px}.adjust button{min-height:34px}.error{color:#b42318;background:#fff1f0;padding:12px;border-radius:8px}.notice{color:#087443;background:#eaf8f1;padding:12px;border-radius:8px}@media(max-width:700px){.inventory-page{padding:22px 14px}.location{overflow-x:auto}.location table{min-width:720px}.inventory-page header{align-items:flex-start}}
.transfer{border-top:1px solid #e8ebef;padding:12px 0;display:flex;justify-content:space-between;align-items:center;gap:12px}.transfer div{display:flex;gap:6px}.transfer button{min-height:34px}
.location-head>div{display:flex;align-items:center;gap:16px}.location-head a{font-size:14px;color:#1769c2}.summary{font-size:14px;color:#64748b}
</style>
