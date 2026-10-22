<script setup>
</script>

<template>
  <nav class="bg-white">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex items-center justify-between h-16">
        
        <!-- 1. Paling Kiri: Logo -->
        <div class="shrink-0 flex items-center">
          <router-link to="/" class="text-2xl font-bold text-green-600 flex items-center gap-2">
            <span>Leaflow</span>
          </router-link>
        </div>

        <!-- Bagian Kanan (Menu + Tombol Auth) -->
        <div class="flex items-center gap-10">
          
          <!-- 2. Align Kanan: 4 Menu Navigasi -->
          <div class="md:flex items-center gap-6">
            <router-link to="/" class="font-medium">
                Beranda
            </router-link>
            <router-link to="/features" class="font-medium">
                Features
            </router-link>
            <router-link to="/Explore" class="font-medium">
                Explore
            </router-link>
            <router-link to="/AITrial" class="font-medium">
                AI Trial
            </router-link>
          </div>

          <!-- 3. Paling Kanan: Tombol Login & Sign Up -->
          <div class="flex items-center gap-3">
            <router-link 
              to="/login" 
              class="px-4 py-2 text-sm font-medium text-green-600 border border-green-600 rounded-lg hover:bg-green-50 transition"
            >
              Login
            </router-link>
            <router-link 
              to="/register" 
              class="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 transition"
            >
              Sign Up
            </router-link>
          </div>

        </div>

      </div>
    </div>
  </nav>
</template>