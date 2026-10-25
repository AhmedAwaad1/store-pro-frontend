type ApiEnvelope<T> = {
  data: T
  message?: string
}

type RequestOptions = Record<string, unknown> & {
  headers?: Record<string, string>
}

export const useApi = () => {
  const config = useRuntimeConfig()
  const baseURL = String(config.public.apiBase || '').replace(/\/$/, '')

  const request = async <T>(path: string, options: RequestOptions = {}) => {
    const { headers, ...requestOptions } = options

    return await $fetch<ApiEnvelope<T>>(path, {
      baseURL,
      ...requestOptions,
      headers: {
        Accept: 'application/json',
        ...headers,
      },
    })
  }

  return { request }
}
