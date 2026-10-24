
<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter, RouterLink } from 'vue-router'

const route = useRoute()
const router = useRouter()

const email = ref('')
const password = ref('')
const showPassword = ref(false)
const loading = ref(false)
const message = ref('')

onMounted(() => {
  if (route.query.verified === 'true') {
    message.value = 'Email berhasil diverifikasi. Silakan login.'
  }

  if (typeof route.query.email === 'string') {
    email.value = route.query.email
  }
})

const handleLogin = async () => {
  message.value = ''
  loading.value = true

  try {
    const response = await fetch(
      'http://localhost:5000/api/auth/login',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email.value.trim(),
          password: password.value,
        }),
      }
    )

    const data = await response.json()

    if (!response.ok) {
      message.value = data.message || 'Login gagal.'
      return
    }

    // Demo awal: simpan sesi di penyimpanan browser.
    // Untuk aplikasi produksi, gunakan pengelolaan sesi
    // yang aman dan terintegrasi dengan Supabase Auth.
    if (data.session) {
      localStorage.setItem(
        'leaflow-session',
        JSON.stringify(data.session)
      )
    }

    await router.push('/')
  } catch {
    message.value = 'Gagal terhubung ke server. Silakan coba lagi.'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <main class="flex min-h-screen w-full flex-col md:flex-row">
    <section
      class="flex w-full items-center justify-center bg-white px-6 py-10 sm:px-10 md:w-[45%] lg:px-12"
    >
      <div class="w-full max-w-md">
        <h1 class="mt-10 text-3xl font-semibold text-gray-900 sm:text-4xl">
          Welcome Back
        </h1>

        <p class="mt-3 text-sm leading-6 text-gray-500 sm:text-base">
          Continue your healthy journey with Leaflow.
        </p>

        <form @submit.prevent="handleLogin" class="mt-8 space-y-5">
          <div>
            <label for="login-email" class="mb-2 block text-sm font-medium text-gray-700">
              Email
            </label>
            <input
              id="login-email"
              v-model="email"
              type="email"
              autocomplete="username"
              required
              placeholder="Enter your email"
              class="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-[#66BB6A] focus:ring-2 focus:ring-[#66BB6A]/20"
            />
          </div>

          <div>
            <label for="login-password" class="mb-2 block text-sm font-medium text-gray-700">
              Password
            </label>

            <div class="relative">
              <input
                id="login-password"
                v-model="password"
                :type="showPassword ? 'text' : 'password'"
                autocomplete="current-password"
                required
                placeholder="Enter your password"
                class="w-full rounded-xl border border-gray-200 px-4 py-3 pr-16 text-sm outline-none focus:border-[#66BB6A] focus:ring-2 focus:ring-[#66BB6A]/20"
              />

              <button
                type="button"
                @click="showPassword = !showPassword"
                class="absolute inset-y-0 right-3 text-xs font-medium text-gray-500"
              >
                {{ showPassword ? 'Hide' : 'Show' }}
              </button>
            </div>
          </div>

          <p v-if="message" role="alert" class="text-sm text-red-600">
            {{ message }}
          </p>

          <button
            type="submit"
            :disabled="loading"
            class="w-full rounded-xl bg-[#66BB6A] py-3.5 font-semibold text-white transition hover:bg-[#4CAF50] disabled:opacity-60"
          >
            {{ loading ? 'Signing in...' : 'Log In' }}
          </button>
        </form>

        <p class="mt-7 text-center text-sm text-gray-500">
          Don't have an account?
          <RouterLink to="/register" class="font-semibold text-[#388E3C] hover:underline">
            Sign up
          </RouterLink>
        </p>
      </div>
    </section>

    <section class="relative hidden min-h-screen overflow-hidden bg-[#EAF4E8] md:block md:w-[55%]">
      <img
        src="../assets/login.png"
        alt="Healthy lifestyle"
        class="absolute inset-0 h-full w-full object-cover"
      />

      <div class="absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-transparent" />

      <div class="absolute bottom-12 left-10 right-10 text-white lg:bottom-16 lg:left-14">
        <p class="text-sm font-medium uppercase tracking-[0.2em]">Welcome to Leaflow</p>
        <h2 class="mt-3 max-w-lg text-3xl font-semibold leading-snug lg:text-4xl">
          Find your balance, one day at a time.
        </h2>
      </div>
    </section>
  </main>
</template>
