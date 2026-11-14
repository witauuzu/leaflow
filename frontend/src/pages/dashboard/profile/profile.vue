<script setup>
import { reactive, ref } from "vue";
import { Bell, CalendarDays, Camera, Check, Drumstick, Flame, Leaf, Mail, MapPin, Phone, RotateCcw, Save, ShieldCheck, Target, Utensils, Wallet } from "lucide-vue-next";
import HeaderDashboard from "../../../components/header-dashboard.vue";

const saved = ref(false);

const profile = reactive({
  name: "User A",
  email: "usera@email.com",
  phone: "+62 812 3456 7890",
  birthday: "1998-04-18",
  gender: "Female",
  city: "Denpasar, Indonesia",
  goal: "Balanced nutrition",
  calories: 2000,
  protein: 120,
  budget: 75000,
  bio: "Product designer who plans meals around a busy studio schedule.",
});

const preferenceOptions = ["Balanced", "High protein", "Vegetarian", "Halal", "Gluten free", "Low sugar", "Budget friendly", "Quick meals"];

const preferences = ref(["Balanced", "High protein", "Halal", "Budget friendly"]);

const notifications = reactive({
  emailDigest: true,
  weeklyReport: true,
  pantryAlerts: true,
  budgetAlerts: false,
});

const stats = [
  { label: "Days active", value: "126" },
  { label: "Meals planned", value: "384" },
  { label: "Saved this month", value: "Rp 412k" },
];

const togglePreference = (item) => {
  preferences.value = preferences.value.includes(item) ? preferences.value.filter((value) => value !== item) : [...preferences.value, item];
};

const saveProfile = () => {
  saved.value = true;
  window.setTimeout(() => {
    saved.value = false;
  }, 2200);
};
</script>

<template>
  <div class="p-7">
    <HeaderDashboard title="User Profile" description="Manage your personal details, nutrition targets, and preferences." />

    <main class="mt-7 grid gap-4 xl:grid-cols-[320px_minmax(0,1fr)]">
      <!-- Summary card -->
      <aside class="flex min-w-0 flex-col gap-4">
        <section class="overflow-hidden rounded-[10px] border border-line bg-white">
          <div class="brand-gradient-horizontal relative h-24 overflow-hidden">
            <div class="absolute inset-0 texture-dots-light opacity-25" />
            <div class="absolute -right-6 -top-8 h-28 w-28 rounded-full bg-white/10 blur-2xl" />
          </div>

          <div class="relative px-5 pb-5">
            <div class="-mt-10 flex items-end justify-between">
              <div class="relative">
                <span class="grid h-20 w-20 place-items-center rounded-full border-4 border-white bg-[linear-gradient(145deg,var(--color-accent),var(--color-secondary))] text-xl font-semibold text-primary-deep shadow-sm"> AR </span>
                <button type="button" class="absolute -bottom-0.5 -right-0.5 grid h-7 w-7 place-items-center rounded-full border-2 border-white bg-ink text-white transition hover:bg-primary-deep" aria-label="Change profile photo">
                  <Camera :size="12" />
                </button>
              </div>
              <span class="mb-1 inline-flex items-center gap-1 rounded-full bg-accent px-2.5 py-1 text-[9.5px] font-semibold text-primary-deep">
                <Leaf :size="11" />
                Premium
              </span>
            </div>

            <h2 class="mt-3 text-base font-semibold tracking-[-0.02em] text-ink">
              {{ profile.name }}
            </h2>
            <p class="mt-0.5 text-[11.5px] text-muted">{{ profile.email }}</p>
            <p class="mt-3 text-[11px] leading-5 text-muted">
              {{ profile.bio }}
            </p>

            <div class="mt-4 grid grid-cols-3 gap-2 border-t border-line pt-4">
              <div v-for="stat in stats" :key="stat.label" class="text-center">
                <p class="text-[13px] font-semibold text-ink">{{ stat.value }}</p>
                <p class="mt-0.5 text-[9px] leading-3 text-muted">{{ stat.label }}</p>
              </div>
            </div>
          </div>
        </section>

        <!-- Quick goal card -->
        <section class="rounded-[10px] border border-line bg-white p-5">
          <div class="flex items-center gap-2">
            <span class="grid h-8 w-8 place-items-center rounded-lg bg-accent text-primary-deep">
              <Target :size="16" />
            </span>
            <div>
              <h2 class="text-[12.5px] font-semibold text-ink">Current focus</h2>
              <p class="text-[10.5px] text-muted">Updated from your last plan</p>
            </div>
          </div>

          <div class="mt-4 space-y-3">
            <div class="flex items-center justify-between rounded-[9px] border border-line px-3 py-2.5">
              <span class="inline-flex items-center gap-2 text-[11px] text-muted">
                <Flame :size="14" class="text-primary" />
                Calories
              </span>
              <span class="text-[11.5px] font-semibold text-ink">{{ profile.calories }} kcal</span>
            </div>
            <div class="flex items-center justify-between rounded-[9px] border border-line px-3 py-2.5">
              <span class="inline-flex items-center gap-2 text-[11px] text-muted">
                <Drumstick :size="14" class="text-warning" />
                Protein
              </span>
              <span class="text-[11.5px] font-semibold text-ink">{{ profile.protein }} g</span>
            </div>
            <div class="flex items-center justify-between rounded-[9px] border border-line px-3 py-2.5">
              <span class="inline-flex items-center gap-2 text-[11px] text-muted">
                <Wallet :size="14" class="text-info" />
                Daily budget
              </span>
              <span class="text-[11.5px] font-semibold text-ink"> Rp {{ profile.budget.toLocaleString("id-ID") }} </span>
            </div>
          </div>

          <RouterLink to="/dashboard/planner/create" class="mt-4 flex w-full items-center justify-center gap-2 rounded-md bg-ink px-3 py-2.5 text-[11.5px] font-semibold text-white transition hover:bg-primary-deep">
            <RotateCcw :size="14" />
            Update with a new plan
          </RouterLink>
        </section>
      </aside>

      <!-- Forms -->
      <div class="flex min-w-0 flex-col gap-4">
        <!-- Personal information -->
        <section class="rounded-[10px] border border-line bg-white p-5">
          <div class="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2 class="text-sm font-semibold text-ink">Personal information</h2>
              <p class="mt-0.5 text-[11px] text-muted">Keep this up to date so your plans stay relevant.</p>
            </div>
            <span class="rounded-full bg-accent px-2.5 py-1 text-[9.5px] font-semibold text-primary-deep"> Private </span>
          </div>

          <form class="mt-5 grid gap-4 sm:grid-cols-2" @submit.prevent="saveProfile">
            <label class="field">
              <span class="field-label">Full name</span>
              <input v-model="profile.name" type="text" class="input" />
            </label>

            <label class="field">
              <span class="field-label">Email address</span>
              <div class="relative">
                <Mail :size="15" class="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
                <input v-model="profile.email" type="email" class="input pl-10" />
              </div>
            </label>

            <label class="field">
              <span class="field-label">Phone number</span>
              <div class="relative">
                <Phone :size="15" class="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
                <input v-model="profile.phone" type="tel" class="input pl-10" />
              </div>
            </label>

            <label class="field">
              <span class="field-label">Date of birth</span>
              <div class="relative">
                <CalendarDays :size="15" class="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
                <input v-model="profile.birthday" type="date" class="input pl-10" />
              </div>
            </label>

            <label class="field">
              <span class="field-label">Gender</span>
              <select v-model="profile.gender" class="input">
                <option>Female</option>
                <option>Male</option>
                <option>Prefer not to say</option>
              </select>
            </label>

            <label class="field">
              <span class="field-label">City</span>
              <div class="relative">
                <MapPin :size="15" class="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
                <input v-model="profile.city" type="text" class="input pl-10" />
              </div>
            </label>

            <label class="field sm:col-span-2">
              <span class="field-label">Short bio</span>
              <textarea v-model="profile.bio" rows="3" class="input min-h-[86px] py-3" />
            </label>

            <div class="flex flex-wrap items-center justify-between gap-3 sm:col-span-2">
              <p class="inline-flex items-center gap-1.5 text-[10.5px] text-muted">
                <ShieldCheck :size="13" class="text-primary" />
                Your data is only used to personalize your meal plans.
              </p>
              <button type="submit" class="btn btn-primary btn-sm">
                <Save :size="14" />
                Save changes
              </button>
            </div>
          </form>
        </section>

        <!-- Nutrition targets -->
        <section class="rounded-[10px] border border-line bg-white p-5">
          <div class="flex items-center justify-between gap-3">
            <div>
              <h2 class="text-sm font-semibold text-ink">Nutrition & budget targets</h2>
              <p class="mt-0.5 text-[11px] text-muted">These values guide every generated meal plan.</p>
            </div>
            <span class="grid h-8 w-8 place-items-center rounded-lg bg-accent text-primary-deep">
              <Target :size="16" />
            </span>
          </div>

          <div class="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <label class="field">
              <span class="field-label">Main goal</span>
              <select v-model="profile.goal" class="input">
                <option>Balanced nutrition</option>
                <option>Manage weight</option>
                <option>Build muscle</option>
                <option>Save money</option>
                <option>Eat more vegetables</option>
              </select>
            </label>

            <label class="field">
              <span class="field-label">Daily calories</span>
              <div class="relative">
                <Flame :size="15" class="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
                <input v-model.number="profile.calories" type="number" min="1200" step="50" class="input pl-10" />
              </div>
            </label>

            <label class="field">
              <span class="field-label">Daily protein (g)</span>
              <div class="relative">
                <Drumstick :size="15" class="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
                <input v-model.number="profile.protein" type="number" min="40" step="5" class="input pl-10" />
              </div>
            </label>
          </div>

          <div class="mt-4 rounded-[9px] border border-line bg-accent/30 p-4">
            <div class="flex flex-wrap items-center justify-between gap-2">
              <div class="flex items-center gap-2">
                <span class="grid h-8 w-8 place-items-center rounded-lg bg-white text-info">
                  <Wallet :size="15" />
                </span>
                <div>
                  <p class="text-[11px] font-semibold text-ink">Daily food budget</p>
                  <p class="text-[10px] text-muted">Used for menu and shopping suggestions</p>
                </div>
              </div>
              <p class="text-sm font-semibold text-ink">Rp {{ profile.budget.toLocaleString("id-ID") }}</p>
            </div>
            <input v-model.number="profile.budget" type="range" min="30000" max="200000" step="5000" class="mt-3 h-1.5 w-full cursor-pointer appearance-none rounded-full bg-line accent-primary" />
            <div class="mt-1.5 flex justify-between text-[9.5px] text-muted">
              <span>Rp 30k</span>
              <span>Rp 200k</span>
            </div>
          </div>
        </section>

        <div class="grid gap-4 lg:grid-cols-2">
          <!-- Preferences -->
          <section class="rounded-[10px] border border-line bg-white p-5">
            <div class="flex items-center justify-between gap-3">
              <div>
                <h2 class="text-sm font-semibold text-ink">Food preferences</h2>
                <p class="mt-0.5 text-[11px] text-muted">Used to filter meal suggestions.</p>
              </div>
              <span class="grid h-8 w-8 place-items-center rounded-lg bg-warning/10 text-warning">
                <Utensils :size="16" />
              </span>
            </div>

            <div class="mt-4 flex flex-wrap gap-2">
              <button
                v-for="item in preferenceOptions"
                :key="item"
                type="button"
                class="inline-flex items-center gap-1.5 rounded-[8px] border px-3 py-2 text-[10.5px] font-medium transition"
                :class="preferences.includes(item) ? 'border-primary/40 bg-accent text-primary-deep' : 'border-line bg-white text-muted hover:border-primary/30 hover:text-ink'"
                @click="togglePreference(item)"
              >
                <Check v-if="preferences.includes(item)" :size="12" />
                {{ item }}
              </button>
            </div>
          </section>

          <!-- Notifications -->
          <section class="rounded-[10px] border border-line bg-white p-5">
            <div class="flex items-center justify-between gap-3">
              <div>
                <h2 class="text-sm font-semibold text-ink">Notifications</h2>
                <p class="mt-0.5 text-[11px] text-muted">Choose what is worth your attention.</p>
              </div>
              <span class="grid h-8 w-8 place-items-center rounded-lg bg-info/10 text-info">
                <Bell :size="16" />
              </span>
            </div>

            <div class="mt-4 space-y-1">
              <label v-for="(value, key) in notifications" :key="key" class="flex cursor-pointer items-center justify-between rounded-[8px] px-2 py-2.5 transition hover:bg-accent/30">
                <span class="text-[11.5px] text-ink">
                  {{ key === "emailDigest" ? "Daily plan email" : key === "weeklyReport" ? "Weekly nutrition report" : key === "pantryAlerts" ? "Pantry running low alerts" : "Budget overspend alerts" }}
                </span>
                <input v-model="notifications[key]" type="checkbox" class="peer sr-only" />
                <span
                  class="relative h-5 w-9 rounded-full bg-line transition peer-checked:bg-primary after:absolute after:left-0.5 after:top-0.5 after:h-4 after:w-4 after:rounded-full after:bg-white after:shadow-sm after:transition-all peer-checked:after:translate-x-4"
                />
              </label>
            </div>

            <button type="button" class="mt-4 flex w-full items-center justify-center gap-2 rounded-md border border-line px-3 py-2 text-[11px] font-medium text-muted transition hover:border-primary/40 hover:text-ink" @click="saveProfile">
              <Save :size="13" />
              Save preferences
            </button>
          </section>
        </div>
      </div>
    </main>

    <Transition name="slide-up">
      <div v-if="saved" class="fixed bottom-6 left-1/2 z-50 flex -translate-x-1/2 items-center gap-2 rounded-[10px] bg-ink px-4 py-3 text-xs font-medium text-white shadow-[0_20px_40px_-20px_rgba(6,59,0,.65)]">
        <Check :size="15" class="text-secondary" />
        Profile updated
      </div>
    </Transition>
  </div>
</template>
