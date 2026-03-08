import { z } from 'zod'
import { eq, sql } from 'drizzle-orm'
import { useDrizzle } from '../../utils/drizzle'
import {
  events,
  addresses,
  eventSports,
  sports,
  eventPhotos,
  mediaFiles,
  eventParticipants,
  clubs
} from '../../db/schema'

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')

  if (!id || !z.string().uuid().safeParse(id).success) {
    throw createError({
      statusCode: 400,
      message: 'ID de l\'événement invalide'
    })
  }

  const db = useDrizzle()

  try {
    // 1. Événement de base
    const eventResult = await db
      .select()
      .from(events)
      .where(eq(events.id, id))
      .limit(1)

    const evt = eventResult[0]
    if (!evt) {
      throw createError({
        statusCode: 404,
        message: 'Événement non trouvé'
      })
    }

    // 2. Organisateur (club)
    let organizer = null
    const clubResult = await db
      .select({
        clubName: clubs.clubName,
        logoMediaId: clubs.logoMediaId
      })
      .from(clubs)
      .where(eq(clubs.accountId, evt.organizerId))
      .limit(1)
    if (clubResult[0]) {
      organizer = clubResult[0]
    }

    // 3. Adresse
    let address = null
    if (evt.addressId) {
      const addressResult = await db
        .select()
        .from(addresses)
        .where(eq(addresses.id, evt.addressId))
        .limit(1)
      address = addressResult[0] ?? null
    }

    // 4. Sports liés
    const sportsResult = await db
      .select({
        sportId: eventSports.sportId,
        code: sports.code,
        label: sports.label,
        emoji: sports.emoji
      })
      .from(eventSports)
      .innerJoin(sports, eq(sports.id, eventSports.sportId))
      .where(eq(eventSports.eventId, id))

    // 5. Photos
    const photosResult = await db
      .select({
        id: eventPhotos.id,
        storagePath: mediaFiles.storagePath,
        mimeType: mediaFiles.mimeType,
        createdAt: eventPhotos.createdAt
      })
      .from(eventPhotos)
      .leftJoin(mediaFiles, eq(mediaFiles.id, eventPhotos.mediaId))
      .where(eq(eventPhotos.eventId, id))

    // 6. Nombre de participants inscrits
    const participantCountResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(eventParticipants)
      .where(eq(eventParticipants.eventId, id))

    const participantCount = Number(participantCountResult[0]?.count ?? 0)

    return {
      ...evt,
      organizer,
      address,
      sports: sportsResult,
      photos: photosResult,
      participants: {
        count: participantCount,
        max: evt.maxParticipants,
        isFull: evt.maxParticipants ? participantCount >= evt.maxParticipants : false
      }
    }
  } catch (error: unknown) {
    if (error && typeof error === 'object' && 'statusCode' in error) {
      throw error
    }

    console.error('Erreur détail événement:', error)
    throw createError({
      statusCode: 500,
      message: 'Erreur lors de la récupération de l\'événement'
    })
  }
})
