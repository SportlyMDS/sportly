<script setup lang="ts">
const props = defineProps<{
  name: string
  date: string
  rating: number
  comment?: string
}>()

const initials = computed(() => {
  const parts = props.name.trim().split(/\s+/)
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase()
  return props.name.slice(0, 2).toUpperCase()
})

const uid = Math.random().toString(36).slice(2, 8)

function starArray(r: number): Array<'full' | 'half' | 'empty'> {
  return Array.from({ length: 5 }, (_, i) => {
    if (r >= i + 1) return 'full'
    if (r >= i + 0.5) return 'half'
    return 'empty'
  })
}

const stars = computed(() => starArray(props.rating))
const starPath = 'M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z'
</script>

<template>
  <div class="bg-[#f7f7f7] border border-[#d6d6d6] rounded-xl px-4 pt-4 pb-4 flex flex-col gap-3">
    <!-- Header: avatar + name/date + stars -->
    <div class="flex items-start justify-between gap-3">
      <!-- Avatar + name/date -->
      <div class="flex items-center gap-3 min-w-0">
        <div class="shrink-0 size-10 rounded-full bg-[#e05f16] flex items-center justify-center">
          <span class="text-white text-xs font-semibold leading-none">{{ initials }}</span>
        </div>
        <div class="flex flex-col min-w-0">
          <span class="text-base font-semibold text-[#1c1c1c] leading-[1.6] truncate">{{ name }}</span>
          <span class="text-xs font-normal text-[#545454] leading-[1.33]">{{ date }}</span>
        </div>
      </div>

      <!-- Stars -->
      <div class="flex items-center gap-[3px] shrink-0 pt-0.5">
        <template v-for="(type, i) in stars" :key="i">
          <svg
            v-if="type === 'full'"
            width="14" height="14" viewBox="0 0 24 24"
            fill="#ef781e" xmlns="http://www.w3.org/2000/svg"
          >
            <path :d="starPath" />
          </svg>
          <svg
            v-else-if="type === 'half'"
            width="14" height="14" viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              <linearGradient :id="`rc-half-${uid}-${i}`">
                <stop offset="50%" stop-color="#ef781e" />
                <stop offset="50%" stop-color="#d6d6d6" />
              </linearGradient>
            </defs>
            <path :fill="`url(#rc-half-${uid}-${i})`" :d="starPath" />
          </svg>
          <svg
            v-else
            width="14" height="14" viewBox="0 0 24 24"
            fill="#d6d6d6" xmlns="http://www.w3.org/2000/svg"
          >
            <path :d="starPath" />
          </svg>
        </template>
      </div>
    </div>

    <!-- Comment -->
    <p v-if="comment" class="text-sm font-normal text-[#545454] leading-[1.6]">
      {{ comment }}
    </p>
  </div>
</template>
