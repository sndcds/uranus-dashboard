// The category IDs and colors already used by the event editor and public views.
export const eventCategories = [
    'culture', 'education', 'sports', 'leisure', 'family', 'society', 'creative', 'food_and_drink',
] as const

export function eventCategoryColor(id: number): string {
    const key = eventCategories[id - 1]
    return key ? `var(--uranus-event-category-${key.replaceAll('_', '-')}-color)` : 'var(--uranus-color-4)'
}

export function eventCategoryLabelKey(id: number): string | null {
    const key = eventCategories[id - 1]
    return key ? `event_filter_category_${key}` : null
}
