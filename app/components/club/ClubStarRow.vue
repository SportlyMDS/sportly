<script setup lang="ts">
const props = withDefaults(defineProps<{
  rating: number
  size?: number
}>(), {
  size: 16
})

// Unique prefix for SVG linearGradient IDs (avoids DOM collisions)
const uid = Math.random().toString(36).slice(2, 8)

function starArray(rating: number): Array<'full' | 'half' | 'empty'> {
  const stars: Array<'full' | 'half' | 'empty'> = []
  for (let i = 0; i < 5; i++) {
    if (rating >= i + 1) stars.push('full')
    else if (rating >= i + 0.5) stars.push('half')
    else stars.push('empty')
  }
  return stars
}

const stars = computed(() => starArray(props.rating))
const path = 'M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z'
</script>

<template>
  <div class="flex items-center gap-0.5">
    <template v-for="(type, i) in stars" :key="i">
      <!-- Full -->
      <svg
        v-if="type === 'full'"
        :width="size"
        :height="size"
        viewBox="0 0 24 24"
        fill="#ef781e"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path :d="path" />
      </svg>

      <!-- Half -->
      <svg
        v-else-if="type === 'half'"
        :width="size"
        :height="size"
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient :id="`star-${uid}-${i}`">
            <stop offset="50%" stop-color="#ef781e" />
            <stop offset="50%" stop-color="#d6d6d6" />
          </linearGradient>
        </defs>
        <path :fill="`url(#star-${uid}-${i})`" :d="path" />
      </svg>

      <!-- Empty -->
      <svg
        v-else
        :width="size"
        :height="size"
        viewBox="0 0 24 24"
        fill="#d6d6d6"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path :d="path" />
      </svg>
    </template>
  </div>
</template>
