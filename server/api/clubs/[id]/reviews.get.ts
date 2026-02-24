import { z } from 'zod'
import { eq, sql } from 'drizzle-orm'
import { useDrizzle } from '../../../utils/drizzle'
import { clubs, clubReviews } from '../../../db/schema'

const querySchema = z.object({
  limit: z.coerce.number().int().min(1).max(50).default(20),
  offset: z.coerce.number().int().min(0).default(0)
})

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')

  if (!id) {
    throw createError({
      statusCode: 400,
      message: 'ID du club requis'
    })
  }

  const query = getQuery(event)

  const parseResult = querySchema.safeParse(query)
  if (!parseResult.success) {
    throw createError({
      statusCode: 400,
      message: parseResult.error.errors[0]?.message || 'Paramètres invalides',
      data: parseResult.error.errors
    })
  }

  const { limit, offset } = parseResult.data
  const db = useDrizzle()

  try {
    // Vérifier que le club existe
    const clubResult = await db
      .select({ accountId: clubs.accountId })
      .from(clubs)
      .where(eq(clubs.accountId, id))
      .limit(1)

    if (clubResult.length === 0) {
      throw createError({
        statusCode: 404,
        message: 'Club non trouvé'
      })
    }

    // Compter le total d'avis
    const countResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(clubReviews)
      .where(eq(clubReviews.clubId, id))

    const total = Number(countResult[0]?.count ?? 0)

    // Moyenne des notes
    const avgResult = await db
      .select({ avg: sql<number>`coalesce(avg(${clubReviews.rating}), 0)` })
      .from(clubReviews)
      .where(eq(clubReviews.clubId, id))

    const averageRating = Number(Number(avgResult[0]?.avg ?? 0).toFixed(1))

    // Récupérer les avis paginés
    const reviews = await db
      .select()
      .from(clubReviews)
      .where(eq(clubReviews.clubId, id))
      .orderBy(clubReviews.createdAt)
      .limit(limit)
      .offset(offset)

    return {
      data: reviews,
      total,
      averageRating,
      limit,
      offset
    }
  } catch (error: unknown) {
    if (error && typeof error === 'object' && 'statusCode' in error) {
      throw error
    }

    console.error('Erreur avis club:', error)
    throw createError({
      statusCode: 500,
      message: 'Erreur lors de la récupération des avis'
    })
  }
})
