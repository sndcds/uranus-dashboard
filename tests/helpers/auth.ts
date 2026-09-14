import { vi } from 'vitest'
import { Storage } from 'happy-dom'

export const profile = { user_uuid: '01994126-6680-7000-8000-000000000001', display_name: 'Ada' }
export const jsonResponse = (data: unknown, status = 200) => new Response(JSON.stringify(data), {
  status, headers: { 'Content-Type': 'application/json' },
})
export const profileResponse = () => jsonResponse({ data: profile })

export function installSessionLocks() {
  vi.stubGlobal('localStorage', new Storage())
  let queue = Promise.resolve()
  const request = vi.fn((_name: string, callback: () => Promise<unknown>) => {
    const result = queue.then(callback)
    queue = result.then(() => {}, () => {})
    return result
  })
  vi.stubGlobal('navigator', { locks: { request } })
  return request
}

export function deferred<T>() {
  let resolve!: (value: T) => void
  let reject!: (reason: unknown) => void
  const promise = new Promise<T>((ok, fail) => { resolve = ok; reject = fail })
  return { promise, resolve, reject }
}

export function restoreAuthGlobals() {
  vi.unstubAllGlobals()
  // The shared setup hook runs after suite cleanup and expects browser storage.
  vi.stubGlobal('localStorage', new Storage())
  vi.restoreAllMocks()
}
