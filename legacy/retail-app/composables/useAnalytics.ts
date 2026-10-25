type AnalyticsEventName = 'product_view' | 'search' | 'filter' | 'compare' | 'add_to_cart' | 'begin_checkout' | 'purchase'

type AnalyticsEvent = {
  product_id?: number
  variant_id?: number | null
  promotion_id?: number | null
  order_id?: number
  properties?: { query?: string; result_count?: number; filter_names?: string[]; quantity?: number; currency?: 'EGP'; value?: number }
}

export const useAnalytics = () => {
  const { request } = useApi()
  const { preferences } = useConsent()
  const sessionId = useState<string>('3b-analytics-session', () => '')

  const ensureSessionId = () => {
    if (!import.meta.client) return ''
    if (!sessionId.value) {
      sessionId.value = localStorage.getItem('3b-analytics-session') || crypto.randomUUID()
      localStorage.setItem('3b-analytics-session', sessionId.value)
    }
    return sessionId.value
  }

  const track = async (eventName: AnalyticsEventName, event: AnalyticsEvent = {}) => {
    const consent = preferences.value
    if (!import.meta.client || !consent) return
    const eventId = crypto.randomUUID()

    if (consent.analytics) {
      const payload = {
        event_id: eventId,
        event_name: eventName,
        session_id: ensureSessionId(),
        consent: { analytics: true, marketing: consent.marketing },
        ...event,
      }
      try {
        await request('/analytics/events', { method: 'POST', body: payload })
      } catch {
        // Marketing relays remain independent from first-party analytics consent.
      }
    }

    if (!consent.marketing) return
    const map: Partial<Record<AnalyticsEventName, { meta: string; tiktok: string }>> = {
      product_view: { meta: 'ViewContent', tiktok: 'ViewContent' },
      add_to_cart: { meta: 'AddToCart', tiktok: 'AddToCart' },
      begin_checkout: { meta: 'InitiateCheckout', tiktok: 'InitiateCheckout' },
      purchase: { meta: 'Purchase', tiktok: 'CompletePayment' },
    }
    const marketingEvent = map[eventName]
    if (!marketingEvent) return
    const eventSourceUrl = window.location.href
    const customData = {
      content_ids: event.product_id ? [String(event.product_id)] : [],
      content_type: 'product',
      value: event.properties?.value,
      currency: event.properties?.currency || 'EGP',
      num_items: event.properties?.quantity,
    }
    await Promise.allSettled([
      request('/tracking/meta-event', { method: 'POST', body: { event_name: marketingEvent.meta, event_id: eventId, event_source_url: eventSourceUrl, custom_data: customData, consent: { marketing: true } } }),
      request('/tracking/tiktok-event', { method: 'POST', body: { event_name: marketingEvent.tiktok, event_id: eventId, event_source_url: eventSourceUrl, properties: customData, consent: { marketing: true } } }),
    ])
  }

  return { track }
}
