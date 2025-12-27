<template>
    <UranusTextInput :id="titleId"
                     v-model="localTitle"
                     :label="t('title')"
                     :error="titleError"
                     size="big"
                     required
    />

    <UranusTextInput :id="subtitleId"
                     v-model="localSubtitle"
                     :label="t('subtitle')"
    />
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import UranusTextInput from "@/components/ui/UranusTextInput.vue";

const props = defineProps<{
    title: string
    subtitle: string
    titleError?: string | null
    titleId?: string
    subtitleId?: string
}>()

const emit = defineEmits<{
    (e: 'update:title', value: string): void
    (e: 'update:subtitle', value: string): void
}>()

const { t } = useI18n({ useScope: 'global' })

const localTitle = computed({
    get: () => props.title,
    set: (value: string) => emit('update:title', value),
})

const localSubtitle = computed({
    get: () => props.subtitle,
    set: (value: string) => emit('update:subtitle', value),
})

const titleId = computed(() => props.titleId ?? 'event-title')
const subtitleId = computed(() => props.subtitleId ?? 'event-subtitle')

const titleError = computed(() => props.titleError ?? null)
</script>
