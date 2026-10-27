type ApiEnvelope<T> = {
  data: T
  message?: string
}

export type AdminUser = {
  id: number
  username: string
  email: string
  phone?: string | null
  type: string
  admin_permissions: string[]
}

type RequestOptions = Record<string, unknown> & {
  headers?: Record<string, string>
}

export const useApi = () => {
  const config = useRuntimeConfig()
  const baseURL = String(config.public.apiBase || '').replace(/\/$/, '')
  const user = useState<AdminUser | null>('storepro-admin-user', () => null)

  const request = async <T>(path: string, options: RequestOptions = {}) => {
    const { headers, ...requestOptions } = options

    return await $fetch<ApiEnvelope<T>>(path, {
      baseURL,
      credentials: 'include',
      ...requestOptions,
      headers: {
        Accept: 'application/json',
        ...headers,
      },
    })
  }

  const csrfToken = async () => {
    const response = await $fetch<{ token: string }>('/auth/csrf-token', {
      baseURL,
      credentials: 'include',
      headers: { Accept: 'application/json' },
    })

    return response.token
  }

  const login = async (email: string, password: string) => {
    const csrf = await csrfToken()
    const response = await request<AdminUser>('/auth/login', {
      method: 'POST',
      body: { email, password },
      headers: { 'X-CSRF-TOKEN': csrf },
    })

    user.value = response.data
    try {
      return await fetchCurrentUser()
    } catch (error) {
      try { await logout() } catch { /* The local state is cleared even if the session has expired. */ }
      throw error
    }
  }

  const fetchCurrentUser = async () => {
    const response = await request<AdminUser>('/auth/me')
    user.value = response.data
    return response.data
  }

  const logout = async () => {
    try {
      const csrf = await csrfToken()
      await request('/auth/logout', { method: 'POST', headers: { 'X-CSRF-TOKEN': csrf } })
    } finally {
      user.value = null
    }
  }

  const hasPermission = (permission: string) => Boolean(
    user.value
      && (user.value.type === 'super_admin'
        || user.value.type === 'admin'
        || user.value.admin_permissions?.includes('*')
        || user.value.admin_permissions?.includes(permission)),
  )

  return { request, user, login, logout, fetchCurrentUser, hasPermission }
}
