<script setup>
defineProps({
  image: { type: String, default: '' },
  colors: {
    type: Object,
    default: () => ({ a: '#F3E2B8', b: '#6B8F3A', c: '#B5651D', d: '#F6C945' }),
  },
  label: { type: String, default: 'Nutritious food illustration' },
})
</script>

<template>
  <div class="h-full w-full">
    <img
      v-if="image"
      :src="image"
      :alt="label"
      class="h-full w-full object-cover"
      loading="lazy"
    />
    <svg v-else viewBox="0 0 120 120" class="h-full w-full" role="img" :aria-label="label">
      <ellipse cx="60" cy="105" rx="38" ry="5" fill="var(--color-ink)" opacity=".08" />
      <circle cx="60" cy="57" r="47" fill="var(--color-canvas)" />
      <circle cx="60" cy="57" r="38" :fill="colors.a" />
      <circle cx="45" cy="48" r="11" :fill="colors.b" />
      <circle cx="73" cy="44" r="8.5" :fill="colors.c" />
      <circle cx="69" cy="70" r="12" :fill="colors.b" />
      <circle cx="47" cy="71" r="7.5" :fill="colors.c" />
      <circle cx="58" cy="59" r="4.2" :fill="colors.d" />
      <circle cx="83" cy="61" r="4" :fill="colors.d" />
      <circle cx="39" cy="61" r="3.6" :fill="colors.d" />
      <circle cx="60" cy="35" r="3.6" :fill="colors.c" />
    </svg>
  </div>
</template>
