<script setup>

defineProps({
  title: {
    type: String,
    required: true,
  },
  icon: {
    type: Object,
    required: true,
  },
  meal: {
    type: String,
    default: 'Not planned yet',
  },
})
</script>

<template>
  <div
    class="flex min-w-0 flex-col rounded-[10px] border border-gray-200 bg-white p-3"
  >
    <!-- Meal Image / Icon -->
    <div
      class="flex h-[110px] items-center justify-center rounded-lg bg-[#F1F8F1]"
    >
      <component
        :is="icon"
        :size="38"
        :stroke-width="1"
        class="text-(--color-primary)"
      />
    </div>

    <!-- Meal Information -->
    <div class="mt-3">
      <h3 class="text-xs font-reguler text-(--color-text)]">
        {{ title }}
      </h3>

      <p class="mt-1 text-xs text-gray-400">
        {{ meal }}
      </p>
    </div>
  </div>
</template>
