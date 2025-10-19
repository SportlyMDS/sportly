<script setup lang="ts">
definePageMeta({
  middleware: ['guest'],
  layout: 'minimal'
})

// Navigation vers les pages d'authentification
function goToSignIn() {
  navigateTo('/auth/signin')
}

function goToSignUp() {
  navigateTo('/auth/signup')
}
</script>

<template>
  <!-- Page d'accueil Sportly - Design UIPro exact -->
  <div class="w-[393px] h-[852px] bg-background-color max-w-full overflow-hidden flex flex-col items-center pt-0 px-4 pb-8 box-border leading-[normal] tracking-[normal] mx-auto">
    
    <!-- Header avec logo centré -->
    <div class="w-[393px] bg-background-color flex items-center justify-center p-4 box-border">
      <img 
        class="w-[120px] relative max-h-full object-cover" 
        loading="lazy" 
        alt="Logo Sportly" 
        src="/Nouveau-logo-sportly-1Logo-1@2x.png" 
      />
    </div>
    
    <!-- Section principale -->
    <section class="self-stretch flex-1 flex flex-col items-center justify-center text-left text-[36px] text-font-color font-asap">
      <div class="self-stretch flex-1 flex flex-col items-center justify-end relative gap-16">
        
        <!-- Forme orange organique en arrière-plan -->
        <img 
          class="w-full h-[45.86%] absolute top-[0.17%] right-[0%] bottom-[53.97%] left-[0%] max-w-full overflow-hidden max-h-full z-[0]" 
          loading="lazy" 
          alt="" 
          src="/Group.svg" 
        />
        
        <!-- Textes -->
        <div class="self-stretch flex flex-col items-start z-[1]">
          <h1 class="m-0 self-stretch relative text-[inherit] tracking-[-0.02em] leading-[44px] font-bold font-[inherit]">
            BOUGEZ PLUS,<br>CHERCHEZ MOINS
          </h1>
          <div class="self-stretch relative text-base leading-6 font-montserrat">
            Découvrez votre prochain sport, grâce à Sportly
          </div>
        </div>
        
        <!-- Boutons avec Nuxt UI -->
        <div class="self-stretch flex flex-col items-start gap-2 z-[2]">
          <!-- Bouton Connexion -->
          <UButton
            block
            size="xl"
            @click="goToSignIn"
            class="!bg-[#ef781e] hover:!bg-[#e05f16] !text-white !border-0 !rounded-[50px] !py-2.5 !px-[18px] shadow-[0px_1px_2px_rgba(10,_13,_18,_0.05)] font-semibold font-montserrat text-base"
          >
            Connexion
          </UButton>
          
          <!-- Bouton S'inscrire -->
          <UButton
            block
            size="xl"
            variant="outline"
            @click="goToSignUp"
            class="!bg-transparent hover:!bg-[#e05f16] !text-[#212121] hover:!text-white !border-[#ef781e] !border-solid !border-[1px] !rounded-[50px] !py-2.5 !px-[18px] shadow-[0px_1px_2px_rgba(10,_13,_18,_0.05)] font-semibold font-montserrat text-base"
          >
            S'inscrire
          </UButton>
        </div>
        
        <!-- Image du sportif par-dessus -->
        <img 
          class="w-[478px] absolute top-[-52px] left-[-163px] max-h-full object-cover z-[3]" 
          alt="Sportif en action" 
          src="/sven-kucinic-Z0KjmjxUsKs-unsplash-1@2x.png" 
        />
        
      </div>
    </section>
  </div>
</template>

<style scoped>
/* Couleurs personnalisées */
.bg-background-color {
  background-color: #fff9f4;
}

.text-font-color {
  color: #212121;
}

/* Polices */
.font-asap {
  font-family: 'Asap', sans-serif;
}

.font-montserrat {
  font-family: 'Montserrat', sans-serif;
}
</style>
