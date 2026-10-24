
<script setup>
import { computed } from 'vue'
import { useRoute, RouterLink } from 'vue-router'

const route = useRoute()

const email = computed(() =>
  typeof route.query.email === 'string'
    ? route.query.email
    : ''
)
</script>

<template>
  <main
    class="flex min-h-screen items-center justify-center bg-[#F7FAF6] px-5 py-10"
  >
    <section
      class="w-full max-w-lg rounded-3xl border border-gray-100 bg-white p-8 text-center shadow-sm sm:p-12"
    >
      <div
        class="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-[#E8F5E9]"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="36"
          height="36"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#388E3C"
          stroke-width="1.8"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <rect x="3" y="5" width="18" height="14" rx="2" />
          <path d="m3 7 9 6 9-6" />
        </svg>
      </div>

      <h1 class="mt-7 text-2xl font-semibold text-gray-900 sm:text-3xl">
        Check your email
      </h1>

      <p class="mt-4 leading-7 text-gray-500">
        Thank you for joining Leaflow! We have sent a verification link to
        <strong class="break-all text-gray-800">{{ email }}</strong>.
      </p>

      <p class="mt-3 text-sm leading-6 text-gray-500">
        Please open your inbox and click the link to verify your email address.
        Don't forget to check your spam folder.
      </p>

      <RouterLink
        to="/login"
        class="mt-8 inline-flex w-full items-center justify-center rounded-xl bg-[#66BB6A] px-5 py-3.5 font-semibold text-white transition hover:bg-[#4CAF50]"
      >
        Continue to Login
      </RouterLink>

      <RouterLink
        to="/signup"
        class="mt-5 inline-block text-sm font-medium text-[#388E3C] hover:underline"
      >
        Back to Sign Up
      </RouterLink>
    </section>
  </main>
</template>
