export const useDeliveryLocation = () => {
  const cityId = useCookie<number | null>('3b-delivery-city', {
    default: () => null,
    sameSite: 'lax',
  })

  return { cityId }
}
