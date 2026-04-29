/*
    src/composable/useApi.ts
 */

export function camelCaseKeys<T>(obj: any): T {
    if (Array.isArray(obj)) return obj.map(camelCaseKeys) as any;
    if (obj !== null && typeof obj === "object") {
        return Object.fromEntries(
            Object.entries(obj).map(([k, v]) => [
                k.replace(/_([a-z])/g, (_, c) => c.toUpperCase()),
                camelCaseKeys(v),
            ])
        ) as any;
    }
    return obj;
}