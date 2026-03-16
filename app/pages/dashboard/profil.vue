<script setup lang="ts">
definePageMeta({
  layout: 'dashboard',
  middleware: 'auth'
})

useSeoMeta({
  title: 'Profil - Sportly'
})

const { user, signOut } = useAuth()

async function handleLogout() {
  await signOut()
  navigateTo('/')
}
</script>

<template>
  <div class="flex flex-col gap-6 px-4 pb-24">
    <h1 class="text-2xl font-semibold text-[#1c1c1c] tracking-tight font-asap">
      Mon profil
    </h1>

    <div class="flex items-center gap-4">
      <div class="size-16 rounded-full bg-gray-100 flex items-center justify-center">
        <span class="text-2xl font-bold text-gray-500 font-asap">
          {{ user?.name?.charAt(0)?.toUpperCase() || '?' }}
        </span>
      </div>
      <div class="flex flex-col gap-1">
        <p class="text-lg font-semibold text-[#1c1c1c] font-asap">
          {{ user?.name || 'Utilisateur' }}
        </p>
        <p class="text-sm text-[#545454] font-roboto">
          {{ user?.email }}
        </p>
      </div>
    </div>

    <button
      class="w-full py-3 text-sm font-semibold text-red-500 border border-red-200 rounded-xl hover:bg-red-50 transition-colors font-montserrat"
      @click="handleLogout"
    >
      Se déconnecter
    </button>
  </div>
</template>

<style scoped>
.font-asap {
  font-family: 'Asap', sans-serif;
}

.font-roboto {
  font-family: 'Roboto', sans-serif;
}

.font-montserrat {
  font-family: 'Montserrat', sans-serif;
}
</style>
