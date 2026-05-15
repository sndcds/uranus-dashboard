import { onBeforeUnmount, onMounted } from 'vue'

type SaveShortcutOptions = {
  enabled?: () => boolean
}

export function useSaveShortcut(
  save: () => Promise<void> | void,
  options: SaveShortcutOptions = {}
) {
  const onKeydown = (event: KeyboardEvent) => {
    if (!(event.ctrlKey || event.metaKey) || event.key.toLowerCase() !== 's') return
    if (options.enabled && !options.enabled()) return

    event.preventDefault()
    void save()
  }

  onMounted(() => {
    document.addEventListener('keydown', onKeydown)
  })

  onBeforeUnmount(() => {
    document.removeEventListener('keydown', onKeydown)
  })
}
