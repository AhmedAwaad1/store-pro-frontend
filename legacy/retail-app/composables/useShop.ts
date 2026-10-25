import type { CartLine, Product, ProductVariant } from '~/types/catalog'
import { getCartLineKey, getProductPrice, getProductStock } from '~/utils/catalog'

export const useShop = () => {
  const cart = useState<CartLine[]>('cart', () => [])
  const wishlist = useState<number[]>('wishlist', () => [])
  const toast = useState<string>('toast', () => '')

  const showToast = (message: string) => {
    toast.value = message
    if (import.meta.client) window.setTimeout(() => (toast.value = ''), 2200)
  }

  const addToCart = (product: Product, qty = 1, variant: ProductVariant | null = null) => {
    if (product.has_variants && !variant) {
      showToast('اختر الخيارات المطلوبة أولاً')
      return false
    }

    const availableStock = getProductStock(product, variant)
    if (availableStock < 1) {
      showToast('الاختيار ده غير متوفر حاليًا')
      return false
    }

    const key = getCartLineKey(product.id, variant?.id)
    const line = cart.value.find(item => item.key === key)
    if (line) line.qty = Math.min(availableStock, line.qty + qty)
    else cart.value.push({
      key,
      product,
      product_variant_id: variant?.id || null,
      variant,
      qty: Math.min(qty, availableStock),
    })

    showToast('اتضاف للسلة بنجاح')
    return true
  }

  const removeFromCart = (key: string) => {
    cart.value = cart.value.filter(item => item.key !== key)
  }

  const updateQty = (key: string, delta: number) => {
    const line = cart.value.find(item => item.key === key)
    if (!line) return
    line.qty = Math.min(getProductStock(line.product, line.variant), Math.max(1, line.qty + delta))
  }

  const toggleWishlist = (id: number) => {
    wishlist.value = wishlist.value.includes(id)
      ? wishlist.value.filter(item => item !== id)
      : [...wishlist.value, id]
    showToast(wishlist.value.includes(id) ? 'اتضاف للمفضلة' : 'اتشال من المفضلة')
  }

  const cartCount = computed(() => cart.value.reduce((sum, item) => sum + item.qty, 0))
  const subtotal = computed(() => cart.value.reduce((sum, item) => sum + getProductPrice(item.product, item.variant) * item.qty, 0))
  const clearCart = () => { cart.value = [] }

  const toCartPayload = () => ({
    items: cart.value.map(line => ({
      product_id: line.product.has_variants ? null : line.product.id,
      product_variant_id: line.product_variant_id,
      quantity: line.qty,
    })),
  })

  return {
    cart,
    wishlist,
    toast,
    cartCount,
    subtotal,
    addToCart,
    removeFromCart,
    updateQty,
    toggleWishlist,
    clearCart,
    showToast,
    toCartPayload,
  }
}
