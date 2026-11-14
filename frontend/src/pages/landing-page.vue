<script setup>
import { ArrowRight, ArrowUpRight, BadgeCheck, CalendarDays, Check, ChefHat, ClipboardCheck, HeartPulse, Leaf, ListChecks, Play, ShoppingBasket, Star, Timer, TrendingUp, Utensils, Wallet } from "lucide-vue-next";
import heroImage from "../assets/images/hero/landing-hero.png";
import illustration from "../assets/images/illustrations/planner-shopping.png";
import FoodVisual from "../components/food-visual.vue";
import AnimatedNumber from "../components/animated-number.vue";
import { formatRupiah, mealCatalog } from "../lib/meal-data.js";

const trustCards = [
  {
    icon: HeartPulse,
    title: "Balanced nutrition",
    description: "Calories and macronutrients are calculated automatically for every meal you plan.",
  },
  {
    icon: Wallet,
    title: "Budget aware",
    description: "See the real cost of each menu before you shop, so healthy eating never breaks the bank.",
  },
  {
    icon: ClipboardCheck,
    title: "Organized for you",
    description: "Pantry, shopping list, and meal schedule stay connected in one calm daily flow.",
  },
];

const features = [
  {
    icon: ChefHat,
    title: "Smart meal plans",
    description: "Tell us your goal, budget, and preferences. Leaflow builds a plan that fits your routine.",
    accent: "bg-accent text-primary-deep",
  },
  {
    icon: Wallet,
    title: "Budget-first menus",
    description: "Transparent prices per portion and per day help you decide before you spend.",
    accent: "bg-warning/10 text-warning",
  },
  {
    icon: ShoppingBasket,
    title: "Pantry connected",
    description: "Track what you already have and let your shopping list update itself automatically.",
    accent: "bg-accent text-primary-deep",
  },
  {
    icon: TrendingUp,
    title: "Progress you can see",
    description: "Daily nutrition reports and spending trends keep your goals visible and realistic.",
    accent: "bg-accent text-primary-deep",
  },
];

const steps = [
  {
    title: "Set your goal",
    description: "Choose your nutrition focus, daily budget, and the meals you want to include.",
    icon: HeartPulse,
  },
  {
    title: "Generate your plan",
    description: "Leaflow matches meals to your targets and turns them into a practical schedule.",
    icon: ListChecks,
  },
  {
    title: "Shop, cook, and track",
    description: "Follow your list, prepare each meal, and watch your progress update in real time.",
    icon: Check,
  },
];

const previewMeals = ["pecel-rice", "salmon-bowl", "overnight-oats"].map((id) => mealCatalog.find((meal) => meal.id === id)).filter(Boolean);
</script>

<template>
  <div class="overflow-x-clip">
    <!-- Hero -->
    <section class="hero-surface-dark relative overflow-hidden">
      <div class="pointer-events-none absolute inset-0 texture-grid-light opacity-50" />

      <div class="shell relative grid items-center gap-14 pb-16 pt-28 sm:pt-32 lg:grid-cols-[1.03fr_0.97fr] lg:gap-12 lg:pb-20 lg:pt-36">
        <div class="max-w-2xl">
          <div
            v-reveal
            class="inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-3.5 py-1.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-white/90 shadow-[0_10px_30px_-24px_rgba(0,0,0,.5)] backdrop-blur"
          >
            <Leaf :size="13" class="text-secondary" />
            Nutrition planning, simplified
          </div>

          <h1 v-reveal="{ delay: 60 }" class="mt-6 text-balance text-[clamp(2.9rem,6.2vw,5rem)] font-semibold leading-[0.96] tracking-[-0.055em] text-white">
            Eat well every day,
            <span class="text-secondary">with meals that fit your life.</span>
          </h1>

          <p v-reveal="{ delay: 120 }" class="mt-6 max-w-xl text-pretty text-[15px] leading-7 text-white/75 sm:text-base">
            Leaflow turns your goals, budget, and pantry into a clear meal plan with nutrition counted, prices visible, and every shopping trip planned ahead.
          </p>

          <div v-reveal="{ delay: 180 }" class="mt-8 flex flex-wrap items-center gap-3">
            <RouterLink to="/register" class="btn btn-primary btn-lg">
              Start planning free
              <ArrowRight :size="17" />
            </RouterLink>
            <RouterLink to="/explore" class="btn border-white/30 bg-white/10 text-white backdrop-blur hover:bg-white/20 btn-lg">
              <Utensils :size="16" />
              Browse meals
            </RouterLink>
          </div>

          <div v-reveal="{ delay: 240 }" class="mt-10 flex flex-wrap items-center gap-5 text-sm text-white/65">
            <div class="flex items-center">
              <span
                v-for="(initial, index) in ['A', 'R', 'D', 'S']"
                :key="initial"
                class="grid h-9 w-9 place-items-center rounded-full border-2 border-white/30 text-[11px] font-semibold text-white"
                :class="['bg-white/15', index === 1 ? 'bg-primary/30' : '', index === 2 ? 'bg-warning/25' : '', index === 3 ? 'bg-secondary/30' : '', index > 0 ? '-ml-2.5' : '']"
              >
                {{ initial }}
              </span>
            </div>
            <div>
              <div class="flex items-center gap-1 text-warning">
                <Star v-for="i in 5" :key="i" :size="13" fill="currentColor" />
                <span class="ml-1 text-xs font-semibold text-white">4.9</span>
              </div>
              <p class="mt-0.5 text-xs text-white/70">From 2,400+ meals planned this month</p>
            </div>
          </div>
        </div>

        <div v-reveal="{ delay: 120 }" class="relative mx-auto w-full max-w-[520px]">
          <div class="relative overflow-hidden rounded-[20px] border border-white/80 bg-[linear-gradient(160deg,var(--color-canvas)_0%,var(--color-accent)_58%,var(--color-canvas)_100%)] p-3 shadow-[0_40px_90px_-48px_rgba(6,59,0,.7)]">
            <div class="relative overflow-hidden rounded-[14px] bg-accent/70">
              <div class="absolute inset-0 texture-dots opacity-40" />
              <img :src="heroImage" alt="Healthy meal planning with Leaflow" class="relative z-10 mx-auto h-105 w-full object-contain object-bottom sm:h-108" />
              <div class="absolute left-4 top-4 z-20 flex items-center gap-2 rounded-[10px] bg-white/90 px-3 py-2 text-[11px] font-semibold text-ink shadow-sm backdrop-blur">
                <span class="grid h-7 w-7 place-items-center rounded-lg bg-accent text-primary-deep">
                  <Leaf :size="14" />
                </span>
                Today's plan is ready
              </div>
            </div>
          </div>

          <div class="float-soft absolute -left-4 bottom-14 z-20 w-[190px] rounded-[14px] border border-line bg-white/95 p-4 shadow-[0_24px_50px_-30px_rgba(6,59,0,.55)] backdrop-blur sm:-left-10">
            <div class="flex items-center justify-between">
              <p class="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted">Calories</p>
              <HeartPulse :size="15" class="text-primary" />
            </div>
            <p class="mt-2 text-[1.65rem] font-semibold tracking-[-0.05em] text-ink">
              <AnimatedNumber :value="1420" />
              <span class="text-xs font-medium text-muted">/ 2,000</span>
            </p>
            <div class="mt-3 h-1.5 overflow-hidden rounded-full bg-accent">
              <div class="bar-grow h-full w-[71%] rounded-full bg-primary" />
            </div>
            <p class="mt-2 text-[10px] text-muted">580 kcal left for dinner</p>
          </div>

          <div class="float-soft-slow absolute -right-2 top-16 z-20 w-[176px] rounded-[14px] border border-line bg-white/95 p-4 shadow-[0_24px_50px_-30px_rgba(6,59,0,.55)] backdrop-blur sm:-right-8">
            <div class="flex items-center justify-between">
              <p class="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted">Daily budget</p>
              <Wallet :size="15" class="text-warning" />
            </div>
            <p class="mt-2 text-[1.35rem] font-semibold tracking-[-0.04em] text-ink">
              <AnimatedNumber :value="52000" prefix="Rp " />
            </p>
            <p class="mt-1 text-[10px] text-muted">left of Rp 75,000</p>
            <div class="mt-3 flex items-end gap-1">
              <span
                v-for="(height, index) in [42, 64, 48, 78, 56, 88, 68]"
                :key="index"
                class="bar-rise w-3 rounded-t bg-primary/70"
                :style="{
                  height: `${height * 0.34}px`,
                  animationDelay: `${index * 70 + 300}ms`,
                }"
              />
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Trust / contrast cards -->
    <section class="relative pb-10 lg:pb-12">
      <div class="shell">
        <div class="relative overflow-hidden rounded-[20px] border border-primary/15 bg-accent/40 p-4 shadow-[0_30px_70px_-50px_rgba(6,59,0,.55)] sm:p-6">
          <div class="pointer-events-none absolute inset-0 texture-dots opacity-30" />
          <div class="relative grid gap-3 md:grid-cols-3">
            <article
              v-for="(card, index) in trustCards"
              :key="card.title"
              v-reveal="{ delay: index * 90 }"
              class="group relative overflow-hidden rounded-[14px] border border-white/90 bg-white p-5 shadow-[0_18px_40px_-32px_rgba(6,59,0,.45)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_26px_50px_-32px_rgba(6,59,0,.5)]"
            >
              <span class="absolute inset-x-0 top-0 h-1 bg-[linear-gradient(90deg,var(--color-primary),var(--color-secondary),var(--color-primary))]" />
              <div class="flex items-start justify-between gap-4">
                <span class="grid h-11 w-11 shrink-0 place-items-center rounded-[10px] bg-primary text-white shadow-[0_12px_24px_-16px_rgba(6,59,0,.7)]">
                  <component :is="card.icon" :size="20" :stroke-width="2" />
                </span>
                <span class="text-[11px] font-semibold tracking-[0.16em] text-primary-deep/50"> 0{{ index + 1 }} </span>
              </div>
              <h3 class="mt-4 text-[1.05rem] font-semibold tracking-[-0.02em] text-ink">
                {{ card.title }}
              </h3>
              <p class="mt-1.5 text-[13px] leading-6 text-muted">
                {{ card.description }}
              </p>
            </article>
          </div>
        </div>
      </div>
    </section>

    <!-- Features -->
    <section class="relative py-16 lg:py-20">
      <div class="shell">
        <div class="max-w-2xl">
          <p v-reveal class="eyebrow">Everything in one flow</p>
          <h2 v-reveal="{ delay: 50 }" class="mt-3 text-balance text-[clamp(1.95rem,3.6vw,2.9rem)] font-semibold leading-[1.04] tracking-[-0.045em]">Meal planning that fits your real life.</h2>
          <p v-reveal="{ delay: 100 }" class="mt-4 max-w-xl text-[14.5px] leading-7 text-muted">Nutrition, budget, and pantry—connected in one clear plan.</p>
        </div>

        <div class="mt-10 grid gap-4 md:grid-cols-2">
          <article
            v-for="(feature, index) in features"
            :key="feature.title"
            v-reveal="{ delay: index * 70 }"
            class="group flex gap-4 rounded-[16px] border border-line bg-white p-5 transition duration-300 hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-[0_24px_50px_-38px_rgba(6,59,0,.45)] sm:p-6"
          >
            <span class="grid h-12 w-12 shrink-0 place-items-center rounded-[10px]" :class="feature.accent">
              <component :is="feature.icon" :size="21" />
            </span>
            <div>
              <h3 class="text-base font-semibold tracking-[-0.02em] text-ink">
                {{ feature.title }}
              </h3>
              <p class="mt-1.5 text-[13px] leading-6 text-muted">
                {{ feature.description }}
              </p>
            </div>
          </article>
        </div>
      </div>
    </section>

    <!-- How it works -->
    <section class="cta-surface-dark relative overflow-hidden py-16 text-white lg:py-20">
      <div class="pointer-events-none absolute inset-0 texture-dots-light opacity-20" />
      <div class="pointer-events-none absolute -left-20 top-0 h-72 w-72 rounded-full bg-white/10 blur-3xl" />
      <div class="pointer-events-none absolute -right-16 bottom-0 h-80 w-80 rounded-full bg-secondary/20 blur-3xl" />
      <div class="shell relative grid gap-10 lg:grid-cols-[1fr_1.2fr] lg:items-center">
        <div>
          <p v-reveal class="text-[11px] font-semibold uppercase tracking-[0.18em] text-accent">How it works</p>
          <h2 v-reveal="{ delay: 50 }" class="mt-3 max-w-lg text-balance text-[clamp(1.95rem,3.6vw,2.9rem)] font-semibold leading-[1.04] tracking-[-0.045em] text-white">Three simple steps to a calmer kitchen.</h2>

          <div class="mt-8 space-y-3">
            <div v-for="(step, index) in steps" :key="step.title" v-reveal="{ delay: 100 + index * 80 }" class="flex gap-4 rounded-[14px] border border-white/15 bg-white/[0.08] p-4 backdrop-blur sm:p-5">
              <span class="grid h-11 w-11 shrink-0 place-items-center rounded-[10px] bg-white/15 text-white">
                <component :is="step.icon" :size="19" />
              </span>
              <div>
                <p class="text-[11px] font-semibold uppercase tracking-[0.16em] text-white/60">Step {{ index + 1 }}</p>
                <h3 class="mt-1 text-[15px] font-semibold text-white">{{ step.title }}</h3>
                <p class="mt-1 text-[13px] leading-6 text-white/70">{{ step.description }}</p>
              </div>
            </div>
          </div>

          <RouterLink v-reveal="{ delay: 360 }" to="/trial" class="mt-7 inline-flex items-center gap-2 text-sm font-semibold text-accent transition hover:gap-3 hover:text-white">
            See how the AI planner works
            <ArrowUpRight :size="16" />
          </RouterLink>
        </div>

        <div v-reveal="{ delay: 120 }" class="relative">
            <div class="absolute -inset-3 rounded-[24px] bg-primary/15 blur-2xl" />
            <div class="relative overflow-hidden rounded-[20px] border border-line bg-white shadow-[0_36px_80px_-52px_rgba(6,59,0,.6)]">
              <div class="flex items-center justify-between border-b border-line bg-accent/40 px-5 py-4">
                <div>
                  <p class="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted">Today's meals</p>
                  <p class="mt-0.5 text-sm font-semibold text-ink">Thursday, 13 November</p>
                </div>
                <span class="grid h-9 w-9 place-items-center rounded-[10px] bg-accent text-primary-deep">
                  <CalendarDays :size="18" />
                </span>
              </div>

              <div class="divide-y divide-line">
                <div v-for="meal in previewMeals" :key="meal.id" class="flex items-center gap-3 px-5 py-3.5">
                  <span class="h-12 w-12 shrink-0 overflow-hidden rounded-[10px] bg-accent">
                    <FoodVisual :image="meal.image" :colors="meal.colors" :label="meal.name" />
                  </span>
                  <div class="min-w-0 flex-1">
                    <p class="truncate text-[13px] font-semibold text-ink">{{ meal.name }}</p>
                    <p class="mt-0.5 flex items-center gap-2 text-[11px] text-muted">
                      <span>{{ meal.category }}</span>
                      <span class="h-1 w-1 rounded-full bg-line-strong" />
                      <span class="inline-flex items-center gap-1">
                        <Timer :size="11" />
                        {{ meal.time }} min
                      </span>
                    </p>
                  </div>
                  <div class="text-right">
                    <p class="text-[12px] font-semibold text-ink">{{ meal.calories }} kcal</p>
                    <p class="mt-0.5 text-[11px] text-muted">{{ formatRupiah(meal.price) }}</p>
                  </div>
                </div>
              </div>

              <div class="flex items-center justify-between bg-accent/40 px-5 py-4">
                <div class="flex items-center gap-2 text-[12px] font-medium text-ink">
                  <BadgeCheck :size="16" class="text-primary" />
                  Within today's budget
                </div>
                <span class="rounded-full bg-accent px-3 py-1 text-[11px] font-semibold text-primary-deep"> <AnimatedNumber :value="1420" /> kcal </span>
              </div>
            </div>

            <div class="absolute -bottom-5 -left-3 hidden items-center gap-2 rounded-[12px] border border-line bg-white px-4 py-3 shadow-[0_20px_40px_-30px_rgba(6,59,0,.6)] sm:flex">
              <span class="grid h-8 w-8 place-items-center rounded-lg bg-warning/10 text-warning">
                <Wallet :size="16" />
              </span>
              <div>
                <p class="text-[10px] uppercase tracking-[0.12em] text-muted">Saved this week</p>
                <p class="text-sm font-semibold text-ink">Rp 168,000</p>
              </div>
            </div>
          </div>
        </div>
    </section>

    <!-- Meal preview -->
    <section class="py-16 lg:py-20">
      <div class="shell">
        <div class="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
          <div class="max-w-xl">
            <p v-reveal class="eyebrow">Explore the menu</p>
            <h2 v-reveal="{ delay: 50 }" class="mt-3 text-balance text-[clamp(1.95rem,3.6vw,2.9rem)] font-semibold leading-[1.04] tracking-[-0.045em]">Meals that are good for you and your wallet.</h2>
          </div>
          <RouterLink v-reveal="{ delay: 100 }" to="/explore" class="inline-flex items-center gap-2 text-sm font-semibold text-primary-deep transition hover:gap-3">
            View all meals
            <ArrowRight :size="16" />
          </RouterLink>
        </div>

        <div class="mt-9 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <article
            v-for="(meal, index) in previewMeals"
            :key="meal.id"
            v-reveal="{ delay: index * 80 }"
            class="group overflow-hidden rounded-[16px] border border-line bg-white transition duration-300 hover:-translate-y-1 hover:shadow-[0_30px_60px_-40px_rgba(6,59,0,.5)]"
          >
            <div class="relative h-48 overflow-hidden bg-accent/30">
              <div class="absolute inset-0 texture-dots opacity-30" />
              <FoodVisual :image="meal.image" :colors="meal.colors" :label="meal.name" class="relative z-10 transition duration-500 group-hover:scale-105" />
              <span class="absolute left-3 top-3 z-20 rounded-full bg-white/90 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-primary-deep backdrop-blur">
                {{ meal.category }}
              </span>
            </div>
            <div class="p-5">
              <div class="flex items-start justify-between gap-3">
                <h3 class="text-[15px] font-semibold leading-snug text-ink">{{ meal.name }}</h3>
                <span class="shrink-0 text-[13px] font-semibold text-primary-deep">
                  {{ formatRupiah(meal.price) }}
                </span>
              </div>
              <p class="mt-1.5 line-clamp-2 text-[12.5px] leading-6 text-muted">
                {{ meal.description }}
              </p>
              <div class="mt-4 flex items-center gap-3 border-t border-line pt-3 text-[11px] text-muted">
                <span class="inline-flex items-center gap-1">
                  <HeartPulse :size="13" class="text-primary" />
                  {{ meal.calories }} kcal
                </span>
                <span class="inline-flex items-center gap-1">
                  <Timer :size="13" class="text-primary" />
                  {{ meal.time }} min
                </span>
                <span class="inline-flex items-center gap-1">
                  <Utensils :size="13" class="text-primary" />
                  {{ meal.protein }}g protein
                </span>
              </div>
            </div>
          </article>
        </div>
      </div>
    </section>

    <!-- CTA -->
    <section class="py-14 lg:py-16">
      <div class="shell">
        <div v-reveal class="relative overflow-hidden rounded-[20px] cta-surface-dark px-6 py-10 shadow-[0_30px_70px_-40px_rgba(6,59,0,.65)] sm:px-10 lg:py-12">
          <div class="pointer-events-none absolute inset-0 texture-dots-light opacity-30" />
          <div class="relative z-10 max-w-xl">
            <p class="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/70">Ready when you are</p>
            <h2 class="mt-3 text-balance text-[clamp(1.9rem,3.5vw,2.7rem)] font-semibold leading-[1.05] tracking-[-0.045em] text-white">Your next week of meals can already be planned.</h2>
            <p class="mt-3 max-w-lg text-sm leading-7 text-white/80">Start with your goal and budget. Leaflow handles the math, the menu, and the shopping list.</p>
            <div class="mt-7 flex flex-wrap gap-3">
              <RouterLink to="/register" class="btn btn-primary">
                Create my plan
                <ArrowRight :size="16" />
              </RouterLink>
              <RouterLink to="/trial" class="btn border-white/40 bg-white/10 text-white backdrop-blur hover:bg-white/20">
                <Play :size="15" />
                Try AI Trial
              </RouterLink>
            </div>
          </div>

          <img :src="illustration" alt="" aria-hidden="true" class="pointer-events-none absolute -right-10 bottom-0 hidden h-[135%] w-[42%] object-contain object-bottom opacity-90 lg:block" />
        </div>
      </div>
    </section>
  </div>
</template>
