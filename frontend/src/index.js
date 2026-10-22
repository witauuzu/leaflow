import { createRouter, createWebHistory } from 'vue-router'
import landingPage from './pages/landing-page.vue'
import login from './pages/login.vue'
import register from './pages/signup.vue'
import dashboard from './pages/dashboard/dashboard.vue'

const routes = [
  { path: '/', component: landingPage },
  { path: '/login', component: login },
  { path: '/register', component: register },
  { path: '/dashboard', component: dashboard }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router