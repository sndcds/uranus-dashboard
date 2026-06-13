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
import UranusVenueView from '@/component/venue/view/UranusVenueView.vue'
import UranusEventView from '@/component/event/view/UranusEventView.vue'
import UranusHtmlView from '@/view/public/UranusHTMLView.vue'
import UserActivateView from '@/component/register/UserActivateView.vue'
import UranusOrgTeamInviteActivateView from '@/component/user/UranusOrgTeamInviteActivateView.vue'
import UranusOrgTeamView from '@/component/org/view/UranusOrgTeamView.vue'
import UranusOrgInviteTeamMemberView from '@/component/org/view/UranusOrgInviteTeamMemberView.vue'
import UranusOrgMemberPermissionView from '@/component/org/view/UranusOrgMemberPermissionView.vue'
import UranusEventsView from '@/component/event/view/UranusEventsView.vue'
import UranusEventCalendarView from '@/view/public/UranusEventCalendarView.vue'
import UranusEventSlideshowView from '@/component/slideshow/UranusEventSlideshowView.vue'
import UranusDevThemeView from '@/view/dev/UranusDevThemeView.vue'

import GenericLayout from '@/component/layout/GenericLayout.vue'
import UranusOrgListView from '@/component/org/view/UranusOrgListView.vue'
import UranusOrgEditView from '@/component/org/view/UranusOrgEditView.vue'
import UranusOrgCreateView from '@/component/org/view/UranusOrgCreateView.vue'
import UranusPartnerListView from '@/component/partner/view/UranusPartnerListView.vue'
import UranusPartnerRequestView from '@/component/partner/view/UranusPartnerRequestView.vue'
import UranusVenueCreateView from '@/component/venue/view/UranusVenueCreateView.vue'
import UranusVenueEditView from '@/component/venue/view/UranusVenueEditView.vue'
import UranusAdminEventCardsView from '@/component/event/view/UranusAdminEventCardsView.vue'
import UranusAdminEventCreateView from '@/component/event/view/UranusAdminEventCreateView.vue'
import UranusAdminEventEditView from '@/component/event/view/UranusAdminEventEditView.vue'
import UranusDevGetEventsView from '@/component/dev/UranusDevGetEventsView.vue'
import UranusMapView from '@/view/public/UranusMapView.vue'
import ContentOnlyLayout from '@/component/layout/ContentOnlyLayout.vue'
import UranusDevI18nTestsView from '@/view/dev/UranusDevI18nTestsView.vue'
import UranusPortalView from '@/component/portal/view/UranusPortalView.vue'
import UranusAdminPortalListView from '@/component/portal/view/UranusAdminPortalListView.vue'
import UranusPortalCreateView from '@/component/portal/view/UranusPortalCreateView.vue'
import UranusPortalEditView from '@/component/portal/view/UranusPortalEditView.vue'
import UranusFavoriteListListView from '@/component/favorite/view/UranusFavoriteListListView.vue'
import UranusFavoriteListCreateView from '@/component/favorite/view/UranusFavoriteListCreateView.vue'
import UranusFavoriteListEditView from '@/component/favorite/view/UranusFavoriteListEditView.vue'


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
                path: 'orgs',
                name: 'admin-orgs',
                component: UranusOrgListView,
            },
            {
                path: 'org/create',
                name: 'admin-create-org',
                component: UranusOrgCreateView,
            },
            {
                path: 'org/:orgUuid/edit',
                name: 'admin-edit-org',
                component: UranusOrgEditView,
            },
            {
                path: 'org/:orgUuid/team',
                name: 'admin-team-org',
                component: UranusOrgTeamView,
            },
            {
                path: 'org/:orgUuid/invite-team-member',
                name: 'admin-org-invite-team-member',
                component: UranusOrgInviteTeamMemberView,
            },
            {
                path: 'org/:orgUuid/venue/create',
                name: 'admin-create-venue',
                component: UranusVenueCreateView,
            },
            {
                path: 'org/:orgUuid/venue/:venueUuid/edit',
                name: 'admin-edit-venue',
                component: UranusVenueEditView,
            },
            {
                path: 'org/:orgUuid/venue/:venueUuid/space/create',
                name: 'admin-create-space',
                component: UranusSpaceCreateView,
            },
            {
                path: 'org/:orgUuid/venue/:venueUuid/space/:spaceUuid/edit',
                name: 'admin-edit-space',
                component: UranusSpaceEditView,
            },
            {
                path: 'org/venues',
                name: 'admin-venues',
                component: UranusAdminVenueListView,
            },
            {
                path: 'org/portals',
                name: 'admin-portals',
                component: UranusAdminPortalListView,
            },
            {
                path: 'org/favorite-lists',
                name: 'admin-favorite-lists',
                component: UranusFavoriteListListView,
            },
            {
                path: 'org/:orgUuid/favorite-list/create',
                name: 'admin-create-favorite-list',
                component: UranusFavoriteListCreateView,
            },
            {
                path: 'org/favorite-lists/:favoriteListUuid/edit',
                name: 'admin-edit-favorite-list',
                component: UranusFavoriteListEditView,
            },
            {
                path: 'org/partners',
                name: 'admin-partners',
                component: UranusPartnerListView,
            },
            {
                path: 'org/partner-request',
                name: 'admin-partner-request',
                component: UranusPartnerRequestView,
            },
            {
                path: 'org/events',
                name: 'admin-org-events',
                component: UranusAdminEventCardsView,
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
                path: 'org/:uuid/member/:memberUuid/permissions',
                name: 'admin-edit-member-permission',
                component: UranusOrgMemberPermissionView,
            },
            {
                path: 'org/:orgUuid/event/create',
                name: 'admin-create-event',
                component: UranusAdminEventCreateView,
            },
            {
                path: 'org/:orgUuid/portal/create',
                name: 'admin-create-portal',
                component: UranusPortalCreateView,
            },
            {
                path: 'org/:orgUuid/portal/:portalUuid/edit',
                name: 'admin-edit-portal',
                component: UranusPortalEditView,
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
                component: UranusAdminEventEditView,
            },
        ],
    },
    {
        path: '/slideshow',
        name: 'event-slideshow',
        component: UranusEventSlideshowView,
    },
    {
        path: '/portal/:uuid',
        name: 'event-portal',
        component: UranusPortalView,
    },
    {
        path: '/app',
        component: GenericLayout,
        meta: { guestOnly: true },
        children: [
            {
                path: '',
                redirect: () => {
                    const tokenStore = useTokenStore()
                    return { name: tokenStore.hasKnownAccount ? 'app-login' : 'app-signup' }
                },
            },
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
        ],
    },
    {
        path: '/app/activate',
        component: GenericLayout,
        children: [
            {
                path: 'account',
                name: 'app-activate-account',
                component: UserActivateView,
            },
            {
                path: 'team-invitation',
                name: 'app-activate-team-invitation',
                component: UranusOrgTeamInviteActivateView,
            },
        ],
    },
    {
        path: '/',
        component: GenericLayout,
        children: [
            {
                path: 'page/404',
                name: '404',
                component: UranusHtmlView,
                meta: {
                    customClass: 'uranus-404',
                    layoutMode: 'zero-padding',
                },
                props: {
                    pageName: '404'
                }
            },
            {
                path: 'page/about',
                name: 'about',
                component: UranusHtmlView,
                meta: {
                    customClass: 'uranus-about',
                    layoutMode: 'zero-padding',
                },
                props: {
                    pageName: 'about'
                }
            },
            {
                path: '/page/:pageName(.*)',
                component: UranusHtmlView,
                meta: {
                    layoutMode: 'zero-padding',
                    customClass: 'uranus-custom-content'
                },
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
                path: 'venue/:uuid',
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
        path: '/page/help',
        component: GenericLayout,
        meta: {
            layoutMode: 'zero-padding',
        },
        children: [
            {
                path: '',
                name: 'help',
                component: UranusHtmlView,
                props: { pageName: 'help' }
            },
            {
                path: ':slug',
                name: 'help-page',
                component: UranusHtmlView,
                props: (route: { params: { slug: any } }) => ({
                    pageName: `help/${route.params.slug}`
                })
            }
        ]
    },
    {
        path: '/:pathMatch(.*)*',
        redirect: '/page/404'
    },
]

const router = createRouter({
    history: createWebHistory(),
    routes,
    scrollBehavior(to) {
        if (to.hash) {
            return {
                el: to.hash,
                behavior: 'smooth',
            }
        }

        return { top: 0 }
    },
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
            name: tokenStore.hasKnownAccount ? 'app-login' : 'app-signup',
            query: { redirect: to.fullPath },
        }
    }

    if (guestOnly && isAuthenticated && to.query.logout !== '1') {
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
