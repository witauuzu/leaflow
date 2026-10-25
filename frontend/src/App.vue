
<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'

import Navbar from './components/navbar.vue'
import Sidebar from './components/sidebar.vue'

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
    <!-- Halaman autentikasi tanpa navbar dan sidebar -->
    <template v-if="isAuthPage">
      <RouterView />
    </template>

    <!-- Halaman dashboard menggunakan sidebar -->
    <template v-else-if="isDashboard">
      <Sidebar />
      <RouterView />
    </template>

    <!-- Halaman website lainnya menggunakan navbar -->
    <template v-else>
      <Navbar />
      <RouterView />
    </template>
  </div>
</template>
