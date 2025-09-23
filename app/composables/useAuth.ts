import { createAuthClient } from 'better-auth/vue'
import type { RouteLocationRaw } from 'vue-router'
import { defu } from 'defu'
import type { ClientOptions, InferSessionFromClient, InferUserFromClient } from 'better-auth'

/**
 * Composable d'authentification pour Sportly
 * Gère les sessions utilisateur et club
 */

interface RuntimeAuthConfig {
  redirectUserTo: RouteLocationRaw | string
  redirectClubTo: RouteLocationRaw | string
  redirectDefaultTo: RouteLocationRaw | string
}
export const useAuth = () => {
  // Récupération de la session avec SSR
  const url = useRequestURL()
  const headers = import.meta.server ? useRequestHeaders() : undefined

  const client = createAuthClient({
    baseURL: url.origin,
    fetchOptions: {
      headers
    }
  })
  const options: RuntimeAuthConfig = defu(useRuntimeConfig().public.auth as Partial<RuntimeAuthConfig>, {
    redirectUserTo: '/app/user',
    redirectClubTo: '/app/club',
    redirectDefaultTo: '/'
  })

  const session = useState<InferSessionFromClient<ClientOptions> | null>('auth.session', () => null)
  const user = useState<InferUserFromClient<ClientOptions> | null>('auth.user', () => null)
  const sessionFetching = import.meta.server ? ref(false) : useState<boolean>('auth.session-fetching', () => false)

  const fetchSession = async () => {
    if (sessionFetching.value) return
    sessionFetching.value = true

    try {
      const { data } = await client.getSession({
        fetchOptions: {
          headers
        }
      })
      session.value = data?.session || null
      user.value = data?.user || null
      return data
    } catch (error) {
      console.error('Erreur de récupération de la session:', error)
      session.value = null
      user.value = null
      return null
    } finally {
      sessionFetching.value = false
    }
  }

  if (import.meta.client) {
    client.$store.listen('$sessionSignal', async (signal) => {
      if (!signal) return
      await fetchSession()
    })
  }

  return {
    session,
    user,
    loggedIn: computed(() => !!session.value),
    signIn: client.signIn,
    signUp: client.signUp,
    async signOut({ redirectTo }: { redirectTo?: RouteLocationRaw } = {}) {
      if (!user.value) {
        await navigateTo('/')
        return
      }
      const res = await client.signOut()
      session.value = null
      user.value = null
      if (redirectTo) {
        await navigateTo(redirectTo)
      }
      return res
    },
    options,
    fetchSession,
    client
  }
}
