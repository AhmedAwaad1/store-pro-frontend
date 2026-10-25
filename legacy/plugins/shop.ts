export default defineNuxtPlugin(async () => {
  if (import.meta.client) {
    // Do not carry customer selections forward from the previous shoe-store identity.
    localStorage.removeItem('rocket-cart-v1')
    localStorage.removeItem('masry-wishlist')
  }

  const config = useRuntimeConfig()
  const { fetchCatalog } = useCatalog()
  if (!(import.meta.server && config.catalogBuildAllowEmpty)) {
    await fetchCatalog({ required: import.meta.server && Boolean(config.catalogBuildRequired) })
  }

  const cart = useState('cart', () => [])
  const wishlist = useState<number[]>('wishlist', () => [])

  if (import.meta.client) {
    const savedCart = localStorage.getItem('3b-cart-v1')
    const savedWishlist = localStorage.getItem('3b-wishlist-v1')
    if (savedCart) cart.value = JSON.parse(savedCart)
    if (savedWishlist) wishlist.value = JSON.parse(savedWishlist)
    watch(cart, value => localStorage.setItem('3b-cart-v1', JSON.stringify(value)), { deep: true })
    watch(wishlist, value => localStorage.setItem('3b-wishlist-v1', JSON.stringify(value)), { deep: true })
  }
})
