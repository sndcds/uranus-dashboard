import { mount } from '@vue/test-utils'
import { createI18n } from 'vue-i18n'
import { describe, expect, it } from 'vitest'
import UranusUrlInput from '@/component/ui/UranusUrlInput.vue'
import { uranusI18nStandardTranslations } from '@/i18n/standard'
import { validateHttpUrl } from '@/util/url'

function mountInput(modelValue: string | null = '', required = false) {
  return mount(UranusUrlInput, {
    props: { id: 'website', label: 'Website', modelValue, required },
    global: {
      plugins: [createI18n({
        legacy: false,
        locale: 'de',
        messages: {
          de: Object.fromEntries(Object.entries(uranusI18nStandardTranslations).map(([key, value]) => [key, value.de])),
        },
      })],
    },
  })
}

describe('HTTP URL validation', () => {
  it.each([
    '', null, 'https://example.com', 'http://example.com/path?q=test#section',
    'HTTPS://example.com', 'https://münchen.de/kultur', 'http://localhost:3000',
    'http://127.0.0.1:8080', 'https://[::1]:443/', '  https://example.com  ',
  ])('accepts %s', (value) => {
    expect(validateHttpUrl(value)).toBe('valid')
  })

  it.each([
    'example.com', 'www.example.com/path?q=test#section', '//example.com/path',
    'localhost:3000', 'example.com:8080/path', '[::1]:3000/path',
  ])('offers a protocol for %s', (value) => {
    expect(validateHttpUrl(value)).toBe('missing-protocol')
  })

  it.each([
    'https://', 'http://', 'https:///example.com', 'https://?query',
    'https://#fragment', 'https://exa mple.com', 'https://example.com/a b',
    'https://exam\nple.com', 'https://example.com:99999', 'https://[invalid]',
    'https://example.com\\path', 'http:example.com', 'https:/example.com',
    'ftp://example.com', 'mailto:user@example.com', 'javascript:alert(1)',
    'not a URL', '/relative/path',
  ])('rejects %s', (value) => {
    expect(validateHttpUrl(value)).toBe('invalid')
  })
})

describe('UranusUrlInput', () => {
  it.each(['https://', 'http://'])('lets users prepend %s and clears the error', async (protocol) => {
    const wrapper = mountInput()
    await wrapper.get('input').setValue('example.com/path')
    expect(wrapper.text()).toContain('Der URL fehlt das Protokoll')
    expect(wrapper.get('input').element.checkValidity()).toBe(false)
    const button = wrapper.findAll('button').find((item) => item.text() === `${protocol} voranstellen`)!
    expect(button.attributes('type')).toBe('button')
    await button.trigger('click')
    expect(wrapper.emitted('update:modelValue')?.at(-1)).toEqual([`${protocol}example.com/path`])
    expect(wrapper.get('input').element.checkValidity()).toBe(true)
    expect(wrapper.findAll('button')).toHaveLength(0)
    expect(wrapper.find('[aria-live]').exists()).toBe(false)
  })

  it('trims input and preserves the path, query and fragment', async () => {
    const wrapper = mountInput()
    const url = 'https://example.com/path?q=a%20b#section'
    await wrapper.get('input').setValue(`  ${url}  `)
    expect(wrapper.emitted('update:modelValue')?.at(-1)).toEqual([url])
    expect(wrapper.get('input').element.value).toBe(url)
    expect(wrapper.vm.validate()).toBe(true)
  })

  it('rejects other protocols and connects the error to the input', async () => {
    const wrapper = mountInput('ftp://example.com')
    expect(wrapper.vm.validate()).toBe(false)
    expect(wrapper.get('input').attributes('aria-describedby')).toBe('website-message')
    expect(wrapper.get('#website-message').text()).toContain('gültige URL')
    expect(wrapper.findAll('button')).toHaveLength(0)
    await wrapper.setProps({ modelValue: 'https://example.com' })
    expect(wrapper.get('input').element.value).toBe('https://example.com')
    expect(wrapper.vm.validate()).toBe(true)
    expect(wrapper.find('#website-message').exists()).toBe(false)
  })

  it('allows clearing optional URLs and validates required URLs', async () => {
    const wrapper = mountInput(null)
    expect(wrapper.vm.validate()).toBe(true)
    expect(wrapper.emitted('update:modelValue')).toBeUndefined()
    await wrapper.setProps({ modelValue: 'https://example.com' })
    await wrapper.get('input').setValue('   ')
    expect(wrapper.emitted('update:modelValue')?.at(-1)).toEqual([''])
    expect(wrapper.vm.validate()).toBe(true)
    await wrapper.setProps({ required: true })
    expect(wrapper.vm.validate()).toBe(false)
    await wrapper.get('input').trigger('blur')
    expect(wrapper.get('#website-message').text()).toBe('Pflichtfeld')
  })

  it('normalizes protocol-relative URLs without duplicating slashes', async () => {
    const wrapper = mountInput('//example.com/path')
    await wrapper.get('button').trigger('click')
    expect(wrapper.emitted('update:modelValue')?.at(-1)).toEqual(['https://example.com/path'])
  })

  it.each(['disabled', 'readonly'] as const)('respects %s for protocol selection', async (prop) => {
    const wrapper = mountInput('example.com')
    await wrapper.setProps({ [prop]: true })
    expect(wrapper.get('input').attributes(prop)).toBeDefined()
    expect(wrapper.findAll('button').every((button) => button.element.disabled)).toBe(true)
  })
})
