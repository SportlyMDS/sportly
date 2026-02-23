<script setup lang="ts">
definePageMeta({
  layout: false
})

function goBack() {
  navigateTo('/inscription/club/offre')
}

function addRooms() {
  // TODO: Navigate to add rooms page
  console.log('Add rooms')
  navigateTo('/dashboard/club/salles/new')
}

function createEvent() {
  // TODO: Navigate to create event page
  console.log('Create event')
  navigateTo('/dashboard/club/evenements/new')
}

function skipForNow() {
  navigateTo('/dashboard/club')
}
</script>

<template>
  <div class="w-[393px] min-h-screen bg-white max-w-full overflow-hidden flex flex-col mx-auto">
    <!-- Header avec logo -->
    <div class="w-full bg-white flex items-center justify-center p-4 relative">
      <img
        class="w-[120px] h-auto object-cover"
        loading="lazy"
        alt="Logo Sportly"
        src="/long-logo.png"
      >
      <!-- Barre de progression (100%) -->
      <div class="absolute bottom-0 left-0 w-full h-[2px] bg-gray-200">
        <div class="h-full bg-tango-500 w-full" />
      </div>
    </div>

    <!-- Contenu principal -->
    <div class="flex-1 flex flex-col px-4 pb-8">
      <!-- Bouton Retour -->
      <div
        class="flex items-center gap-2 cursor-pointer py-4"
        @click="goBack"
      >
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M15 18L9 12L15 6"
            stroke="black"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
        <span class="text-base text-black font-roboto">Retour</span>
      </div>

      <!-- Contenu central -->
      <div class="flex-1 flex flex-col items-center justify-between pt-8">
        <!-- Section célébration -->
        <div class="flex flex-col items-center gap-8">
          <!-- Emoji -->
          <div class="text-7xl">
            🎉
          </div>

          <!-- Titre et sous-titre -->
          <div class="flex flex-col items-center gap-3 text-center">
            <h1 class="text-3xl font-semibold text-[#1c1c1c] font-asap">
              Félicitations ! 🚀
            </h1>
            <p class="text-xl text-[#545454] leading-8 font-roboto max-w-[290px]">
              Votre club est prêt à accueillir de nouveaux membres
            </p>
          </div>

          <!-- Info box -->
          <div class="bg-[rgba(224,95,22,0.05)] border border-[rgba(224,95,22,0.2)] rounded-lg p-4 w-full max-w-[352px]">
            <p class="text-sm text-[#1c1c1c] text-center leading-5 font-roboto">
              Pour commencer, ajoutez vos salles ou créez vos premiers événements.
              <br><br>
              Vous pourrez aussi le faire plus tard.
            </p>
          </div>
        </div>

        <!-- Boutons d'action -->
        <div class="flex flex-col gap-3 w-full max-w-[352px] mt-8">
          <UButton
            block
            class="bg-tango-500! hover:bg-tango-600! text-white! font-semibold! font-montserrat! text-base! rounded-[50px]! py-3!"
            @click="addRooms"
          >
            Ajouter des salles
          </UButton>

          <UButton
            to="/dashboard/club"
            block
            size="lg"
            class="bg-tango-500! hover:bg-tango-600! text-white! font-semibold! font-montserrat! text-base! rounded-[50px]! py-3!"
            @click="createEvent"
          >
            Créer un événement
          </UButton>

          <button
            type="button"
            class="w-full py-4 text-sm text-[#545454] font-medium underline font-roboto hover:text-[#1c1c1c] transition-colors"
            @click="skipForNow"
          >
            Je ferai ça plus tard
          </button>
        </div>
      </div>
    </div>
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
