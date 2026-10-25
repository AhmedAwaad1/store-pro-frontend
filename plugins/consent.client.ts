export default defineNuxtPlugin((nuxtApp) => {
  const consent = useConsent()
  nuxtApp.hook('app:mounted', () => consent.loadStored())
})
