import { z } from 'zod'
import { eq, and } from 'drizzle-orm'
import { useDrizzle } from '../../../utils/drizzle'
import { events, eventParticipants } from '../../../db/schema'
import { serverAuth } from '../../../utils/auth'

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')

  if (!id || !z.string().uuid().safeParse(id).success) {
    throw createError({
      statusCode: 400,
      message: 'ID de l\'événement invalide'
    })
  }

  // Vérifier l'authentification
  const session = await serverAuth().api.getSession({
    headers: event.headers
  })

  if (!session?.user) {
    throw createError({
      statusCode: 401,
      message: 'Authentification requise'
    })
  }

  const db = useDrizzle()

  try {
    // Vérifier que l'événement existe
    const eventResult = await db
      .select({ id: events.id })
      .from(events)
      .where(eq(events.id, id))
      .limit(1)

    if (eventResult.length === 0) {
      throw createError({
        statusCode: 404,
        message: 'Événement non trouvé'
      })
    }

    // Vérifier que l'utilisateur est inscrit
    const registration = await db
      .select()
      .from(eventParticipants)
      .where(and(
        eq(eventParticipants.eventId, id),
        eq(eventParticipants.userId, session.user.id)
      ))
      .limit(1)

    if (registration.length === 0 || registration[0]!.status === 'CANCELLED') {
      throw createError({
        statusCode: 404,
        message: 'Aucune inscription trouvée pour cet événement'
      })
    }

    // Passer le statut à CANCELLED
    await db
      .update(eventParticipants)
      .set({ status: 'CANCELLED' })
      .where(and(
        eq(eventParticipants.eventId, id),
        eq(eventParticipants.userId, session.user.id)
      ))

    return {
      success: true,
      message: 'Désinscription confirmée'
    }
  } catch (error: unknown) {
    if (error && typeof error === 'object' && 'statusCode' in error) {
      throw error
    }

    console.error('Erreur désinscription événement:', error)
    throw createError({
      statusCode: 500,
      message: 'Erreur lors de la désinscription'
    })
  }
})
