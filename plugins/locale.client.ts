export default defineNuxtPlugin((nuxtApp) => {
  const { setLocale } = useLocale()
  const route = useRoute()

  nuxtApp.hook('app:mounted', () => {
    if (route.query.lang === 'en' || route.query.lang === 'ar') return
    const savedLocale = localStorage.getItem('storepro-locale')
    if (savedLocale === 'en' || savedLocale === 'ar') setLocale(savedLocale, false)
  })
})
