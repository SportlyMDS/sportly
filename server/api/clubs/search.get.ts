import { z } from 'zod'
import { sql, and, eq } from 'drizzle-orm'
import { useDrizzle } from '../../utils/drizzle'
import { clubs, addresses } from '../../db/schema'

const querySchema = z.object({
  lat: z.coerce.number().min(-90).max(90),
  lng: z.coerce.number().min(-180).max(180),
  radius: z.coerce.number().min(1).max(100).default(20),
  limit: z.coerce.number().int().min(1).max(50).default(20),
  offset: z.coerce.number().int().min(0).default(0)
})

export default defineEventHandler(async (event) => {
  const query = getQuery(event)

  const parseResult = querySchema.safeParse(query)
  if (!parseResult.success) {
    throw createError({
      statusCode: 400,
      message: parseResult.error.errors[0]?.message || 'Paramètres invalides (lat, lng requis)',
      data: parseResult.error.errors
    })
  }

  const { lat, lng, radius, limit, offset } = parseResult.data
  const db = useDrizzle()

  try {
    // Formule Haversine pour calculer la distance en km
    const distanceFormula = sql<number>`
      6371 * acos(
        cos(radians(${lat}))
        * cos(radians(${addresses.latitude}))
        * cos(radians(${addresses.longitude}) - radians(${lng}))
        + sin(radians(${lat}))
        * sin(radians(${addresses.latitude}))
      )
    `

    // Compter le total dans le rayon
    const countResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(clubs)
      .innerJoin(addresses, and(
        eq(addresses.accountId, clubs.accountId),
        eq(addresses.isPrimary, true)
      ))
      .where(sql`${addresses.latitude} IS NOT NULL AND ${addresses.longitude} IS NOT NULL AND ${distanceFormula} <= ${radius}`)

    const total = Number(countResult[0]?.count ?? 0)

    // Récupérer les clubs dans le rayon, triés par distance
    const results = await db
      .select({
        accountId: clubs.accountId,
        clubName: clubs.clubName,
        description: clubs.description,
        rating: clubs.rating,
        reviewCount: clubs.reviewCount,
        isOpen: clubs.isOpen,
        phone: clubs.phone,
        email: clubs.email,
        sports: clubs.sports,
        address: {
          line1: addresses.line1,
          postalCode: addresses.postalCode,
          city: addresses.city,
          latitude: addresses.latitude,
          longitude: addresses.longitude
        },
        distance: distanceFormula
      })
      .from(clubs)
      .innerJoin(addresses, and(
        eq(addresses.accountId, clubs.accountId),
        eq(addresses.isPrimary, true)
      ))
      .where(sql`${addresses.latitude} IS NOT NULL AND ${addresses.longitude} IS NOT NULL AND ${distanceFormula} <= ${radius}`)
      .orderBy(distanceFormula)
      .limit(limit)
      .offset(offset)

    // Arrondir les distances
    const data = results.map(r => ({
      ...r,
      distance: Number(Number(r.distance).toFixed(2))
    }))

    return {
      data,
      total,
      radius,
      center: { lat, lng },
      limit,
      offset
    }
  } catch (error: unknown) {
    if (error && typeof error === 'object' && 'statusCode' in error) {
      throw error
    }

    console.error('Erreur recherche géolocalisée:', error)
    throw createError({
      statusCode: 500,
      message: 'Erreur lors de la recherche géolocalisée'
    })
  }
})
