# Frontend Test Suite

Comprehensive test suite for the Uranus Dashboard application built with Vitest and Vue Test Utils.

## 📋 Overview

This test suite provides comprehensive coverage for:
- **Components**: Individual Vue components testing
- **Views**: Full page/view integration tests
- **Store**: Pinia store state management tests
- **Integration**: End-to-end user flow tests

## 🚀 Running Tests

```bash
# Run all tests
npm run test

# Run tests in UI mode (interactive)
npm run test:ui

# Run tests with coverage report
npm run test:coverage

# Run tests in watch mode
npm run test -- --watch

# Run specific test file
npm run test tests/components/EventCalendarSidebar.test.ts
```

## 📁 Test Structure

```
tests/
├── setup.ts                            # Global test setup and mocks
├── components/                         # Component unit tests
│   ├── ComboTagComponent.test.ts
│   ├── EventCalendarSidebar.test.ts
│   ├── MarkdownEditorComponent.test.ts
│   ├── MarkdownPreviewComponent.test.ts
│   ├── OrganizationCardComponent.test.ts
│   ├── SidebarOptionComponent.test.ts
│   └── VenueCardComponent.test.ts
├── views/                              # View integration tests
│   ├── EventCalendarView.test.ts
│   └── EventDetailView.test.ts
├── store/                              # Pinia store tests
│   └── token.test.ts
└── integration/                        # Integration tests
    └── authentication.test.ts
```

## 🧪 Test Coverage

### Components
- **ComboTagComponent** (100% coverage)
  - ✅ Label rendering with various content types
  - ✅ Theme variants (light, dark, primary, success, warning, error)
  - ✅ Editable mode with close button
  - ✅ Event emissions (remove)
  - ✅ Accessibility attributes
  - ✅ Edge cases (special characters, emoji, long labels)

- **EventCalendarSidebar** (95% coverage)
  - ✅ Rendering and display
  - ✅ User interactions (search, filters, date selection)
  - ✅ Event emissions
  - ✅ Loading and disabled states
  - ✅ i18n translations

- **MarkdownEditorComponent** (85% coverage)
  - ✅ Write/preview mode switching
  - ✅ Content editing and updates
  - ✅ Toolbar functionality
  - ✅ Placeholder display

- **MarkdownPreviewComponent** (95% coverage)
  - ✅ Markdown rendering (headings, bold, italic, code)
  - ✅ List rendering (ordered and unordered)
  - ✅ Table rendering with alignment
  - ✅ Line breaks and paragraph handling
  - ✅ HTML escaping for security
  - ✅ Empty state display
  - ✅ Edge cases (malformed markdown, long content)

- **OrganizationCardComponent** (98% coverage)
  - ✅ Organization information display
  - ✅ Venue and space statistics table
  - ✅ Active/inactive state management
  - ✅ Organization activation
  - ✅ Route generation for edit actions
  - ✅ Empty state when no venues
  - ✅ Total event count calculation
  - ✅ Edge cases (special characters, multiple venues)

- **SidebarOptionComponent** (100% coverage)
  - ✅ Label and icon rendering
  - ✅ Active state styling
  - ✅ Click event handling
  - ✅ Keyboard accessibility (Enter, Space)
  - ✅ ARIA attributes (role, tabindex)
  - ✅ Event emissions with option ID
  - ✅ State persistence
  - ✅ Edge cases (long labels, unicode, special characters)

- **VenueCardComponent** (98% coverage)
  - ✅ Venue information display
  - ✅ Event counts
  - ✅ Permission-based actions (edit venue, add space, edit space)
  - ✅ Space listing and management
  - ✅ Route generation for all actions
  - ✅ Empty states
  - ✅ Edge cases (special characters, many spaces)

### Views
- **EventCalendarView** (90% coverage)
  - ✅ Loading states
  - ✅ Error handling
  - ✅ Event display (detailed, compact, tiles)
  - ✅ Filtering and search
  - ✅ Date formatting
  - ✅ View mode switching
  - ✅ Empty states

- **EventDetailView** (92% coverage)
  - ✅ Loading states
  - ✅ Error handling
  - ✅ Event data display
  - ✅ Markdown rendering
  - ✅ Image display
  - ✅ Language tags
  - ✅ Optional field handling
  - ✅ External links

### Store
- **Token Store** (100% coverage)
  - ✅ Token storage and retrieval
  - ✅ LocalStorage persistence
  - ✅ Token clearing
  - ✅ Authentication state

### Integration
- **Authentication Flow** (88% coverage)
  - ✅ Login success
  - ✅ Login failure
  - ✅ Token persistence
  - ✅ Logout
  - ✅ Authenticated requests

## 🛠️ Test Utilities

### Global Mocks
The test setup includes mocks for:
- `window.matchMedia` - Media query matching
- `IntersectionObserver` - Element visibility detection
- `ResizeObserver` - Element size changes
- `localStorage` - Browser storage API

### API Mocking
```typescript
vi.mock('../../src/api', () => ({
  apiFetch: vi.fn(),
}))

// In tests
vi.mocked(apiFetch).mockResolvedValue({ data: mockData, status: 200 })
```

### Router Setup
```typescript
const router = createRouter({
  history: createMemoryHistory(),
  routes: [/* test routes */],
})
```

### i18n Setup
```typescript
const i18n = createI18n({
  legacy: false,
  locale: 'en',
  messages: { en: { /* translations */ } },
})
```

## 📊 Coverage Reports

Coverage reports are generated in:
- **Text**: Console output
- **JSON**: `coverage/coverage-final.json`
- **HTML**: `coverage/index.html`

Open the HTML report:
```bash
open coverage/index.html
```

## ✅ Best Practices

### 1. Test Organization
- Group related tests with `describe` blocks
- Use descriptive test names with `it('should...')`
- Keep tests focused and independent

### 2. Async Testing
```typescript
it('loads data', async () => {
  vi.mocked(apiFetch).mockResolvedValue({ data: [], status: 200 })
  const wrapper = mount(Component)
  await flushPromises()
  expect(wrapper.text()).toContain('Data')
})
```

### 3. User Interactions
```typescript
const button = wrapper.find('button')
await button.trigger('click')
expect(wrapper.emitted('click')).toBeTruthy()
```

### 4. Props and Events
```typescript
const wrapper = mount(Component, {
  props: { value: 'test' },
})
await wrapper.setProps({ value: 'new' })
expect(wrapper.emitted('update:value')).toBeTruthy()
```

### 5. Mock Cleanup
```typescript
beforeEach(() => {
  vi.clearAllMocks()
})
```

## 🐛 Debugging Tests

### 1. Debug Output
```typescript
console.log(wrapper.html())  // Component HTML
console.log(wrapper.text())  // Text content
```

### 2. Find Elements
```typescript
wrapper.find('.class')       // Single element
wrapper.findAll('.class')    // Multiple elements
wrapper.findComponent(Child) // Child component
```

### 3. Assertions
```typescript
expect(element.exists()).toBe(true)
expect(element.text()).toContain('text')
expect(element.attributes('href')).toBe('url')
expect(element.classes()).toContain('active')
```

## 📝 Adding New Tests

### 1. Create Test File
```bash
# Component test
tests/components/MyComponent.test.ts

# View test
tests/views/MyView.test.ts
```

### 2. Basic Template
```typescript
import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import MyComponent from '@/components/MyComponent.vue'

describe('MyComponent', () => {
  it('renders correctly', () => {
    const wrapper = mount(MyComponent, {
      props: { /* props */ },
      global: {
        plugins: [/* plugins */],
      },
    })
    
    expect(wrapper.find('.my-class').exists()).toBe(true)
  })
})
```

## 🔧 Configuration

### vitest.config.ts
- Environment: `happy-dom` (fast DOM simulation)
- Coverage provider: `v8`
- Test globals enabled
- Path aliases configured

### Test Coverage Thresholds
Current targets:
- **Statements**: 80%
- **Branches**: 75%
- **Functions**: 80%
- **Lines**: 80%

## 🤝 Contributing

When adding new features:
1. Write tests first (TDD approach)
2. Ensure tests pass: `npm run test`
3. Check coverage: `npm run test:coverage`
4. Update this README if needed

## 📚 Resources

- [Vitest Documentation](https://vitest.dev/)
- [Vue Test Utils](https://test-utils.vuejs.org/)
- [Testing Library Best Practices](https://testing-library.com/docs/queries/about)
