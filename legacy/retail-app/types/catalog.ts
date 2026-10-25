export type Category = {
  id: number
  name: string
  name_en: string
  name_ar: string
  slug: string
  image: string | null
  original_image?: string | null
  thumbnails?: { webp: string | null; medium: string | null; small: string | null }
  is_active: boolean
  order: number
  show_in_menu?: boolean
  icon_key?: string | null
  desktop_banner_url?: string | null
  mobile_banner_url?: string | null
  description_en?: string | null
  description_ar?: string | null
  meta_title_en?: string | null
  meta_title_ar?: string | null
  meta_description_en?: string | null
  meta_description_ar?: string | null
  sub_categories?: SubCategory[]
}

export type SubCategory = {
  id: number
  category_id: number
  name: string
  name_en: string
  name_ar: string
  slug: string
  image: string | null
  original_image?: string | null
  thumbnails?: { webp: string | null; medium: string | null; small: string | null }
  is_active: boolean
  order: number
  parent_sub_category_id?: number | null
  parent?: SubCategory | null
  children?: SubCategory[]
  show_in_menu?: boolean
  desktop_banner_url?: string | null
  mobile_banner_url?: string | null
  category?: Category
}

export type ProductImage = {
  id: number
  is_main: number
  image: string | null
  thumbnails: { webp: string | null; medium: string | null; small: string | null }
  role?: 'main' | 'gallery' | 'lifestyle' | 'dimension_diagram' | 'energy_label' | 'variant_image'
  alt_en?: string | null
  alt_ar?: string | null
  caption_en?: string | null
  caption_ar?: string | null
}

export type ProductOptionType = {
  id: number
  name: string
  name_en?: string | null
  name_ar?: string | null
}

export type ProductOptionValue = {
  id: number
  product_option_id: number
  value: string
  value_en: string
  value_ar: string
  hex_code: string | null
  order: number
  product_option: { id: number; option_type: ProductOptionType }
}

export type ProductVariant = {
  id: number
  product_id: number
  sku: string
  price: number
  price_after_discount: number | null
  quantity: number
  is_active: boolean
  in_stock: boolean
  order: number
  title: string
  attributes: Record<string, string>
  color_info: { name: string; hex_code: string | null } | null
  images: ProductImage[]
  option_values: ProductOptionValue[]
  savings?: number
  savings_percentage?: number
  promotion?: { id: number; name: string; badge_en?: string | null; badge_ar?: string | null; terms_en?: string | null; terms_ar?: string | null } | null
}

export type ProductColorSwatch = {
  value_id: number
  name: string
  name_en?: string | null
  name_ar?: string | null
  hex_code: string | null
  image_url: string | null
}

export type Product = {
  id: number
  name: string
  name_en?: string | null
  name_ar?: string | null
  description: string
  description_en?: string | null
  description_ar?: string | null
  sku: string | null
  model_number?: string | null
  gtin?: string | null
  country_of_origin?: string | null
  release_status?: 'released' | 'coming_soon' | 'discontinued'
  condition?: 'new' | 'refurbished' | 'open_box'
  highlights_en?: string[]
  highlights_ar?: string[]
  included_in_box_en?: string[]
  included_in_box_ar?: string[]
  handling_class?: 'standard' | 'oversized' | 'fragile' | 'installation_required' | 'digital'
  completeness?: number
  has_variants: boolean
  status: boolean
  created_at: string
  category_id: number
  sub_category_id: number | null
  avg_rating: number
  reviews_count: number
  default_price: { price: number; price_after_discount: number; currency: string }
  savings?: number
  savings_percentage?: number
  promotion?: { id: number; name: string; badge_en?: string | null; badge_ar?: string | null; terms_en?: string | null; terms_ar?: string | null } | null
  is_best_seller: boolean
  is_new_arrival: boolean
  is_special_offer?: boolean
  show_on_homepage: boolean
  category: Category
  sub_category: SubCategory | null
  images: ProductImage[]
  main_image_url: string | null
  quantity: number | null
  warranty_duration_months?: number | null
  installation_fee?: number
  variants: ProductVariant[]
  colors: ProductColorSwatch[]
  brand?: { id: number; name_en: string; name_ar: string; slug: string; logo_url?: string | null } | null
  warranty?: { id: number; provider: string; type: string; duration_months: number; terms_en?: string | null; terms_ar?: string | null; service_center_name?: string | null; service_center_phone?: string | null } | null
  specification_groups?: Array<{ id: number; name_en: string; name_ar: string; items: Array<{ id: number; key: string; name_en: string; name_ar: string; value: string | number | boolean | string[] | null; unit: string | null; is_comparable: boolean }> }>
  documents?: Array<{ id: number; type: string; title_en: string; title_ar: string; url: string; mime_type: string | null }>
  videos?: Array<{ id: number; product_variant_id: number | null; title_en: string; title_ar: string; url: string; mime_type: string }>
  product_relationships?: Record<string, { type: string; items: Product[] }>
}

export type CartLine = {
  key: string
  product: Product
  product_variant_id: number | null
  variant: ProductVariant | null
  qty: number
}

export type CatalogFilters = {
  search?: string
  category_id?: number | null
  sub_category_id?: number | null
  in_stock?: boolean
  on_sale?: boolean
  max_price?: number
  sort_by?: 'newest' | 'lowest_price' | 'highest_price' | 'rating'
}
