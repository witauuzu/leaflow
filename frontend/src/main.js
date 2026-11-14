import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import router from './index.js'

const app = createApp(App)

app.directive('reveal', {
  mounted(el, binding) {
    el.classList.add('reveal')

    const delay = Number(binding.value?.delay ?? binding.value ?? 0)
    if (delay) el.style.setProperty('--reveal-delay', `${delay}ms`)

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      el.classList.add('is-visible')
      return
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return
          entry.target.classList.add('is-visible')
          observer.unobserve(entry.target)
        })
      },
      { threshold: 0.12, rootMargin: '0px 0px -40px 0px' },
    )

    observer.observe(el)
    el._revealObserver = observer
  },
  unmounted(el) {
    el._revealObserver?.disconnect()
  },
})

app.use(router)
app.mount('#app')