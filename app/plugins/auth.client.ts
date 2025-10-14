import { useAuth } from '~/composables/useAuth'

export default defineNuxtPlugin(async () => {
  const { session, fetchSession } = useAuth()

  if (!session.value && import.meta.client) {
    await fetchSession()
  }
})
