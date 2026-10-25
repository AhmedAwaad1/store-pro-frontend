export type ConsentPreferences = {
  necessary: true
  analytics: boolean
  marketing: boolean
  version: 1
  updatedAt: string
}

const STORAGE_KEY = 'storepro-consent-preferences'

export const useConsent = () => {
  const preferences = useState<ConsentPreferences | null>('storepro-consent-preferences', () => null)
  const settingsOpen = useState<boolean>('storepro-consent-settings-open', () => false)

  const save = (analytics: boolean, marketing: boolean) => {
    preferences.value = { necessary: true, analytics, marketing, version: 1, updatedAt: new Date().toISOString() }
    settingsOpen.value = false
    if (import.meta.client) localStorage.setItem(STORAGE_KEY, JSON.stringify(preferences.value))
  }

  const loadStored = () => {
    if (!import.meta.client) return
    try {
      const value = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null') as ConsentPreferences | null
      if (value?.version === 1 && typeof value.analytics === 'boolean' && typeof value.marketing === 'boolean') {
        preferences.value = { necessary: true, analytics: value.analytics, marketing: value.marketing, version: 1, updatedAt: value.updatedAt }
      }
    } catch {
      preferences.value = null
    }
  }

  return {
    preferences: readonly(preferences),
    settingsOpen: readonly(settingsOpen),
    needsChoice: computed(() => preferences.value === null),
    openSettings: () => { settingsOpen.value = true },
    closeSettings: () => { settingsOpen.value = false },
    acceptAll: () => save(true, true),
    rejectOptional: () => save(false, false),
    save,
    loadStored,
  }
}
