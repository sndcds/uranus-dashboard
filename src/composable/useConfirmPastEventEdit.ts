import { useI18n } from 'vue-i18n'
import type { AdminEventListItem } from '@/domain/event/adminEventListItem'
import { isPastAdminEvent } from '@/domain/event/adminEventDateRange'

export function useConfirmPastEventEdit() {
    const { t } = useI18n({ useScope: 'global' })

    // Capture the click before RouterLink navigates, including keyboard clicks
    // and opening a link in a new tab with a modifier key.
    return (event: AdminEventListItem, click: MouseEvent): void => {
        if (isPastAdminEvent(event) && !window.confirm(t('event_table_confirm_past_edit'))) {
            click.preventDefault()
            click.stopImmediatePropagation()
        }
    }
}
