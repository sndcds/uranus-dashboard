<!--
  UranusImageEdit.vue
-->
<template>
  <div class="image-grid">
    <UranusImageSlot
        v-for="(id, index) in imagesIds"
        :key="id ?? index"
        :slotIndex="index + 1"
        :imageId="id"
    />
  </div>
</template>

<script setup lang="ts">
import {inject, ref} from 'vue'
import type {UranusEventDetail} from "@/models/UranusEventModel.ts";
import UranusImageSlot from "@/components/image/UranusImageSlot.vue";


const event = inject<{ value: UranusEventDetail | null }>('event')
if (!event) throw new Error("UranusEditEventRelease requires 'event' injection")

const imagesIds = ref([160, 159, null, null])

const dialog = ref({ visible: false, image: null as any })

function openDialogFor(image: any) {
  dialog.value = { visible: true, image }
}

function removeImage(img: any) {
  // API call
}

function reloadImages() {
  // refresh from backend
}
</script>