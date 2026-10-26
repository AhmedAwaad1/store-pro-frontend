import { spawnSync } from 'node:child_process'
import { existsSync, readFileSync, readdirSync, rmSync } from 'node:fs'

const projectRoot = process.cwd()
const buildEnvironment = { ...process.env }
const productionEnvFile = `${projectRoot}/.env.production`
if (existsSync(productionEnvFile)) {
  for (const line of readFileSync(productionEnvFile, 'utf8').split(/\r?\n/)) {
    const match = line.match(/^\s*(NUXT_PUBLIC_API_BASE|NUXT_PUBLIC_SITE_URL)\s*=\s*(.*?)\s*$/)
    if (!match || buildEnvironment[match[1]]) continue
    buildEnvironment[match[1]] = match[2].replace(/^(['"])(.*)\1$/, '$2')
  }
}
const apiBase = buildEnvironment.NUXT_PUBLIC_API_BASE?.trim()
const siteOrigin = buildEnvironment.NUXT_PUBLIC_SITE_URL?.trim()
const routes = new Set([
  '/', '/services', '/portfolio', '/pricing', '/about', '/contact', '/blog',
  '/admin', '/admin/dashboard', '/admin/login', '/admin/inquiries', '/admin/contacts', '/admin/content', '/admin/blog', '/admin/seo',
])

if (apiBase) {
  try {
    const resolvedApiBase = new URL(apiBase, siteOrigin)
    const blogEndpoint = new URL('blog', `${resolvedApiBase.toString().replace(/\/+$/, '')}/`)
    const response = await fetch(blogEndpoint, {
      headers: { Accept: 'application/json' },
      signal: AbortSignal.timeout(8000),
    })
    if (!response.ok) throw new Error(`Blog endpoint returned HTTP ${response.status}`)
    const payload = await response.json()
    const collection = Array.isArray(payload?.data) ? payload.data : payload?.data?.data
    for (const article of Array.isArray(collection) ? collection : []) {
      if (typeof article?.slug === 'string' && article.slug.trim()) routes.add(`/blog/${encodeURIComponent(article.slug)}`)
    }
  } catch (error) {
    const message = apiBase.startsWith('/') && !siteOrigin
      ? 'Set NUXT_PUBLIC_SITE_URL to resolve a relative API base during static generation.'
      : error.message
    console.warn(`Marketing build will omit blog article prerendering: ${message}`)
  }
}

const environment = {
  ...buildEnvironment,
  NUXT_STATIC_SITE_ROUTES: JSON.stringify([...routes]),
}
const fontCache = `${projectRoot}/node_modules/.cache/nuxt-google-fonts`
const fontStylesheet = `${fontCache}/css/nuxt-google-fonts.css`
const cachedFonts = `${fontCache}/fonts`
if (existsSync(fontStylesheet) && existsSync(cachedFonts)) {
  const referencedFonts = new Set(
    [...readFileSync(fontStylesheet, 'utf8').matchAll(/url\(['"]?\.\.\/fonts\/([^'")]+)/g)]
      .map((match) => match[1]),
  )
  for (const filename of readdirSync(cachedFonts)) {
    if (filename.endsWith('.woff2') && !referencedFonts.has(filename)) {
      rmSync(`${cachedFonts}/${filename}`, { force: true })
    }
  }
}
rmSync(`${projectRoot}/.output/public`, { recursive: true, force: true })
const nuxtCli = `${projectRoot}/node_modules/@nuxt/cli/bin/nuxi.mjs`
const build = spawnSync(process.execPath, [nuxtCli, 'generate'], { cwd: projectRoot, env: environment, stdio: 'inherit' })
if (build.error) {
  console.error(`Nuxt could not start: ${build.error.message}`)
  process.exit(1)
}
process.exit(build.status ?? 1)

