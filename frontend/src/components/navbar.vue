<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from "vue";
import { useRoute } from "vue-router";
import { Menu, X } from "lucide-vue-next";
import BrandLogo from "./brand-logo.vue";

const route = useRoute();

const links = [
  { label: "Home", to: "/" },
  { label: "Features", to: "/features" },
  { label: "Explore", to: "/explore" },
  { label: "AI Trial", to: "/trial" },
];

const menuOpen = ref(false);
const scrolled = ref(false);

const isActive = (path) => (path === "/" ? route.path === "/" : route.path.startsWith(path));

const isGlass = computed(() => scrolled.value || menuOpen.value);
const isDarkTop = computed(() => ["/", "/explore", "/trial"].includes(route.path) && !isGlass.value);

const onScroll = () => {
  scrolled.value = window.scrollY > 12;
};

const closeMenu = () => {
  menuOpen.value = false;
};

onMounted(() => {
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });
});
onBeforeUnmount(() => window.removeEventListener("scroll", onScroll));
</script>

<template>
  <header class="fixed inset-x-0 top-0 z-50 pt-3 sm:pt-4">
    <div class="nav-shell">
      <div class="relative">
        <nav
          class="flex items-center justify-between gap-3 rounded-full px-2 py-2.5 transition-all duration-300 sm:px-3 sm:py-3"
          :class="isGlass ? 'nav-glass-primary backdrop-blur-sm shadow-[0_22px_50px_-34px_rgba(6,59,0,.6)] border border-transparent' : 'border border-transparent bg-transparent'"
          aria-label="Main navigation"
        >
          <RouterLink to="/" class="pl-1" aria-label="Leaflow home">
            <BrandLogo size="sm" :light="isDarkTop" />
          </RouterLink>

          <div class="hidden items-center gap-2 md:flex">
            <RouterLink
              v-for="link in links"
              :key="link.to"
              :to="link.to"
              class="nav-link"
              :class="{
                'is-active': isActive(link.to),
                'nav-link-on-dark': isDarkTop && !isActive(link.to),
              }"
              :aria-current="isActive(link.to) ? 'page' : undefined"
            >
              {{ link.label }}
            </RouterLink>
          </div>

          <div class="hidden items-center gap-2 md:flex">
            <RouterLink to="/register" class="btn btn-ghost btn-sm" :class="isDarkTop ? 'text-white hover:bg-white/10' : ''"> Sign Up </RouterLink>
            <RouterLink to="/login" class="btn btn-primary btn-sm"> Log In </RouterLink>
          </div>

          <button
            type="button"
            class="grid h-11 w-11 place-items-center rounded-full bg-white/75 text-ink backdrop-blur transition hover:bg-white md:hidden"
            :aria-expanded="menuOpen"
            aria-label="Toggle navigation menu"
            @click="menuOpen = !menuOpen"
          >
            <X v-if="menuOpen" :size="18" />
            <Menu v-else :size="18" />
          </button>
        </nav>

        <Transition name="slide-up">
          <div v-if="menuOpen" class="nav-glass-primary absolute inset-x-0 top-[calc(100%+0.6rem)] rounded-[18px] p-3 md:hidden">
            <div class="flex flex-col gap-2">
              <RouterLink v-for="link in links" :key="link.to" :to="link.to" class="nav-link w-full justify-start" :class="{ 'is-active': isActive(link.to) }" :aria-current="isActive(link.to) ? 'page' : undefined" @click="closeMenu">
                {{ link.label }}
              </RouterLink>
            </div>
            <div class="mt-3 grid grid-cols-2 gap-2 border-t border-line pt-3">
              <RouterLink to="/register" class="btn btn-outline btn-sm" @click="closeMenu"> Sign Up </RouterLink>
              <RouterLink to="/login" class="btn btn-primary btn-sm" @click="closeMenu"> Log In </RouterLink>
            </div>
          </div>
        </Transition>
      </div>
    </div>
  </header>
</template>
