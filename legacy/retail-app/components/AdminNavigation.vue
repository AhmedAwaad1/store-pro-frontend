<template>
  <nav class="admin-navigation" aria-label="Admin sections">
    <div class="container admin-navigation-row">
      <NuxtLink v-for="item in visibleItems" :key="item.to" :to="item.to" :aria-current="isCurrent(item.to) ? 'page' : undefined">{{ item.label }}</NuxtLink>
    </div>
  </nav>
</template>

<script setup lang="ts">
const route = useRoute()
const { user } = useApi()
const items = [
  { to: '/admin/dashboard', label: 'Dashboard', permission: 'reports.view' },
  { to: '/admin/catalog', label: 'Catalog', permission: 'catalog.manage' },
  { to: '/admin/imports', label: 'Catalog imports', permission: 'catalog.import' },
  { to: '/admin/taxonomy', label: 'Categories', permission: 'catalog.manage' },
  { to: '/admin/banners', label: 'Homepage banners', permission: 'merchandising.manage' },
  { to: '/admin/pricing', label: 'Pricing', permission: 'pricing.manage' },
  { to: '/admin/inventory', label: 'Inventory', permission: 'inventory.manage' },
  { to: '/admin/search', label: 'Search', permission: 'merchandising.manage' },
  { to: '/admin/orders', label: 'Orders', permission: 'orders.manage' },
  { to: '/admin/customers', label: 'Customers', permission: 'customers.manage' },
  { to: '/admin/content', label: 'Content', permission: 'content.manage' },
  { to: '/admin/seo', label: 'SEO redirects', permission: 'content.manage' },
  { to: '/admin/analytics', label: 'Analytics', permission: 'reports.view' },
  { to: '/admin/blog', label: 'Blog', permission: 'content.manage' },
  { to: '/admin/settings', label: 'Store settings', superAdminOnly: true },
  { to: '/admin/staff', label: 'Staff roles', superAdminOnly: true },
  { to: '/admin/audit', label: 'Audit history', superAdminOnly: true },
]
const isCurrent = (path: string) => route.path === path
const visibleItems = computed(() => items.filter((item) => {
  if (!user.value || !user.value.type || user.value.type === 'user') return false
  if (item.superAdminOnly) return user.value.type === 'super_admin'
  if (user.value.type === 'super_admin' || user.value.type === 'admin') return true
  return user.value.admin_permissions?.includes('*') || user.value.admin_permissions?.includes(item.permission || '')
}))
</script>

<style scoped>
.admin-navigation{position:sticky;top:154px;z-index:35;background:var(--theme-surface);border-bottom:1px solid var(--line)}.admin-navigation-row{display:flex;align-items:center;gap:8px;overflow:auto;padding-block:8px}.admin-navigation a{flex:none;padding:7px 10px;border-radius:7px;color:var(--theme-text);font-size:.82rem;font-weight:650}.admin-navigation a[aria-current=page]{background:var(--theme-primary);color:var(--theme-on-primary)}
@media(max-width:600px){.admin-navigation{top:96px}}
</style>
