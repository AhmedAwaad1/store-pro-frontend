export default defineNuxtRouteMiddleware(async (to) => {
  if (import.meta.server || to.path === '/admin/login') return

  const { user, fetchCurrentUser, hasPermission } = useApi()

  if (!user.value) {
    try {
      await fetchCurrentUser()
    } catch {
      return navigateTo('/admin/login')
    }
  }

  if (!user.value || user.value.type === 'user') return navigateTo('/admin/login')

  const permission = String(to.meta.adminPermission || '')
  if (permission && !hasPermission(permission)) return navigateTo('/admin')
})
