<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter, RouterLink } from 'vue-router'
import { Eye, EyeOff, ArrowLeft, CheckCircle2, AlertCircle, Info, AlertTriangle,
} from 'lucide-vue-next'
import loginImage from '../assets/login.png'

const route = useRoute()
const router = useRouter()

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

// Check email verification redirect
onMounted(() => {
  if (route.query.verified === 'true') {
    messageType.value = 'success'
    message.value = 'Email verified successfully. You can now log in.'
  }

  if (typeof route.query.email === 'string') {
    email.value = route.query.email
  }
})

// Login
const handleLogin = async () => {
  message.value = ''
  messageType.value = 'error'
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
      // Differentiate login errors based on backend response
      if (data.code === 'EMAIL_NOT_REGISTERED') {
        messageType.value = 'warning'
        message.value =
          'No account found with this email. Please sign up first.'
      } else if (data.code === 'INVALID_PASSWORD') {
        messageType.value = 'error'
        message.value = 'Incorrect password. Please try again.'
      } else if (data.code === 'EMAIL_NOT_VERIFIED') {
        messageType.value = 'info'
        message.value =
          'Please verify your email address before logging in.'
      } else {
        messageType.value = 'error'
        message.value = data.message || 'Login failed. Please try again.'
      }
      return
    }

    // Save session
    if (data.session) {
      localStorage.setItem(
        'leaflow-session',
        JSON.stringify(data.session)
      )
    }

    await router.push('/dashboard')
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
    <!-- IMAGE SECTION -->
    <section
      class="relative hidden min-h-screen items-end justify-center overflow-hidden bg-(--color-primary) md:flex md:w-[50%]"
    >
      <img
        :src="loginImage"
        alt="Healthy lifestyle"
        class="h-auto w-[75%] object-contain"
      />
    </section>

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

        <h1 class="mb-6 text-center text-2xl font-semibold leading-tight text-[#263D2A]">
          Welcome Back
        </h1>

        <form @submit.prevent="handleLogin" class="space-y-5">
          <div>
            <input
              id="login-email"
              v-model="email"
              type="email"
              autocomplete="email"
              required
              placeholder="Enter your email"
              class="sign-input"
            />
          </div>

          <div>
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
                class="absolute inset-y-0 right-3 text-xs font-medium text-[#a7a7a7]"
              >
                <Eye v-if="!showPassword" :size="20" :stroke-width="1.7" />
                <EyeOff v-else :size="20" :stroke-width="1.7" />
              </button>
            </div>
          </div>

          <div class="flex justify-end">
            <RouterLink
              to="/forgot-password"
              class="text-sm font-regular text-(--color-primary) hover:underline"
            >
              Forgot password?
            </RouterLink>
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

          <button
            type="submit"
            :disabled="loading"
            class="mt-3 w-full rounded-lg bg-(--color-primary) py-3 text-sm font-regular text-white transition hover:bg-[#4CAF50] disabled:opacity-60"
          >
            {{ loading ? 'Log in...' : 'Log in' }}
          </button>
        </form>

        <p class="mt-3 text-center text-xs text-[#a7a7a7]">
          Don't have an account?
          <RouterLink to="/register" class="font-medium text-(--color-primary) hover:underline">
            Sign up
          </RouterLink>
        </p>
      </div>
    </section>
  </main>
</template>
