import { createRouter, createWebHistory } from 'vue-router'
import landingPage from './pages/landing-page.vue'
import login from './pages/authentication/login.vue'
import register from './pages/authentication/signup.vue'
import dashboard from './pages/dashboard/dashboard.vue'
import explore from './pages/dashboard/explore.vue'
import planner from './pages/dashboard/planner.vue'
import calendar from './pages/dashboard/calender.vue'
import pantry from './pages/dashboard/pantry.vue'
import track from './pages/dashboard/track.vue'
import profile from './pages/dashboard/profile.vue'
import forgotPassword from './pages/authentication/forgot-password.vue'
import resetPassword from './pages/authentication/reset-password.vue'

const routes = [
  { path: '/', component: landingPage },
  { path: '/login', component: login },
  { path: '/register', component: register },
  { path: '/dashboard', component: dashboard },
  { path: '/forgot-password', component: forgotPassword},
  { path: '/reset-password', component: resetPassword },
  { path: '/dashboard/explore', component: explore },
  { path: '/dashboard/planner', component: planner },
  { path: '/dashboard/calendar', component: calendar },
  { path: '/dashboard/pantry', component: pantry },
  { path: '/dashboard/track', component: track },
  { path: '/dashboard/profile', component: profile },
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router