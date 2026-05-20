<!--
  src/component/partner/card/UranusPartnershipConnectionsGraph.vue

  TODO: i18n translations
-->

<template>
  <UranusCard>
    <h3>{{ t('partnership_connections') }}</h3>

    <UranusFeedback v-if="isLoading" type="warning">
      Loading partnership connections...
    </UranusFeedback>

    <UranusFeedback v-else-if="error" type="error">
      {{ error }}
    </UranusFeedback>

    <UranusFeedback v-else-if="connections.length === 0" type="notice">
      No partnership connections found.
    </UranusFeedback>

    <div v-else ref="graphRootRef" class="connections-graph">
      <svg class="connections-graph__svg" :viewBox="`0 0 ${svgWidth} ${svgHeight}`" preserveAspectRatio="none">
        <defs>
          <marker
              id="partnership-arrow"
              markerWidth="8"
              markerHeight="8"
              refX="7"
              refY="4"
              orient="auto"
              markerUnits="strokeWidth"
          >
            <path d="M0,0 L8,4 L0,8 z" fill="var(--uranus-color-4)" />
          </marker>
        </defs>

        <path
            v-for="line in lines"
            :key="line.key"
            :d="line.path"
            class="connections-graph__line"
            marker-end="url(#partnership-arrow)"
        />
      </svg>

      <div class="connections-graph__columns">
        <div class="connections-graph__column">
          <div class="connections-graph__label">Sources</div>
          <div
              v-for="org in sourceNodes"
              :key="org.uuid"
              :ref="el => setSourceRef(org.uuid, el)"
              class="org-node"
              :class="org.accessible ? 'org-node--accessible' : 'org-node--blocked'"
          >
            {{ org.name }}
          </div>
        </div>

        <div class="connections-graph__column connections-graph__column--right">
          <div class="connections-graph__label">Destinations</div>
          <div
              v-for="org in destinationNodes"
              :key="org.uuid"
              :ref="el => setDestinationRef(org.uuid, el)"
              class="org-node"
              :class="org.accessible ? 'org-node--accessible' : 'org-node--blocked'"
          >
            {{ org.name }}
          </div>
        </div>
      </div>
    </div>
  </UranusCard>
</template>

<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, reactive, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { apiFetch } from '@/api.ts'
import UranusCard from '@/component/ui/UranusCard.vue'
import UranusFeedback from '@/component/uranus/UranusFeedback.vue'

const { t } = useI18n()

type OrgAccessGrant = {
  src_org_uuid: string
  dst_org_uuid: string
  src_org_name: string
  dst_org_name: string
  src_access: boolean
  dst_access: boolean
  permissions: string
}

type OrgNode = {
  uuid: string
  name: string
  accessible: boolean
}

type GraphLine = {
  key: string
  path: string
}

const isLoading = ref(true)
const error = ref<string | null>(null)
const connections = ref<OrgAccessGrant[]>([])

const graphRootRef = ref<HTMLElement | null>(null)
const sourceRefs = reactive(new Map<string, HTMLElement>())
const destinationRefs = reactive(new Map<string, HTMLElement>())

const svgWidth = ref(100)
const svgHeight = ref(100)
const lines = ref<GraphLine[]>([])

const sourceNodes = computed<OrgNode[]>(() => {
  const map = new Map<string, OrgNode>()

  for (const connection of connections.value) {
    const existing = map.get(connection.src_org_uuid)
    if (!existing) {
      map.set(connection.src_org_uuid, {
        uuid: connection.src_org_uuid,
        name: connection.src_org_name,
        accessible: !!connection.src_access,
      })
      continue
    }

    existing.accessible = existing.accessible || !!connection.src_access
  }

  return [...map.values()].sort((a, b) => a.name.localeCompare(b.name, undefined, { sensitivity: 'base' }))
})

const destinationNodes = computed<OrgNode[]>(() => {
  const map = new Map<string, OrgNode>()

  for (const connection of connections.value) {
    const existing = map.get(connection.dst_org_uuid)
    if (!existing) {
      map.set(connection.dst_org_uuid, {
        uuid: connection.dst_org_uuid,
        name: connection.dst_org_name,
        accessible: !!connection.dst_access,
      })
      continue
    }

    existing.accessible = existing.accessible || !!connection.dst_access
  }

  return [...map.values()].sort((a, b) => a.name.localeCompare(b.name, undefined, { sensitivity: 'base' }))
})

function setSourceRef(uuid: string, element: Element | null) {
  if (element instanceof HTMLElement) {
    sourceRefs.set(uuid, element)
  } else {
    sourceRefs.delete(uuid)
  }
}

function setDestinationRef(uuid: string, element: Element | null) {
  if (element instanceof HTMLElement) {
    destinationRefs.set(uuid, element)
  } else {
    destinationRefs.delete(uuid)
  }
}

async function loadConnections() {
  isLoading.value = true
  error.value = null

  try {
    const apiPath = '/api/admin/org/partnership-connections-by-user'
    const apiResponse = await apiFetch<any>(apiPath)
    connections.value = apiResponse?.data?.org_access_grants
  } catch (err) {
    if (err instanceof Error) {
      error.value = err.message
    } else {
      error.value = 'Failed to load partnership connections.'
    }
  } finally {
    isLoading.value = false
    await nextTick()
    updateLines()
  }
}

function updateLines() {
  const root = graphRootRef.value
  if (!root) {
    lines.value = []
    return
  }

  const rootRect = root.getBoundingClientRect()
  svgWidth.value = Math.max(rootRect.width, 1)
  svgHeight.value = Math.max(rootRect.height, 1)

  const nextLines: GraphLine[] = []

  for (const connection of connections.value) {
    const srcElement = sourceRefs.get(connection.src_org_uuid)
    const dstElement = destinationRefs.get(connection.dst_org_uuid)
    if (!srcElement || !dstElement) continue

    const srcRect = srcElement.getBoundingClientRect()
    const dstRect = dstElement.getBoundingClientRect()

    const startX = srcRect.right - rootRect.left
    const startY = srcRect.top - rootRect.top + srcRect.height / 2
    const endX = dstRect.left - rootRect.left
    const endY = dstRect.top - rootRect.top + dstRect.height / 2
    const horizontal = Math.max((endX - startX) * 0.42, 70)

    const path = `M ${startX} ${startY} C ${startX + horizontal} ${startY}, ${endX - horizontal} ${endY}, ${endX} ${endY}`

    nextLines.push({
      key: `${connection.src_org_uuid}-${connection.dst_org_uuid}`,
      path,
    })
  }

  lines.value = nextLines
}

function onResize() {
  updateLines()
}

watch([sourceNodes, destinationNodes], async () => {
  await nextTick()
  updateLines()
}, { deep: true })

onMounted(async () => {
  window.addEventListener('resize', onResize)
  await loadConnections()
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', onResize)
})
</script>

<style scoped lang="scss">
.connections-graph {
  position: relative;
  margin-top: 0.75rem;
}

.connections-graph__svg {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 1;
}

.connections-graph__line {
  fill: none;
  stroke: var(--uranus-color-4);
  stroke-width: 2;
  opacity: 0.75;
}

.connections-graph__columns {
  position: relative;
  z-index: 2;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 6.5rem;
}

.connections-graph__column {
  display: flex;
  flex-direction: column;
  gap: 0.65rem;
}

.connections-graph__column--right {
  align-items: flex-end;
}

.connections-graph__label {
  font-size: 0.85rem;
  font-weight: 700;
  letter-spacing: 0.03em;
  text-transform: uppercase;
  color: var(--uranus-color-4);
}

.org-node {
  width: min(100%, 320px);
  border-radius: 0.5rem;
  border: 1px solid var(--uranus-dashboard-border-color);
  padding: 0.65rem 0.75rem;
  font-weight: 600;
  background: var(--uranus-card-bg);
}

.org-node--accessible {
  border-color: color-mix(in srgb, var(--uranus-success-color) 55%, transparent);
  background: color-mix(in srgb, var(--uranus-success-color) 18%, transparent);
}

.org-node--blocked {
  border-color: color-mix(in srgb, var(--uranus-error-color) 55%, transparent);
  background: color-mix(in srgb, var(--uranus-error-color) 16%, transparent);
}

@media (max-width: 960px) {
  .connections-graph__columns {
    gap: 3.25rem;
  }
}

@media (max-width: 700px) {
  .connections-graph__svg {
    display: none;
  }

  .connections-graph__columns {
    grid-template-columns: 1fr;
    gap: 1rem;
  }

  .connections-graph__column--right {
    align-items: stretch;
  }

  .org-node {
    width: 100%;
  }
}
</style>