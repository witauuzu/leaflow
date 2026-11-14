<script setup>
import { computed, ref } from 'vue'
import {
  Check,
  ChevronRight,
  Clock,
  Flame,
  Heart,
  Leaf,
  Plus,
  Search,
  SlidersHorizontal,
  Utensils,
  Wallet,
} from 'lucide-vue-next'
import HeaderDashboard from '../../../components/header-dashboard.vue'
import FoodVisual from '../../../components/food-visual.vue'
import {
  categories,
  formatRupiah,
  mealCatalog,
} from '../../../lib/meal-data.js'

const search = ref('')
const activeCategory = ref('All')
const sortBy = ref('Recommended')
const selectedId = ref(mealCatalog[0].id)
const favoriteIds = ref([])
const addedId = ref(null)
const toast = ref('')

const filteredMeals = computed(() => {
  const query = search.value.trim().toLowerCase()

  const result = mealCatalog.filter((meal) => {
    const matchesCategory =
      activeCategory.value === 'All' || meal.category === activeCategory.value
    const matchesQuery =
      !query ||
      [meal.name, meal.description, meal.category, ...meal.tags]
        .join(' ')
        .toLowerCase()
        .includes(query)
    return matchesCategory && matchesQuery
  })

  if (sortBy.value === 'Lowest calories') {
    return [...result].sort((a, b) => a.calories - b.calories)
  }
  if (sortBy.value === 'Lowest price') {
    return [...result].sort((a, b) => a.price - b.price)
  }
  if (sortBy.value === 'Highest protein') {
    return [...result].sort((a, b) => b.protein - a.protein)
  }
  return result
})

const selectedMeal = computed(
  () => mealCatalog.find((meal) => meal.id === selectedId.value) ?? mealCatalog[0],
)

const isFavorite = (id) => favoriteIds.value.includes(id)

const toggleFavorite = (id) => {
  favoriteIds.value = isFavorite(id)
    ? favoriteIds.value.filter((item) => item !== id)
    : [...favoriteIds.value, id]
}

const addToPlan = (meal) => {
  addedId.value = meal.id
  toast.value = `${meal.name} added to your plan`
  window.setTimeout(() => {
    addedId.value = null
  }, 1800)
  window.setTimeout(() => {
    toast.value = ''
  }, 2600)
}
</script>

<template>
  <div class="relative p-7">
    <HeaderDashboard
      title="Food Explore"
      description="Find affordable meals that match your nutrition targets and taste."
    />

    <main class="mt-7">
      <!-- Controls -->
      <section class="rounded-[10px] border border-line bg-white p-4">
        <div class="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div class="flex min-w-0 flex-1 items-center gap-3">
            <div
              class="flex h-11 w-full max-w-md items-center gap-2.5 rounded-[9px] bg-accent px-3.5"
            >
              <Search :size="17" class="shrink-0 text-primary-deep" />
              <input
                v-model="search"
                type="text"
                placeholder="Search meals, ingredients, or goals..."
                class="w-full bg-transparent text-sm text-ink outline-none placeholder:text-muted/80"
              />
            </div>

            <div class="hidden items-center gap-2 sm:flex">
              <SlidersHorizontal :size="15" class="text-muted" />
              <select
                v-model="sortBy"
                class="h-11 rounded-[9px] border border-line bg-white px-3 text-xs font-medium text-ink outline-none transition focus:border-primary"
                aria-label="Sort meals"
              >
                <option>Recommended</option>
                <option>Lowest calories</option>
                <option>Lowest price</option>
                <option>Highest protein</option>
              </select>
            </div>
          </div>

          <div class="flex flex-wrap items-center gap-2">
            <button
              v-for="category in categories"
              :key="category"
              type="button"
              class="rounded-[8px] border px-3 py-2 text-[11px] font-medium transition"
              :class="
                activeCategory === category
                  ? 'border-ink bg-ink text-white'
                  : 'border-line bg-white text-muted hover:border-primary/40 hover:bg-accent hover:text-ink'
              "
              @click="activeCategory = category"
            >
              {{ category }}
            </button>
          </div>
        </div>
      </section>

      <div class="mt-4 grid gap-4 xl:grid-cols-[minmax(0,1fr)_340px]">
        <!-- Meal grid -->
        <div class="min-w-0">
          <div class="mb-3 flex items-center justify-between gap-3">
            <p class="text-[11px] text-muted">
              <strong class="font-semibold text-ink">{{ filteredMeals.length }}</strong>
              meals found
            </p>
            <p class="text-[11px] text-muted">Prices are estimated per portion</p>
          </div>

          <div
            v-if="filteredMeals.length"
            class="grid gap-[15px] sm:grid-cols-2 2xl:grid-cols-3"
          >
            <article
              v-for="meal in filteredMeals"
              :key="meal.id"
              class="group cursor-pointer overflow-hidden rounded-[10px] border bg-white transition duration-300 hover:-translate-y-0.5 hover:shadow-[0_24px_50px_-38px_rgba(6,59,0,.45)]"
              :class="
                selectedId === meal.id
                  ? 'border-primary/60 ring-1 ring-primary/20'
                  : 'border-line'
              "
              @click="selectedId = meal.id"
            >
              <div class="relative h-40 overflow-hidden bg-accent/30">
                <div class="absolute inset-0 texture-dots opacity-30" />
                <FoodVisual
                  :image="meal.image"
                  :colors="meal.colors"
                  :label="meal.name"
                  class="relative z-10 transition duration-500 group-hover:scale-105"
                />
                <span
                  class="absolute left-3 top-3 z-20 rounded-full bg-white/90 px-2.5 py-1 text-[9px] font-semibold uppercase tracking-[0.12em] text-primary-deep backdrop-blur"
                >
                  {{ meal.category }}
                </span>
                <button
                  type="button"
                  class="absolute right-3 top-3 z-20 grid h-8 w-8 place-items-center rounded-full bg-white/90 backdrop-blur transition hover:bg-white"
                  :aria-label="isFavorite(meal.id) ? 'Remove from favorites' : 'Save meal'"
                  @click.stop="toggleFavorite(meal.id)"
                >
                  <Heart
                    :size="15"
                    :fill="isFavorite(meal.id) ? 'currentColor' : 'none'"
                    :class="isFavorite(meal.id) ? 'text-danger' : 'text-muted'"
                  />
                </button>
              </div>

              <div class="p-4">
                <div class="flex items-start justify-between gap-3">
                  <h2 class="text-[13.5px] font-semibold leading-snug text-ink">
                    {{ meal.name }}
                  </h2>
                  <span class="shrink-0 text-[12px] font-semibold text-primary-deep">
                    {{ formatRupiah(meal.price) }}
                  </span>
                </div>
                <p class="mt-1 line-clamp-2 text-[11.5px] leading-5 text-muted">
                  {{ meal.description }}
                </p>

                <div class="mt-3 flex flex-wrap gap-1.5">
                  <span
                    v-for="tag in meal.tags.slice(0, 2)"
                    :key="tag"
                    class="rounded-full bg-accent px-2 py-1 text-[9.5px] font-medium text-primary-deep"
                  >
                    {{ tag }}
                  </span>
                </div>

                <div class="mt-3 flex items-center justify-between border-t border-line pt-3">
                  <div class="flex items-center gap-3 text-[10.5px] text-muted">
                    <span class="inline-flex items-center gap-1">
                      <Flame :size="12" class="text-primary" />
                      {{ meal.calories }}
                    </span>
                    <span class="inline-flex items-center gap-1">
                      <Utensils :size="12" class="text-primary" />
                      {{ meal.protein }}g
                    </span>
                    <span class="inline-flex items-center gap-1">
                      <Clock :size="12" class="text-primary" />
                      {{ meal.time }}m
                    </span>
                  </div>

                  <button
                    type="button"
                    class="grid h-7 w-7 place-items-center rounded-md bg-ink text-white transition hover:bg-primary-deep"
                    aria-label="Add meal to plan"
                    @click.stop="addToPlan(meal)"
                  >
                    <Check v-if="addedId === meal.id" :size="14" />
                    <Plus v-else :size="14" />
                  </button>
                </div>
              </div>
            </article>
          </div>

          <div
            v-else
            class="grid min-h-[280px] place-items-center rounded-[10px] border border-dashed border-line bg-white p-8 text-center"
          >
            <div>
              <span class="mx-auto grid h-12 w-12 place-items-center rounded-full bg-accent text-primary-deep">
                <Search :size="21" />
              </span>
              <h2 class="mt-4 text-sm font-semibold text-ink">No meals match that search</h2>
              <p class="mt-1 text-xs text-muted">
                Try a different keyword or reset the category filter.
              </p>
              <button
                type="button"
                class="mt-4 rounded-md bg-ink px-4 py-2 text-xs font-semibold text-white transition hover:bg-primary-deep"
                @click="search = ''; activeCategory = 'All'"
              >
                Reset filters
              </button>
            </div>
          </div>
        </div>

        <!-- Detail panel -->
        <aside class="min-w-0">
          <div class="sticky top-6 overflow-hidden rounded-[10px] border border-line bg-white">
            <div class="relative h-48 overflow-hidden bg-accent/30">
              <div class="absolute inset-0 texture-dots opacity-30" />
              <FoodVisual
                :image="selectedMeal.image"
                :colors="selectedMeal.colors"
                :label="selectedMeal.name"
                class="relative z-10"
              />
              <span
                class="absolute left-4 top-4 z-20 rounded-full bg-white/90 px-2.5 py-1 text-[9px] font-semibold uppercase tracking-[0.12em] text-primary-deep backdrop-blur"
              >
                {{ selectedMeal.category }}
              </span>
            </div>

            <div class="p-5">
              <div class="flex items-start justify-between gap-3">
                <div>
                  <h2 class="text-[1.05rem] font-semibold leading-snug tracking-[-0.02em] text-ink">
                    {{ selectedMeal.name }}
                  </h2>
                  <p class="mt-1 text-[11.5px] leading-5 text-muted">
                    {{ selectedMeal.description }}
                  </p>
                </div>
                <button
                  type="button"
                  class="grid h-8 w-8 shrink-0 place-items-center rounded-md border border-line transition hover:bg-accent"
                  :aria-label="
                    isFavorite(selectedMeal.id) ? 'Remove from favorites' : 'Save meal'
                  "
                  @click="toggleFavorite(selectedMeal.id)"
                >
                  <Heart
                    :size="15"
                    :fill="isFavorite(selectedMeal.id) ? 'currentColor' : 'none'"
                    :class="isFavorite(selectedMeal.id) ? 'text-danger' : 'text-muted'"
                  />
                </button>
              </div>

              <!-- Nutrition -->
              <div class="mt-5 grid grid-cols-3 gap-2">
                <div class="rounded-[9px] bg-accent/70 p-3 text-center">
                  <Flame :size="15" class="mx-auto text-primary-deep" />
                  <p class="mt-1 text-sm font-semibold text-ink">{{ selectedMeal.calories }}</p>
                  <p class="text-[9px] uppercase tracking-[0.08em] text-muted">kcal</p>
                </div>
                <div class="rounded-[9px] bg-warning/10 p-3 text-center">
                  <Utensils :size="15" class="mx-auto text-warning" />
                  <p class="mt-1 text-sm font-semibold text-ink">{{ selectedMeal.protein }}g</p>
                  <p class="text-[9px] uppercase tracking-[0.08em] text-muted">protein</p>
                </div>
                <div class="rounded-[9px] bg-info/10 p-3 text-center">
                  <Clock :size="15" class="mx-auto text-info" />
                  <p class="mt-1 text-sm font-semibold text-ink">{{ selectedMeal.time }}m</p>
                  <p class="text-[9px] uppercase tracking-[0.08em] text-muted">to cook</p>
                </div>
              </div>

              <!-- Macro rows -->
              <div class="mt-4 space-y-2.5">
                <div class="flex items-center justify-between text-[11px]">
                  <span class="text-muted">Carbohydrates</span>
                  <span class="font-medium text-ink">{{ selectedMeal.carbs }} g</span>
                </div>
                <div class="h-1.5 overflow-hidden rounded-full bg-accent">
                  <div
                    class="h-full rounded-full bg-info"
                    :style="{ width: `${Math.min(100, (selectedMeal.carbs / 80) * 100)}%` }"
                  />
                </div>
                <div class="flex items-center justify-between text-[11px]">
                  <span class="text-muted">Fat</span>
                  <span class="font-medium text-ink">{{ selectedMeal.fat }} g</span>
                </div>
                <div class="h-1.5 overflow-hidden rounded-full bg-accent">
                  <div
                    class="h-full rounded-full bg-warning"
                    :style="{ width: `${Math.min(100, (selectedMeal.fat / 40) * 100)}%` }"
                  />
                </div>
              </div>

              <!-- Price -->
              <div class="mt-5 flex items-center justify-between rounded-[9px] border border-line bg-accent/30 p-3">
                <div class="flex items-center gap-2">
                  <span class="grid h-8 w-8 place-items-center rounded-lg bg-white text-primary-deep">
                    <Wallet :size="15" />
                  </span>
                  <div>
                    <p class="text-[9.5px] uppercase tracking-[0.08em] text-muted">Estimated cost</p>
                    <p class="text-[13px] font-semibold text-ink">
                      {{ formatRupiah(selectedMeal.price) }}
                    </p>
                  </div>
                </div>
                <span class="rounded-full bg-accent px-2.5 py-1 text-[9.5px] font-semibold text-primary-deep">
                  Budget friendly
                </span>
              </div>

              <button
                type="button"
                class="mt-4 flex w-full items-center justify-center gap-2 rounded-md bg-primary px-4 py-2.5 text-[12px] font-semibold text-ink transition hover:bg-secondary"
                @click="addToPlan(selectedMeal)"
              >
                <Check v-if="addedId === selectedMeal.id" :size="15" />
                <Plus v-else :size="15" />
                {{ addedId === selectedMeal.id ? 'Added to plan' : 'Add to meal plan' }}
              </button>

              <RouterLink
                to="/dashboard/planner"
                class="mt-2 flex w-full items-center justify-center gap-1.5 rounded-md border border-line px-4 py-2 text-[11px] font-medium text-muted transition hover:border-primary/40 hover:text-ink"
              >
                View this week's plan
                <ChevronRight :size="13" />
              </RouterLink>
            </div>
          </div>
        </aside>
      </div>
    </main>

    <Transition name="slide-up">
      <div
        v-if="toast"
        class="fixed bottom-6 left-1/2 z-50 flex -translate-x-1/2 items-center gap-2 rounded-[10px] bg-ink px-4 py-3 text-xs font-medium text-white shadow-[0_20px_40px_-20px_rgba(6,59,0,.65)]"
      >
        <Check :size="15" class="text-secondary" />
        {{ toast }}
        <Leaf :size="13" class="ml-1 text-secondary" />
      </div>
    </Transition>
  </div>
</template>
