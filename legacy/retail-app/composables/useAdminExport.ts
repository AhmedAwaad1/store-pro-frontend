type AdminExportState = {
  id: string
  type: string
  status: 'queued' | 'processing' | 'completed' | 'failed'
  rows_count: number
  file_name?: string
  error_message?: string | null
}

export const useAdminExport = () => {
  const { request } = useApi()
  const config = useRuntimeConfig()
  const current = ref<AdminExportState | null>(null)
  const error = ref('')
  let pollTimer: ReturnType<typeof setTimeout> | undefined

  const busy = computed(() => current.value?.status === 'queued' || current.value?.status === 'processing')

  async function poll(statusPath: string, exportId: string) {
    try {
      const response = await request<AdminExportState>(`${statusPath}/${exportId}/status`)
      current.value = response.data
      if (current.value.status === 'queued' || current.value.status === 'processing') {
        pollTimer = setTimeout(() => poll(statusPath, exportId), 2000)
      }
    } catch (exception: any) {
      error.value = exception?.data?.message || 'Could not check export progress.'
    }
  }

  async function start(createPath: string, statusPath: string, filters: Record<string, string> = {}) {
    if (pollTimer) clearTimeout(pollTimer)
    current.value = null
    error.value = ''
    const response = await request<AdminExportState>(createPath, { method: 'POST', body: filters })
    current.value = response.data
    await poll(statusPath, response.data.id)
  }

  async function download(path: string) {
    if (!current.value || current.value.status !== 'completed') return
    const response = await fetch(`${config.public.apiBase}${path}/${current.value.id}/download`, {
      credentials: 'include',
      headers: { Accept: 'text/csv' },
    })
    if (!response.ok) throw new Error('The export file could not be downloaded.')
    const objectUrl = URL.createObjectURL(await response.blob())
    const link = document.createElement('a')
    link.href = objectUrl
    link.download = current.value.file_name || '3b-export.csv'
    link.click()
    URL.revokeObjectURL(objectUrl)
  }

  onScopeDispose(() => {
    if (pollTimer) clearTimeout(pollTimer)
  })

  return { current, busy, error, start, download }
}
