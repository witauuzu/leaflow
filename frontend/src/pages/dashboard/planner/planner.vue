<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import HeaderDashboard from '../../../components/header-dashboard.vue'
import MealCard from '../../../components/meal-card.vue'
import plannerIllustration from '../../../assets/images/illustrations/planner-shopping.png'
import { Coffee, Utensils, Moon, Cookie, ChefHat, ChevronLeft, ChevronRight, ChevronDown, GlassWater, ShoppingBasket, ClipboardList, X } from 'lucide-vue-next'

const router = useRouter()
const isLoadingMeals = ref(false)
const mealLoadError = ref('')
const consumptionLogs = ref([])
// Approved Meal Plan
const approvedPlan = ref(
  JSON.parse(localStorage.getItem('leaflowApprovedPlan') || 'null')
)
const savedMealPlanId = computed(() => {
  return JSON.parse(
    localStorage.getItem('leaflowMealPlan') || 'null'
  )?.id || null
})

// Get saved meals from Supabase
const fetchSavedMeals = async () => {
  if (!savedMealPlanId.value) return

  try {
    isLoadingMeals.value = true
    mealLoadError.value = ''

    const session = JSON.parse(
      localStorage.getItem('leaflow-session') || 'null'
    )

    if (!session?.access_token) {
      throw new Error('Your session has expired. Please log in again.')
    }

    const response = await fetch(
      `http://localhost:5000/api/planner/${savedMealPlanId.value}/meals`,
      {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      }
    )

    const result = await response.json()

    console.log('Meals from Supabase:', result.data)
    console.log('First meal ID:', result.data?.[0]?.id)

    if (!response.ok) {
      throw new Error(result.message || 'Failed to load meals.')
    }

    // Group meals by date
    const groupedMeals = {}

    result.data.forEach((meal) => {
      if (!groupedMeals[meal.meal_date]) {
        groupedMeals[meal.meal_date] = []
      }

      groupedMeals[meal.meal_date].push({
        ...meal,
        type: meal.meal_type,
        time: meal.preparation_time,
        plannedTime: meal.planned_time,
        isConsumed: meal.is_consumed,
        imageUrl: meal.image_url,
        imageSource: meal.image_source,
        imagePhotographer: meal.image_photographer,
        imageSourceUrl: meal.image_source_url,
      })
    })

    // Update existing approved plan
    approvedPlan.value = {
      ...approvedPlan.value,
      days: Object.entries(groupedMeals).map(([date, meals]) => ({
        date,
        formattedDate: new Intl.DateTimeFormat('en-US', {
          weekday: 'long',
          month: 'long',
          day: 'numeric',
        }).format(parseLocalDate(date)),
        meals,
      })),
    }

    localStorage.setItem(
      'leaflowApprovedPlan',
      JSON.stringify(approvedPlan.value)
    )

  } catch (error) {
    console.error('Fetch saved meals error:', error)
    mealLoadError.value = error.message
  } finally {
    isLoadingMeals.value = false
  }
}

const hasApprovedPlan = computed(() => {
  return approvedPlan.value !== null
})

// Date Navigation
const parseLocalDate = (dateString) => {
  if (!dateString) return new Date()

  const [year, month, day] = dateString.split('-').map(Number)

  return new Date(year, month - 1, day)
}

const selectedDate = ref(
  approvedPlan.value?.startDate
    ? parseLocalDate(approvedPlan.value.startDate)
    : new Date()
)

const formattedDate = computed(() => {
  return new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  }).format(selectedDate.value)
})

const changeDate = (days) => {
  const newDate = new Date(selectedDate.value)
  newDate.setDate(newDate.getDate() + days)
  selectedDate.value = newDate
}

// Get Selected Plan Day
const selectedPlanDay = computed(() => {
  if (!approvedPlan.value?.days) return null

  const selectedDateString = [
    selectedDate.value.getFullYear(),
    String(selectedDate.value.getMonth() + 1).padStart(2, '0'),
    String(selectedDate.value.getDate()).padStart(2, '0'),
  ].join('-')

  return approvedPlan.value.days.find(
    (day) => day.date === selectedDateString
  ) || null
})


const fetchConsumptionLogs = async () => {
  consumptionLogs.value = []

  if (!savedMealPlanId.value || !selectedPlanDay.value?.date) {
    return
  }

  try {
    const session = JSON.parse(
      localStorage.getItem('leaflow-session') || 'null'
    )

    if (!session?.access_token) {
      throw new Error('Your session has expired. Please log in again.')
    }

    const params = new URLSearchParams({
      mealPlanId: savedMealPlanId.value,
      mealDate: selectedPlanDay.value.date,
    })

    const response = await fetch(
      `http://localhost:5000/api/planner/consumption?${params}`,
      {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      }
    )

    const result = await response.json()

    if (!response.ok) {
      throw new Error(result.message || 'Failed to load consumption logs.')
    }

    consumptionLogs.value = result.data || []

    console.log('Consumption logs:', consumptionLogs.value)
  } catch (error) {
    console.error('Fetch consumption logs error:', error)
  }
}

// Automatically reload logs when selected date changes
watch(selectedPlanDay, () => {
  fetchConsumptionLogs()
}, { immediate: true })

// Get Meals for Selected Date
const selectedMeals = computed(() => {
  if (!selectedPlanDay.value?.meals) return []

  return selectedPlanDay.value.meals
})

// Get Meal Name by Type
const getMealName = (mealType) => {
  const meal = selectedMeals.value.find(
    (item) => item.type.toLowerCase() === mealType.toLowerCase()
  )

  return meal?.name || 'Not planned yet'
}

// Log Different Meal Modal
const showMealEditModal = ref(false)
const selectedMealType = ref('')
const editedMealName = ref('')
const editedMealPortion = ref('')

const editedMealDetails = ref('')
const isSavingMeal = ref(false)
const estimatedNutrition = ref(null)

const openMealEdit = (mealType) => {
  selectedMealType.value = mealType
  editedMealName.value = ''
  editedMealPortion.value = ''
  editedMealDetails.value = ''
  showMealEditModal.value = true
}

const closeMealEdit = () => {
  showMealEditModal.value = false
}


const saveMealEdit = async () => {
  if (!editedMealName.value.trim()) {
    alert('Please enter the food name.')
    return
  }

  if (!editedMealPortion.value.trim()) {
    alert('Please enter the portion.')
    return
  }

  if (isSavingMeal.value) return

  try {
    isSavingMeal.value = true

    const session = JSON.parse(
      localStorage.getItem('leaflow-session') || 'null'
    )

    if (!session?.access_token) {
      throw new Error('Your session has expired. Please log in again.')
    }

    // Step 1: Estimate nutrition using Gemini
    const estimateResponse = await fetch(
      'http://localhost:5000/api/planner/estimate-nutrition',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          mealName: editedMealName.value.trim(),
          portion: editedMealPortion.value.trim(),
          additionalDetails: editedMealDetails.value.trim(),
        }),
      }
    )

    const estimateResult = await estimateResponse.json()

    if (!estimateResponse.ok) {
      throw new Error(
        estimateResult.message || 'Failed to estimate nutrition.'
      )
    }


      estimatedNutrition.value = estimateResult.data

      console.log('Estimated nutrition:', estimatedNutrition.value)

      // Step 2: Get selected meal information
      const mealType =
        selectedMealType.value === 'Snack'
          ? 'Snacks'
          : selectedMealType.value

      const meal = selectedMeals.value.find(
        (item) => item.type.toLowerCase() === mealType.toLowerCase()
      )

      if (!meal) {
        throw new Error('Planned meal not found.')
      }

      // Step 3: Save actual consumed meal
      const saveResponse = await fetch(
        'http://localhost:5000/api/planner/consumption',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({
            mealPlanId: savedMealPlanId.value,
            mealItemId: meal.id,
            mealDate: meal.meal_date,
            mealType,
            mealName: editedMealName.value.trim(),
            portion: editedMealPortion.value.trim(),
            calories: estimatedNutrition.value.calories,
            protein: estimatedNutrition.value.protein,
            carbs: estimatedNutrition.value.carbs,
            fat: estimatedNutrition.value.fat,
          }),
        }
      )

      const saveResult = await saveResponse.json()

      if (!saveResponse.ok) {
        throw new Error(saveResult.message || 'Failed to save consumed meal.')
      }

      console.log('Saved consumed meal:', saveResult.data)

      // Step 4: Close modal after successful save
      closeMealEdit()

      alert('Your consumed meal has been saved successfully.')


  } catch (error) {
    console.error('Estimate nutrition error:', error)
    alert(error.message)
  } finally {
    isSavingMeal.value = false
  }
}

// Meal Details
const mealDetails = computed(() => {
  return selectedMeals.value.map((meal, index) => {
    // Find actual consumed meal for this planned meal
    const actualMeal = [...consumptionLogs.value]
      .reverse()
      .find((log) => log.meal_item_id === meal.id)

    // Use actual meal data when available
    const displayedMeal = actualMeal || meal

    return {
      id: `${selectedPlanDay.value?.date}-${index}`,
      mealIndex: index,
      type: meal.type,
      name: displayedMeal.meal_name || displayedMeal.name,
      plannedTime: meal.plannedTime || '-',
      preparationTime: meal.time || '-',
      calories: displayedMeal.calories || 0,
      protein: displayedMeal.protein || 0,
      carbs: displayedMeal.carbs || 0,
      fat: displayedMeal.fat || 0,
      isConsumed: Boolean(actualMeal) || meal.isConsumed || false,
    }
  })
})

 // Shopping List
const expandedShoppingGroups = ref({})
const checkedShoppingItems = ref(
  JSON.parse(localStorage.getItem('leaflowShoppingCheckedItems') || '{}')
)

const shoppingGroups = computed(() => {
  return selectedMeals.value
    .map((meal, mealIndex) => {
      const groupId = `${selectedPlanDay.value?.date}-${mealIndex}-${meal.name}`

      return {
        id: groupId,
        name: meal.name,
        ingredients: (meal.ingredients || []).map((ingredient) => ({
          id: `${groupId}-${ingredient.name}`,
          name: ingredient.name,
          quantity: ingredient.quantity,
        })),
      }
    })
    .filter((group) => group.ingredients.length > 0)
})

const isShoppingGroupExpanded = (groupId) => {
  if (expandedShoppingGroups.value[groupId] !== undefined) {
    return expandedShoppingGroups.value[groupId]
  }

  return shoppingGroups.value[0]?.id === groupId
}

const toggleShoppingGroup = (groupId) => {
  expandedShoppingGroups.value[groupId] =
    !isShoppingGroupExpanded(groupId)
}

const toggleShoppingItem = (itemId) => {
  checkedShoppingItems.value[itemId] =
    !checkedShoppingItems.value[itemId]

  localStorage.setItem(
    'leaflowShoppingCheckedItems',
    JSON.stringify(checkedShoppingItems.value)
  )
}

// Water Intake
const waterGoal = ref(2000)
const waterIncrement = 250

const waterIntake = ref(0)
const isSavingWater = ref(false)

// Get selected date in YYYY-MM-DD format
const waterDateKey = computed(() => {
  const date = selectedDate.value

  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, '0'),
    String(date.getDate()).padStart(2, '0'),
  ].join('-')
})

// Get water intake from database
const fetchWaterIntake = async () => {
  waterIntake.value = 0

  try {
    const session = JSON.parse(
      localStorage.getItem('leaflow-session') || 'null'
    )

    if (!session?.access_token) {
      throw new Error('Your session has expired. Please log in again.')
    }

    const params = new URLSearchParams({
      intakeDate: waterDateKey.value,
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
  }
}
watch(waterDateKey, () => {
  fetchWaterIntake()
}, { immediate: true })

// Save water intake to database
const saveWaterIntake = async (amount) => {
  if (isSavingWater.value) return

  isSavingWater.value = true

  try {
    const session = JSON.parse(
      localStorage.getItem('leaflow-session') || 'null'
    )

    if (!session?.access_token) {
      throw new Error('Your session has expired. Please log in again.')
    }

    const response = await fetch(
      'http://localhost:5000/api/planner/water-intake',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          intakeDate: waterDateKey.value,
          amountMl: amount,
        }),
      }
    )

    const result = await response.json()

    if (!response.ok) {
      throw new Error(result.message || 'Failed to save water intake.')
    }

    waterIntake.value = result.data.amount_ml
  } catch (error) {
    console.error('Save water intake error:', error)
    alert(error.message)
  } finally {
    isSavingWater.value = false
  }
}

// Add water
const addWater = () => {
  if (isSavingWater.value) return

  saveWaterIntake(
    Math.min(waterIntake.value + waterIncrement, waterGoal.value)
  )
}

// Remove water
const removeWater = () => {
  if (isSavingWater.value) return

  saveWaterIntake(
    Math.max(waterIntake.value - waterIncrement, 0)
  )
}

// Water progress
const waterProgress = computed(() => {
  return Math.min(
    (waterIntake.value / waterGoal.value) * 100,
    100
  )
})

// Toggle Meal Consumption

const toggleMealConsumed = async (mealIndex) => {
  const meal = selectedMeals.value[mealIndex]

  if (!meal || meal.isConsumed) return

  try {
    const session = JSON.parse(
      localStorage.getItem('leaflow-session') || 'null'
    )

    if (!session?.access_token) {
      throw new Error('Your session has expired. Please log in again.')
    }

    if (!meal.id) {
      throw new Error('Meal ID not found.')
    }

    const response = await fetch(
      `http://localhost:5000/api/planner/meals/${meal.id}/consume`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      }
    )

    const result = await response.json()

    if (!response.ok) {
      throw new Error(result.message || 'Failed to mark meal as consumed.')
    }

    // Update local data after database update succeeds
    meal.isConsumed = true

    localStorage.setItem(
      'leaflowApprovedPlan',
      JSON.stringify(approvedPlan.value)
    )

    console.log('Meal consumption saved:', result.data)

  } catch (error) {
    console.error('Toggle meal consumption error:', error)
    alert(error.message)
  }
}

// Navigate to Create Plan
const goToCreatePlan = () => {
  router.push('/dashboard/planner/create')
}

onMounted(() => {
  fetchSavedMeals()
})
</script>

<template>
  <div class="p-7">
    <HeaderDashboard
      title="Plan Your Meals"
      description="Organize your weekly menu, manage ingredients, and stay on budget."
    />

    <!-- Planner Layout -->
    <main
      class="mt-8 grid grid-cols-1 items-stretch gap-[15px] xl:grid-cols-[minmax(0,3fr)_minmax(240px,1fr)]"
    >
      <!-- Left Column -->
      <div class="flex min-w-0 flex-col gap-[15px]">

        <!-- Create My Plan Banner -->
        <section
          class="brand-gradient-horizontal relative flex h-[180px] items-center justify-between overflow-hidden rounded-[10px] px-6"
        >
          <!-- Banner Text -->
          <div class="relative z-10 max-w-[60%]">
            <h2 class="text-xl font-bold leading-snug text-white">
              Design Healthy Meals That Fit Your Lifestyle
            </h2>

            <p class="mt-1 text-xs text-white/90">
              Create a personalized meal plan that works for you.
            </p>

            <button
              @click="goToCreatePlan"
              class="mt-3 flex items-center gap-2 rounded-md bg-white px-4 py-2 text-xs font-medium text-primary transition hover:bg-accent/30"
            >
              <ChefHat :size="14" />
              Create My Plan
            </button>
          </div>

          <!-- Banner Illustration -->
          <div
            class="absolute right-2 top-0 flex h-full w-[38%] items-center justify-center"
          >
            <img
              :src="plannerIllustration"
              alt="Shopping illustration"
              class="p-4 h-[135%] w-full object-contain object-center"
            />
          </div>
        </section>

        <!-- Today's Plate -->
        <section>
          <div class="mb-3 flex items-center justify-between">

            <!-- Title and Date -->
            <div class="flex items-baseline gap-2">
              <span class="text-lg font-semibold text-ink">
                {{ formattedDate }}
              </span>
            </div>

            <!-- Date Navigation -->
            <div class="flex items-center gap-1">
              <button
                @click="changeDate(-1)"
                class="rounded-md p-1 text-ink transition hover:bg-accent"
                aria-label="Previous day"
              >
                <ChevronLeft :size="20" />
              </button>

              <button
                @click="changeDate(1)"
                class="rounded-md p-1 text-ink transition hover:bg-accent"
                aria-label="Next day"
              >
                <ChevronRight :size="20" />
              </button>
            </div>

          </div>

          <!-- Meal Cards -->
          <div class="grid grid-cols-2 gap-[15px] md:grid-cols-4">
            <MealCard title="Breakfast" :icon="Coffee" :meal="getMealName('Breakfast')" @edit="openMealEdit"/>
            <MealCard title="Lunch" :icon="Utensils" :meal="getMealName('Lunch')" @edit="openMealEdit"/>
            <MealCard title="Dinner" :icon="Moon" :meal="getMealName('Dinner')" @edit="openMealEdit"/>
            <MealCard title="Snack" :icon="Cookie" :meal="getMealName('Snacks')" @edit="openMealEdit"/>
          </div>
        </section>

        <!-- Meal Details -->
        <section
          class="flex min-h-[250px] flex-col rounded-[10px] border border-line bg-white p-5"
        >
          <h2 class="text-sm font-semibold text-ink">
            Meal Details
          </h2>

          <div v-if="mealDetails.length" class="mt-4 overflow-x-auto">
            <table class="w-full min-w-[650px] text-left">
              <thead>
                <tr class="border-b border-line text-xs text-muted">
                  <th class="w-10 pb-3 font-medium">Done</th>
                  <th class="pb-3 font-medium">Meal</th>
                  <th class="pb-3 font-medium">Dish Name</th>
                  <th class="pb-3 font-medium">Planned Time</th>
                  <th class="pb-3 font-medium">Calories</th>
                  <th class="pb-3 font-medium">Protein</th>
                </tr>
              </thead>

              <tbody>
                <tr
                  v-for="meal in mealDetails"
                  :key="meal.id"
                  class="border-b border-line last:border-0"
                >
                  <td class="py-3">
                    <input
                      type="checkbox"
                      :checked="meal.isConsumed"
                      @change="toggleMealConsumed(meal.mealIndex)"
                      class="h-4 w-4 cursor-pointer accent-primary"
                    />
                  </td>

                  <td class="py-3 text-xs text-muted">
                    {{ meal.type }}
                  </td>

                  <td class="py-3 pr-3 text-xs font-medium text-ink">
                    {{ meal.name }}
                  </td>

                  <td class="py-3 text-xs text-muted">
                    {{ meal.plannedTime }}
                  </td>

                  <td class="py-3 text-xs text-muted">
                    {{ meal.calories }} kcal
                  </td>

                  <td class="py-3 text-xs text-muted">
                    {{ meal.protein }} g
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div
            v-else
            class="flex flex-1 flex-col items-center justify-center py-8 text-center"
          >
            <div
              class="flex h-14 w-14 items-center justify-center rounded-full bg-accent/40"
            >
              <ClipboardList
                :size="26"
                :stroke-width="1.5"
                class="text-primary"
              />
            </div>

            <h3 class="mt-3 text-sm font-normal text-muted">
              No meal details yet
            </h3>

            <p class="mt-1 max-w-[300px] text-xs leading-relaxed text-muted">
              Your meal details and nutritional information will appear here once you
              create your meal plan.
            </p>
          </div>
        </section>

      </div>

      <!-- Right Column -->
      <div class="flex min-w-0 flex-col gap-[15px]">
        <!-- Drink -->
        <section
          class="flex min-h-[180px] flex-col rounded-[10px] border border-line bg-white p-4"
        >
          <h2 class="text-sm font-semibold text-ink">
            Water Intake
          </h2>

          <!-- Water Progress -->
          <div class="mt-4 flex items-center justify-between">
            <div>
              <p class="text-2xl font-semibold text-ink">
                {{ waterIntake }}
                <span class="text-xs font-normal text-muted">ml</span>
              </p>

              <p class="mt-1 text-xs text-muted">
                of {{ waterGoal }} ml daily goal
              </p>
            </div>

            <GlassWater
              :size="30"
              :stroke-width="1.5"
              class="text-primary"
            />
          </div>

          <!-- Progress Bar -->
          <div class="mt-4 h-2 w-full overflow-hidden rounded-full bg-line/60">
            <div
              class="h-full rounded-full bg-primary transition-all duration-300"
              :style="{ width: `${waterProgress}%` }"
            ></div>
          </div>

          <!-- Water Controls -->
          <div class="mt-4 flex items-center justify-between">
            <p class="text-xs text-muted">
              {{ Math.round(waterProgress) }}% completed
            </p>

            <div class="flex items-center gap-3">
              <button
                @click="removeWater"
                class="flex h-8 w-8 items-center justify-center rounded-full border border-line text-muted hover:bg-accent/30"
              >
                −
              </button>

              <span class="text-xs font-medium text-muted">
                +250 ml
              </span>

              <button
                @click="addWater"
                class="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-white hover:bg-primary-hover"
              >
                +
              </button>
            </div>
          </div>
        </section>

        <!-- Shopping List -->
        <section class="flex min-h-[250px] flex-1 flex-col rounded-[10px] border border-line bg-white p-4">
          <!-- Header -->
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-2">
              <ShoppingBasket
                :size="18"
                :stroke-width="1.8"
                class="text-primary"
              />
              <h2 class="text-sm font-semibold text-ink">
                Shopping List
              </h2>
            </div>

            <span class="text-xs text-muted">
              {{ shoppingGroups.length }} items
            </span>
          </div>

          <!-- Shopping Groups -->
          <div
            v-if="shoppingGroups.length"
            class="mt-4 space-y-3"
          >
            <div
              v-for="group in shoppingGroups"
              :key="group.id"
              class="overflow-hidden rounded-lg border border-line"
            >

              <!-- Group Header -->
              <button
                type="button"
                @click="toggleShoppingGroup(group.id)"
                class="flex w-full items-center justify-between bg-accent/20 px-3 py-3 text-left"
              >
                <span class="text-xs font-semibold text-ink">
                  {{ group.name }}
                </span>

                <ChevronDown
                  :size="16"
                  class="text-muted transition-transform"
                  :class="{ 'rotate-180': isShoppingGroupExpanded(group.id) }"
                />
              </button>

              <!-- Ingredients -->
              <div
                v-if="isShoppingGroupExpanded(group.id)"
                class="space-y-3 px-3 py-3"
              >
                <label
                  v-for="ingredient in group.ingredients"
                  :key="ingredient.id"
                  class="flex cursor-pointer items-center justify-between gap-3"
                >
                  <div class="flex min-w-0 items-center gap-2">
                    <input
                      type="checkbox"
                      :checked="!!checkedShoppingItems[ingredient.id]"
                      @change="toggleShoppingItem(ingredient.id)"
                      class="h-4 w-4 shrink-0 cursor-pointer accent-primary"
                    />

                    <span
                      class="text-xs text-muted"
                      :class="{
                        'text-muted line-through':
                          checkedShoppingItems[ingredient.id]
                      }"
                    >
                      {{ ingredient.name }}
                    </span>
                  </div>

                  <span class="shrink-0 text-xs text-muted">
                    {{ ingredient.quantity }}
                  </span>
                </label>
              </div>

            </div>
          </div>

          <!-- Empty State -->
          <div
            v-else
            class="flex flex-1 flex-col items-center justify-center py-8 text-center"
          >
            <div class="flex h-14 w-14 items-center justify-center rounded-full bg-accent/40">
              <ShoppingBasket
                :size="26"
                :stroke-width="1.5"
                class="text-primary"
              />
            </div>

            <h3 class="mt-3 text-sm font-normal text-muted">
              Your list is empty
            </h3>

            <p class="mt-1 max-w-[200px] text-xs leading-relaxed text-muted">
              Ingredients from your meal plan will appear here.
            </p>
          </div>
        </section>

        <!-- Edit Meal Modal -->
        <!-- Log Different Meal Modal -->
        <div
          v-if="showMealEditModal"
          class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          @click.self="closeMealEdit"
        >
          <div class="w-full max-w-[480px] rounded-xl bg-white p-6 shadow-xl">

            <!-- Modal Header -->
            <div class="mb-6 flex items-center justify-between">
              <div>
                <h2 class="text-lg font-semibold text-ink">
                  Log Different Meal
                </h2>
                <p class="mt-1 text-sm text-muted">
                  Enter the food you actually ate.
                </p>
              </div>

              <button
                type="button"
                class="rounded-full p-2 text-muted transition hover:bg-line/60"
                @click="closeMealEdit"
              >
                <X :size="20" />
              </button>
            </div>

            <!-- Food Name -->
            <div class="mb-4">
              <label class="mb-2 block text-sm font-medium text-ink">
                Food Name
              </label>
              <input
                v-model="editedMealName"
                type="text"
                placeholder="Example: Nasi Goreng"
                class="w-full rounded-lg border border-line px-4 py-3 text-sm outline-none focus:border-primary"
              />
            </div>

            <!-- Portion -->
            <div class="mb-4">
              <label class="mb-2 block text-sm font-medium text-ink">
                Portion
              </label>
              <input
                v-model="editedMealPortion"
                type="text"
                placeholder="Example: 1 plate, 200g"
                class="w-full rounded-lg border border-line px-4 py-3 text-sm outline-none focus:border-primary"
              />
            </div>

            <!-- Additional Details -->
            <div class="mb-6">
              <label class="mb-2 block text-sm font-medium text-ink">
                Additional Details
                <span class="font-normal text-muted">(Optional)</span>
              </label>
              <textarea
                v-model="editedMealDetails"
                rows="3"
                placeholder="Example: With egg, chicken, and extra vegetables"
                class="w-full resize-none rounded-lg border border-line px-4 py-3 text-sm outline-none focus:border-primary"
              ></textarea>
            </div>

            <!-- Actions -->
            <div class="flex justify-end gap-3">
              <button
                type="button"
                class="rounded-lg border border-line px-5 py-2.5 text-sm text-muted transition hover:bg-accent/30"
                @click="closeMealEdit"
              >
                Cancel
              </button>

              <button
                type="button"
                @click="saveMealEdit"
                class="rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-white transition hover:bg-primary-hover"
              >
                Save Meal
              </button>
            </div>

          </div>
        </div>
      </div>
    </main>
  </div>
</template>