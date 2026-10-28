import { $fetch } from 'ofetch'

type ApiEnvelope<T> = {
  data: T
  message?: string
}

type RequestOptions = Record<string, unknown> & {
  headers?: Record<string, string>
}

export const useApi = () => {
  const baseURL = useApiBaseUrl()

  const request = async <T>(path: string, options: RequestOptions = {}) => {
    const { headers, ...requestOptions } = options

    return await $fetch(path, {
      baseURL,
      credentials: 'include',
      ...requestOptions,
      headers: {
        Accept: 'application/json',
        ...headers,
      },
    }) as ApiEnvelope<T>
  }

  return { request }
}
