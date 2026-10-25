import type { Product, Category, SubCategory } from '~/types/catalog'

export const useCatalog = () => {
  const categories = useState<Category[]>('catalog-categories', () => [])
  const subCategories = useState<SubCategory[]>('catalog-subcategories', () => [])
  const loading = useState<boolean>('catalog-loading', () => false)
  const config = useRuntimeConfig()

  const activeCategories = computed(() => categories.value.filter(category => category.is_active).sort((a, b) => a.order - b.order))
  const activeSubCategories = computed(() => subCategories.value.filter(subCategory => subCategory.is_active).sort((a, b) => a.order - b.order))

  const fetchCatalog = async ({ required = Boolean(config.catalogBuildRequired) }: { required?: boolean } = {}) => {
    if (loading.value) return
    loading.value = true
    try {
      const [catRes, subRes] = await Promise.all([
        $fetch<{ data: Category[] }>('/category', { baseURL: config.public.apiBase }),
        $fetch<{ data: SubCategory[] }>('/sub-category', { baseURL: config.public.apiBase }),
      ])
      if (!Array.isArray(catRes.data) || !Array.isArray(subRes.data)) {
        throw new Error('Catalog API returned an invalid response shape.')
      }
      if (required && !catRes.data.length) {
        throw new Error('Static catalog build requires at least one category.')
      }

      categories.value = catRes.data
      subCategories.value = subRes.data
    } catch (error) {
      if (required) {
        throw new Error('Required catalog data could not be loaded for the static build.', { cause: error })
      }

      console.error('Failed to fetch catalog at runtime:', error)
      categories.value = []
      subCategories.value = []
    } finally {
      loading.value = false
    }
  }

  const fetchProducts = async (filters: Record<string, string | number | boolean | undefined> = {}) => {
    const response = await $fetch<{
      data?: {
        data?: Product[]
        meta?: { current_page: number; last_page: number; per_page: number; total: number }
      }
    }>('/products', {
      baseURL: config.public.apiBase,
      query: { resource: 'list', per_page: 24, ...filters },
    })
    const items = response.data?.data
    const meta = response.data?.meta
    if (!Array.isArray(items) || !meta) {
      throw new Error('Product list API returned an invalid paginated response shape.')
    }

    return { products: items, meta }
  }

  const getCategoryBySlug = (slug: string) => activeCategories.value.find(category => category.slug === slug)
  const getSubCategoryBySlug = (slug: string) => activeSubCategories.value.find(subCategory => subCategory.slug === slug)
  const getSubCategoriesByCategory = (categoryId: number) => activeSubCategories.value.filter(item => item.category_id === categoryId && !item.parent_sub_category_id)
  return {
    categories: activeCategories,
    subCategories: activeSubCategories,
    loading: readonly(loading),
    fetchCatalog,
    fetchProducts,
    getCategoryBySlug,
    getSubCategoryBySlug,
    getSubCategoriesByCategory,
  }
}
