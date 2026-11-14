<script setup>
import { reactive, ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ChevronLeft, ChevronRight, Check, X } from 'lucide-vue-next'

const questionContainer = ref(null)
const router = useRouter()
const currentStep = ref(0)

const scrollToTop = () => {
  questionContainer.value?.scrollTo({
    top: 0,
    behavior: 'smooth',
  })
}

const answers = reactive({
  goal: '',
  goalOther: '',
  nutritionFocus: [],
  nutritionOther: '',
  mealPreferences: [],
  dietaryPatterns: [],
  dietaryOther: '',
  allergies: [],
  allergyOther: '',
  cuisine: [],
  cuisineOther: '',
  dislikedFoods: '',
  budgetAmount: '',
  budgetPeriod: 'Per Day',
  startDate: '',
  duration: '',
  preparationTime: '',
  includedMeals: [],
})


onMounted(() => {
  const savedAnswers = localStorage.getItem('leaflowQuestionnaire')

  if (!savedAnswers) return

  try {
    const parsedAnswers = JSON.parse(savedAnswers)

    Object.assign(answers, parsedAnswers)
  } catch (error) {
    console.error('Failed to restore questionnaire answers:', error)
  }
})

const questions = [
  {
    key: 'goal',
    title: 'What would you like to achieve with your meal plan?',
    description: 'Choose the main goal you want to achieve.',
    type: 'single',
    options: [
      'Eat Healthier',
      'Manage My Weight',
      'Gain Muscle',
      'Save Money',
      'Maintain a Healthy Lifestyle',
      'Other',
    ],
  },
  {
    key: 'nutritionFocus',
    title: 'What nutritional aspects would you like to focus on?',
    description: 'Select the nutritional aspects that matter most to you.',
    type: 'multiple',
    exclusive: ['No Specific Focus'],
    options: [
      'Higher Protein Intake',
      'More Vegetables & Fiber',
      'Lower Sugar Intake',
      'Lower Sodium Intake',
      'Balanced Nutrition',
      'Lower Fat Intake',
      'No Specific Focus',
      'Other',
    ],
  },
  {
    key: 'mealPreferences',
    title: 'What kind of meals do you prefer?',
    description: 'Select the meal characteristics you enjoy.',
    type: 'multiple',
    options: [
      'Simple & Easy-to-Make Meals',
      'Quick Meals',
      'Homemade Meals',
      'High-Protein Meals',
      'Low-Calorie Meals',
      'Fresh & Light Meals',
      'Budget-Friendly Meals',
    ],
  },
  {
    key: 'dietaryPatterns',
    title: 'Do you follow any specific dietary patterns?',
    description: 'Choose any dietary preferences or restrictions that apply.',
    type: 'multiple',
    exclusive: ['No Restrictions'],
    options: [
      'No Restrictions',
      'Vegetarian',
      'Vegan',
      'Pescatarian',
      'Flexitarian',
      'Halal',
      'Other',
    ],
  },
  {
    key: 'allergies',
    title: 'Do you have any food allergies or ingredients you need to avoid?',
    description: 'Select all that apply. This helps us avoid ingredients that may be unsafe for you.',
    type: 'multiple',
    exclusive: ['None'],
    options: [
      'Peanuts',
      'Tree Nuts',
      'Seafood',
      'Shellfish',
      'Eggs',
      'Milk & Dairy',
      'Soy',
      'Wheat',
      'Gluten',
      'None',
      'Other',
    ],
  },
  {
    key: 'cuisine',
    title: 'What types of cuisine do you enjoy?',
    description: 'Choose the cuisines you would like to see in your meal plan.',
    type: 'multiple',
    exclusive: ['No Specific Preference'],
    options: [
      'Indonesian Food',
      'Asian Food',
      'Western Food',
      'Mediterranean Food',
      'Traditional Food',
      'Healthy Bowls & Salads',
      'No Specific Preference',
      'Other',
    ],
  },
  {
    key: 'dislikedFoods',
    title: 'Are there any foods or ingredients you dislike?',
    description: 'Let us know which foods you would prefer to avoid.',
    type: 'text',
    placeholder: 'e.g. Bitter melon, cilantro, mushrooms, or eggplant...',
  },
  {
    key: 'budget',
    title: 'What is your food budget?',
    description: 'Set your estimated food budget for one person.',
    type: 'budget',
  },
  {
    key: 'duration',
    title: 'How long would you like to plan your meals?',
    description: 'Choose how many days you want your meal plan to cover.',
    type: 'duration',
  },
  {
    key: 'preparationTime',
    title: 'How much time do you usually spend preparing meals?',
    description: 'Choose the amount of time you are comfortable spending on meal preparation.',
    type: 'single',
    options: [
      'Under 15 minutes',
      '15–30 minutes',
      '30–60 minutes',
      'More than 60 minutes',
      'No Time Preference',
    ],
  },
  {
    key: 'includedMeals',
    title: 'Which meals would you like to include in your plan?',
    description: 'Select the meals you want to organize.',
    type: 'multiple',
    options: [
      'Breakfast',
      'Lunch',
      'Dinner',
      'Snacks',
    ],
  },
]

const formattedBudget = computed({
  get() {
    if (!answers.budgetAmount) return ''
    return String(answers.budgetAmount).replace(/\B(?=(\d{3})+(?!\d))/g, '.')
  },
  set(value) {
    const cleanValue = value.replace(/\D/g, '')
    answers.budgetAmount = cleanValue ? Number(cleanValue) : ''
  }
})

// Minimum Start Date (Today)
const minStartDate = computed(() => {
  const today = new Date()
  const year = today.getFullYear()
  const month = String(today.getMonth() + 1).padStart(2, '0')
  const day = String(today.getDate()).padStart(2, '0')

  return `${year}-${month}-${day}`
})

// Automatically Calculate End Date
const endDate = computed(() => {
  if (!answers.startDate || !answers.duration) return ''

  const start = new Date(`${answers.startDate}T00:00:00`)
  const days = Number(answers.duration)

  if (!Number.isInteger(days) || days < 1 || days > 30) return ''

  start.setDate(start.getDate() + days - 1)

  const year = start.getFullYear()
  const month = String(start.getMonth() + 1).padStart(2, '0')
  const day = String(start.getDate()).padStart(2, '0')

  return `${year}-${month}-${day}`
})

// Format Date
const formatDate = (date) => {
  if (!date) return ''

  return new Date(`${date}T00:00:00`).toLocaleDateString('en-US', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

const activeQuestion = computed(() => questions[currentStep.value])
const progress = computed(() =>
  Math.round(((currentStep.value) / questions.length) * 100)
)

const isSelected = (key, option) => {
  const value = answers[key]
  if (Array.isArray(value)) return value.includes(option)
  return value === option
}

const selectOption = (key, option, type, exclusive = []) => {
  if (type === 'single') {
    answers[key] = option
    return
  }

  const selected = answers[key]
  if (exclusive.includes(option)) {
    answers[key] = selected.includes(option) ? [] : [option]
    return
  }

  const filtered = selected.filter(item => !exclusive.includes(item))
  if (filtered.includes(option)) {
    answers[key] = filtered.filter(item => item !== option)
  } else {
    answers[key] = [...filtered, option]
  }
}

const isAnswered = computed(() => {
  const question = activeQuestion.value
  const value = answers[question.key]

  if (question.type === 'single') {
    if (!value) return false
    if (value === 'Other') {
      const otherKey = question.key + 'Other'
      return Boolean(answers[otherKey].trim())
    }
    return true
  }

  if (question.type === 'multiple') {
    if (!value.length) return false
    if (value.includes('Other')) {
      const otherKey = question.key === 'nutritionFocus'
        ? 'nutritionOther'
        : question.key === 'dietaryPatterns'
          ? 'dietaryOther'
          : question.key === 'allergies'
            ? 'allergyOther'
            : 'cuisineOther'

      return Boolean(answers[otherKey].trim())
    }
    return true
  }

  if (question.type === 'text') {
    // This question is optional.
    return true
  }

  if (question.type === 'budget') {
    return Number(answers.budgetAmount) > 0 && Boolean(answers.budgetPeriod)
  }

  if (question.type === 'duration') {
    const days = Number(answers.duration)

    return (
      Boolean(answers.startDate) &&
      answers.startDate >= minStartDate.value &&
      Number.isInteger(days) &&
      days >= 1 &&
      days <= 30 &&
      Boolean(endDate.value)
    )
  }
  return Boolean(value)
})



const nextStep = async () => {
  if (!isAnswered.value) return

  if (currentStep.value < questions.length - 1) {
    currentStep.value++
    scrollToTop()
    return
  }

  try {
    const session = JSON.parse(
      localStorage.getItem('leaflow-session')
    )

    if (!session?.access_token) {
      alert('Session expired. Please log in again.')
      router.push('/login')
      return
    }

    const questionnaireData = {
      ...answers,
      endDate: endDate.value,
    }

    const editingId = localStorage.getItem(
      'leaflowEditingMealPlanId'
    )

    const endpoint = editingId
      ? `http://localhost:5000/api/planner/${editingId}`
      : 'http://localhost:5000/api/planner'

    const response = await fetch(endpoint, {
      method: editingId ? 'PATCH' : 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${session.access_token}`,
      },
      body: JSON.stringify(questionnaireData),
    })

    const result = await response.json()

    if (!response.ok) {
      throw new Error(result.message || 'Failed to save meal plan.')
    }

    localStorage.setItem(
      'leaflowQuestionnaire',
      JSON.stringify(questionnaireData)
    )

    localStorage.setItem(
      'leaflowMealPlan',
      JSON.stringify(result.data)
    )

    if (editingId) {
      localStorage.removeItem('leaflowEditingMealPlanId')
    }

    router.push('/dashboard/planner/result')
  } catch (error) {
    console.error('Save meal plan error:', error)
    alert(error.message || 'Something went wrong.')
  }
}

const previousStep = () => {
  if (currentStep.value > 0) {
    currentStep.value--
    scrollToTop()
  } else {
    router.push('/dashboard/planner')
  }
}

const otherKey = computed(() => {
  const key = activeQuestion.value.key

  const mapping = {
    goal: 'goalOther',
    nutritionFocus: 'nutritionOther',
    dietaryPatterns: 'dietaryOther',
    allergies: 'allergyOther',
    cuisine: 'cuisineOther',
  }

  return mapping[key] || ''
})

const showExitConfirmation = ref(false)

const openExitConfirmation = () => {
  showExitConfirmation.value = true
}

const closeExitConfirmation = () => {
  showExitConfirmation.value = false
}

const leavePlanner = () => {
  router.push('/dashboard/planner')
}
</script>

<template>
  <div class="flex h-screen flex-col overflow-hidden">
    <!-- Top Section -->
    <header class="shrink-0 bg-white px-5 pt-5 sm:px-6">
      <div class="mx-auto flex w-full max-w-5xl justify-end">
        <button
        type="button"
        @click="openExitConfirmation"
        aria-label="Close questionnaire"
        class="flex h-9 w-9 items-center justify-center rounded-full border border-gray-200 text-gray-500 transition hover:border-red-300 hover:bg-red-50 hover:text-red-500"
        >
        <X :size="17" :stroke-width="1.5" />
        </button>
      </div>
    </header>
    <!-- Sticky Progress -->
    <div class="z-10 shrink-0 bg-white px-5 pb-5 pt-3 sm:px-6">
      <div class="mx-auto w-full max-w-4xl">

        <div class="mb-3 flex items-center justify-between gap-3">
          <span class="text-sm font-regular text-(--color-hover)">
            Step {{ currentStep + 1 }} of {{ questions.length }}
          </span>

          <span class="text-sm font-regular text-(--color-hover)">
            {{ progress }}% Complete
          </span>
        </div>

        <div class="h-2 w-full overflow-hidden rounded-full bg-gray-100">
          <div
            class="h-full rounded-full transition-all duration-300"
            style="background: linear-gradient(270deg, #90D68D 0%, #7BC988 25%, #66BB83 50%)"
            :style="{ width: `${progress}%` }"
          ></div>
        </div>

      </div>
    </div>

    <!-- Scrollable Question Content -->
    <main ref="questionContainer" class="min-h-0 flex-1 overflow-y-auto px-5 sm:px-6">
      <div class="mx-auto w-full max-w-3xl py-5">

        <!-- Question -->
        <div class="min-h-[390px]">
          <div class="mb-6">
            <h2 class="text-lg font-semibold leading-snug text-(--color-text) sm:text-2xl">
              {{ activeQuestion.title }}
            </h2>

            <p class="mt-2 text-sm leading-relaxed text-gray-500">
              {{ activeQuestion.description }}
            </p>
          </div>

          <!-- Single / Multiple Choice -->
          <div
            v-if="activeQuestion.type === 'single' || activeQuestion.type === 'multiple'"
            class="space-y-3"
          >
            <button
              v-for="option in activeQuestion.options"
              :key="option"
              type="button"
              @click="selectOption(
                activeQuestion.key,
                option,
                activeQuestion.type,
                activeQuestion.exclusive || []
              )"
              class="flex w-full items-center justify-between gap-3 rounded-lg border px-4 py-3.5 text-left transition"
              :class="isSelected(activeQuestion.key, option)
                ? 'border-(--color-primary) bg-[#F2FAF2]'
                : 'border-gray-200 bg-white hover:border-(--color-primary) hover:bg-[#F2FAF2]'"
            >
              <span
                class="text-sm font-reguler"
                :class="isSelected(activeQuestion.key, option)
                  ? 'text-(--color-text)'
                  : 'text-gray-500'"
              >
                {{ option }}
              </span>

              <span
                v-if="activeQuestion.type === 'single'"
                class="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border"
                :class="isSelected(activeQuestion.key, option)
                  ? 'border-[#66BB83] bg-(--color-primary)'
                  : 'border-gray-300'"
              >
                <span
                  v-if="isSelected(activeQuestion.key, option)"
                  class="h-2 w-2 rounded-full bg-white"
                ></span>
              </span>

              <span
                v-else
                class="flex h-5 w-5 shrink-0 items-center justify-center rounded border"
                :class="isSelected(activeQuestion.key, option)
                  ? 'border-[#66BB83] bg-[#66BB83] text-white'
                  : 'border-gray-300 bg-white'"
              >
                <Check v-if="isSelected(activeQuestion.key, option)" :size="14" />
              </span>
            </button>

            <!-- Other Input -->
            <div
              v-if="
                activeQuestion.options.includes('Other') &&
                answers[activeQuestion.key].includes('Other')
              "
              class="pt-2"
            >
              <label class="mb-2 block text-sm font-medium text-(--color-text)">
                Please specify
              </label>

              <input
                v-model="answers[otherKey]"
                type="text"
                placeholder="Type your answer here..."
                class="w-full rounded-lg border border-gray-200 px-4 py-3 text-sm outline-none transition focus:border-(--color-primary) focus:ring-2 focus:ring-(--color-primary)/10"
              />
            </div>
          </div>

          <!-- Text -->
          <div v-else-if="activeQuestion.type === 'text'">
            <textarea
              v-model="answers.dislikedFoods"
              rows="5"
              :placeholder="activeQuestion.placeholder"
              class="w-full resize-none rounded-lg border border-gray-200 px-4 py-3 text-sm outline-none transition focus:border-[#66BB83] focus:ring-2 focus:ring-(--color-primary)/10"
            ></textarea>

            <p class="mt-2 text-xs text-gray-400">
              This question is optional. You can leave it blank if you have no preferences.
            </p>
          </div>

          <!-- Budget -->
          <div v-else-if="activeQuestion.type === 'budget'" class="space-y-5">
            <div>
              <label class="mb-2 block text-sm font-medium text-(--color-text)">
                Budget Amount (IDR)
              </label>

              <div class="flex items-center rounded-lg border border-gray-200 px-4 focus-within:border-[#66BB83] focus-within:ring-2 focus-within:ring-(--color-primary)/10">
                <span class="text-sm font-reguler text-gray-500">Rp</span>

                <input
                  v-model="formattedBudget"
                  type="text"
                  placeholder="e.g. 50.000"
                  class="w-full border-0 px-3 py-3 text-sm outline-none"
                />
              </div>
            </div>

            <div>
              <label class="mb-2 block text-sm font-medium text-(--color-text)">
                Budget Period
              </label>

              <div class="grid grid-cols-3 gap-3">
                <button
                  v-for="period in ['Per Day', 'Per Week', 'Per Month']"
                  :key="period"
                  type="button"
                  @click="answers.budgetPeriod = period"
                  class="rounded-lg border px-3 py-3 text-sm font-reguler transition"
                  :class="answers.budgetPeriod === period
                    ? 'border-[#66BB83] bg-[#F2FAF2] text-(--color-text)'
                    : 'border-gray-200 text-gray-500 hover:border-[#90D68D]'"
                >
                  {{ period }}
                </button>
              </div>
            </div>
          </div>
          <!-- Duration -->
          <div v-else-if="activeQuestion.type === 'duration'" class="space-y-7">
            <div>
              <label class="mb-2 block text-sm font-medium text-(--color-text)">
                Duration
              </label>
              <div class="flex items-center gap-3">
                <input
                  v-model="answers.duration"
                  type="number"
                  min="1"
                  max="30"
                  step="1"
                  placeholder="e.g. 7"
                  class="w-full rounded-lg border border-gray-200 px-4 py-3 text-sm outline-none transition focus:border-(--color-primary) focus:ring-2 focus:ring-(--color-primary)/10"
                />

                <span class="text-sm font-medium text-gray-500">
                  Days
                </span>
              </div>
              <p class="mt-2 text-xs text-gray-400">
                You can create a meal plan for 1 to 30 days.
              </p>
            </div>
            <!-- Start Date -->
            <div>
              <label class="mb-2 block text-sm font-medium text-(--color-text)">
                Start Date
              </label>
              <input
                v-model="answers.startDate"
                type="date"
                :min="minStartDate"
                class="w-full rounded-lg border border-gray-200 px-4 py-3 text-sm  outline-none transition focus:border-(--color-primary) focus:ring-2 focus:ring-(--color-primary)/10"
              />
              <p class="mt-2 text-xs text-gray-400">
                Choose when you want your meal plan to begin.
              </p>
            </div>
            <!-- End Date Preview -->
            <div
              v-if="endDate"
              class="rounded-xl border border-(--color-primary)/20 bg-(--color-primary)/5 p-4"
            >
              <div class="flex items-center justify-between gap-3">
                <div>
                  <p class="text-sm font-semibold text-(--color-text)">
                    {{ formatDate(answers.startDate) }}
                  </p>
                  <p class="mt-1 text-xs text-gray-500">Start Date</p>
                </div>
                <ChevronRight :size="18" class="shrink-0 text-(--color-primary)" />
                <div class="text-right">
                  <p class="text-sm font-semibold text-(--color-text)">
                    {{ formatDate(endDate) }}
                  </p>
                  <p class="mt-1 text-xs text-gray-500">End Date</p>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </main>

    <!-- Sticky Bottom Navigation -->
    <footer class="z-10 shrink-0 border-t border-gray-100 bg-white px-5 py-4 sm:px-6">
      <div class="mx-auto flex w-full max-w-4xl items-center justify-between">

        <button
          type="button"
          @click="previousStep"
          class="inline-flex items-center gap-2 rounded-lg border border-gray-200 px-4 py-2.5 text-xs font-reguler text-gray-600 transition hover:bg-gray-50"
        >
          <ChevronLeft :stroke-width="1" :size="17" />
          Previous
        </button>

        <button
          type="button"
          @click="nextStep"
          :disabled="!isAnswered"
          class="inline-flex items-center gap-2 rounded-lg bg-(--color-primary) px-5 py-2.5 text-sm font-medium text-white transition hover:bg-(--color-hover) disabled:cursor-not-allowed disabled:opacity-40"
        >
          {{ currentStep === questions.length - 1 ? 'Finish' : 'Next' }}
          <ChevronRight v-if="currentStep !== questions.length - 1" :size="17" />
        </button>

      </div>
    </footer>

    <!-- Exit Confirmation Modal -->
    <Teleport to="body">
    <div
        v-if="showExitConfirmation"
        class="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 px-5"
        @click.self="closeExitConfirmation"
    >
        <div
        class="w-full max-w-sm rounded-xl bg-white p-10 shadow-xl"
        @click.stop
        >
        <!-- Message -->
        <h3 class="text-lg font-semibold text-(--color-text) text-center">
            Leave questionnaire?
        </h3>

        <p class="mt-2 text-center text-sm leading-relaxed text-gray-500">
            Are you sure you want to leave? Your progress and answers will not be saved.
        </p>

        <!-- Actions -->
        <div class="flex items-center justify-center mt-6 gap-3">
            <button
            type="button"
            @click.stop="closeExitConfirmation"
            class="rounded-lg border border-gray-200 px-4 py-2.5 text-sm font-medium text-gray-600 transition hover:bg-gray-50"
            >
            Stay
            </button>

            <button
            type="button"
            @click.stop="leavePlanner"
            class="rounded-lg bg-red-500 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-red-600"
            >
            Leave
            </button>
        </div>
        </div>
    </div>
    </Teleport>
  </div>
</template>
