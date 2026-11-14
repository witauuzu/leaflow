<script setup>
// import logo from "../assets/images/brand/logo.png";
import logoText from "../assets/images/brand/logo-text.svg";

defineProps({
  light: { type: Boolean, default: false },
  size: { type: String, default: "md" },
});
</script>

<template>
  <div class="flex items-center gap-2.5">
    <!-- <span class="grid shrink-0 place-items-center rounded-full bg-primary/20" :class="size === 'sm' ? 'h-9 w-9' : 'h-11 w-11'">
      <img :src="logo" alt="Leaflow logo" class="h-[76%] w-[76%] object-contain" />
    </span> -->
    <span class="inline-flex items-center">
      <img :src="logoText" alt="Leaflow" class="w-auto object-contain" :class="size === 'md' ? 'h-18' : 'h-10'" />
    </span>
  </div>
</template>
