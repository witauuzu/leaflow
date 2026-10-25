import { createRouter, createWebHistory } from 'vue-router'
import landingPage from './pages/landing-page.vue'
import login from './pages/login.vue'
import register from './pages/signup.vue'
import dashboard from './pages/dashboard/dashboard.vue'
import verify from './pages/verify.vue'
import { comma } from 'postcss/lib/list'
import forgotPassword from './pages/forgot-password.vue'
import resetPassword from './pages/reset-password.vue'


const routes = [
  { path: '/', component: landingPage },
  { path: '/login', component: login },
  { path: '/register', component: register },
  { path: '/dashboard', component: dashboard },
  { path: '/verivy-email', component: verify},
  { path: '/forgot-password', component: forgotPassword},
  { path: '/reset-password', component: resetPassword }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router