
<script setup>
import { ref } from 'vue'
import { RouterLink } from 'vue-router'

const email = ref('')
const loading = ref(false)
const message = ref('')
const success = ref(false)

const handleSubmit = async () => {
  loading.value = true
  message.value = ''
  success.value = false

  try {
    const response = await fetch(
      'http://localhost:5000/api/auth/forgot-password',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.value.trim() }),
      }
    )

    const data = await response.json()

    if (!response.ok) {
      message.value = data.message || 'Unable to process your request.'
      return
    }

    success.value = true
    message.value =
      'If an account exists for this email, you will receive a password reset link shortly.'
  } catch {
    message.value = 'Unable to connect to the server. Please try again.'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <main class="flex min-h-dvh items-center justify-center bg-[#F7FAF6] px-5 py-8">
    <section class="w-full max-w-md rounded-3xl border border-gray-100 bg-white p-8 shadow-sm sm:p-10">
      <RouterLink to="/login" class="text-xl font-bold text-[#388E3C]">
        leaflow
      </RouterLink>

      <div class="mt-8 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#E8F5E9] text-2xl">
        ✉
      </div>

      <h1 class="mt-6 text-2xl font-semibold text-gray-900">
        Forgot your password?
      </h1>

      <p class="mt-3 text-sm leading-6 text-gray-500">
        No worries! Enter the email address associated with your account
        and we'll send you a password reset link.
      </p>

      <form @submit.prevent="handleSubmit" class="mt-7 space-y-4">
        <div>
          <label for="email" class="mb-2 block text-sm font-medium text-gray-700">
            Email address
          </label>

          <input
            id="email"
            v-model="email"
            type="email"
            autocomplete="email"
            placeholder="you@example.com"
            required
            class="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-[#66BB6A] focus:ring-2 focus:ring-[#66BB6A]/20"
          />
        </div>

        <p
          v-if="message"
          role="status"
          class="text-sm leading-6"
          :class="success ? 'text-[#388E3C]' : 'text-red-600'"
        >
          {{ message }}
        </p>

        <button
          type="submit"
          :disabled="loading"
          class="w-full rounded-xl bg-[#66BB6A] py-3.5 font-semibold text-white hover:bg-[#4CAF50] disabled:opacity-60"
        >
          {{ loading ? 'Sending...' : 'Send Reset Link' }}
        </button>
      </form>

      <RouterLink
        to="/login"
        class="mt-6 block text-center text-sm font-medium text-[#388E3C] hover:underline"
      >
        Back to Login
      </RouterLink>
    </section>
  </main>
</template>
