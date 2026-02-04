<template>
  <svg :width="width" :height="height" :viewBox="`0 0 ${width} ${height}`">
    <template v-for="(dot, index) in dots" :key="index">
      <!-- Original SVG for odd indices -->
      <path class="form-1"
          v-if="index % 2 === 0"
          d="M512.001,1024C794.781,1024 1024,794.78 1024,512.001C1024,229.241 794.781,0 512.001,0C229.241,0 0,229.241 0,512.001C0,794.78 229.241,1024 512.001,1024ZM512.001,888.757C720.086,888.757 888.757,720.086 888.757,512.001C888.757,303.916 720.086,135.246 512.001,135.246C303.916,135.246 135.246,303.916 135.246,512.001C135.246,720.086 303.916,888.757 512.001,888.757Z"
          fill="currentColor"
          fill-rule="evenodd"
          :style="{
            transform: `translate(${dot.screenX}px, ${dot.screenY}px) scale(${dot.scale})`,
            transformOrigin: '0 0',
            scale: 1
        }"
      />

      <!-- Alternate SVG for even indices -->
      <path v-else class="form-2"
          d="M959.75,549.14C989.026,533.04 989.026,490.97 959.75,474.871L105.06,5.296C76.822,-10.21 42.293,10.21 42.293,42.431L42.293,981.58C42.293,1013.8 76.822,1034.22 105.06,1018.72L959.75,549.14ZM677.798,530.35C691.927,522.194 691.927,501.816 677.798,493.66L217.057,227.638C202.927,219.503 185.282,229.693 185.282,245.983L185.282,778.006C185.282,794.318 202.927,804.507 217.057,796.351L677.798,530.35Z"
          fill="currentColor"
          fill-rule="evenodd"
          :style="{
            transform: `translate(${dot.screenX}px, ${dot.screenY}px) scale(${dot.scale})`,
            transformOrigin: '0 0',
            scale: 1
          }"
      />
    </template>
  </svg>
</template>

<script>
import { ref, onMounted, onBeforeUnmount } from 'vue'

export default {
  props: {
    width: { type: Number, default: 1920 },
    height: { type: Number, default: 1080 },
    numDots: { type: Number, default: 10 },
    perspective: { type: Number, default: 600 },
    baseScale: { type: Number, default: 3 },
    maxOffset: { type: Number, default: 2000 },
  },

  setup(props) {
    const dots = ref([])
    const centerX = props.width / 2
    const centerY = props.height / 2
    let animationId

    // Initialize 3D dots
    for (let i = 0; i < props.numDots; i++) {
      dots.value.push({
        x: (Math.random() - 0.5) * props.maxOffset,
        y: (Math.random() - 0.5) * props.maxOffset,
        z: (Math.random() - 0.5) * props.maxOffset,
        screenX: 0,
        screenY: 0,
        scale: 1,
      })
    }

    const rotate = (dot, ax, ay, az) => {
      const sinX = Math.sin(ax), cosX = Math.cos(ax)
      const sinY = Math.sin(ay), cosY = Math.cos(ay)
      const sinZ = Math.sin(az), cosZ = Math.cos(az)

      // X rotation
      let y = dot.y * cosX - dot.z * sinX
      let z = dot.y * sinX + dot.z * cosX
      dot.y = y
      dot.z = z

      // Y rotation
      let x = dot.x * cosY + dot.z * sinY
      z = -dot.x * sinY + dot.z * cosY
      dot.x = x
      dot.z = z

      // Z rotation
      x = dot.x * cosZ - dot.y * sinZ
      y = dot.x * sinZ + dot.y * cosZ
      dot.x = x
      dot.y = y
    }

    const animate = () => {
      dots.value.forEach(dot => {
        rotate(dot, 0.001, 0.0008, 0.0005)

        const scale = props.perspective / (props.perspective + dot.z)
        dot.screenX = centerX + dot.x * scale - 500
        dot.screenY = centerY + dot.y * scale
        dot.scale = props.baseScale * scale
      })

      animationId = requestAnimationFrame(animate)
    }

    onMounted(() => animate())
    onBeforeUnmount(() => cancelAnimationFrame(animationId))

    return { dots }
  },
}
</script>

<style scoped>
svg {
  width: 100%;
  height: 100%;
  background-color: #4DDFFF;
  border: 1px solid #333;
  color: rgba(224, 119, 255, 0.5);
}

.form-2 {
  color: #E4FF3688;
}
</style>