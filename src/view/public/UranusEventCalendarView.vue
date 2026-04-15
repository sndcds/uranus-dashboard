<template>
  <div class="calendar-demo-view">
    <UranusCalendarBase
      :entries="sampleEntries"
      :adapter="calendarAdapter"
      title="Program Calendar"
      description="Beispiel-Parent fuer die generische Kalenderbasis mit frei definierter Datenstruktur."
      :labels="calendarLabels"
      @select-entry="selectedEntry = $event"
    >
      <template #sidebar-header>
        <button type="button" class="demo-create-button">
          <Plus :size="18" />
          <span>Neue Session</span>
        </button>
      </template>

      <template #agenda-entry="{ item, isActive, timeLabel }">
        <span class="agenda-card__dot" :style="{ backgroundColor: item.presentation.accent }"></span>
        <div class="demo-agenda-card">
          <strong>{{ item.presentation.headline }}</strong>
          <span>{{ timeLabel }} · {{ item.schedule.stage }}</span>
          <span class="demo-agenda-card__meta">{{ item.participants.audience }}</span>
          <span v-if="isActive" class="demo-agenda-card__badge">Aktiv</span>
        </div>
      </template>

      <template #detail="{ item, rangeLabel }">
        <div class="demo-detail">
          <div class="demo-detail__hero">
            <span class="event-inspector__color" :style="{ backgroundColor: item.presentation.accent }"></span>
            <div>
              <h3>{{ item.presentation.headline }}</h3>
              <p>{{ item.presentation.teaser }}</p>
            </div>
          </div>

          <dl class="demo-detail__grid">
            <div>
              <dt>Zeit</dt>
              <dd>{{ rangeLabel }}</dd>
            </div>
            <div>
              <dt>Stage</dt>
              <dd>{{ item.schedule.stage }}</dd>
            </div>
            <div>
              <dt>Venue</dt>
              <dd>{{ item.logistics.venue }}</dd>
            </div>
            <div>
              <dt>Host Team</dt>
              <dd>{{ item.logistics.hostTeam }}</dd>
            </div>
            <div>
              <dt>Speaker</dt>
              <dd>{{ item.participants.speaker }}</dd>
            </div>
            <div>
              <dt>Audience</dt>
              <dd>{{ item.participants.audience }}</dd>
            </div>
          </dl>
        </div>
      </template>

      <template #month-entry="{ item }">
        <span class="month-event__title">{{ item.presentation.headline }}</span>
        <span class="demo-inline-meta">{{ item.schedule.stage }}</span>
      </template>

      <template #all-day-entry="{ item }">
        <span class="demo-inline-meta">{{ item.presentation.headline }} · {{ item.schedule.stage }}</span>
      </template>

      <template #week-entry="{ item, timeLabel }">
        <strong>{{ item.presentation.headline }}</strong>
        <span>{{ timeLabel }}</span>
        <span>{{ item.schedule.stage }}</span>
      </template>

      <template #day-entry="{ item, timeLabel }">
        <strong>{{ item.presentation.headline }}</strong>
        <span>{{ timeLabel }} · {{ item.participants.speaker }}</span>
      </template>

      <template #day-agenda-entry="{ item, isActive }">
        <span class="day-view__agenda-color" :style="{ backgroundColor: item.presentation.accent }"></span>
        <div class="demo-day-agenda">
          <strong>{{ item.presentation.headline }}</strong>
          <p>{{ item.schedule.stage }}</p>
          <p>{{ item.participants.speaker }}</p>
          <span v-if="isActive" class="demo-agenda-card__badge">Im Fokus</span>
        </div>
      </template>
    </UranusCalendarBase>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { Plus } from 'lucide-vue-next'

import UranusCalendarBase from '@/component/calendar/UranusCalendarBase.vue'
import type { CalendarLabels, CalendarNormalizedEntry } from '@/component/calendar/uranusCalendar'
import { createCalendarAdapter, defaultIsAllDayRange } from '@/component/calendar/uranusCalendar'

interface DemoCalendarEntry {
  id: string
  schedule: {
    startsAt: string
    endsAt: string
    stage: string
    allDay?: boolean
  }
  presentation: {
    headline: string
    teaser: string
    accent: string
    textColor?: string
  }
  logistics: {
    venue: string
    hostTeam: string
  }
  participants: {
    speaker: string
    audience: string
  }
}

const today = new Date()
const selectedEntry = ref<CalendarNormalizedEntry<DemoCalendarEntry> | null>(null)

const calendarLabels: Partial<CalendarLabels> = {
  details: 'Session Details',
  emptyDay: '',
  selectEntry: 'Waehle einen Eintrag aus, um die Session-Informationen zu sehen.',
  searchPlaceholder: 'Sessions durchsuchen',
  more: (count: number) => `+${count} weitere`,
}

const calendarAdapter = createCalendarAdapter<DemoCalendarEntry>({
  getId: (item) => item.id,
  getStart: (item) => item.schedule.startsAt,
  getEnd: (item) => item.schedule.endsAt,
  getTitle: (item) => item.presentation.headline,
  getColor: (item) => item.presentation.accent,
  getTextColor: (item) => item.presentation.textColor,
  getSearchText: (item) => [
    item.presentation.headline,
    item.presentation.teaser,
    item.schedule.stage,
    item.logistics.venue,
    item.logistics.hostTeam,
    item.participants.speaker,
    item.participants.audience,
  ].join(' '),
  isAllDay: (item, startDate, endDate) => item.schedule.allDay ?? defaultIsAllDayRange(startDate, endDate),
})

const sampleEntries = computed<DemoCalendarEntry[]>(() => {
  const year = today.getFullYear()
  const month = today.getMonth()

  return [
    {
      id: 'night-shift',
      schedule: {
        startsAt: isoDateTime(year, month, 2, 10, 30),
        endsAt: isoDateTime(year, month, 2, 11, 0),
        stage: 'Control Room',
      },
      presentation: {
        headline: 'Night Shift Release Window',
        teaser: 'Deployments und Monitoring fuer den oeffentlichen Kalender-Rollout.',
        accent: '#d7aefb',
        textColor: '#7b1fa2',
      },
      logistics: {
        venue: 'Remote',
        hostTeam: 'Platform',
      },
      participants: {
        speaker: 'Ops Rotation',
        audience: 'On-call Crew',
      },
    },
    {
      id: 'curator-sync',
      schedule: {
        startsAt: isoDateTime(year, month, 2, 9, 30),
        endsAt: isoDateTime(year, month, 2, 10, 30),
        stage: 'Orbit Room',
      },
      presentation: {
        headline: 'Curator Sync',
        teaser: 'Programmplanung fuer den kommenden Release-Zyklus.',
        accent: '#8ab4f8',
        textColor: '#0b57d0',
      },
      logistics: {
        venue: 'Orbit HQ Berlin',
        hostTeam: 'Programming',
      },
      participants: {
        speaker: 'Mara Velasquez',
        audience: 'Team Leads',
      },
    },
    {
      id: 'curator-sync',
      schedule: {
        startsAt: isoDateTime(year, month, 2, 9, 30),
        endsAt: isoDateTime(year, month, 2, 10, 30),
        stage: 'Orbit Room',
      },
      presentation: {
        headline: 'Curator Sync',
        teaser: 'Programmplanung fuer den kommenden Release-Zyklus.',
        accent: '#8ab4f8',
        textColor: '#0b57d0',
      },
      logistics: {
        venue: 'Orbit HQ Berlin',
        hostTeam: 'Programming',
      },
      participants: {
        speaker: 'Mara Velasquez',
        audience: 'Team Leads',
      },
    },
    {
      id: 'curator-sync',
      schedule: {
        startsAt: isoDateTime(year, month, 2, 9, 30),
        endsAt: isoDateTime(year, month, 2, 10, 30),
        stage: 'Orbit Room',
      },
      presentation: {
        headline: 'Curator Sync',
        teaser: 'Programmplanung fuer den kommenden Release-Zyklus.',
        accent: '#8ab4f8',
        textColor: '#0b57d0',
      },
      logistics: {
        venue: 'Orbit HQ Berlin',
        hostTeam: 'Programming',
      },
      participants: {
        speaker: 'Mara Velasquez',
        audience: 'Team Leads',
      },
    },
    {
      id: 'curator-sync',
      schedule: {
        startsAt: isoDateTime(year, month, 2, 10, 30),
        endsAt: isoDateTime(year, month, 2, 11, 30),
        stage: 'Orbit Room',
      },
      presentation: {
        headline: 'Curator Sync',
        teaser: 'Programmplanung fuer den kommenden Release-Zyklus.',
        accent: '#8ab4f8',
        textColor: '#0b57d0',
      },
      logistics: {
        venue: 'Orbit HQ Berlin',
        hostTeam: 'Programming',
      },
      participants: {
        speaker: 'Mara Velasquez',
        audience: 'Team Leads',
      },
    },
    {
      id: 'curator-sync',
      schedule: {
        startsAt: isoDateTime(year, month, 2, 11, 30),
        endsAt: isoDateTime(year, month, 2, 12, 30),
        stage: 'Orbit Room',
      },
      presentation: {
        headline: 'Curator Sync',
        teaser: 'Programmplanung fuer den kommenden Release-Zyklus.',
        accent: '#8ab4f8',
        textColor: '#0b57d0',
      },
      logistics: {
        venue: 'Orbit HQ Berlin',
        hostTeam: 'Programming',
      },
      participants: {
        speaker: 'Mara Velasquez',
        audience: 'Team Leads',
      },
    },
    {
      id: 'curator-sync',
      schedule: {
        startsAt: isoDateTime(year, month, 2, 12, 30),
        endsAt: isoDateTime(year, month, 2, 13, 30),
        stage: 'Orbit Room',
      },
      presentation: {
        headline: 'Curator Sync',
        teaser: 'Programmplanung fuer den kommenden Release-Zyklus.',
        accent: '#8ab4f8',
        textColor: '#0b57d0',
      },
      logistics: {
        venue: 'Orbit HQ Berlin',
        hostTeam: 'Programming',
      },
      participants: {
        speaker: 'Mara Velasquez',
        audience: 'Team Leads',
      },
    },
    {
      id: 'venue-walkthrough',
      schedule: {
        startsAt: isoDateTime(year, month, 3, 11, 0),
        endsAt: isoDateTime(year, month, 3, 12, 30),
        stage: 'Dock A',
      },
      presentation: {
        headline: 'Venue Walkthrough',
        teaser: 'Licht, Wegefuehrung und Check-in-Prozesse werden abgestimmt.',
        accent: '#81c995',
        textColor: '#137333',
      },
      logistics: {
        venue: 'Campus Riverside',
        hostTeam: 'Operations',
      },
      participants: {
        speaker: 'Linus Berg',
        audience: 'Venue Crew',
      },
    },
    {
      id: 'all-day-lab',
      schedule: {
        startsAt: isoDateTime(year, month, 6, 0, 0),
        endsAt: isoDateTime(year, month, 6, 23, 59),
        stage: 'Lab Floor',
        allDay: true,
      },
      presentation: {
        headline: 'Prototype Lab',
        teaser: 'Ganztagesformat fuer Experimente mit Ticketing und Discovery-Flows.',
        accent: '#f6bf26',
        textColor: '#8d5f00',
      },
      logistics: {
        venue: 'Innovation Loft',
        hostTeam: 'Product Design',
      },
      participants: {
        speaker: 'Open Facilitation',
        audience: 'Cross-functional Team',
      },
    },
    {
      id: 'speaker-briefing',
      schedule: {
        startsAt: isoDateTime(year, month, 8, 14, 0),
        endsAt: isoDateTime(year, month, 8, 15, 0),
        stage: 'Backstage East',
      },
      presentation: {
        headline: 'Speaker Briefing',
        teaser: 'Letzter inhaltlicher Check mit Moderation und Technik.',
        accent: '#f28b82',
        textColor: '#a50e0e',
      },
      logistics: {
        venue: 'Forum West',
        hostTeam: 'Stage Management',
      },
      participants: {
        speaker: 'Nora Lindholm',
        audience: 'Moderationsteam',
      },
    },
    {
      id: 'night-shift',
      schedule: {
        startsAt: isoDateTime(year, month, 12, 21, 30),
        endsAt: isoDateTime(year, month, 12, 23, 0),
        stage: 'Control Room',
      },
      presentation: {
        headline: 'Night Shift Release Window',
        teaser: 'Deployments und Monitoring fuer den oeffentlichen Kalender-Rollout.',
        accent: '#d7aefb',
        textColor: '#7b1fa2',
      },
      logistics: {
        venue: 'Remote',
        hostTeam: 'Platform',
      },
      participants: {
        speaker: 'Ops Rotation',
        audience: 'On-call Crew',
      },
    },
    {
      id: 'community-preview',
      schedule: {
        startsAt: isoDateTime(year, month, 15, 18, 0),
        endsAt: isoDateTime(year, month, 15, 21, 0),
        stage: 'Open Square',
      },
      presentation: {
        headline: 'Community Preview',
        teaser: 'Kuratiertes Preview-Event mit Talks, Musik und Food-Partnern.',
        accent: '#78d9ec',
        textColor: '#007b83',
      },
      logistics: {
        venue: 'Public Plaza',
        hostTeam: 'Community',
      },
      participants: {
        speaker: 'Guest Line-up',
        audience: 'Open Registration',
      },
    },
    {
      id: 'retro',
      schedule: {
        startsAt: isoDateTime(year, month, 20, 10, 0),
        endsAt: isoDateTime(year, month, 20, 11, 30),
        stage: 'Mission Deck',
      },
      presentation: {
        headline: 'Calendar System Retro',
        teaser: 'Review der Basis-Komponente, API-Schaerfung und naechste Ausbauschritte.',
        accent: '#fdcfe8',
        textColor: '#9c27b0',
      },
      logistics: {
        venue: 'Orbit HQ Berlin',
        hostTeam: 'Frontend',
      },
      participants: {
        speaker: 'Ada Morel',
        audience: 'Engineering',
      },
    },
    {
      id: 'multi-day-production',
      schedule: {
        startsAt: isoDateTime(year, month, 23, 16, 0),
        endsAt: isoDateTime(year, month, 24, 13, 0),
        stage: 'Main Hall',
      },
      presentation: {
        headline: 'Production Build-out',
        teaser: 'Mehrtaegiger Aufbau mit Technik, Signage und Einlassproben.',
        accent: '#c58af9',
        textColor: '#6a1b9a',
      },
      logistics: {
        venue: 'Festival Grounds',
        hostTeam: 'Production',
      },
      participants: {
        speaker: 'Technical Direction',
        audience: 'Build Crew',
      },
    },
  ]
})

function isoDateTime(year: number, month: number, day: number, hour: number, minute: number) {
  return new Date(year, month, day, hour, minute).toISOString()
}
</script>

<style scoped lang="scss">
.calendar-demo-view {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.demo-create-button {
  display: inline-flex;
  align-items: center;
  gap: 0.75rem;
  border: 1px solid rgba(15, 23, 42, 0.08);
  border-radius: 1rem;
  background: #fff;
  color: #1f1f1f;
  padding: 0.95rem 1.2rem;
  font: inherit;
  font-weight: 600;
  box-shadow: 0 12px 30px rgba(15, 23, 42, 0.08);
  cursor: pointer;
}

.demo-agenda-card,
.demo-day-agenda {
  display: flex;
  flex-direction: column;
  gap: 0.24rem;
}

.demo-agenda-card__meta,
.demo-inline-meta {
  font-size: 0.78rem;
  opacity: 0.8;
}

.demo-agenda-card__badge {
  display: inline-flex;
  align-items: center;
  width: fit-content;
  padding: 0.2rem 0.5rem;
  border-radius: 999px;
  background: rgba(19, 49, 244, 0.1);
  color: #1331f4;
  font-size: 0.72rem;
  font-weight: 600;
}

.demo-detail {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.demo-detail__hero {
  display: flex;
  gap: 0.85rem;
}

.demo-detail__hero h3,
.calendar-demo-notes h2,
.calendar-demo-notes__panel h3 {
  margin: 0;
}

.demo-detail__hero p,
.calendar-demo-notes p,
.calendar-demo-notes__panel p {
  margin: 0;
}

.demo-detail__grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.85rem;
  margin: 0;
}

.demo-detail__grid dt {
  color: rgba(15, 23, 42, 0.55);
  font-size: 0.78rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.demo-detail__grid dd {
  margin: 0.2rem 0 0;
  font-weight: 600;
}

.calendar-demo-notes {
  padding: 1.2rem 1.3rem;
  background: rgba(255, 255, 255, 0.82);
  border: 1px solid rgba(15, 23, 42, 0.08);
  border-radius: 1.25rem;
}

.calendar-demo-notes__panel {
  margin-top: 1rem;
  padding: 1rem;
  background: rgba(19, 49, 244, 0.06);
  border-radius: 1rem;
}

@media (max-width: 720px) {
  .demo-detail__grid {
    grid-template-columns: 1fr;
  }
}
</style>
