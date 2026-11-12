import { createRouter, createWebHistory } from 'vue-router'
import landingPage from './pages/landing-page.vue'
import explore from './pages/explore-meal.vue'
import AItrial from './pages/AI-trial.vue'
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

const routes = [
  { path: '/', component: landingPage },
  { path: '/explore', component: explore },
  { path: '/AITrial', component: AItrial },
  { path: '/features', component: features },
  { path: '/login', component: login },
  { path: '/register', component: register },
  { path: '/dashboard', component: dashboard },
  { path: '/forgot-password', component: forgotPassword},
  { path: '/reset-password', component: resetPassword },
  { path: '/dashboard/explore', component: exploreMeal },
  { path: '/dashboard/planner', component: planner },
  { path: '/dashboard/calendar', component: calendar },
  { path: '/dashboard/track', component: track },
  { path: '/dashboard/profile', component: profile },
  { path: '/dashboard/planner/create', component: plannerCreate },
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router