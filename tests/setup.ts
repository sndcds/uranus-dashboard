import { afterEach, vi } from 'vitest'
import { config } from '@vue/test-utils'

afterEach(() => {
  vi.clearAllMocks()
  localStorage.clear()
})

Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
})

class ResizeObserverMock {
  observe = vi.fn()
  unobserve = vi.fn()
  disconnect = vi.fn()
}

class IntersectionObserverMock {
  observe = vi.fn()
  unobserve = vi.fn()
  disconnect = vi.fn()
}

vi.stubGlobal('ResizeObserver', ResizeObserverMock)
vi.stubGlobal('IntersectionObserver', IntersectionObserverMock)

window.requestAnimationFrame = window.requestAnimationFrame ?? ((callback) => window.setTimeout(callback, 0))

config.global.stubs = {
  RouterLink: {
    props: ['to'],
    template: '<a><slot /></a>',
  },
}
