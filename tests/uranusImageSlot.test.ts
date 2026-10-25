import { flushPromises, shallowMount } from '@vue/test-utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createI18n } from 'vue-i18n'
import { apiFetch, ApiError, type ApiResponse } from '@/api.ts'
import { loadPlutoImage } from '@/domain/image/plutoImage.model.ts'
import UranusImageSlot from '@/component/image/UranusImageSlot.vue'
import UranusImageEditDialog from '@/component/image/UranusImageEditDialog.vue'
import de from '@/i18n/json/de.json'

vi.mock('@/api.ts', async (importOriginal) => ({
  ...await importOriginal<typeof import('@/api.ts')>(),
  apiFetch: vi.fn(),
}))
vi.mock('@/domain/image/plutoImage.model.ts', () => ({ loadPlutoImage: vi.fn() }))

const context = { context: 'event', contextUuid: 'event-1', identifier: 'banner' }
const savedResponse: ApiResponse<never> = {
  service: 'image', api_version: '1', response_type: 'success', status: 200, timestamp: '',
}

function deferred<T = void>() {
  let resolve!: (value: T) => void
  let reject!: (reason: unknown) => void
  const promise = new Promise<T>((res, rej) => { resolve = res; reject = rej })
  return { promise, resolve, reject }
}

async function openSlot() {
  const wrapper = shallowMount(UranusImageSlot, {
    props: context,
    global: { plugins: [createI18n({ legacy: false, locale: 'de', messages: { de } })] },
  })
  await flushPromises()
  await wrapper.get('.image-wrapper').trigger('click')
  return wrapper
}

beforeEach(() => {
  vi.mocked(apiFetch).mockReset()
  vi.mocked(loadPlutoImage).mockReset().mockResolvedValue(null)
})

describe('image slot saving state', () => {
  it('keeps the dialog busy through upload and preview refresh and prevents duplicate saves and closing', async () => {
    const upload = deferred<ApiResponse<never>>()
    const reload = deferred()
    vi.mocked(apiFetch).mockReturnValue(upload.promise)
    const wrapper = await openSlot()
    vi.mocked(loadPlutoImage).mockImplementationOnce(async () => { await reload.promise; return null })
    const dialog = wrapper.getComponent(UranusImageEditDialog)
    dialog.vm.$emit('save', { uuid: null }, new File(['image'], 'image.png'), context)
    await wrapper.vm.$nextTick()
    expect(dialog.props('isSaving')).toBe(true)
    expect(dialog.props('isUploading')).toBe(true)

    const options = vi.mocked(apiFetch).mock.calls[0]![1]!
    options.onUploadProgress!(42)
    await wrapper.vm.$nextTick()
    expect(dialog.props('uploadProgress')).toBe(42)
    dialog.vm.$emit('save', { uuid: null }, null, context)
    dialog.vm.$emit('close')
    await wrapper.vm.$nextTick()
    expect(apiFetch).toHaveBeenCalledTimes(1)
    expect(wrapper.findComponent(UranusImageEditDialog).exists()).toBe(true)

    options.onUploadProgress!(100)
    await wrapper.vm.$nextTick()
    expect(dialog.props('isUploading')).toBe(false)
    expect(dialog.props('isSaving')).toBe(true)
    upload.resolve(savedResponse)
    await flushPromises()
    expect(dialog.props('isSaving')).toBe(true)
    reload.resolve()
    await flushPromises()
    expect(wrapper.findComponent(UranusImageEditDialog).exists()).toBe(false)
    wrapper.unmount()
  })

  it.each([new ApiError('Too large', 413), new TypeError('offline')])('clears the busy state after %s and allows a metadata-only retry', async (error) => {
    const upload = deferred<ApiResponse<never>>()
    vi.mocked(apiFetch).mockReturnValue(upload.promise)
    const wrapper = await openSlot()
    const dialog = wrapper.getComponent(UranusImageEditDialog)
    dialog.vm.$emit('save', { uuid: null }, new File(['image'], 'image.png'), context)
    upload.reject(error)
    await flushPromises()
    expect(dialog.props('isSaving')).toBe(false)
    expect(dialog.props('uploadProgress')).toBeNull()
    expect(dialog.props('errorMessage')).toBe(error instanceof ApiError ? de.image_file_too_large : de.image_save_failed)

    const retry = deferred<ApiResponse<never>>()
    vi.mocked(apiFetch).mockReturnValue(retry.promise)
    dialog.vm.$emit('save', { uuid: null }, null, context)
    await wrapper.vm.$nextTick()
    expect(dialog.props('isSaving')).toBe(true)
    expect(dialog.props('isUploading')).toBe(false)
    expect(dialog.props('errorMessage')).toBeNull()
    expect(vi.mocked(apiFetch).mock.calls[1]![1]!.onUploadProgress).toBeUndefined()
    retry.resolve(savedResponse)
    await flushPromises()
    expect(wrapper.findComponent(UranusImageEditDialog).exists()).toBe(false)
    wrapper.unmount()
  })
})
