export function capitalizeFirst(str: string) {
    return str.charAt(0).toUpperCase() + str.slice(1)
}

export function uranusCombineTwoPartString(s1: string | null, s2: string | null): string {
    const s1Normalized = s1 ?? "";
    if (!s2 || s2.trim() === "") {
        return s1Normalized;
    }
    return `${s1Normalized} / ${s2}`;
}

export function uranusFormatSimpleDate(input: string, locale = 'en') {
    const date = new Date(input);
    const weekday = date.toLocaleDateString(locale, { weekday: 'short' });
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    return `${weekday} ${day}/${month}`;
}

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

export function replaceInTemplate<T extends Record<string, unknown>>(
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

export function uranusAgeText(
    t: (key: string, values?: Record<string, unknown>) => string,
    minAge: number | undefined,
    maxAge: number | undefined
): string {
    if (minAge != undefined && maxAge == undefined) {
        return t('from_age_sentence', { age: minAge })
    }
    if (minAge == undefined && maxAge != undefined) {
        return t('to_age_sentence', { age: maxAge })
    }
    if (minAge != undefined && maxAge != undefined) {
        return t('age_range_sentence', { from: minAge, to: maxAge })
    }
    return ''
}

export function uranusPriceText(
    t: (key: string, values?: Record<string, unknown>) => string,
    minPrice: number | undefined,
    maxPrice: number | undefined,
    locale: string | null,
    currency?: string | null
): string {
    const resolvedLocale = locale ?? 'en';
    const hasCurrency = !!currency; // true if currency is provided

    const options: Intl.NumberFormatOptions = {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
        style: hasCurrency ? 'currency' : 'decimal',
    };

    if (hasCurrency && currency) {
        options.currency = currency; // only set currency if provided
    }

    const formatter = new Intl.NumberFormat(resolvedLocale, options);

    if (minPrice !== undefined && maxPrice === undefined) {
        return t('price_from_sentence', { price: formatter.format(minPrice) });
    }
    if (minPrice === undefined && maxPrice !== undefined) {
        return t('price_to_sentence', { price: formatter.format(maxPrice) });
    }
    if (minPrice !== undefined && maxPrice !== undefined) {
        return t('price_range_sentence', {
            from: formatter.format(minPrice),
            to: formatter.format(maxPrice)
        });
    }
    return '';
}