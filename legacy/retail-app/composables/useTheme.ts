import { DEFAULT_THEME, isThemeKey } from '~/constants/themes'
import type { ThemeKey } from '~/types/theme'

type StoreSettingsResponse = {
  data?: { 
    active_theme_key?: string;
    logo_url?: string;
    registration_image_url?: string;
  }
}

export const useTheme = () => {
  const activeTheme = useState<ThemeKey>('active-theme', () => DEFAULT_THEME)
  const logoUrl = useState<string | null>('store-logo', () => null)
  const registrationImageUrl = useState<string | null>('registration-image', () => null)
  const initialized = useState<boolean>('theme-initialized', () => false)
  const clientInitialized = useState<boolean>('theme-client-initialized', () => false)
  const config = useRuntimeConfig()

  const applyTheme = (themeKey: ThemeKey) => {
    activeTheme.value = themeKey
  }

  const loadStoreSettings = async () => {
    try {
      const response = await $fetch<StoreSettingsResponse>('/store/settings', {
        baseURL: config.public.apiBase,
      })
      const themeKey = response.data?.active_theme_key
      applyTheme(isThemeKey(themeKey) ? themeKey : DEFAULT_THEME)
      
      if (response.data?.logo_url) {
        logoUrl.value = response.data.logo_url
      }
      registrationImageUrl.value = response.data?.registration_image_url || null
    } catch {
      // Preserve the server-rendered theme if the live API is unavailable.
    } finally {
      initialized.value = true
    }
  }

  const initializeTheme = async () => {
    // Static generation/server rendering can serialize this state as initialized.
    // Keep a separate browser flag so the live API is still checked after hydration.
    if (import.meta.client) {
      if (clientInitialized.value) return
      clientInitialized.value = true
    } else if (initialized.value) {
      return
    }

    await loadStoreSettings()
  }

  return { 
    activeTheme: readonly(activeTheme), 
    logoUrl: readonly(logoUrl),
    registrationImageUrl: readonly(registrationImageUrl),
    applyTheme, 
    initializeTheme,
    refreshTheme: loadStoreSettings,
  }
}
