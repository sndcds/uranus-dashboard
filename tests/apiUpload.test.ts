import { createPinia, disposePinia, setActivePinia } from 'pinia'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { apiFetch } from '@/api.ts'
import { SESSION_STATE_KEY } from '@/api/authSession.ts'
import { useTokenStore } from '@/store/uranusTokenStore.ts'
import { installSessionLocks, restoreAuthGlobals } from './helpers/auth'

class UploadRequest extends EventTarget {
  static requests: UploadRequest[] = []
  upload = new EventTarget()
  withCredentials = false
  status = 200
  statusText = 'OK'
  responseText = '{}'
  headers = new Headers()
  open = vi.fn()
  send = vi.fn()
  abort = vi.fn(() => {
    this.dispatchEvent(new Event('abort'))
    this.dispatchEvent(new Event('loadend'))
  })
  setRequestHeader = vi.fn((name: string, value: string) => this.headers.set(name, value))
  getAllResponseHeaders = () => 'content-type: application/json\r\n'

  constructor() {
    super()
    UploadRequest.requests.push(this)
  }

  respond(status = 200, body = { data: { saved: true } }) {
    this.status = status
    this.responseText = JSON.stringify(body)
    this.dispatchEvent(new Event('load'))
    this.dispatchEvent(new Event('loadend'))
  }
}

let pinia: ReturnType<typeof createPinia>
beforeEach(() => {
  installSessionLocks()
  pinia = createPinia()
  setActivePinia(pinia)
  UploadRequest.requests = []
  vi.stubGlobal('XMLHttpRequest', UploadRequest)
})
afterEach(() => {
  disposePinia(pinia)
  restoreAuthGlobals()
})

describe('multipart uploads with progress', () => {
  it('reports measured progress, unknown lengths and transfer completion with cookie authentication', async () => {
    const progress = vi.fn()
    const body = new FormData()
    body.append('file', new File(['image'], 'image.png'))
    const result = apiFetch('/api/admin/image/event/event-1/banner', {
      method: 'PUT', body, onUploadProgress: progress,
      headers: { Authorization: 'Bearer legacy' },
    })
    const request = UploadRequest.requests[0]!
    expect(request.open).toHaveBeenCalledWith('PUT', '/api/admin/image/event/event-1/banner')
    expect(request.withCredentials).toBe(true)
    expect(request.headers.has('Authorization')).toBe(false)
    expect(request.headers.has('Content-Type')).toBe(false)
    expect(request.send).toHaveBeenCalledWith(body)
    expect(progress).toHaveBeenLastCalledWith(0)
    request.upload.dispatchEvent(new ProgressEvent('progress', { lengthComputable: true, loaded: 40, total: 100 }))
    expect(progress).toHaveBeenLastCalledWith(40)
    request.upload.dispatchEvent(new ProgressEvent('progress', { lengthComputable: false, loaded: 50 }))
    expect(progress).toHaveBeenLastCalledWith(null)
    request.upload.dispatchEvent(new Event('load'))
    expect(progress).toHaveBeenLastCalledWith(100)
    request.respond()
    await expect(result).resolves.toMatchObject({ data: { saved: true } })
  })

  it('restarts progress after a 401, renews the session and only retries once', async () => {
    const restore = vi.spyOn(useTokenStore(), 'restoreSession').mockResolvedValue(true)
    const progress = vi.fn()
    const result = apiFetch('/api/admin/image/event/event-1/banner', {
      method: 'PUT', body: new FormData(), onUploadProgress: progress,
    })
    UploadRequest.requests[0]!.respond(401)
    await vi.waitFor(() => expect(UploadRequest.requests).toHaveLength(2))
    expect(restore).toHaveBeenCalledTimes(1)
    expect(progress).toHaveBeenLastCalledWith(0)
    UploadRequest.requests[1]!.respond(401)
    await expect(result).rejects.toMatchObject({ status: 401 })
    expect(UploadRequest.requests).toHaveLength(2)
  })

  it.each([413, 500])('preserves API error status %s', async (status) => {
    const result = apiFetch('/api/admin/image/event/event-1/banner', {
      method: 'PUT', body: new FormData(), onUploadProgress: vi.fn(),
    })
    UploadRequest.requests[0]!.respond(status)
    await expect(result).rejects.toMatchObject({ status })
  })

  it('rejects network errors and aborted requests', async () => {
    const options = { method: 'PUT', body: new FormData(), onUploadProgress: vi.fn() }
    const failed = apiFetch('/api/admin/image/event/event-1/banner', options)
    UploadRequest.requests[0]!.dispatchEvent(new Event('error'))
    await expect(failed).rejects.toThrow('Upload failed')

    const controller = new AbortController()
    const aborted = apiFetch('/api/admin/image/event/event-1/banner', { ...options, signal: controller.signal })
    controller.abort()
    await expect(aborted).rejects.toMatchObject({ name: 'AbortError' })
    expect(UploadRequest.requests[1]!.abort).toHaveBeenCalledOnce()
  })

  it('rejects upload results from a previous session', async () => {
    localStorage.setItem(SESSION_STATE_KEY, JSON.stringify({ version: 'before', signedOut: false }))
    const result = apiFetch('/api/admin/image/event/event-1/banner', {
      method: 'PUT', body: new FormData(), onUploadProgress: vi.fn(),
    })
    localStorage.setItem(SESSION_STATE_KEY, JSON.stringify({ version: 'after', signedOut: true }))
    UploadRequest.requests[0]!.respond()
    await expect(result).rejects.toMatchObject({ reason: 'changed' })
  })
})
