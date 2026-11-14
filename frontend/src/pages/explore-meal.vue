<script setup>
import { computed, ref } from "vue";
import { ArrowRight, Check, Clock, Flame, Leaf, Search, SlidersHorizontal, Utensils, Wallet } from "lucide-vue-next";
import FoodVisual from "../components/food-visual.vue";
import AnimatedNumber from "../components/animated-number.vue";
import { categories, formatRupiah, mealCatalog } from "../lib/meal-data.js";

const search = ref("");
const activeCategory = ref("All");
const sortBy = ref("Recommended");

const filteredMeals = computed(() => {
  const query = search.value.trim().toLowerCase();

  const result = mealCatalog.filter((meal) => {
    const matchesCategory = activeCategory.value === "All" || meal.category === activeCategory.value;
    const matchesQuery = !query || [meal.name, meal.description, meal.category, ...meal.tags].join(" ").toLowerCase().includes(query);
    return matchesCategory && matchesQuery;
  });

  if (sortBy.value === "Lowest calories") {
    return [...result].sort((a, b) => a.calories - b.calories);
  }
  if (sortBy.value === "Lowest price") {
    return [...result].sort((a, b) => a.price - b.price);
  }
  if (sortBy.value === "Highest protein") {
    return [...result].sort((a, b) => b.protein - a.protein);
  }
  return result;
});

const resetFilters = () => {
  search.value = "";
  activeCategory.value = "All";
  sortBy.value = "Recommended";
};
</script>

<template>
  <div class="overflow-x-clip">
    <section class="hero-surface-dark relative overflow-hidden pb-12 pt-32 lg:pb-16 lg:pt-36">
      <div class="pointer-events-none absolute inset-0 texture-grid-light opacity-50" />
      <div class="pointer-events-none absolute -left-32 top-20 h-80 w-80 rounded-full bg-white/10 blur-3xl" />
      <div class="pointer-events-none absolute -right-16 top-10 h-72 w-72 rounded-full bg-secondary/20 blur-3xl" />

      <div class="shell relative">
        <div class="mx-auto flex max-w-4xl flex-col items-center text-center">
          <div
            v-reveal
            class="inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-3.5 py-1.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-white shadow-[0_10px_30px_-24px_rgba(0,0,0,.6)] backdrop-blur"
          >
            <Leaf :size="13" />
            Meal library
          </div>

          <h1 v-reveal="{ delay: 60 }" class="mt-6 text-balance text-[clamp(2.6rem,5.5vw,4.5rem)] font-semibold leading-[1.01] tracking-tighter text-white">Find a meal that fits today.</h1>

          <p v-reveal="{ delay: 120 }" class="mt-5 max-w-2xl text-[15px] leading-7 text-white/75">
            Explore balanced meals with visible calories, protein, cooking time, and an estimated price per portion. Filter by what you actually need right now.
          </p>

          <div v-reveal="{ delay: 180 }" class="mt-7 flex flex-wrap justify-center gap-2.5 text-[11.5px]">
            <span class="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/30 px-3.5 py-2 text-accent shadow-[0_12px_24px_-20px_rgba(6,59,0,.5)]">
              <span class="grid h-6 w-6 place-items-center rounded-full bg-accent/80 text-primary-deep">
                <Utensils :size="13" />
              </span>
              <strong class="font-semibold text-white"><AnimatedNumber :value="mealCatalog.length" /></strong>meals
            </span>
            <span class="inline-flex items-center gap-2 rounded-full border border-warning/30 bg-warning/30 px-3.5 py-2 text-warning shadow-[0_12px_24px_-20px_rgba(6,59,0,.5)]">
              <span class="grid h-6 w-6 place-items-center rounded-full bg-accent text-warning">
                <Wallet :size="13" />
              </span>
              Prices from
              <strong class="font-semibold text-accent">Rp 11,000</strong>
            </span>
            <span class="inline-flex items-center gap-2 rounded-full border border-info/30 bg-info/30 px-3.5 py-2 text-info shadow-[0_12px_24px_-20px_rgba(6,59,0,.5)]">
              <span class="grid h-6 w-6 place-items-center rounded-full bg-accent text-info">
                <Clock :size="13" />
              </span>
              <strong class="font-semibold text-accent">Ready in under 35 minutes</strong>
            </span>
          </div>
        </div>
      </div>
    </section>

    <section class="pt-12 pb-16 lg:pb-20">
      <div class="shell">
        <div class="rounded-[14px] border border-line bg-white p-4 shadow-[0_20px_50px_-42px_rgba(6,59,0,.45)]">
          <div class="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div class="flex min-w-0 flex-1 items-center gap-3">
              <div class="flex h-11 w-full max-w-md items-center gap-2.5 rounded-[9px] bg-accent px-3.5">
                <Search :size="17" class="shrink-0 text-primary-deep" />
                <input v-model="search" type="text" placeholder="Search meals, ingredients, or goals..." class="w-full bg-transparent text-sm text-ink outline-none placeholder:text-muted/80" />
              </div>

              <div class="hidden items-center gap-2 sm:flex">
                <SlidersHorizontal :size="15" class="text-muted" />
                <select v-model="sortBy" class="h-11 rounded-[9px] border border-line bg-white px-3 text-xs font-medium text-ink outline-none transition focus:border-primary" aria-label="Sort meals">
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
                :class="activeCategory === category ? 'border-ink bg-ink text-white' : 'border-line bg-white text-muted hover:border-primary/40 hover:bg-accent hover:text-ink'"
                @click="activeCategory = category"
              >
                {{ category }}
              </button>
            </div>
          </div>
        </div>

        <div class="mb-4 mt-5 flex items-center justify-between gap-3">
          <p class="text-[11px] text-muted">
            <strong class="font-semibold text-ink">{{ filteredMeals.length }}</strong>
            meals found
          </p>
          <button v-if="search || activeCategory !== 'All' || sortBy !== 'Recommended'" type="button" class="text-[11px] font-medium text-primary-deep transition hover:text-ink" @click="resetFilters">Reset filters</button>
        </div>

        <div v-if="filteredMeals.length" class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <article
            v-for="(meal, index) in filteredMeals"
            :key="meal.id"
            v-reveal="{ delay: Math.min(index, 6) * 45 }"
            class="group overflow-hidden rounded-[16px] border border-line bg-white transition duration-300 hover:-translate-y-1 hover:border-primary/30 hover:shadow-[0_30px_60px_-40px_rgba(6,59,0,.5)]"
          >
            <div class="relative h-48 overflow-hidden bg-accent/30">
              <div class="absolute inset-0 texture-dots opacity-30" />
              <FoodVisual :image="meal.image" :colors="meal.colors" :label="meal.name" class="relative z-10 transition duration-500 group-hover:scale-105" />
              <span class="absolute left-3 top-3 z-20 rounded-full bg-white/90 px-2.5 py-1 text-[9px] font-semibold uppercase tracking-[0.12em] text-primary-deep backdrop-blur">
                {{ meal.category }}
              </span>
              <span class="absolute right-3 top-3 z-20 rounded-full bg-white/90 px-2.5 py-1 text-[10px] font-semibold text-ink backdrop-blur">
                {{ formatRupiah(meal.price) }}
              </span>
            </div>

            <div class="p-5">
              <h2 class="text-[15px] font-semibold leading-snug tracking-[-0.02em] text-ink">
                {{ meal.name }}
              </h2>
              <p class="mt-1.5 line-clamp-2 text-[12.5px] leading-6 text-muted">
                {{ meal.description }}
              </p>

              <div class="mt-3 flex flex-wrap gap-1.5">
                <span v-for="tag in meal.tags.slice(0, 3)" :key="tag" class="rounded-full bg-accent px-2 py-1 text-[9.5px] font-medium text-primary-deep">
                  {{ tag }}
                </span>
              </div>

              <div class="mt-4 grid grid-cols-3 gap-2 border-t border-line pt-3">
                <div class="text-center">
                  <Flame :size="14" class="mx-auto text-primary" />
                  <p class="mt-1 text-[11px] font-semibold text-ink">{{ meal.calories }}</p>
                  <p class="text-[9px] text-muted">kcal</p>
                </div>
                <div class="border-x border-line text-center">
                  <Utensils :size="14" class="mx-auto text-warning" />
                  <p class="mt-1 text-[11px] font-semibold text-ink">{{ meal.protein }}g</p>
                  <p class="text-[9px] text-muted">protein</p>
                </div>
                <div class="text-center">
                  <Clock :size="14" class="mx-auto text-primary-deep" />
                  <p class="mt-1 text-[11px] font-semibold text-ink">{{ meal.time }}m</p>
                  <p class="text-[9px] text-muted">to cook</p>
                </div>
              </div>

              <RouterLink to="/trial" class="mt-4 flex w-full items-center justify-center gap-1.5 rounded-md border border-line px-3 py-2 text-[11px] font-semibold text-ink transition hover:border-primary/40 hover:bg-accent">
                Build a plan with this
                <ArrowRight :size="13" />
              </RouterLink>
            </div>
          </article>
        </div>

        <div v-else class="grid min-h-[300px] place-items-center rounded-[16px] border border-dashed border-line bg-white p-8 text-center">
          <div>
            <span class="mx-auto grid h-12 w-12 place-items-center rounded-full bg-accent text-primary-deep">
              <Search :size="21" />
            </span>
            <h2 class="mt-4 text-sm font-semibold text-ink">No meals match that search</h2>
            <p class="mt-1 text-xs text-muted">Try a different keyword or category.</p>
            <button type="button" class="mt-4 rounded-md bg-ink px-4 py-2 text-xs font-semibold text-white transition hover:bg-primary-deep" @click="resetFilters">Reset filters</button>
          </div>
        </div>
      </div>
    </section>

    <section class="pb-16 lg:pb-24">
      <div class="shell">
        <div v-reveal class="cta-surface-dark relative overflow-hidden rounded-[20px] p-6 shadow-[0_30px_70px_-40px_rgba(6,59,0,.65)] sm:p-8 lg:py-12">
          <div class="pointer-events-none absolute inset-0 texture-dots-light opacity-30" />
          <div class="relative flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
            <div class="max-w-xl">
              <div class="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-secondary">
                <Check :size="14" />
                Save meals you like
              </div>
              <h2 class="mt-3 text-balance text-[clamp(1.6rem,3vw,2.3rem)] font-semibold leading-[1.08] tracking-[-0.04em] text-white">Turn this inspiration into a plan that fits your week.</h2>
              <p class="mt-2 text-[13px] leading-6 text-white/70">Create an account to save favorites, generate a full menu, and keep your shopping list in sync.</p>
            </div>
            <RouterLink to="/register" class="btn btn-primary shrink-0">
              Start planning free
              <ArrowRight :size="16" />
            </RouterLink>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>
