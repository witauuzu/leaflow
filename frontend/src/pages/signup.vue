<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import signupImage from '../assets/signup.png'

const router = useRouter()

const username = ref('')
const email = ref('')
const password = ref('')
const showPassword = ref(false)
const message = ref('')
const messageType = ref('error')
const loading = ref(false)

const passwordRules = computed(() => [
  {
    label: 'Minimum 8 characters',
    valid: password.value.length >= 8,
  },
  {
    label: 'One special character',
    valid: /[^A-Za-z0-9\s]/.test(password.value),
  },
  {
    label: 'One number',
    valid: /\d/.test(password.value),
  },
  {
    label: 'One uppercase character',
    valid: /[A-Z]/.test(password.value),
  },
  {
    label: 'One lowercase character',
    valid: /[a-z]/.test(password.value),
  },
])

const passwordValid = computed(() =>
  passwordRules.value.every(rule => rule.valid)
)

const handleRegister = async () => {
  message.value = ''

  if (!passwordValid.value) {
    message.value = 'Silakan penuhi semua persyaratan password.'
    messageType.value = 'error'
    return
  }

  loading.value = true

  try {
    const response = await fetch(
      'http://localhost:5000/api/auth/register',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: username.value.trim(),
          email: email.value.trim(),
          password: password.value,
        }),
      }
    )

    const data = await response.json()

    if (!response.ok) {
      message.value = data.message || 'Registrasi gagal.'
      messageType.value = 'error'
      return
    }

    await router.push({
      name: 'verify-email',
      query: { email: email.value.trim() },
    })
  } catch (error) {
    message.value = 'Gagal terhubung ke server. Silakan coba lagi.'
    messageType.value = 'error'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <main class="flex min-h-screen w-full flex-col md:flex-row">
    <!-- Bagian form: 40% -->
    <section
      class="flex w-full items-center justify-center bg-white px-6 py-10 sm:px-10 md:w-[45%] md:px-8 lg:px-12"
    >
      <div class="w-full max-w-md">
        <h1 class="text-3xl font-semibold leading-tight text-gray-900 sm:text-4xl">
          Let's Start Your Journey
        </h1>

        <p class="mt-3 text-sm leading-6 text-gray-500 sm:text-base">
          Join now to build your balanced life
        </p>

        <form @submit.prevent="handleRegister" class="mt-8 space-y-5">
          <div>
            <label
              for="username"
              class="mb-2 block text-sm font-medium text-gray-700"
            >
              Username
            </label>

            <input
              id="username"
              v-model="username"
              type="text"
              autocomplete="username"
              maxlength="30"
              required
              placeholder="Enter your username"
              class="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none transition focus:border-[#66BB6A] focus:ring-2 focus:ring-[#66BB6A]/20"
            />
          </div>

          <div>
            <label
              for="email"
              class="mb-2 block text-sm font-medium text-gray-700"
            >
              Email
            </label>

            <input
              id="email"
              v-model="email"
              type="email"
              autocomplete="email"
              required
              placeholder="Enter your email"
              class="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none transition focus:border-[#66BB6A] focus:ring-2 focus:ring-[#66BB6A]/20"
            />
          </div>

          <div>
            <label
              for="password"
              class="mb-2 block text-sm font-medium text-gray-700"
            >
              Password
            </label>

            <div class="relative">
              <input
                id="password"
                v-model="password"
                :type="showPassword ? 'text' : 'password'"
                autocomplete="new-password"
                required
                placeholder="Create a strong password"
                class="w-full rounded-xl border border-gray-200 px-4 py-3 pr-16 text-sm outline-none transition focus:border-[#66BB6A] focus:ring-2 focus:ring-[#66BB6A]/20"
              />

              <button
                type="button"
                @click="showPassword = !showPassword"
                class="absolute inset-y-0 right-3 text-xs font-medium text-gray-500 hover:text-[#388E3C]"
              >
                {{ showPassword ? 'Hide' : 'Show' }}
              </button>
            </div>

            <ul class="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
              <li
                v-for="rule in passwordRules"
                :key="rule.label"
                class="flex items-center gap-2 text-xs"
                :class="rule.valid ? 'text-[#388E3C]' : 'text-gray-400'"
              >
                <span>{{ rule.valid ? '✓' : '○' }}</span>
                {{ rule.label }}
              </li>
            </ul>
          </div>

          <p
            v-if="message"
            role="alert"
            class="text-sm"
            :class="messageType === 'error' ? 'text-red-600' : 'text-green-700'"
          >
            {{ message }}
          </p>

          <button
            type="submit"
            :disabled="loading"
            class="w-full rounded-xl bg-[#66BB6A] py-3.5 font-semibold text-white transition hover:bg-[#4CAF50] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {{ loading ? 'Creating account...' : 'Create Account' }}
          </button>
        </form>

        <p class="mt-7 text-center text-sm text-gray-500">
          Already have an account?
          <RouterLink
            to="/login"
            class="font-semibold text-[#388E3C] hover:underline"
          >
            Log in
          </RouterLink>
        </p>
      </div>
    </section>

    <!-- Bagian gambar: 60% -->
    <section
      class="relative hidden min-h-screen overflow-hidden bg-[#EAF4E8] md:block md:w-[55%]"
    >
      <img
        :src="signupImage"
        alt="Healthy lifestyle"
        class="absolute inset-0 h-full w-full object-cover"
      />

      <div
        class="absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-transparent"
      />

      <div class="absolute bottom-12 left-10 right-10 text-white lg:bottom-16 lg:left-14">
        <p class="text-sm font-medium uppercase tracking-[0.2em]">
          A healthier everyday
        </p>

        <h2 class="mt-3 max-w-lg text-3xl font-semibold leading-snug lg:text-4xl">
          Small steps today, a better balance tomorrow.
        </h2>
      </div>
    </section>
  </main>
</template>
