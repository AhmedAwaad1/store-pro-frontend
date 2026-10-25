export default defineNuxtPlugin(() => {
  useConsent().loadStored()
})
