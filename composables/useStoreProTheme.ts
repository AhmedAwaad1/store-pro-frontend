export type StoreProTheme = 'light' | 'dark'

export const useStoreProTheme = () => {
  const theme = useState<StoreProTheme>('storepro-theme', () => 'light')

  const setTheme = (nextTheme: StoreProTheme) => {
    theme.value = nextTheme

    if (import.meta.client) {
      document.documentElement.dataset.theme = nextTheme
      document.documentElement.style.colorScheme = nextTheme

      try {
        localStorage.setItem('storepro-theme', nextTheme)
      } catch {
        // Keep the selected theme for this session when storage is unavailable.
      }

      document
        .querySelector<HTMLMetaElement>('meta[name="theme-color"]')
        ?.setAttribute('content', nextTheme === 'dark' ? '#0B0F19' : '#F8FAFC')
    }
  }

  const toggleTheme = () => setTheme(theme.value === 'dark' ? 'light' : 'dark')

  return { theme, setTheme, toggleTheme }
}
