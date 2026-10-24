import { CalendarClock, Languages, CalendarDays, TextCursorInput, AlignLeft, TextQuote,
    Images, Shapes, Diamond, Music, Speech, Hash, Link, UserRoundPlus, Ticket, Tags, Info } from 'lucide-vue-next'
import type { EventTableColumn } from '@/domain/event/adminEventTable'
import type { Component } from 'vue'

export const eventTableIcons: Record<EventTableColumn, Component> = {
    date: CalendarClock, language: Languages, dates: CalendarDays, subtitle: TextCursorInput,
    text: AlignLeft, summary: TextQuote, images: Images, categories: Shapes, types: Diamond,
    genres: Music, languageRelevant: Speech, tags: Hash, links: Link, register: UserRoundPlus,
    ticket: Ticket, price: Tags, info: Info,
}
