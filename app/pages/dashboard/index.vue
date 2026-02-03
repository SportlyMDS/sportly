<script setup lang="ts">
definePageMeta({
  layout: 'dashboard'
})

const userName = ref('Coralie')
const searchQuery = ref('')

// Filtres
const filters = ['Tous', 'Football', 'Natation', 'Basketball', 'Musculation']
const activeFilter = ref('Tous')

// Clubs à proximité (données brutes)
const allClubs = reactive([
  {
    id: 1,
    name: 'Le hook Lille',
    image: '/images/clubs/hook.jpg',
    sport: 'Musculation',
    sportEmoji: '💪',
    clubEmoji: '🏋️',
    distance: '3.45km',
    address: 'Rue sympa, Lille',
    rating: 4.8,
    reviews: 128,
    isOpen: true
  },
  {
    id: 2,
    name: 'Sport Club Lille',
    image: '/images/clubs/sport-club.jpg',
    sport: 'Football',
    sportEmoji: '⚽',
    clubEmoji: '⚽',
    distance: '2.1km',
    address: 'Avenue du sport, Lille',
    rating: 4.5,
    reviews: 89,
    isOpen: false
  },
  {
    id: 3,
    name: 'Aqua Center',
    image: '/images/clubs/aqua.jpg',
    sport: 'Natation',
    sportEmoji: '🏊',
    clubEmoji: '🏊',
    distance: '1.8km',
    address: 'Boulevard de l\'eau, Lille',
    rating: 4.7,
    reviews: 156,
    isOpen: true
  },
  {
    id: 4,
    name: 'Basket Lille Club',
    image: '/images/clubs/basket.jpg',
    sport: 'Basketball',
    sportEmoji: '🏀',
    clubEmoji: '🏀',
    distance: '4.2km',
    address: 'Rue du panier, Lille',
    rating: 4.3,
    reviews: 67,
    isOpen: true
  }
])

// Événements à venir (données brutes)
const allEvents = reactive([
  {
    id: 1,
    title: 'Tournoi 3x3 Basket Urbain',
    club: 'Lille université club',
    clubEmoji: '🏀',
    sport: 'Basketball',
    sportEmoji: '🏀',
    date: '23/03',
    time: '14h30 - 16h00',
    level: 'Débutant à Intermédiaire',
    isFavorite: false
  },
  {
    id: 2,
    title: 'Match de football amical',
    club: 'FC Lille Sport',
    clubEmoji: '⚽',
    sport: 'Football',
    sportEmoji: '⚽',
    date: '25/03',
    time: '18h00 - 19h30',
    level: 'Débutant à Intermédiaire',
    isFavorite: false
  },
  {
    id: 3,
    title: 'Cours de natation débutant',
    club: 'Aqua Center',
    clubEmoji: '🏊',
    sport: 'Natation',
    sportEmoji: '🏊',
    date: '26/03',
    time: '10h00 - 11h00',
    level: 'Débutant',
    isFavorite: false
  },
  {
    id: 4,
    title: 'Session musculation groupe',
    club: 'Le hook Lille',
    clubEmoji: '🏋️',
    sport: 'Musculation',
    sportEmoji: '💪',
    date: '27/03',
    time: '19h00 - 20h30',
    level: 'Tous niveaux',
    isFavorite: false
  }
])

// Actu clubs
const news = [
  {
    id: 1,
    clubName: 'Olympique Lille Académie',
    title: 'Notre premier tournois est terminé !',
    excerpt: 'Merci à tous les participants pour cette superbe édition. Rendez-vous l\'année prochaine pour de nouveaux défis sportifs !',
    image: '/images/news/tournoi.jpg'
  }
]

// Filtres computed
const filteredClubs = computed(() => {
  return allClubs.filter((club) => {
    const matchesSearch = searchQuery.value === ''
      || club.name.toLowerCase().includes(searchQuery.value.toLowerCase())
      || club.sport.toLowerCase().includes(searchQuery.value.toLowerCase())
    const matchesFilter = activeFilter.value === 'Tous'
      || club.sport === activeFilter.value
    return matchesSearch && matchesFilter
  })
})

const filteredEvents = computed(() => {
  return allEvents.filter((event) => {
    const matchesSearch = searchQuery.value === ''
      || event.title.toLowerCase().includes(searchQuery.value.toLowerCase())
      || event.club.toLowerCase().includes(searchQuery.value.toLowerCase())
      || event.sport.toLowerCase().includes(searchQuery.value.toLowerCase())
    const matchesFilter = activeFilter.value === 'Tous'
      || event.sport === activeFilter.value
    return matchesSearch && matchesFilter
  })
})
</script>

<template>
  <div class="flex flex-col gap-6 pb-24">
    <!-- Header -->
    <h1 class="text-3xl font-semibold text-[#1c1c1c] tracking-tight font-asap">
      Bonjour, {{ userName }}. 👋
    </h1>

    <!-- Search & Filters -->
    <div class="flex flex-col gap-4">
      <!-- Search bar -->
      <div class="relative">
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Rechercher des clubs, activités"
          class="search-input w-full bg-white border border-[#d6d6d6] h-12 pl-12 pr-12 text-base text-[#1c1c1c] placeholder-[rgba(28,28,28,0.5)] font-roboto focus:outline-none focus:border-[#ef781e]"
        >
        <!-- Search icon -->
        <svg
          class="absolute left-4 top-1/2 -translate-y-1/2 text-[#545454]"
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M21 21L16.65 16.65M19 11C19 15.4183 15.4183 19 11 19C6.58172 19 3 15.4183 3 11C3 6.58172 6.58172 3 11 3C15.4183 3 19 6.58172 19 11Z"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
        <!-- Filter icon -->
        <button class="absolute right-4 top-1/2 -translate-y-1/2 text-[#545454]">
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M4 21V14M4 10V3M12 21V12M12 8V3M20 21V16M20 12V3M1 14H7M9 8H15M17 16H23"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
        </button>
      </div>

      <!-- Filter pills -->
      <div class="flex gap-2 overflow-x-auto hide-scrollbar">
        <button
          v-for="filter in filters"
          :key="filter"
          class="shrink-0 px-4 py-2 rounded-full text-base font-roboto transition-colors"
          :class="[
            activeFilter === filter
              ? 'bg-[#ef781e] text-[#313131]'
              : 'bg-white border border-[#d6d6d6] text-[#c45400]'
          ]"
          @click="activeFilter = filter"
        >
          {{ filter }}
        </button>
      </div>
    </div>

    <!-- Clubs à proximité -->
    <section class="flex flex-col gap-4">
      <h2 class="text-2xl font-semibold text-[#1c1c1c] tracking-tight font-asap">
        Clubs à proximité
      </h2>
      <div class="flex gap-3 overflow-x-auto hide-scrollbar -mx-4 px-4">
        <div
          v-for="club in filteredClubs"
          :key="club.id"
          class="club-card shrink-0 w-[240px] bg-white border border-[#d6d6d6] overflow-hidden"
        >
          <!-- Image -->
          <div class="h-[120px] bg-gray-200 relative">
            <img
              :src="club.image"
              :alt="club.name"
              class="w-full h-full object-cover"
              @error="($event.target as HTMLImageElement).src = 'https://via.placeholder.com/240x120?text=Club'"
            >
          </div>
          <!-- Content -->
          <div class="p-3 flex flex-col gap-2">
            <div class="flex items-center justify-between">
              <span class="text-base font-medium text-[#1c1c1c] font-roboto">{{ club.clubEmoji }} {{ club.name }}</span>
              <span
                v-if="club.isOpen"
                class="text-xs font-medium text-white bg-[#22c55e] px-2 py-1 rounded-lg"
              >
                Ouvert
              </span>
            </div>
            <div class="inline-flex items-center gap-1 text-sm text-[#545454] font-roboto bg-[#e3e3e3] rounded-full px-3 py-1 w-fit">
              <span>{{ club.sportEmoji }}</span>
              <span>{{ club.sport }}</span>
            </div>
            <div class="flex items-center gap-1 text-sm text-[#545454] font-roboto">
              <span>📍</span>
              <span>{{ club.distance }} - {{ club.address }}</span>
            </div>
            <div class="flex items-center gap-1 text-sm text-[#545454] font-roboto">
              <span>⭐</span>
              <span>{{ club.rating }} ({{ club.reviews }} avis)</span>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Événements à venir -->
    <section class="flex flex-col gap-4">
      <h2 class="text-2xl font-semibold text-[#1c1c1c] tracking-tight font-asap">
        Événements à venir
      </h2>
      <div class="flex flex-col gap-3">
        <div
          v-for="event in filteredEvents"
          :key="event.id"
          class="event-card bg-white border border-[#d6d6d6] p-4 flex flex-col gap-3"
        >
          <!-- Header -->
          <div class="flex items-start justify-between">
            <span class="text-xs font-medium text-[#c45400] bg-[#fef3c7] px-2 py-1 rounded-md font-roboto">Événement</span>
            <button
              class="transition-colors"
              :class="event.isFavorite ? 'text-[#ef781e]' : 'text-[#d6d6d6] hover:text-[#ef781e]'"
              @click.stop="event.isFavorite = !event.isFavorite"
            >
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                :fill="event.isFavorite ? 'currentColor' : 'none'"
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
          </div>

          <!-- Title -->
          <h3 class="text-base font-medium text-[#1c1c1c] font-roboto">
            {{ event.title }}
          </h3>

          <!-- Club -->
          <div class="flex items-center gap-2">
            <div class="w-6 h-6 bg-[#e3e3e3] rounded-full flex items-center justify-center text-xs">
              {{ event.clubEmoji }}
            </div>
            <span class="text-sm text-[#545454] font-roboto">{{ event.club }}</span>
          </div>

          <!-- Tags -->
          <div class="flex flex-wrap gap-2">
            <span class="bg-[#f7f7f7] px-3 py-1.5 rounded-xl text-sm text-[#1c1c1c] font-roboto">
              {{ event.sportEmoji }} {{ event.sport }}
            </span>
            <span class="bg-[#f7f7f7] px-3 py-1.5 rounded-xl text-sm text-[#1c1c1c] font-roboto">
              📆 {{ event.date }} de {{ event.time }}
            </span>
            <span class="bg-[#f7f7f7] px-3 py-1.5 rounded-xl text-sm text-[#1c1c1c] font-roboto">
              👥 {{ event.level }}
            </span>
          </div>
        </div>
      </div>
    </section>

    <!-- Actu clubs -->
    <section class="flex flex-col gap-4">
      <h2 class="text-2xl font-semibold text-[#1c1c1c] tracking-tight font-asap">
        Actu clubs
      </h2>
      <div
        v-for="item in news"
        :key="item.id"
        class="news-card bg-white border border-[#d6d6d6] overflow-hidden"
      >
        <!-- Image -->
        <div class="h-[192px] relative">
          <img
            :src="item.image"
            :alt="item.title"
            class="w-full h-full object-cover"
            @error="($event.target as HTMLImageElement).src = 'https://via.placeholder.com/400x192?text=Actu'"
          >
          <div class="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        </div>
        <!-- Content -->
        <div class="p-4 flex flex-col gap-2">
          <span class="text-xs text-[#545454] font-roboto">{{ item.clubName }}</span>
          <h3 class="text-base text-[#1c1c1c] font-roboto">
            {{ item.title }}
          </h3>
          <p class="text-sm text-[#545454] font-roboto line-clamp-2">
            {{ item.excerpt }}
          </p>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
.font-asap {
  font-family: 'Asap', sans-serif;
}

.font-roboto {
  font-family: 'Roboto', sans-serif;
}

.hide-scrollbar {
  -ms-overflow-style: none;
  scrollbar-width: none;
}

.hide-scrollbar::-webkit-scrollbar {
  display: none;
}

.club-card {
  border-radius: 16px !important;
}

.event-card {
  border-radius: 16px !important;
}

.news-card {
  border-radius: 16px !important;
}

.search-input {
  border-radius: 12px !important;
}
</style>
