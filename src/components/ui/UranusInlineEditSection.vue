<template>
    <section
        class="uranus-inline-edit-section"
        :class="[customClass, { 'uranus-inline-edit--active': active }]"
        :style="customStyle"
    >
        <slot />
    </section>
</template>

<script setup>
const props = defineProps({
    customClass: { type: String, default: '' },
    customStyle: { type: [String, Object], default: '' },
    active: { type: Boolean, default: false }
})
</script>
