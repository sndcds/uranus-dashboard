export function capitalizeFirst(str: string) {
    return str.charAt(0).toUpperCase() + str.slice(1)
}

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
    minPrice: number | undefined,
    maxPrice: number | undefined,
    locale: string | null,
    currency?: string | null
): string {
    const resolvedLocale = locale ?? 'en';
    const hasCurrency = !!currency;

    const options: Intl.NumberFormatOptions = {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
        style: hasCurrency ? 'currency' : 'decimal',
    };

    if (hasCurrency && currency) {
        options.currency = currency;
    }

    const formatter = new Intl.NumberFormat(resolvedLocale, options);

    if (minPrice !== undefined && maxPrice === undefined) {
        const template = t('price_from_sentence'); // e.g. "From {price}"
        return template.replace('{price}', formatter.format(minPrice));
    }

    if (minPrice === undefined && maxPrice !== undefined) {
        const template = t('price_to_sentence'); // e.g. "Up to {price}"
        return template.replace('{price}', formatter.format(maxPrice));
    }

    if (minPrice !== undefined && maxPrice !== undefined) {
        const template = t('price_range_sentence'); // e.g. "{from} – {to}"
        return template
            .replace('{from}', formatter.format(minPrice))
            .replace('{to}', formatter.format(maxPrice));
    }

    return '';
}