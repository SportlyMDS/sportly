import type { Config } from 'tailwindcss'

export default {
  content: [
    './components/**/*.{js,vue,ts}',
    './layouts/**/*.vue',
    './pages/**/*.vue',
    './plugins/**/*.{js,ts}',
    './app.vue',
  ],
  theme: {
    extend: {
      colors: {
        'background-color': '#fff9f4',
        'font-color': '#212121',
        'brand-500': '#ef781e',
        'brand-600': '#e05f16',
      },
      fontFamily: {
        'asap': ['Asap', 'sans-serif'],
        'montserrat': ['Montserrat', 'sans-serif'],
      },
    },
  },
} satisfies Config
