import { z } from 'zod'
import { eq } from 'drizzle-orm'
import { useDrizzle } from '../../utils/drizzle'
import { events, eventSports, eventPhotos, eventParticipants } from '../../db/schema'
import { serverAuth } from '../../utils/auth'

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

  // Vérifier que l'événement existe et que l'utilisateur est le propriétaire
  const existingEvent = await db
    .select({ organizerId: events.organizerId })
    .from(events)
    .where(eq(events.id, id))
    .limit(1)

  if (existingEvent.length === 0) {
    throw createError({
      statusCode: 404,
      message: 'Événement non trouvé'
    })
  }

  if (existingEvent[0]!.organizerId !== session.user.id) {
    throw createError({
      statusCode: 403,
      message: 'Vous n\'êtes pas autorisé à supprimer cet événement'
    })
  }

  try {
    // Supprimer les données liées puis l'événement
    await db.delete(eventParticipants).where(eq(eventParticipants.eventId, id))
    await db.delete(eventPhotos).where(eq(eventPhotos.eventId, id))
    await db.delete(eventSports).where(eq(eventSports.eventId, id))
    await db.delete(events).where(eq(events.id, id))

    return {
      success: true,
      message: 'Événement supprimé avec succès'
    }
  } catch (error: unknown) {
    if (error && typeof error === 'object' && 'statusCode' in error) {
      throw error
    }

    console.error('Erreur suppression événement:', error)
    throw createError({
      statusCode: 500,
      message: 'Erreur lors de la suppression de l\'événement'
    })
  }
})
