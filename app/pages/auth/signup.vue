<script setup lang="ts">
import type { FormSubmitEvent } from '#ui/types'
import { z } from 'zod'

definePageMeta({
  middleware: ['guest'],
  layout: 'minimal'
})

// Schéma de validation
const schema = z.object({
  name: z.string().min(1, 'Le nom est requis'),
  email: z.string().email('Email invalide'),
  password: z.string().min(8, 'Minimum 8 caractères')
})

type Schema = z.output<typeof schema>

// État du formulaire
const state = reactive({
  name: '',
  email: '',
  password: ''
})

const loading = ref(false)

// Fonction de navigation
function goToSignIn() {
  navigateTo('/auth/signin')
}

// Fonction d'inscription (à implémenter avec votre système d'auth)
async function handleSignUp(event: FormSubmitEvent<Schema>) {
  loading.value = true
  // TODO: Implémenter la logique d'inscription avec Better Auth
  console.log('Inscription avec:', event.data)
  loading.value = false
}
</script>

<template>
  <!-- Page d'inscription Sportly - Design UIPro -->
  <div class="w-full max-w-[393px] h-screen bg-background-color mx-auto overflow-hidden flex flex-col items-center pt-0 px-4 pb-8 box-border">
    
    <!-- Header avec logo -->
    <div class="w-full bg-background-color flex items-center justify-center p-4 box-border">
      <img 
        src="/Nouveau-logo-sportly-1Logo-1@2x.png"
        alt="Logo Sportly"
        class="h-8 w-auto object-contain" 
        loading="lazy" 
      />
    </div>
    
    <!-- Section principale du formulaire -->
    <section class="self-stretch flex-1 flex flex-col items-center justify-between gap-0 text-center">
      
      <!-- Spacer invisible en haut -->
      <div class="self-stretch relative leading-[140%] opacity-0 text-sm text-font-color">
        <span>Déjà un compte ? </span>
        <b class="underline">Connectez-vous</b>
      </div>
      
      <!-- Formulaire d'inscription -->
      <div class="self-stretch flex flex-col items-center gap-12">
        <div class="self-stretch flex flex-col items-center justify-end">
          <UForm :schema="schema" :state="state" @submit="handleSignUp" class="self-stretch flex flex-col items-start gap-8">
            
            <!-- Champs de formulaire -->
            <div class="self-stretch flex flex-col gap-4">
              <!-- Champ Nom -->
              <UFormGroup label="Nom" name="name" class="font-montserrat">
                <UInput
                  v-model="state.name"
                  type="text"
                  placeholder="Jean Dupont"
                  size="lg"
                  class="font-montserrat"
                />
              </UFormGroup>
              
              <!-- Champ Email -->
              <UFormGroup label="Email" name="email" class="font-montserrat">
                <UInput
                  v-model="state.email"
                  type="email"
                  placeholder="olivia@untitledui.com"
                  size="lg"
                  class="font-montserrat"
                />
              </UFormGroup>
              
              <!-- Champ Mot de passe -->
              <UFormGroup label="Mot de passe" name="password" class="font-montserrat" hint="Minimum 8 caractères">
                <UInput
                  v-model="state.password"
                  type="password"
                  placeholder="••••••••"
                  size="lg"
                  class="font-montserrat"
                />
              </UFormGroup>
            </div>
            
            <!-- Bouton d'inscription -->
            <UButton
              type="submit"
              :loading="loading"
              block
              size="xl"
              class="bg-[#ef781e] hover:bg-[#e05f16] text-white font-semibold font-montserrat text-base rounded-full py-3 shadow-sm"
            >
              {{ loading ? 'Inscription...' : 'S\'inscrire' }}
            </UButton>
            
          </UForm>
        </div>
        
        <!-- Section réseaux sociaux -->
        <div class="flex flex-col items-center gap-3">
          <p class="text-sm font-bold font-montserrat text-[#000]">
            Ou continuez avec
          </p>
          <div class="flex items-center justify-center gap-8">
            <!-- Bouton Google -->
            <UButton
              variant="ghost"
              size="lg"
              square
              class="p-2 hover:bg-gray-100"
              aria-label="S'inscrire avec Google"
            >
              <img src="/google.svg" alt="Google" class="w-6 h-6" />
            </UButton>
            
            <!-- Bouton Facebook -->
            <UButton
              variant="ghost"
              size="lg"
              square
              class="p-2 hover:bg-gray-100"
              aria-label="S'inscrire avec Facebook"
            >
              <div class="w-6 h-6 rounded-full bg-[#1877F2] flex items-center justify-center">
                <span class="text-white text-sm font-bold">f</span>
              </div>
            </UButton>
          </div>
        </div>
      </div>
      
      <!-- Lien vers connexion -->
      <div class="self-stretch text-center text-sm text-font-color font-montserrat">
        <span>Déjà un compte ? </span>
        <UButton
          variant="link"
          size="sm"
          @click="goToSignIn"
          class="font-bold text-[#212121] hover:text-[#ef781e] p-0"
        >
          Connectez-vous
        </UButton>
      </div>
      
    </section>
  </div>
</template>

<style scoped>
/* Couleurs personnalisées UIPro */
.bg-background-color {
  background-color: #fff9f4;
}

.text-font-color {
  color: #212121;
}

.bg-brand-500 {
  background-color: #ef781e;
}

.border-brand-500 {
  border-color: #ef781e;
}

.border-gray-300 {
  border-color: #d5d7da;
}

.text-slategray {
  color: #717680;
}

.text-text-md-semibold {
  color: #000;
}

.text-gray-600 {
  color: #535862;
}

/* Polices */
.font-montserrat {
  font-family: 'Montserrat', sans-serif;
}
</style>
