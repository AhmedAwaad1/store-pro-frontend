import { spawnSync } from 'node:child_process'
import { existsSync, readFileSync, readdirSync, rmSync } from 'node:fs'

const projectRoot = process.cwd()
const apiBase = process.env.NUXT_PUBLIC_API_BASE?.trim()
const routes = new Set(['/', '/services', '/portfolio', '/pricing', '/about', '/contact', '/blog'])

if (apiBase) {
  try {
    const response = await fetch(new URL('blog', `${apiBase.replace(/\/$/, '')}/`), {
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
    console.warn(`Marketing build will omit blog article prerendering: ${error.message}`)
  }
}

const environment = {
  ...process.env,
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

