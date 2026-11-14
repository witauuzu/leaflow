<script setup>
import { computed } from 'vue'
import {
  ArrowUpRight,
  CalendarCheck,
  CalendarPlus,
  CheckCircle2,
  ChevronRight,
  Clock,
  Drumstick,
  Flame,
  Lightbulb,
  Plus,
  ShoppingBasket,
  TrendingUp,
  Utensils,
  Wallet,
} from 'lucide-vue-next'
import HeaderDashboard from '../../../components/header-dashboard.vue'
import FoodVisual from '../../../components/food-visual.vue'
import illustration from '../../../assets/images/illustrations/planner-shopping.png'
import {
  formatRupiah,
  getMealById,
  nutritionSummary,
  weeklyCalories,
} from '../../../lib/meal-data.js'

const today = new Intl.DateTimeFormat('en-US', {
  weekday: 'long',
  month: 'long',
  day: 'numeric',
}).format(new Date())

const stats = [
  {
    label: 'Calories today',
    value: '1,420',
    unit: 'kcal',
    detail: '580 kcal remaining',
    trend: '+6% vs last week',
    icon: Flame,
    tone: 'bg-accent text-primary-deep',
    bar: 'w-[71%] bg-primary',
  },
  {
    label: 'Protein intake',
    value: '86',
    unit: 'g',
    detail: '34 g to reach target',
    trend: 'On track',
    icon: Drumstick,
    tone: 'bg-warning/10 text-warning',
    bar: 'w-[72%] bg-warning',
  },
  {
    label: 'Budget spent',
    value: 'Rp 23k',
    unit: '',
    detail: 'of Rp 75,000 today',
    trend: '31% of budget',
    icon: Wallet,
    tone: 'bg-info/10 text-info',
    bar: 'w-[31%] bg-info',
  },
  {
    label: 'Plan adherence',
    value: '92',
    unit: '%',
    detail: '11 of 12 meals followed',
    trend: 'Best this month',
    icon: CalendarCheck,
    tone: 'bg-accent text-primary-deep',
    bar: 'w-[92%] bg-primary-deep',
  },
]

const todayMeals = nutritionSummary.todayMeals
  .map((item) => ({ ...item, meal: getMealById(item.mealId) }))
  .filter((item) => item.meal)

const chart = computed(() => {
  const width = 640
  const height = 236
  const top = 18
  const bottom = 36
  const left = 10
  const right = 12
  const maxCal = 2200
  const minCal = 1400
  const plotHeight = height - top - bottom
  const plotWidth = width - left - right

  const points = weeklyCalories.map((item, index) => ({
    ...item,
    x: left + (plotWidth / (weeklyCalories.length - 1)) * index,
    y: top + ((maxCal - item.value) / (maxCal - minCal)) * plotHeight,
  }))

  const line = points
    .map((point, index) => `${index === 0 ? 'M' : 'L'} ${point.x.toFixed(1)} ${point.y.toFixed(1)}`)
    .join(' ')

  const area = `${line} L ${points[points.length - 1].x.toFixed(1)} ${height - bottom} L ${
    points[0].x.toFixed(1)
  } ${height - bottom} Z`

  const ticks = [2200, 2000, 1800, 1600].map((value) => ({
    value,
    y: top + ((maxCal - value) / (maxCal - minCal)) * plotHeight,
  }))

  return { width, height, top, bottom, left, right, points, line, area, ticks }
})

const macroGradient = computed(() => {
  const total = nutritionSummary.macros.reduce((sum, item) => sum + item.target, 0)
  let angle = 0

  const stops = nutritionSummary.macros.map((macro) => {
    const start = (angle / total) * 360
    angle += macro.target
    const end = (angle / total) * 360
    return `${macro.color} ${start.toFixed(1)}deg ${end.toFixed(1)}deg`
  })

  return `conic-gradient(${stops.join(', ')})`
})

const budgetCategories = [
  { label: 'Groceries', amount: 12000, width: '52%', color: 'bg-primary' },
  { label: 'Eating out', amount: 8000, width: '35%', color: 'bg-info' },
  { label: 'Snacks', amount: 3000, width: '13%', color: 'bg-warning' },
]

const suggestions = [
  {
    title: 'Add 20 g of protein to dinner',
    detail: 'A boiled egg or 100 g of tofu keeps you close to target.',
    icon: Drumstick,
    tone: 'bg-accent text-primary-deep',
  },
  {
    title: 'Use spinach before it spoils',
    detail: 'It is the oldest item in your pantry this week.',
    icon: ShoppingBasket,
    tone: 'bg-accent text-primary-deep',
  },
  {
    title: 'Swap your snack for fruit',
    detail: 'Save around Rp 6,000 and add 4 g of fiber.',
    icon: Lightbulb,
    tone: 'bg-warning/10 text-warning',
  },
]
</script>

<template>
  <div class="p-7">
    <HeaderDashboard
      title="Dashboard Overview"
      description="Your daily nutrition, budget, and meal plan at a glance."
    />

    <main class="mt-7 space-y-4">
      <!-- Greeting banner -->
      <section
        class="brand-gradient-horizontal relative flex min-h-[150px] items-center overflow-hidden rounded-[10px] px-6 py-5"
      >
        <div class="relative z-10 max-w-[64%]">
          <p class="text-[10px] font-semibold uppercase tracking-[0.18em] text-white/70">
            {{ today }}
          </p>
          <h2 class="mt-2 text-xl font-semibold leading-snug tracking-[-0.03em] text-white sm:text-2xl">
            Good morning, {{ nutritionSummary.name.split(' ')[0] }}.
          </h2>
          <p class="mt-1 max-w-md text-xs leading-6 text-white/85">
            You have already covered 71% of your calorie target. Two meals left,
            and your budget is still comfortable.
          </p>
          <RouterLink
            to="/dashboard/planner/create"
            class="mt-4 inline-flex items-center gap-2 rounded-md bg-white px-4 py-2 text-xs font-semibold text-primary-deep transition hover:bg-accent/40"
          >
            <CalendarPlus :size="14" />
            Plan this week
          </RouterLink>
        </div>

        <img
          :src="illustration"
          alt=""
          aria-hidden="true"
          class="pointer-events-none absolute -right-6 top-0 h-[150%] w-[42%] object-contain object-center opacity-90"
        />
      </section>

      <!-- Stat cards -->
      <section class="grid gap-[15px] sm:grid-cols-2 xl:grid-cols-4">
        <article
          v-for="stat in stats"
          :key="stat.label"
          class="rounded-[10px] border border-line bg-white p-5"
        >
          <div class="flex items-start justify-between gap-3">
            <div>
              <p class="text-[11px] font-medium uppercase tracking-[0.1em] text-muted">
                {{ stat.label }}
              </p>
              <p class="mt-2 text-[1.6rem] font-semibold leading-none tracking-[-0.04em] text-ink">
                {{ stat.value }}
                <span v-if="stat.unit" class="text-xs font-medium text-muted">{{ stat.unit }}</span>
              </p>
            </div>
            <span class="grid h-10 w-10 shrink-0 place-items-center rounded-[9px]" :class="stat.tone">
              <component :is="stat.icon" :size="19" />
            </span>
          </div>

          <div class="mt-4 h-1.5 overflow-hidden rounded-full bg-accent">
            <div class="h-full rounded-full" :class="stat.bar" />
          </div>

          <div class="mt-2.5 flex items-center justify-between gap-2 text-[10.5px]">
            <span class="text-muted">{{ stat.detail }}</span>
            <span class="inline-flex shrink-0 items-center gap-1 font-medium text-primary-deep">
              <TrendingUp :size="11" />
              {{ stat.trend }}
            </span>
          </div>
        </article>
      </section>

      <!-- Main grid -->
      <div class="grid gap-[15px] xl:grid-cols-[minmax(0,1.55fr)_minmax(280px,1fr)]">
        <div class="flex min-w-0 flex-col gap-[15px]">
          <!-- Weekly calories -->
          <section class="rounded-[10px] border border-line bg-white p-5">
            <div class="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h2 class="text-sm font-semibold text-ink">Weekly calorie intake</h2>
                <p class="mt-0.5 text-[11px] text-muted">Daily total against your 2,000 kcal target</p>
              </div>
              <div class="flex items-center gap-2 text-[11px] text-muted">
                <span class="inline-flex items-center gap-1.5">
                  <span class="h-2 w-2 rounded-full bg-primary" />
                  This week
                </span>
                <span class="inline-flex items-center gap-1.5">
                  <span class="h-2 w-2 rounded-full border border-dashed border-line-strong" />
                  Target
                </span>
              </div>
            </div>

            <div class="mt-4 overflow-x-auto no-scrollbar">
              <svg
                :viewBox="`0 0 ${chart.width} ${chart.height}`"
                class="h-auto w-full min-w-[520px]"
                role="img"
                aria-label="Weekly calorie intake chart"
              >
                <defs>
                  <linearGradient id="calorieFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" class="text-primary" stop-color="currentColor" stop-opacity="0.32" />
                    <stop offset="100%" class="text-primary" stop-color="currentColor" stop-opacity="0" />
                  </linearGradient>
                </defs>

                <line
                  v-for="tick in chart.ticks"
                  :key="tick.value"
                  :x1="chart.left"
                  :x2="chart.width - chart.right"
                  :y1="tick.y"
                  :y2="tick.y"
                  class="stroke-line"
                  stroke-width="1"
                  stroke-dasharray="4 5"
                />

                <path :d="chart.area" fill="url(#calorieFill)" />
                <path
                  :d="chart.line"
                  fill="none"
                  class="stroke-primary-hover"
                  stroke-width="3"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />

                <g v-for="point in chart.points" :key="point.day">
                  <circle :cx="point.x" :cy="point.y" r="8" class="fill-canvas" />
                  <circle :cx="point.x" :cy="point.y" r="4.5" class="fill-primary" />
                  <text
                    :x="point.x"
                    :y="chart.height - 12"
                    text-anchor="middle"
                    font-size="11"
                    class="fill-muted"
                  >
                    {{ point.day }}
                  </text>
                </g>
              </svg>
            </div>

            <div class="mt-2 flex flex-wrap items-center justify-between gap-2 border-t border-line pt-3 text-[11px] text-muted">
              <span>Weekly average: <strong class="font-semibold text-ink">1,834 kcal</strong></span>
              <span class="inline-flex items-center gap-1 font-medium text-primary-deep">
                <CheckCircle2 :size="13" />
                Within target range on 6 of 7 days
              </span>
            </div>
          </section>

          <!-- Today's meals -->
          <section class="rounded-[10px] border border-line bg-white p-5">
            <div class="mb-4 flex items-center justify-between gap-3">
              <div>
                <h2 class="text-sm font-semibold text-ink">Today's meals</h2>
                <p class="mt-0.5 text-[11px] text-muted">A calm, ready-to-follow plan</p>
              </div>
              <RouterLink
                to="/dashboard/planner"
                class="inline-flex items-center gap-1 text-[11px] font-medium text-primary-deep transition hover:text-ink"
              >
                Open planner
                <ChevronRight :size="14" />
              </RouterLink>
            </div>

            <div class="grid gap-2 sm:grid-cols-2">
              <div
                v-for="item in todayMeals"
                :key="item.slot"
                class="flex items-center gap-3 rounded-[10px] border border-line p-3 transition hover:border-primary/30 hover:bg-accent/30"
              >
                <span class="h-12 w-12 shrink-0 overflow-hidden rounded-[9px] bg-accent">
                  <FoodVisual :image="item.meal.image" :colors="item.meal.colors" :label="item.meal.name" />
                </span>
                <div class="min-w-0 flex-1">
                  <p class="flex items-center gap-1.5 text-[10px] font-medium uppercase tracking-[0.08em] text-muted">
                    {{ item.slot }}
                    <span class="h-1 w-1 rounded-full bg-line-strong" />
                    <Clock :size="10" />
                    {{ item.time }}
                  </p>
                  <p class="mt-0.5 truncate text-[12.5px] font-semibold text-ink">
                    {{ item.meal.name }}
                  </p>
                  <p class="mt-0.5 text-[10.5px] text-muted">
                    {{ item.meal.calories }} kcal · {{ item.meal.protein }}g protein
                  </p>
                </div>
                <span class="shrink-0 text-[11px] font-semibold text-primary-deep">
                  {{ formatRupiah(item.meal.price) }}
                </span>
              </div>
            </div>
          </section>
        </div>

        <!-- Side column -->
        <div class="flex min-w-0 flex-col gap-[15px]">
          <!-- Macro breakdown -->
          <section class="rounded-[10px] border border-line bg-white p-5">
            <div class="flex items-center justify-between gap-3">
              <div>
                <h2 class="text-sm font-semibold text-ink">Macro balance</h2>
                <p class="mt-0.5 text-[11px] text-muted">Target split for today</p>
              </div>
              <span class="grid h-8 w-8 place-items-center rounded-lg bg-accent text-primary-deep">
                <Utensils :size="16" />
              </span>
            </div>

            <div class="mt-5 flex items-center gap-5">
              <div class="relative grid h-[118px] w-[118px] shrink-0 place-items-center">
                <div class="absolute inset-0 rounded-full" :style="{ background: macroGradient }" />
                <div class="absolute inset-[13px] grid place-items-center rounded-full bg-white">
                  <div class="text-center">
                    <p class="text-[1.15rem] font-semibold leading-none tracking-[-0.04em] text-ink">
                      1,420
                    </p>
                    <p class="mt-1 text-[9px] uppercase tracking-[0.1em] text-muted">of 2,000 kcal</p>
                  </div>
                </div>
              </div>

              <div class="min-w-0 flex-1 space-y-3">
                <div v-for="macro in nutritionSummary.macros" :key="macro.label">
                  <div class="flex items-center justify-between text-[11px]">
                    <span class="flex items-center gap-1.5 text-muted">
                      <span class="h-2 w-2 rounded-full" :style="{ background: macro.color }" />
                      {{ macro.label }}
                    </span>
                    <span class="font-medium text-ink">{{ macro.value }} / {{ macro.target }}g</span>
                  </div>
                  <div class="mt-1.5 h-1.5 overflow-hidden rounded-full bg-accent">
                    <div
                      class="h-full rounded-full"
                      :style="{
                        width: `${Math.min(100, (macro.value / macro.target) * 100)}%`,
                        background: macro.color,
                      }"
                    />
                  </div>
                </div>
              </div>
            </div>
          </section>

          <!-- Budget -->
          <section class="rounded-[10px] border border-line bg-white p-5">
            <div class="flex items-center justify-between gap-3">
              <div>
                <h2 class="text-sm font-semibold text-ink">Today's budget</h2>
                <p class="mt-0.5 text-[11px] text-muted">Rp 23,000 spent · Rp 52,000 left</p>
              </div>
              <RouterLink
                to="/dashboard/track"
                aria-label="View spending report"
                class="grid h-8 w-8 place-items-center rounded-lg bg-accent text-primary-deep transition hover:bg-secondary/40"
              >
                <ArrowUpRight :size="16" />
              </RouterLink>
            </div>

            <div class="mt-4 h-2 overflow-hidden rounded-full bg-accent">
              <div class="h-full w-[31%] rounded-full bg-[linear-gradient(90deg,var(--color-primary),var(--color-primary-hover))]" />
            </div>
            <div class="mt-2 flex items-center justify-between text-[10.5px] text-muted">
              <span>31% used</span>
              <span>Rp 52,000 remaining</span>
            </div>

            <div class="mt-5 space-y-3">
              <div v-for="category in budgetCategories" :key="category.label">
                <div class="flex items-center justify-between text-[11px]">
                  <span class="flex items-center gap-1.5 text-muted">
                    <span class="h-2 w-2 rounded-full" :class="category.color" />
                    {{ category.label }}
                  </span>
                  <span class="font-medium text-ink">{{ formatRupiah(category.amount) }}</span>
                </div>
                <div class="mt-1.5 h-1.5 overflow-hidden rounded-full bg-accent">
                  <div class="h-full rounded-full" :class="[category.color, category.width]" />
                </div>
              </div>
            </div>
          </section>

          <!-- Suggestions -->
          <section class="rounded-[10px] border border-line bg-white p-5">
            <div class="flex items-center justify-between gap-3">
              <div>
                <h2 class="text-sm font-semibold text-ink">Smart suggestions</h2>
                <p class="mt-0.5 text-[11px] text-muted">Small adjustments, better days</p>
              </div>
              <span class="grid h-8 w-8 place-items-center rounded-lg bg-warning/10 text-warning">
                <Lightbulb :size="16" />
              </span>
            </div>

            <div class="mt-4 space-y-2">
              <div
                v-for="suggestion in suggestions"
                :key="suggestion.title"
                class="flex gap-3 rounded-[9px] border border-line p-3 transition hover:bg-accent/30"
              >
                <span
                  class="grid h-8 w-8 shrink-0 place-items-center rounded-lg"
                  :class="suggestion.tone"
                >
                  <component :is="suggestion.icon" :size="15" />
                </span>
                <div class="min-w-0">
                  <p class="text-[12px] font-semibold leading-5 text-ink">
                    {{ suggestion.title }}
                  </p>
                  <p class="mt-0.5 text-[10.5px] leading-5 text-muted">
                    {{ suggestion.detail }}
                  </p>
                </div>
              </div>
            </div>

            <RouterLink
              to="/dashboard/explore"
              class="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-md border border-line px-3 py-2 text-[11.5px] font-semibold text-ink transition hover:border-primary/40 hover:bg-accent"
            >
              <Plus :size="14" />
              Find a better meal
            </RouterLink>
          </section>
        </div>
      </div>
    </main>
  </div>
</template>
