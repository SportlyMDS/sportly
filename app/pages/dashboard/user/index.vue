<template>
  <div>
    <!-- Header du dashboard -->
    <div class="mb-8">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-3xl font-bold text-gray-900 dark:text-white">
            Tableau de bord
          </h1>
          <p class="text-gray-600 dark:text-gray-400">
            Bienvenue {{ user?.name || user?.email }}
          </p>
        </div>
        <UDropdown :items="userMenuItems">
          <UAvatar
            :src="user?.image || undefined"
            :alt="user?.name || user?.email"
            size="lg"
          />
        </UDropdown>
      </div>
    </div>

    <!-- Statistiques rapides -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <UCard>
        <div class="flex items-center">
          <div class="flex-shrink-0">
            <UIcon name="i-heroicons-calendar" class="h-8 w-8 text-blue-500" />
          </div>
          <div class="ml-4">
            <p class="text-sm font-medium text-gray-500 dark:text-gray-400">
              Événements à venir
            </p>
            <p class="text-2xl font-semibold text-gray-900 dark:text-white">
              {{ upcomingEvents.length }}
            </p>
          </div>
        </div>
      </UCard>

      <UCard>
        <div class="flex items-center">
          <div class="flex-shrink-0">
            <UIcon name="i-heroicons-heart" class="h-8 w-8 text-red-500" />
          </div>
          <div class="ml-4">
            <p class="text-sm font-medium text-gray-500 dark:text-gray-400">
              Clubs favoris
            </p>
            <p class="text-2xl font-semibold text-gray-900 dark:text-white">
              {{ favoriteClubs.length }}
            </p>
          </div>
        </div>
      </UCard>

      <UCard>
        <div class="flex items-center">
          <div class="flex-shrink-0">
            <UIcon name="i-heroicons-trophy" class="h-8 w-8 text-yellow-500" />
          </div>
          <div class="ml-4">
            <p class="text-sm font-medium text-gray-500 dark:text-gray-400">
              Événements participés
            </p>
            <p class="text-2xl font-semibold text-gray-900 dark:text-white">
              {{ participatedEvents.length }}
            </p>
          </div>
        </div>
      </UCard>

      <UCard>
        <div class="flex items-center">
          <div class="flex-shrink-0">
            <UIcon name="i-heroicons-users" class="h-8 w-8 text-green-500" />
          </div>
          <div class="ml-4">
            <p class="text-sm font-medium text-gray-500 dark:text-gray-400">
              Connexions
            </p>
            <p class="text-2xl font-semibold text-gray-900 dark:text-white">
              {{ connections.length }}
            </p>
          </div>
        </div>
      </UCard>
    </div>

    <!-- Contenu principal -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <!-- Événements à venir -->
      <div class="lg:col-span-2">
        <UCard>
          <template #header>
            <div class="flex items-center justify-between">
              <h2 class="text-xl font-semibold">
                Mes prochains événements
              </h2>
              <UButton
                variant="outline"
                size="sm"
                to="/events"
                icon="i-heroicons-plus"
              >
                Découvrir
              </UButton>
            </div>
          </template>

          <div v-if="upcomingEvents.length === 0" class="text-center py-8">
            <UIcon name="i-heroicons-calendar-x" class="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p class="text-gray-500 dark:text-gray-400">
              Aucun événement à venir
            </p>
            <UButton
              variant="soft"
              size="sm"
              to="/events"
              class="mt-4"
            >
              Découvrir des événements
            </UButton>
          </div>

          <div v-else class="space-y-4">
            <div
              v-for="event in upcomingEvents.slice(0, 3)"
              :key="event.id"
              class="flex items-center p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            >
              <div class="flex-shrink-0">
                <div class="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
                  <UIcon name="i-heroicons-calendar" class="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
              </div>
              <div class="ml-4 flex-1">
                <h3 class="font-medium text-gray-900 dark:text-white">
                  {{ event.title }}
                </h3>
                <p class="text-sm text-gray-500 dark:text-gray-400">
                  {{ formatDate(event.startTime) }} • {{ event.location }}
                </p>
              </div>
              <UBadge :color="getEventTypeColor(event.type)" variant="soft">
                {{ event.type }}
              </UBadge>
            </div>
          </div>
        </UCard>
      </div>

      <!-- Sidebar -->
      <div class="space-y-6">
        <!-- Activité récente -->
        <UCard>
          <template #header>
            <h2 class="text-lg font-semibold">
              Activité récente
            </h2>
          </template>

          <div class="space-y-3">
            <div
              v-for="activity in recentActivity.slice(0, 5)"
              :key="activity.id"
              class="flex items-start space-x-3"
            >
              <div class="flex-shrink-0">
                <div class="w-8 h-8 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
                  <UIcon :name="activity.icon" class="h-4 w-4 text-gray-600 dark:text-gray-400" />
                </div>
              </div>
              <div class="flex-1 min-w-0">
                <p class="text-sm text-gray-900 dark:text-white">
                  {{ activity.message }}
                </p>
                <p class="text-xs text-gray-500 dark:text-gray-400">
                  {{ formatRelativeTime(activity.createdAt) }}
                </p>
              </div>
            </div>
          </div>
        </UCard>

        <!-- Clubs recommandés -->
        <UCard>
          <template #header>
            <h2 class="text-lg font-semibold">
              Clubs recommandés
            </h2>
          </template>

          <div class="space-y-3">
            <div
              v-for="club in recommendedClubs.slice(0, 3)"
              :key="club.id"
              class="flex items-center space-x-3 p-3 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer"
            >
              <UAvatar
                :src="club.logo || undefined"
                :alt="club.name"
                size="sm"
              />
              <div class="flex-1 min-w-0">
                <p class="text-sm font-medium text-gray-900 dark:text-white truncate">
                  {{ club.name }}
                </p>
                <p class="text-xs text-gray-500 dark:text-gray-400">
                  {{ club.location }} • ⭐ {{ club.rating }}
                </p>
              </div>
              <UButton
                variant="ghost"
                size="xs"
                icon="i-heroicons-heart"
                @click="toggleFavorite(club.id)"
              />
            </div>
          </div>
        </UCard>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// Middleware d'authentification
definePageMeta({
  middleware: 'auth'
})

// SEO
useSeoMeta({
  title: 'Dashboard Utilisateur - Sportly',
  description: 'Gérez vos événements sportifs et découvrez de nouveaux clubs.'
})

// Composables
const { user, signOut } = useAuth()
const toast = useToast()

// Menu utilisateur
const userMenuItems = [
  [{
    label: 'Profil',
    icon: 'i-heroicons-user',
    click: () => navigateTo('/profile')
  }],
  [{
    label: 'Paramètres',
    icon: 'i-heroicons-cog-6-tooth',
    click: () => navigateTo('/settings')
  }],
  [{
    label: 'Déconnexion',
    icon: 'i-heroicons-arrow-right-on-rectangle',
    click: () => handleSignOut()
  }]
]

// Données mockées (à remplacer par de vraies données depuis l'API)
const upcomingEvents = ref([
  {
    id: '1',
    title: 'Stage de Tennis',
    type: 'STAGE',
    startTime: new Date(Date.now() + 86400000), // Demain
    location: 'Club de Tennis Paris'
  },
  {
    id: '2',
    title: 'Tournoi de Badminton',
    type: 'TOURNOI',
    startTime: new Date(Date.now() + 172800000), // Dans 2 jours
    location: 'Gymnase Municipal'
  }
])

const favoriteClubs = ref([])
const participatedEvents = ref([])
const connections = ref([])

const recentActivity = ref([
  {
    id: '1',
    message: 'Vous vous êtes inscrit au Stage de Tennis',
    icon: 'i-heroicons-calendar-plus',
    createdAt: new Date(Date.now() - 3600000) // Il y a 1h
  },
  {
    id: '2',
    message: 'Nouveau club ajouté aux favoris',
    icon: 'i-heroicons-heart',
    createdAt: new Date(Date.now() - 7200000) // Il y a 2h
  }
])

const recommendedClubs = ref([
  {
    id: '1',
    name: 'Tennis Club de Paris',
    location: 'Paris 16e',
    rating: 4.8,
    logo: null
  },
  {
    id: '2',
    name: 'Badminton Elite',
    location: 'Boulogne',
    rating: 4.6,
    logo: null
  }
])

// Méthodes utilitaires
const formatDate = (date: Date) => {
  return new Intl.DateTimeFormat('fr-FR', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date)
}

const formatRelativeTime = (date: Date) => {
  const rtf = new Intl.RelativeTimeFormat('fr-FR', { numeric: 'auto' })
  const diff = date.getTime() - Date.now()
  const diffInHours = Math.round(diff / (1000 * 60 * 60))
  if (Math.abs(diffInHours) < 24) {
    return rtf.format(diffInHours, 'hour')
  } else {
    const diffInDays = Math.round(diffInHours / 24)
    return rtf.format(diffInDays, 'day')
  }
}

const getEventTypeColor = (type: string): 'primary' | 'secondary' | 'success' | 'info' | 'warning' | 'error' | 'neutral' => {
  const colors: Record<string, 'primary' | 'secondary' | 'success' | 'info' | 'warning' | 'error' | 'neutral'> = {
    STAGE: 'info',
    TOURNOI: 'error',
    ENTRAINEMENT: 'success',
    DECOUVERTE: 'warning'
  }
  return colors[type] || 'neutral'
}

// Actions
const handleSignOut = async () => {
  const result = await signOut()
  if (result?.data) {
    toast.add({
      title: 'Déconnexion réussie',
      description: 'À bientôt !',
      color: 'success'
    })
  }
}

const toggleFavorite = (_clubId: string) => {
  toast.add({
    title: 'Fonctionnalité à venir',
    description: 'La gestion des favoris sera bientôt disponible.',
    color: 'info'
  })
}
</script>
