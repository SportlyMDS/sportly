<script setup lang="ts">
interface ClubTag {
  emoji: string
  name: string
}

interface ClubDetails {
  id: number
  name: string
  emoji: string
  image: string
  distance: string
  isOpen: boolean
  isFavorite: boolean
  sports: ClubTag[]
  tags: ClubTag[]
  address?: string
  description?: string
}

withDefaults(defineProps<{
  club: ClubDetails
  ctaLabel?: string
}>(), {
  ctaLabel: 'Voir le club'
})

const emit = defineEmits<{
  close: []
  toggleFavorite: []
  viewClub: []
}>()
</script>

<template>
  <div class="px-4 pb-4 flex flex-col gap-4">
    <div class="flex items-start gap-3">
      <NuxtLink to="/dashboard/clubs/preview" class="w-16 h-16 rounded-xl overflow-hidden shrink-0 bg-gray-200 block">
        <img
          :src="club.image"
          :alt="club.name"
          class="w-full h-full object-cover"
          @error="($event.target as HTMLImageElement).src = 'https://via.placeholder.com/64x64?text=Club'"
        >
      </NuxtLink>

      <div class="flex-1 min-w-0">
        <div class="flex items-start justify-between gap-2">
          <div>
            <span
              class="inline-block text-xs font-medium text-white px-2 py-0.5 rounded-md mb-1"
              :class="club.isOpen ? 'bg-[#00c950]' : 'bg-[#ef4444]'"
            >
              {{ club.isOpen ? 'Ouvert' : 'Fermé' }}
            </span>
            <h3 class="text-base font-semibold text-[#1c1c1c] font-roboto leading-tight">
              {{ club.emoji }} {{ club.name }}
            </h3>
            <p class="text-sm text-[#545454] font-roboto">
              📍 à {{ club.distance }}
            </p>
            <p v-if="club.address" class="text-xs text-[#545454] font-roboto mt-1">
              {{ club.address }}
            </p>
          </div>

          <div class="flex items-center gap-2 shrink-0">
            <button
              class="w-9 h-9 rounded-full bg-[#f7f7f7] flex items-center justify-center transition-colors"
              :class="club.isFavorite ? 'text-tango-500' : 'text-[#545454]'"
              @click.stop="emit('toggleFavorite')"
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                :fill="club.isFavorite ? 'currentColor' : 'none'"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
              </svg>
            </button>

            <button
              class="w-9 h-9 rounded-full bg-[#f7f7f7] text-[#545454] flex items-center justify-center"
              @click="emit('close')"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>

    <div class="flex flex-wrap gap-2">
      <span
        v-for="sport in club.sports"
        :key="sport.name"
        class="bg-[#f7f7f7] text-[#1c1c1c] text-xs px-3 py-1 rounded-full font-roboto"
      >
        {{ sport.emoji }} {{ sport.name }}
      </span>
      <span
        v-for="tag in club.tags"
        :key="tag.name"
        class="bg-[#f7f7f7] text-[#1c1c1c] text-xs px-3 py-1 rounded-full font-roboto"
      >
        {{ tag.emoji }} {{ tag.name }}
      </span>
    </div>

    <p v-if="club.description" class="text-sm text-[#545454] font-roboto leading-relaxed">
      {{ club.description }}
    </p>

    <button
      class="w-full h-11 bg-tango-500 rounded-full text-white text-sm font-medium font-roboto hover:bg-tango-600 transition-colors"
      @click="emit('viewClub')"
    >
      {{ ctaLabel }}
    </button>
  </div>
</template>

<style scoped>
.font-roboto {
  font-family: 'Roboto', sans-serif;
}
</style>
