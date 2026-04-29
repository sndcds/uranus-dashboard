/*
    src/util/UranusStringUtils.ts
 */

// TODO: Check

export function uranusCapitalizeFirst(str: string) {
    return str.charAt(0).toUpperCase() + str.slice(1)
}

/**
 * Replace placeholders in a string with values.
 * Example: "Hello ~~name~~" with { name: "Alice" } => "Hello Alice"
 */
export function uranusStringInterpolate(
    template: string,
    values: Record<string, string | number | undefined | null>
): string {
    return template.replace(/~~(\w+)~~/g, (_, key) => {
        const val = values[key];
        // Convert undefined/null to empty string, otherwise use value
        return val != null ? String(val) : '';
    });
}

export function uranusPluralizedText(
    t: (key: string) => string,
    singularKey: string,
    pluralKey: string,
    count: number,
): string {
    const template = count === 1 ? t(singularKey) : t(pluralKey)
    return uranusStringInterpolate(template, { count })
}

type TranslateFn = (key: string) => string

export function uranusAgeRangeInfo(
    t: TranslateFn,
    min?: number | null,
    max?: number | null
): string | null {
    const hasMin = min != null
    const hasMax = max != null
    if (!hasMin && !hasMax) return null

    if (hasMin && hasMax) {
        return uranusStringInterpolate(
            t('event_age_between'),
            { min: min, max: max }
        )
    }

    if (hasMin) {
        return uranusStringInterpolate(
            t('event_age_from'),
            { min: min }
        )
    }

    if (hasMax) {
        return uranusStringInterpolate(
            t('event_age_until'),
            { max: max }
        )
    }

    return null
}

// TODO: Check
export function uranusFormatSimpleDate(input: string, locale = 'en') {
    const date = new Date(input);
    const weekday = date.toLocaleDateString(locale, { weekday: 'short' });
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    return `${weekday} ${day}/${month}`;
}


export const uranusFormatDateTime = (dateStr: string, timeStr?: string | null, locale = 'en') => {
    if (!dateStr) return ''
    const dateTime = timeStr ? new Date(`${dateStr}T${timeStr}`) : new Date(dateStr)
    return new Intl.DateTimeFormat(locale, {
        dateStyle: 'short',
        timeStyle: timeStr ? 'short' : undefined
    }).format(dateTime)
}

export const uranusFormatDayMonth = (dateString: string, locale: string) => {
    const date = new Date(dateString)
    const parts = new Intl.DateTimeFormat(locale, {
        day: '2-digit',
        month: '2-digit',
    }).formatToParts(date)
    const day = parts.find(p => p.type === 'day')?.value
    const month = parts.find(p => p.type === 'month')?.value
    return `${day}.${month}.`

}

// TODO: Check
export function uranusFormatFullDate(
    input: string | number | Date,
    locale: string = 'en'
): string {
    const date = new Date(input);

    if (isNaN(date.getTime())) {
        return ''; // handle invalid dates
    }

    // Format with full weekday, numeric day, month, and year according to locale
    return new Intl.DateTimeFormat(locale, {
        weekday: 'long', // full weekday name
        year: 'numeric',
        month: 'long',   // full month name
        day: 'numeric',
    }).format(date);
}

export function uranusReplaceInTemplate<T extends Record<string, unknown>>(
    template: string,
    values: T
): string {
    let result = ""
    let keyBuffer = ""
    let insideBraces = false
    for (let i = 0;i < template.length;i++) {
        const char = template[i]
        if (char === "[") {
            if (insideBraces) {
                // Handle consecutive '<'
                result += `{${keyBuffer}`
                keyBuffer = ""
                continue
            }
            insideBraces = true
            keyBuffer = ""
            continue
        }
        if (char === "]" && insideBraces) {
            insideBraces = false
            if (keyBuffer in values && values[keyBuffer] != null) {
                result += String(values[keyBuffer])
            } else {
                result += `{${keyBuffer}}` // leave placeholder if key missing
            }
            keyBuffer = ""
            continue
        }
        if (insideBraces) {
            keyBuffer += char
        } else {
            result += char
        }
    }
    // Handle unclosed '{'
    if (insideBraces) {
        result += `{${keyBuffer}`
    }
    return result
}

// TODO: Check
export function uranusAgeText(
    t: (key: string) => string,
    minAge: number | null | undefined,
    maxAge: number | null | undefined
): string {
    if (minAge != null && maxAge == null) {
        const template = t('from_age_sentence'); // e.g. "From {age}"
        return template.replace('{age}', minAge.toString());
    }

    if (minAge == null && maxAge != null) {
        const template = t('to_age_sentence'); // e.g. "Up to {age}"
        return template.replace('{age}', maxAge.toString());
    }

    if (minAge != null && maxAge != null) {
        const template = t('age_range_sentence'); // e.g. "{from} – {to}"
        return template
            .replace('{from}', minAge.toString())
            .replace('{to}', maxAge.toString());
    }

    return '';
}


export function uranusPriceText(
    t: (key: string) => string,
    min: number | null | undefined,
    max: number | null | undefined,
    currency?: string | null
): string | null {
    const formatNumber = (value: number) => {
        return new Intl.NumberFormat(navigator.language, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }).format(value)
    }

    if (min && max) {
        return uranusStringInterpolate(t('event_price_between_sentence'), {
            min: formatNumber(min), max: formatNumber(max), currency: currency
        });
    }
    if (min) {
        return uranusStringInterpolate(t('event_price_from_sentence'), {
            min: formatNumber(min), currency: currency
        });
    }
    if (max) {
        return uranusStringInterpolate(t('event_price_until_sentence'), {
            max: formatNumber(max), currency: currency
        });
    }
    return null
}