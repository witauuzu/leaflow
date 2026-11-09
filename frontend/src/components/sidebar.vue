<script setup>
import { useRoute, RouterLink } from 'vue-router'

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

const route = useRoute()

const menus = [
  {
    name: 'Dashboard',
    to: '/dashboard',
    light: HomeLight,
    bold: HomeBold,
  },
  {
    name: 'Explore',
    to: '/dashboard/explore',
    light: ExploreLight,
    bold: ExploreBold,
  },
  {
    name: 'Planner',
    to: '/dashboard/planner',
    light: PlannerLight,
    bold: PlannerBold,
  },
  {
    name: 'Calender',
    to: '/dashboard/calendar',
    light: CalenderLight,
    bold: CalenderBold,
  },
  {
    name: 'Track',
    to: '/dashboard/track',
    light: TrackLight,
    bold: TrackBold,
  },
  {
    name: 'Profile',
    to: '/dashboard/profile',
    light: ProfileLight,
    bold: ProfileBold,
  },
]

const isActive = (path) => {
  return route.path === path
}
</script>

<template>
  <aside
    class="flex h-screen w-[6%] shrink-0 items-center justify-center"
    style="background: var(--sidebar-gradient)"
  >
    <nav class="flex flex-col items-center gap-2">
        <RouterLink
        v-for="menu in menus"
        :key="menu.name"
        :to="menu.to"
        :aria-label="menu.name"
        :title="menu.name"
        class="flex h-[45px] w-[45px] items-center justify-center rounded-xl border transition-all duration-200"
        :class="
            isActive(menu.to)
            ? 'shadow-sm backdrop-blur-md'
            : 'border-transparent hover:bg-white/10'
        "
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
          class="h-5 w-5 object-contain"
        />
      </RouterLink>
    </nav>
  </aside>
</template>