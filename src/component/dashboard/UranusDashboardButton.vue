<template>
  <!-- Render router-link if "to" is provided -->
  <router-link
      v-if="to"
      :to="to"
      :class="['uranus-button', modeClass]"
  >
    <component
        v-if="iconComponent"
        :is="iconComponent"
        class="uranus-button-icon"
    />
    <slot />
  </router-link>

  <!-- Or render native button -->
  <button
      v-else
      :type="type"
      :class="['uranus-button', modeClass]"
      :disabled="disabled"
  >
    <component
        v-if="iconComponent"
        :is="iconComponent"
        class="uranus-button-icon"
    />
    <slot />
  </button>
</template>

<script setup lang="ts">
import { computed } from 'vue'

// Import external SVGs
import EditIcon from '@/assets/icons/edit.svg'
import DeleteIcon from '@/assets/icons/delete.svg'
import AddIcon from '@/assets/icons/add.svg'
import OrganizationIcon from '@/assets/icons/organization.svg'

const props = defineProps<{
  to?: string
  icon?: 'edit' | 'delete' | 'add' | 'organization' | 'image'
  disabled?: boolean
  type?: 'button' | 'submit' | 'reset'
}>()

const type = computed(() => props.type ?? 'button')

const icons: Record<string, any> = {
  edit: EditIcon,
  delete: DeleteIcon,
  add: AddIcon,
  organization: OrganizationIcon
}

const iconComponent = computed(() => (props.icon ? icons[props.icon] : null))

// optional: hover / mode classes
const modeClass = computed(() => ({
  'clickable': !!props.icon || !!props.to
}))
</script>

<style scoped lang="scss">

a {
  color: var(--uranus-button-color);
  &:hover {
    color: var(--uranus-button-color-hover);
  }
}

</style>
