import type { StaticPage } from '~/types/static-page'

export const useStaticPages = () => {
  const { request } = useApi()

  const list = async () => {
    const response = await request<StaticPage[]>('/static-pages')
    return response.data
  }

  const find = async (key: string) => {
    const response = await request<StaticPage>(`/static-pages/${encodeURIComponent(key)}`)
    return response.data
  }

  return { list, find }
}
