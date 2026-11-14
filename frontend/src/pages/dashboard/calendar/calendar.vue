<script setup>
import { ref, computed, onMounted  } from 'vue'
import { ChevronLeft, ChevronRight } from 'lucide-vue-next'
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
  <div class="p-7">
    <HeaderDashboard
      title="Your Meal Schedule"
      description="View your upcoming breakfasts, lunches, and dinners at a glance."
    />

    <div class="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-[1.15fr_0.85fr]">

      <!-- Calendar Panel -->
      <section class="min-h-[520px] rounded-xl bg-white p-5 shadow-sm">

        <!-- Calendar Header -->
        <div class="mb-6 flex items-center justify-between">
          <h2 class="text-lg font-semibold text-[#263D2A]">
            {{ monthLabel }}
          </h2>

          <div class="flex items-center gap-2">
            <button
              @click="previousMonth"
              class="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 text-[#263D2A] transition hover:bg-gray-100"
            >
              <ChevronLeft :size="18" />
            </button>

            <button
              @click="nextMonth"
              class="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 text-[#263D2A] transition hover:bg-gray-100"
            >
              <ChevronRight :size="18" />
            </button>
          </div>
        </div>

        <!-- Weekdays -->
        <div class="mb-3 grid grid-cols-7 gap-2">
          <div
            v-for="day in ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']"
            :key="day"
            class="py-2 text-center text-xs font-semibold text-gray-400"
          >
            {{ day }}
          </div>
        </div>

        <!-- Calendar Days -->
        <div class="grid grid-cols-7 gap-2">
          <div
            v-for="day in calendarDays"
            :key="day.key"
            class="flex aspect-square items-center justify-center"
          >
          <button
            v-if="day.date"
            @click="selectDate(day.date)"
            class="flex h-full w-full flex-col items-center justify-center gap-1 rounded-lg text-sm transition"
            :class="
              isSelectedDate(day.date)
                ? 'bg-[#66BB6A] font-semibold text-white'
                : 'text-[#263D2A] hover:bg-[#E8F4E8]'
            "
          >
            <span>{{ day.day }}</span>

            <span
              v-if="hasMealPlan(day.date)"
              class="h-1.5 w-1.5 rounded-full"
              :class="isSelectedDate(day.date) ? 'bg-white' : 'bg-[#66BB6A]'"
            ></span>

            <span v-else class="h-1.5 w-1.5"></span>
          </button>
          </div>
        </div>

      </section>


      <!-- Meal Schedule Panel -->
      <section class="min-h-[520px] rounded-xl bg-[#E8F4E8] p-5">

        <h2 class="text-lg font-semibold text-[#263D2A]">
          Meal Schedule
        </h2>

        <p class="mt-1 text-sm text-gray-500">
          {{ selectedDateLabel }}
        </p>

        <!-- Loading -->
        <div
          v-if="isLoadingCalendar"
          class="mt-6 flex min-h-[350px] items-center justify-center"
        >
          <p class="text-sm text-gray-500">
            Loading meal schedule...
          </p>
        </div>

        <!-- Empty State -->
        <div
          v-else-if="selectedDayMeals.length === 0"
          class="mt-6 flex min-h-[350px] flex-col items-center justify-center text-center"
        >
          <div class="mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-white">
            <Utensils :size="28" class="text-[#66BB6A]" />
          </div>

          <h3 class="font-semibold text-[#263D2A]">
            No Meal Plan Yet
          </h3>

          <p class="mt-1 max-w-[230px] text-sm text-gray-500">
            There are no meals scheduled for this date.
          </p>
        </div>

        <!-- Meal List -->
        <div v-else class="mt-6 space-y-3">

          <article
            v-for="meal in selectedDayMeals"
            :key="meal.id"
            class="rounded-xl bg-white p-4 shadow-sm"
          >
            <div class="flex items-start justify-between gap-3">

              <div>
                <p class="text-xs font-medium text-[#66BB6A]">
                  {{ meal.meal_type }}
                </p>

                <h3 class="mt-1 font-semibold text-[#263D2A]">
                  {{ meal.name }}
                </h3>
              </div>

              <div class="rounded-lg bg-[#E8F4E8] p-2">
                <Utensils :size="18" class="text-[#66BB6A]" />
              </div>

            </div>

            <div
              v-if="meal.calories != null"
              class="mt-3 border-t border-gray-100 pt-3"
            >
              <p class="text-xs text-gray-500">
                {{ meal.calories }} kcal
              </p>
            </div>
          </article>
        </div>
      </section>
    </div>
  </div>
</template>