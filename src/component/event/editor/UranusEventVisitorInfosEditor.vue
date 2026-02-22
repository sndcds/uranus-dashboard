<!--
  src/component/event/editor/UranusEventVisitorInfosEditor.vue
-->

<template>

  <UranusBigIntFlagsEditor
      :topics="uranusI18nVisitorInformationFlags"
      v-model="event.visitorInfoFlags!"
      @update:modelValue="onUpdateFlags"
  />

</template>


<script setup lang="ts">
import { computed } from 'vue'
import UranusBigIntFlagsEditor from '@/component/uranus/UranusBigIntFlagsEditor.vue'
import { uranusI18nVisitorInformationFlags} from '@/i18n/uranus-i18n-visitor-information'
import { useUranusAdminEventStore } from '@/store/uranusAdminEventStore.ts'

const store = useUranusAdminEventStore()
const event = computed(() => store.draft!)

/*
const isDirty = computed(() => {
  if (!store.draft || !store.original) return false
  const d = store.draft
  const o = store.original
  return (d.visitorInfoFlags ?? null) !== (o.visitorInfoFlags ?? null)
})
*/
function onUpdateFlags() {

}
/*
async function saveVisitorFlags(newValue: bigint) {
  if (!event.value) return

  await apiFetch(`/api/admin/space/${event.value.id}/fields`, {
    method: 'PUT',
    body: JSON.stringify({
      visitor_information_flags: newValue.toString(),
    }),
  })

  store.original!.visitorInfoFlags = newValue
}
*/

</script>
