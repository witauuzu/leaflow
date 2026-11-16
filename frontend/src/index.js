import { createRouter, createWebHistory } from 'vue-router'
import landingPage from './pages/landing-page.vue'
import explore from './pages/explore-meal.vue'
import trial from './pages/AI-trial.vue'
import features from './pages/features.vue'
import login from './pages/authentication/login.vue'
import register from './pages/authentication/signup.vue'
import dashboard from './pages/dashboard/home/dashboard.vue'
import exploreMeal from './pages/dashboard/explore/explore.vue'
import planner from './pages/dashboard/planner/planner.vue'
import calendar from './pages/dashboard/calendar/calendar.vue'
import track from './pages/dashboard/track/track.vue'
import profile from './pages/dashboard/profile/profile.vue'
import forgotPassword from './pages/authentication/forgot-password.vue'
import resetPassword from './pages/authentication/reset-password.vue'
import plannerCreate from './pages/dashboard/planner/planner-create.vue'
import PlannerResult from './pages/dashboard/planner/planner-result.vue'
import notFound from './pages/not-found.vue'

const routes = [
  { path: '/', component: landingPage },
  { path: '/explore', component: explore },
  { path: '/trial', component: trial },
  { path: '/features', component: features },
  { path: '/login', component: login },
  { path: '/register', component: register },
  { path: '/dashboard', component: dashboard, meta: { requiresAuth: true } },
  { path: '/forgot-password', component: forgotPassword},
  { path: '/reset-password', component: resetPassword },
  { path: '/dashboard/explore', component: exploreMeal,meta: { requiresAuth: true } },
  { path: '/dashboard/planner', component: planner, meta: { requiresAuth: true } },
  { path: '/dashboard/calendar', component: calendar, meta: { requiresAuth: true } },
  { path: '/dashboard/track', component: track, meta: { requiresAuth: true }},
  { path: '/dashboard/profile', component: profile, meta: { requiresAuth: true } },
  { path: '/dashboard/planner/create', component: plannerCreate, meta: { requiresAuth: true } },
  { path: '/dashboard/planner/result', component: PlannerResult, meta: { requiresAuth: true } },
  { path: '/:pathMatch(.*)*', component: notFound },
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach((to) => {
  const session = JSON.parse(
    localStorage.getItem('leaflow-session') || 'null'
  )

  const token = session?.access_token

  let isLoggedIn = false

  if (token) {
    try {
      const payload = JSON.parse(
        atob(token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/'))
      )

      isLoggedIn = !!payload.exp && payload.exp * 1000 > Date.now()
    } catch {
      isLoggedIn = false
    }
  }

  if (!isLoggedIn) {
    localStorage.removeItem('leaflow-session')
  }

  if (to.meta.requiresAuth && !isLoggedIn) {
    return {
      path: '/login',
      query: { redirect: to.fullPath },
    }
  }
})

router.afterEach(() => {
  window.scrollTo({ top: 0, left: 0, behavior: 'instant' })
})

export default router