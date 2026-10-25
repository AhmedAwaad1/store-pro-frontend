export default defineNuxtPlugin(async () => {
  const { initializeTheme, refreshTheme } = useTheme()
  await initializeTheme()

  if (import.meta.client) {
    window.addEventListener('focus', () => {
      void refreshTheme()
    })
  }
})
