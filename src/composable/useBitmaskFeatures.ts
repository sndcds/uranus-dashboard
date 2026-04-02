/*
    src/composable/useBitmaskFeatures.ts
*/

import { computed, type Ref, type WritableComputedRef } from 'vue'

export function useBitmaskFeatures<K extends string>(
    source: Ref<Record<K, number>>,
    key: K,
    options: readonly { label: string; value: number }[]
) {
    function createModel(value: number): WritableComputedRef<boolean> {
        return computed({
            get() {
                const current = Number(source.value[key] ?? 0)
                return Boolean(current & value) // returns true only if this bit is set
            },
            set(enabled: boolean) {
                const current = Number(source.value[key] ?? 0)
                source.value[key] = enabled
                    ? current | value
                    : current & ~value
            }
        })
    }

    const items = computed(() =>
        options.map(opt => ({
            ...opt,
            model: createModel(opt.value)
        }))
    )

    return { items }
}