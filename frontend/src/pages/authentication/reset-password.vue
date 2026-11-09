<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import { Eye, EyeOff } from 'lucide-vue-next'
import { supabase } from '../../lib/supabase'

const router = useRouter()

const password = ref('')
const showPassword = ref(false)
const loading = ref(false)
const checkingSession = ref(true)
const recoveryReady = ref(false)
const message = ref('')
const success = ref(false)

let authListener

// Password requirements
const passwordRules = computed(() => [
  { label: 'Minimum 8 characters', valid: password.value.length >= 8 },
  {
    label: 'One special character',
    valid: /[^A-Za-z0-9\s]/.test(password.value),
  },
  { label: 'One number', valid: /\d/.test(password.value) },
  { label: 'One uppercase character', valid: /[A-Z]/.test(password.value) },
  { label: 'One lowercase character', valid: /[a-z]/.test(password.value) },
])

const passwordValid = computed(() =>
  passwordRules.value.every((rule) => rule.valid)
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
  <main class="flex min-h-dvh items-center justify-center">
    <section class="w-full max-w-md">
      <RouterLink to="/" class=" flex justify-center text-xl font-bold text-[#388E3C] w-full">
        <img src="../assets/logo.png" alt="Leaflow" width="100px" text>
      </RouterLink>

      <h1 class="mt-5 text-2xl font-semibold text-gray-900 text-center">
        Create a new password
      </h1>

      <p class="mt-3 text-sm leading-6 text-gray-500 text-center">
        Choose a strong password to secure your account
      </p>

      <p v-if="checkingSession" class="mt-6 text-sm text-gray-500 text-center" role="status">
        Verifying your reset link...
      </p>

      <template v-else-if="!success">
        <form @submit.prevent="handleReset" class="mt-7 space-y-5">
          <div class="relative">
            <input
              id="new-password"
              v-model="password"
              :type="showPassword ? 'text' : 'password'"
              autocomplete="new-password"
              placeholder="Enter your new password"
              required
              class="sign-input pr-12"
            />
            <button
              type="button"
              @click="showPassword = !showPassword"
              class="absolute inset-y-0 right-3 flex items-center text-[#a7a7a7] transition"
              :aria-label="showPassword ? 'Hide password' : 'Show password'"
            >
              <Eye v-if="!showPassword" :size="20" :stroke-width="1.7" />
              <EyeOff v-else :size="20" :stroke-width="1.7" />
            </button>
          </div>

          <div class="mt-4 grid grid-cols-2 gap-x-4 gap-y-2">
            <p
              v-for="rule in passwordRules"
              :key="rule.label"
              class="flex items-center gap-2 text-xs font-extralight"
              :class="rule.valid ? 'text-[#388E3C]' : 'text-[#a7a7a7]'"
            >
              <span>{{ rule.valid ? '✓' : '○' }}</span>
              {{ rule.label }}
              </p>
          </div>

          <button
            type="submit"
            :disabled="loading"
            class="mt-3 w-full rounded-lg bg-(--color-primary) py-3 text-sm font-regular text-white transition hover:bg-[#4CAF50] disabled:opacity-60"
          >
            {{ loading ? 'Update password...' : 'Update Password' }}
          </button>
        </form>
      </template>

      <div v-if="success" class="mt-6 text-center">
        <p role="status" class="text-sm leading-6 text-[#388E3C]">
          {{ message }}
        </p>
        <RouterLink
          to="/login"
          class="mt-5 block rounded-lg bg-(--color-primary) py-3 text-center text-sm font-reguler text-white hover:bg-[#4CAF50]"
        >
          Back to Login
        </RouterLink>
      </div>

      <p v-if="!checkingSession && !recoveryReady && !success" class="mt-5 text-sm text-center text-gray-500">
        <RouterLink to="/forgot-password" class="font-medium text-[#388E3C] hover:underline">
          Request a new reset link
        </RouterLink>
      </p>
    </section>
  </main>
</template>