<template>
  <a
      :href="url"
      target="_blank"
      rel="noopener noreferrer"
      class="uranus-link"
  >
    <!-- Icon (only if type is valid) -->
    <UranusSquareSVG
        v-if="icon"
        :path="icon.path"
        :size="size"
        :color="icon.color"
    />

    <!-- Label -->
    <span v-if="label" class="uranus-link-label">
      {{ label }}
    </span>
    <span v-else class="uranus-link-label">
      {{ url }}
    </span>

    <!--template>&nbsp;↗</template-->

  </a>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import UranusSquareSVG from '@/component/ui/UranusSquareSVG.vue'

const props = defineProps<{
  url: string;
  type: string | null;
  label: string | null;
  size?: string;
}>();



const size = props.size ?? "22px";

const FALLBACK_ICON = {
  path: "/icons/link-45deg.svg",
  color: "#333",
};

const ICONS: Record<
    string,
    { path: string; color: string }
> = {
  facebook: { path: "/icons/facebook.svg", color: "#1877F2" },
  instagram: { path: "/icons/instagram.svg", color: "#405DE6" },
  mastodon: { path: "/icons/mastodon.svg", color: "#6364FF" },
  bandcamp: { path: "/icons/bandcamp.svg", color: "#239FC2" },
  pdf: { path: "/icons/pdf.svg", color: "#F40F02" },
  spotify: { path: "/icons/spotify.svg", color: "#1DB954" },
  vimeo: { path: "/icons/vimeo.svg", color: "#1AB7EA" },
  youtube: { path: "/icons/youtube.svg", color: "#FF0000" },
  "twitter-x": { path: "/icons/twitter-x.svg", color: "#000000" },
  deezer: { path: "/icons/deezer.svg", color: "#A238FF" },
  web: { path: "/icons/web.svg", color: "#333" },
  github: { path: "/icons/github.svg", color: "#333" },
  gitlab: { path: "/icons/gitlab.svg", color: "#FC6D26" },
  uranus: { path: "/icons/uranus.svg", color: "#6D26FC" },
  soundcloud: { path: "/icons/soundcloud.svg", color: "#FF5500" },
};

const icon = computed(() => {
  if (!props.type) return FALLBACK_ICON;
  return ICONS[props.type] ?? FALLBACK_ICON;
});
</script>

<style scoped>
.uranus-link {
  display: inline-flex;
  align-items: center;
  gap: 1rem;
  text-decoration: none;
  color: var(--uranus-color);
}

.uranus-link-label {
  white-space: nowrap;
}
</style>