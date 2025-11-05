<template>
    <section class="uranus-card" :class="customClass" :style="customStyle">
        <slot />
    </section>
</template>

<script setup>
const props = defineProps({
    customClass: { type: String, default: '' }, // extra CSS classes
    customStyle: { type: [String, Object], default: '' }, // inline styles
})
</script>
