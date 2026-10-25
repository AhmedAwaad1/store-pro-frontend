export default defineNuxtPlugin(() => {
  const storedTheme = (() => {
    try {
      const value = localStorage.getItem('storepro-theme')
      return value === 'dark' || value === 'light' ? value : null
    } catch {
      return null
    }
  })()

  const theme = storedTheme
    ?? (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')

  document.documentElement.dataset.theme = theme
  document.documentElement.style.colorScheme = theme
  useState<'light' | 'dark'>('storepro-theme', () => theme).value = theme

  document
    .querySelector<HTMLMetaElement>('meta[name="theme-color"]')
    ?.setAttribute('content', theme === 'dark' ? '#0B0F19' : '#F8FAFC')
})
