<template>
    <div>
        <div class="form-group">
            <label :for="countrySelectId">
                {{ countryLabel }}
            </label>
            <select :id="countrySelectId" v-model="countryModel" :disabled="countriesLoading">
                <option value="" disabled>
                    {{ countryPlaceholder }}
                </option>
                <option v-for="country in countries" :key="country.code" :value="country.code">
                    {{ country.name }}
                </option>
            </select>
        </div>
        <div class="form-group">
            <label :for="stateSelectId">
                {{ stateLabel }}
            </label>
            <select :id="stateSelectId" v-model="stateModel" :disabled="statesLoading || !countryModel">
                <option value="" disabled>
                    {{ statePlaceholder }}
                </option>
                <option v-for="state in states" :key="state.code" :value="state.code">
                    {{ state.name }}
                </option>
            </select>
        </div>
    </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'

import { apiFetch } from '@/api'

const countryModel = defineModel<string>('countryCode', { default: '' })
const stateModel = defineModel<string>('stateCode', { default: '' })

interface CountryResponse {
    country_code: string
    country_name?: string | null
}

interface StateResponse {
    state_code: string
    state_name?: string | null
}

const { t, te, locale } = useI18n()

const countries = ref<Array<{ code: string; name: string }>>([])
const states = ref<Array<{ code: string; name: string }>>([])
const countriesLoading = ref(false)
const statesLoading = ref(false)
let pendingStateCountry: string | null = null
let pendingCountryReload = false

const countrySelectId = 'region-selector-country'
const stateSelectId = 'region-selector-state'

const countryLabel = computed(() => t('organizer_country_code'))
const stateLabel = computed(() => t('organizer_state_code'))
const countryPlaceholder = computed(() =>
    te('organizer_country_placeholder') ? t('organizer_country_placeholder') : 'Select country'
)
const statePlaceholder = computed(() =>
    te('organizer_state_placeholder') ? t('organizer_state_placeholder') : 'Select state'
)

const ensureCountryOption = (code: string) => {
    const trimmed = code.trim()
    if (!trimmed.length) {
        return
    }
    if (!countries.value.some((country) => country.code === trimmed)) {
        countries.value.push({ code: trimmed, name: trimmed })
    }
}

const ensureStateOption = (code: string) => {
    const trimmed = code.trim()
    if (!trimmed.length) {
        return
    }
    if (!states.value.some((state) => state.code === trimmed)) {
        states.value.push({ code: trimmed, name: trimmed })
    }
}

const loadCountries = async () => {
    if (countriesLoading.value) {
        pendingCountryReload = true
        return
    }

    countriesLoading.value = true
    pendingCountryReload = false
    try {
        const { data } = await apiFetch<CountryResponse[]>(`/api/choosable-countries?lang=${locale.value}`)
        if (Array.isArray(data)) {
            countries.value = data
                .map((item) => {
                    const code = typeof item.country_code === 'string' ? item.country_code.trim() : ''
                    if (!code.length) {
                        return null
                    }
                    const rawLabel = item.country_name ?? ''
                    const label = typeof rawLabel === 'string' ? rawLabel.trim() : ''
                    return { code, name: label.length ? label : code }
                })
                .filter((value): value is { code: string; name: string } => Boolean(value))
        } else {
            countries.value = []
        }
    } catch (err) {
        countries.value = []
        console.error('Failed to load countries', err)
    } finally {
        countriesLoading.value = false
        if (pendingCountryReload) {
            pendingCountryReload = false
            await loadCountries()
            return
        }
        ensureCountryOption(countryModel.value)
    }
}

const loadStates = async (countryCode: string) => {
    const trimmedCountry = countryCode.trim()
    if (!trimmedCountry.length) {
        states.value = []
        pendingStateCountry = null
        return
    }

    if (statesLoading.value) {
        pendingStateCountry = trimmedCountry
        return
    }

    statesLoading.value = true
    try {
        const { data } = await apiFetch<StateResponse[]>(
            `/api/choosable-states?country-code=${encodeURIComponent(trimmedCountry)}`
        )
        if (Array.isArray(data)) {
            states.value = data
                .map((item) => {
                    const code = typeof item.state_code === 'string' ? item.state_code.trim() : ''
                    if (!code.length) {
                        return null
                    }
                    const rawLabel = item.state_name ?? ''
                    const label = typeof rawLabel === 'string' ? rawLabel.trim() : ''
                    return { code, name: label.length ? label : code }
                })
                .filter((value): value is { code: string; name: string } => Boolean(value))
        } else {
            states.value = []
        }
    } catch (err) {
        states.value = []
        console.error('Failed to load states', err)
    } finally {
        statesLoading.value = false
        if (pendingStateCountry && pendingStateCountry !== trimmedCountry) {
            const next = pendingStateCountry
            pendingStateCountry = null
            await loadStates(next)
        } else {
            pendingStateCountry = null
        }
        ensureStateOption(stateModel.value)
        if (
            stateModel.value &&
            !states.value.some((state) => state.code === stateModel.value.trim())
        ) {
            stateModel.value = ''
        }
    }
}

watch(
    () => countryModel.value,
    (code, previous) => {
        const trimmed = code.trim()
        if (!trimmed.length) {
            states.value = []
            if (stateModel.value) {
                stateModel.value = ''
            }
            pendingStateCountry = null
            return
        }

        ensureCountryOption(trimmed)

        const previousTrimmed = typeof previous === 'string' ? previous.trim() : ''
        if (previousTrimmed && previousTrimmed !== trimmed) {
            stateModel.value = ''
        }

        loadStates(trimmed)
    },
    { immediate: true }
)

watch(
    () => stateModel.value,
    (code) => {
        if (!code.trim().length) {
            return
        }
        ensureStateOption(code)
    }
)

watch(
    () => locale.value,
    () => {
        loadCountries()
        if (countryModel.value.trim().length) {
            loadStates(countryModel.value)
        }
    }
)

onMounted(() => {
    loadCountries()
})
</script>

<style scoped lang="scss">
</style>
