<script setup>
import { ArrowUpRight } from 'lucide-vue-next'
import BrandLogo from './brand-logo.vue'

const explore = [
  { label: 'Features', to: '/features' },
  { label: 'Explore Meals', to: '/explore' },
  { label: 'AI Trial', to: '/trial' },
]

const account = [
  { label: 'Log in', to: '/login' },
  { label: 'Create account', to: '/register' },
]
</script>

<template>
  <footer class="relative mt-24 overflow-hidden bg-ink text-white/70">
    <div class="pointer-events-none absolute inset-0 texture-dots-light opacity-[0.18]" />
    <div class="pointer-events-none absolute -left-32 top-0 h-80 w-80 rounded-full bg-primary/20 blur-3xl" />
    <div class="pointer-events-none absolute -right-24 bottom-10 h-72 w-72 rounded-full bg-secondary/10 blur-3xl" />

    <div class="shell relative pt-16 pb-10">
      <div class="grid gap-12 md:grid-cols-[1.2fr_1fr] lg:gap-20">
        <div class="max-w-sm">
          <BrandLogo light />
          <p class="mt-5 text-sm leading-7 text-white/60">
            Make every meal better. Nutrition-first meal planning that respects your
            budget, your pantry, and your daily routine.
          </p>
          <RouterLink
            to="/trial"
            class="mt-6 inline-flex items-center gap-2 text-sm font-medium text-secondary transition hover:text-white"
          >
            Try the AI planner without an account
            <ArrowUpRight :size="16" />
          </RouterLink>
        </div>

        <div class="grid grid-cols-2 gap-8 sm:grid-cols-3">
          <div class="flex flex-col gap-3">
            <p class="text-xs font-semibold uppercase tracking-[0.18em] text-white">
              Explore
            </p>
            <RouterLink
              v-for="item in explore"
              :key="item.to"
              :to="item.to"
              class="text-sm transition hover:text-white"
            >
              {{ item.label }}
            </RouterLink>
          </div>
          <div class="flex flex-col gap-3">
            <p class="text-xs font-semibold uppercase tracking-[0.18em] text-white">
              Account
            </p>
            <RouterLink
              v-for="item in account"
              :key="item.to"
              :to="item.to"
              class="text-sm transition hover:text-white"
            >
              {{ item.label }}
            </RouterLink>
          </div>
          <div class="flex flex-col gap-3">
            <p class="text-xs font-semibold uppercase tracking-[0.18em] text-white">
              Support
            </p>
            <RouterLink to="/dashboard/profile" class="text-sm transition hover:text-white">
              Your profile
            </RouterLink>
            <a href="mailto:hello@leaflow.id" class="text-sm transition hover:text-white">
              hello@leaflow.id
            </a>
          </div>
        </div>
      </div>

      <div
        class="mt-14 select-none overflow-hidden border-t border-white/10 pt-8 leading-none"
        aria-hidden="true"
      >
        <div
          class="whitespace-nowrap text-[clamp(4rem,15vw,11rem)] font-semibold tracking-[-0.06em] text-white/90"
        >
          Leaf<span class="text-secondary">low</span>
        </div>
      </div>

      <div
        class="mt-6 flex flex-col gap-2 border-t border-white/10 pt-6 text-xs text-white/45 sm:flex-row sm:items-center sm:justify-between"
      >
        <span>&copy; 2026 Leaflow. Built for ISCOMFEST.</span>
        <span>Healthy meals, planned and affordable.</span>
      </div>
    </div>
  </footer>
</template>
