<script setup>
import { computed, nextTick, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { Bot, MessageCircle, Send, X } from 'lucide-vue-next'

const route = useRoute()
const open = ref(false)
const input = ref('')
const typing = ref(false)
const scroller = ref(null)

const messages = ref([
  {
    role: 'bot',
    text: 'Hi! I am the Leaflow assistant. Ask me about meals, budget, or nutrition targets.',
  },
])

const hidden = computed(
  () =>
    ['/login', '/register', '/forgot-password', '/reset-password', '/verify-email'].includes(
      route.path,
    ) || route.path.startsWith('/dashboard/planner/create'),
)

const scrollToBottom = async () => {
  await nextTick()
  if (scroller.value) scroller.value.scrollTop = scroller.value.scrollHeight
}

const answer = (question) => {
  const text = question.toLowerCase()

  if (text.includes('protein')) {
    return 'For affordable protein, try spinach omelette (19 g), steamed fish (30 g), or tempeh. Each portion stays under Rp 17,000.'
  }
  if (text.includes('budget') || text.includes('cheap') || text.includes('save')) {
    return 'With a Rp 45,000 daily budget, oatmeal (Rp 8,000), pecel rice (Rp 14,000), and chicken soup (Rp 9,000) leave Rp 14,000 for snacks.'
  }
  if (text.includes('pantry') || text.includes('ingredient')) {
    return 'Open the pantry section to log what you already have. The shopping list will automatically subtract available ingredients.'
  }
  if (text.includes('calorie') || text.includes('diet')) {
    return 'Your current target is 1,800 kcal per day. The nutrition report shows remaining calories and macros in real time.'
  }
  return 'I can help you build a menu, check your budget, and suggest ingredient swaps. Try asking for a high-protein meal under Rp 15,000.'
}

const send = () => {
  const text = input.value.trim()
  if (!text || typing.value) return

  messages.value.push({ role: 'user', text })
  input.value = ''
  typing.value = true
  scrollToBottom()

  window.setTimeout(() => {
    messages.value.push({ role: 'bot', text: answer(text) })
    typing.value = false
    scrollToBottom()
  }, 700)
}

watch(open, (value) => {
  if (value) scrollToBottom()
})
</script>

<template>
  <div
    v-if="!hidden"
    class="fixed bottom-4 right-4 z-40 flex flex-col items-end gap-3 sm:bottom-6 sm:right-6"
  >
    <Transition name="slide-up">
      <section
        v-if="open"
        class="flex max-h-[min(72vh,560px)] w-[min(92vw,370px)] flex-col overflow-hidden rounded-2xl border border-line bg-white shadow-[0_40px_80px_-40px_rgba(6,59,0,.55)]"
        aria-label="Leaflow assistant"
      >
        <header class="flex items-center gap-3 bg-ink px-5 py-4 text-white">
          <span class="grid h-9 w-9 place-items-center rounded-full bg-white/10">
            <Bot :size="18" class="text-secondary" />
          </span>
          <div class="flex-1">
            <p class="text-sm font-semibold">Leaflow Assistant</p>
            <p class="text-[11px] text-white/55">AI nutrition helper</p>
          </div>
          <button
            type="button"
            class="grid h-8 w-8 place-items-center rounded-full text-white/70 transition hover:bg-white/10 hover:text-white"
            aria-label="Close chat"
            @click="open = false"
          >
            <X :size="16" />
          </button>
        </header>

        <div ref="scroller" class="flex-1 space-y-3 overflow-y-auto bg-canvas px-4 py-5">
          <div
            v-for="(message, index) in messages"
            :key="index"
            class="flex"
            :class="message.role === 'user' ? 'justify-end' : 'justify-start'"
          >
            <div
              class="max-w-[88%] rounded-2xl px-3.5 py-2.5 text-[13px] leading-6"
              :class="
                message.role === 'user'
                  ? 'rounded-br-md bg-ink text-white'
                  : 'rounded-bl-md border border-line bg-white text-ink-soft'
              "
            >
              {{ message.text }}
            </div>
          </div>

          <div v-if="typing" class="flex justify-start">
            <div
              class="flex items-center gap-1.5 rounded-2xl rounded-bl-md border border-line bg-white px-4 py-3"
            >
              <span class="h-1.5 w-1.5 animate-bounce rounded-full bg-primary [animation-delay:-0.2s]" />
              <span class="h-1.5 w-1.5 animate-bounce rounded-full bg-primary [animation-delay:-0.1s]" />
              <span class="h-1.5 w-1.5 animate-bounce rounded-full bg-primary" />
            </div>
          </div>
        </div>

        <form class="border-t border-line bg-white p-3" @submit.prevent="send">
          <div class="flex items-center gap-2">
            <input
              v-model="input"
              type="text"
              class="input h-11 min-h-0 flex-1 rounded-full text-[13px]"
              placeholder="Type your question..."
              aria-label="Type your question"
            />
            <button
              type="submit"
              class="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-ink text-secondary transition hover:bg-primary-deep disabled:opacity-50"
              :disabled="typing"
              aria-label="Send message"
            >
              <Send :size="17" />
            </button>
          </div>
          <p class="mt-2 px-1 text-[10px] leading-4 text-muted">
            General information, not a substitute for professional medical advice.
          </p>
        </form>
      </section>
    </Transition>

    <div class="flex items-center gap-2">
      <Transition name="fade">
        <span
          v-if="!open"
          class="hidden rounded-full border border-white/70 bg-white/85 px-3.5 py-2 text-[11px] font-semibold text-ink shadow-[0_12px_30px_-20px_rgba(6,59,0,.55)] backdrop-blur sm:block"
        >
          Ask Leaflow
        </span>
      </Transition>
      <button
        type="button"
        class="group grid h-14 w-14 place-items-center rounded-full bg-ink text-secondary shadow-[0_20px_40px_-18px_rgba(6,59,0,.7)] transition hover:scale-105 hover:bg-primary-deep"
        :aria-label="open ? 'Close assistant' : 'Open assistant'"
        @click="open = !open"
      >
        <X v-if="open" :size="22" />
        <MessageCircle v-else :size="22" />
      </button>
    </div>
  </div>
</template>
