<template>
  <section class="uranus-admin-edit-section uranus-admin-responsive-grid">
    <!--isDirty: {{ isDirty}} <br>
    flagModels: {{ flagModels }}
    -->
    <div
        v-for="topic in uranusI18nAccessibilityFlags"
        :key="topic.topic"
        class="accessibility-group"
    >
      <h3>{{ t(topic.topic_name) }}</h3>
      <div class="accessibility-options">
        <label v-for="flag in topic.flags" :key="flag.id">
          <input type="checkbox" v-model="flagModels[flag.id]" />
          {{ t(flag.name) }}
        </label>
      </div>
    </div>

    <!-- Actions -->
    <div class="tab-actions">
      <button @click="resetTab" :disabled="store.saving || !isDirty">
        {{ t('discard') }}
      </button>
      <button @click="commitTab" :disabled="store.saving || !isDirty">
        {{ t('save') }}
      </button>
    </div>

  </section>
</template>

<script setup lang="ts">
import { reactive, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { apiFetch } from "@/api.ts";
import { useBigIntFlags, setBigintByFlags, type BigIntFlags } from '@/composable/useBigIntFlags'
import type { UranusSpace } from '@/domain/space/UranusSpace'
import { useUranusSpaceStore } from '@/store/uranusSpaceStore'
import { uranusI18nAccessibilityFlags } from '@/i18n/uranus-i18n-accessibility'

const { t } = useI18n({ useScope: 'global' })
const store = useUranusSpaceStore()
const space = computed(() => store.draft!)

if (!space.value) throw new Error('Draft space not initialized')

// Initialize BigInt flags helper
const flags = useBigIntFlags(space.value.accessibilityFlags ?? 0n)

// Reactive map of checkbox states
const flagModels = reactive<BigIntFlags>({})

// Bind each checkbox to the flags utility
uranusI18nAccessibilityFlags.forEach(topic => {
  topic.flags.forEach(flag => {
    Object.defineProperty(flagModels, flag.id, {
      get: () => flags.flagComputed(flag.id).value,
      set: (val: boolean) => (flags.flagComputed(flag.id).value = val),
      enumerable: true,
      configurable: true,
    })
  })
})

// Detect changes between draft and original
const isDirty = computed(() => {
  const accFlags = setBigintByFlags(flagModels)
  const originalFlags = store.original?.accessibilityFlags ?? 0n
  return accFlags !== originalFlags
})

// Reset draft to original values
function resetTab() {
  if (!space.value || !store.original) return
  space.value.accessibilityFlags = store.original.accessibilityFlags ?? 0n
  flags.value.value = store.original.accessibilityFlags ?? 0n
}

// Build API payload from current flag checkboxes
function buildPayload(draft: UranusSpace, original: UranusSpace) {
  const accFlags = setBigintByFlags(flagModels)
  const originalFlags = store.original?.accessibilityFlags ?? 0n
  if (accFlags !== originalFlags) {
    return { accessibility_flags: accFlags.toString() } // safe string for API
  }
  return {}
}

// Save draft to API
async function commitTab() {
  if (!space.value || !store.original) return

  store.saving = true
  store.error = null

  try {
    const payload = buildPayload(space.value, store.original)
    if (Object.keys(payload).length === 0) return

    await apiFetch(`/api/admin/space/${space.value.id}/fields`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    })

    // Sync original with draft after saving
    store.original.accessibilityFlags = setBigintByFlags(flagModels)
  } catch (err) {
    console.error(err)
    store.error = 'Failed to save accessibility flags'
  } finally {
    store.saving = false
  }
}
</script>

<style scoped lang="scss">
.accessibility-group {
  margin-bottom: 1.5rem;

  h3 {
    font-weight: 600;
    margin-bottom: 0.5rem;
  }

  .accessibility-options {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;

    label {
      display: flex;
      flex-direction: row;
      align-items: center;
      gap: 0.5rem;
      cursor: pointer;
      user-select: none;
      font-size: 1rem;
      position: relative;

      input[type="checkbox"] {
        appearance: none;
        -webkit-appearance: none;
        -moz-appearance: none;
        width: 24px;
        height: 24px;
        border: 2px solid #888;
        border-radius: 4px;
        background-color: #fff;
        position: relative;
        cursor: pointer;
        transition: all 0.2s;
      }

      input[type="checkbox"]:checked {
        background-color: #2a3aed;
        border-color: #2a3aed;
      }

      input[type="checkbox"]:checked::after {
        content: '';
        position: absolute;
        left: 6px;
        top: 2px;
        width: 6px;
        height: 12px;
        border: solid #fff;
        border-width: 0 2px 2px 0;
        transform: rotate(45deg);
      }

      input[type="checkbox"]:hover {
        border-color: #2a3aed;
      }
    }
  }
}

.tab-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
}
</style>