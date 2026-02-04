<!--
  src/component/event/event-editor/AdminEventBaseTab.vue
-->

<template>
  <section class="base-tab">

    <UranusLanguageSelect
        v-model="draftContentLanguage"
        :label="t('content_language')"
    />

    <label>
      Title
      <input v-model="event.title" class="title" />
    </label>

    <label>
      Subtitle
      <input v-model="event.subtitle" />
    </label>

    <div class="field">
      Dirty: {{ isDescriptionDirty }}
      <span>Description</span>
      <UranusTextEditor
          v-model="descriptionProxy"
          ref="descriptionEditor"
      />
    </div>

    <label>
      Summary
      <textarea v-model="event.summary" />
    </label>

    <!-- Buttons -->
    <div class="tab-actions">
      <button @click="resetBaseTab" :disabled="store.saving || !isBaseTabDirty">
        {{ t('discard')}}
      </button>
      <button @click="commitBaseTab" :disabled="store.saving || !isBaseTabDirty">
        {{ t('save')}}
      </button>
    </div>
  </section>


  <!--Svg3DRotation /-->
</template>


<script setup lang="ts">
import { computed, ref } from 'vue'
import { useUranusAdminEventStore } from '@/store/uranusAdminEventStore.ts'
import { useI18n } from 'vue-i18n'
import { apiFetch } from '@/api.ts'
import UranusLanguageSelect from '@/component/ui/UranusLanguageSelect.vue'
import UranusTextEditor from '@/component/ui/UranusTextEditor.vue'
import MarkdownIt from 'markdown-it'
import Svg3DRotation from "@/component/Svg3DRotation.vue";

const { t, locale } = useI18n({ useScope: 'global' })
const store = useUranusAdminEventStore()
const event = computed(() => store.draft!)
const md = new MarkdownIt()


const descriptionEditor = ref<InstanceType<typeof UranusTextEditor> | null>(null)

const descriptionProxy = computed({
  get: () => store.draft?.description ?? '',
  set: (val: string) => {
    console.log("value", val)
    if (!store.draft) return
    store.draft.description = val
  }
})

const isDescriptionDirty = computed(() => {
  if (!store.draft || !store.original) return false
  return store.draft.description !== store.original.description
})


const baseFields = [
  'contentLanguage',
  'title',
  'subtitle',
  'description',
  'summary',
] as const

type BaseTabField = typeof baseFields[number]


const isBaseTabDirty = computed(() => {
  const draft = store.draft
  const original = store.original
  if (!draft || !original) return false

  for (const key of baseFields) {
    console.log(key, JSON.stringify(draft[key]), JSON.stringify(original[key]))
  }

  return baseFields.some(key => {
    return JSON.stringify(draft[key]) !== JSON.stringify(original[key])
  })
})

const draftContentLanguage = computed({
  get: () => store.draft?.contentLanguage ?? '',
  set: (val: string) => {
    if (!store.draft) return
    store.draft.contentLanguage = val
  }
})

function toSnakeCase(str: string) {
  return str.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
}

function buildBaseTabPayload(
    draft: Record<BaseTabField, any>,
    original: Record<BaseTabField, any>
) {
  const payload: Record<string, any> = {}

  for (const key of baseFields) {
    const draftValue = draft[key]
    const originalValue = original[key]

    // strict comparison — catches null vs string, etc.
    if (draftValue !== originalValue) {
      payload[toSnakeCase(key)] = draftValue
    }
  }

  return payload
}

async function commitBaseTab() {
  const { draft, original } = store
  if (!draft || !original) return

  store.saving = true
  store.error = null

  try {
    const payload = buildBaseTabPayload(draft, original)

    // nothing changed → no request
    if (Object.keys(payload).length === 0) {
      store.saving = false
      return
    }

    const apiPath = `/api/admin/event/${draft.id}/base`

    await apiFetch(apiPath, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })

    // Commit changes locally (mirror exactly what we sent)
    for (const key of baseFields) {
      if (draft[key] !== original[key]) {
        original[key] = structuredClone(draft[key] ?? '')
      }
    }
  } catch (err) {
    store.error = 'Failed to save base tab'
    console.error(err)
  } finally {
    store.saving = false
  }
}

function resetBaseTab() {
  const draft = store.draft
  const original = store.original
  if (!draft || !original) return

  baseFields.forEach((key) => {
    draft[key] = structuredClone(original[key] ?? '')

    if (key === 'description' && descriptionEditor.value?.editor) {
      const html = md.render(draft[key])
      descriptionEditor.value.editor.commands.setContent(html, false)
    }
  })
}
</script>

<style lang="scss">
.tiptap-editor {
  min-height: 200px;
  padding: 1rem;
  border: 0px solid #ddd;
  border-radius: 6px;
  background-color: #fff;

  // Headings
  h1 { font-size: 1.8rem; font-weight: 600; margin-bottom: 0.5rem; }
  h2 { font-size: 1.5rem; font-weight: 600; margin-bottom: 0.5rem; }
  h3 { font-size: 1.25rem; font-weight: 500; margin-bottom: 0.5rem; }

  li {
    margin: 0;
    padding: 0;
    margin-bottom: -0.8rem;  // space between items
  }

  p {
    line-height: 1.6;
    margin-bottom: 0.75rem;
  }

  blockquote {
    border-left: 3px solid #ccc;
    padding-left: 0.75rem;
    color: #666;
    font-style: italic;
    margin-bottom: 0.75rem;
  }

  pre {
    background-color: #f6f8fa;
    padding: 0.75rem;
    border-radius: 4px;
    overflow-x: auto;
    font-family: monospace;
    font-size: 0.875rem;
    margin-bottom: 0.75rem;
  }

  code {
    background-color: #eee;
    padding: 0.15rem 0.3rem;
    border-radius: 3px;
    font-family: monospace;
    font-size: 0.875rem;
  }

  ul, ol {
    margin-left: 1.25rem;
    margin-bottom: 0.75rem;
  }

  a {
    color: #1d4ed8;
    text-decoration: underline;
    &:hover { text-decoration: none; }
  }

  img {
    max-width: 100%;
    border-radius: 4px;
  }
}
</style>

<style lang="scss" scoped>
.base-tab {
  width: 100%;
  max-width: 1024px;
  display: flex;
  flex-direction: column;
  gap: 1.5rem; // spacing between fields

  label {
    display: flex;
    flex-direction: column; // label above the input
    font-weight: 500;
    color: #999;
    gap: 0.25rem; // small space between label text and field

    input,
    textarea {
      padding: 0.5rem;
      border: 2px solid #fff;
      border-radius: 5px;
      font-size: 1rem;
      width: 100%;
      box-sizing: border-box;
    }

    textarea {
      resize: vertical; // allow vertical resizing
      min-height: 80px;
    }
  }

  .title {
    font-size: 1.75rem;
  }

  .description {
    min-height: 320px;
  }

  .tab-actions {
    display: flex;
    justify-content: flex-end;
    gap: 1rem;
    margin-top: 1rem;

    button {
      padding: 0.5rem 1rem;
      cursor: pointer;
      border-radius: 4px;
      border: 2px solid #888;
      background-color: #f5f5f5;
      transition: background 0.2s;
      font-size: 1rem;

      &:hover:not(:disabled) {
        background-color: #e0e0e0;
      }

      &:disabled {
        cursor: not-allowed;
        opacity: 0.6;
      }
    }
  }
}
</style>