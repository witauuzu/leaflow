<script setup>
import { ArrowRight, BarChart3, CalendarDays, Check, ChefHat, Clock, HeartPulse, Leaf, ShieldCheck, ShoppingBasket, Wallet } from "lucide-vue-next";
import AnimatedNumber from "../components/animated-number.vue";
import illustration from "../assets/images/illustrations/planner-shopping.png";

const features = [
  {
    icon: ChefHat,
    title: "Meal plans that fit you",
    description: "Generate a weekly menu from your goal, budget, cooking time, and food preferences.",
    tone: "bg-accent text-primary-deep",
  },
  {
    icon: Wallet,
    title: "Cost visible from the start",
    description: "Every meal shows an estimated portion price before you add it to your shopping list.",
    tone: "bg-warning/10 text-warning",
  },
  {
    icon: ShoppingBasket,
    title: "Pantry-aware shopping",
    description: "Log what you already have and Leaflow adapts the list so you buy only what is missing.",
    tone: "bg-accent text-primary-deep",
  },
  {
    icon: BarChart3,
    title: "Nutrition counted for you",
    description: "Calories, protein, carbs, and fat are calculated automatically for every plan.",
    tone: "bg-accent text-primary-deep",
  },
  {
    icon: CalendarDays,
    title: "A schedule you can follow",
    description: "Meals are placed into a realistic daily rhythm instead of an overwhelming list.",
    tone: "bg-accent text-primary-deep",
  },
  {
    icon: HeartPulse,
    title: "Progress that stays visible",
    description: "See how your intake and spending move over time, with suggestions when you drift.",
    tone: "bg-danger/10 text-danger",
  },
];

const highlights = ["Personal goals, budget, and dietary needs in one profile", "Automatic shopping list that respects your pantry", "Daily nutrition and budget summaries you can actually read", "Flexible plans when your week changes"];

const stats = [
  { value: 2400, suffix: "+", label: "Meals planned" },
  { value: 92, suffix: "%", label: "Stay within budget" },
  { value: 8, suffix: " min", label: "To build a plan" },
];
</script>

<template>
  <div class="overflow-x-clip">
    <section class="hero-surface relative overflow-hidden pb-16 pt-32 lg:pb-20 lg:pt-36">
      <div class="pointer-events-none absolute inset-0 texture-grid opacity-60" />
      <div class="pointer-events-none absolute -left-32 top-20 h-80 w-80 rounded-full bg-primary/20 blur-3xl" />
      <div class="pointer-events-none absolute -right-20 top-24 h-72 w-72 rounded-full bg-secondary/20 blur-3xl" />

      <div class="shell relative grid items-center gap-12 lg:grid-cols-[1fr_0.9fr]">
        <div>
          <div v-reveal class="inline-flex items-center gap-2 rounded-full border border-primary/25 bg-white/70 px-3.5 py-1.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-primary-deep backdrop-blur">
            <Leaf :size="13" />
            Built around your routine
          </div>

          <h1 v-reveal="{ delay: 60 }" class="mt-6 max-w-2xl text-balance text-[clamp(2.6rem,5.4vw,4.4rem)] font-semibold leading-[1.02] tracking-tighter">Everything you need to eat well, in one flow.</h1>

          <p v-reveal="{ delay: 120 }" class="mt-5 max-w-lg text-[15px] leading-7 text-muted">Leaflow connects your nutrition goals, food budget, pantry, and schedule so planning meals stops feeling like another job.</p>

          <div v-reveal="{ delay: 180 }" class="mt-7 flex flex-wrap gap-3">
            <RouterLink to="/register" class="btn btn-ink btn-lg">
              Start planning free
              <ArrowRight :size="16" />
            </RouterLink>
            <RouterLink to="/trial" class="btn btn-outline btn-lg"> Try the AI trial </RouterLink>
          </div>
        </div>

        <div v-reveal="{ delay: 120 }" class="relative mx-auto w-full max-w-120">
          <div class="absolute -inset-4 rounded-3xl bg-[linear-gradient(145deg,rgba(102,187,106,.3),rgba(32,158,249,.12))] blur-2xl" />
          <div class="relative overflow-hidden rounded-[20px] border border-white/80 bg-white/75 p-3 shadow-[0_36px_80px_-48px_rgba(6,59,0,.65)] backdrop-blur">
            <div class="relative overflow-hidden rounded-[14px] bg-accent/60">
              <div class="absolute inset-0 texture-dots opacity-40" />
              <img :src="illustration" alt="Meal planning illustration" class="relative z-10 h-77.5 w-full object-contain p-4" />
            </div>
            <div class="grid grid-cols-3 gap-2 p-3">
              <div class="rounded-[10px] border border-line bg-white p-3 text-center">
                <HeartPulse :size="16" class="mx-auto text-primary" />
                <p class="mt-1 text-sm font-semibold text-ink">1,820</p>
                <p class="text-[9px] text-muted">kcal avg.</p>
              </div>
              <div class="rounded-[10px] border border-line bg-white p-3 text-center">
                <Wallet :size="16" class="mx-auto text-warning" />
                <p class="mt-1 text-sm font-semibold text-ink">Rp 61k</p>
                <p class="text-[9px] text-muted">per day</p>
              </div>
              <div class="rounded-[10px] border border-line bg-white p-3 text-center">
                <Clock :size="16" class="mx-auto text-primary-deep" />
                <p class="mt-1 text-sm font-semibold text-ink">24 min</p>
                <p class="text-[9px] text-muted">to cook</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <section class="py-14 lg:py-16">
      <div class="shell grid gap-3 sm:grid-cols-3">
        <div v-for="(stat, index) in stats" :key="stat.label" v-reveal="{ delay: index * 80 }" class="rounded-[14px] border border-line bg-white p-5 text-center">
          <p class="text-[1.8rem] font-semibold tracking-tighter text-primary-deep">
            <AnimatedNumber :value="stat.value" :suffix="stat.suffix" />
          </p>
          <p class="mt-1 text-[11px] text-muted">{{ stat.label }}</p>
        </div>
      </div>
    </section>

    <section class="pb-16 lg:pb-20">
      <div class="shell">
        <div class="max-w-2xl">
          <p v-reveal class="eyebrow">What is inside</p>
          <h2 v-reveal="{ delay: 50 }" class="mt-3 text-balance text-[clamp(1.9rem,3.5vw,2.8rem)] font-semibold leading-[1.05] tracking-[-0.045em]">Practical tools, not another dashboard to maintain.</h2>
        </div>

        <div class="mt-9 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <article
            v-for="(feature, index) in features"
            :key="feature.title"
            v-reveal="{ delay: index * 60 }"
            class="group rounded-[16px] border border-line bg-white p-5 transition duration-300 hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-[0_24px_50px_-38px_rgba(6,59,0,.45)]"
          >
            <span class="grid h-11 w-11 place-items-center rounded-[10px]" :class="feature.tone">
              <component :is="feature.icon" :size="20" />
            </span>
            <h3 class="mt-4 text-[15px] font-semibold tracking-[-0.02em] text-ink">
              {{ feature.title }}
            </h3>
            <p class="mt-1.5 text-[13px] leading-6 text-muted">{{ feature.description }}</p>
          </article>
        </div>
      </div>
    </section>

    <section class="cta-surface-dark relative overflow-hidden border-y border-white/10 text-white py-16 lg:py-20">
      <div class="pointer-events-none absolute inset-0 texture-dots-light opacity-20" />
      <div class="shell relative grid items-center gap-10 lg:grid-cols-[1.05fr_0.95fr]">
        <div v-reveal class="relative order-2 lg:order-1">
          <div class="absolute -inset-3 rounded-[22px] bg-[linear-gradient(135deg,rgba(102,187,106,.2),rgba(165,214,167,.08))] blur-2xl" />
          <div class="relative overflow-hidden rounded-[18px] border border-line bg-white shadow-[0_30px_70px_-50px_rgba(6,59,0,.55)]">
            <div class="border-b border-line bg-accent/40 px-5 py-4">
              <p class="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted">Your weekly setup</p>
              <p class="mt-0.5 text-sm font-semibold text-ink">One profile, every plan</p>
            </div>
            <div class="space-y-3 p-5">
              <div v-for="(item, index) in highlights" :key="item" class="flex gap-3 rounded-[10px] border border-line p-3.5">
                <span class="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-accent text-primary-deep">
                  <Check :size="15" />
                </span>
                <div>
                  <p class="text-[12.5px] font-semibold leading-5 text-ink">{{ item }}</p>
                  <p class="mt-0.5 text-[10.5px] text-muted">
                    {{
                      index === 0
                        ? "Set it once and refine it whenever your routine changes."
                        : index === 1
                          ? "No more duplicate buys or forgotten ingredients."
                          : index === 2
                            ? "Clear numbers, short summaries, and useful next steps."
                            : "Swap meals without breaking the rest of the plan."
                    }}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="order-1 lg:order-2">
          <p v-reveal class="eyebrow text-secondary">Why it works</p>
          <h2 v-reveal="{ delay: 50 }" class="mt-3 text-balance text-[clamp(1.9rem,3.5vw,2.8rem)] font-semibold leading-[1.05] tracking-[-0.045em] text-white">Fewer decisions. Better defaults.</h2>
          <p v-reveal="{ delay: 100 }" class="mt-4 max-w-md text-[14.5px] leading-7 text-white/70">
            Healthy eating gets easier when the next step is already clear. Leaflow removes the mental load of choosing, pricing, shopping, and tracking.
          </p>

          <div class="mt-6 space-y-3">
            <div
              v-for="(item, index) in ['Set a goal and a realistic budget', 'Generate a plan you can cook', 'Shop with a list that knows your pantry']"
              :key="item"
              v-reveal="{ delay: 140 + index * 70 }"
              class="flex items-center gap-3 rounded-[10px] border border-white/15 bg-white/10 px-4 py-3 backdrop-blur"
            >
              <span class="grid h-7 w-7 place-items-center rounded-full bg-secondary text-[10px] font-semibold text-ink">
                {{ index + 1 }}
              </span>
              <span class="text-[12.5px] font-medium text-white">{{ item }}</span>
            </div>
          </div>

          <div class="mt-6 flex items-center gap-3 text-[11px] text-white/65">
            <ShieldCheck :size="15" class="text-secondary" />
            Nutrition counted, costs visible, no surprise grocery bills.
          </div>
        </div>
      </div>
    </section>

    <section class="pt-16 lg:pt-20 pb-16 lg:pb-24">
      <div class="shell">
        <div v-reveal class="cta-surface-dark relative overflow-hidden rounded-[20px] px-6 py-10 shadow-[0_30px_70px_-40px_rgba(6,59,0,.65)] sm:px-10 lg:py-12">
          <div class="pointer-events-none absolute inset-0 texture-dots-light opacity-30" />
          <div class="relative z-10 max-w-xl">
            <p class="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/70">Built for real weeks</p>
            <h2 class="mt-3 text-balance text-[clamp(1.8rem,3.4vw,2.6rem)] font-semibold leading-[1.05] tracking-[-0.045em] text-white">Start with one meal. Build a routine that lasts.</h2>
            <div class="mt-6 flex flex-wrap gap-3">
              <RouterLink to="/register" class="btn btn-primary">
                Create my account
                <ArrowRight :size="16" />
              </RouterLink>
              <RouterLink to="/explore" class="btn border-white/40 bg-white/10 text-white backdrop-blur hover:bg-white/20"> Explore meals </RouterLink>
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>
