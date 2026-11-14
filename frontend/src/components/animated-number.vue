<script setup>
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'

const props = defineProps({
  value: { type: Number, required: true },
  prefix: { type: String, default: '' },
  suffix: { type: String, default: '' },
  duration: { type: Number, default: 1200 },
  decimals: { type: Number, default: 0 },
})

const el = ref(null)
const display = ref(0)
let observer = null
let frame = null
let started = false

const formatted = computed(() =>
  new Intl.NumberFormat('en-US', {
    minimumFractionDigits: props.decimals,
    maximumFractionDigits: props.decimals,
  }).format(display.value),
)

const run = () => {
  if (started) return
  started = true

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    display.value = props.value
    return
  }

  const start = performance.now()
  const from = 0
  const to = props.value

  const tick = (now) => {
    const progress = Math.min(1, (now - start) / props.duration)
    const eased = 1 - Math.pow(1 - progress, 3)
    display.value = from + (to - from) * eased

    if (progress < 1) {
      frame = window.requestAnimationFrame(tick)
    } else {
      display.value = to
    }
  }

  frame = window.requestAnimationFrame(tick)
}

onMounted(() => {
  if (!el.value) return

  observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return
        run()
        observer?.unobserve(entry.target)
      })
    },
    { threshold: 0.4 },
  )

  observer.observe(el.value)
})

watch(
  () => props.value,
  (value) => {
    if (!started) return
    display.value = value
  },
)

onBeforeUnmount(() => {
  observer?.disconnect()
  if (frame) window.cancelAnimationFrame(frame)
})
</script>

<template>
  <span ref="el">{{ prefix }}{{ formatted }}{{ suffix }}</span>
</template>
