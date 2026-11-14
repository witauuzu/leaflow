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
  <main class="flex min-h-dvh items-center justify-center">
    <section class="w-full max-w-md">
      <RouterLink to="/" class=" flex justify-center text-xl font-bold text-primary-deep w-full">
        <img src="../../assets/images/brand/logo.png" alt="Leaflow" width="100px" />
      </RouterLink>
      <h1 class="mt-5 text-2xl font-semibold text-ink text-center">
        Forgot your password?
      </h1>

      <p class="mt-3 text-sm leading-6 text-muted text-center">
        No worries! Enter the email address associated with your account
        and we'll send you a password reset link.
      </p>

      <form @submit.prevent="handleSubmit" class="mt-7 space-y-4">
        <div>
          <input
            id="email"
            v-model="email"
            type="email"
            autocomplete="email"
            placeholder="you@example.com"
            required
            class="sign-input"
          />
        </div>

        <p
          v-if="message"
          role="status"
          class="text-sm leading-6"
            :class="success ? 'text-primary-deep' : 'text-danger'"
        >
          {{ message }}
        </p>

          <button
            type="submit"
            :disabled="loading"
            class="mt-3 w-full rounded-full bg-primary-deep py-3 text-sm font-normal text-white transition hover:bg-ink disabled:opacity-60"
          >
            {{ loading ? 'Send link...' : 'Send Reset Link' }}
          </button>
      </form>

      <RouterLink
        to="/login"
        class="mt-5 block text-center text-sm font-normal text-primary hover:underline"
      >
        Back to Login
      </RouterLink>
    </section>
  </main>
</template>
