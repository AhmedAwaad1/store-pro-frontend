export default defineNuxtRouteMiddleware(async (to) => {
  const { token, user, fetchCurrentUser } = useApi()

  if (!token.value) return navigateTo('/login')

  let currentUser = user.value
  if (!currentUser?.type || !currentUser.admin_permissions) {
    currentUser = await fetchCurrentUser()
  }

  if (!currentUser || !currentUser.type || currentUser.type === 'user') return navigateTo('/')

  const requiredPermission = String(to.meta.adminPermission || '')
  const permissions = currentUser.admin_permissions || []
  const hasPermission = currentUser.type === 'super_admin'
    || currentUser.type === 'admin'
    || permissions.includes('*')
    || permissions.includes(requiredPermission)
  const superAdminOnly = to.meta.superAdminOnly === true

  if (!hasPermission || (superAdminOnly && currentUser.type !== 'super_admin')) return navigateTo('/')
})
