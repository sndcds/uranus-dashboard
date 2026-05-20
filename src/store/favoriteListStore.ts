import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import {
    createEmptyFavoriteList,
    type FavoriteList,
    mapFavoriteList,
} from '@/domain/favorite/favoriteList.model.ts'

export const useFavoriteListStore = defineStore('favoriteList', () => {
    const original = ref<FavoriteList | null>(null)
    const draft = ref<FavoriteList | null>(null)
    const loading = ref(false)
    const saving = ref(false)
    const error = ref<string | null>(null)

    const isLoaded = computed(() => !!draft.value)
    const isDirty = computed(() => {
        if (!original.value || !draft.value) return false
        return (
            normalize(original.value.name) !== normalize(draft.value.name) ||
            normalize(original.value.description) !== normalize(draft.value.description)
        )
    })

    function cloneFavoriteList(list: FavoriteList): FavoriteList {
        return { ...list }
    }

    function loadFromApi(raw: any) {
        const list = mapFavoriteList(raw)
        if (!list) {
            error.value = 'Failed to map favorite list'
            return
        }
        original.value = list
        draft.value = cloneFavoriteList(list)
    }

    function resetToEmpty(orgUuid: string | null) {
        const empty = createEmptyFavoriteList(orgUuid)
        original.value = empty
        draft.value = cloneFavoriteList(empty)
        error.value = null
    }

    function clear() {
        original.value = null
        draft.value = null
        error.value = null
    }

    function commitDraftToOriginal() {
        if (!draft.value) return
        original.value = cloneFavoriteList(draft.value)
    }

    return {
        original,
        draft,
        loading,
        saving,
        error,
        isLoaded,
        isDirty,
        loadFromApi,
        resetToEmpty,
        clear,
        commitDraftToOriginal,
    }
})

function normalize(value: string | null | undefined) {
    return value === '' || value == null ? null : value
}
