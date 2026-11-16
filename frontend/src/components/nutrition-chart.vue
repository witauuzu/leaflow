<script setup>
import { computed, ref, watch } from 'vue'
import { Line } from 'vue-chartjs'
import { Chart as ChartJS, Title, Tooltip, Legend, LineElement, PointElement, CategoryScale, LinearScale, } from 'chart.js'

ChartJS.register( Title, Tooltip, Legend, LineElement, PointElement, CategoryScale, LinearScale )

const props = defineProps({
  period: {
    type: String,
    default: 'weekly',
  },
})

const nutritionData = ref([])
const isLoading = ref(false)
const errorMessage = ref('')

const fetchNutritionData = async () => {
  isLoading.value = true
  errorMessage.value = ''

  try {
    const session = JSON.parse(
      localStorage.getItem('leaflow-session') || 'null'
    )

    if (!session?.access_token) {
      throw new Error('Please log in again.')
    }

    const today = new Date()
    const endDate = new Date(today)
    const startDate = new Date(today)

    if (props.period === 'weekly') {
      startDate.setDate(today.getDate() - 6)
    } else {
      startDate.setDate(1)
    }

    const formatDate = (date) => {
      const year = date.getFullYear()
      const month = String(date.getMonth() + 1).padStart(2, '0')
      const day = String(date.getDate()).padStart(2, '0')

      return `${year}-${month}-${day}`
    }

    const params = new URLSearchParams({
      startDate: formatDate(startDate),
      endDate: formatDate(endDate),
    })

    const response = await fetch(
      `https://leaflow-backend.vercel.app/api/planner/nutrition-trends?${params}`,
      {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      }
    )

    const result = await response.json()

    if (!response.ok) {
      throw new Error(result.message || 'Failed to load nutrition data.')
    }

    nutritionData.value = result.data || []
  } catch (error) {
    console.error('Fetch nutrition data error:', error)
    errorMessage.value = error.message
  } finally {
    isLoading.value = false
  }
}

watch(
  () => props.period,
  fetchNutritionData,
  { immediate: true }
)


const labels = computed(() => {
  return nutritionData.value.map((item) => {
    const date = new Date(`${item.date}T00:00:00`)

    return date.toLocaleDateString('en-US', {
      day: 'numeric',
      month: 'short',
    })
  })
})

// Gaya garis dipakai bersama oleh semua dataset
// Titik disembunyikan kalau datanya banyak, supaya garis tetap bersih
const lineStyle = computed(() => ({
  borderWidth: 2.5,
  tension: 0.35,
  pointRadius: nutritionData.value.length <= 10 ? 3 : 0,
  pointHoverRadius: 5,
  pointBorderWidth: 2,
  pointBorderColor: '#FFFFFF',
  pointHoverBorderColor: '#FFFFFF',
}))

const chartData = computed(() => ({
  labels: labels.value,
  datasets: [
    {
      label: 'Calories (kcal)',
      data: nutritionData.value.map((item) => item.calories),
      borderColor: '#66BB6A',
      backgroundColor: '#66BB6A',
      yAxisID: 'yCalories',
      ...lineStyle.value,
    },
    {
      label: 'Protein (g)',
      data: nutritionData.value.map((item) => item.protein),
      borderColor: '#4299E1',
      backgroundColor: '#4299E1',
      yAxisID: 'yMacros',
      ...lineStyle.value,
    },
    {
      label: 'Carbs (g)',
      data: nutritionData.value.map((item) => item.carbs),
      borderColor: '#F6AD55',
      backgroundColor: '#F6AD55',
      yAxisID: 'yMacros',
      ...lineStyle.value,
    },
    {
      label: 'Fat (g)',
      data: nutritionData.value.map((item) => item.fat),
      borderColor: '#A78BFA',
      backgroundColor: '#A78BFA',
      yAxisID: 'yMacros',
      ...lineStyle.value,
    },
  ],
}))

const TEXT_COLOR = '#9CA3AF'
const GRID_COLOR = '#EEF3EE'

const axisTitle = (text) => ({
  display: true,
  text,
  color: TEXT_COLOR,
  font: { size: 11, weight: '500' },
  padding: { bottom: 8 },
})

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  animation: {
    duration: 700,
    easing: 'easeOutQuart',
  },
  interaction: {
    mode: 'index',
    intersect: false,
  },
  plugins: {
    legend: {
      display: true,
      position: 'bottom',
      labels: {
        usePointStyle: true,
        pointStyle: 'circle',
        boxWidth: 7,
        boxHeight: 7,
        padding: 18,
        color: '#6B7280',
        font: { size: 12 },
      },
    },
    tooltip: {
      enabled: true,
      backgroundColor: '#063B00',
      titleColor: '#FFFFFF',
      bodyColor: '#E5F2E5',
      titleFont: { size: 12, weight: '600' },
      bodyFont: { size: 12 },
      padding: 12,
      cornerRadius: 10,
      boxPadding: 4,
      usePointStyle: true,
    },
  },
  scales: {
    x: {
      grid: { display: false },
      border: { display: false },
      ticks: {
        color: TEXT_COLOR,
        font: { size: 11 },
        maxRotation: 0,
        autoSkip: true,
        maxTicksLimit: 8,
      },
    },
    yCalories: {
      type: 'linear',
      position: 'left',
      beginAtZero: true,
      title: axisTitle('Calories (kcal)'),
      border: { display: false },
      grid: { color: GRID_COLOR },
      ticks: {
        color: TEXT_COLOR,
        font: { size: 11 },
        maxTicksLimit: 5,
      },
    },
    yMacros: {
      type: 'linear',
      position: 'right',
      beginAtZero: true,
      title: axisTitle('Macronutrients (g)'),
      border: { display: false },
      grid: { drawOnChartArea: false },
      ticks: {
        color: TEXT_COLOR,
        font: { size: 11 },
        maxTicksLimit: 5,
      },
    },
  },
}


const emit = defineEmits(['summary'])

const nutritionSummary = computed(() => {
  const total = nutritionData.value.reduce(
    (summary, item) => {
      summary.calories += Number(item.calories) || 0
      summary.protein += Number(item.protein) || 0
      summary.carbs += Number(item.carbs) || 0
      summary.fat += Number(item.fat) || 0

      return summary
    },
    {
      calories: 0,
      protein: 0,
      carbs: 0,
      fat: 0,
    }
  )

  const days = nutritionData.value.length || 1

  return {
    calories: Math.round(total.calories / days),
    protein: Math.round(total.protein / days),
    carbs: Math.round(total.carbs / days),
    fat: Math.round(total.fat / days),
  }
})

// Watch berada di luar computed
watch(
  nutritionSummary,
  (value) => {
    emit('summary', value)
  },
  { immediate: true }
)
</script>


<template>
  <div class="h-[230px] w-full">
    <Transition name="fade" mode="out-in">
      <!-- Loading skeleton -->
      <div
        v-if="isLoading"
        key="loading"
        class="flex h-full animate-pulse flex-col justify-end gap-4 px-2"
      >
        <div class="flex flex-1 items-end gap-3">
          <div
            v-for="height in [45, 70, 55, 85, 60, 75, 50]"
            :key="height"
            class="flex-1 rounded-t-lg bg-[#EEF3EE]"
            :style="{ height: `${height}%` }"
          />
        </div>
        <div class="mx-auto h-3 w-48 rounded-full bg-[#EEF3EE]" />
      </div>

      <!-- Error -->
      <div
        v-else-if="errorMessage"
        key="error"
        class="flex h-full items-center justify-center"
      >
        <p
          class="rounded-xl bg-red-50 px-4 py-3 text-center text-sm text-red-500"
        >
          {{ errorMessage }}
        </p>
      </div>

      <!-- Empty -->
      <div
        v-else-if="nutritionData.length === 0"
        key="empty"
        class="flex h-full items-center justify-center rounded-xl"
      >
        <p class="px-4 text-center text-sm text-gray-400">
          No consumption data available for this period.
        </p>
      </div>

      <!-- Chart -->
      <div v-else key="chart" class="relative h-full w-full min-w-0">
        <Line :data="chartData" :options="chartOptions" />
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.25s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

@media (prefers-reduced-motion: reduce) {
  .fade-enter-active,
  .fade-leave-active {
    transition: none;
  }
}
</style>