<script setup>
import { ref, computed } from 'vue'
import { useRouter, RouterLink } from 'vue-router'
import { Eye, EyeOff, ArrowLeft, CheckCircle2, AlertCircle, Info, AlertTriangle } from 'lucide-vue-next'
import signupImage from '../../assets/signup.png'

const router = useRouter()

const username = ref('')
const email = ref('')
const password = ref('')
const showPassword = ref(false)
const loading = ref(false)
const message = ref('')
const messageType = ref('error')

// Alert styles
const messageStyle = computed(() => {
  const styles = {
    success: {
      container:
        'border-[var(--color-success)]/30 bg-[var(--color-success)]/10',
      icon: 'text-[var(--color-success)]',
      text: 'text-[var(--color-success)]',
      iconComponent: CheckCircle2,
    },
    info: {
      container:
        'border-[var(--color-info)]/30 bg-[var(--color-info)]/10',
      icon: 'text-[var(--color-info)]',
      text: 'text-[var(--color-info)]',
      iconComponent: Info,
    },
    warning: {
      container:
        'border-[var(--color-warning)]/30 bg-[var(--color-warning)]/10',
      icon: 'text-[var(--color-warning)]',
      text: 'text-[var(--color-warning)]',
      iconComponent: AlertTriangle,
    },
    error: {
      container:
        'border-[var(--color-danger)]/30 bg-[var(--color-danger)]/10',
      icon: 'text-[var(--color-danger)]',
      text: 'text-[var(--color-danger)]',
      iconComponent: AlertCircle,
    },
  }

  return styles[messageType.value]
})

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

// Register
const handleRegister = async () => {
  message.value = ''
  messageType.value = 'error'

  if (!username.value.trim()) {
    message.value = 'Please enter your username.'
    return
  }

  if (!passwordValid.value) {
    message.value = 'Please meet all password requirements.'
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
      messageType.value = 'error'
      message.value = data.message || 'Registration failed.'
      return
    }

    messageType.value = 'success'
    message.value = 'Please check and confirm your email.'
  } catch (error) {
    console.error(error)

    messageType.value = 'error'
    message.value = 'Unable to connect to the server. Please try again.'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <main class="flex min-h-screen w-full flex-col md:flex-row">
    <!-- FORM SECTION -->
    <section
      class="relative flex min-h-screen w-full flex-col bg-white px-6 py-8 sm:px-10 md:w-[50%] lg:px-12"
    >
      <!-- BACK BUTTON -->
      <div>
        <RouterLink
          to="/"
          class="inline-flex items-center gap-2 text-sm text-[#263D2A] transition hover:text-[#388E3C]"
        >
          <span
            class="flex h-7 w-7 items-center justify-center rounded-full border border-[#868889] hover:border-(--color-hover)"
          >
            <ArrowLeft :size="15" :stroke-width="1" />
          </span>
          Back
        </RouterLink>
      </div>

      <!-- FORM CONTENT -->
      <div class="my-auto mx-auto w-full max-w-md">

        <h1 class="mb-6 text-center text-2xl font-semibold leading-tight text-(--color-text)">
          Let's Start Your Journey
        </h1>

        <form @submit.prevent="handleRegister" class="space-y-4">

          <!-- USERNAME -->
          <div>
            <input
              id="username"
              v-model="username"
              type="text"
              autocomplete="username"
              maxlength="30"
              required
              placeholder="Enter your username"
              class="sign-input"
            />
          </div>

          <!-- EMAIL -->
          <div>
            <input
              id="email"
              v-model="email"
              type="email"
              autocomplete="email"
              required
              placeholder="Enter your email"
              class="sign-input"
            />
          </div>

          <!-- PASSWORD -->
          <div>
            <div class="relative">
              <input
                id="password"
                v-model="password"
                :type="showPassword ? 'text' : 'password'"
                autocomplete="new-password"
                required
                placeholder="Enter your password"
                class="sign-input"
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

            <!-- PASSWORD REQUIREMENTS -->
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
          </div>

          <!-- MESSAGE -->
          <div
            v-if="message"
            role="alert"
            class="flex items-start gap-3 rounded-lg border p-3"
            :class="messageStyle.container"
          >
            <component
              :is="messageStyle.iconComponent"
              :size="20"
              :stroke-width="1.8"
              class="mt-0.5 shrink-0"
              :class="messageStyle.icon"
            />

            <p
              class="text-xs leading-relaxed"
              :class="messageStyle.text"
            >
              {{ message }}
            </p>
          </div>

          <!-- SUBMIT BUTTON -->
          <button
            type="submit"
            :disabled="loading"
            class="mt-3 w-full rounded-lg bg-(--color-primary) py-3 text-sm font-regular text-white transition hover:bg-[#4CAF50] disabled:opacity-60"
          >
            {{ loading ? 'Creating account...' : 'Create Account' }}
          </button>

        </form>

        <!-- LOGIN LINK -->
        <p class="mt-3 text-center text-xs font-light text-[#a7a7a7]">
          Already have an account?
          <RouterLink
            to="/login"
            class="font-medium text-(--color-primary) hover:underline"
          >
            Log in
          </RouterLink>
        </p>

      </div>
    </section>

    <!-- IMAGE SECTION -->
    <section
      class="relative hidden min-h-screen items-end justify-center overflow-hidden bg-(--color-primary) md:flex md:w-[50%]"
    >
      <img
        :src="signupImage"
        alt="Healthy lifestyle"
        class="h-auto w-[80%] object-contain"
      />
    </section>

  </main>
</template>