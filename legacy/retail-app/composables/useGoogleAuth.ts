export const useGoogleAuth = () => {
  const config = useRuntimeConfig()

  const startGoogleSignIn = () => {
    if (!import.meta.client) return

    window.location.assign(`${config.public.oauthBase}/auth/google/redirect`)
  }

  return { startGoogleSignIn }
}
