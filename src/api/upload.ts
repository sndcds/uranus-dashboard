export type UploadProgressHandler = (percentage: number | null) => void

interface UploadOptions {
    method: string
    body: FormData
    headers: Headers
    signal: AbortSignal | null | undefined
}

/** Multipart transport for protected uploads that need browser progress events. */
export function uploadForm(
    url: string,
    options: UploadOptions,
    onProgress: UploadProgressHandler
): Promise<Response> {
    return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest()
        const abort = () => {
            xhr.abort()
            reject(options.signal?.reason ?? new DOMException('Upload aborted', 'AbortError'))
        }

        if (options.signal?.aborted) {
            abort()
            return
        }

        xhr.upload.addEventListener('progress', (event) => {
            onProgress(event.lengthComputable && event.total > 0
                ? Math.min(100, Math.floor(event.loaded / event.total * 100))
                : null)
        })
        xhr.upload.addEventListener('load', () => onProgress(100))
        xhr.addEventListener('load', () => {
            try {
                const headers = new Headers()
                for (const line of xhr.getAllResponseHeaders().trim().split(/[\r\n]+/)) {
                    const separator = line.indexOf(':')
                    if (separator > 0) headers.append(line.slice(0, separator), line.slice(separator + 1).trim())
                }
                resolve(new Response([204, 205, 304].includes(xhr.status) ? null : xhr.responseText, {
                    status: xhr.status,
                    statusText: xhr.statusText,
                    headers,
                }))
            } catch (error) {
                reject(error)
            }
        })
        xhr.addEventListener('error', () => reject(new TypeError('Upload failed')))
        xhr.addEventListener('timeout', () => reject(new TypeError('Upload timed out')))
        xhr.addEventListener('abort', () => reject(options.signal?.reason ?? new DOMException('Upload aborted', 'AbortError')))
        xhr.addEventListener('loadend', () => options.signal?.removeEventListener('abort', abort))

        xhr.open(options.method, url)
        xhr.withCredentials = true
        options.headers.forEach((value, name) => xhr.setRequestHeader(name, value))
        options.signal?.addEventListener('abort', abort, { once: true })
        onProgress(0)
        xhr.send(options.body)
    })
}
