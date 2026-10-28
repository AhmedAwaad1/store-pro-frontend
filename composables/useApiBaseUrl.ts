export const useApiBaseUrl = (): string => {
  const config = useRuntimeConfig()
  const publicBase = String(config.public.apiBase || '/api').replace(/\/$/, '')

  if (import.meta.client) return publicBase

  const internalBase = String(config.apiInternalBase || '').trim()
  if (internalBase) return internalBase.replace(/\/$/, '')
  if (/^https?:\/\//i.test(publicBase)) return publicBase

  const siteOrigin = String(config.public.siteUrl || useRequestURL().origin).replace(/\/$/, '')
  return new URL(publicBase, `${siteOrigin}/`).toString().replace(/\/$/, '')
}
