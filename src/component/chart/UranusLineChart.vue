<template>
  <div class="chart-wrapper">
    <!--c.. SVG Chart -->
    <svg
        class="line-chart"
        :viewBox="`0 0 ${VIEW_W} ${VIEW_H}`"
        width="100%"
        role="img"
        :aria-label="`Line chart: ${data.y_axis ?? ''} by ${data.x_axis ?? ''}`"
    >
      <!--c.. Background -->
      <rect class="chart-bg" x="0" y="0" :width="VIEW_W" :height="VIEW_H" />

      <!--c.. Plot area (offset by margins) -->
      <g class="chart-plot" :transform="`translate(${margin.left},${margin.top})`">

        <!--c.. Grid -->
        <g v-if="data.show_grid !== false" class="chart-grid">
          <line
              v-for="(gl, i) in gridLines"
              :key="i"
              class="chart-grid-line"
              :x1="0" :y1="gl.y" :x2="plotW" :y2="gl.y"
          />
        </g>

        <!--c.. X Axis -->
        <g class="chart-axis chart-axis-x">
          <line class="chart-axis-line" :x1="0" :y1="plotH" :x2="plotW" :y2="plotH" />
          <template v-for="pt in dataPoints" :key="pt.pos">
            <line class="chart-tick" :x1="pt.cx" :y1="plotH" :x2="pt.cx" :y2="plotH + 6" />
            <text
                class="chart-tick-label chart-tick-label-x"
                :x="pt.cx"
                :y="plotH + 22"
                text-anchor="middle"
            >{{ pt.label }}</text>
          </template>
          <text
              v-if="data.show_x_label && data.x_axis"
              class="chart-axis-label chart-axis-label-x"
              :x="plotW / 2"
              :y="plotH + 58"
              text-anchor="middle"
          >{{ data.x_axis }}</text>
        </g>

        <!--c.. Y Axis -->
        <g class="chart-axis chart-axis-y">
          <line class="chart-axis-line" :x1="0" :y1="0" :x2="0" :y2="plotH" />
          <template v-for="(tick, i) in yTicks" :key="i">
            <line class="chart-tick" :x1="-6" :y1="tick.y" :x2="0" :y2="tick.y" />
            <text
                class="chart-tick-label chart-tick-label-y"
                :x="-12"
                :y="tick.y"
                text-anchor="end"
                dominant-baseline="middle"
            >{{ tick.label }}</text>
          </template>
          <text
              v-if="data.show_y_label && data.y_axis"
              class="chart-axis-label chart-axis-label-y"
              text-anchor="middle"
              :transform="`rotate(-90) translate(${-(plotH / 2)}, ${-(margin.left - 18)})`"
          >{{ data.y_axis }}</text>
        </g>

        <!--c.. Line -->
        <polyline class="chart-line" :points="linePoints" fill="none" />

        <!--c.. Data points -->
        <g class="chart-points">
          <g v-for="pt in dataPoints" :key="pt.pos">
            <--c.. Invisible hit area for comfortable hover -->
            <circle
                class="chart-point-hitarea"
                :cx="pt.cx" :cy="pt.cy" r="18"
                :aria-label="`${pt.label}: ${pt.value}`"
                @mouseenter="onPointEnter($event, pt)"
                @mouseleave="onPointLeave"
                @mousemove="onPointMove"
            />
            <!--c.. Visible dot -->
            <circle
                class="chart-point"
                :class="{ 'chart-point--active': activeIndex === pt.index }"
                :cx="pt.cx"
                :cy="pt.cy"
            />
          </g>
        </g>

      </g>
    </svg>

    <!--c.. Tooltip (position:fixed) -->
    <div
        ref="tooltipRef"
        class="chart-tooltip"
        :class="{ 'chart-tooltip--visible': tooltip.visible }"
        :style="{ left: tooltip.x + 'px', top: tooltip.y + 'px' }"
        role="tooltip"
    >
      <span class="chart-tooltip-label">{{ tooltip.label }}</span>
      <span class="chart-tooltip-value">{{ tooltip.value }}</span>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'

const props = defineProps({
  /**
   * {
   *   x_axis:       string,
   *   y_axis:       string,
   *   show_x_label: boolean,
   *   show_y_label: boolean,
   *   show_grid:    boolean,
   *   values:       Array<{ pos: number, label: string, value: number }>
   * }
   */
  data: { type: Object, required: true },
})

// Layout
const VIEW_W = 800
const VIEW_H = 400
const margin = { top: 30, right: 40, bottom: 70, left: 70 }
const plotW  = VIEW_W - margin.left - margin.right
const plotH  = VIEW_H - margin.top  - margin.bottom

// Sorted values
const sortedValues = computed(() =>
    [...(props.data.values ?? [])].sort((a, b) => a.pos - b.pos)
)

// Scales
const yMax   = computed(() => Math.max(...sortedValues.value.map(d => d.value)) * 1.15)
const xCount = computed(() => sortedValues.value.length)
const xPad   = computed(() => plotW / (xCount.value > 1 ? (xCount.value - 1) * 2 : 2))

function xScale(index) {
  if (xCount.value === 1) return plotW / 2
  return (index / (xCount.value - 1)) * (plotW - 2 * xPad.value) + xPad.value
}
function yScale(value) {
  return plotH - (value / yMax.value) * plotH
}

// Computed template data
const dataPoints = computed(() =>
    sortedValues.value.map((d, i) => ({
      ...d, index: i, cx: xScale(i), cy: yScale(d.value),
    }))
)

const linePoints = computed(() =>
    dataPoints.value.map(p => `${p.cx},${p.cy}`).join(' ')
)

const gridLines = computed(() => {
  const N = 5
  return Array.from({ length: N + 1 }, (_, i) => ({ y: (i / N) * plotH }))
})

const yTicks = computed(() => {
  const N = 5
  return Array.from({ length: N + 1 }, (_, i) => {
    const val = (i / N) * yMax.value
    return { y: yScale(val), label: Math.round(val) }
  })
})

// Tooltip
const activeIndex = ref(null)
const tooltipRef  = ref(null)
const tooltip     = ref({ visible: false, label: '', value: 0, x: 0, y: 0 })

function onPointEnter(e, pt) {
  activeIndex.value     = pt.index
  tooltip.value.label   = pt.label
  tooltip.value.value   = pt.value
  tooltip.value.visible = true
  updateTooltipPos(e)
}
function onPointLeave() {
  activeIndex.value     = null
  tooltip.value.visible = false
}
function onPointMove(e) { updateTooltipPos(e) }

function updateTooltipPos(e) {
  const GAP = 14
  const el  = tooltipRef.value
  const tW  = el?.offsetWidth  ?? 120
  const tH  = el?.offsetHeight ?? 36
  const vW  = window.innerWidth
  const vH  = window.innerHeight
  let x = e.clientX + GAP
  let y = e.clientY - tH / 2
  if (x + tW > vW - 8) x = e.clientX - tW - GAP
  if (y < 8)           y = 8
  if (y + tH > vH - 8) y = vH - tH - 8
  tooltip.value.x = x
  tooltip.value.y = y
}
</script>

<style scoped>
/*
  CSS Custom Properties – alle Defaults hier.
  Von außen ueberschreibbar auf jedem Vorfahren-Element:
    <div style="--chart-line-color: red;">
      <LineChart :data="..." />
    </div>
*/
.chart-wrapper {
  --chart-bg:                       #ffffff;
  --chart-line-color:               #3b82f6;
  --chart-line-width:               2.5px;
  --chart-line-dash:                none;
  --chart-line-cap:                 round;
  --chart-line-join:                round;
  --chart-point-color:              #3b82f6;
  --chart-point-radius:             5px;
  --chart-point-stroke:             #ffffff;
  --chart-point-stroke-width:       2px;
  --chart-point-hover-color:        #1d4ed8;
  --chart-point-hover-radius:       8px;
  --chart-point-hover-stroke:       #ffffff;
  --chart-point-hover-stroke-width: 2.5px;
  --chart-grid-color:               #e5e7eb;
  --chart-grid-width:               1px;
  --chart-grid-dash:                4 4;
  --chart-axis-color:               #6b7280;
  --chart-axis-width:               1.5px;
  --chart-tick-color:               #6b7280;
  --chart-tick-width:               1.5px;
  --chart-font-family:              system-ui, -apple-system, sans-serif;
  --chart-font-size:                12px;
  --chart-font-size-label:          13px;
  --chart-font-color:               #374151;
  --chart-label-color:              #6b7280;
  --chart-label-font-weight:        600;
  --chart-tooltip-bg:               #1f2937;
  --chart-tooltip-color:            #f9fafb;
  --chart-tooltip-border:           1px solid #374151;
  --chart-tooltip-radius:           6px;
  --chart-tooltip-shadow:           0 4px 12px rgba(0, 0, 0, 0.25);
  --chart-tooltip-padding:          6px 12px;
  --chart-tooltip-font-size:        13px;
  --chart-tooltip-value-color:      #60a5fa;
  position: relative;
}

.line-chart {
  display:     block;
  overflow:    visible;
  font-family: var(--chart-font-family);
  font-size:   var(--chart-font-size);
}

.chart-bg { fill: var(--chart-bg); }

.chart-grid-line {
  stroke:           var(--chart-grid-color);
  stroke-width:     var(--chart-grid-width);
  stroke-dasharray: var(--chart-grid-dash);
  shape-rendering:  crispEdges;
}

.chart-axis-line {
  stroke:          var(--chart-axis-color);
  stroke-width:    var(--chart-axis-width);
  shape-rendering: crispEdges;
}

.chart-tick {
  stroke:          var(--chart-tick-color);
  stroke-width:    var(--chart-tick-width);
  shape-rendering: crispEdges;
}

.chart-tick-label {
  fill:        var(--chart-font-color);
  font-family: var(--chart-font-family);
  font-size:   var(--chart-font-size);
}

.chart-axis-label {
  fill:        var(--chart-label-color);
  font-family: var(--chart-font-family);
  font-size:   var(--chart-font-size-label);
  font-weight: var(--chart-label-font-weight);
}

.chart-line {
  stroke:           var(--chart-line-color);
  stroke-width:     var(--chart-line-width);
  stroke-dasharray: var(--chart-line-dash);
  stroke-linecap:   var(--chart-line-cap);
  stroke-linejoin:  var(--chart-line-join);
}

.chart-point-hitarea {
  fill:   transparent;
  stroke: none;
  cursor: pointer;
}

.chart-point {
  r:            var(--chart-point-radius);
  fill:         var(--chart-point-color);
  stroke:       var(--chart-point-stroke);
  stroke-width: var(--chart-point-stroke-width);
  cursor:       pointer;
  transition:   r 0.18s ease, fill 0.18s ease, stroke-width 0.18s ease;
}

.chart-point--active {
  r:            var(--chart-point-hover-radius);
  fill:         var(--chart-point-hover-color);
  stroke:       var(--chart-point-hover-stroke);
  stroke-width: var(--chart-point-hover-stroke-width);
}

.chart-tooltip {
  position:       fixed;
  z-index:        9999;
  display:        flex;
  align-items:    center;
  gap:            8px;
  padding:        var(--chart-tooltip-padding);
  background:     var(--chart-tooltip-bg);
  color:          var(--chart-tooltip-color);
  border:         var(--chart-tooltip-border);
  border-radius:  var(--chart-tooltip-radius);
  box-shadow:     var(--chart-tooltip-shadow);
  font-family:    var(--chart-font-family);
  font-size:      var(--chart-tooltip-font-size);
  pointer-events: none;
  white-space:    nowrap;
  opacity:        0;
  transform:      translateY(4px);
  transition:     opacity 0.15s ease, transform 0.15s ease;
}

.chart-tooltip--visible {
  opacity:   1;
  transform: translateY(0);
}

.chart-tooltip-label { font-weight: 500; }

.chart-tooltip-value {
  font-weight: 700;
  color:       var(--chart-tooltip-value-color);
}
</style>
