/*
    src/composable/useBigIntFlags.ts
 */

import { ref, computed } from 'vue';

export type BigIntFlags = Record<number, boolean>

export function setBigintByFlags(flags: BigIntFlags) {
    let val= 0n
    // Loop through all flags and combine into a single BigInt
    for (const flagIdStr in flags) {
        const flagId = Number(flagIdStr)
        if (flags[flagId]) {
            val |= 1n << BigInt(flagId) // set the corresponding bit
        }
    }
    return val
}

/**
 * Manage a single 64-bit bigint as a set of flags
 */
export function useBigIntFlags(initialValue: bigint = 0n) {
    const value = ref<bigint>(initialValue)
    const BITS = 64n

    /** Check if a bit is set */
    function isSet(bitIndex: number): boolean {
        if (bitIndex < 0 || bitIndex >= Number(BITS)) return false
        return (value.value & (1n << BigInt(bitIndex))) !== 0n
    }

    /** Set or clear a bit */
    function set(bitIndex: number, flag: boolean) {
        if (bitIndex < 0 || bitIndex >= Number(BITS)) return

        if (flag) {
            value.value |= 1n << BigInt(bitIndex)
        } else {
            value.value &= ~(1n << BigInt(bitIndex))
        }
    }

    /** Computed ref for v-model binding */
    function flagComputed(bitIndex: number) {
        return computed({
            get: () => isSet(bitIndex),
            set: (flag: boolean) => set(bitIndex, flag),
        })
    }

    return { value, isSet, set, flagComputed }
}