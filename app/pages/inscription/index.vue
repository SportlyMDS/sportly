<script setup lang="ts">
definePageMeta({
  layout: false
})

// État du formulaire
const selectedProfileType = ref<'particulier' | 'club' | null>(null)

// Navigation
function handleBack() {
  navigateTo('/')
}

function goNext() {
  if (!selectedProfileType.value) return

  // Rediriger vers la page d'inscription correspondante
  if (selectedProfileType.value === 'particulier') {
    navigateTo('/inscription/particulier?step=2')
  } else {
    navigateTo('/inscription/club?step=2')
  }
}
</script>

<template>
  <div class="flex flex-col h-dvh bg-white">
    <header class="shrink-0">
      <div class="flex justify-center px-4 py-4">
        <img src="/long-logo.png" alt="Sportly" class="h-7">
      </div>

      <UProgress
        :model-value="1"
        :max="4"
        size="2xs"
        :ui="{
          base: 'bg-white',
          indicator: 'bg-tango-500'
        }"
      />

      <div class="px-4 py-4">
        <UButton
          class="text-gray-500"
          variant="ghost"
          icon="i-heroicons-arrow-left"
          @click="handleBack"
        >
          Retour
        </UButton>
      </div>
    </header>

    <main class="flex-1 flex flex-col min-h-0 px-4 pb-8">
      <div class="flex flex-col gap-8">
        <div class="flex flex-col gap-2 text-center">
          <h1 class="text-[30px] font-semibold text-black leading-[45px] font-asap">
            Qui êtes-vous ?
          </h1>
          <p class="text-base text-[#4a5565] leading-6 font-roboto">
            Choisissez le type de profil qui vous correspond
          </p>
        </div>

        <div class="flex flex-col gap-4">
          <ProfileTypeCard
            :model-value="selectedProfileType === 'particulier'"
            icon="i-sportly-user-profile"
            title="Particulier"
            description="Je recherche des activités sportives près de chez moi"
            @update:model-value="selectedProfileType = 'particulier'"
          />
          <ProfileTypeCard
            :model-value="selectedProfileType === 'club'"
            icon="i-sportly-building"
            title="Club / Salle"
            description="Je propose des activités et gère mes réservations"
            @update:model-value="selectedProfileType = 'club'"
          />
        </div>
        <UButton
          v-if="selectedProfileType"
          block
          class="bg-tango-500! hover:bg-tango-600! text-white! font-semibold! font-montserrat! text-base! rounded-[50px]! py-3! mt-4!"
          @click="goNext"
        >
          Continuer
        </UButton>
      </div>
    </main>
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
