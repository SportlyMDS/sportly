import { z } from 'zod'
import { eq, and, sql } from 'drizzle-orm'
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
      .select({
        id: events.id,
        maxParticipants: events.maxParticipants
      })
      .from(events)
      .where(eq(events.id, id))
      .limit(1)

    if (eventResult.length === 0) {
      throw createError({
        statusCode: 404,
        message: 'Événement non trouvé'
      })
    }

    // Vérifier si l'utilisateur est déjà inscrit
    const existingRegistration = await db
      .select()
      .from(eventParticipants)
      .where(and(
        eq(eventParticipants.eventId, id),
        eq(eventParticipants.userId, session.user.id)
      ))
      .limit(1)

    if (existingRegistration.length > 0) {
      // Si déjà inscrit avec statut CANCELLED, réinscrire
      if (existingRegistration[0]!.status === 'CANCELLED') {
        await db
          .update(eventParticipants)
          .set({ status: 'REGISTERED', registeredAt: new Date() })
          .where(and(
            eq(eventParticipants.eventId, id),
            eq(eventParticipants.userId, session.user.id)
          ))

        return {
          success: true,
          message: 'Réinscription confirmée'
        }
      }

      throw createError({
        statusCode: 409,
        message: 'Vous êtes déjà inscrit à cet événement'
      })
    }

    // Vérifier la capacité maximale
    const evt = eventResult[0]!
    if (evt.maxParticipants) {
      const countResult = await db
        .select({ count: sql<number>`count(*)` })
        .from(eventParticipants)
        .where(and(
          eq(eventParticipants.eventId, id),
          sql`${eventParticipants.status} != 'CANCELLED'`
        ))

      const currentCount = Number(countResult[0]?.count ?? 0)

      if (currentCount >= evt.maxParticipants) {
        throw createError({
          statusCode: 409,
          message: 'L\'événement est complet'
        })
      }
    }

    // Inscrire l'utilisateur
    await db
      .insert(eventParticipants)
      .values({
        eventId: id,
        userId: session.user.id,
        status: 'REGISTERED'
      })

    return {
      success: true,
      message: 'Inscription confirmée'
    }
  } catch (error: unknown) {
    if (error && typeof error === 'object' && 'statusCode' in error) {
      throw error
    }

    console.error('Erreur inscription événement:', error)
    throw createError({
      statusCode: 500,
      message: 'Erreur lors de l\'inscription'
    })
  }
})
