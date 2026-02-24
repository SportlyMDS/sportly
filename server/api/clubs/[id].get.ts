import { eq } from 'drizzle-orm'
import { useDrizzle } from '../../utils/drizzle'
import {
  clubs,
  addresses,
  clubSports,
  sports,
  clubFacilities,
  clubOpeningHours,
  clubPhotos,
  mediaFiles,
  clubReviews
} from '../../db/schema'

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')

  if (!id) {
    throw createError({
      statusCode: 400,
      message: 'ID du club requis'
    })
  }

  const db = useDrizzle()

  try {
    // 1. Club de base
    const clubResult = await db
      .select()
      .from(clubs)
      .where(eq(clubs.accountId, id))
      .limit(1)

    const club = clubResult[0]
    if (!club) {
      throw createError({
        statusCode: 404,
        message: 'Club non trouvé'
      })
    }

    // 2. Adresse principale
    const addressResult = await db
      .select()
      .from(addresses)
      .where(eq(addresses.accountId, id))

    // 3. Sports du club
    const clubSportsResult = await db
      .select({
        sportId: clubSports.sportId,
        code: sports.code,
        label: sports.label,
        emoji: sports.emoji,
        levelsAccepted: clubSports.levelsAccepted,
        audiences: clubSports.audiences
      })
      .from(clubSports)
      .innerJoin(sports, eq(sports.id, clubSports.sportId))
      .where(eq(clubSports.clubId, id))

    // 4. Équipements
    const facilitiesResult = await db
      .select({ facility: clubFacilities.facility })
      .from(clubFacilities)
      .where(eq(clubFacilities.clubId, id))

    // 5. Horaires d'ouverture
    const hoursResult = await db
      .select()
      .from(clubOpeningHours)
      .where(eq(clubOpeningHours.clubId, id))

    // 6. Photos
    const photosResult = await db
      .select({
        id: clubPhotos.id,
        storagePath: mediaFiles.storagePath,
        mimeType: mediaFiles.mimeType,
        createdAt: clubPhotos.createdAt
      })
      .from(clubPhotos)
      .leftJoin(mediaFiles, eq(mediaFiles.id, clubPhotos.mediaId))
      .where(eq(clubPhotos.clubId, id))

    // 7. Avis (résumé)
    const reviewsResult = await db
      .select()
      .from(clubReviews)
      .where(eq(clubReviews.clubId, id))

    return {
      ...club,
      addresses: addressResult,
      sports: clubSportsResult,
      facilities: facilitiesResult.map(f => f.facility),
      openingHours: hoursResult,
      photos: photosResult,
      reviews: {
        count: reviewsResult.length,
        items: reviewsResult.slice(0, 5)
      }
    }
  } catch (error: unknown) {
    if (error && typeof error === 'object' && 'statusCode' in error) {
      throw error
    }

    console.error('Erreur détail club:', error)
    throw createError({
      statusCode: 500,
      message: 'Erreur lors de la récupération du club'
    })
  }
})
