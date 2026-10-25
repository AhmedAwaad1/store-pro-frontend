import { spawnSync } from 'node:child_process'
import { readFile, rm } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const outputRoot = path.join(projectRoot, '.output', 'public')
const allowEmptyCatalog = process.env.NUXT_ALLOW_EMPTY_CATALOG === 'true'
const apiBase = process.env.NUXT_PUBLIC_API_BASE?.trim()

function fail(message) {
  console.error(`Static storefront build failed: ${message}`)
  process.exit(1)
}

function isActive(record) {
  const value = record.is_active ?? record.status
  return value !== false && value !== 0 && value !== '0'
}

function labelsFor(record) {
  return [record.name_ar, record.name_en, record.name]
    .filter((label) => typeof label === 'string' && label.trim())
}

function routeFor(prefix, value) {
  return `/${prefix}/${encodeURIComponent(String(value))}`
}

async function fetchCollection(base, endpoint) {
  const relativeEndpoint = endpoint.replace(/^\/+/, '')
  const response = await fetch(new URL(relativeEndpoint, `${base.replace(/\/$/, '')}/`), {
    headers: { Accept: 'application/json' },
    signal: AbortSignal.timeout(15000),
  })
  if (!response.ok) throw new Error(`${endpoint} returned HTTP ${response.status}`)

  const payload = await response.json()
  if (!Array.isArray(payload?.data)) throw new Error(`${endpoint} did not return a data array`)
  return payload.data
}

async function fetchProductPage(base, page, perPage = 100) {
  const url = new URL('products', `${base.replace(/\/$/, '')}/`)
  url.searchParams.set('resource', 'list')
  url.searchParams.set('page', String(page))
  url.searchParams.set('per_page', String(perPage))

  const response = await fetch(url, {
    headers: { Accept: 'application/json' },
    signal: AbortSignal.timeout(15000),
  })
  if (!response.ok) throw new Error(`/products returned HTTP ${response.status}`)

  const payload = await response.json()
  const collection = payload?.data
  if (!Array.isArray(collection?.data) || !Number.isInteger(collection?.meta?.last_page)) {
    throw new Error('/products did not return the nested paginated list response')
  }

  return collection
}

async function fetchAllProducts(base) {
  const products = []
  let page = 1
  let lastPage = 1

  do {
    const collection = await fetchProductPage(base, page)
    products.push(...collection.data)
    lastPage = collection.meta.last_page
    page += 1
    if (page > 10000) throw new Error('/products returned an unreasonable page count')
  } while (page <= lastPage)

  return products
}

async function prepareCatalogBuild() {
  if (allowEmptyCatalog) {
    console.warn('NUXT_ALLOW_EMPTY_CATALOG=true: this build explicitly allows an empty catalog.')
    return { routes: [], expected: [] }
  }

  if (!apiBase) fail('set NUXT_PUBLIC_API_BASE to an API reachable from this build machine.')

  let categories
  let subCategories
  let products
  try {
    [categories, subCategories, products] = await Promise.all([
      fetchCollection(apiBase, '/category'),
      fetchCollection(apiBase, '/sub-category'),
      fetchAllProducts(apiBase),
    ])
  } catch (error) {
    fail(`catalog preflight could not reach valid catalog data at NUXT_PUBLIC_API_BASE (${error.message}).`)
  }

  const activeCategories = categories.filter(isActive)
  const activeSubCategories = subCategories.filter(isActive)
  const activeProducts = products.filter(isActive)
  if (!activeCategories.length || !activeProducts.length) {
    fail('the API returned no active categories or products; set NUXT_ALLOW_EMPTY_CATALOG=true only for an environment where an empty catalog is intentional.')
  }

  const category = activeCategories.find((item) => item.slug && labelsFor(item).length)
  const product = activeProducts.find((item) => item.id && labelsFor(item).length)
  if (!category || !product) fail('the API catalog is missing a category slug or product ID/name needed for page verification.')

  return {
    routes: [
      ...activeCategories.filter((item) => item.slug).map((item) => routeFor('category', item.slug)),
      ...activeSubCategories.filter((item) => item.slug).map((item) => routeFor('sub-category', item.slug)),
      ...activeProducts.filter((item) => item.id).map((item) => routeFor('product', item.id)),
    ],
    expected: [
      { route: '/', labels: labelsFor(product) },
      { route: routeFor('category', category.slug), labels: labelsFor(category) },
      { route: routeFor('product', product.id), labels: [] },
    ],
  }
}

function htmlEscape(value) {
  return value.replace(/[&<>"']/g, (character) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  })[character])
}

async function verifyGeneratedPages(expectedPages) {
  for (const expected of expectedPages) {
    const relativeRoute = decodeURIComponent(expected.route.replace(/^\/+/, ''))
    const htmlPath = path.join(outputRoot, relativeRoute, 'index.html')
    let html
    try {
      html = await readFile(htmlPath, 'utf8')
    } catch {
      fail(`expected static page ${expected.route}/index.html was not generated.`)
    }

    if (expected.labels.length && !expected.labels.some((label) => html.includes(label) || html.includes(htmlEscape(label)))) {
      fail(`generated page ${expected.route} does not contain any expected catalog name before hydration.`)
    }
  }
}

const catalog = await prepareCatalogBuild()
const environment = {
  ...process.env,
  NUXT_CATALOG_BUILD_REQUIRED: allowEmptyCatalog ? 'false' : 'true',
  NUXT_STATIC_CATALOG_ROUTES: JSON.stringify(catalog.routes),
}

await rm(path.join(projectRoot, '.output'), { recursive: true, force: true })
const nuxtCli = path.join(projectRoot, 'node_modules', '@nuxt', 'cli', 'bin', 'nuxi.mjs')
const build = spawnSync(process.execPath, [nuxtCli, 'generate'], {
  cwd: projectRoot,
  env: environment,
  stdio: 'inherit',
})
if (build.error) fail(`Nuxt could not start: ${build.error.message}`)
if (build.status !== 0) process.exit(build.status || 1)

if (!allowEmptyCatalog) await verifyGeneratedPages(catalog.expected)
console.log('Static storefront build and catalog page checks passed.')
