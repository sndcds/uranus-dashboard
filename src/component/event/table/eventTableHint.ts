import { shallowRef } from 'vue'

// One tooltip at a time, including when a category hint is inside a cell hint.
export const activeEventTableHint = shallowRef<symbol | null>(null)
