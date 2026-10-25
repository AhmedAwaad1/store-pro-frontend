export const useComparison = () => {
  const productIds = useState<number[]>('catalog-comparison-ids', () => [])
  const hydrated = useState<boolean>('catalog-comparison-hydrated', () => false)

  onMounted(() => {
    if (!import.meta.client || hydrated.value) return
    try {
      const stored = JSON.parse(localStorage.getItem('3b-comparison-ids') || '[]')
      productIds.value = Array.isArray(stored) ? stored.filter((id: unknown) => Number.isInteger(id)).slice(0, 4) : []
    } catch {
      productIds.value = []
    }
    hydrated.value = true
  })

  const toggle = (id: number) => {
    if (productIds.value.includes(id)) productIds.value = productIds.value.filter(item => item !== id)
    else if (productIds.value.length < 4) productIds.value = [...productIds.value, id]
    else return false

    if (import.meta.client) localStorage.setItem('3b-comparison-ids', JSON.stringify(productIds.value))
    return true
  }

  const remove = (id: number) => {
    productIds.value = productIds.value.filter(item => item !== id)
    if (import.meta.client) localStorage.setItem('3b-comparison-ids', JSON.stringify(productIds.value))
  }

  const clear = () => {
    productIds.value = []
    if (import.meta.client) localStorage.removeItem('3b-comparison-ids')
  }

  return { productIds: readonly(productIds), count: computed(() => productIds.value.length), toggle, remove, clear }
}
