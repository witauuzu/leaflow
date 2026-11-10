<script setup>
import { ref } from 'vue'
import ExploreLight from '../assets/icons/Light/Explore.svg'
import ProfileBold from '../assets/icons/Bold/Profile.svg'

defineProps({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
})

// Search
const searchQuery = ref('')

// Profile
const profileImage = ref('')
</script>

<template>
  <header class="flex items-center justify-between">
    <!-- Page Information -->
    <div class="min-w-0">
      <h1 class="text-2xl font-semibold text-(--color-text)">
        {{ title }}
      </h1>

      <p class="mt-1 text-sm text-(--color-text)">
        {{ description }}
      </p>
    </div>

    <!-- Search & Profile -->
    <div class="flex shrink-0 items-center gap-5">
      <!-- Search Input -->
      <div
        class="flex h-[45px] w-[300px] items-center gap-3 rounded-xl bg-(--color-accent) px-4"
      >
        <img
          :src="ExploreLight"
          alt="Search"
          class="h-[19px] w-[19px] shrink-0 icon-header"
        />

        <input
          v-model="searchQuery"
          type="text"
          placeholder="Search"
          class="w-full text-sm text-(--color-text) outline-none"
        />
      </div>

      <!-- Profile Picture -->
      <button
        type="button"
        aria-label="User profile"
        class="flex h-[45px] w-[45px] bg-(--color-accent) shrink-0 items-center justify-center overflow-hidden rounded-full"
      >
        <img
          v-if="profileImage"
          :src="profileImage"
          alt="Profile"
          class="h-full w-full object-cover "
        />

        <img
          v-else
          :src="ProfileBold"
          alt="Profile"
          class="h-[23px] w-[23px] icon-header"
        />
      </button>
    </div>
  </header>
</template>

<style scoped>
.icon-header {
  filter: brightness(0) saturate(100%)
  invert(69%) sepia(15%) saturate(1125%)
  hue-rotate(72deg) brightness(94%) contrast(87%);
}
</style>
