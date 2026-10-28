import { $fetch } from 'ofetch'

type Article = { slug?: string; published_at?: string | null }

function articleRecords(response: any): Article[] {
  const data = response?.data
  if (Array.isArray(data)) return data
  return Array.isArray(data?.data) ? data.data : []
}

function xml(value: string): string {
  return value.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;').replaceAll("'", '&apos;')
}

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig(event)
  const siteUrl = String(config.public.siteUrl || getRequestURL(event).origin).replace(/\/$/, '')
  const internalBase = String(config.apiInternalBase || '').trim()
  const publicBase = String(config.public.apiBase || '/api').replace(/\/$/, '')
  const apiBase = internalBase || (/^https?:\/\//i.test(publicBase) ? publicBase : new URL(publicBase, `${siteUrl}/`).toString())

  let articles: Article[] = []
  try {
    articles = articleRecords(await $fetch('/blog', { baseURL: apiBase, timeout: 5000 }))
  } catch {
    // Keep the static public routes in the sitemap if the CMS is temporarily unavailable.
  }

  const urls = [
    { loc: `${siteUrl}/`, lastmod: undefined },
    { loc: `${siteUrl}/blog`, lastmod: undefined },
    ...articles.filter((article) => typeof article.slug === 'string' && article.slug.length > 0).map((article) => ({
      loc: `${siteUrl}/blog/${encodeURIComponent(article.slug!)}`,
      lastmod: article.published_at ? new Date(article.published_at).toISOString() : undefined,
    })),
  ]

  const entries = urls.map(({ loc, lastmod }) => `  <url><loc>${xml(loc)}</loc>${lastmod ? `<lastmod>${xml(lastmod.slice(0, 10))}</lastmod>` : ''}</url>`).join('\n')
  setResponseHeader(event, 'content-type', 'application/xml; charset=utf-8')
  setResponseHeader(event, 'cache-control', 'public, max-age=60, s-maxage=60')

  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${entries}\n</urlset>`
})
