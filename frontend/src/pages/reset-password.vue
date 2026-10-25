<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import { supabase } from '../lib/supabase'

const router = useRouter()

const password = ref('')
const confirmPassword = ref('')
const loading = ref(false)
const checkingSession = ref(true)
const recoveryReady = ref(false)
const message = ref('')
const success = ref(false)

let authListener

const passwordValid = computed(() =>
  password.value.length >= 8 &&
  /[a-z]/.test(password.value) &&
  /[A-Z]/.test(password.value) &&
  /\d/.test(password.value) &&
  /[^A-Za-z0-9\s]/.test(password.value)
)

onMounted(async () => {
  const { data } = supabase.auth.onAuthStateChange((event, session) => {
    if (event === 'PASSWORD_RECOVERY' && session) {
      recoveryReady.value = true
      checkingSession.value = false
    }
  })

  authListener = data.subscription

  const { data: sessionData } = await supabase.auth.getSession()

  if (sessionData.session) {
    recoveryReady.value = true
  }

  checkingSession.value = false
})

onUnmounted(() => {
  authListener?.unsubscribe()
})

const handleReset = async () => {
  message.value = ''
  success.value = false

  if (!recoveryReady.value) {
    message.value =
      'Your reset link may be invalid or expired. Please request a new one.'
    return
  }

  if (!passwordValid.value) {
    message.value = 'Please meet all password requirements.'
    return
  }

  if (password.value !== confirmPassword.value) {
    message.value = 'Passwords do not match.'
    return
  }

  loading.value = true

  try {
    const { error } = await supabase.auth.updateUser({
      password: password.value,
    })

    if (error) {
      message.value =
        'Unable to update your password. Please request a new reset link.'
      return
    }

    success.value = true
    message.value = 'Your password has been updated successfully.'

    await supabase.auth.signOut()
  } catch {
    message.value = 'Something went wrong. Please try again.'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <main class="flex min-h-dvh items-center justify-center bg-[#F7FAF6] px-5 py-8">
    <section class="w-full max-w-md rounded-3xl border border-gray-100 bg-white p-8 shadow-sm sm:p-10">
      <RouterLink to="/" class=" flex justify-center text-xl font-bold text-[#388E3C] w-full">
        <img src="../assets/logo.png" alt="Leaflow" width="100px" text>
      </RouterLink>

      <h1 class="mt-8 text-2xl font-semibold text-gray-900 text-center">
        Create a new password
      </h1>

      <p class="mt-3 text-sm leading-6 text-gray-500 text-center">
        Choose a strong password to secure your account
      </p>

      <p v-if="checkingSession" class="mt-6 text-sm text-gray-500" role="status">
        Verifying your reset link...
      </p>

      <template v-else-if="!success">
        <form @submit.prevent="handleReset" class="mt-7 space-y-5">
          <div>
            <label for="new-password" class="mb-2 block text-sm font-medium text-gray-700">
              New password
            </label>
            <input
              id="new-password"
              v-model="password"
              type="password"
              autocomplete="new-password"
              required
              class="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-[#66BB6A] focus:ring-2 focus:ring-[#66BB6A]/20"
            />
          </div>

          <ul class="space-y-2 text-xs">
            <li
              v-for="rule in [
                { label: 'At least 8 characters', valid: password.length >= 8 },
                { label: 'One uppercase letter', valid: /[A-Z]/.test(password) },
                { label: 'One lowercase letter', valid: /[a-z]/.test(password) },
                { label: 'One number', valid: /\\d/.test(password) },
                { label: 'One special character', valid: /[^A-Za-z0-9\\s]/.test(password) },
              ]"
              :key="rule.label"
              :class="rule.valid ? 'text-[#388E3C]' : 'text-gray-400'"
            >
              {{ rule.valid ? '✓' : '○' }} {{ rule.label }}
            </li>
          </ul>

          <div>
            <label for="confirm-password" class="mb-2 block text-sm font-medium text-gray-700">
              Confirm new password
            </label>
            <input
              id="confirm-password"
              v-model="confirmPassword"
              type="password"
              autocomplete="new-password"
              required
              class="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-[#66BB6A] focus:ring-2 focus:ring-[#66BB6A]/20"
            />
          </div>

          <p v-if="message" role="alert" class="text-sm text-red-600">
            {{ message }}
          </p>

          <button
            type="submit"
            :disabled="loading || !recoveryReady"
            class="w-full rounded-xl bg-[#66BB6A] py-3.5 font-semibold text-white hover:bg-[#4CAF50] disabled:opacity-60"
          >
            {{ loading ? 'Updating...' : 'Update Password' }}
          </button>
        </form>
      </template>

      <div v-if="success" class="mt-6">
        <p role="status" class="text-sm leading-6 text-[#388E3C]">
          {{ message }}
        </p>
        <RouterLink
          to="/login"
          class="mt-5 block rounded-xl bg-[#66BB6A] py-3.5 text-center font-semibold text-white hover:bg-[#4CAF50]"
        >
          Back to Login
        </RouterLink>
      </div>

      <p v-if="!checkingSession && !recoveryReady && !success" class="mt-5 text-sm text-gray-500">
        <RouterLink to="/forgot-password" class="font-medium text-[#388E3C] hover:underline">
          Request a new reset link
        </RouterLink>
      </p>
    </section>
  </main>
</template>
