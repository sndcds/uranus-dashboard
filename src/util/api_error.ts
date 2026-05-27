/*
    src/util/api_error.ts
 */

export function apiErrorI18nKey(
    status: number,
    default_key: string
): string {
    if (status === 401) {
        return 'error_message_incorrect_password'
    }
    if (status === 403) {
        return 'error_message_forbidden_action'
    }
    return default_key
}