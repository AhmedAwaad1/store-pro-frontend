<template>
  <main class="staff-page">
    <header><div><p class="eyebrow">3B / ADMIN</p><h1>Staff roles</h1><p>Assign each team member only the operational areas they need.</p></div><button class="button secondary" :disabled="loading" @click="load">Refresh</button></header>
    <p v-if="error" class="notice error" role="alert">{{ error }}</p>
    <p v-if="notice" class="notice success" role="status">{{ notice }}</p>

    <section class="panel role-reference">
      <h2>Available roles</h2>
      <div class="role-grid"><article v-for="role in roles" :key="role.key"><strong>{{ label(role.key) }}</strong><small>{{ role.permissions.includes('*') ? 'All administrator permissions' : role.permissions.map(label).join(' · ') }}</small></article></div>
    </section>

    <section class="panel staff-list">
      <div class="section-heading"><div><h2>{{ includeCustomers ? 'Find an existing account' : 'Administrator staff' }}</h2><p>{{ includeCustomers ? 'Search registered customer accounts, then assign an operational role.' : 'Role changes take effect on the next API request.' }}</p></div>
        <button class="button secondary" @click="toggleAccounts">{{ includeCustomers ? 'Show staff' : 'Promote an account' }}</button>
      </div>
      <form class="search" @submit.prevent="load"><label>Search by name, email, or phone<input v-model.trim="search" type="search" placeholder="Search accounts"></label><button class="button primary" :disabled="loading">Search</button></form>
      <p v-if="loading" class="muted">Loading accounts…</p>
      <div v-else class="table-wrap"><table><thead><tr><th>Name</th><th>Email</th><th>Phone</th><th>{{ includeCustomers ? 'Current type' : 'Assigned role' }}</th><th>{{ includeCustomers ? 'Grant access' : 'Change role' }}</th></tr></thead><tbody>
        <tr v-for="member in staff" :key="member.id"><td>{{ member.username }}</td><td>{{ member.email }}</td><td>{{ member.phone || '—' }}</td><td><span class="role-pill">{{ label(member.type) }}</span></td><td><select :value="member.type" :disabled="savingId === member.id || isSelf(member)" :aria-label="`Change role for ${member.username}`" @change="changeRole(member, ($event.target as HTMLSelectElement).value)"><option v-if="member.type === 'admin'" value="admin">Legacy administrator</option><option v-for="role in assignableRoles" :key="role.key" :value="role.key">{{ label(role.key) }}</option><option v-if="!includeCustomers" value="user">Remove admin access</option></select></td></tr>
        <tr v-if="!staff.length"><td colspan="5" class="empty">{{ includeCustomers ? 'No customer account matched this search.' : 'No administrator accounts matched this search.' }}</td></tr>
      </tbody></table></div>
      <div class="pagination"><button class="button secondary" :disabled="loading || page <= 1" @click="changePage(page - 1)">Previous</button><span>Page {{ page }} of {{ totalPages }} · {{ total }} accounts</span><button class="button secondary" :disabled="loading || page >= totalPages" @click="changePage(page + 1)">Next</button></div>
    </section>
  </main>
</template>

<script setup lang="ts">
definePageMeta({ middleware: ['admin'], superAdminOnly: true })

type Role = { key: string; permissions: string[] }
type StaffAccount = { id: number; username: string; email: string; phone: string | null; type: string }
const { request, user } = useApi()
const roles = ref<Role[]>([])
const staff = ref<StaffAccount[]>([])
const search = ref('')
const page = ref(1)
const total = ref(0)
const totalPages = ref(1)
const includeCustomers = ref(false)
const loading = ref(false)
const savingId = ref<number | null>(null)
const error = ref('')
const notice = ref('')
const assignableRoles = computed(() => roles.value.filter(role => !['admin', 'super_admin'].includes(role.key)))

function label(value: string) { return value.replaceAll('_', ' ').replaceAll('.', ' ').replace(/\b\w/g, letter => letter.toUpperCase()) }
function isSelf(member: StaffAccount) { return member.id === user.value?.id }

async function load() {
  loading.value = true
  error.value = ''
  try {
    const [roleResponse, staffResponse] = await Promise.all([
      roles.value.length ? Promise.resolve(null) : request<Role[]>('/admin/staff/roles'),
      request<any>(`/admin/staff?per_page=25&page=${page.value}&include_customers=${includeCustomers.value ? 1 : 0}&search=${encodeURIComponent(search.value)}`),
    ])
    if (roleResponse) roles.value = roleResponse.data || []
    const payload = staffResponse.data
    staff.value = Array.isArray(payload) ? payload : payload?.data || []
    total.value = payload?.total || staff.value.length
    page.value = payload?.current_page || 1
    totalPages.value = payload?.last_page || 1
  } catch (exception: any) {
    error.value = exception?.data?.message || 'Could not load administrator roles.'
  } finally {
    loading.value = false
  }
}

async function changeRole(member: StaffAccount, role: string) {
  if (role === member.type) return
  savingId.value = member.id
  error.value = ''
  notice.value = ''
  try {
    await request(`/admin/staff/${member.id}/role`, { method: 'PATCH', body: { role } })
    notice.value = role === 'user' ? `${member.username} no longer has admin access.` : `${member.username} is now a ${label(role)}.`
    await load()
  } catch (exception: any) {
    error.value = exception?.data?.message || 'Could not update this role.'
    await load()
  } finally {
    savingId.value = null
  }
}

async function toggleAccounts() {
  includeCustomers.value = !includeCustomers.value
  page.value = 1
  await load()
}

async function changePage(nextPage: number) {
  page.value = nextPage
  await load()
}

onMounted(load)
</script>

<style scoped>
.staff-page{max-width:1250px;margin:0 auto;padding:32px 18px 64px;color:var(--theme-text)}header,.section-heading{display:flex;justify-content:space-between;align-items:center;gap:16px}header{margin-bottom:20px}header h1{margin:3px 0;font-size:30px}header p:last-child,.section-heading p{margin:4px 0;color:var(--theme-muted)}.eyebrow{margin:0;color:var(--theme-primary);font-size:11px;font-weight:800;letter-spacing:.13em}.panel{margin-bottom:16px;padding:19px;border:1px solid var(--line);border-radius:14px;background:var(--theme-surface)}h2{margin:0;font-size:19px}.button{min-height:39px;padding:8px 12px;border:1px solid var(--line);border-radius:8px;background:var(--theme-surface);color:var(--theme-text);font:inherit;font-weight:700;cursor:pointer}.button.primary{background:var(--theme-primary);border-color:var(--theme-primary);color:var(--theme-on-primary)}.button:disabled{opacity:.55}.role-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(210px,1fr));gap:9px;margin-top:14px}.role-grid article{padding:12px;border:1px solid var(--line);border-radius:9px}.role-grid strong,.role-grid small{display:block}.role-grid small{margin-top:5px;color:var(--theme-muted);font-size:12px}.section-heading{margin-bottom:15px}.search{display:flex;align-items:end;gap:10px;margin-bottom:14px}.search label{display:grid;flex:1;gap:6px;color:var(--theme-muted);font-size:13px}.search input,.table-wrap select{min-height:39px;padding:7px 9px;border:1px solid var(--line);border-radius:8px;background:var(--theme-surface);color:var(--theme-text);font:inherit}.table-wrap{overflow:auto}table{width:100%;border-collapse:collapse;font-size:13px}th,td{padding:11px 8px;border-bottom:1px solid var(--line);text-align:left;white-space:nowrap}th{color:var(--theme-muted);font-size:11px;text-transform:uppercase}.role-pill{padding:4px 8px;border-radius:99px;background:color-mix(in srgb,var(--theme-primary) 10%,transparent);font-size:12px;font-weight:700}.table-wrap select{min-width:180px}.empty,.muted{color:var(--theme-muted)}.pagination{display:flex;justify-content:space-between;align-items:center;gap:8px;margin-top:14px;color:var(--theme-muted);font-size:12px}.notice{padding:11px 13px;border-radius:9px}.notice.error{background:#fff0ef;color:#a52f28}.notice.success{background:#e5f6ec;color:#087443}@media(max-width:620px){header,.section-heading{align-items:flex-start;flex-direction:column}.search{align-items:stretch;flex-direction:column}.pagination{font-size:11px}.panel{padding:14px}}
</style>
