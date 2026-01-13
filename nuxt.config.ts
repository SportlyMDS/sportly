// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  modules: [
    '@nuxt/eslint',
    '@nuxt/ui',
    '@nuxtjs/leaflet'
  ],

  // Configuration des imports automatiques
  imports: {
    dirs: [
      'composables/**'
    ]
  },

  devtools: { enabled: true },

  css: ['~/assets/css/main.css'],

  // Forcer le mode clair par défaut
  colorMode: {
    preference: 'light'
  },

  // Configuration des variables d'environnement
  runtimeConfig: {
    // Variables côté serveur uniquement
    betterAuthSecret: process.env.BETTER_AUTH_SECRET,
    databaseUrl: process.env.DATABASE_URL,
    resendApiKey: process.env.RESEND_API_KEY,

    // Variables publiques (exposées côté client)
    public: {
      betterAuthUrl: process.env.BETTER_AUTH_URL || 'http://localhost:3000',
      redirectUserTo: '/app/user',
      redirectClubTo: '/app/club',
      redirectDefaultTo: '/'
    }
  },

  compatibilityDate: '2025-07-15'
})
