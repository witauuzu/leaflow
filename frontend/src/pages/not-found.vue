<script setup>
import { useRouter } from 'vue-router'
import { Home, ArrowLeft } from 'lucide-vue-next'

const router = useRouter()

const goHome = () => {
  router.push('/')
}

const goBack = () => {
  router.back()
}
</script>

<template>
  <main class="flex min-h-screen items-center justify-center bg-white px-5">
    <div class="w-full max-w-lg text-center">
      <h1 class="text-8xl font-bold tracking-tight text-[#66BB6A]">
        404
      </h1>

      <h2 class="mt-5 text-2xl font-semibold text-[#063B00]">
        Page Not Found
      </h2>

      <p class="mt-3 text-sm leading-relaxed text-gray-500">
        Sorry, the page you are looking for doesn't exist or may have been moved.
      </p>

      <div class="mt-8 flex flex-wrap justify-center gap-3">
        <button
          @click="goBack"
          class="flex items-center gap-2 rounded-lg border border-gray-200 px-5 py-3 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
        >
          <ArrowLeft :size="17" />
          Go Back
        </button>

        <button
          @click="goHome"
          class="flex items-center gap-2 rounded-lg bg-[#66BB6A] px-5 py-3 text-sm font-medium text-white transition hover:bg-[#4CAF50]"
        >
          <Home :size="17" />
          Back to Home
        </button>
      </div>
    </div>
  </main>
</template>