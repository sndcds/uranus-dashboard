<template>
    <div class="space-page">
        <section class="space-hero">
            <h1>{{ title }}</h1>
            <p>{{ subtitle }}</p>
        </section>

        <section class="space-card">
            <form class="space-form" @submit.prevent="submitForm">
                <div class="form-grid">
                    <div class="form-group">
                        <label for="name">{{ t('space_name') }}</label>
                        <input v-model="space.name" id="name" type="text" required />
                    </div>
                    <div class="form-group">
                        <label for="total_capacity">{{ t('space_total_capacity') }}</label>
                        <input v-model.number="space.total_capacity" id="total_capacity" type="number" min="0"
                            required />
                    </div>
                    <div class="form-group">
                        <label for="seating_capacity">{{ t('space_seating_capacity') }}</label>
                        <input v-model.number="space.seating_capacity" id="seating_capacity" type="number" min="0"
                            required />
                    </div>
                    <div class="form-group">
                        <label for="building_level">{{ t('space_building_level') }}</label>
                        <input v-model.number="space.building_level" id="building_level" type="number" required />
                    </div>
                    <div class="form-group">
                        <label for="space_type_id">{{ t('space_type') }}</label>
                        <select v-model.number="space.space_type_id" id="space_type_id" required>
                            <option :value="null" disabled>
                                {{ t('select_space_type') }}
                            </option>
                            <option v-for="type in spaceTypes" :key="type.id" :value="type.id">
                                {{ type.name }}
                            </option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label for="website_url">{{ t('website') }}</label>
                        <input v-model="space.website_url" id="website_url" type="url" />
                    </div>
                </div>

                <transition name="fade">
                    <p v-if="errorMessage" class="feedback feedback--error" role="alert">{{ errorMessage }}</p>
                </transition>

                <div class="form-actions">
                    <button :disabled="isSubmitting || isLoadingSpace" type="submit">
                        <span v-if="!isSubmitting">{{ submitLabel }}</span>
                        <span v-else>{{ t(isEditMode ? 'updating' : 'saving') }}</span>
                    </button>
                </div>
            </form>
        </section>
    </div>
</template>

<script setup lang="ts">
import { onMounted, computed, reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { apiFetch } from '@/api'

const route = useRoute()
const router = useRouter()
const { t } = useI18n()
const venueId = Number(route.params.venueId)
const organizerId = Number(route.params.id)
const toSpaceId = (value: unknown): number | null => {
    if (Array.isArray(value)) {
        return toSpaceId(value[0])
    }
    if (typeof value !== 'string') {
        return null
    }
    const trimmed = value.trim()
    if (!trimmed.length) {
        return null
    }
    const parsed = Number(trimmed)
    return Number.isFinite(parsed) ? parsed : null
}

const spaceId = toSpaceId(route.params.spaceId)
const space = reactive({
    name: '',
    total_capacity: 0,
    seating_capacity: 0,
    building_level: 0,
    space_type_id: null as number | null,
    website_url: ''
})

const spaceTypes = ref<Array<{ id: number; name: string }>>([])

const isSubmitting = ref(false)
const isLoadingSpace = ref(false)
const errorMessage = ref<string | null>(null)
const isEditMode = computed(() => spaceId != null)
const title = computed(() => t(isEditMode.value ? 'update_space' : 'create_space'))
const subtitle = computed(() => t(isEditMode.value ? 'space_edit_subtitle' : 'space_details_subtitle'))
const submitLabel = computed(() => t(isEditMode.value ? 'update_space' : 'save_space'))
const spaceLoadErrorMessage = computed(() => t('space_load_error'))

onMounted(async () => {
    await fetchSpaceTypes()
    if (spaceId != null) {
        await loadSpaceById(spaceId)
    }
})

async function fetchSpaceTypes() {
    try {
        const { data, status } = await apiFetch<Array<{ id: number; name: string }> | { space_types?: Array<{ id: number; name: string }> }>('/api/space/types', {
            method: 'GET',
        })

        if (status >= 200 && status < 300) {
            let types: Array<{ id: number; name: string }> | undefined

            if (Array.isArray(data)) {
                types = data
            } else if (data && typeof data === 'object' && 'space_types' in data && Array.isArray(data.space_types)) {
                types = data.space_types
            }

            if (types) {
                spaceTypes.value = types
                return
            }
        }

        console.error(`Failed to fetch space types (status ${status}).`)
    } catch (error) {
        console.error('Error fetching space types:', error)
    }
}

const toNumber = (value: unknown, fallback = 0): number => {
    if (typeof value === 'number' && Number.isFinite(value)) {
        return value
    }
    if (typeof value === 'string') {
        const parsed = Number(value.trim())
        if (Number.isFinite(parsed)) {
            return parsed
        }
    }
    return fallback
}

const toNullableNumber = (value: unknown): number | null => {
    if (typeof value === 'number' && Number.isFinite(value)) {
        return value
    }
    if (typeof value === 'string') {
        const parsed = Number(value.trim())
        return Number.isFinite(parsed) ? parsed : null
    }
    return null
}

async function loadSpaceById(id: number) {
    isLoadingSpace.value = true
    errorMessage.value = null
    try {
        const { data } = await apiFetch<SpaceResponse | null>(`/api/admin/space/${id}`)
        if (!data) {
            throw new Error('Space not found')
        }

        space.name = typeof data.name === 'string' ? data.name : ''
        space.total_capacity = toNumber(data.total_capacity, 0)
        space.seating_capacity = toNumber(data.seating_capacity, 0)
        space.building_level = toNumber(data.building_level, 0)
        space.space_type_id = toNullableNumber(data.space_type_id)
        space.website_url = typeof data.website_url === 'string' ? data.website_url : ''
    } catch (error) {
        console.error('Failed to load space', error)
        errorMessage.value = spaceLoadErrorMessage.value
    } finally {
        isLoadingSpace.value = false
    }
}

async function submitForm() {
    const spaceTypeId = space.space_type_id

    if (spaceTypeId === null) {
        errorMessage.value = t('select_space_type_error')
        return
    }

    const trimmedWebsite = space.website_url.trim()
    const normalizedWebsite = trimmedWebsite.length
        ? trimmedWebsite.startsWith('http://') || trimmedWebsite.startsWith('https://')
            ? trimmedWebsite
            : `https://${trimmedWebsite}`
        : ''

    const payload: SpacePayload = {
        name: space.name,
        total_capacity: space.total_capacity,
        seating_capacity: space.seating_capacity,
        building_level: space.building_level,
        space_type_id: spaceTypeId,
        website_url: normalizedWebsite,
        venue_id: venueId
    }

    isSubmitting.value = true
    errorMessage.value = null

    try {
        const endpoint = isEditMode.value && spaceId != null ? `/api/admin/space/${spaceId}` : '/api/admin/space/create'
        const method = isEditMode.value ? 'PUT' : 'POST'
        const { status } = await apiFetch(endpoint, {
            method,
            body: JSON.stringify(payload),
        })

        if (status >= 200 && status < 300) {
            if (Number.isFinite(organizerId)) {
                router.push(`/organizer/${organizerId}/venues`)
            }

            if (isEditMode.value) {
                router.push(`/organizer/${organizerId}/venues`)
            }
        } else {
            const failureKey = isEditMode.value ? 'update_space_failed' : 'save_space_failed'
            errorMessage.value = `${t(failureKey)} (status ${status}).`
        }
    } catch (error: unknown) {
        const defaultError = t(isEditMode.value ? 'update_space_failed' : 'save_space_failed')
        if (typeof error === 'object' && error && 'data' in error) {
            const err = error as { data?: { error?: string } }
            errorMessage.value = err.data?.error ?? defaultError
        } else if (error instanceof Error) {
            errorMessage.value = error.message || defaultError
        } else {
            errorMessage.value = defaultError
        }
    } finally {
        isSubmitting.value = false
    }
}


interface Space {
    name: string
    total_capacity: number
    seating_capacity: number
    building_level: number
    space_type_id: number | null
    website_url: string
    venue_id: number
}

type SpacePayload = Omit<Space, 'space_type_id'> & { space_type_id: number }

interface SpaceResponse {
    name?: string | null
    total_capacity?: number | string | null
    seating_capacity?: number | string | null
    building_level?: number | string | null
    space_type_id?: number | string | null
    website_url?: string | null
}
</script>

<style scoped lang="scss">
.space-page {
    @include form-page();
}

.space-hero {
    @include form-hero(540px);
}

.space-card {
    @include form-card(720px, clamp(1.75rem, 4vw, 2.5rem), clamp(1.25rem, 3vw, 1.75rem));
}

.space-form {
    display: flex;
    flex-direction: column;
    gap: clamp(1.5rem, 3vw, 2rem);
}

.form-grid {
    @include form-grid();
}

.form-group {
    @include form-group();
}

.form-actions {
    display: flex;
    justify-content: flex-end;
}

button {
    @include form-primary-button($padding-y: 0.85rem, $padding-x: 2rem);
}

.feedback {
    @include form-feedback();

    &--error {
        @include form-feedback-error();
    }
}

.fade-enter-active,
.fade-leave-active {
    transition: opacity 0.25s ease;
}

.fade-enter-from,
.fade-leave-to {
    opacity: 0;
}

@media (max-width: 540px) {
    .space-card {
        padding: clamp(1.25rem, 6vw, 1.8rem);
    }

    .form-actions {
        justify-content: center;
    }
}
</style>
