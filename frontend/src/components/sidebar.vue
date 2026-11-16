<script setup>
import { ref, watch } from 'vue'
import { useRoute, RouterLink } from 'vue-router'
import logo from '../assets/images/brand/logo.png'

// Light Icons (Inactive)
import HomeLight from '../assets/icons/Light/Home.svg'
import ExploreLight from '../assets/icons/Light/Explore.svg'
import PlannerLight from '../assets/icons/Light/Planner.svg'
import CalenderLight from '../assets/icons/Light/Calender.svg'
import TrackLight from '../assets/icons/Light/Track.svg'
import ProfileLight from '../assets/icons/Light/Profile.svg'
// Bold Icons (Active)
import HomeBold from '../assets/icons/Bold/Home.svg'
import ExploreBold from '../assets/icons/Bold/Explore.svg'
import PlannerBold from '../assets/icons/Bold/Planner.svg'
import CalenderBold from '../assets/icons/Bold/Calender.svg'
import TrackBold from '../assets/icons/Bold/Track.svg'
import ProfileBold from '../assets/icons/Bold/Profile.svg'

const open = defineModel('open', { type: Boolean, default: false })
const collapsed = ref(false)
const route = useRoute()
const menus = [
  { name: 'Dashboard', to: '/dashboard', light: HomeLight, bold: HomeBold },
  { name: 'Explore', to: '/dashboard/explore', light: ExploreLight, bold: ExploreBold },
  { name: 'Planner', to: '/dashboard/planner', light: PlannerLight, bold: PlannerBold },
  { name: 'Calender', to: '/dashboard/calendar', light: CalenderLight, bold: CalenderBold },
  { name: 'Track', to: '/dashboard/track', light: TrackLight, bold: TrackBold },
  { name: 'Profile', to: '/dashboard/profile', light: ProfileLight, bold: ProfileBold },
]

const isActive = (path) => {
  return route.path === path
}

// Tombol di header: desktop = collapse, mobile = tutup drawer
const onToggle = () => {
  if (window.matchMedia('(min-width: 1024px)').matches) {
    collapsed.value = !collapsed.value
  } else {
    open.value = false
  }
}
watch(
  () => route.path,
  () => {
    open.value = false
  },
)
</script>

<template>
  <!-- Tombol buka menu (hanya mobile/tablet) -->
  <button
    v-if="!open"
    type="button"
    aria-label="Buka menu"
    class="fixed left-4 top-4 z-30 flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 shadow-sm lg:hidden"
    @click="open = true"
  >
    <svg
      viewBox="0 0 24 24"
      class="h-5 w-5"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
    >
      <line x1="4" x2="20" y1="6" y2="6" />
      <line x1="4" x2="20" y1="12" y2="12" />
      <line x1="4" x2="20" y1="18" y2="18" />
    </svg>
  </button>

  <!-- Overlay (mobile) -->
  <div
    v-if="open"
    class="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-[1px] lg:hidden"
    @click="open = false"
  />

  <aside
    class="fixed inset-y-0 left-0 z-50 flex h-dvh w-[260px] max-w-[85vw] flex-col px-4 py-5 text-white transition-all duration-300 lg:sticky lg:top-0 lg:z-auto lg:max-w-none lg:shrink-0 lg:translate-x-0"
    :class="[
      open ? 'translate-x-0' : '-translate-x-full',
      collapsed ? 'lg:w-[88px] lg:px-3' : 'lg:w-[260px]',
    ]"
    style="background: var(--sidebar-gradient)"
  >
    <!-- Header: logo + nama + tombol collapse -->
    <div
      class="flex items-center justify-between gap-2"
      :class="collapsed ? 'lg:flex-col lg:gap-3' : ''"
    >
      <RouterLink to="/" class="flex items-center gap-3 overflow-hidden">
        <img :src="logo" alt="Leaflow" class="h-9 w-9 shrink-0 object-contain" />
        <span
          class="text-xl font-bold tracking-wide"
          :class="collapsed ? 'lg:hidden' : ''"
        >
          Leaflow
        </span>
      </RouterLink>
      <button
        type="button"
        :aria-label="collapsed ? 'Perluas sidebar' : 'Ciutkan sidebar'"
        class="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-white/25 text-white/80 transition hover:bg-white/10"
        @click="onToggle"
      >
        <svg
          viewBox="0 0 24 24"
          class="h-[18px] w-[18px] transition-transform duration-300"
          :class="collapsed ? 'lg:rotate-180' : ''"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <rect width="18" height="18" x="3" y="3" rx="2" />
          <path d="M9 3v18" />
          <path d="m16 15-3-3 3-3" />
        </svg>
      </button>
    </div>
    <hr class="my-4 border-white/20" />
    <!-- Menu -->
    <nav 
    class="flex flex-col gap-2 overflow-y-auto"
    :class="collapsed ? 'lg:items-center' : ''"
    >
      <RouterLink
        v-for="menu in menus"
        :key="menu.name"
        :to="menu.to"
        :aria-label="menu.name"
        :aria-current="isActive(menu.to) ? 'page' : undefined"
        :title="menu.name"
        class="flex h-[48px] items-center gap-3 rounded-xl border px-3 text-sm font-medium transition-all duration-200"
        :class="[
          isActive(menu.to)
            ? 'shadow-sm backdrop-blur-md'
            : 'border-transparent hover:bg-white/10',
          collapsed ?'lg:h-[45px] lg:w-[45px] lg:justify-center lg:px-0' : '',
        ]"
        :style="
          isActive(menu.to)
            ? {
                backgroundColor: 'var(--sidebar-active-bg)',
                borderColor: 'var(--sidebar-active-border)',
              }
            : {}
        "
      >
        <img
          :src="isActive(menu.to) ? menu.bold : menu.light"
          :alt="menu.name"
          class="h-5 w-5 shrink-0 object-contain"
        />
        <span class="truncate" :class="collapsed ? 'lg:hidden' : ''">
          {{ menu.name }}
        </span>
      </RouterLink>
    </nav>

    <!-- Disclaimer (mode lebar) -->
    <div
      class="mt-auto rounded-2xl border border-white/20 bg-white/10 p-4 backdrop-blur-md"
      :class="collapsed ? 'lg:hidden' : ''"
    >
      <div class="flex items-center gap-2">
        <svg
          viewBox="0 0 24 24"
          class="h-4 w-4 shrink-0"
          fill="currentColor"
        >
          <path d="M12 2l2.4 6.6L21 11l-6.6 2.4L12 20l-2.4-6.6L3 11l6.6-2.4L12 2z" />
        </svg>
        <h3 class="text-sm font-semibold text-white">Disclaimer</h3>
      </div>
      <p class="mt-2 text-[13px] leading-relaxed text-white/80">
        Fitur Planner didukung oleh Gemini AI API
      </p>
    </div>

    <!-- Disclaimer (hanya ikon) -->
    <div
      class="mt-auto hidden justify-center"
      :class="collapsed ? 'lg:flex' : ''"
      title="Disclaimer: Planner dibuat menggunakan Gemini AI API"
    >
      <div
        class="flex h-10 w-10 items-center justify-center rounded-xl border border-white/20 bg-white/10"
      >
        <svg
          viewBox="0 0 24 24"
          class="h-4 w-4"
          fill="currentColor"
        >
          <path d="M12 2l2.4 6.6L21 11l-6.6 2.4L12 20l-2.4-6.6L3 11l6.6-2.4L12 2z" />
        </svg>
      </div>
    </div>
  </aside>
</template>