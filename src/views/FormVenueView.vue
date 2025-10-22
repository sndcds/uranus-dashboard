<template>
    <div class="venue-page">
        <section class="venue-hero">
            <h1>{{ t('create_venue') }}</h1>
            <p>{{ venueDescription }}</p>
        </section>

        <section class="venue-card">
            <div class="venue-layout">
                <form class="venue-form" @submit.prevent="submitForm">
                    <div class="form-grid">
                        <div class="form-group">
                            <label for="venue_name">{{ t('venue_name') }}</label>
                            <input v-model="venueName" id="venue_name" type="text" required />
                        </div>
                        <div class="form-group">
                            <label for="street">{{ t('street') }}</label>
                            <input v-model="street" id="street" type="text" required />
                        </div>
                        <div class="form-group">
                            <label for="house_number">{{ t('house_number') }}</label>
                            <input v-model="houseNumber" id="house_number" type="text" required />
                        </div>
                        <div class="form-group">
                            <label for="postal_code">{{ t('postal_code') }}</label>
                            <input v-model="postalCode" id="postal_code" type="text" required />
                        </div>
                        <div class="form-group">
                            <label for="city">{{ t('city') }}</label>
                            <input v-model="city" id="city" type="text" required />
                        </div>
                        <div class="form-group">
                            <label for="email">{{ t('email') }}</label>
                            <input v-model="email" id="email" type="email" required />
                        </div>
                        <div class="form-group">
                            <label for="website">{{ t('website') }}</label>
                            <input v-model="website" id="website" type="url" required />
                        </div>
                        <div class="form-group">
                            <label for="phone">{{ t('phone') }}</label>
                            <input v-model="phone" id="phone" type="tel" required />
                        </div>
                    </div>

                    <div class="form-actions">
                        <button type="submit">{{ t('create_venue') }}</button>
                    </div>
                </form>

                <aside class="venue-map-panel">
                    <LocationMapComponent v-model="location" :zoom="13" :selectable="true">
                        <template #footer>
                            {{ mapHint }}
                        </template>
                    </LocationMapComponent>
                    <div class="location-meta">
                        <span class="meta-label">{{ t('location') }}</span>
                        <span class="meta-value">{{ locationSummary }}</span>
                    </div>
                </aside>
            </div>

            <transition name="fade">
                <p v-if="error" class="feedback feedback--error">{{ error }}</p>
            </transition>
            <transition name="fade">
                <p v-if="success" class="feedback feedback--success">{{ success }}</p>
            </transition>
        </section>
    </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import type { LatLngLiteral } from 'leaflet'
import { useI18n } from 'vue-i18n'
import { useRoute } from 'vue-router'
import { apiFetch } from '../api'
import LocationMapComponent from '@/components/LocationMapComponent.vue'

const { t, te } = useI18n()
const route = useRoute()
const organizerId = Number(route.params.id)

const venueName = ref('')
const street = ref('')
const houseNumber = ref('')
const postalCode = ref('')
const city = ref('')
const email = ref('')
const website = ref('')
const phone = ref('')
const location = ref<LatLngLiteral | null>(null)
const error = ref<string | null>(null)
const success = ref<string | null>(null)

const venueDescription = computed(() => (te('venue_create_description') ? t('venue_create_description') : 'Add the essential information for your venue profile.'))
const mapHint = computed(() => (te('venue_map_hint') ? t('venue_map_hint') : 'Click the map to drop a pin where the venue is located.'))
const locationSummary = computed(() => {
    if (!location.value) {
        return te('venue_map_no_selection') ? t('venue_map_no_selection') : 'No location selected yet'
    }
    const { lat, lng } = location.value
    return `${lat.toFixed(5)}, ${lng.toFixed(5)}`
})

const submitForm = async () => {
    try {
        error.value = null
        const payload: Record<string, unknown> = {
            name: venueName.value,
            street: street.value,
            house_number: houseNumber.value,
            postal_code: postalCode.value,
            city: city.value,
            contact_email: email.value,
            website_url: website.value,
            contact_phone: phone.value,
            organizer_id: organizerId
        }

        if (location.value) {
            payload.latitude = location.value.lat
            payload.longitude = location.value.lng
        }

        const { status } = await apiFetch('/api/admin/venue/create', {
            method: 'POST',
            body: JSON.stringify(payload),
        })
        if (status >= 200 && status < 300) {
            success.value = t('venue_created')
        } else {
            throw new Error('Unexpected status code')
        }
    } catch (err: unknown) {
        success.value = null
        if (typeof err === 'object' && err && 'data' in err) {
            const e = err as { data?: { error?: string } }
            error.value = e.data?.error || t('failed_to_create_venue')
        } else {
            error.value = t('unknown_error')
        }
    }
}
</script>

<style scoped lang="scss">
.venue-page {
    @include form-page();
}

.venue-hero {
    @include form-hero(960px);
}

.venue-card {
    @include form-card(960px, clamp(1.75rem, 4vw, 2.75rem), clamp(1.25rem, 3vw, 1.75rem));
}

.venue-layout {
    display: grid;
    gap: clamp(1.5rem, 3vw, 2.25rem);
    grid-template-columns: minmax(0, 1.2fr) minmax(320px, 0.8fr);
}

.venue-form {
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

.venue-map-panel {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
}

.location-meta {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 0.5rem;
    font-size: 0.9rem;
    background: var(--input-bg);
    border-radius: 14px;
    padding: 0.75rem 1rem;
}

.meta-label {
    font-weight: 600;
    color: var(--color-text);
    text-transform: uppercase;
    letter-spacing: 0.08em;
    font-size: 0.78rem;
}

.meta-value {
    font-variant-numeric: tabular-nums;
    color: var(--muted-text);
}

.feedback {
    @include form-feedback();

    &--error {
        @include form-feedback-error();
    }

    &--success {
        @include form-feedback-success();
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

@media (max-width: 900px) {
    .venue-layout {
        grid-template-columns: 1fr;
    }

    .form-actions {
        justify-content: center;
    }
}

@media (max-width: 540px) {
    .venue-card {
        padding: clamp(1.25rem, 6vw, 1.8rem);
    }
}
</style>
