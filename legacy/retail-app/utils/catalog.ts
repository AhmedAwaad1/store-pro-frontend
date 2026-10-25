import type { Product, ProductImage, ProductOptionValue, ProductVariant } from '~/types/catalog'

export const getLocalizedFirst = (locale: 'ar' | 'en', arabic?: string | null, english?: string | null, fallback?: string | null) =>
  (locale === 'en' ? english?.trim() || fallback?.trim() || arabic?.trim() : arabic?.trim() || fallback?.trim() || english?.trim()) || ''

/** @deprecated Prefer getLocalizedFirst with the active store locale. */
export const getArabicFirst = (arabic?: string | null, english?: string | null, fallback?: string | null) =>
  getLocalizedFirst('ar', arabic, english, fallback)

export const getAppliedPrice = (price: number, discountedPrice?: number | null) =>
  discountedPrice !== null && discountedPrice !== undefined && discountedPrice >= 0 && discountedPrice < price ? discountedPrice : price

export const getDefaultVariant = (product: Product) =>
  product.variants.find(variant => variant.is_active && variant.in_stock)
  || product.variants.find(variant => variant.is_active)
  || null

export const getProductPrice = (product: Product, variant?: ProductVariant | null) => {
  if (variant) return getAppliedPrice(variant.price, variant.price_after_discount)
  return getAppliedPrice(product.default_price.price, product.default_price.price_after_discount)
}

export const getProductOriginalPrice = (product: Product, variant?: ProductVariant | null) =>
  variant?.price ?? product.default_price.price

export const hasProductDiscount = (product: Product, variant?: ProductVariant | null) =>
  getProductPrice(product, variant) < getProductOriginalPrice(product, variant)

export const getProductStock = (product: Product, variant?: ProductVariant | null) =>
  product.has_variants
    ? (variant?.quantity ?? product.variants?.reduce((sum, item) => sum + (item.is_active ? item.quantity : 0), 0) ?? product.quantity ?? 0)
    : (product.quantity ?? 0)

export const isProductInStock = (product: Product) => getProductStock(product) > 0

export const getProductBadge = (product: Product, locale: 'ar' | 'en' = 'ar') => {
  if (product.is_best_seller) return locale === 'en' ? 'Best seller' : 'الأكثر مبيعًا'
  if (product.is_new_arrival) return locale === 'en' ? 'New arrival' : 'وصل جديد'
  if (hasProductDiscount(product)) return locale === 'en' ? 'Sale' : 'عرض'
  return ''
}

export type ProductImageSize = 'small' | 'medium' | 'webp'

export const getImageUrl = (image?: ProductImage | null, size: ProductImageSize = 'medium') =>
  image?.thumbnails?.[size]
  || image?.thumbnails?.medium
  || image?.thumbnails?.webp
  || image?.image
  || null

export const getProductImage = (
  product: Product,
  variant?: ProductVariant | null,
  size: ProductImageSize = 'medium',
) => {
  const variantImage = variant?.images.find(item => item.is_main === 1) || variant?.images[0]
  const variantImageUrl = getImageUrl(variantImage, size)
  if (variantImageUrl) return variantImageUrl

  const colorValue = variant?.option_values.find(value => {
    const type = value.product_option.option_type
    return (type.name_en || type.name || '').toLowerCase() === 'color'
  })
  if (colorValue) {
  const sibling = product.variants?.find(item =>
      item.id !== variant?.id
      && item.option_values.some(value => value.id === colorValue.id)
      && item.images.length > 0,
    )
    const siblingImage = sibling?.images.find(item => item.is_main === 1) || sibling?.images[0]
    const siblingImageUrl = getImageUrl(siblingImage, size)
    if (siblingImageUrl) return siblingImageUrl
  }

  const productImage = product.images?.find(item => item.is_main === 1) || product.images?.[0]
  return getImageUrl(productImage, size) || product.main_image_url || '/images/hero.jpg'
}

export const getOptionType = (value: ProductOptionValue) => value.product_option.option_type

export const getVariantOptionLabel = (variant: ProductVariant | null, locale: 'ar' | 'en' = 'ar') =>
  variant?.option_values.map(value => getLocalizedFirst(locale, value.value_ar, value.value_en, value.value)).join(' / ') || ''

export const getCartLineKey = (productId: number, variantId?: number | null) =>
  `${productId}:${variantId || 'product'}`
