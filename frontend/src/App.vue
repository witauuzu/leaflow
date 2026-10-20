<script setup>
import { ref, onMounted } from 'vue'

const pesanBackend = ref('Sedang mengambil data...')

onMounted(async () => {
  try {
    // Memanggil API backend yang berjalan di port 5000
    const res = await fetch('http://localhost:5000/')
    const data = await res.text()
    pesanBackend.value = data
  } catch (error) {
    pesanBackend.value = 'Gagal terhubung ke backend!'
  }
})
</script>

<template>
  <div class="p-8 text-center">
    <h1 class="text-2xl font-bold text-green-600 mb-4">Leaflow Nutrition Tracker</h1>
    <p class="p-4 bg-gray-100 rounded-lg inline-block border">
      Status Backend: <span class="font-semibold">{{ pesanBackend }}</span>
    </p>
  </div>
</template>