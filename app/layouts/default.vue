<template>
  <div class="min-h-screen bg-white dark:bg-gray-900">
    <!-- Navigation Header -->
    <header class="sticky top-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur border-b border-gray-200 dark:border-gray-800">
      <nav class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center h-16">
          <!-- Logo -->
          <div class="flex items-center">
            <NuxtLink to="/" class="flex items-center space-x-2">
              <UIcon name="i-heroicons-bolt" class="h-8 w-8 text-blue-600" />
              <span class="text-xl font-bold text-gray-900 dark:text-white">
                Sportly
              </span>
            </NuxtLink>
          </div>

          <!-- Navigation Links (Desktop) -->
          <div class="hidden md:flex items-center space-x-8">
            <NuxtLink
              to="/events"
              class="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
            >
              Événements
            </NuxtLink>
            <NuxtLink
              to="/clubs"
              class="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
            >
              Clubs
            </NuxtLink>
            <NuxtLink
              to="/about"
              class="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
            >
              À propos
            </NuxtLink>
          </div>

          <!-- User Actions -->
          <div class="flex items-center space-x-4">
            <!-- Theme Toggle -->
            <UButton
              variant="ghost"
              size="sm"
              :icon="isDark ? 'i-heroicons-sun' : 'i-heroicons-moon'"
              @click="toggleColorMode"
            />

            <!-- User Menu (if authenticated) -->
            <div v-if="loggedIn" class="flex items-center space-x-2">
              <UDropdown :items="userMenuItems">
                <UButton
                  variant="ghost"
                  size="sm"
                  :label="user?.name || 'Mon compte'"
                  trailing-icon="i-heroicons-chevron-down"
                />
              </UDropdown>
            </div>

            <!-- Auth Buttons (if not authenticated) -->
            <div v-else class="flex items-center space-x-2">
              <UButton
                variant="ghost"
                size="sm"
                to="/auth/login"
              >
                Connexion
              </UButton>
              <UButton
                variant="solid"
                size="sm"
                to="/auth/login"
              >
                S'inscrire
              </UButton>
            </div>

            <!-- Mobile Menu Button -->
            <UButton
              variant="ghost"
              size="sm"
              icon="i-heroicons-bars-3"
              class="md:hidden"
              @click="mobileMenuOpen = !mobileMenuOpen"
            />
          </div>
        </div>

        <!-- Mobile Menu -->
        <div v-if="mobileMenuOpen" class="md:hidden py-4 border-t border-gray-200 dark:border-gray-800">
          <div class="space-y-2">
            <NuxtLink
              to="/events"
              class="block px-3 py-2 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
              @click="mobileMenuOpen = false"
            >
              Événements
            </NuxtLink>
            <NuxtLink
              to="/clubs"
              class="block px-3 py-2 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
              @click="mobileMenuOpen = false"
            >
              Clubs
            </NuxtLink>
            <NuxtLink
              to="/about"
              class="block px-3 py-2 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
              @click="mobileMenuOpen = false"
            >
              À propos
            </NuxtLink>
          </div>
        </div>
      </nav>
    </header>

    <!-- Main Content -->
    <main>
      <slot />
    </main>

    <!-- Notifications -->
    <UNotifications />
  </div>
</template>

<script setup lang="ts">
import { useAuth } from '~/composables/useAuth'

// Composables
const { loggedIn, user, signOut } = useAuth()
const colorMode = useColorMode()

// État réactif
const mobileMenuOpen = ref(false)
const isDark = computed(() => colorMode.value === 'dark')

// Menu utilisateur
const userMenuItems = computed(() => {
  const baseItems = [
    [{
      label: 'Dashboard',
      icon: 'i-heroicons-squares-2x2',
      click: () => navigateTo('/app/dashboard')
    }]
  ]

  // if (isUser.value) {
  //   baseItems.push([{
  //     label: 'Mon profil',
  //     icon: 'i-heroicons-user',
  //     click: () => navigateTo('/profile')
  //   }])
  // } else if (isClub.value) {
  //   baseItems.push([{
  //     label: 'Profil du club',
  //     icon: 'i-heroicons-building-office',
  //     click: () => navigateTo('/club/profile')
  //   }])
  // }

  baseItems.push(
    [{
      label: 'Paramètres',
      icon: 'i-heroicons-cog-6-tooth',
      click: () => navigateTo('/settings')
    }],
    [{
      label: 'Déconnexion',
      icon: 'i-heroicons-arrow-right-on-rectangle',
      click: handleSignOut
    }]
  )

  return baseItems
})

// Méthodes
const toggleColorMode = () => {
  colorMode.preference = colorMode.value === 'dark' ? 'light' : 'dark'
}

const handleSignOut = async () => {
  await signOut()
  mobileMenuOpen.value = false
}

// Fermer le menu mobile lors du changement de route
watch(() => useRoute().path, () => {
  mobileMenuOpen.value = false
})
</script>
