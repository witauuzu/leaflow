<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import navbar from './components/navbar.vue'
import sidebar from './components/sidebar.vue' // Sesuaikan dengan lokasi navbar dashboard Anda

const route = useRoute()

const isDashboard = computed(() => route.path.startsWith('/dashboard'))
</script>

<template>
  <div>
    <!-- Navbar akan otomatis berubah tergantung halamannya -->
    <sidebar v-if="isDashboard" />
    <navbar v-else />

    <router-view></router-view>
  </div>
</template>