<template>
  <div class="tab-cards">
    <!-- Tabs -->
    <div class="tabs" role="tablist">
      <label
          v-for="(card, index) in displayedCards"
          :key="index"
          class="tab"
          role="tab"
          :aria-selected="activeTab === index"
          :tabindex="activeTab === index ? 0 : -1"
          @click="setActiveTab(index)"
          @keydown="onKeyDown($event, index)"
          ref="el => tabRefs.value[index] = el"
      >
        <span class="tab-title">{{ card.title }}</span>
      </label>
    </div>

    <!-- Card content -->
    <div class="card-content" v-if="displayedCards[activeTab]" role="tabpanel">
      <slot :name="`card-${activeTab}`">
        {{ displayedCards[activeTab]?.content }}
      </slot>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick } from 'vue'

interface Card {
  title: string
  content?: string
}

const props = defineProps<{
  cards: Card[]
  modelValue?: number // <-- Vue auto uses v-model:active → modelValue internally
  active?: number     // <-- support both
  name?: string
}>()

const emit = defineEmits<{
  (e: 'update:active', value: number): void
}>()

// Prefer `active` if provided, fallback to modelValue, then default 0
const activeTab = ref(props.active ?? props.modelValue ?? 0)

// Expose up to parent
watch(activeTab, (val) => {
  emit('update:active', val)
})

// Keep sync when parent changes active
watch(
    () => props.active ?? props.modelValue,
    (val) => {
      if (val !== undefined && val !== activeTab.value) {
        activeTab.value = val
      }
    }
)

// Limit to max 10 cards (like before)
const displayedCards = computed(() => props.cards.slice(0, 10))

// Tab refs (correct reactive version, no querySelectorAll) ---
const tabRefs = ref<HTMLElement[]>([])

// Switch tab
function setActiveTab(index: number) {
  activeTab.value = index
  focusTab(index)
}

function focusTab(index: number) {
  nextTick(() => tabRefs.value[index]?.focus())
}

// Keyboard navigation
function onKeyDown(event: KeyboardEvent, index: number) {
  const max = displayedCards.value.length - 1
  let i = index

  switch (event.key) {
    case 'ArrowRight':
      i = (index + 1) % displayedCards.value.length
      break
    case 'ArrowLeft':
      i = (index - 1 + displayedCards.value.length) % displayedCards.value.length
      break
    case 'Home':
      i = 0
      break
    case 'End':
      i = max
      break
    default:
      return
  }

  event.preventDefault()
  activeTab.value = i
  focusTab(i)
}
</script>

<style scoped lang="scss">
.tabs {
  display: flex;
  flex-wrap: nowrap; /* keep tabs on a single line */
  border-bottom: 2px solid var(--uranus-card-border-color);
  gap: 0.5rem; /* space between tabs */
  overflow-x: auto; /* optional: scroll if too many tabs */
}

.tab {
  margin: 6px;
  flex: 0 1 auto; /* width depends on content */
  flex-direction: row;
  padding: 4px 12px 4px 36px;
  text-align: center;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  user-select: none;
  position: relative;
  border-radius: 6px;
  outline: 2px solid transparent;
  outline-offset: 0px;
  transition: all 0.2s, color 0.2s;
  white-space: nowrap;
}

/* Circle indicator */
.tab-title::before {
  content: '';
  position: absolute;
  left: 8px;
  top: 50%;
  transform: translateY(-50%);
  width: 20px;
  height: 20px;
  border-radius: 50%;
  border: 2px solid var(--uranus-card-border-color);
  transition: all 0.2s;
}

.tab[aria-selected="true"] .tab-title::before {
  background-color: var(--uranus-ia-inline-color);
  border-color: var(--uranus-ia-inline-color);
}

.tab:focus {
  outline: 2px solid var(--uranus-acc-color);
}

.card-content {
  margin-top: var(--uranus-grid-gap);
}

.card-content {
  margin-top: var(--uranus-grid-gap);
}
</style>