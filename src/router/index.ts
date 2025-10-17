import { createRouter, createWebHistory } from 'vue-router'
import DashboardView from '@/views/DashboardView.vue'
import VenuesView from '@/views/VenuesView.vue'

const routes = [
    { path: '/', redirect: '/dashboard' },
    { path: '/dashboard', component: DashboardView },
    { path: '/venues', component: VenuesView },
]

const router = createRouter({
    history: createWebHistory(),
    routes,
})

export default router
