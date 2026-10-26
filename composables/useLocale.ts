export type StoreLocale = 'ar' | 'en'

export const useLocale = () => {
  const locale = useState<StoreLocale>('storepro-locale', () => 'ar')
  const direction = computed(() => locale.value === 'ar' ? 'rtl' : 'ltr')

  const setLocale = (next: StoreLocale, updateUrl = true) => {
    locale.value = next
    if (!import.meta.client) return

    document.documentElement.lang = next
    document.documentElement.dir = next === 'ar' ? 'rtl' : 'ltr'
    localStorage.setItem('storepro-locale', next)

    if (updateUrl) {
      const route = useRoute()
      const router = useRouter()
      if (route.query.lang !== next) void router.replace({ query: { ...route.query, lang: next } })
    }
  }

  return {
    locale: readonly(locale),
    direction,
    isEnglish: computed(() => locale.value === 'en'),
    setLocale,
  }
}
