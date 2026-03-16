import { useAuth } from '~/composables/useAuth'

export default defineNuxtRouteMiddleware(() => {
  const { loggedIn, user, options } = useAuth()

  if (loggedIn.value) {
    const accountType = (user.value as any)?.accountType
    if (accountType === 'CLUB') {
      return navigateTo(options.redirectClubTo || '/dashboard/mon-club')
    }
    return navigateTo(options.redirectUserTo || '/dashboard')
  }
})
