<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { Bell, CheckCheck, House, LogOut, UserRound } from 'lucide-vue-next'
import ExploreLight from '../assets/icons/Light/Explore.svg'
import ProfileBold from '../assets/icons/Bold/Profile.svg'
import { nutritionSummary } from '../lib/meal-data.js'

defineProps({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
})

const router = useRouter()

const searchQuery = ref('')
const profileImage = ref('')
const notificationsOpen = ref(false)
const profileOpen = ref(false)
const profileRef = ref(null)
const user = nutritionSummary

const notifications = ref([
  {
    id: 1,
    title: 'Lunch plan is ready',
    body: 'Your pecel rice bowl is scheduled for 12:15.',
    time: '2 min ago',
    unread: true,
    tone: 'bg-accent text-primary-deep',
  },
  {
    id: 2,
    title: 'You are under budget',
    body: 'Rp 16,000 left for today. Nice work.',
    time: '1 hour ago',
    unread: true,
    tone: 'bg-warning/10 text-warning',
  },
  {
    id: 3,
    title: 'Pantry item running low',
    body: 'Eggs are almost out. Add them to your list?',
    time: 'Yesterday',
    unread: false,
    tone: 'bg-info/10 text-info',
  },
])

const unreadCount = computed(() => notifications.value.filter((item) => item.unread).length)

const markAllRead = () => {
  notifications.value = notifications.value.map((item) => ({ ...item, unread: false }))
}

const toggleNotifications = () => {
  notificationsOpen.value = !notificationsOpen.value
  if (notificationsOpen.value) profileOpen.value = false
}

const toggleProfile = () => {
  profileOpen.value = !profileOpen.value
  if (profileOpen.value) notificationsOpen.value = false
}

const closeProfile = () => {
  profileOpen.value = false
}

const logout = () => {
  localStorage.removeItem('leaflow-session')
  sessionStorage.removeItem('leaflow-session')
  closeProfile()
  router.push('/')
}

const handleDocumentClick = (event) => {
  if (!profileRef.value?.contains(event.target)) closeProfile()
}

onMounted(() => document.addEventListener('click', handleDocumentClick))
onBeforeUnmount(() => document.removeEventListener('click', handleDocumentClick))
</script>

<template>
  <header class="flex flex-wrap items-start justify-between gap-4">
    <!-- Page Information -->
    <div class="min-w-0">
      <h1 class="text-2xl font-semibold tracking-[-0.03em] text-ink">
        {{ title }}
      </h1>

      <p class="mt-1 max-w-xl text-sm leading-6 text-muted">
        {{ description }}
      </p>
    </div>

    <!-- Search, notifications, profile -->
    <div class="flex shrink-0 items-center gap-3">
      <!-- Search Input -->
      <div
        class="hidden h-[45px] w-[280px] items-center gap-3 rounded-[10px] bg-accent px-4 lg:flex"
      >
        <img :src="ExploreLight" alt="" class="h-[19px] w-[19px] shrink-0 icon-header" />

        <input
          v-model="searchQuery"
          type="text"
          placeholder="Search meals, plans..."
          class="w-full bg-transparent text-sm text-ink outline-none"
        />
      </div>

      <!-- Notifications -->
      <div class="relative">
        <button
          type="button"
          aria-label="Notifications"
          :aria-expanded="notificationsOpen"
          class="relative grid h-[45px] w-[45px] place-items-center rounded-[10px] bg-accent text-ink transition hover:bg-accent"
          @click="toggleNotifications"
        >
          <Bell :size="19" />
          <span
            v-if="unreadCount"
            class="absolute right-2.5 top-2.5 grid h-4 min-w-4 place-items-center rounded-full bg-danger px-1 text-[9px] font-semibold leading-none text-white"
          >
            {{ unreadCount }}
          </span>
        </button>

        <Transition name="slide-up">
          <div
            v-if="notificationsOpen"
            class="absolute right-0 top-[calc(100%+0.6rem)] z-30 w-[320px] overflow-hidden rounded-[14px] border border-line bg-white shadow-[0_28px_60px_-30px_rgba(6,59,0,.45)]"
          >
            <div class="flex items-center justify-between border-b border-line px-4 py-3">
              <div>
                <p class="text-sm font-semibold text-ink">Notifications</p>
                <p class="text-[11px] text-muted">{{ unreadCount }} unread updates</p>
              </div>
              <button
                type="button"
                class="inline-flex items-center gap-1 text-[11px] font-medium text-primary-deep transition hover:text-ink"
                @click="markAllRead"
              >
                <CheckCheck :size="14" />
                Mark all read
              </button>
            </div>

            <div class="max-h-[300px] overflow-y-auto">
              <button
                v-for="item in notifications"
                :key="item.id"
                type="button"
                class="flex w-full items-start gap-3 border-b border-line px-4 py-3 text-left transition last:border-b-0 hover:bg-accent/40"
                @click="item.unread = false"
              >
                <span
                  class="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-lg text-xs font-semibold"
                  :class="item.tone"
                >
                  {{ item.title.charAt(0) }}
                </span>
                <span class="min-w-0 flex-1">
                  <span class="flex items-center gap-2">
                    <span class="truncate text-[12.5px] font-semibold text-ink">
                      {{ item.title }}
                    </span>
                    <span
                      v-if="item.unread"
                      class="h-1.5 w-1.5 shrink-0 rounded-full bg-primary"
                    />
                  </span>
                  <span class="mt-0.5 block text-[11.5px] leading-5 text-muted">
                    {{ item.body }}
                  </span>
                  <span class="mt-1 block text-[10px] text-muted/70">{{ item.time }}</span>
                </span>
              </button>
            </div>
          </div>
        </Transition>
      </div>

      <!-- Profile menu -->
      <div ref="profileRef" class="relative">
        <button
          type="button"
          aria-label="Open profile menu"
          aria-haspopup="menu"
          :aria-expanded="profileOpen"
          class="flex h-[45px] w-[45px] shrink-0 items-center justify-center overflow-hidden rounded-full bg-accent ring-2 ring-white transition hover:ring-primary/40"
          @click.stop="toggleProfile"
        >
          <img
            v-if="profileImage"
            :src="profileImage"
            alt="Profile"
            class="h-full w-full object-cover"
          />

          <img
            v-else
            :src="ProfileBold"
            alt=""
            class="h-[23px] w-[23px] icon-header"
          />
        </button>

        <Transition name="slide-up">
          <div
            v-if="profileOpen"
            class="absolute right-0 top-[calc(100%+0.65rem)] z-30 w-[252px] overflow-hidden rounded-[16px] border border-line bg-white p-2 shadow-[0_28px_60px_-30px_rgba(6,59,0,.45)]"
            role="menu"
          >
            <div class="flex items-center gap-3 rounded-[11px] bg-accent/70 p-3">
              <span
                class="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-primary text-[12px] font-semibold text-ink"
              >
                AR
              </span>
              <div class="min-w-0">
                <p class="truncate text-[12.5px] font-semibold text-ink">{{ user.name }}</p>
                <p class="truncate text-[10.5px] text-muted">{{ user.email }}</p>
              </div>
            </div>

            <div class="mt-1.5 space-y-0.5">
              <RouterLink
                to="/dashboard/profile"
                role="menuitem"
                class="flex items-center gap-2.5 rounded-[9px] px-3 py-2.5 text-[12px] font-medium text-ink-soft transition hover:bg-accent hover:text-ink"
                @click="closeProfile"
              >
                <UserRound :size="15" class="text-primary-deep" />
                Your profile
              </RouterLink>
              <RouterLink
                to="/"
                role="menuitem"
                class="flex items-center gap-2.5 rounded-[9px] px-3 py-2.5 text-[12px] font-medium text-ink-soft transition hover:bg-accent hover:text-ink"
                @click="closeProfile"
              >
                <House :size="15" class="text-primary-deep" />
                Back to landing page
              </RouterLink>
              <button
                type="button"
                role="menuitem"
                class="flex w-full items-center gap-2.5 rounded-[9px] px-3 py-2.5 text-left text-[12px] font-medium text-danger transition hover:bg-danger/10"
                @click="logout"
              >
                <LogOut :size="15" />
                Log out
              </button>
            </div>
          </div>
        </Transition>
      </div>
    </div>
  </header>
</template>

<style scoped>
.icon-header {
  filter: brightness(0) saturate(100%) invert(69%) sepia(15%) saturate(1125%)
    hue-rotate(72deg) brightness(94%) contrast(87%);
}
</style>
