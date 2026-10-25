export default defineNuxtPlugin(() => {
  const { setLocale } = useLocale()
  const route = useRoute()

  const applyRouteLocale = (value: unknown) => {
    if (value === 'en' || value === 'ar') {
      setLocale(value, false)
    }
  }

  applyRouteLocale(route.query.lang)
  watch(() => route.query.lang, applyRouteLocale)
})
