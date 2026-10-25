type LocationCountry = {
  id: number
  name_en: string
  name_ar: string
  shipping_price: number | string | null
}

export type CheckoutCity = {
  id: number
  name_en: string
  name_ar: string
  shipping_price: number | string | null
  country: LocationCountry | null
}

export type CheckoutDistrict = {
  id: number
  city_id: number
  name_en: string
  name_ar: string
  shipping_price: number | string | null
}

const positivePrice = (value: number | string | null | undefined) => {
  const price = Number(value || 0)
  return Number.isFinite(price) && price > 0 ? price : 0
}

export const useLocations = () => {
  const { request } = useApi()
  const cities = ref<CheckoutCity[]>([])
  const districts = ref<CheckoutDistrict[]>([])
  const loadingCities = ref(false)
  const loadingDistricts = ref(false)
  const loadError = ref(false)

  const fetchCities = async () => {
    loadingCities.value = true
    loadError.value = false
    try {
      const response = await request<CheckoutCity[]>('/city')
      cities.value = response.data || []
    } catch {
      cities.value = []
      loadError.value = true
    } finally {
      loadingCities.value = false
    }
  }

  const fetchDistricts = async (cityId: number | null) => {
    districts.value = []
    if (!cityId) return

    loadingDistricts.value = true
    loadError.value = false
    try {
      const response = await request<CheckoutDistrict[]>('/district', {
        query: { city_id: cityId },
      })
      districts.value = (response.data || []).filter(district => district.city_id === cityId)
    } catch {
      loadError.value = true
    } finally {
      loadingDistricts.value = false
    }
  }

  const resolveShippingPrice = (city: CheckoutCity | null, district: CheckoutDistrict | null) =>
    positivePrice(district?.shipping_price)
    || positivePrice(city?.shipping_price)
    || positivePrice(city?.country?.shipping_price)

  return {
    cities: readonly(cities),
    districts: readonly(districts),
    loadingCities: readonly(loadingCities),
    loadingDistricts: readonly(loadingDistricts),
    loadError: readonly(loadError),
    fetchCities,
    fetchDistricts,
    resolveShippingPrice,
  }
}
