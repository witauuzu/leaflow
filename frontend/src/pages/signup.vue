<script setup>
import { ref } from 'vue'

const email = ref('')
const password = ref('')
const message = ref('')

const handleRegister = async () => {
  message.value = 'Sedang memproses...'
  try {
    const res = await fetch('http://localhost:5000/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: email.value, password: password.value })
    })
    const data = await res.json()
    
    if (res.ok) {
      message.value = 'Registrasi berhasil! Silakan login.'
    } else {
      message.value = data.message || 'Registrasi gagal'
    }
  } catch (err) {
    message.value = 'Gagal terhubung ke server'
  }
}
</script>

<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50 p-4">
    <div class="max-w-md w-full bg-white p-8 rounded-xl shadow-md border border-gray-100">
      <h2 class="text-2xl font-bold text-center text-green-600 mb-6">Daftar Akun Leaflow</h2>
      
      <form @submit.prevent="handleRegister" class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700">Email</label>
          <input v-model="email" type="email" required class="mt-1 w-full p-2 border rounded-lg focus:ring-2 focus:ring-green-500 outline-none" />
        </div>
        
        <div>
          <label class="block text-sm font-medium text-gray-700">Password</label>
          <input v-model="password" type="password" required class="mt-1 w-full p-2 border rounded-lg focus:ring-2 focus:ring-green-500 outline-none" />
        </div>

        <button type="submit" class="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-2 rounded-lg transition">
          Daftar
        </button>
      </form>

      <p v-if="message" class="mt-4 text-center text-sm font-semibold text-gray-600">{{ message }}</p>

      <p class="mt-6 text-center text-sm text-gray-500">
        Sudah punya akun? 
        <router-link to="/login" class="text-green-600 font-semibold hover:underline">Masuk di sini</router-link>
      </p>
    </div>
  </div>
</template>