import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import { createI18n } from 'vue-i18n'
import MarkdownPreviewComponent from '../../src/components/MarkdownPreviewComponent.vue'

const i18n = createI18n({
  legacy: false,
  locale: 'en',
  messages: {
    en: {
      markdown_empty: 'No content',
    },
  },
})

describe('MarkdownPreviewComponent', () => {
  const createWrapper = (value: string = '') => {
    return mount(MarkdownPreviewComponent, {
      props: { value },
      global: {
        plugins: [i18n],
      },
    })
  }

  it('renders empty state when no content provided', () => {
    const wrapper = createWrapper('')
    expect(wrapper.find('.empty').exists()).toBe(true)
    expect(wrapper.text()).toContain('No content')
  })

  it('renders basic text content', () => {
    const wrapper = createWrapper('Hello World')
    expect(wrapper.html()).toContain('Hello World')
  })

  describe('Headings', () => {
    it('renders h1 headers correctly', () => {
      const wrapper = createWrapper('# Main Title')
      expect(wrapper.find('h1').exists()).toBe(true)
      expect(wrapper.find('h1').text()).toBe('Main Title')
    })

    it('renders h2 headers correctly', () => {
      const wrapper = createWrapper('## Section Title')
      expect(wrapper.find('h2').exists()).toBe(true)
      expect(wrapper.find('h2').text()).toBe('Section Title')
    })

    it('renders h3 headers correctly', () => {
      const wrapper = createWrapper('### Subsection')
      expect(wrapper.find('h3').exists()).toBe(true)
      expect(wrapper.find('h3').text()).toBe('Subsection')
    })
  })

  describe('Text Formatting', () => {
    it('renders bold text', () => {
      const wrapper = createWrapper('This is **bold** text')
      expect(wrapper.find('strong').exists()).toBe(true)
      expect(wrapper.find('strong').text()).toBe('bold')
    })

    it('renders italic text', () => {
      const wrapper = createWrapper('This is *italic* text')
      expect(wrapper.find('em').exists()).toBe(true)
      expect(wrapper.find('em').text()).toBe('italic')
    })

    it('renders inline code', () => {
      const wrapper = createWrapper('Use `console.log()` for debugging')
      expect(wrapper.find('code').exists()).toBe(true)
      expect(wrapper.find('code').text()).toBe('console.log()')
    })

    it('renders combined formatting', () => {
      const wrapper = createWrapper('**Bold** and *italic* with `code`')
      expect(wrapper.find('strong').exists()).toBe(true)
      expect(wrapper.find('em').exists()).toBe(true)
      expect(wrapper.find('code').exists()).toBe(true)
    })
  })

  describe('Lists', () => {
    it('renders unordered lists', () => {
      const content = `- First item
- Second item
- Third item`
      const wrapper = createWrapper(content)
      expect(wrapper.find('ul').exists()).toBe(true)
      const items = wrapper.findAll('li')
      expect(items).toHaveLength(3)
      expect(items[0].text()).toBe('First item')
      expect(items[1].text()).toBe('Second item')
      expect(items[2].text()).toBe('Third item')
    })

    it('renders ordered lists', () => {
      const content = `1. First step
2. Second step
3. Third step`
      const wrapper = createWrapper(content)
      expect(wrapper.find('ol').exists()).toBe(true)
      const items = wrapper.findAll('li')
      expect(items).toHaveLength(3)
      expect(items[0].text()).toBe('First step')
      expect(items[1].text()).toBe('Second step')
      expect(items[2].text()).toBe('Third step')
    })
  })

  describe('Tables', () => {
    it('renders simple table correctly', () => {
      const content = `| Name | Age |
| --- | --- |
| Alice | 30 |
| Bob | 25 |`
      const wrapper = createWrapper(content)
      
      expect(wrapper.find('table').exists()).toBe(true)
      expect(wrapper.find('thead').exists()).toBe(true)
      expect(wrapper.find('tbody').exists()).toBe(true)
      
      const headers = wrapper.findAll('th')
      expect(headers).toHaveLength(2)
      expect(headers[0].text()).toBe('Name')
      expect(headers[1].text()).toBe('Age')
      
      const rows = wrapper.findAll('tbody tr')
      expect(rows).toHaveLength(2)
      
      const firstRowCells = rows[0].findAll('td')
      expect(firstRowCells[0].text()).toBe('Alice')
      expect(firstRowCells[1].text()).toBe('30')
    })

    it('renders table with alignment', () => {
      const content = `| Left | Center | Right |
| :--- | :---: | ---: |
| L1 | C1 | R1 |`
      const wrapper = createWrapper(content)
      
      const headers = wrapper.findAll('th')
      expect(headers[0].attributes('style')).toContain('left')
      expect(headers[1].attributes('style')).toContain('center')
      expect(headers[2].attributes('style')).toContain('right')
    })

    it('handles empty table cells', () => {
      const content = `| A | B |
| --- | --- |
| | X |`
      const wrapper = createWrapper(content)
      
      const cells = wrapper.findAll('tbody td')
      expect(cells).toHaveLength(2)
      expect(cells[0].html()).toContain('&nbsp;')
      expect(cells[1].text()).toBe('X')
    })
  })

  describe('Line Breaks and Paragraphs', () => {
    it('converts single line breaks to <br> tags', () => {
      const wrapper = createWrapper('Line 1\nLine 2')
      expect(wrapper.html()).toContain('<br')
    })

    it('converts double line breaks to paragraphs', () => {
      const wrapper = createWrapper('Paragraph 1\n\nParagraph 2')
      // Component wraps second paragraph
      expect(wrapper.html()).toContain('<p>Paragraph 2</p>')
    })
  })

  describe('HTML Escaping', () => {
    it('escapes HTML special characters', () => {
      const wrapper = createWrapper('<script>alert("xss")</script>')
      expect(wrapper.html()).not.toContain('<script>')
      expect(wrapper.html()).toContain('&lt;script&gt;')
    })

    it('escapes ampersands', () => {
      const wrapper = createWrapper('A & B')
      expect(wrapper.html()).toContain('&amp;')
    })

    it('escapes quotes in attributes but not in content', () => {
      const wrapper = createWrapper('Say "hello"')
      // Vue renders the content with quotes, not escaped in v-html output
      expect(wrapper.text()).toContain('Say "hello"')
    })
  })

  describe('Mixed Content', () => {
    it('renders complex markdown with multiple elements', () => {
      const content = `# Title

This is a **bold** paragraph with *italic* text.

## List
- Item 1
- Item 2

\`code example\``
      
      const wrapper = createWrapper(content)
      
      expect(wrapper.find('h1').exists()).toBe(true)
      expect(wrapper.find('h2').exists()).toBe(true)
      expect(wrapper.find('strong').exists()).toBe(true)
      expect(wrapper.find('em').exists()).toBe(true)
      expect(wrapper.find('ul').exists()).toBe(true)
      expect(wrapper.find('code').exists()).toBe(true)
    })
  })

  describe('Edge Cases', () => {
    it('handles malformed markdown gracefully', () => {
      const wrapper = createWrapper('**unclosed bold')
      // Component will try to parse it, converting ** to italic markers
      // Just verify it doesn't crash and renders something
      expect(wrapper.exists()).toBe(true)
      expect(wrapper.text()).toContain('unclosed bold')
    })

    it('handles very long content', () => {
      const longContent = 'A'.repeat(10000)
      const wrapper = createWrapper(longContent)
      expect(wrapper.html()).toContain('A')
    })

    it('handles content with only whitespace', () => {
      const wrapper = createWrapper('   \n\n   ')
      expect(wrapper.exists()).toBe(true)
    })
  })
})
