<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { ChevronLeft, ChevronRight, CalendarDays, Wallet, Droplets } from 'lucide-vue-next'
import HeaderDashboard from '../../../components/header-dashboard.vue'
import NutritionChart from '../../../components/nutrition-chart.vue'

const nutritionSummary = ref({
  calories: 0,
  protein: 0,
  carbs: 0,
  fat: 0,
})

// Daily nutrition targets
const nutritionTargets = ref({
  calories: 0,
  protein: 0,
  carbs: 0,
  fat: 0,
})

const fetchNutritionTargets = async () => {
  try {
    const savedPlan = JSON.parse(
      localStorage.getItem('leaflowMealPlan') || 'null'
    )

    if (!savedPlan?.id) {
      nutritionTargets.value = {
        calories: 0,
        protein: 0,
        carbs: 0,
        fat: 0,
      }
      return
    }

    isLoadingTargets.value = true

    const session = JSON.parse(
      localStorage.getItem('leaflow-session') || 'null'
    )

    const response = await fetch(
      `http://localhost:5000/api/planner/${savedPlan.id}`,
      {
        headers: {
          Authorization: `Bearer ${session?.access_token}`,
        },
      }
    )

    const result = await response.json()

    if (!response.ok) {
      throw new Error(result.message || 'Failed to fetch nutrition targets.')
    }

    const answers = result.data?.questionnaire_answers || {}

    nutritionTargets.value = {
      calories: Number(answers.targetCalories) || 0,
      protein: Number(answers.targetProtein) || 0,
      carbs: Number(answers.targetCarbs) || 0,
      fat: Number(answers.targetFat) || 0,
    }
  } catch (error) {
    console.error('Fetch nutrition targets error:', error)
  } finally {
    isLoadingTargets.value = false
  }
}

const isLoadingTargets = ref(false)
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

const selectedPeriod = ref('weekly')

const foodSpending = ref({
  budgetAmount: 0,
  budgetPeriod: null,
  actualSpending: 0,
})
const isLoadingSpending = ref(false)
const fetchFoodSpending = async () => {
  isLoadingSpending.value = true

  try {
    const session = JSON.parse(
      localStorage.getItem('leaflow-session') || 'null'
    )

    if (!session?.access_token) {
      throw new Error('Please log in again.')
    }

    const params = new URLSearchParams({
      selectedDate: formatDateKey(selectedDate.value),
    })

    const response = await fetch(
      `http://localhost:5000/api/planner/food-spending?${params}`,
      {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      }
    )

    const result = await response.json()

    if (!response.ok) {
      throw new Error(result.message || 'Failed to load food spending.')
    }

    foodSpending.value = {
      budgetAmount: Number(result.data?.budgetAmount) || 0,
      budgetPeriod: result.data?.budgetPeriod || null,
      actualSpending: Number(result.data?.actualSpending) || 0,
    }
  } catch (error) {
    console.error('Fetch food spending error:', error)

    foodSpending.value = {
      budgetAmount: 0,
      budgetPeriod: null,
      actualSpending: 0,
    }
  } finally {
    isLoadingSpending.value = false
  }
}

const periods = [
  { label: 'Weekly', value: 'weekly' },
  { label: 'Monthly', value: 'monthly' },
]

// Format date to YYYY-MM-DD
const formatDateKey = (date) => {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')

  return `${year}-${month}-${day}`
}

// Generate 7 days of the selected week
const calendarDays = computed(() => {
  const weekStart = new Date(selectedDate.value)

  // Start the week on Sunday
  weekStart.setDate(weekStart.getDate() - weekStart.getDay())

  return Array.from({ length: 7 }, (_, index) => {
    const date = new Date(weekStart)
    date.setDate(weekStart.getDate() + index)

    return {
      key: formatDateKey(date),
      date,
      day: date.getDate(),
    }
  })
})

// Display month based on selected date
const monthLabel = computed(() => {
  return selectedDate.value.toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  })
})

// Previous week - select Sunday
const previousWeek = () => {
  const date = new Date(selectedDate.value)
  date.setDate(date.getDate() - date.getDay() - 7)
  selectedDate.value = date
}

// Next week - select Sunday
const nextWeek = () => {
  const date = new Date(selectedDate.value)
  date.setDate(date.getDate() - date.getDay() + 7)
  selectedDate.value = date
}

// Select date
const selectDate = (date) => {
  if (!date) return
  selectedDate.value = date
}

// Check selected date
const isSelectedDate = (date) => {
  return date && formatDateKey(date) === formatDateKey(selectedDate.value)
}

const waterIntake = ref(0)
const waterGoal = ref(2000)
const isLoadingWater = ref(false)

const fetchWaterIntake = async () => {
  isLoadingWater.value = true
  waterIntake.value = 0

  try {
    const session = JSON.parse(
      localStorage.getItem('leaflow-session') || 'null'
    )

    if (!session?.access_token) {
      throw new Error('Please log in again.')
    }

    const params = new URLSearchParams({
      intakeDate: formatDateKey(selectedDate.value),
    })

    const response = await fetch(
      `http://localhost:5000/api/planner/water-intake?${params}`,
      {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      }
    )

    const result = await response.json()

    if (!response.ok) {
      throw new Error(result.message || 'Failed to load water intake.')
    }

    waterIntake.value = result.data?.amount_ml || 0
  } catch (error) {
    console.error('Fetch water intake error:', error)
  } finally {
    isLoadingWater.value = false
  }
}

const dailyRecap = ref({
  mealsLogged: 0,
  calories: 0,
  protein: 0,
  meals: [],
})

const isLoadingRecap = ref(false)

const fetchDailyRecap = async () => {
  isLoadingRecap.value = true

  try {
    const session = JSON.parse(
      localStorage.getItem('leaflow-session') || 'null'
    )

    if (!session?.access_token) {
      throw new Error('Please log in again.')
    }

    const params = new URLSearchParams({
      startDate: formatDateKey(selectedDate.value),
      endDate: formatDateKey(selectedDate.value),
    })

    const response = await fetch(
      `http://localhost:5000/api/planner/nutrition-trends?${params}`,
      {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      }
    )

    const result = await response.json()

    if (!response.ok) {
      throw new Error(result.message || 'Failed to load daily recap.')
    }

    const mealsResponse = await fetch(
      `http://localhost:5000/api/planner/consumption?mealPlanId=${encodeURIComponent(JSON.parse(localStorage.getItem('leaflowMealPlan') || 'null')?.id || '')}&mealDate=${formatDateKey(selectedDate.value)}`,
      {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      }
    )

    const mealsResult = await mealsResponse.json()

    if (!mealsResponse.ok) {
      throw new Error(mealsResult.message || 'Failed to load meals.')
    }

    const nutrition = result.data?.[0]
    console.log('Nutrition trends response:', result.data)
    console.log('Selected nutrition:', nutrition)

    dailyRecap.value = {
      mealsLogged: mealsResult.data?.length || 0,
      calories: Number(nutrition?.calories) || 0,
      protein: Number(nutrition?.protein) || 0,
      carbs: Number(nutrition?.carbs) || 0,
      fat: Number(nutrition?.fat) || 0,
      meals: mealsResult.data || [],
    }
  } catch (error) {
    console.error('Fetch daily recap error:', error)
  } finally {
    isLoadingRecap.value = false
  }
}
const nutritionProgress = computed(() => [
  {
    name: 'Calories',
    consumed: dailyRecap.value.calories,
    target: nutritionTargets.value.calories,
    unit: 'kcal',
    color: '#66BB6A',
  },
  {
    name: 'Protein',
    consumed: dailyRecap.value.protein,
    target: nutritionTargets.value.protein,
    unit: 'g',
    color: '#4A90E2',
  },
  {
    name: 'Carbs',
    consumed: dailyRecap.value.carbs,
    target: nutritionTargets.value.carbs,
    unit: 'g',
    color: '#F5A623',
  },
  {
    name: 'Fat',
    consumed: dailyRecap.value.fat,
    target: nutritionTargets.value.fat,
    unit: 'g',
    color: '#E879A5',
  },
])

watch(selectedDate, fetchDailyRecap, { immediate: true })
watch(
  [selectedDate, selectedPeriod],
  fetchFoodSpending,
  { immediate: true }
)
watch(
  selectedDate,
  fetchWaterIntake,
  { immediate: true }
)

onMounted(() => {
  fetchNutritionTargets()
})
</script>

<template>
  <div class="p-7">
    <HeaderDashboard
      title="Track Your Progress"
      description="Analyze your nutrient intake, view spending trends, and stay accountable."
    />

    <!-- Track Dashboard -->
    <div class="mt-6 grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1.7fr)_minmax(280px,0.9fr)]">

      <!-- Left Column -->
      <div class="space-y-4">

        <!-- Nutrition Trends -->
        <section class="min-h-[260px] rounded-xl bg-white p-5 border border-gray-200">
          <div class="flex items-center justify-between">
            <div>
              <h2 class="text-lg font-semibold text-[#063B00]">
                Nutrition Trends
              </h2>
              <p class="mt-1 text-sm text-gray-500">
                Track your daily nutrient intake
              </p>
            </div>

            <div class="flex rounded-lg bg-gray-100 p-1">
              <button
                v-for="period in periods"
                :key="period.value"
                @click="selectedPeriod = period.value"
                class="rounded-md px-3 py-1.5 text-sm font-medium transition"
                :class="
                  selectedPeriod === period.value
                    ? 'bg-[#66BB6A] text-white border border-gray-200'
                    : 'text-gray-500 hover:text-[#063B00]'
                "
              >
                {{ period.label }}
              </button>
            </div>
          </div>

          <div class="mt-6 w-full min-w-0">
            <div class="mt-6">
              <NutritionChart
                :period="selectedPeriod"
                @summary="nutritionSummary = $event"
              />
            </div>
          </div>
        </section>

        <!-- Nutrition Cards -->
        <div class="grid grid-cols-2 gap-3 xl:grid-cols-4">
          <section
            v-for="item in nutritionProgress"
            :key="item.name"
            class="flex min-h-[230px] flex-col items-center rounded-xl bg-white p-5 border border-gray-200"
          >
            <!-- Title -->
            <p class="self-start text-sm font-medium text-gray-500">
              {{ item.name }}
            </p>

            <!-- Circular Progress -->
            <div class="relative mt-4 flex h-[125px] w-[125px] items-center justify-center">
              <svg
                class="h-full w-full -rotate-90"
                viewBox="0 0 120 120"
              >
                <!-- Background Circle -->
                <circle
                  cx="60"
                  cy="60"
                  r="48"
                  fill="none"
                  stroke="#E8F0E8"
                  stroke-width="10"
                />

                <!-- Progress Circle -->
                <circle
                  cx="60"
                  cy="60"
                  r="48"
                  fill="none"
                  :stroke="item.color"
                  stroke-width="10"
                  stroke-linecap="round"
                  stroke-dasharray="301.59"
                  :stroke-dashoffset="
                    301.59 * (
                      1 - Math.min(
                        Math.max(
                          item.target > 0 ? item.consumed / item.target : 0,
                          0
                        ),
                        1
                      )
                    )
                  "
                  class="transition-all duration-500"
                />
              </svg>

              <!-- Consumed Value -->
              <div class="absolute flex flex-col items-center">
                <span class="text-2xl font-semibold text-[#063B00]">
                  {{ Number(item.consumed).toLocaleString() }}
                </span>
                <span class="text-xs text-gray-400">
                  {{ item.unit }}
                </span>
              </div>
            </div>

            <!-- Target -->
            <p class="mt-3 text-xs text-gray-400">
              of {{ Number(item.target).toLocaleString() }} {{ item.unit }} target
            </p>
          </section>
        </div>

        <!-- Daily Recap -->
        <section class="rounded-xl bg-white p-5 border border-gray-200">
          <div class="flex items-center justify-between">
            <div>
              <h2 class="text-lg font-semibold text-(--color-text)">
                Daily Recap
              </h2>
              <p class="mt-1 text-sm text-gray-500">
                Your consumption summary
              </p>
            </div>

            <CalendarDays class="h-5 w-5 text-[#66BB6A]" />
          </div>

          <div
            v-if="isLoadingRecap"
            class="flex min-h-[110px] items-center justify-center text-sm text-gray-400"
          >
            Loading daily recap...
          </div>
<!-- Consumed Meals -->
<div class="mt-5">
  <!-- Empty State -->
  <div
    v-if="dailyRecap.meals.length === 0"
    class="rounded-lg bg-gray-50 p-4 text-center"
  >
    <p class="text-sm text-gray-400">
      No meals recorded for this day.
    </p>
  </div>

  <!-- Meal List -->
  <div v-else class="space-y-3">
    <div
      v-for="meal in dailyRecap.meals"
      :key="meal.id"
      class="flex items-center justify-between rounded-lg border border-gray-100 p-3"
    >
      <div>
        <p class="text-xs font-medium text-[#66BB6A]">
          {{ meal.meal_type }}
        </p>

        <p class="mt-1 text-sm font-semibold text-[#263D2A]">
          {{ meal.meal_name }}
        </p>

        <p
          v-if="meal.portion"
          class="mt-1 text-xs text-gray-400"
        >
          {{ meal.portion }}
        </p>
      </div>

      <div class="text-right">
        <p class="text-sm font-semibold text-[#263D2A]">
          {{ Math.round(meal.calories || 0).toLocaleString() }} kcal
        </p>
        <p class="mt-1 text-xs text-gray-400">
          {{ meal.protein || 0 }} g protein
        </p>
      </div>
    </div>
  </div>
</div>
        </section>
      </div>

      <!-- Right Column -->
      <div class="space-y-4">
      <!-- Calendar -->
      <section class="rounded-xl bg-white p-4 border border-gray-200">

        <!-- Calendar Header -->
        <div class="mb-4 flex items-center justify-between">
          <div class="flex items-center gap-2">
            <CalendarDays :size="18" class="text-[#66BB6A]" />
            <p class="text-sm font-semibold text-[#263D2A]">
              {{ monthLabel }}
            </p>
          </div>

          <!-- Week Navigation -->
          <div class="flex items-center gap-1">
            <button
              @click="previousWeek"
              class="flex h-8 w-8 items-center justify-center rounded-lg text-[#263D2A] transition hover:bg-gray-100"
            >
              <ChevronLeft :size="17" />
            </button>

            <button
              @click="nextWeek"
              class="flex h-8 w-8 items-center justify-center rounded-lg text-[#263D2A] transition hover:bg-gray-100"
            >
              <ChevronRight :size="17" />
            </button>
          </div>
        </div>

        <!-- Weekdays -->
        <div class="mb-2 grid grid-cols-7 gap-1">
          <div
            v-for="(day, index) in ['S', 'M', 'T', 'W', 'T', 'F', 'S']"
            :key="index"
            class="py-1 text-center text-xs font-medium text-gray-400"
          >
            {{ day }}
          </div>
        </div>

        <!-- Calendar Dates -->
        <div class="grid grid-cols-7 gap-1">
          <div
            v-for="day in calendarDays"
            :key="day.key"
            class="flex aspect-square items-center justify-center"
          >
            <button
              @click="selectDate(day.date)"
              class="flex h-full w-full items-center justify-center rounded-lg text-xs transition"
              :class="
                isSelectedDate(day.date)
                  ? 'bg-[#66BB6A] font-semibold text-white'
                  : 'text-[#263D2A] hover:bg-[#E8F4E8]'
              "
            >
              {{ day.day }}
            </button>
          </div>
        </div>

        <!-- Selected Date -->
        <div class="mt-4 border-t border-gray-100 pt-3">
          <p class="text-xs text-gray-400">
            Selected Date
          </p>

          <p class="mt-1 text-sm font-semibold text-[#263D2A]">
            {{ selectedDate.toLocaleDateString('en-US', {
              weekday: 'long',
              day: 'numeric',
              month: 'long',
              year: 'numeric'
            }) }}
          </p>
        </div>

      </section>


      <!-- Food Spending -->
      <section class="rounded-xl bg-white p-5 border border-gray-200">
        <div class="mb-5 flex items-center justify-between">
          <div>
            <h3 class="text-base font-semibold text-ink">
              Food Spending
            </h3>
            <p class="mt-1 text-xs text-muted">
              Track your meal expenses and budget.
            </p>
          </div>
          <Wallet :size="20" class="text-primary" />
        </div>

        <div
          v-if="isLoadingSpending"
          class="py-8 text-center text-sm text-muted"
        >
          Loading food spending...
        </div>

        <div v-else class="space-y-5">
          <!-- Budget -->
          <div class="rounded-lg bg-accent/20 p-4">
            <p class="text-xs text-muted">Your Budget</p>
            <p class="mt-1 text-xl font-semibold text-ink">
              Rp {{ Number(foodSpending.budgetAmount).toLocaleString('id-ID') }}
            </p>
            <p class="mt-1 text-xs text-muted">
              {{ foodSpending.budgetPeriod || 'No budget set' }}
            </p>
          </div>

          <!-- Actual Spending -->
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-muted">Actual Spending</p>
              <p class="mt-1 font-semibold text-ink">
                Rp {{ Number(foodSpending.actualSpending).toLocaleString('id-ID') }}
              </p>
            </div>
            <span class="rounded-full bg-green-50 px-3 py-1 text-xs text-green-600">
              Actual
            </span>
          </div>

          <!-- Remaining Budget -->
          <div class="border-t border-line pt-4">
            <div class="flex items-center justify-between">
              <p class="text-sm font-medium text-ink">Remaining Budget</p>
              <p
                class="text-lg font-bold"
                :class="
                  foodSpending.budgetAmount - foodSpending.actualSpending < 0
                    ? 'text-red-500'
                    : 'text-primary'
                "
              >
                Rp {{
                  (
                    foodSpending.budgetAmount - foodSpending.actualSpending
                  ).toLocaleString('id-ID')
                }}
              </p>
            </div>
          </div>
        </div>
      </section>

      <!-- Water Intake -->
      <section class="rounded-xl bg-white p-5 border border-gray-200">
        <div class="mb-5 flex items-center justify-between">
          <div>
            <h3 class="text-base font-semibold text-ink">
              Water Intake
            </h3>
            <p class="mt-1 text-xs text-muted">
              Your daily hydration progress.
            </p>
          </div>
          <Droplets :size="20" class="text-primary" />
        </div>

        <div v-if="isLoadingWater" class="py-6 text-center text-sm text-muted">
          Loading water intake...
        </div>

        <div v-else>
          <div class="mb-2 flex items-end justify-between">
            <div>
              <p class="text-2xl font-bold text-ink">
                {{ waterIntake.toLocaleString('id-ID') }}
                <span class="text-sm font-normal text-muted">ml</span>
              </p>
              <p class="mt-1 text-xs text-muted">
                of {{ waterGoal.toLocaleString('id-ID') }} ml daily goal
              </p>
            </div>

            <p class="text-sm font-semibold text-primary">
              {{ Math.min(Math.round((waterIntake / waterGoal) * 100), 100) }}%
            </p>
          </div>

          <!-- Progress Bar -->
          <div class="h-3 overflow-hidden rounded-full bg-accent/40">
            <div
              class="h-full rounded-full bg-primary transition-all duration-500"
              :style="{
                width: `${Math.min((waterIntake / waterGoal) * 100, 100)}%`
              }"
            ></div>
          </div>

          <p class="mt-3 text-xs text-muted">
            {{ waterIntake >= waterGoal
              ? 'Daily hydration goal achieved!'
              : `${(waterGoal - waterIntake).toLocaleString('id-ID')} ml left to reach your goal.`
            }}
          </p>
        </div>
      </section>

      </div>

    </div>
  </div>
</template>
