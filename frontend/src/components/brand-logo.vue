<script setup>
import logo from '../assets/images/brand/logo.png'

defineProps({
  light: { type: Boolean, default: false },
  size: { type: String, default: 'md' },
})
</script>

<template>
  <div class="flex items-center gap-2.5">
    <span
      class="grid shrink-0 place-items-center rounded-full bg-white/10"
      :class="size === 'sm' ? 'h-9 w-9' : 'h-11 w-11'"
    >
      <img :src="logo" alt="Leaflow logo" class="h-[76%] w-[76%] object-contain" />
    </span>
    <span
      class="text-[1.3rem] font-semibold leading-none tracking-[-0.06em]"
      :class="light ? 'text-white' : 'text-ink'"
    >
      Leaflow
    </span>
  </div>
</template>
