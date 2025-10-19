<script setup lang="ts">
import type { FormSubmitEvent } from '#ui/types'
import { z } from 'zod'

definePageMeta({
  middleware: ['guest'],
  layout: 'minimal'
})

// Schéma de validation
const schema = z.object({
  email: z.string().email('Email invalide'),
  password: z.string().min(8, 'Minimum 8 caractères')
})

type Schema = z.output<typeof schema>

// État du formulaire
const state = reactive({
  email: '',
  password: ''
})

const loading = ref(false)

// Fonctions de navigation
function goToSignUp() {
  navigateTo('/auth/signup')
}

// Fonction de connexion
async function handleSignIn(event: FormSubmitEvent<Schema>) {
  loading.value = true
  // TODO: Implémenter la logique de connexion avec Better Auth
  console.log('Connexion avec:', event.data)
  await new Promise(resolve => setTimeout(resolve, 1000))
  loading.value = false
}
</script>

<template>
  <!-- Page de connexion Sportly - Design UIPro exact -->
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
    
    <!-- Section principale du formulaire -->
    <section class="self-stretch flex-1 flex flex-col items-center justify-between gap-0 text-center text-sm text-font-color font-roboto">
      
      <!-- Spacer invisible en haut -->
      <div class="self-stretch relative leading-[140%] opacity-0">
        <span>Pas encore de compte ? </span>
        <b class="underline">Inscrivez-vous</b>
      </div>
      
      <!-- Formulaire de connexion -->
      <div class="self-stretch flex flex-col items-center gap-12 text-left text-xs text-coolgray-90">
        <div class="self-stretch flex flex-col items-center justify-end">
          <UForm :schema="schema" :state="state" @submit="handleSignIn" class="self-stretch flex flex-col items-start gap-8">
            
            <!-- Champs de formulaire -->
            <div class="self-stretch flex items-center justify-between">
              <div class="flex-1 flex flex-col items-end justify-center gap-4">
                <div class="self-stretch flex flex-col items-start gap-4">
                  
                  <!-- Champ Email avec Nuxt UI -->
                  <div class="self-stretch flex flex-col items-start gap-1.5">
                    <label class="relative leading-5 font-medium text-sm text-[#212121] font-montserrat">
                      Email
                    </label>
                    <UInput
                        v-model="state.email"
                        name="email"
                        type="email"
                        placeholder="olivia@untitledui.com"
                        class="w-full"
                        input-class="!bg-white !text-[#212121] !placeholder-[#717680] !border !border-[#d5d7da] !rounded-lg !shadow-[0px_1px_2px_rgba(10,13,18,0.05)]"
                      />

                  </div>
                  
                  <!-- Champ Mot de passe avec Nuxt UI -->
                  <div class="self-stretch flex flex-col items-start gap-1.5">
                    <label class="relative leading-5 font-medium text-sm text-[#212121] font-montserrat">
                      Mot de passe
                    </label>
                    <UInput
                      v-model="state.password"
                      name="password"
                      type="password"
                      placeholder="••••••••"
                      class="w-full"
                      input-class="!bg-white !text-[#212121] !placeholder-[#717680] !border !border-[#d5d7da] !rounded-lg !shadow-[0px_1px_2px_rgba(10,13,18,0.05)]"
                    />
                  </div>
                  
                </div>
                
                <!-- Lien mot de passe oublié -->
                <div class="self-stretch relative leading-[18px] text-right text-font-color font-montserrat text-sm">
                  Mot de passe oublié ?
                </div>
              </div>
            </div>
            
            <!-- Bouton de connexion avec Nuxt UI -->
            <UButton
              type="submit"
              :loading="loading"
              block
              class="!border-[#ef781e] !border-solid !border-[1px] !py-2.5 !px-[18px] !bg-[#ef781e] !shadow-[0px_1px_2px_rgba(10,_13,_18,_0.05)] !rounded-[50px] hover:!bg-[#e05f16] !text-base !leading-6 !font-semibold !font-montserrat !text-white"
            >
              {{ loading ? 'Connexion...' : 'Connexion' }}
            </UButton>
            
          </UForm>
        </div>
        
        <!-- Section réseaux sociaux -->
        <div class="flex flex-col items-center gap-2 text-base text-text-md-semibold font-montserrat">
          <b class="relative leading-6">Ou continuez avec</b>
          <div class="flex items-center justify-center gap-[37px]">
            <!-- Icône Google -->
            <img class="h-8 w-8 relative" loading="lazy" alt="Google" src="/google.svg" />
            
            <!-- Icône Facebook -->
            <div class="w-7 relative h-7 overflow-hidden shrink-0">
              <div class="w-7 h-7 rounded-full bg-[#1877F2] flex items-center justify-center">
                <span class="text-white text-lg font-bold">f</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Lien vers inscription -->
      <div class="self-stretch relative leading-[140%] text-sm">
        <span>Pas encore de compte ? </span>
        <button 
          @click="goToSignUp"
          class="font-bold underline cursor-pointer hover:text-[#ef781e] transition-colors bg-transparent border-0 text-font-color font-roboto"
        >
          Inscrivez-vous
        </button>
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

/* Force light mode pour les inputs Nuxt UI */
:deep(input) {
  background-color: white !important;
  color: #212121 !important;
  border-color: #d5d7da !important;
}

:deep(input::placeholder) {
  color: #717680 !important;
}

/* Polices */
.font-montserrat {
  font-family: 'Montserrat', sans-serif;
}
</style>
