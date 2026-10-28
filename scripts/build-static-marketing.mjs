import { spawnSync } from 'node:child_process'
import { existsSync, readFileSync, rmSync } from 'node:fs'

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
const routes = new Set([
  '/', '/services', '/portfolio', '/pricing', '/about', '/contact', '/blog',
])

const environment = {
  ...buildEnvironment,
  NUXT_DEPLOY_MODE: 'static',
  NUXT_STATIC_SITE_ROUTES: JSON.stringify([...routes]),
}
rmSync(`${projectRoot}/.output/public`, { recursive: true, force: true })
const nuxtCli = `${projectRoot}/node_modules/@nuxt/cli/bin/nuxi.mjs`
const build = spawnSync(process.execPath, [nuxtCli, 'generate'], { cwd: projectRoot, env: environment, stdio: 'inherit' })
if (build.error) {
  console.error(`Nuxt could not start: ${build.error.message}`)
  process.exit(1)
}
process.exit(build.status ?? 1)

