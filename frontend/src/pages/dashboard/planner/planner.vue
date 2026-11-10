
<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import HeaderDashboard from '../../../components/header-dashboard.vue'
import MealCard from '../../../components/meal-card.vue'
import plannerIllustration from '../../../assets/ilustration.png'
import { Coffee, Utensils, Moon, Cookie, Sparkles, ChevronLeft, ChevronRight, GlassWater, ShoppingBasket, ClipboardList } from 'lucide-vue-next'

const router = useRouter()

// Date Navigation
const selectedDate = ref(new Date())

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

// Navigate to Create Plan
const goToCreatePlan = () => {
  router.push('/dashboard/planner/create')
}
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
          class="relative flex h-[180px] items-center justify-between overflow-hidden rounded-[10px] bg-[linear-gradient(270deg,#90D68D_0%,#7BC988_25%,#66BB83_50%)] px-6"
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
              class="mt-3 flex items-center gap-2 rounded-md bg-white px-4 py-2 text-xs font-medium text-(--color-primary) transition hover:bg-gray-50"
            >
              <Sparkles :size="14" />
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
              <span class="text-lg font-semibold text-(--color-text)]">
                {{ formattedDate }}
              </span>
            </div>

            <!-- Date Navigation -->
            <div class="flex items-center gap-1">
              <button
                @click="changeDate(-1)"
                class="rounded-md p-1 text-(--color-text) transition hover:bg-gray-100"
                aria-label="Previous day"
              >
                <ChevronLeft :size="20" />
              </button>

              <button
                @click="changeDate(1)"
                class="rounded-md p-1 text-(--color-text) transition hover:bg-gray-100"
                aria-label="Next day"
              >
                <ChevronRight :size="20" />
              </button>
            </div>

          </div>

          <!-- Meal Cards -->
          <div class="grid grid-cols-2 gap-[15px] md:grid-cols-4">
            <MealCard title="Breakfast" :icon="Coffee" />
            <MealCard title="Lunch" :icon="Utensils" />
            <MealCard title="Dinner" :icon="Moon" />
            <MealCard title="Snack" :icon="Cookie" />
          </div>
        </section>

        <!-- Meal Details -->
        <section
          class="flex min-h-[250px] flex-col rounded-[10px] border border-gray-200 bg-white p-5"
        >
          <h2 class="text-sm font-semibold text-(--color-text)]">
            Meal Details
          </h2>

          <div
            class="flex flex-1 flex-col items-center justify-center py-8 text-center"
          >
            <div
              class="flex h-14 w-14 items-center justify-center rounded-full bg-[#F1F8F1]"
            >
              <ClipboardList
                :size="26"
                :stroke-width="1.5"
                class="text-(--color-primary)"
              />
            </div>

            <h3 class="mt-3 text-sm font-reguler text-gray-600">
              No meal details yet
            </h3>

            <p class="mt-1 max-w-[300px] text-xs leading-relaxed text-gray-400">
              Your meal ingredients and nutritional information will appear here
              once you create your meal plan.
            </p>
          </div>
        </section>
      </div>

      <!-- Right Column -->
      <div class="flex min-w-0 flex-col gap-[15px]">

        <!-- Drink Recommendation -->
        <section
          class="flex min-h-[180px] flex-col rounded-[10px] border border-gray-200 bg-white p-4"
        >
          <h2 class="text-sm font-semibold text-(--color-text)]">
            Your Drink
          </h2>

          <div
            class="flex flex-1 flex-col items-center justify-center py-2 text-center"
          >
            <div
              class="flex h-12 w-12 items-center justify-center rounded-full bg-[#F1F8F1]"
            >
              <GlassWater
                :size="26"
                :stroke-width="1.5"
                class="text-(--color-primary)"
              />
            </div>

            <h3 class="mt-3 text-sm font-reguler text-gray-600">
              Beverages
            </h3>

            <p class="mt-1 max-w-[300px] text-xs leading-relaxed text-gray-400">
              Not planned yet
            </p>
          </div>
        </section>         

        <!-- Shopping List -->
        <section
          class="flex min-h-[250px] flex-1 flex-col rounded-[10px] border border-gray-200 bg-white p-4"
        >
          <div class="flex items-center gap-2">
            <h2 class="text-sm font-semibold text-(--color-text)">
              Shopping List
            </h2>
          </div>

          <div
            class="flex flex-1 flex-col items-center justify-center py-8 text-center"
          >
            <div
              class="flex h-14 w-14 items-center justify-center rounded-full bg-[#F1F8F1]"
            >
              <ShoppingBasket
                :size="26"
                :stroke-width="1.5"
                class="text-(--color-primary)"
              />
            </div>

            <h3 class="mt-3 text-sm font-regular text-gray-600">
              Your list is empty
            </h3>

            <p class="mt-1 max-w-[200px] text-xs leading-relaxed text-gray-400">
              Ingredients from your meal plan will appear here.
            </p>
          </div>
        </section>
      </div>
    </main>
  </div>
</template>