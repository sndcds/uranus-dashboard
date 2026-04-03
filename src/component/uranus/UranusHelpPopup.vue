<template>
  <div class="help-popup-container">
    <button @click="togglePopup" class="help-icon" aria-label="Help">
      <MessageCircleQuestionMark />
    </button>

    <div v-if="isOpen" class="popup-overlay" @click.self="closePopup">
      <div class="uranus-popup-container">
        <button class="close-btn" @click="closePopup">×</button>
        <div v-if="loading">Loading…</div>
        <div v-else class="uranus-help-popup-content" v-html="content"></div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { MessageCircleQuestionMark } from 'lucide-vue-next'

const props = defineProps<{
  baseUrl: string // e.g., '/page/first-steps'
}>()

const { locale } = useI18n()
const isOpen = ref(false)
const loading = ref(false)
const content = ref<string>('')

function togglePopup() { isOpen.value = !isOpen.value }
function closePopup() { isOpen.value = false }

async function loadContent() {
  if (content.value) return
  loading.value = true
  try {
    // Construct locale-specific path
    const url = `${props.baseUrl}/${locale.value}.html`
    console.log("url", url)
    const res = await fetch(url)
    const html = await res.text()
    content.value = res.ok ? html : '<p>Failed to load help content.</p>'
    console.log(html)
  } catch (err) {
    content.value = `<p>Error: ${(err as Error).message}</p>`
  } finally {
    loading.value = false
  }
}

// Watch for popup open
watch(isOpen, async (open) => { if (open) await loadContent() })

// Optional: reload if locale changes while popup is open
watch(locale, async () => {
  if (isOpen.value) await loadContent()
})
</script>

<style scoped lang="scss">
.help-icon {
  background: none;
  border: none;
  cursor: pointer;
  font-size: 1.2rem;
}

.popup-overlay {
  position: fixed;
  inset: 0;
  background: var(--uranus-backdrop-color);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
}

.close-btn {
  position: absolute;
  top: 0.3rem;
  right: 0.5rem;
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
}
</style>