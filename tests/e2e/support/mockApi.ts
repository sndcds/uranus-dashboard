import { expect, type Page, type Route } from '@playwright/test'

type CalendarEvent = {
  id: number
  event_date_id: number
  title: string
  subtitle: string | null
  image_path: string | null
  summary: string | null
  description: string | null
  start_date: string
  start_time: string | null
  end_date: string | null
  end_time: string | null
  venue_name: string | null
  venue_city: string | null
  venue_id: number
  event_types: Array<{
    genre_id: number | null
    genre_name: string | null
    type_id: number
    type_name: string
  }> | null
  organization_name: string | null
  release_status: string | null
}

type AdminEventRecord = {
  id: number
  release_status: string | null
  release_date: string | null
  external_id: string | null
  source_url: string | null
  custom: string | null
  style: string | null
  content_language: string | null
  title: string
  subtitle: string | null
  organization_id: number
  venue_id: number | null
  space_id: number | null
  categories: number[]
  event_types: Array<{ type_id: number | null; genre_id: number | null }>
  tags: string[]
  description: string | null
  summary: string | null
  participation_info: string | null
  meeting_point: string | null
  min_age: number | null
  max_age: number | null
  max_attendees: number | null
  visitor_info_flags: string | null
  price_type: string | null
  min_price: number | null
  max_price: number | null
  ticket_flags: string[] | null
  currency: string | null
  occasion_type_id: number | null
  online_link: string | null
  languages: string[]
  dates: Array<Record<string, unknown>>
  event_links: Array<{ label: string | null; type: string | null; url: string | null }>
}

type TodoRecord = {
  id: number
  title: string
  description: string | null
  due_date: string | null
  completed: boolean
}

type OrganizationDashboardRecord = {
  organization_id: number
  organization_name: string
  organization_city: string | null
  organization_country_code: string | null
  total_upcoming_events: number
  venue_count: number
  space_count: number
  can_edit_organization: boolean
  can_delete_organization: boolean
  can_manage_team: boolean
  main_logo_image_id: number | null
}

type VenueListRecord = {
  venue_id: number
  venue_name: string
  venue_logo_image_id: number
  upcoming_event_count: number
  spaces: Array<{
    space_id: number
    space_name: string
    upcoming_event_count: number
  }>
  can_edit_venue: boolean
  can_delete_venue: boolean
  can_add_space: boolean
  can_edit_space: boolean
  can_delete_space: boolean
  can_add_event: boolean
  can_edit_event: boolean
  can_delete_event: boolean
  can_release_event: boolean
}

type UserProfileRecord = {
  display_name: string
  email_address: string
  first_name: string
  last_name: string
  username: string
  locale: string
  theme: string
  avatar_url: string | null
  user_id: number
}

type InboxMessageRecord = {
  id: number
  subject: string
  message: string
  created_at: string
  modified_at: string | null
  from_user_id: number | null
  is_read: boolean
}

type TeamMemberRecord = {
  member_id: number
  user_id: number
  display_name: string | null
  email: string
  role_id: number | null
  role_name: string
  avatar_url?: string | null
  last_active_at?: string | null
  joined_at?: string | null
}

type TeamInvitationRecord = {
  invite_id: number
  user_id: number
  email: string
  role_id: number | null
  role_name: string
  invited_by?: string | null
  invited_at?: string | null
  expires_at?: string | null
}

type TeamRoleRecord = {
  id: number
  name: string
  description?: string | null
}

type SpaceRecord = {
  id: number
  venue_id: number | null
  name: string
  total_capacity?: number | null
  seating_capacity?: number | null
  space_type?: string | null
  building_level?: number | null
  website_link?: string | null
  accessibility_summary?: string | null
  accessibility_flags?: string | null
  description?: string | null
  area_sqm?: number | null
  environmental_features?: number | null
  audio_features?: number | null
  presentation_features?: number | null
  lighting_features?: number | null
  climate_features?: number | null
  misc_features?: number | null
  created_at: string
  modified_at?: string | null
}

const jsonResponse = async (route: Route, body: unknown, status = 200) => {
  await route.fulfill({
    status,
    contentType: 'application/json',
    body: JSON.stringify(body),
  })
}

const textResponse = async (route: Route, body: string, status = 200, contentType = 'text/plain') => {
  await route.fulfill({
    status,
    contentType,
    body,
  })
}

const languageEntries = [
  { id: 'de', name: 'Deutsch' },
  { id: 'en', name: 'English' },
  { id: 'da', name: 'Dansk' },
]

const currencyEntries = [
  { id: 'EUR', name: 'Euro' },
  { id: 'DKK', name: 'Danish Krone' },
]

const eventTypesLookup = {
  data: {
    de: {
      types: {
        1: { name: 'Kultur', genres: { 11: 'Jazz' } },
        5: { name: 'Familie', genres: { 51: 'Workshop' } },
      },
    },
    en: {
      types: {
        1: { name: 'Culture', genres: { 11: 'Jazz' } },
        5: { name: 'Family', genres: { 51: 'Workshop' } },
      },
    },
    da: {
      types: {
        1: { name: 'Kultur', genres: { 11: 'Jazz' } },
        5: { name: 'Familie', genres: { 51: 'Workshop' } },
      },
    },
  },
}

const releaseStatusLookup = {
  service: 'mock',
  api_version: '1.0.0',
  response_type: 'mock',
  status: 'ok',
  timestamp: '2026-03-18T08:00:00.000Z',
  metadata: {},
  data: {
    i18n: {
      de: {
        draft: 'Entwurf',
        review: 'Pruefung',
        released: 'Freigegeben',
        cancelled: 'Abgesagt',
      },
      en: {
        draft: 'Draft',
        review: 'Review',
        released: 'Released',
        cancelled: 'Cancelled',
      },
      da: {
        draft: 'Kladde',
        review: 'Gennemgang',
        released: 'Udgivet',
        cancelled: 'Aflyst',
      },
    },
    order: ['draft', 'review', 'released', 'cancelled'],
  },
}

const calendarEvents: CalendarEvent[] = [
  {
    id: 101,
    event_date_id: 1001,
    title: 'Jazz Night Flensburg',
    subtitle: 'Late session',
    image_path: null,
    summary: 'An evening of jazz.',
    description: 'An evening of jazz in the old warehouse.',
    start_date: '2026-04-12',
    start_time: '19:30',
    end_date: '2026-04-12',
    end_time: '22:00',
    venue_name: 'Kulturwerft',
    venue_city: 'Flensburg',
    venue_id: 201,
    event_types: [{ genre_id: 11, genre_name: 'Jazz', type_id: 1, type_name: 'Culture' }],
    organization_name: 'Kulturhaus Nord',
    release_status: 'released',
  },
  {
    id: 102,
    event_date_id: 1002,
    title: 'Family Workshop Kiel',
    subtitle: 'Hands-on art',
    image_path: null,
    summary: 'Creative workshop for families.',
    description: 'Creative workshop with shared stations.',
    start_date: '2026-04-13',
    start_time: '10:00',
    end_date: '2026-04-13',
    end_time: '13:00',
    venue_name: 'Atelierhaus',
    venue_city: 'Kiel',
    venue_id: 202,
    event_types: [{ genre_id: 51, genre_name: 'Workshop', type_id: 5, type_name: 'Family' }],
    organization_name: 'Familienforum',
    release_status: 'released',
  },
]

const venueRecords = {
  201: {
    id: 201,
    name: 'Kulturwerft',
    type_name: 'Concert Hall',
    description: 'Historic harbour venue for concerts and talks.',
    street: 'Hafenweg',
    house_number: '12',
    postal_code: '24937',
    city: 'Flensburg',
    country: 'DE',
    contact_email: 'info@kulturwerft.test',
    contact_phone: '+49 461 100200',
    website_link: 'https://kulturwerft.test',
    organization: {
      name: 'Kulturhaus Nord',
      city: 'Flensburg',
      country: 'DE',
      website_link: 'https://kulturhaus-nord.test',
    },
    lon: '9.4300',
    lat: '54.7900',
    spaces: [
      {
        id: 301,
        name: 'Main Hall',
        total_capacity: 400,
        seating_capacity: 220,
        building_level: 0,
        space_type_name: 'Hall',
        description: 'Open hall with stage.',
        website_link: 'https://kulturwerft.test/main-hall',
      },
    ],
  },
  202: {
    id: 202,
    name: 'Atelierhaus',
    type_name: 'Studio',
    description: 'Flexible workshop and exhibition location.',
    street: 'Muehlenstrasse',
    house_number: '8',
    postal_code: '24103',
    city: 'Kiel',
    country: 'DE',
    contact_email: 'atelier@familienforum.test',
    contact_phone: '+49 431 998877',
    website_link: 'https://atelierhaus.test',
    organization: {
      name: 'Familienforum',
      city: 'Kiel',
      country: 'DE',
      website_link: 'https://familienforum.test',
    },
    lon: '10.1350',
    lat: '54.3233',
    spaces: [],
  },
} as const

const eventDetailRecords = {
  101: {
    data: {
      event_id: 101,
      release_status: 'released',
      lang: 'de',
      organization_id: 77,
      organization_name: 'Kulturhaus Nord',
      organization_website: 'https://kulturhaus-nord.test',
      title: 'Jazz Night Flensburg',
      subtitle: 'Late session',
      description: '## Jazz Night\nA carefully curated live set.',
      summary: 'An evening of jazz.',
      event_types: [{ type_id: 1, genre_id: 11 }],
      tags: ['jazz', 'live'],
      min_age: 16,
      max_age: null,
      languages: ['de', 'en'],
      meeting_point: 'Main entrance',
      participation_info: 'Doors open 30 minutes before start.',
      max_attendees: 180,
      price_type: 'regular_price',
      currency: 'EUR',
      min_price: 12.5,
      max_price: 19.5,
      image: null,
      event_links: [{ label: 'Tickets', url: 'https://tickets.test/jazz-night', url_type: 'ticket' }],
      date: {
        id: 1001,
        event_id: 101,
        start_date: '2026-04-12',
        start_time: '19:30',
        end_date: '2026-04-12',
        end_time: '22:00',
        entry_time: '19:00',
        venue_id: 201,
        venue_name: 'Kulturwerft',
        venue_street: 'Hafenweg',
        venue_house_number: '12',
        venue_postal_code: '24937',
        venue_city: 'Flensburg',
        venue_country: 'DE',
        venue_lon: '9.4300',
        venue_lat: '54.7900',
        venue_website: 'https://kulturwerft.test',
        space_id: 301,
        space_name: 'Main Hall',
      },
      further_dates: [
        {
          id: 1001,
          event_id: 101,
          start_date: '2026-04-12',
          start_time: '19:30',
          end_date: '2026-04-12',
          end_time: '22:00',
          venue_id: 201,
          venue_name: 'Kulturwerft',
          venue_city: 'Flensburg',
        },
      ],
    },
  },
  102: {
    data: {
      event_id: 102,
      release_status: 'released',
      lang: 'de',
      organization_id: 88,
      organization_name: 'Familienforum',
      organization_website: 'https://familienforum.test',
      title: 'Family Workshop Kiel',
      subtitle: 'Hands-on art',
      description: 'A colorful workshop for children and adults.',
      summary: 'Creative workshop for families.',
      event_types: [{ type_id: 5, genre_id: 51 }],
      tags: ['family', 'art'],
      min_age: 6,
      max_age: null,
      languages: ['de'],
      meeting_point: null,
      participation_info: 'Bring clothes that can get dirty.',
      max_attendees: 40,
      price_type: 'free',
      currency: 'EUR',
      min_price: null,
      max_price: null,
      image: null,
      event_links: [],
      date: {
        id: 1002,
        event_id: 102,
        start_date: '2026-04-13',
        start_time: '10:00',
        end_date: '2026-04-13',
        end_time: '13:00',
        venue_id: 202,
        venue_name: 'Atelierhaus',
        venue_street: 'Muehlenstrasse',
        venue_house_number: '8',
        venue_postal_code: '24103',
        venue_city: 'Kiel',
        venue_country: 'DE',
        venue_lon: '10.1350',
        venue_lat: '54.3233',
        venue_website: 'https://atelierhaus.test',
      },
      further_dates: [],
    },
  },
} as const

const createAdminEvent = (id: number, title = 'Mock Event') : AdminEventRecord => ({
  id,
  release_status: 'draft',
  release_date: '2026-04-01',
  external_id: null,
  source_url: null,
  custom: null,
  style: null,
  content_language: 'de',
  title,
  subtitle: 'Initial subtitle',
  organization_id: 77,
  venue_id: 201,
  space_id: 301,
  categories: [1],
  event_types: [{ type_id: 1, genre_id: 11 }],
  tags: ['jazz'],
  description: 'Initial description',
  summary: 'Initial summary',
  participation_info: 'Initial participation info',
  meeting_point: 'Main entrance',
  min_age: 16,
  max_age: 99,
  max_attendees: 180,
  visitor_info_flags: '0',
  price_type: 'regular_price',
  min_price: 10,
  max_price: 20,
  ticket_flags: ['advance_ticket'],
  currency: 'EUR',
  occasion_type_id: null,
  online_link: null,
  languages: ['de', 'en'],
  dates: [
    {
      id: 1001,
      event_id: id,
      start_date: '2026-04-12',
      start_time: '19:30',
      end_date: '2026-04-12',
      end_time: '22:00',
      entry_time: '19:00',
      duration: 150,
      venue_id: 201,
      space_id: 301,
      all_day: false,
    },
  ],
  event_links: [],
})

const applyFieldPatch = (event: AdminEventRecord, payload: Record<string, unknown>) => {
  const mapping: Record<string, keyof AdminEventRecord> = {
    release_status: 'release_status',
    release_date: 'release_date',
    content_language: 'content_language',
    categories: 'categories',
    title: 'title',
    subtitle: 'subtitle',
    description: 'description',
    summary: 'summary',
    price_type: 'price_type',
    min_price: 'min_price',
    max_price: 'max_price',
    currency: 'currency',
    ticket_flags: 'ticket_flags',
    max_attendees: 'max_attendees',
    min_age: 'min_age',
    max_age: 'max_age',
    participation_info: 'participation_info',
  }

  for (const [key, value] of Object.entries(payload)) {
    const targetKey = mapping[key]
    if (targetKey) {
      ;(event as Record<string, unknown>)[targetKey] = value as never
    }
  }
}

const filterCalendarEvents = (url: URL) => {
  const search = url.searchParams.get('search')?.toLowerCase().trim() ?? ''
  const city = url.searchParams.get('city')?.toLowerCase().trim() ?? ''
  const venueIds = (url.searchParams.get('venues') ?? '')
    .split(',')
    .filter((value) => value.length > 0)
    .map((value) => Number(value))
    .filter((value) => Number.isFinite(value))
  const eventTypeIds = (url.searchParams.get('event_types') ?? '')
    .split(',')
    .filter((value) => value.length > 0)
    .map((value) => Number(value))
    .filter((value) => Number.isFinite(value))

  return calendarEvents.filter((event) => {
    const matchesSearch =
      !search ||
      event.title.toLowerCase().includes(search) ||
      (event.summary ?? '').toLowerCase().includes(search)
    const matchesCity = !city || (event.venue_city ?? '').toLowerCase().includes(city)
    const matchesVenue = venueIds.length === 0 || venueIds.includes(event.venue_id)
    const typeIds = (event.event_types ?? []).map((entry) => entry.type_id)
    const matchesType = eventTypeIds.length === 0 || eventTypeIds.every((id) => typeIds.includes(id))
    return matchesSearch && matchesCity && matchesVenue && matchesType
  })
}

export const installAuthenticatedState = async (page: Page) => {
  await page.addInitScript(() => {
    localStorage.setItem('token', JSON.stringify({
      accessToken: 'mock-access-token',
      refreshToken: 'mock-refresh-token',
    }))
    localStorage.setItem('app', JSON.stringify({
      organizationId: 77,
      organizationName: 'Kulturhaus Nord',
      eventViewMode: 'detailed',
      eventGroupingMode: 'daily',
    }))
    localStorage.setItem('user', JSON.stringify({
      userId: '501',
      displayName: 'Playwright Admin',
      emailAddress: 'admin@example.com',
      avatarVersion: 0,
      userAvatar: null,
    }))
  })
}

export const mockApi = async (page: Page) => {
  const state = {
    nextEventId: 900,
    adminEvents: new Map<number, AdminEventRecord>([[101, createAdminEvent(101, 'Jazz Night Flensburg')]]),
    nextOrganizationId: 120,
    organizations: [
      {
        organization_id: 77,
        organization_name: 'Kulturhaus Nord',
        organization_city: 'Flensburg',
        organization_country_code: 'DE',
        total_upcoming_events: 4,
        venue_count: 1,
        space_count: 1,
        can_edit_organization: true,
        can_delete_organization: true,
        can_manage_team: true,
        main_logo_image_id: null,
      },
      {
        organization_id: 88,
        organization_name: 'Familienforum',
        organization_city: 'Kiel',
        organization_country_code: 'DE',
        total_upcoming_events: 2,
        venue_count: 1,
        space_count: 0,
        can_edit_organization: true,
        can_delete_organization: false,
        can_manage_team: true,
        main_logo_image_id: null,
      },
    ] as OrganizationDashboardRecord[],
    nextVenueId: 320,
    organizationVenues: new Map<number, VenueListRecord[]>([
      [
        77,
        [
          {
            venue_id: 201,
            venue_name: 'Kulturwerft',
            venue_logo_image_id: 0,
            upcoming_event_count: 4,
            spaces: [
              {
                space_id: 301,
                space_name: 'Main Hall',
                upcoming_event_count: 4,
              },
            ],
            can_edit_venue: true,
            can_delete_venue: true,
            can_add_space: true,
            can_edit_space: true,
            can_delete_space: true,
            can_add_event: true,
            can_edit_event: true,
            can_delete_event: true,
            can_release_event: true,
          },
        ],
      ],
      [
        88,
        [
          {
            venue_id: 202,
            venue_name: 'Atelierhaus',
            venue_logo_image_id: 0,
            upcoming_event_count: 2,
            spaces: [],
            can_edit_venue: true,
            can_delete_venue: true,
            can_add_space: true,
            can_edit_space: true,
            can_delete_space: true,
            can_add_event: true,
            can_edit_event: true,
            can_delete_event: true,
            can_release_event: true,
          },
        ],
      ],
    ]),
    nextSpaceId: 450,
    spaces: new Map<number, SpaceRecord>([
      [
        301,
        {
          id: 301,
          venue_id: 201,
          name: 'Main Hall',
          total_capacity: 400,
          seating_capacity: 220,
          space_type: 'hall',
          building_level: 0,
          website_link: 'https://kulturwerft.test/main-hall',
          accessibility_summary: 'Step-free entrance available.',
          accessibility_flags: '0',
          description: 'Open hall with stage.',
          area_sqm: 320,
          environmental_features: 0,
          audio_features: 1,
          presentation_features: 0,
          lighting_features: 0,
          climate_features: 0,
          misc_features: 1,
          created_at: '2026-03-01T09:00:00.000Z',
          modified_at: null,
        },
      ],
    ]),
    profile: {
      display_name: 'Playwright Admin',
      email_address: 'admin@example.com',
      first_name: 'Playwright',
      last_name: 'Admin',
      username: 'playwright-admin',
      locale: 'de',
      theme: 'light',
      avatar_url: null,
      user_id: 501,
    } as UserProfileRecord,
    teamRoles: [
      { id: 1, name: 'Owner', description: 'Full access' },
      { id: 2, name: 'Editor', description: 'Can edit content' },
      { id: 3, name: 'Viewer', description: 'Read only' },
    ] as TeamRoleRecord[],
    nextInviteId: 9000,
    organizationTeams: new Map<number, { members: TeamMemberRecord[]; invitations: TeamInvitationRecord[] }>([
      [
        77,
        {
          members: [
            {
              member_id: 701,
              user_id: 501,
              email: 'admin@example.com',
              display_name: 'Playwright Admin',
              role_id: 1,
              role_name: 'Owner',
              joined_at: '2026-01-10T12:00:00.000Z',
              last_active_at: '2026-03-18T07:30:00.000Z',
            },
            {
              member_id: 702,
              user_id: 502,
              email: 'editor@example.com',
              display_name: 'Nina Curator',
              role_id: 2,
              role_name: 'Editor',
              joined_at: '2026-02-01T10:00:00.000Z',
              last_active_at: '2026-03-17T15:00:00.000Z',
            },
          ],
          invitations: [
            {
              invite_id: 8001,
              user_id: 8801,
              email: 'pending@example.com',
              role_id: 2,
              role_name: 'Editor',
              invited_by: 'Playwright Admin',
              invited_at: '2026-03-16T09:00:00.000Z',
              expires_at: '2026-03-30T09:00:00.000Z',
            },
          ],
        },
      ],
    ]),
    permissionList: {
      organization: [
        { bit: 0, label: 'Edit organization', description: 'Change organization settings.' },
        { bit: 1, label: 'Manage team', description: 'Invite and remove team members.' },
      ],
      venue: [
        { bit: 2, label: 'Edit venues', description: 'Create and update venues.' },
      ],
      event: [
        { bit: 3, label: 'Publish events', description: 'Release events publicly.' },
      ],
    } as Record<string, Array<{ bit: number; label: string; description: string }>>,
    memberPermissions: new Map<string, number>([['77:701', 0b1111], ['77:702', 0b0101]]),
    inboxMessages: [
      {
        id: 11,
        subject: 'Venue assets status',
        message: 'Please confirm whether the April venue assets are final.',
        created_at: '2026-03-17T10:15:00.000Z',
        modified_at: null,
        from_user_id: 712,
        is_read: false,
      },
      {
        id: 12,
        subject: 'Workshop follow-up',
        message: 'The workshop brief is approved. You can proceed with publication.',
        created_at: '2026-03-16T08:30:00.000Z',
        modified_at: '2026-03-16T09:00:00.000Z',
        from_user_id: 713,
        is_read: true,
      },
    ] as InboxMessageRecord[],
    nextTodoId: 3,
    todos: [
      {
        id: 1,
        title: 'Publish April campaign',
        description: 'Coordinate teaser assets and newsletter copy.',
        due_date: '2026-03-25',
        completed: false,
      },
      {
        id: 2,
        title: 'Confirm accessibility review',
        description: 'Check venue notes with the production team.',
        due_date: '2026-03-28',
        completed: true,
      },
    ] as TodoRecord[],
  }

  await page.route('**/*', async (route) => {
    const request = route.request()
    const url = new URL(request.url())
    const { pathname } = url
    const method = request.method()

    if (!pathname.startsWith('/api/')) {
      await route.continue()
      return
    }

    if (pathname.startsWith('/api/image/')) {
      await route.fulfill({ status: 204, contentType: 'image/png', body: '' })
      return
    }

    if (pathname === '/api/choosable-languages') {
      await jsonResponse(route, languageEntries)
      return
    }

    if (pathname === '/api/choosable-link-types') {
      await jsonResponse(route, {
        service: 'mock',
        api_version: '1.0.0',
        response_type: 'mock',
        status: 'ok',
        timestamp: '2026-03-18T08:00:00.000Z',
        metadata: {},
        data: [
          { key: 'website', name: 'Website' },
          { key: 'ticket', name: 'Ticket' },
        ],
        message: 'ok',
      })
      return
    }

    if (pathname === '/api/choosable-currencies') {
      await jsonResponse(route, { data: currencyEntries })
      return
    }

    if (pathname === '/api/event/type-genre-lookup') {
      await jsonResponse(route, eventTypesLookup)
      return
    }

    if (pathname === '/api/event/release-status-i18n') {
      await jsonResponse(route, releaseStatusLookup)
      return
    }

    if (
      pathname === '/api/choosable-venue-types' ||
      pathname === '/api/choosable-space-types' ||
      pathname === '/api/choosable-legal-forms' ||
      pathname === '/api/choosable-license-types'
    ) {
      await jsonResponse(route, { data: [] })
      return
    }

    if (pathname === '/api/events') {
      const hasCursor = Boolean(url.searchParams.get('last_event_start_at'))
      const events = hasCursor ? [] : filterCalendarEvents(url)
      await jsonResponse(route, {
        events,
        last_event_start_at: events.at(-1)?.start_date ?? url.searchParams.get('last_event_start_at') ?? '2026-04-13',
        last_event_date_id: events.at(-1)?.event_date_id ?? Number(url.searchParams.get('last_event_date_id') ?? 1002),
      })
      return
    }

    if (pathname === '/api/events/type-summary') {
      const summaryCounts = new Map<number, number>()
      for (const event of filterCalendarEvents(url)) {
        for (const type of event.event_types ?? []) {
          summaryCounts.set(type.type_id, (summaryCounts.get(type.type_id) ?? 0) + 1)
        }
      }

      await jsonResponse(route, {
        summary: Array.from(summaryCounts.entries()).map(([type_id, date_count]) => ({ type_id, date_count })),
      })
      return
    }

    if (pathname === '/api/events/geojson') {
      await jsonResponse(route, {
        data: {
          venues: {
            201: { lon: 9.43, lat: 54.79, name: 'Kulturwerft', event_count: 4 },
            202: { lon: 10.135, lat: 54.3233, name: 'Atelierhaus', event_count: 2 },
          },
        },
      })
      return
    }

    if (pathname === '/api/venues/geojson') {
      await jsonResponse(route, {
        data: {
          venues: [
            { venue_lon: 9.43, venue_lat: 54.79, venue_name: 'Kulturwerft', venue_city: 'Flensburg' },
            { venue_lon: 10.135, venue_lat: 54.3233, venue_name: 'Atelierhaus', venue_city: 'Kiel' },
          ],
        },
      })
      return
    }

    if (pathname === '/api/transport/stations') {
      await jsonResponse(route, {
        data: [
          { name: 'Flensburg Bahnhof', lon: '9.435', lat: '54.780' },
        ],
      })
      return
    }

    if (pathname === '/api/choosable-venues') {
      const term = (url.searchParams.get('name') ?? '').replace(/\*/g, '').toLowerCase()
      const data = Object.values(venueRecords)
        .filter((venue) => venue.name.toLowerCase().includes(term))
        .map((venue) => ({ id: venue.id, name: venue.name, city: venue.city }))
      await jsonResponse(route, { data })
      return
    }

    if (pathname === '/api/login' && method === 'POST') {
      const body = JSON.parse(request.postData() ?? '{}') as { email?: string; password?: string }
      if (body.email === 'admin@example.com' && body.password === 'Password123!') {
        await jsonResponse(route, {
          message: 'login successful',
          user_id: '501',
          locale: 'de',
          theme: 'light',
          display_name: 'Playwright Admin',
          access_token: 'mock-access-token',
          refresh_token: 'mock-refresh-token',
        })
      } else {
        await jsonResponse(route, { error: 'Invalid credentials' }, 401)
      }
      return
    }

    if (pathname === '/api/signup' && method === 'POST') {
      await jsonResponse(route, { message: 'signup successful' }, 201)
      return
    }

    if (pathname === '/api/activate' && method === 'POST') {
      const body = JSON.parse(request.postData() ?? '{}') as { token?: string }
      if (body.token === 'activation-token-123') {
        await jsonResponse(route, { message: 'account activated' })
      } else {
        await jsonResponse(route, { error: 'Activation token invalid' }, 400)
      }
      return
    }

    if (pathname === '/api/forgot-password' && method === 'POST') {
      await route.fulfill({ status: 204, body: '' })
      return
    }

    if (pathname === '/api/reset-password' && method === 'POST') {
      await jsonResponse(route, { message: 'password reset successful' })
      return
    }

    if (pathname === '/api/admin/user/profile') {
      if (method === 'PUT') {
        const payload = JSON.parse(request.postData() ?? '{}') as Partial<UserProfileRecord>
        if (payload.email_address === 'profile-error@example.com') {
          await jsonResponse(route, { error: 'Profile update failed' }, 400)
          return
        }
        state.profile = {
          ...state.profile,
          ...payload,
          first_name: payload.first_name ?? state.profile.first_name,
          last_name: payload.last_name ?? state.profile.last_name,
          username: payload.username ?? state.profile.username,
          locale: payload.locale ?? state.profile.locale,
          theme: payload.theme ?? state.profile.theme,
        }
      }

      await jsonResponse(route, state.profile)
      return
    }

    if (pathname === '/api/admin/organization/team/invite/accept' && method === 'POST') {
      const body = JSON.parse(request.postData() ?? '{}') as { token?: string }
      if (body.token === 'invite-token-123') {
        await jsonResponse(route, {
          organization_id: 77,
          organization_name: 'Kulturhaus Nord',
          role_name: 'Editor',
          invited_by: 'Nina Curator',
        })
      } else {
        await jsonResponse(route, { error: 'Invite token invalid' }, 400)
      }
      return
    }

    const publicOrganizationMatch = pathname.match(/^\/api\/organization\/(\d+)$/)
    if (publicOrganizationMatch && method === 'GET') {
      const organizationId = Number(publicOrganizationMatch[1])
      const organization = state.organizations.find((entry) => entry.organization_id === organizationId)
      await jsonResponse(route, { name: organization?.organization_name ?? null }, organization ? 200 : 404)
      return
    }

    const organizationTeamMatch = pathname.match(/^\/api\/admin\/organization\/(\d+)\/team$/)
    if (organizationTeamMatch && method === 'GET') {
      const organizationId = Number(organizationTeamMatch[1])
      const team = state.organizationTeams.get(organizationId) ?? { members: [], invitations: [] }
      await jsonResponse(route, {
        members: team.members,
        invitations: team.invitations,
        roles: state.teamRoles,
      })
      return
    }

    const organizationInviteMatch = pathname.match(/^\/api\/admin\/organization\/(\d+)\/team\/invite$/)
    if (organizationInviteMatch && method === 'POST') {
      const organizationId = Number(organizationInviteMatch[1])
      const team = state.organizationTeams.get(organizationId) ?? { members: [], invitations: [] }
      const body = JSON.parse(request.postData() ?? '{}') as { email?: string; role_id?: number | null }
      if (body.email?.trim() === 'invite-error@example.com') {
        await jsonResponse(route, { error: 'Invitation could not be sent' }, 400)
        return
      }
      const role = state.teamRoles.find((entry) => entry.id === body.role_id) ?? state.teamRoles[0]
      const nextInvite: TeamInvitationRecord = {
        invite_id: state.nextInviteId++,
        user_id: state.nextInviteId + 1000,
        email: body.email?.trim() || 'invited@example.com',
        role_id: role?.id ?? null,
        role_name: role?.name ?? 'Owner',
        invited_by: 'Playwright Admin',
        invited_at: '2026-03-18T08:30:00.000Z',
        expires_at: '2026-04-01T08:30:00.000Z',
      }
      team.invitations.unshift(nextInvite)
      state.organizationTeams.set(organizationId, team)
      await jsonResponse(route, { message: 'invite sent' }, 201)
      return
    }

    const organizationTeamMemberMatch = pathname.match(/^\/api\/admin\/organization\/(\d+)\/team\/member\/(\d+)$/)
    if (organizationTeamMemberMatch && method === 'DELETE') {
      const organizationId = Number(organizationTeamMemberMatch[1])
      const userId = Number(organizationTeamMemberMatch[2])
      const team = state.organizationTeams.get(organizationId) ?? { members: [], invitations: [] }
      team.members = team.members.filter((entry) => entry.user_id !== userId)
      team.invitations = team.invitations.filter((entry) => entry.user_id !== userId)
      state.organizationTeams.set(organizationId, team)
      await jsonResponse(route, { message: 'removed' })
      return
    }

    if (pathname === '/api/admin/permissions/list' && method === 'GET') {
      await jsonResponse(route, state.permissionList)
      return
    }

    const organizationMemberPermissionsMatch = pathname.match(/^\/api\/admin\/organization\/(\d+)\/member\/(\d+)\/permissions$/)
    if (organizationMemberPermissionsMatch) {
      const organizationId = Number(organizationMemberPermissionsMatch[1])
      const memberId = Number(organizationMemberPermissionsMatch[2])
      const permissionKey = `${organizationId}:${memberId}`

      if (method === 'PUT') {
        const body = JSON.parse(request.postData() ?? '{}') as { bit?: number; enabled?: boolean }
        const current = state.memberPermissions.get(permissionKey) ?? 0
        const bit = Number(body.bit ?? -1)

        if (bit >= 0) {
          const maskValue = 1 << bit
          const next = body.enabled ? current | maskValue : current & ~maskValue
          state.memberPermissions.set(permissionKey, next)
        }

        await jsonResponse(route, { message: 'updated' })
        return
      }

      const team = state.organizationTeams.get(organizationId) ?? { members: [], invitations: [] }
      const member = team.members.find((entry) => entry.member_id === memberId || entry.user_id === memberId)
      await jsonResponse(route, {
        permissions: state.memberPermissions.get(permissionKey) ?? 0,
        user_display_name: member?.display_name ?? member?.email ?? 'Unknown User',
        user_id: member?.user_id ?? memberId,
      })
      return
    }

    if (pathname === '/api/admin/user/settings' && method === 'PUT') {
      await jsonResponse(route, { message: 'settings saved' })
      return
    }

    if (pathname === '/api/admin/user/messages' && method === 'GET') {
      await jsonResponse(route, { messages: state.inboxMessages })
      return
    }

    if (pathname === '/api/admin/user/send-message' && method === 'POST') {
      const body = JSON.parse(request.postData() ?? '{}') as { subject?: string }
      if (body.subject?.trim() === 'Trigger message error') {
        await jsonResponse(route, { error: 'Message delivery failed' }, 500)
        return
      }
      await jsonResponse(route, { message: 'sent' }, 201)
      return
    }

    if (pathname === '/api/organizations' && method === 'GET') {
      const search = (url.searchParams.get('search') ?? '').trim().toLowerCase()
      const organizations = state.organizations
        .filter((organization) => {
          if (!search) {
            return true
          }

          return (
            organization.organization_name.toLowerCase().includes(search) ||
            (organization.organization_city ?? '').toLowerCase().includes(search)
          )
        })
        .map((organization) => ({
          id: organization.organization_id,
          name: organization.organization_name,
          email: `contact+${organization.organization_id}@example.com`,
          city: organization.organization_city,
          country_code: organization.organization_country_code,
        }))

      await jsonResponse(route, { organizations })
      return
    }

    if (pathname === '/api/admin/organization/dashboard' && method === 'GET') {
      await jsonResponse(route, { organizations: state.organizations })
      return
    }

    if (pathname === '/api/admin/organization/create' && method === 'POST') {
      const body = JSON.parse(request.postData() ?? '{}') as { org_name?: string; name?: string }
      const organizationId = state.nextOrganizationId++
      const organizationName = body.name?.trim() || body.org_name?.trim() || `Mock Organization ${organizationId}`

      state.organizations.unshift({
        organization_id: organizationId,
        organization_name: organizationName,
        organization_city: null,
        organization_country_code: null,
        total_upcoming_events: 0,
        venue_count: 0,
        space_count: 0,
        can_edit_organization: true,
        can_delete_organization: true,
        can_manage_team: true,
        main_logo_image_id: null,
      })

      state.organizationVenues.set(organizationId, [])

      await jsonResponse(route, { metadata: { organization_id: organizationId } }, 201)
      return
    }

    if (pathname === '/api/admin/user/todos') {
      await jsonResponse(route, { todos: state.todos })
      return
    }

    if (pathname === '/api/admin/user/todo' && method === 'PUT') {
      const payload = JSON.parse(request.postData() ?? '{}') as TodoRecord
      const existingIndex = state.todos.findIndex((todo) => todo.id === payload.id)

      if (existingIndex >= 0) {
        state.todos[existingIndex] = {
          ...state.todos[existingIndex],
          ...payload,
        }
        await jsonResponse(route, { id: state.todos[existingIndex].id })
      } else {
        const newTodo = {
          ...payload,
          id: state.nextTodoId++,
        }
        state.todos.unshift(newTodo)
        await jsonResponse(route, { id: newTodo.id })
      }
      return
    }

    const todoDeleteMatch = pathname.match(/^\/api\/admin\/user\/todo\/(\d+)$/)
    if (todoDeleteMatch && method === 'DELETE') {
      const todoId = Number(todoDeleteMatch[1])
      state.todos = state.todos.filter((todo) => todo.id !== todoId)
      await jsonResponse(route, { message: 'deleted' })
      return
    }

    if (pathname === '/api/admin/user/event/notifications') {
      await jsonResponse(route, {
        notifications: [
          {
            event_id: 101,
            event_title: 'Jazz Night Flensburg',
            organization_id: 77,
            organization_name: 'Kulturhaus Nord',
            release_date: '2026-04-01',
            release_status: 'draft',
            earliest_event_date: '2026-04-12',
            days_until_release: 5,
            days_until_event: 16,
          },
        ],
      })
      return
    }

    if (pathname === '/api/admin/user/choosable-event-venues') {
      await jsonResponse(route, {
        data: {
          total_count: 2,
          venueInfos: [
            { venue_id: 201, venue_name: 'Kulturwerft', space_id: 301, space_name: 'Main Hall', city: 'Flensburg', country: 'DE' },
            { venue_id: 202, venue_name: 'Atelierhaus', space_id: null, space_name: null, city: 'Kiel', country: 'DE' },
          ],
        },
      })
      return
    }

    const eventMatch = pathname.match(/^\/api\/event\/(\d+)\/date\/(\d+)$/)
    if (eventMatch) {
      const eventId = Number(eventMatch[1])
      const record = eventDetailRecords[eventId as keyof typeof eventDetailRecords]
      await jsonResponse(route, record ?? { data: null }, record ? 200 : 404)
      return
    }

    if (/^\/api\/event\/\d+\/date\/\d+\/ics$/.test(pathname)) {
      await textResponse(route, 'BEGIN:VCALENDAR\nVERSION:2.0\nEND:VCALENDAR', 200, 'text/calendar')
      return
    }

    const venueMatch = pathname.match(/^\/api\/venue\/(\d+)$/)
    if (venueMatch) {
      const venueId = Number(venueMatch[1]) as keyof typeof venueRecords
      await jsonResponse(route, { data: venueRecords[venueId] ?? null }, venueRecords[venueId] ? 200 : 404)
      return
    }

    const adminOrganizationVenuesMatch = pathname.match(/^\/api\/admin\/organization\/(\d+)\/venues$/)
    if (adminOrganizationVenuesMatch && method === 'GET') {
      const organizationId = Number(adminOrganizationVenuesMatch[1])
      const organization = state.organizations.find((entry) => entry.organization_id === organizationId)

      await jsonResponse(route, {
        organization_id: organizationId,
        organization_name: organization?.organization_name ?? `Organization ${organizationId}`,
        total_upcoming_events: organization?.total_upcoming_events ?? 0,
        can_edit_organization: true,
        can_delete_organization: true,
        can_add_venue: true,
        can_add_space: true,
        can_add_event: true,
        venues: state.organizationVenues.get(organizationId) ?? [],
      })
      return
    }

    const adminOrganizationMatch = pathname.match(/^\/api\/admin\/organization\/(\d+)$/)
    if (adminOrganizationMatch && method === 'GET') {
      const organizationId = Number(adminOrganizationMatch[1])
      const organization = state.organizations.find((entry) => entry.organization_id === organizationId)

      if (!organization) {
        await jsonResponse(route, { error: 'Not found' }, 404)
        return
      }

      await jsonResponse(route, {
        data: {
          id: organization.organization_id,
          name: organization.organization_name,
          city: organization.organization_city,
          country: organization.organization_country_code,
          created_at: '2026-03-01T09:00:00.000Z',
          description: null,
          contact_email: null,
          contact_phone: null,
          website_link: null,
          street: null,
          house_number: null,
          address_addition: null,
          postal_code: null,
          state: null,
          lat: null,
          lon: null,
          holding_organization_id: null,
          legal_form: null,
          nonprofit: false,
          image_main_logo_id: organization.main_logo_image_id,
          image_light_mode_logo_id: null,
          image_dark_mode_logo_id: null,
          api_key: null,
        },
      })
      return
    }

    if (pathname === '/api/admin/venue/create' && method === 'POST') {
      const body = JSON.parse(request.postData() ?? '{}') as { organization_id?: number; venue_name?: string }
      const organizationId = Number(body.organization_id ?? 77)
      const venueId = state.nextVenueId++
      const venueName = body.venue_name?.trim() || `Mock Venue ${venueId}`

      const existingVenues = state.organizationVenues.get(organizationId) ?? []
      existingVenues.unshift({
        venue_id: venueId,
        venue_name: venueName,
        venue_logo_image_id: 0,
        upcoming_event_count: 0,
        spaces: [],
        can_edit_venue: true,
        can_delete_venue: true,
        can_add_space: true,
        can_edit_space: true,
        can_delete_space: true,
        can_add_event: true,
        can_edit_event: true,
        can_delete_event: true,
        can_release_event: true,
      })
      state.organizationVenues.set(organizationId, existingVenues)

      await jsonResponse(route, { metadata: { venue_id: venueId } }, 201)
      return
    }

    if (pathname === '/api/admin/space/create' && method === 'POST') {
      const body = JSON.parse(request.postData() ?? '{}') as {
        organization_id?: number
        venue_id?: number
        space_name?: string
      }
      const organizationId = Number(body.organization_id ?? 77)
      const venueId = Number(body.venue_id ?? 201)
      const spaceId = state.nextSpaceId++
      const spaceName = body.space_name?.trim() || `Mock Space ${spaceId}`

      state.spaces.set(spaceId, {
        id: spaceId,
        venue_id: venueId,
        name: spaceName,
        total_capacity: null,
        seating_capacity: null,
        space_type: null,
        building_level: null,
        website_link: null,
        accessibility_summary: null,
        accessibility_flags: '0',
        description: null,
        area_sqm: null,
        environmental_features: null,
        audio_features: null,
        presentation_features: null,
        lighting_features: null,
        climate_features: null,
        misc_features: null,
        created_at: '2026-03-18T09:00:00.000Z',
        modified_at: null,
      })

      const venues = state.organizationVenues.get(organizationId) ?? []
      const venue = venues.find((entry) => entry.venue_id === venueId)
      if (venue) {
        venue.spaces.push({
          space_id: spaceId,
          space_name: spaceName,
          upcoming_event_count: 0,
        })
      }

      await jsonResponse(route, { metadata: { space_id: spaceId } }, 201)
      return
    }

    const adminVenueMatch = pathname.match(/^\/api\/admin\/venue\/(\d+)$/)
    if (adminVenueMatch && method === 'GET') {
      const venueId = Number(adminVenueMatch[1])
      const venue =
        Array.from(state.organizationVenues.values())
          .flat()
          .find((entry) => entry.venue_id === venueId) ??
        Object.values(venueRecords).find((entry) => entry.id === venueId)

      if (!venue) {
        await jsonResponse(route, { error: 'Not found' }, 404)
        return
      }

      const organizationId =
        'organization_id' in venue && typeof venue.organization_id === 'number'
          ? venue.organization_id
          : Array.from(state.organizationVenues.entries()).find(([, venues]) => venues.some((entry) => entry.venue_id === venueId))?.[0] ?? 77

      const source =
        'id' in venue
          ? venue
          : null

      await jsonResponse(route, {
        data: {
          id: venueId,
          organization_id: organizationId,
          name: 'venue_name' in venue ? venue.venue_name : source?.name ?? `Venue ${venueId}`,
          type: source?.type_name ?? null,
          street: source?.street ?? null,
          house_number: source?.house_number ?? null,
          postal_code: source?.postal_code ?? null,
          city: source?.city ?? null,
          state: null,
          country: source?.country ?? 'DE',
          lat: source ? Number(source.lat) : null,
          lon: source ? Number(source.lon) : null,
          opened_at: null,
          closed_at: null,
          description: source?.description ?? null,
          contact_email: source?.contact_email ?? null,
          contact_phone: source?.contact_phone ?? null,
          website_link: source?.website_link ?? null,
          created_at: '2026-03-01T09:00:00.000Z',
          modified_at: null,
          created_by: 501,
          modified_by: null,
        },
      })
      return
    }

    const adminVenueFieldsMatch = pathname.match(/^\/api\/admin\/venue\/(\d+)\/fields$/)
    if (adminVenueFieldsMatch && method === 'PUT') {
      const venueId = Number(adminVenueFieldsMatch[1])
      const payload = JSON.parse(request.postData() ?? '{}') as Record<string, unknown>

      if (payload.name === 'Trigger venue save error') {
        await jsonResponse(route, { error: 'Venue save failed' }, 400)
        return
      }

      const storedVenue = Array.from(state.organizationVenues.values())
        .flat()
        .find((entry) => entry.venue_id === venueId)

      if (storedVenue && typeof payload.name === 'string') {
        storedVenue.venue_name = payload.name
      }

      await jsonResponse(route, { message: 'saved' })
      return
    }

    const adminSpaceMatch = pathname.match(/^\/api\/admin\/space\/(\d+)$/)
    if (adminSpaceMatch && method === 'GET') {
      const spaceId = Number(adminSpaceMatch[1])
      const space = state.spaces.get(spaceId)
      await jsonResponse(route, { data: space ?? null }, space ? 200 : 404)
      return
    }

    const adminSpaceFieldsMatch = pathname.match(/^\/api\/admin\/space\/(\d+)\/fields$/)
    if (adminSpaceFieldsMatch && method === 'PUT') {
      const spaceId = Number(adminSpaceFieldsMatch[1])
      const space = state.spaces.get(spaceId)
      if (!space) {
        await jsonResponse(route, { error: 'Not found' }, 404)
        return
      }

      const payload = JSON.parse(request.postData() ?? '{}') as Record<string, unknown>
      if (payload.description === 'Trigger space save error') {
        await jsonResponse(route, { error: 'Space save failed' }, 400)
        return
      }
      Object.assign(space, payload, { modified_at: '2026-03-18T09:15:00.000Z' })

      const venueEntry = Array.from(state.organizationVenues.values())
        .flat()
        .find((venue) => venue.venue_id === space.venue_id)
      const spaceInfo = venueEntry?.spaces.find((entry) => entry.space_id === spaceId)
      if (spaceInfo && typeof payload.name === 'string') {
        spaceInfo.space_name = payload.name
      }

      await jsonResponse(route, { message: 'saved' })
      return
    }

    const adminSpaceDeleteMatch = pathname.match(/^\/api\/admin\/space\/(\d+)$/)
    if (adminSpaceDeleteMatch && method === 'DELETE') {
      const spaceId = Number(adminSpaceDeleteMatch[1])
      const space = state.spaces.get(spaceId)
      if (space) {
        state.spaces.delete(spaceId)
        const venueEntry = Array.from(state.organizationVenues.values())
          .flat()
          .find((venue) => venue.venue_id === space.venue_id)
        if (venueEntry) {
          venueEntry.spaces = venueEntry.spaces.filter((entry) => entry.space_id !== spaceId)
        }
      }
      await jsonResponse(route, { message: 'deleted' })
      return
    }

    if (pathname === '/api/admin/event/initial' && method === 'POST') {
      const body = JSON.parse(request.postData() ?? '{}') as { event_title?: string }
      const eventId = state.nextEventId++
      state.adminEvents.set(eventId, createAdminEvent(eventId, body.event_title ?? 'New Event'))
      await jsonResponse(route, { metadata: { event_id: eventId } }, 201)
      return
    }

    const adminEventMatch = pathname.match(/^\/api\/admin\/event\/(\d+)$/)
    if (adminEventMatch) {
      const eventId = Number(adminEventMatch[1])
      const event = state.adminEvents.get(eventId)
      await jsonResponse(route, { data: event ?? null }, event ? 200 : 404)
      return
    }

    const adminEventFieldsMatch = pathname.match(/^\/api\/admin\/event\/(\d+)\/fields$/)
    if (adminEventFieldsMatch && method === 'PUT') {
      const eventId = Number(adminEventFieldsMatch[1])
      const event = state.adminEvents.get(eventId)
      if (!event) {
        await jsonResponse(route, { error: 'Not found' }, 404)
        return
      }

      const payload = JSON.parse(request.postData() ?? '{}') as Record<string, unknown>
      if (payload.title === 'Trigger event save error') {
        await jsonResponse(route, { error: 'Event save failed' }, 400)
        return
      }
      applyFieldPatch(event, payload)
      await jsonResponse(route, { message: 'saved' })
      return
    }

    const adminEventDatesMatch = pathname.match(/^\/api\/admin\/event\/(\d+)\/dates$/)
    if (adminEventDatesMatch && method === 'PUT') {
      const eventId = Number(adminEventDatesMatch[1])
      const event = state.adminEvents.get(eventId)
      if (!event) {
        await jsonResponse(route, { error: 'Not found' }, 404)
        return
      }

      const payload = JSON.parse(request.postData() ?? '{}') as { event_dates?: Array<Record<string, unknown>> }
      event.dates = payload.event_dates ?? []
      await jsonResponse(route, { message: 'saved' })
      return
    }

    await jsonResponse(route, { error: `Unhandled mock for ${method} ${pathname}` }, 501)
  })
}

export const expectNoConsoleErrors = async (page: Page) => {
  const relevantErrors: string[] = []
  page.on('console', (message) => {
    if (message.type() !== 'error') return
    const text = message.text()
    if (text.includes('Failed to load resource: the server responded with a status of 204')) return
    relevantErrors.push(text)
  })

  await page.addLocatorHandler(page.locator('body'), async () => {
    expect(relevantErrors, relevantErrors.join('\n')).toEqual([])
  })
}
