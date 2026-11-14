<script setup>
import { computed, reactive, ref } from "vue";
import { ArrowRight, Bot, Check, ChefHat, Clock, Flame, HeartPulse, Leaf, ListChecks, RefreshCw, Utensils, Wallet } from "lucide-vue-next";
import AnimatedNumber from "../components/animated-number.vue";
import FoodVisual from "../components/food-visual.vue";
import { formatRupiah, mealCatalog } from "../lib/meal-data.js";

const goals = ["Balanced nutrition", "Build muscle", "Lose weight", "Save money", "Eat more vegetables"];
const diets = ["No restrictions", "Vegetarian", "High protein", "Budget friendly"];
const mealOptions = ["Breakfast", "Lunch", "Dinner", "Snack"];
const timeOptions = ["15 minutes", "30 minutes", "45 minutes", "No preference"];

const form = reactive({
  goal: "Balanced nutrition",
  budget: 75000,
  diet: "No restrictions",
  meals: ["Breakfast", "Lunch", "Dinner"],
  cookingTime: "30 minutes",
});

const generated = ref(false);
const planVersion = ref(0);

const toggleMeal = (meal) => {
  form.meals = form.meals.includes(meal) ? form.meals.filter((item) => item !== meal) : [...form.meals, meal];
};

const matchesDiet = (meal) => {
  if (form.diet === "Vegetarian") return meal.tags.includes("Vegetarian");
  if (form.diet === "High protein") return meal.protein >= 20;
  if (form.diet === "Budget friendly") return meal.price <= 25000;
  return true;
};

const matchesTime = (meal) => {
  if (form.cookingTime === "15 minutes") return meal.time <= 15;
  if (form.cookingTime === "30 minutes") return meal.time <= 30;
  if (form.cookingTime === "45 minutes") return meal.time <= 45;
  return true;
};

const plan = computed(() => {
  const budgetPerMeal = form.budget / Math.max(1, form.meals.length);

  const meals = form.meals.map((slot) => {
    let pool = mealCatalog.filter((meal) => meal.category === slot && matchesDiet(meal) && matchesTime(meal));

    if (!pool.length) pool = mealCatalog.filter((meal) => meal.category === slot);
    if (!pool.length) pool = mealCatalog;

    const sorted = [...pool];
    if (form.goal === "Build muscle") {
      sorted.sort((a, b) => b.protein - a.protein);
    } else if (form.goal === "Lose weight") {
      sorted.sort((a, b) => a.calories - b.calories);
    } else if (form.goal === "Save money") {
      sorted.sort((a, b) => a.price - b.price);
    } else if (form.goal === "Eat more vegetables") {
      sorted.sort((a, b) => b.tags.filter((tag) => /fiber|vegetarian|fresh/i.test(tag)).length - a.tags.filter((tag) => /fiber|vegetarian|fresh/i.test(tag)).length);
    } else {
      sorted.sort((a, b) => Math.abs(a.price - budgetPerMeal) - Math.abs(b.price - budgetPerMeal));
    }

    return { slot, meal: sorted[0] };
  });

  return {
    meals,
    calories: meals.reduce((sum, item) => sum + item.meal.calories, 0),
    protein: meals.reduce((sum, item) => sum + item.meal.protein, 0),
    cost: meals.reduce((sum, item) => sum + item.meal.price, 0),
  };
});

const generate = () => {
  if (!form.meals.length) form.meals = ["Lunch"];
  generated.value = true;
  planVersion.value += 1;
};

const reset = () => {
  generated.value = false;
};
</script>

<template>
  <div class="overflow-x-clip">
    <section class="hero-surface-dark relative overflow-hidden pb-12 pt-32 text-white lg:pb-16 lg:pt-36">
      <div class="pointer-events-none absolute inset-0 texture-grid-light opacity-50" />
      <div class="pointer-events-none absolute -left-32 top-20 h-80 w-80 rounded-full bg-white/10 blur-3xl" />
      <div class="pointer-events-none absolute -right-20 top-16 h-72 w-72 rounded-full bg-secondary/20 blur-3xl" />

      <div class="shell relative grid items-center gap-10 lg:grid-cols-[1fr_0.8fr]">
        <div>
          <div v-reveal class="inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-3.5 py-1.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-white backdrop-blur">
            <Bot :size="13" />
            AI trial
          </div>

          <h1 v-reveal="{ delay: 60 }" class="mt-6 max-w-2xl text-balance text-[clamp(2.6rem,5.4vw,4.4rem)] font-semibold leading-[1.02] tracking-tighter text-white">Build a sample meal plan in under a minute.</h1>

          <p v-reveal="{ delay: 120 }" class="mt-5 max-w-xl text-[15px] leading-7 text-white/75">Tell the planner what you need. It will assemble a realistic day of meals with visible nutrition and costs, no account required.</p>

          <div v-reveal="{ delay: 180 }" class="mt-7 flex flex-wrap items-center gap-4 text-[11px] text-white/70">
            <span class="inline-flex items-center gap-1.5">
              <Check :size="13" class="text-secondary" />
              No credit card
            </span>
            <span class="inline-flex items-center gap-1.5">
              <Check :size="13" class="text-secondary" />
              Instant preview
            </span>
            <span class="inline-flex items-center gap-1.5">
              <Check :size="13" class="text-secondary" />
              Sign up only to save
            </span>
          </div>
        </div>

        <div v-reveal="{ delay: 120 }" class="relative hidden lg:block">
          <div class="absolute -inset-4 rounded-[24px] bg-primary/20 blur-2xl" />
          <div class="relative rounded-[18px] border border-white/80 bg-white/75 p-5 shadow-[0_34px_70px_-46px_rgba(6,59,0,.65)] backdrop-blur">
            <div class="flex items-center gap-3 border-b border-line pb-4">
              <span class="grid h-10 w-10 place-items-center rounded-full bg-ink text-secondary">
                <Bot :size="19" />
              </span>
              <div>
                <p class="text-sm font-semibold text-ink">Leaflow planner</p>
                <p class="text-[10.5px] text-muted">Trial mode · no account needed</p>
              </div>
            </div>
            <div class="mt-4 space-y-3">
              <div class="rounded-[10px] rounded-bl-sm border border-line bg-white p-3 text-[11.5px] leading-5 text-ink-soft">What does a balanced day look like on a Rp 75,000 budget?</div>
              <div class="ml-auto max-w-[86%] rounded-[10px] rounded-br-sm bg-accent p-3 text-[11.5px] leading-5 text-primary-deep">
                It can include spinach omelette, pecel rice, fruit yogurt, and herbed chicken soup — around 1,420 kcal.
              </div>
            </div>
            <div class="mt-5 grid grid-cols-3 gap-2 border-t border-line pt-4 text-center">
              <div>
                <Flame :size="15" class="mx-auto text-primary" />
                <p class="mt-1 text-xs font-semibold text-ink">1,420</p>
                <p class="text-[9px] text-muted">kcal</p>
              </div>
              <div class="border-x border-line">
                <Utensils :size="15" class="mx-auto text-warning" />
                <p class="mt-1 text-xs font-semibold text-ink">86g</p>
                <p class="text-[9px] text-muted">protein</p>
              </div>
              <div>
                <Wallet :size="15" class="mx-auto text-info" />
                <p class="mt-1 text-xs font-semibold text-ink">Rp 65k</p>
                <p class="text-[9px] text-muted">cost</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <section class="py-16 lg:py-20">
      <div class="shell grid items-start gap-4 lg:grid-cols-[0.85fr_1.15fr]">
        <!-- Form -->
        <div class="rounded-[16px] border border-line bg-white p-5 shadow-[0_24px_60px_-52px_rgba(6,59,0,.45)] sm:p-6">
          <div class="flex items-center gap-3">
            <span class="grid h-10 w-10 place-items-center rounded-[10px] bg-accent text-primary-deep">
              <ListChecks :size="19" />
            </span>
            <div>
              <h2 class="text-sm font-semibold text-ink">Tell us your preferences</h2>
              <p class="mt-0.5 text-[11px] text-muted">It takes less than a minute.</p>
            </div>
          </div>

          <div class="mt-6 space-y-5">
            <label class="field">
              <span class="field-label">Main goal</span>
              <select v-model="form.goal" class="input">
                <option v-for="goal in goals" :key="goal">{{ goal }}</option>
              </select>
            </label>

            <div>
              <div class="flex items-center justify-between">
                <span class="field-label">Daily food budget</span>
                <span class="text-[12px] font-semibold text-ink"> Rp {{ form.budget.toLocaleString("id-ID") }} </span>
              </div>
              <input v-model.number="form.budget" type="range" min="30000" max="200000" step="5000" class="mt-2 h-1.5 w-full cursor-pointer appearance-none rounded-full bg-line accent-primary" />
              <div class="mt-1.5 flex justify-between text-[9.5px] text-muted">
                <span>Rp 30k</span>
                <span>Rp 200k</span>
              </div>
            </div>

            <div>
              <span class="field-label">Diet style</span>
              <div class="mt-2 flex flex-wrap gap-2">
                <button
                  v-for="diet in diets"
                  :key="diet"
                  type="button"
                  class="inline-flex items-center gap-1.5 rounded-[8px] border px-3 py-2 text-[10.5px] font-medium transition"
                  :class="form.diet === diet ? 'border-primary/40 bg-accent text-primary-deep' : 'border-line bg-white text-muted hover:border-primary/30 hover:text-ink'"
                  @click="form.diet = diet"
                >
                  <Check v-if="form.diet === diet" :size="12" />
                  {{ diet }}
                </button>
              </div>
            </div>

            <div>
              <span class="field-label">Meals to include</span>
              <div class="mt-2 grid grid-cols-2 gap-2">
                <button
                  v-for="meal in mealOptions"
                  :key="meal"
                  type="button"
                  class="flex items-center justify-between rounded-[8px] border px-3 py-2.5 text-[11px] font-medium transition"
                  :class="form.meals.includes(meal) ? 'border-primary/40 bg-accent text-primary-deep' : 'border-line bg-white text-muted hover:border-primary/30 hover:text-ink'"
                  @click="toggleMeal(meal)"
                >
                  {{ meal }}
                  <Check v-if="form.meals.includes(meal)" :size="13" />
                  <span v-else class="h-3.5 w-3.5 rounded-[4px] border border-line" />
                </button>
              </div>
            </div>

            <label class="field">
              <span class="field-label">Cooking time</span>
              <select v-model="form.cookingTime" class="input">
                <option v-for="time in timeOptions" :key="time">{{ time }}</option>
              </select>
            </label>

            <div class="flex flex-col gap-2 sm:flex-row">
              <button type="button" class="btn btn-primary flex-1" @click="generate">
                <ChefHat :size="16" />
                Generate sample plan
              </button>
              <button v-if="generated" type="button" class="btn btn-outline" aria-label="Reset trial" @click="reset">
                <RefreshCw :size="15" />
              </button>
            </div>
          </div>
        </div>

        <!-- Preview -->
        <div class="min-w-0 overflow-hidden rounded-[16px] border border-line bg-white">
          <div class="flex items-center justify-between gap-3 border-b border-line bg-accent/40 px-5 py-4">
            <div>
              <p class="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted">Sample plan</p>
              <p class="mt-0.5 text-sm font-semibold text-ink">
                {{ generated ? "Built for your preferences" : "Your preview appears here" }}
              </p>
            </div>
            <span class="grid h-9 w-9 place-items-center rounded-[10px] bg-accent text-primary-deep">
              <HeartPulse :size="18" />
            </span>
          </div>

          <Transition name="fade" mode="out-in">
            <div v-if="!generated" key="empty" class="grid min-h-[430px] place-items-center p-8 text-center">
              <div>
                <span class="mx-auto grid h-14 w-14 place-items-center rounded-full bg-accent text-primary-deep">
                  <ChefHat :size="25" />
                </span>
                <h3 class="mt-4 text-sm font-semibold text-ink">Ready when you are</h3>
                <p class="mx-auto mt-1.5 max-w-xs text-[12px] leading-6 text-muted">Choose a goal, budget, and meal style. The planner will assemble a realistic sample day with nutrition and cost estimates.</p>
                <div class="mx-auto mt-5 grid max-w-xs gap-2 text-left">
                  <div
                    v-for="item in ['Meals matched to your goal', 'Budget estimate per meal', 'Calories and protein totals']"
                    :key="item"
                    class="flex items-center gap-2 rounded-[8px] border border-line px-3 py-2 text-[10.5px] text-muted"
                  >
                    <Leaf :size="13" class="shrink-0 text-primary" />
                    {{ item }}
                  </div>
                </div>
              </div>
            </div>

            <div v-else :key="planVersion" class="p-5">
              <div class="grid grid-cols-2 gap-2 sm:grid-cols-4">
                <div class="rounded-[9px] bg-accent/70 p-3 text-center">
                  <Flame :size="15" class="mx-auto text-primary-deep" />
                  <p class="mt-1 text-sm font-semibold text-ink">
                    <AnimatedNumber :value="plan.calories" />
                  </p>
                  <p class="text-[9px] uppercase tracking-[0.08em] text-muted">kcal</p>
                </div>
                <div class="rounded-[9px] bg-warning/10 p-3 text-center">
                  <Utensils :size="15" class="mx-auto text-warning" />
                  <p class="mt-1 text-sm font-semibold text-ink"><AnimatedNumber :value="plan.protein" />g</p>
                  <p class="text-[9px] uppercase tracking-[0.08em] text-muted">protein</p>
                </div>
                <div class="rounded-[9px] bg-info/10 p-3 text-center">
                  <Wallet :size="15" class="mx-auto text-primary-deep" />
                  <p class="mt-1 text-sm font-semibold text-ink">
                    <AnimatedNumber :value="plan.cost" prefix="Rp " />
                  </p>
                  <p class="text-[9px] uppercase tracking-[0.08em] text-muted">cost</p>
                </div>
                <div class="rounded-[9px] bg-accent p-3 text-center">
                  <Clock :size="15" class="mx-auto text-primary-deep" />
                  <p class="mt-1 text-sm font-semibold text-ink">{{ form.cookingTime.split(" ")[0] }}m</p>
                  <p class="text-[9px] uppercase tracking-[0.08em] text-muted">limit</p>
                </div>
              </div>

              <div class="mt-4 space-y-2">
                <div v-for="item in plan.meals" :key="item.slot" class="flex items-center gap-3 rounded-[10px] border border-line p-3">
                  <span class="h-12 w-12 shrink-0 overflow-hidden rounded-[9px] bg-accent">
                    <FoodVisual :image="item.meal.image" :colors="item.meal.colors" :label="item.meal.name" />
                  </span>
                  <div class="min-w-0 flex-1">
                    <p class="text-[9.5px] font-medium uppercase tracking-[0.08em] text-muted">
                      {{ item.slot }}
                    </p>
                    <p class="mt-0.5 truncate text-[12.5px] font-semibold text-ink">
                      {{ item.meal.name }}
                    </p>
                    <p class="mt-0.5 text-[10.5px] text-muted">{{ item.meal.calories }} kcal · {{ item.meal.protein }}g protein · {{ item.meal.time }} min</p>
                  </div>
                  <span class="shrink-0 text-[11px] font-semibold text-primary-deep">
                    {{ formatRupiah(item.meal.price) }}
                  </span>
                </div>
              </div>

              <div class="mt-4 rounded-[9px] border border-line bg-accent/30 p-3">
                <div class="flex items-center justify-between text-[11px]">
                  <span class="text-muted">Daily budget</span>
                  <span class="font-semibold text-ink">Rp {{ form.budget.toLocaleString("id-ID") }}</span>
                </div>
                <div class="mt-2 h-1.5 overflow-hidden rounded-full bg-line">
                  <div class="bar-grow h-full rounded-full" :class="plan.cost <= form.budget ? 'bg-primary' : 'bg-danger'" :style="{ width: `${Math.min(100, (plan.cost / form.budget) * 100)}%` }" />
                </div>
                <p class="mt-2 text-[10px] text-muted">
                  {{ plan.cost <= form.budget ? `Rp ${(form.budget - plan.cost).toLocaleString("id-ID")} left in the budget` : `Rp ${(plan.cost - form.budget).toLocaleString("id-ID")} over budget` }}
                </p>
              </div>

              <div class="mt-4 flex flex-col gap-2 sm:flex-row">
                <RouterLink to="/register" class="btn btn-primary flex-1">
                  Save this plan
                  <ArrowRight :size="15" />
                </RouterLink>
                <RouterLink to="/explore" class="btn btn-outline flex-1"> Browse more meals </RouterLink>
              </div>

              <p class="mt-3 text-center text-[9.5px] leading-4 text-muted">Trial preview only. Nutrition and cost values are estimates.</p>
            </div>
          </Transition>
        </div>
      </div>
    </section>

    <section class="pb-16 lg:pb-24">
      <div class="shell">
        <div v-reveal class="cta-surface-dark relative overflow-hidden rounded-[20px] px-6 py-10 shadow-[0_30px_70px_-40px_rgba(6,59,0,.65)] sm:px-10 lg:py-12">
          <div class="pointer-events-none absolute inset-0 texture-dots-light opacity-30" />
          <div class="relative z-10 max-w-xl">
            <p class="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/70">Keep the momentum</p>
            <h2 class="mt-3 text-balance text-[clamp(1.8rem,3.4vw,2.6rem)] font-semibold leading-[1.05] tracking-[-0.045em] text-white">Save your plan, pantry, and progress in one account.</h2>
            <div class="mt-6 flex flex-wrap gap-3">
              <RouterLink to="/register" class="btn btn-primary">
                Create my account
                <ArrowRight :size="16" />
              </RouterLink>
              <RouterLink to="/features" class="btn border-white/40 bg-white/10 text-white backdrop-blur hover:bg-white/20"> See all features </RouterLink>
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>
