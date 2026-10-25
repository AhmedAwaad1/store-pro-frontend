export type StoreLocale = 'ar' | 'en'

const messages: Record<StoreLocale, Record<string, string>> = {
  ar: {
    home: 'الرئيسية',
    pagePath: 'مسار الصفحة',
    loadingPage: 'جارٍ تحميل الصفحة…',
    pageUnavailable: 'الصفحة غير متاحة',
    pageUnavailableText: 'قد تكون الصفحة حُذفت أو أن الرابط غير صحيح.',
    backHome: 'العودة إلى الرئيسية',
    pageSoon: 'سيكون محتوى الصفحة متاحًا قريبًا.',
  },
  en: {
    home: 'Home',
    pagePath: 'Page path',
    loadingPage: 'Loading page…',
    pageUnavailable: 'Page unavailable',
    pageUnavailableText: 'This page may have been removed or the link may be incorrect.',
    backHome: 'Back to home',
    pageSoon: 'Page content will be available soon.',
  },
}

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

  const t = (key: string) => messages[locale.value][key] || key

  return {
    locale: readonly(locale),
    direction,
    isEnglish: computed(() => locale.value === 'en'),
    setLocale,
    t,
  }
}
