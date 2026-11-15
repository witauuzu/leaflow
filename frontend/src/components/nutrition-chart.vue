
<script setup>
import { computed, ref, watch } from 'vue'
import { Line } from 'vue-chartjs'
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale,
} from 'chart.js'

ChartJS.register(
  Title,
  Tooltip,
  Legend,
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale
)

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
      `http://localhost:5000/api/planner/nutrition-trends?${params}`,
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

const chartData = computed(() => ({
  labels: labels.value,
  datasets: [
    {
      label: 'Calories (kcal)',
      data: nutritionData.value.map((item) => item.calories),
      borderColor: '#66BB6A',
      backgroundColor: '#66BB6A',
      tension: 0.35,
      yAxisID: 'yCalories',
    },
    {
      label: 'Protein (g)',
      data: nutritionData.value.map((item) => item.protein),
      borderColor: '#4299E1',
      backgroundColor: '#4299E1',
      tension: 0.35,
      yAxisID: 'yMacros',
    },
    {
      label: 'Carbs (g)',
      data: nutritionData.value.map((item) => item.carbs),
      borderColor: '#F6AD55',
      backgroundColor: '#F6AD55',
      tension: 0.35,
      yAxisID: 'yMacros',
    },
    {
      label: 'Fat (g)',
      data: nutritionData.value.map((item) => item.fat),
      borderColor: '#A78BFA',
      backgroundColor: '#A78BFA',
      tension: 0.35,
      yAxisID: 'yMacros',
    },
  ],
}))

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
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
        boxWidth: 7,
        padding: 18,
      },
    },
    tooltip: {
      enabled: true,
    },
  },
    scales: {
    yCalories: {
        type: 'linear',
        position: 'left',
        beginAtZero: true,
        title: {
        display: true,
        text: 'Calories (kcal)',
        },
    },
    yMacros: {
        type: 'linear',
        position: 'right',
        beginAtZero: true,
        title: {
        display: true,
        text: 'Macronutrients (g)',
        },
        grid: {
        drawOnChartArea: false,
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
    <div
      v-if="isLoading"
      class="flex h-full items-center justify-center text-sm text-gray-400"
    >
      Loading nutrition data...
    </div>

    <div
      v-else-if="errorMessage"
      class="flex h-full items-center justify-center text-sm text-red-500"
    >
      {{ errorMessage }}
    </div>

    <div
      v-else-if="nutritionData.length === 0"
      class="flex h-full items-center justify-center text-sm text-gray-400"
    >
      No consumption data available for this period.
    </div>

    <Line
      v-else
      :data="chartData"
      :options="chartOptions"
    />
  </div>
</template>