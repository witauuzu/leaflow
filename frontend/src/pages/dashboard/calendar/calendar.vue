<script setup>
import { ref, computed, onMounted  } from 'vue'
import { ChevronLeft, ChevronRight, Utensils } from 'lucide-vue-next'
import HeaderDashboard from '../../../components/header-dashboard.vue'

// Selected date
const selectedDate = ref(new Date())

// Currently displayed month
const currentMonth = ref(
  new Date(
    selectedDate.value.getFullYear(),
    selectedDate.value.getMonth(),
    1
  )
)

// Format date to YYYY-MM-DD
const formatDateKey = (date) => {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')

  return `${year}-${month}-${day}`
}

// Month and year label
const monthLabel = computed(() => {
  return currentMonth.value.toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  })
})

// Generate calendar days
const calendarDays = computed(() => {
  const year = currentMonth.value.getFullYear()
  const month = currentMonth.value.getMonth()

  const firstDay = new Date(year, month, 1).getDay()
  const totalDays = new Date(year, month + 1, 0).getDate()

  const totalCells = Math.ceil((firstDay + totalDays) / 7) * 7

  return Array.from({ length: totalCells }, (_, index) => {
    const dayNumber = index - firstDay + 1

    if (dayNumber < 1 || dayNumber > totalDays) {
      return {
        key: `empty-${index}`,
        date: null,
      }
    }

    const date = new Date(year, month, dayNumber)

    return {
      key: formatDateKey(date),
      date,
      day: dayNumber,
    }
  })
})

// Previous month
const previousMonth = () => {
  currentMonth.value = new Date(
    currentMonth.value.getFullYear(),
    currentMonth.value.getMonth() - 1,
    1
  )
}

// Next month
const nextMonth = () => {
  currentMonth.value = new Date(
    currentMonth.value.getFullYear(),
    currentMonth.value.getMonth() + 1,
    1
  )
}

// Select date
const selectDate = (date) => {
  if (!date) return
  selectedDate.value = date
}

// Check selected date
const isSelectedDate = (date) => {
  if (!date) return false

  return formatDateKey(date) === formatDateKey(selectedDate.value)
}

// Selected date label
const selectedDateLabel = computed(() => {
  return selectedDate.value.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })
})


// Calendar meal plans
const mealPlans = ref([])
const isLoadingCalendar = ref(false)

// Fetch meal plans from database
const fetchCalendarPlans = async () => {
  isLoadingCalendar.value = true

  try {
    const session = JSON.parse(
      localStorage.getItem('leaflow-session') || 'null'
    )

    if (!session?.access_token) {
      throw new Error('Your session has expired. Please log in again.')
    }

    const response = await fetch(
      'http://localhost:5000/api/planner/calendar',
      {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      }
    )

    const result = await response.json()

    if (!response.ok) {
      throw new Error(result.message || 'Failed to load calendar.')
    }

    mealPlans.value = result.data || []

    console.log('Calendar meal plans:', mealPlans.value)
  } catch (error) {
    console.error('Fetch calendar plans error:', error)
  } finally {
    isLoadingCalendar.value = false
  }
}

// Get dates that have meal plans
const plannedDates = computed(() => {
  const dates = new Set()

  mealPlans.value.forEach((plan) => {
    plan.meal_items?.forEach((meal) => {
      if (meal.meal_date) {
        dates.add(meal.meal_date)
      }
    })
  })

  return dates
})

// Check whether a date has a meal plan
const hasMealPlan = (date) => {
  if (!date) return false

  return plannedDates.value.has(formatDateKey(date))
}


// Get meals for selected date
const selectedDayMeals = computed(() => {
  const selectedDateKey = formatDateKey(selectedDate.value)

  const meals = mealPlans.value.flatMap((plan) => {
    return (plan.meal_items || [])
      .filter((meal) => meal.meal_date === selectedDateKey)
  })

  // Sort meal types
  const mealOrder = {
    breakfast: 1,
    lunch: 2,
    dinner: 3,
    snack: 4,
    snacks: 4,
  }

  return meals.sort((a, b) => {
    const orderA = mealOrder[a.meal_type?.toLowerCase()] || 99
    const orderB = mealOrder[b.meal_type?.toLowerCase()] || 99

    return orderA - orderB
  })
})

// Load calendar when page opens
onMounted(() => {
  fetchCalendarPlans()
})

</script>

<template>
  <div class="p-5 sm:p-7">
    <HeaderDashboard
      title="Your Meal Schedule"
      description="View your upcoming breakfasts, lunches, and dinners at a glance."
    />

    <div class="mt-6 grid grid-cols-1 gap-5 lg:grid-cols-[1.15fr_0.85fr]">
      <!-- Calendar Panel -->
      <section
        class="fade-up min-h-[520px] rounded-2xl border border-[#E6EFE6] bg-white p-5"
      >
        <!-- Calendar Header -->
        <div class="mb-6 flex items-center justify-between">
          <h2 class="text-lg font-semibold text-[#063B00]">
            {{ monthLabel }}
          </h2>

          <div class="flex items-center gap-2">
            <button
              type="button"
              aria-label="Previous month"
              class="flex size-9 items-center justify-center rounded-lg border border-[#E6EFE6] text-[#263D2A] transition-all duration-200 hover:bg-[#EAF6EA] active:scale-95"
              @click="previousMonth"
            >
              <ChevronLeft :size="18" />
            </button>

            <button
              type="button"
              aria-label="Next month"
              class="flex size-9 items-center justify-center rounded-lg border border-[#E6EFE6] text-[#263D2A] transition-all duration-200 hover:bg-[#EAF6EA] active:scale-95"
              @click="nextMonth"
            >
              <ChevronRight :size="18" />
            </button>
          </div>
        </div>

        <!-- Weekdays -->
        <div class="mb-2 grid grid-cols-7 gap-1.5 sm:gap-2">
          <div
            v-for="day in ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']"
            :key="day"
            class="py-2 text-center text-[11px] font-semibold text-gray-400 sm:text-xs"
          >
            {{ day }}
          </div>
        </div>

        <!-- Calendar Days (animasi singkat setiap ganti bulan) -->
        <div
          :key="monthLabel"
          class="fade-in grid grid-cols-7 gap-1.5 sm:gap-2"
        >
          <div v-for="day in calendarDays" :key="day.key" class="aspect-square">
            <button
              v-if="day.date"
              type="button"
              class="flex h-full w-full flex-col items-center justify-center gap-1 rounded-xl border text-sm transition-all duration-200 active:scale-95"
              :class="
                isSelectedDate(day.date)
                  ? 'border-[#66BB6A] bg-[#66BB6A] font-semibold text-white'
                  : formatDateKey(day.date) === formatDateKey(new Date())
                    ? 'border-[#66BB6A]/60 text-[#263D2A] hover:bg-[#EAF6EA]'
                    : 'border-transparent text-[#263D2A] hover:bg-[#EAF6EA]'
              "
              @click="selectDate(day.date)"
            >
              <span>{{ day.day }}</span>

              <span
                v-if="hasMealPlan(day.date)"
                class="size-1.5 rounded-full"
                :class="isSelectedDate(day.date) ? 'bg-white' : 'bg-[#66BB6A]'"
              />
              <span v-else class="size-1.5" />
            </button>
          </div>
        </div>

        <!-- Legend -->
        <div
          class="mt-5 flex items-center gap-4 border-t border-[#EEF3EE] pt-4 text-xs text-gray-400"
        >
          <span class="flex items-center gap-1.5">
            <span class="size-2 rounded-full bg-[#66BB6A]" />
            Has meal plan
          </span>

          <span class="flex items-center gap-1.5">
            <span class="size-2.5 rounded border border-[#66BB6A]/60" />
            Today
          </span>
        </div>
      </section>

      <!-- Meal Schedule Panel -->
      <section
        class="fade-up min-h-[520px] rounded-2xl border border-[#E6EFE6] bg-[#F3F9F3] p-5"
        style="animation-delay: 80ms"
      >
        <div class="flex items-start justify-between gap-3">
          <div>
            <h2 class="text-lg font-semibold text-[#063B00]">Meal Schedule</h2>

            <p class="mt-1 text-sm text-gray-500">
              {{ selectedDateLabel }}
            </p>
          </div>

          <span
            v-if="!isLoadingCalendar && selectedDayMeals.length"
            class="shrink-0 rounded-full bg-white px-3 py-1 text-xs font-medium text-[#3F9A44]"
          >
            {{ selectedDayMeals.length }}
            {{ selectedDayMeals.length === 1 ? 'meal' : 'meals' }}
          </span>
        </div>

        <!-- Loading -->
        <div v-if="isLoadingCalendar" class="mt-6 animate-pulse space-y-3">
          <div class="h-20 rounded-xl bg-white" />
          <div class="h-20 rounded-xl bg-white" />
          <div class="h-20 rounded-xl bg-white" />
        </div>

        <!-- Empty State -->
        <div
          v-else-if="selectedDayMeals.length === 0"
          :key="`empty-${selectedDateLabel}`"
          class="fade-in mt-6 flex min-h-[350px] flex-col items-center justify-center text-center"
        >
          <div
            class="mb-3 flex size-16 items-center justify-center rounded-full bg-white"
          >
            <Utensils :size="28" class="text-[#66BB6A]" />
          </div>

          <h3 class="font-semibold text-[#063B00]">No Meal Plan Yet</h3>

          <p class="mt-1 max-w-[230px] text-sm text-gray-500">
            There are no meals scheduled for this date.
          </p>
        </div>

        <!-- Meal List (animasi ulang setiap ganti tanggal) -->
        <div v-else :key="selectedDateLabel" class="mt-6 space-y-3">
          <article
            v-for="(meal, index) in selectedDayMeals"
            :key="meal.id"
            class="fade-up rounded-xl border border-[#E6EFE6] bg-white p-4 transition-colors duration-200 hover:border-[#CFE5D0]"
            :style="{ animationDelay: `${index * 60}ms` }"
          >
            <div class="flex items-start justify-between gap-3">
              <div class="min-w-0">
                <p class="text-xs font-medium capitalize text-[#3F9A44]">
                  {{ meal.meal_type }}
                </p>

                <h3 class="mt-1 font-semibold text-[#263D2A]">
                  {{ meal.name }}
                </h3>
              </div>

              <div
                class="flex size-9 shrink-0 items-center justify-center rounded-lg bg-[#EAF6EA]"
              >
                <Utensils :size="18" class="text-[#66BB6A]" />
              </div>
            </div>

            <div
              v-if="meal.calories != null"
              class="mt-3 border-t border-[#EEF3EE] pt-3"
            >
              <p class="text-xs text-gray-500">{{ meal.calories }} kcal</p>
            </div>
          </article>
        </div>
      </section>
    </div>
  </div>
</template>

<style scoped>
@keyframes fade-up {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes fade-in {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.fade-up {
  animation: fade-up 0.45s ease-out both;
}

.fade-in {
  animation: fade-in 0.3s ease-out both;
}

@media (prefers-reduced-motion: reduce) {
  .fade-up,
  .fade-in {
    animation: none;
  }
}
</style>