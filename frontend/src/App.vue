
<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'

import Navbar from './components/navbar.vue'
import Sidebar from './components/sidebar.vue'
import SiteFooter from './components/site-footer.vue'
import ChatWidget from './components/chat-widget.vue'

const route = useRoute()

const isDashboard = computed(() =>
  route.path.startsWith('/dashboard')
)

const isAuthPage = computed(() =>
  ['/login', '/register', '/verify-email', '/forgot-password', '/reset-password'].includes(route.path)
)
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
