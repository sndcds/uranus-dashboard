<!--
  src/component/ui/UranusFacebookShareButton.vue
-->

<template>
  <button
      type="button"
      class="uranus-facebook-share-button"
      @click="share"
      :aria-label="label"
  >
    <slot>
      <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          width="20"
          height="20"
          fill="currentColor"
      >
        <path d="M22 12.07C22 6.51 17.52 2 12 2S2 6.51 2 12.07c0 5.02 3.66 9.18 8.44 9.93v-7.02H7.9V12.1h2.54V9.89c0-2.52 1.49-3.91 3.77-3.91 1.09 0 2.23.2 2.23.2v2.47h-1.26c-1.24 0-1.62.77-1.62 1.56v1.88h2.76l-.44 2.88h-2.32V22c4.78-.75 8.44-4.91 8.44-9.93z"/>
      </svg>

      <span>{{ label }}</span>
    </slot>
  </button>
</template>

<script setup lang="ts">
const props = defineProps({
  url: {
    type: String,
    default: ""
  },

  quote: {
    type: String,
    default: ""
  },

  hashtag: {
    type: String,
    default: ""
  },

  label: {
    type: String,
    default: "Share"
  }
})

function share() {
  const url = props.url || window.location.href

  const shareUrl = new URL("https://www.facebook.com/sharer/sharer.php")
  shareUrl.searchParams.set("u", url)

  if (props.quote)
    shareUrl.searchParams.set("quote", props.quote)

  if (props.hashtag)
    shareUrl.searchParams.set("hashtag", props.hashtag)

  window.open(
      shareUrl.toString(),
      "_blank",
      "noopener,noreferrer,width=650,height=550"
  )
}
</script>

<style scoped>
.uranus-facebook-share-button {
  display: inline-flex;
  align-items: center;
  gap: .5rem;

  cursor: pointer;

  border: none;
  border-radius: 6px;

  padding: .5rem .9rem;

  background: #1877F2;
  color: white;

  font: inherit;
}

.uranus-facebook-share-button:hover {
  opacity: .92;
}

.uranus-facebook-share-button svg {
  flex-shrink: 0;
}
</style>