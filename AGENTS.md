# AGENTS.md - Uranus Dashboard Development Guide

An AI assistant's guide to the Uranus Dashboard codebase. This is a Vue 3 + TypeScript culture platform frontend with strict type safety, domain-driven architecture, and multi-language support.

## Project Overview

**Uranus Dashboard** is a web interface for managing cultural events and organizations. It's built as a modern SPA with domain-driven components and a local-first state architecture.

- **Core Stack**: Vue 3 (Composition API), TypeScript, Vite, Pinia, vue-i18n
- **Architecture**: Domain-driven design (event, org, venue, space, partner, portal, favorite)
- **API**: REST backend with JWT token refresh on 401
- **Testing**: Vitest with happy-dom, strict TypeScript mode
- **i18n**: German (de), English (en), Danish (da)

## Critical Architecture Patterns

### 1. Domain-Driven Project Structure

The codebase is organized around business domains. Each domain has:
- **Store** (State Management): `/src/store/[domain]Store.ts` using Pinia
- **Components**: `/src/component/[domain]/` - feature-specific Vue components
- **Domain Models**: `/src/domain/[domain]/` - data models, mappers, types
- **i18n Keys**: `/src/i18n/[domain].ts` - localization strings

**Example: Event Domain**
- Store: `src/store/eventListStore.ts`, `src/store/adminEventStore.ts`
- Components: `src/component/event/view/UranusEventView.vue`
- Models: `src/domain/event/eventListItem.model.ts`, `src/domain/event/eventListItem.mapper.ts`
- i18n: `src/i18n/event.ts`

Active domains: `event`, `org`, `space`, `venue`, `user`, `favorite`, `partner`, `portal`, `image`

### 2. Store Architecture (Pinia)

Each store uses the **Composition API style** via `defineStore()`:
```typescript
export const useEventStore = defineStore('event', () => {
  const events = ref<Event[]>([])
  const selectedEvent = ref<Event | null>(null)
  
  function setEvents(items: Event[]) { events.value = items }
  
  return { events, selectedEvent, setEvents }
})
```

**Key Stores**:
- `uranusTokenStore`: JWT tokens, authentication status, persistence
- `themeStore`: Dark/light mode, persisted to localStorage via pinia-plugin-persistedstate
- `appStore`: Org context, event view modes (cards/compact/list/calendar/map), grouping preferences
- `userStore`: Current user profile (uuid, displayName, avatar)
- **Lookup Stores**: `languageLookupStore`, `currencyLookupStore`, `eventTypeGenreLookupStore`, etc. - cached reference data

All stores are initialized during app startup in `src/main.ts` to pre-load lookups for dropdown/select components.

### 3. API Integration & Token Refresh

The `apiFetch()` function in `src/api.ts` handles:
- **Automatic Bearer token injection** from `uranusTokenStore.accessToken`
- **401 Refresh handling**: When a 401 occurs, it uses the `refreshToken` to fetch a new `accessToken`, then retries the original request
- **Safe parallel requests**: Uses a `refreshPromise` singleton to prevent duplicate refresh calls
- **Snake_case ↔ camelCase conversion**: Backend responses use `snake_case`, frontend code uses `camelCase` (converted by `useUranusAPI.camelCaseKeys()`)

**API Response Format**:
```typescript
interface ApiResponse<T> {
  service: string
  api_version: string
  response_type: string
  status: number
  message?: string
  timestamp: string
  metadata?: Record<string, any>
  data?: T
}
```

### 4. Router Structure with Auth Guards

Routes in `src/router/index.ts` use nested layouts and meta guards:
- `/admin/*`: Protected routes (`meta: { requiresAuth: true }`) - admin panel
- `/app/*`: Guest-only routes (`meta: { guestOnly: true }`) - login/signup/password reset
- `/`:  Public routes (events list, event details, map view, etc.)

The `router.beforeEach()` guard:
- Checks `requiresAuth` meta flag and redirects to `/app/login` if not authenticated
- Checks `guestOnly` flag and redirects authenticated users away from auth pages
- Stores previous route in `previousRoute` ref (used for "go back" functionality)

Routes use **UUID-based** URL parameters: `/org/:orgUuid/venue/:venueUuid/edit`

### 5. Data Model & Mapper Pattern

Domain models in `/src/domain/[domain]/` follow naming conventions:
- `*.model.ts`: Type definitions and interfaces
- `*.mapper.ts`: Functions that transform API DTOs to domain models

**Example**:
```typescript
// src/domain/event/eventListItem.model.ts
export interface EventListItem {
  uuid: string
  title: string
  // ...
}

// src/domain/event/eventListItem.mapper.ts
export function mapApiEventToListItem(apiEvent: any): EventListItem {
  return {
    uuid: apiEvent.event_uuid,  // snake_case from API
    title: apiEvent.event_title,
    // ...
  }
}
```

### 6. i18n Structure

Localization is **language-namespaced**:
- Messages organized by domain: `src/i18n/event.ts`, `src/i18n/org.ts`, etc.
- Compiled to JSON: `src/i18n/json/{de,en,da}.json` (build output for i18n generation)
- Tool: `npm run generate:i18n` compiles TypeScript i18n files to JSON using `ts-node-esm tools/i18n/generate-i18n-to-json.ts`

**Usage in components**:
```vue
<template>
  {{ $t('event.title') }}  <!-- translates via vue-i18n -->
</template>
```

**Locale persistence**: Current locale stored in `localStorage.getItem('app-locale')`, watched and auto-saved in `src/i18n/uranus-i18n-index.ts`

## Build & Development Workflows

### Local Development
```bash
VITE_API_URL=http://localhost:3000 pnpm dev
```
Vite proxy redirects `/api/*` to `VITE_API_URL` (configured in `vite.config.ts`)

### TypeScript & Linting
```bash
pnpm typecheck           # vue-tsc --noEmit
pnpm test                # vitest
pnpm test:ui             # Vitest UI browser
pnpm test:coverage       # Coverage report
```

### Build Output Chunking
Vite's `manualChunks()` in `vite.config.ts` creates optimized chunks:
- `vendor-vue`: Vue + Pinia
- `vendor-i18n`: @intlify (i18n compiler)
- `vendor-maplibre`: MapLibre GL (maps library)
- `vendor`: All other node_modules
- App chunk: Component + business logic code

This reduces initial load by avoiding redundant parsing of shared dependencies.

### TypeScript Strict Mode
All of the strictest TypeScript options are enabled in `tsconfig.json`:
- `strict: true` (enables all strict checks)
- `noUnusedLocals: true`
- `noUnusedParameters: true`
- `noImplicitReturns: true`
- `exactOptionalPropertyTypes: true`

**This means**: Every function must have an explicit return type or inferred type. Optional properties must use `type | undefined` (not just `type?`). No unused variables allowed.

## Project-Specific Conventions

### Naming Conventions
- **Stores**: `use[Domain]Store` (e.g., `useEventStore`)
- **Store files**: camelCase with `Store` suffix: `eventListStore.ts`
- **Components**: PascalCase: `UranusEventView.vue`, `EventCard.vue`
- **Composables**: `use[Feature].ts` (e.g., `useSaveShortcut.ts`, `useBitmaskFeatures.ts`)
- **Models**: PascalCase interfaces, `*.model.ts` files (e.g., `EventListItem`)
- **Mappers**: Functions with `map*` prefix, `*.mapper.ts` files

### Import Aliases
- `@/` → `src/` (configured in `vite.config.ts` and `tsconfig.json`)
- Always prefer `@/` over relative imports for cross-domain code

### Component Organization
- **Layout Components**: `src/component/layout/` (GenericLayout, ContentOnlyLayout)
- **Feature Components**: `src/component/[domain]/`
  - Subdirectory `view/` for page-level/route components (UranusEventView.vue)
  - Other files for reusable sub-components (EventCard.vue, EventFilter.vue)
- **Shared UI Components**: `src/component/ui/` (buttons, dialogs, modals, etc.)

### Vue 3 Composition API Style
All components use **`<script setup>`** with TypeScript:
```vue
<script setup lang="ts">
import { ref, computed } from 'vue'
import { useEventStore } from '@/store/eventStore'

const events = ref<Event[]>([])
const store = useEventStore()
const filteredEvents = computed(() => events.value.filter(...))
</script>
```

**Don't use**: Composition API without `<script setup>`, or class-based components.

## External Dependencies & Integration Points

### UI & Visualization
- **MapLibre GL** (`maplibregl`): Map rendering. Used in `UranusMapView.vue`
- **Leaflet** (`leaflet`): Alternative map library (legacy, consider removing)
- **Lucide Vue Next** (`lucide-vue-next`): Icon library, imported as `<LucideIcon />`
- **TipTap + Quill**: Rich text editing. TipTap is primary, Quill is fallback

### Text Processing
- **Marked** (`marked`): Markdown parser (event descriptions)
- **Turndown** (`turndown`): HTML ↔ Markdown converter
- **Markdown-it** (`markdown-it`): Alternative MD parser

### Animation
- **GSAP** (`gsap`): Tweening library (smooth animations)
- **Simplex Noise** (`simplex-noise`): Procedural noise (used in `Svg3DRotation.vue`)
- **Spline** (`@georgedoescode/spline`): Cubic spline Interpolation

### Color & Styling
- **Culori** (`culori`): Color manipulation library
- **SCSS**: Used globally in `src/style/global.scss`, avoid inline styles

### Geo & Maps
- **Nominatim API** (Custom fetch in `src/api.ts`): Address → coordinates geocoding
- **MapLibre Vector Tiles**: No specific tile provider hardcoded; configured via styles in `public/versatiles/`

## Testing Patterns

### Vitest Setup
- Environment: `happy-dom` (lightweight DOM, no browser automation)
- Globals: `describe`, `it`, `expect` are auto-injected
- Setup file: `tests/setup.ts` - shared test utilities
- Coverage provider: v8

### Component Testing
```typescript
import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import EventCard from '@/component/event/EventCard.vue'

describe('EventCard', () => {
  it('renders event title', () => {
    const wrapper = mount(EventCard, { props: { event: mockEvent } })
    expect(wrapper.text()).toContain('Event Title')
  })
})
```

### Avoid Testing
- Files in coverage exclusion list: `src/main.ts`, `**/*.d.ts`, config files
- Each test should be independent; no cross-test state sharing via stores

## Performance & Optimization

### Bundle Size
- Chunk strategy in `vite.config.ts` with `manualChunks()`
- Monitor chunk sizes: `chunkSizeWarningLimit: 1200` (1200 KB threshold)

### Code Splitting
- Lazy-load route components via Vue Router dynamic imports
- Use `.component()` instead of tree-shaking unused components

### SEO Considerations
- App is client-rendered (no SSR). Meta tags cannot be auto-generated for Open Graph / Twitter cards
- Static pages (help, about, imprint, privacy) use `UranusHtmlView` for SEO

## Common Gotchas & Tips

1. **API snake_case vs camelCase**: Always use mappers (`eventListItem.mapper.ts`) to convert API responses. Don't mix cases in frontend code.

2. **Store Initialization**: Lookup stores are pre-loaded in `main.ts`. If you add a new lookup (e.g., `useFooLookupStore`), initialize it there with `.initialize([...SUPPORTED_UI_LANGUAGES])`.

3. **Auth Token Persistence**: Tokens are stored in `uranusTokenStore` which uses Pinia's persisted state plugin. If logout happens, call `tokenStore.clearTokens()` to update localStorage.

4. **Route Guards**: Check both `requiresAuth` and `guestOnly` meta flags. If you add a new admin-only route, always add `meta: { requiresAuth: true }`.

5. **Component Prop Validation**: Strict TypeScript means all component props must have explicit types. Use `PropType<T>` for complex types.

6. **Locale Changes**: Changing language via `uranusI18n.global.locale.value = 'en'` triggers the localStorage watcher and reloads i18n messages.

7. **SVG Handling**: `vite-svg-loader` allows importing SVGs as components. Use `import Logo from '@/assets/logo.svg?component'` or just `import Logo from '@/assets/logo.svg'` for URL.

8. **Environment Variables**: Prefix with `VITE_` to be available in frontend code. Example: `VITE_API_URL`, accessed via `import.meta.env.VITE_API_URL`.

## Key Files Reference

| Path | Purpose |
|------|---------|
| `src/api.ts` | API client, token refresh logic, `apiFetch()` |
| `src/router/index.ts` | All routes, auth guards, layout nesting |
| `src/store/uranusTokenStore.ts` | JWT token management, persistence |
| `src/composable/useUranusAPI.ts` | `camelCaseKeys()` converter for API responses |
| `src/i18n/uranus-i18n-index.ts` | i18n initialization, locale persistence |
| `src/main.ts` | App initialization, store setup, lookup preloading |
| `vite.config.ts` | Build config, chunk strategy, API proxy |
| `tsconfig.json` | TypeScript strict settings, path aliases |
| `src/component/layout/GenericLayout.vue` | Main app wrapper (nav, footer) |
| `src/component/layout/ContentOnlyLayout.vue` | Minimal layout for full-width views |

---

**Last Updated**: June 2026 | **Target Audience**: AI Code Assistants

