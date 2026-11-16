<script setup>
import { computed, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { supabase } from '../src/lib/supabase.js'

import Navbar from './components/navbar.vue'
import Sidebar from './components/sidebar.vue'
import SiteFooter from './components/site-footer.vue'
import ChatWidget from './components/chat-widget.vue'

const route = useRoute()
const router = useRouter()

const isDashboard = computed(() =>
  route.path.startsWith('/dashboard')
)

const isAuthPage = computed(() =>
  ['/login', '/register', '/verify-email', '/forgot-password', '/reset-password'].includes(route.path)
)

let authListener = null

onMounted(() => {
  const { data } = supabase.auth.onAuthStateChange(
    (event, session) => {
      if (event === 'SIGNED_OUT' || !session) {
        if (route.meta.requiresAuth) {
          router.replace('/login')
        }
      }
    }
  )

  authListener = data.subscription
})

onUnmounted(() => {
  authListener?.unsubscribe()
})
</script>

<template>
  <div>
    <!-- Authentication Pages -->
    <template v-if="isAuthPage">
      <RouterView />
    </template>

    <!-- Dashboard Pages -->
    <template v-else-if="isDashboard">
      <div class="flex min-h-screen">
        <Sidebar class="sticky top-0 h-screen"/>

        <main class="min-w-0 flex-1">
          <RouterView />
        </main>
      </div>
    </template>

    <!-- Public Pages -->
    <template v-else>
      <Navbar />
      <RouterView />
      <SiteFooter />
    </template>

    <ChatWidget />
  </div>
</template>
