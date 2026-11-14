<script setup>
import { ref, computed, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { CalendarDays, Pencil, Check, Clock3, Flame, Utensils, X, } from 'lucide-vue-next'

const router = useRouter()

// Get saved meal plan data
const savedMealPlan = JSON.parse(
  localStorage.getItem('leaflowMealPlan') || 'null'
)
const startDate = ref(savedMealPlan?.start_date || '')
const duration = ref(Number(savedMealPlan?.duration || 0))
const planDays = ref([])
const isGenerating = ref(false)
const generateError = ref('')

const showApproveModal = ref(false)
const showMealModal = ref(false)
const selectedMeal = ref(null)
const showPreviewModal = ref(false)
const previewMeal = ref(null)

const openMealModal = (meal) => {
  selectedMeal.value = meal
  showMealModal.value = true
}

const closeMealModal = () => {
  showMealModal.value = false
  selectedMeal.value = null
}

// Generate meal plan using Gemini
const generateMealPlan = async () => {
  try {
    isGenerating.value = true
    generateError.value = ''

    const session = JSON.parse(
      localStorage.getItem('leaflow-session') || 'null'
    )

    const questionnaireAnswers =
      savedMealPlan?.questionnaire_answers ||
      JSON.parse(localStorage.getItem('leaflowQuestionnaire') || '{}')

    if (!session?.access_token) {
      throw new Error('Your session has expired. Please log in again.')
    }

    if (!startDate.value || !duration.value) {
      throw new Error('Meal plan information is incomplete.')
    }

    const response = await fetch(
      'http://localhost:5000/api/planner/generate',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          questionnaireAnswers,
          duration: duration.value,
          startDate: startDate.value,
        }),
      }
    )

    const result = await response.json()

    if (!response.ok) {
      throw new Error(result.message || 'Failed to generate meal plan.')
    }

    const generatedMeals = result.data.meals

    // Create daily timeline
    const start = new Date(`${startDate.value}T00:00:00`)

    planDays.value = Array.from(
      { length: duration.value },
      (_, index) => {
        const date = new Date(start)
        date.setDate(start.getDate() + index)

        const formattedDate = formatLocalDate(date)

        const dailyMeals = generatedMeals
          .filter(meal => meal.date === formattedDate)
          .map(meal => ({
            ...meal,
            id: `${formattedDate}-${meal.mealType}`,
            type: meal.mealType,
            time: meal.preparationTime,
            emoji: '🍽️',
            isEmpty: false,
          }))

        return {
          id: index + 1,
          date,
          formattedDate: date.toLocaleDateString('en-US', {
            weekday: 'long',
            day: 'numeric',
            month: 'long',
            year: 'numeric',
          }),
          meals: dailyMeals,
        }
      }
    )

  } catch (error) {
    console.error('Generate meal plan error:', error)
    generateError.value = error.message
  } finally {
    isGenerating.value = false
  }
}

onMounted(() => {
  generateMealPlan()
})

const formattedDateRange = computed(() => {
  if (!planDays.value.length) return ''

  const firstDate = planDays.value[0].date
  const lastDate = planDays.value[planDays.value.length - 1].date

  const format = (date) =>
    date.toLocaleDateString('en-US', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    })

  return `${format(firstDate)} – ${format(lastDate)}`
})

// Return to questionnaire

const editAnswers = () => {
  const savedMealPlan = JSON.parse(
    localStorage.getItem('leaflowMealPlan')
  )

  if (savedMealPlan?.id) {
    localStorage.setItem(
      'leaflowEditingMealPlanId',
      savedMealPlan.id
    )
  }

  router.push('/dashboard/planner/create')
}

// Open approval confirmation
const openApproveModal = () => {
  showApproveModal.value = true
}

const closeApproveModal = () => {
  showApproveModal.value = false
}

// Format date using local timezone
const formatLocalDate = (date) => {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')

  return `${year}-${month}-${day}`
}

// Approve and save meal plan

const approveMealPlan = async () => {
  try {
    const session = JSON.parse(
      localStorage.getItem('leaflow-session') || 'null'
    )

    if (!session?.access_token) {
      throw new Error('Your session has expired. Please log in again.')
    }

    if (!savedMealPlan?.id) {
      throw new Error('Meal plan ID not found. Please try again.')
    }

    const approvedPlan = {
      startDate: startDate.value,
      duration: duration.value,
      endDate: planDays.value.length
        ? formatLocalDate(
            planDays.value[planDays.value.length - 1].date
          )
        : null,
      days: planDays.value.map((day) => ({
        id: day.id,
        date: formatLocalDate(day.date),
        formattedDate: day.formattedDate,
        meals: day.meals,
      })),
      approvedAt: new Date().toISOString(),
    }

    // Save meals to Supabase
    const response = await fetch(
      `http://localhost:5000/api/planner/${savedMealPlan.id}/meals`,
      {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          days: approvedPlan.days,
        }),
      }
    )

    const result = await response.json()

    if (!response.ok) {
      throw new Error(result.message || 'Failed to save meal plan.')
    }

    // Save approved plan locally
    localStorage.setItem(
      'leaflowApprovedPlan',
      JSON.stringify(approvedPlan)
    )

    closeApproveModal()
    router.push('/dashboard/planner')

  } catch (error) {
    console.error('Approve meal plan error:', error)
    alert(error.message)
  }
}

const deleteMeal = () => {
  if (!selectedMeal.value) return

  selectedMeal.value.isEmpty = true
  selectedMeal.value.name = ''
  selectedMeal.value.calories = 0
  selectedMeal.value.time = ''
  selectedMeal.value.emoji = '＋'

  closeMealModal()
}

const showChangeModal = ref(false)
const changePrompt = ref('')
const submittedPrompt = ref('')

const openChangeModal = (meal) => {
  selectedMeal.value = meal
  changePrompt.value = ''
  showMealModal.value = false
  showChangeModal.value = true
}

const closeChangeModal = () => {
  showChangeModal.value = false
  changePrompt.value = ''
}

const saveMealPrompt = async () => {
  if (!changePrompt.value.trim() || !selectedMeal.value) return

  try {
    isGenerating.value = true
    generateError.value = ''

    submittedPrompt.value = changePrompt.value.trim()

    const session = JSON.parse(
      localStorage.getItem('leaflow-session') || 'null'
    )

    const questionnaireAnswers =
      savedMealPlan?.questionnaire_answers ||
      JSON.parse(localStorage.getItem('leaflowQuestionnaire') || '{}')

    const response = await fetch(
      'http://localhost:5000/api/planner/generate',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          questionnaireAnswers,
          duration: 1,
          startDate: selectedMeal.value.date,
          customRequest: submittedPrompt.value,
          mealType: selectedMeal.value.type,
          currentMeal: selectedMeal.value.name,
        }),
      }
    )

    const result = await response.json()

    if (!response.ok) {
      throw new Error(result.message || 'Failed to generate meal.')
    }

    const generatedMeal = result.data.meals[0]

    if (!generatedMeal) {
      throw new Error('No meal was generated.')
    }

    previewMeal.value = {
      ...generatedMeal,
      type: generatedMeal.mealType,
      time: generatedMeal.preparationTime,
      emoji: '🍽️',
      isEmpty: false,
    }

    showChangeModal.value = false
    showPreviewModal.value = true

  } catch (error) {
    console.error('Change meal error:', error)
    generateError.value = error.message
  } finally {
    isGenerating.value = false
  }
}

const acceptPreviewMeal = () => {
  if (!selectedMeal.value || !previewMeal.value) return

  Object.assign(selectedMeal.value, {
    ...previewMeal.value,
    isEmpty: false,
  })

  showPreviewModal.value = false
  previewMeal.value = null
  selectedMeal.value = null
}

const cancelPreviewMeal = () => {
  showPreviewModal.value = false
  previewMeal.value = null
  selectedMeal.value = null
}

const tryAgainMeal = async () => {
  if (!selectedMeal.value || !previewMeal.value) return

  try {
    isGenerating.value = true
    generateError.value = ''

    const session = JSON.parse(
      localStorage.getItem('leaflow-session') || 'null'
    )

    const questionnaireAnswers =
      savedMealPlan?.questionnaire_answers ||
      JSON.parse(localStorage.getItem('leaflowQuestionnaire') || '{}')

    const response = await fetch(
      'http://localhost:5000/api/planner/generate',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          questionnaireAnswers,
          duration: 1,
          startDate: selectedMeal.value.date,
          customRequest: submittedPrompt.value,
          mealType: selectedMeal.value.type,
          currentMeal: previewMeal.value.name,
        }),
      }
    )

    const result = await response.json()

    if (!response.ok) {
      throw new Error(result.message || 'Failed to generate another meal.')
    }

    const generatedMeal = result.data.meals[0]

    if (!generatedMeal) {
      throw new Error('No alternative meal was generated.')
    }

    previewMeal.value = {
      ...generatedMeal,
      type: generatedMeal.mealType,
      time: generatedMeal.preparationTime,
      emoji: '🍽️',
      isEmpty: false,
    }

  } catch (error) {
    console.error('Try again meal error:', error)
    generateError.value = error.message
  } finally {
    isGenerating.value = false
  }
}
</script>

<template>
  <main class="min-h-screen bg-white px-5 py-7 sm:px-8 lg:px-10">

    <div class="mx-auto max-w-7xl">

      <!-- Page Header -->
      <header class="mb-8">

        <div class="flex flex-col justify-between gap-5 sm:flex-row sm:items-center">

          <div>
            <h1 class="text-2xl font-semibold text-(--color-text)">
              Your {{ duration }}-day meal plan
            </h1>

            <div class="mt-2 flex items-center gap-2 text-sm text-gray-500">
              <CalendarDays :size="16" />
              <span>{{ formattedDateRange }}</span>
            </div>
          </div>

          <!-- Header Actions -->
          <div class="flex flex-wrap gap-2">

            <button
              @click="editAnswers"
              class="flex items-center justify-center gap-2 rounded-lg border border-(--color-primary) px-4 py-2.5 text-sm font-medium text-(--color-primary) transition hover:bg-(--color-primary)/5"
            >
              <Pencil :size="15" />
              Edit Answers
            </button>

            <button
              @click="openApproveModal"
              class="flex items-center justify-center gap-2 rounded-lg bg-(--color-primary) px-4 py-2.5 text-sm font-medium text-white transition hover:bg-(--color-hover)"
            >
              <Check :size="16" />
              Approve Plan
            </button>

          </div>
        </div>

        <!-- Plan Information -->
        <div class="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3">

          <div class="rounded-xl border border-gray-100 bg-white p-4">
            <p class="text-xs text-gray-500">Duration</p>
            <p class="mt-1 text-lg font-semibold text-(--color-text)">
              {{ duration }} Days
            </p>
          </div>

          <div class="rounded-xl border border-gray-100 bg-white p-4">
            <p class="text-xs text-gray-500">Total Days</p>
            <p class="mt-1 text-lg font-semibold text-(--color-text)">
              {{ planDays.length }} Days
            </p>
          </div>

          <div class="col-span-2 rounded-xl border border-gray-100 bg-white p-4 sm:col-span-1">
            <p class="text-xs text-gray-500">Plan Status</p>
            <p class="mt-1 text-lg font-semibold text-(--color-primary)">
              Preview
            </p>
          </div>

        </div>
      </header>

      <!-- Loading State -->
      <div
        v-if="isGenerating"
        class="flex flex-col items-center justify-center py-20 text-center"
      >
        <div
          class="mb-4 size-10 animate-spin rounded-full border-4 border-[#E5F4E5] border-t-[#66BB6A]"
        ></div>

        <h2 class="font-semibold text-[#063B00]">
          Creating Your Meal Plan
        </h2>

        <p class="mt-2 text-sm text-gray-500">
          Please wait while we prepare meals based on your preferences.
        </p>
      </div>

      <!-- Error State -->
      <div
        v-else-if="generateError"
        class="rounded-xl border border-red-100 bg-red-50 px-6 py-8 text-center"
      >
        <p class="font-medium text-red-600">
          Unable to Generate Meal Plan
        </p>

        <p class="mt-2 text-sm text-gray-500">
          {{ generateError }}
        </p>

        <button
          @click="generateMealPlan"
          class="mt-4 rounded-lg bg-[#66BB6A] px-5 py-2.5 text-sm font-medium text-white transition hover:bg-[#4CAF50]"
        >
          Try Again
        </button>
      </div>

      <!-- Daily Timeline -->
      <section v-else class="relative">
        <div
          v-for="day in planDays"
          :key="day.id"
          class="relative pb-9 pl-8 sm:pl-10"
        >

          <!-- Timeline Line -->
          <div
            class="absolute bottom-0 left-[7px] top-2 w-px bg-(--color-primary)/50"
            :class="day.id === planDays.length ? 'hidden' : ''"
          ></div>

          <!-- Timeline Dot -->
          <div
            class="absolute left-0 top-1.5 flex size-4 items-center justify-center rounded-full bg-(--color-primary) ring-4 ring-white"
          ></div>

          <!-- Date Heading -->
          <div class="mb-4 flex items-center justify-between gap-2">
            <h2 class="text-base font-semibold text-(--color-text)">
              {{ day.formattedDate }}
            </h2>

            <span class="shrink-0 text-xs text-gray-400">
              Day {{ day.id }}
            </span>
          </div>

        <!-- Responsive Meal Cards -->
        <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">

        <article
            v-for="meal in day.meals"
            :key="meal.type"
            @click="meal.isEmpty ? openChangeModal(meal) : openMealModal(meal)"
            class="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-md"
            :class="meal.isEmpty ? 'cursor-pointer' : 'cursor-pointer'"
        >

            <!-- Empty Meal Card -->
            <div
            v-if="meal.isEmpty"
            class="flex min-h-[180px] flex-col items-center justify-center rounded-xl border-2 border-dashed border-[#B8DDBA] bg-[#F8FCF8] transition hover:bg-[#F1F8F1]"
            >
            <div class="mb-3 flex h-11 w-11 items-center justify-center rounded-full bg-[#E5F4E5] text-2xl text-[#66BB6A]">
                +
            </div>

            <p class="font-medium text-[#66BB6A]">
                Add Meal
            </p>

            <p class="mt-1 text-xs text-gray-400">
                Add a meal to this slot
            </p>
            </div>

            <!-- Filled Meal Card -->
            <template v-else>

            <!-- Image Placeholder -->
            <div class="flex h-32 items-center justify-center bg-gradient-to-br from-[#E8F5E9] to-[#C8E6C9]">
                 <img
                    v-if="meal.imageUrl"
                    :src="meal.imageUrl"
                    :alt="meal.name"
                    class="h-full w-full object-cover"
                    loading="lazy"
                />
                <div
                    v-else
                    class="flex h-full items-center justify-center"
                >
                    <Utensils :size="36" class="text-[#66BB6A]" />
                </div>
            </div>

            <!-- Meal Information -->
            <div class="p-4">

                <p class="mb-1 text-xs font-medium text-(--color-primary)">
                {{ meal.type }}
                </p>

                <h3 class="min-h-10 text-sm font-semibold text-(--color-text)">
                {{ meal.name }}
                </h3>

                <div class="mt-3 flex flex-wrap items-center gap-x-3 gap-y-2 text-xs text-gray-500">

                <span class="flex items-center gap-1">
                    <Flame :size="14" />
                    {{ meal.calories }} kcal
                </span>

                <span class="flex items-center gap-1">
                    <Clock3 :size="14" />
                    {{ meal.time }}
                </span>

                </div>
            </div>

            </template>
        </article>
        </div>
        </div>
      </section>

      <!-- End of Plan -->
      <div class="mt-2 rounded-xl bg-[#F3F9F3] px-5 py-8 text-center">

        <div class="mx-auto flex size-12 items-center justify-center rounded-full bg-[#DDF0DD]">
          <Check :size="23" class="text-(--color-primary)" />
        </div>

        <h3 class="mt-3 font-semibold text-(--color-text)">
          You've reached the end of your meal plan!
        </h3>

        <p class="mt-1 text-sm text-gray-500">
          Review your meals before approving your plan.
        </p>

      </div>

    </div>

    <!-- Approve Confirmation Modal -->
    <Teleport to="body">
      <div
        v-if="showApproveModal"
        class="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 px-4"
        @click.self="closeApproveModal"
      >

        <div class="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">

          <div class="flex items-center justify-between">
            <div class="flex size-12 items-center justify-center rounded-full bg-[#E8F5E9]">
              <Check :size="24" class="text-(--color-primary)" />
            </div>

            <button
              @click="closeApproveModal"
              class="rounded-full p-2 text-gray-400 transition hover:bg-gray-100"
              aria-label="Close confirmation"
            >
              <X :size="20" />
            </button>
          </div>

          <h2 class="mt-4 text-xl font-semibold text-(--color-text)">
            Approve Your Meal Plan?
          </h2>

          <p class="mt-2 text-sm leading-relaxed text-gray-500">
            Are you sure you want to approve this meal plan?
            Your plan will be saved and added to your Calendar.
          </p>

          <p class="mt-3 rounded-lg bg-[#F3F9F3] p-3 text-xs text-gray-500">
            The approval and Supabase saving process will be connected in a later step.
          </p>

          <div class="mt-6 flex gap-3">

            <button
              @click="closeApproveModal"
              class="flex-1 rounded-lg border border-gray-200 px-4 py-3 text-sm font-medium text-gray-600 transition hover:bg-gray-50"
            >
              Cancel
            </button>

            <button
              @click="approveMealPlan"
              class="flex-1 rounded-lg bg-(--color-primary) px-4 py-3 text-sm font-medium text-white transition hover:bg-(--color-hover)"
            >
              Got it
            </button>

          </div>

        </div>
      </div>
      <!-- Meal Detail Modal -->
        <div
        v-if="showMealModal && selectedMeal"
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
        @click.self="closeMealModal"
        >
        <div class="w-full max-w-lg rounded-xl bg-white p-6 shadow-xl">

            <div class="mb-5 flex items-center justify-between">
            <h2 class="text-xl font-semibold text-[#063B00]">
                Meal Details
            </h2>

            <button
                @click="closeMealModal"
                class="rounded-full p-2 text-gray-500 transition hover:bg-gray-100"
            >
                <X :size="20" />
            </button>
            </div>

            <div class="mb-5 flex h-40 items-center justify-center rounded-xl bg-[#F1F8F1] text-7xl">
              <img
                v-if="selectedMeal.imageUrl"
                :src="selectedMeal.imageUrl"
                :alt="selectedMeal.name"
                class="h-full w-full object-cover"
                loading="lazy"
              />
              <div
                v-else
                class="flex h-full items-center justify-center"
              >
                <Utensils :size="48" class="text-[#66BB6A]" />
              </div>
            </div>

            <p class="mb-1 text-sm font-medium text-[#66BB6A]">
            {{ selectedMeal.type }}
            </p>

            <h3 class="mb-4 text-xl font-semibold text-[#063B00]">
            {{ selectedMeal.name }}
            </h3>

            <div class="mb-6 grid grid-cols-3 gap-3">
            <div class="rounded-lg bg-[#F6F9F6] p-3">
                <p class="text-sm text-gray-500">Calories</p>
                <p class="font-semibold text-[#063B00]">
                {{ selectedMeal.calories }} kcal
                </p>
            </div>

            <div class="rounded-lg bg-[#F6F9F6] p-3">
                <p class="text-sm text-gray-500">Preparation Time</p>
                <p class="font-semibold text-[#063B00]">
                {{ selectedMeal.time }}
                </p>
            </div>
            <div class="rounded-lg bg-[#F6F9F6] p-3">
                <p class="text-sm text-gray-500">Estimated Cost</p>
                <p class="font-semibold text-[#063B00]">
                    {{ selectedMeal.estimatedCost?.toLocaleString('id-ID') || 0 }}
                    IDR
                </p>
            </div>
            </div>

            <div class="flex gap-3">
            <button
                @click="deleteMeal"
                class="flex-1 rounded-lg border border-red-200 py-3 font-medium text-red-500 transition hover:bg-red-50"
            >
                Delete Meal
            </button>

            <button
                @click="closeMealModal"
                class="flex-1 rounded-lg border border-gray-300 py-3 font-medium text-gray-600 transition hover:bg-gray-50"
            >
                Close
            </button>

            <button
            @click="openChangeModal(selectedMeal)"
            class="flex-1 rounded-lg bg-[#66BB6A] py-3 font-medium text-white transition hover:bg-[#4CAF50]"
            >
                Change Meal
            </button>
            </div>

        </div>
        </div>
    </Teleport>

    <!-- Change / Add Meal Modal -->
    <Teleport to="body">
    <div
        v-if="showChangeModal"
        class="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 p-4"
        @click.self="closeChangeModal"
    >
        <div class="w-full max-w-lg rounded-xl bg-white p-6 shadow-xl">

        <div class="mb-5 flex items-center justify-between">
            <h2 class="text-xl font-semibold text-[#063B00]">
            {{ selectedMeal?.isEmpty ? 'Add a Meal' : 'Change Your Meal' }}
            </h2>

            <button
            @click="closeChangeModal"
            class="rounded-full p-2 text-gray-500 transition hover:bg-gray-100"
            >
            <X :size="20" />
            </button>
        </div>

        <p class="mb-4 text-sm text-gray-500">
            Tell us what kind of meal you would like. You can describe your
            preferred ingredients, taste, or cooking style.
        </p>

        <div class="mb-4 rounded-lg bg-[#F1F8F1] p-3">
            <p class="text-xs text-gray-500">Meal Slot</p>
            <p class="font-semibold text-[#063B00]">
            {{ selectedMeal?.type }}
            </p>
        </div>

        <label class="mb-2 block text-sm font-medium text-[#063B00]">
            Your Meal Request
        </label>

        <textarea
            v-model="changePrompt"
            rows="4"
            placeholder="Example: I want a healthy high-protein meal that is easy to prepare..."
            class="w-full resize-none rounded-lg border border-gray-200 p-3 text-sm outline-none transition focus:border-[#66BB6A] focus:ring-2 focus:ring-[#66BB6A]/20"
        ></textarea>

        <div class="mt-5 flex gap-3">
            <button
            @click="closeChangeModal"
            class="flex-1 rounded-lg border border-gray-300 py-3 font-medium text-gray-600 transition hover:bg-gray-50"
            >
            Cancel
            </button>

            <button
            @click="saveMealPrompt"
            :disabled="!changePrompt.trim()"
            class="flex-1 rounded-lg bg-[#66BB6A] py-3 font-medium text-white transition hover:bg-[#4CAF50] disabled:cursor-not-allowed disabled:opacity-50"
            >
            Save Request
            </button>
        </div>

        </div>
    </div>
    </Teleport>

    <!-- Meal Preview Modal -->
    <Teleport to="body">
    <div
        v-if="showPreviewModal && previewMeal"
        class="fixed inset-0 z-[70] flex items-center justify-center bg-black/40 p-4"
        @click.self="cancelPreviewMeal"
    >
        <div class="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-xl bg-white p-6 shadow-xl">

        <!-- Header -->
        <div class="mb-5 flex items-center justify-between">
            <div>
            <p class="text-sm font-medium text-[#66BB6A]">
                Meal Preview
            </p>

            <h2 class="text-xl font-semibold text-[#063B00]">
                Review Your New Meal
            </h2>
            </div>

            <button
            @click="cancelPreviewMeal"
            class="rounded-full p-2 text-gray-500 transition hover:bg-gray-100"
            >
            <X :size="20" />
            </button>
        </div>

        <!-- Image Placeholder -->
        <div class="mb-5 flex h-48 items-center justify-center rounded-xl bg-gradient-to-br from-[#E8F5E9] to-[#C8E6C9]">
          <img
            v-if="previewMeal.imageUrl"
            :src="previewMeal.imageUrl"
            :alt="previewMeal.name"
            class="h-full w-full object-cover"
            loading="lazy"
          />

          <div
            v-else
            class="flex h-full items-center justify-center"
          >
            <Utensils :size="48" class="text-[#66BB6A]" />
          </div>
        </div>

        <!-- Meal Information -->
        <div class="mb-5">
            <p class="mb-1 text-sm font-medium text-[#66BB6A]">
            {{ previewMeal.type }}
            </p>

            <h3 class="text-2xl font-semibold text-[#063B00]">
            {{ previewMeal.name }}
            </h3>

            <div class="mt-4 flex flex-wrap gap-3">

            <div class="flex items-center gap-2 rounded-lg bg-[#F1F8F1] px-4 py-3">
                <Flame :size="18" class="text-[#66BB6A]" />
                <div>
                <p class="text-xs text-gray-500">Calories</p>
                <p class="text-sm font-semibold text-[#063B00]">
                    {{ previewMeal.calories }} kcal
                </p>
                </div>
            </div>

            <div class="flex items-center gap-2 rounded-lg bg-[#F1F8F1] px-4 py-3">
                <Clock3 :size="18" class="text-[#66BB6A]" />
                <div>
                <p class="text-xs text-gray-500">Preparation Time</p>
                <p class="text-sm font-semibold text-[#063B00]">
                    {{ previewMeal.time }}
                </p>
                </div>
            </div>

            </div>
        </div>

        <!-- Ingredients -->
        <div class="mb-5">
            <h4 class="mb-3 font-semibold text-[#063B00]">
            Ingredients
            </h4>

            <ul class="space-y-2">
            <li
                v-for="(ingredient, index) in previewMeal.ingredients"
                :key="index"
                class="flex items-start gap-2 text-sm text-gray-600"
            >
                <Check :size="16" class="mt-0.5 shrink-0 text-[#66BB6A]" />
                {{ ingredient }}
            </li>
            </ul>
        </div>

        <!-- Cooking Instructions -->
        <div class="mb-6">
            <h4 class="mb-3 font-semibold text-[#063B00]">
            Cooking Instructions
            </h4>

            <ol class="space-y-3">
            <li
                v-for="(instruction, index) in previewMeal.instructions"
                :key="index"
                class="flex items-start gap-3 text-sm text-gray-600"
            >
                <span class="flex size-6 shrink-0 items-center justify-center rounded-full bg-[#E5F4E5] text-xs font-semibold text-[#66BB6A]">
                {{ index + 1 }}
                </span>

                {{ instruction }}
            </li>
            </ol>
        </div>

        <!-- Actions -->
        <div class="flex flex-col-reverse gap-3 border-t border-gray-100 pt-5 sm:flex-row sm:justify-between">

            <button
            @click="tryAgainMeal"
            class="rounded-lg border border-[#66BB6A] px-5 py-3 font-medium text-[#66BB6A] transition hover:bg-[#F1F8F1]"
            >
            Try Again
            </button>

            <div class="flex gap-3">
            <button
                @click="cancelPreviewMeal"
                class="flex-1 rounded-lg border border-gray-300 px-5 py-3 font-medium text-gray-600 transition hover:bg-gray-50"
            >
                Cancel
            </button>

            <button
                @click="acceptPreviewMeal"
                class="flex-1 rounded-lg bg-[#66BB6A] px-5 py-3 font-medium text-white transition hover:bg-[#4CAF50]"
            >
                Accept Meal
            </button>
            </div>

        </div>

        </div>
    </div>
    </Teleport>

  </main>
</template>
