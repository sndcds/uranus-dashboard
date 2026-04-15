import { createRouter, createWebHistory } from 'vue-router'
import type { RouteLocationNormalized } from 'vue-router'
import { useTokenStore } from '@/store/uranusTokenStore.ts'

import UranusDashboardView from '@/component/dashboard/view/UranusDashboardView.vue'
import UranusAdminTodoListView from '@/component/todo/view/UranusAdminTodoListView.vue'
import UranusLoginView from '@/component/register/UranusLoginView.vue'
import UranusAdminVenueListView from '@/component/venue/view/UranusAdminVenueListView.vue'
import UranusSignupView from '@/component/register/UranusSignupView.vue'
import UranusSpaceCreateView from '@/component/space/view/UranusSpaceCreateView.vue'
import UranusSpaceEditView from '@/component/space/view/UranusSpaceEditView.vue'
import UranusUserProfileView from '@/component/user/UranusUserProfileView.vue'
import UranusForgotPasswordView from '@/component/register/UranusForgotPasswordView.vue'
import UranusResetPasswordView from '@/component/register/UranusResetPasswordView.vue'
import UranusMessageInboxView from '@/view/UranusMessageInboxView.vue'
import UranusMessageSendView from '@/view/UranusMessageSendView.vue'
import UranusVenueView from '@/view/public/UranusVenueView.vue'
import UranusEventView from '@/component/event/view/UranusEventView.vue'
import UranusHtmlView from '@/view/public/UranusHTMLView.vue'
import UserActivateView from '@/view/UserActivateView.vue'
import UranusInviteActivateView from '@/component/user/UranusInviteActivateView.vue'
import UranusOrganizationTeamView from '@/component/organization/view/UranusOrganizationTeamView.vue'
import UranusOrganizationInviteTeamMemberView from '@/component/organization/view/UranusOrganizationInviteTeamMemberView.vue'
import UranusOrganizationMemberPermissionView from '@/component/organization/view/UranusOrganizationMemberPermissionView.vue'
import UranusEventsView from '@/view/public/UranusEventsView.vue'
import UranusEventCalendarView from '@/view/public/UranusEventCalendarView.vue'
import UranusEventSlideshowView from '@/view/public/UranusEventSlideshowView.vue'
import UranusDevThemeView from '@/view/dev/UranusDevThemeView.vue'

import GenericLayout from '@/component/layout/GenericLayout.vue'
import UranusOrganizationListView from '@/component/organization/view/UranusOrganizationListView.vue'
import UranusOrganizationEditView from '@/component/organization/view/UranusOrganizationEditView.vue'
import UranusOrganizationCreateView from '@/component/organization/view/UranusOrganizationCreateView.vue'
import UranusVenueCreateView from '@/component/venue/view/UranusVenueCreateView.vue'
import UranusVenueEditView from '@/component/venue/view/UranusVenueEditView.vue'
import UranusEventListView from '@/component/event/view/UranusEventListView.vue'
import UranusEventCreateView from '@/component/event/view/UranusEventCreateView.vue'
import UranusEventEditView from '@/component/event/view/UranusEventEditView.vue'
import UranusDevGetEventsView from '@/component/dev/UranusDevGetEventsView.vue'
import UranusMapView from '@/view/public/UranusMapView.vue'
import ContentOnlyLayout from '@/component/layout/ContentOnlyLayout.vue'
import UranusDevI18nTestsView from '@/view/dev/UranusDevI18nTestsView.vue'


const routes = [
    {
        path: '/admin',
        component: GenericLayout,
        meta: { requiresAuth: true },
        children: [
            {
                path: '',
                redirect: { name: 'admin-dashboard' },
            },
            {
                path: 'dashboard',
                name: 'admin-dashboard',
                component: UranusDashboardView,
            },
            {
                path: 'todo-list',
                name: 'admin-todo-list',
                component: UranusAdminTodoListView,
            },
            {
                path: 'organizations',
                name: 'admin-organizations',
                component: UranusOrganizationListView,
            },
            {
                path: 'organization/create',
                name: 'admin-create-organization',
                component: UranusOrganizationCreateView,
            },
            {
                path: 'organization/:orgUuid/edit',
                name: 'admin-edit-organization',
                component: UranusOrganizationEditView,
            },
            {
                path: 'organization/:orgUuid/team',
                name: 'admin-team-organization',
                component: UranusOrganizationTeamView,
            },
            {
                path: 'organization/:orgUuid/invite-team-member',
                name: 'admin-organization-invite-team-member',
                component: UranusOrganizationInviteTeamMemberView,
            },
            {
                path: 'organization/:orgUuid/venue/create',
                name: 'admin-create-venue',
                component: UranusVenueCreateView,
            },
            {
                path: 'organization/:orgUuid/venue/:venueUuid/edit',
                name: 'admin-edit-venue',
                component: UranusVenueEditView,
            },
            {
                path: 'organization/:orgUuid/venue/:venueUuid/space/create',
                name: 'admin-create-space',
                component: UranusSpaceCreateView,
            },
            {
                path: 'organization/:orgUuid/venue/:venueUuid/space/:spaceUuid/edit',
                name: 'admin-edit-space',
                component: UranusSpaceEditView,
            },
            {
                path: 'organization/:orgUuid/venues',
                name: 'admin-venues',
                component: UranusAdminVenueListView,
            },
            {
                path: 'organization/:orgUuid/events',
                name: 'admin-organization-events',
                component: UranusEventListView,
            },
            {
                path: 'user/profile',
                name: 'admin-user-profile',
                component: UranusUserProfileView,
            },
            {
                path: 'user/messages/inbox',
                name: 'admin-user-messages-inbox',
                component: UranusMessageInboxView,
            },
            {
                path: 'user/messages/send',
                name: 'admin-user-messages-send',
                component: UranusMessageSendView,
            },
            {
                path: 'invite/accept',
                name: 'admin-accept-invite',
                component: UranusInviteActivateView,
            },
            {
                path: 'organization/:uuid/member/:memberUuid/permissions',
                name: 'admin-edit-member-permission',
                component: UranusOrganizationMemberPermissionView,
            },
            {
                path: 'organization/:orgUuid/event/create',
                name: 'admin-create-event',
                component: UranusEventCreateView,
            },
        ],
    },
    {
        path: '/admin/event/:uuid',
        component: ContentOnlyLayout,
        meta: { requiresAuth: true },
        children: [
            {
                path: '',
                name: 'admin-event-edit',
                component: UranusEventEditView,
            },
        ],
    },
    {
        path: '/slideshow',
        name: 'event-slideshow',
        component: UranusEventSlideshowView,
    },
    {
        path: '/',
        component: GenericLayout,
        children: [
            {
                path: '/page/:pageName(.*)',
                component: UranusHtmlView,
                props: (route: RouteLocationNormalized) => ({
                    pageName: route.params.pageName as string
                })
            },
            {
                path: '',
                name: 'events',
                component: UranusEventsView,
                meta: { layoutMode: 'zero-padding' },
            },
            {
                path: 'event/:uuid/date/:eventDateUuid',
                name: 'event-details',
                component: UranusEventView,
            },
            {
                path: 'event/:uuid/date/:eventDateUuid/:mode',
                name: 'event-details-preview',
                component: UranusEventView,
            },
            {
                path: 'venue/:id',
                name: 'venue-details',
                component: UranusVenueView,
            },
            {
                path: 'map',
                name: 'map',
                component: UranusMapView,
                meta: { layoutMode: 'zero-padding' },
            },
            {
                path: 'calendar-demo',
                name: 'calendar-demo',
                component: UranusEventCalendarView,
                meta: { layoutMode: 'zero-padding' },
            },
            {
                path: 'dev-theme-view',
                name: 'dev-theme-view',
                component: UranusDevThemeView,
                meta: { layoutMode: 'zero-padding' },
            },
            {
                path: 'dev-i18n-tests-view',
                name: 'dev-i18n-tests-view',
                component: UranusDevI18nTestsView,
                meta: { layoutMode: 'zero-padding' },
            },
            {
                path: 'dev-get-events',
                name: 'dev-get-events',
                component: UranusDevGetEventsView
            },
        ],
    },
    {
        path: '/app',
        component: GenericLayout,
        meta: { guestOnly: true },
        children: [
            {
                path: 'login',
                name: 'app-login',
                component: UranusLoginView,
            },
            {
                path: 'signup',
                name: 'app-signup',
                component: UranusSignupView,
            },
            {
                path: 'forgot-password',
                name: 'app-forgot-password',
                component: UranusForgotPasswordView,
            },
            {
                path: 'reset-password',
                name: 'app-reset-password',
                component: UranusResetPasswordView,
            },
            {
                path: 'activate/account',
                name: 'app-activate-account',
                component: UserActivateView,
            }
        ],
    },
    {
        path: '/:pathMatch(.*)*',
        redirect: '/page/404'
    },
]

const router = createRouter({
    history: createWebHistory(),
    routes,
})

let previousRoute: RouteLocationNormalized | null = null

router.beforeEach((to, from) => {
    previousRoute = from

    const tokenStore = useTokenStore()
    const isAuthenticated = tokenStore.isAuthenticated
    const requiresAuth = to.matched.some((record) => record.meta?.requiresAuth)
    const guestOnly = to.matched.some((record) => record.meta?.guestOnly)

    if (requiresAuth && !isAuthenticated) {
        return {
            name: 'app-login',
            query: { redirect: to.fullPath },
        }
    }

    if (guestOnly && isAuthenticated) {
        if (to.name !== 'events') {
            return { name: 'events' }
        }
        return true
    }

    return true
})

export function getPreviousRoute() {
    return previousRoute
}

export default router
