<template>
    <div class="organizer-chooser-menu" ref="dropdownRef">
        <label class="organizer-chooser-menu__label" :for="triggerId">
            {{ t('organizers') }}
        </label>
        <div class="organizer-chooser-menu__control" :data-open="isOpen" :data-loading="isLoading">
            <button :id="triggerId" type="button" class="organizer-chooser-menu__trigger" aria-haspopup="menu"
                :aria-expanded="isOpen" :aria-controls="menuId" :disabled="isLoading || !organizers.length"
                @click="toggleDropdown" @keydown="handleTriggerKeydown" ref="triggerRef">
                <span class="organizer-chooser-menu__trigger-label">{{ triggerLabel }}</span>
                <span class="organizer-chooser-menu__icon" aria-hidden="true">
                    <svg width="14" height="8" viewBox="0 0 14 8" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M1 1L7 7L13 1" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"
                            stroke-linejoin="round" />
                    </svg>
                </span>
            </button>

            <transition name="organizer-chooser-menu__dropdown">
                <ul v-if="isOpen" :id="menuId" class="organizer-chooser-menu__dropdown" role="menu"
                    :aria-labelledby="triggerId" @keydown="handleMenuKeydown">
                    <li v-for="(org, index) in organizers" :key="org.organizer_id" class="organizer-chooser-menu__item">
                        <button type="button" class="organizer-chooser-menu__item-btn" role="menuitemradio"
                            :aria-checked="organizerId === org.organizer_id" :data-active="highlightedIndex === index"
                            :data-selected="organizerId === org.organizer_id" @click="selectOrganizer(org.organizer_id)"
                            @mouseenter="highlightedIndex = index" @focus="highlightedIndex = index"
                            :ref="(el) => setItemRef(el, index)" tabindex="-1">
                            <span class="organizer-chooser-menu__item-name">{{ org.organizer_name }}</span>
                        </button>
                    </li>
                </ul>
            </transition>
        </div>

        <p v-if="!isLoading && !organizers.length" class="organizer-chooser-menu__empty">
            {{ t('no_organizers_help') }}
        </p>
    </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount, nextTick, watch } from 'vue'
import type { ComponentPublicInstance } from 'vue'
import { useI18n } from 'vue-i18n'
import { useAppStore } from '@/store/appStore'
import { apiFetch } from '@/api'

interface Organizer {
    organizer_id: number
    organizer_name: string
}

const organizers = ref<Organizer[]>([])
const isLoading = ref(true)
const isOpen = ref(false)
const highlightedIndex = ref(-1)
const dropdownRef = ref<HTMLElement | null>(null)
const triggerRef = ref<HTMLButtonElement | null>(null)
const itemRefs = ref<(HTMLButtonElement | null)[]>([])
const triggerId = 'organizer-chooser-menu-trigger'
const menuId = 'organizer-chooser-menu-list'

const appStore = useAppStore()
const { t } = useI18n({ useScope: 'global' })

const organizerId = computed<number | null>({
    get: () => appStore.organizerId,
    set: (val) => {
        if (val === null) {
            appStore.setOrganizerId(null)
            return
        }

        const parsed = Number(val)
        appStore.setOrganizerId(Number.isNaN(parsed) ? null : parsed)
    },
})

async function fetchOrganizers() {
    isLoading.value = true
    try {
        const { data } = await apiFetch<Organizer[]>('/api/admin/choosable-organizers')
        organizers.value = Array.isArray(data) ? data : []
        syncHighlightedIndex()
        if (!organizers.value.length) {
            closeDropdown()
        }
    } catch (err) {
        console.error('Failed to fetch organizers', err)
        organizers.value = []
        closeDropdown()
    } finally {
        isLoading.value = false
    }
}

const selectedOrganizer = computed(() => {
    if (organizerId.value === null) return null
    return organizers.value.find((org) => org.organizer_id === organizerId.value) ?? null
})

const triggerLabel = computed(() => {
    if (isLoading.value) return t('loading')
    if (selectedOrganizer.value) return selectedOrganizer.value.organizer_name
    if (!organizers.value.length) return t('no_organizers_help')
    return t('select_placeholder')
})

function toggleDropdown() {
    if (isLoading.value || !organizers.value.length) return
    if (isOpen.value) {
        closeDropdown(true)
        return
    }

    isOpen.value = true
    syncHighlightedIndex()
    resetItemRefs()
    focusHighlightedItem()
}

function closeDropdown(focusTrigger = false) {
    if (!isOpen.value) return
    isOpen.value = false
    highlightedIndex.value = -1
    resetItemRefs()

    if (focusTrigger) {
        focusTriggerButton()
    }
}

function focusTriggerButton() {
    nextTick(() => {
        triggerRef.value?.focus()
    })
}

function selectOrganizer(id: number) {
    organizerId.value = id
    closeDropdown(true)
}

function handleTriggerKeydown(event: KeyboardEvent) {
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
        event.preventDefault()
        if (!isOpen.value) {
            isOpen.value = true
            syncHighlightedIndex(event.key === 'ArrowUp')
            resetItemRefs()
            focusHighlightedItem()
            return
        }
    }

    if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault()
        toggleDropdown()
    }

    if (event.key === 'Escape') {
        closeDropdown(true)
    }
}

function handleMenuKeydown(event: KeyboardEvent) {
    if (!isOpen.value) return

    if (event.key === 'ArrowDown') {
        event.preventDefault()
        highlightedIndex.value = (highlightedIndex.value + 1) % organizers.value.length
        focusHighlightedItem()
    } else if (event.key === 'ArrowUp') {
        event.preventDefault()
        highlightedIndex.value =
            (highlightedIndex.value - 1 + organizers.value.length) % organizers.value.length
        focusHighlightedItem()
    } else if (event.key === 'Home') {
        event.preventDefault()
        highlightedIndex.value = 0
        focusHighlightedItem()
    } else if (event.key === 'End') {
        event.preventDefault()
        highlightedIndex.value = organizers.value.length - 1
        focusHighlightedItem()
    } else if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault()
        const active = organizers.value[highlightedIndex.value]
        if (active) selectOrganizer(active.organizer_id)
    } else if (event.key === 'Escape') {
        closeDropdown(true)
    } else if (event.key === 'Tab') {
        closeDropdown()
    }
}

function handleClickOutside(event: MouseEvent) {
    if (!dropdownRef.value) return
    if (!dropdownRef.value.contains(event.target as Node)) {
        closeDropdown()
    }
}

function setItemRef(el: Element | ComponentPublicInstance | null, index: number) {
    const node = resolveButtonElement(el)
    itemRefs.value[index] = node
}

function resolveButtonElement(
    el: Element | ComponentPublicInstance | null,
): HTMLButtonElement | null {
    if (!el) return null
    if (el instanceof HTMLButtonElement) return el

    const maybeInstance = el as ComponentPublicInstance & { $el?: Element }
    const domNode = maybeInstance.$el
    if (domNode && domNode instanceof HTMLButtonElement) {
        return domNode
    }

    return null
}

function syncHighlightedIndex(reverse = false) {
    if (!organizers.value.length) {
        highlightedIndex.value = -1
        return
    }

    const currentIndex = selectedOrganizer.value
        ? organizers.value.findIndex((org) => org.organizer_id === selectedOrganizer.value?.organizer_id)
        : -1

    if (currentIndex >= 0) {
        highlightedIndex.value = currentIndex
    } else {
        highlightedIndex.value = reverse ? organizers.value.length - 1 : 0
    }
}

async function focusHighlightedItem() {
    await nextTick()
    const index = highlightedIndex.value
    if (index < 0) return
    const node = itemRefs.value[index]
    node?.focus()
}

function resetItemRefs() {
    itemRefs.value = []
}

onMounted(() => {
    fetchOrganizers()
    document.addEventListener('click', handleClickOutside)
})

onBeforeUnmount(() => {
    document.removeEventListener('click', handleClickOutside)
})

watch(organizerId, () => {
    if (isOpen.value) {
        syncHighlightedIndex()
    }
})
</script>

<style scoped lang="scss">
.organizer-chooser-menu {
    display: flex;
    flex-direction: column;
    gap: 0;
    width: 100%;
}

.organizer-chooser-menu__label {
    padding: 0.5rem 1.1rem 0.5rem 1.5rem;
    font-weight: 600;
    color: var(--uranus-muted-text);
    letter-spacing: 0.01em;
    font-size: 0.85rem;
    text-transform: uppercase;
}

.organizer-chooser-menu__control {
    position: relative;
}

.organizer-chooser-menu__trigger {
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 0.75rem;
    padding: 0.75rem 1.1rem 0.75rem 1.5rem;
    border: none;
    background: transparent;
    cursor: pointer;
    color: var(--uranus-muted-text);
    font-weight: 500;
    letter-spacing: 0.01em;
    transition: color 0.2s ease, background 0.2s ease, transform 0.15s ease;

    &:hover {
        background: var(--accent-muted);
        color: var(--color-text);
        transform: translateX(2px);
    }

    &:focus-visible {
        outline: none;
        background: var(--accent-muted);
    }

    &:disabled {
        cursor: not-allowed;
        opacity: 0.7;
    }
}

.organizer-chooser-menu__trigger-label {
    flex: 1;
    text-align: left;
    font-size: 0.98rem;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.organizer-chooser-menu__icon {
    display: inline-flex;
    align-items: center;
    color: var(--uranus-muted-text);
    transition: transform 0.2s ease, color 0.2s ease;
}

.organizer-chooser-menu__control[data-open='true'] .organizer-chooser-menu__trigger {
    background: var(--accent-muted);
    color: var(--color-text);
}

.organizer-chooser-menu__control[data-open='true'] .organizer-chooser-menu__icon {
    transform: rotate(180deg);
    color: var(--accent-primary);
}

.organizer-chooser-menu__control[data-loading='true'] .organizer-chooser-menu__icon {
    animation: organizer-chooser-menu-spin 1s linear infinite;
}

.organizer-chooser-menu__dropdown-enter-active,
.organizer-chooser-menu__dropdown-leave-active {
    transition: opacity 0.12s ease, transform 0.12s ease;
}

.organizer-chooser-menu__dropdown-enter-from,
.organizer-chooser-menu__dropdown-leave-to {
    opacity: 0;
    transform: translateY(-6px);
}

.organizer-chooser-menu__dropdown {
  display: flex;
  flex-direction: column;
    margin: 0;
    padding: 0.35rem;
    list-style: none;
    position: absolute;
    top: calc(100% + 0.5rem);
    left: 0;
    width: 100%;
    background: var(--card-bg);
    z-index: 20;
    max-height: 280px;
    overflow-y: auto;
  gap: 4px;
}

.organizer-chooser-menu__item {
    margin: 0;
}

.organizer-chooser-menu__item-btn {
    width: 100%;
    border: none;
    background: transparent;
    display: flex;
    align-items: center;
    text-align: left;
    padding: 0.65rem 1rem;
  border-radius: 8px;
    font-size: 0.95rem;
    color: var(--uranus-muted-text);
    font-weight: 500;
    cursor: pointer;
    transition: background 0.15s ease, color 0.15s ease;

    &:hover {
        background: var(--accent-muted);
        color: var(--color-text);
    }

    &[data-active='true'] {
        background: var(--accent-muted);
        color: var(--color-text);
    }

    &[data-selected='true'] {
        color: var(--color-text);
        background: linear-gradient(135deg, rgba(57, 47, 213, 0.13), rgba(36, 124, 211, 0.17));
        font-weight: 600;
    }
}

.organizer-chooser-menu__item-btn:focus-visible {
    outline: none;
    box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.25);
    background: var(--accent-muted);
}

.organizer-chooser-menu__empty {
    margin: 0;
    padding: 0.75rem 1.1rem 0.75rem 1.5rem;
    font-size: 0.85rem;
    color: var(--uranus-muted-text);
    font-style: italic;
}

@keyframes organizer-chooser-menu-spin {
    0% {
        transform: rotate(0deg);
    }

    49% {
        transform: rotate(0deg);
    }

    50% {
        transform: rotate(180deg);
    }

    99% {
        transform: rotate(180deg);
    }

    100% {
        transform: rotate(360deg);
    }
}
</style>
