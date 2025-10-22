<template>
    <div class="title-fields">
        <div class="form-field">
            <label :for="titleId">
                {{ t('event_title_label') }}
                <span class="required">*</span>
            </label>
            <input
                :id="titleId"
                v-model="localTitle"
                type="text"
                :placeholder="t('event_title_placeholder')"
                autocomplete="off"
            />
            <p v-if="titleError" class="field-error">{{ titleError }}</p>
        </div>

        <div class="form-field">
            <label :for="subtitleId">{{ t('event_subtitle_label') }}</label>
            <input
                :id="subtitleId"
                v-model="localSubtitle"
                type="text"
                :placeholder="t('event_subtitle_placeholder')"
                autocomplete="off"
            />
        </div>
    </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

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

<style scoped lang="scss">
.title-fields {
    display: flex;
    flex-direction: column;
    gap: clamp(1rem, 2.5vw, 1.5rem);
}

.form-field {
    @include form-group();
}

.field-error {
    margin: 0;
    font-size: 0.85rem;
    color: #b91c1c;
    font-weight: 600;
}
</style>
