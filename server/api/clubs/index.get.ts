import { z } from 'zod'
import { eq, sql, and, inArray } from 'drizzle-orm'
import { useDrizzle } from '../../utils/drizzle'
import { clubs, addresses, clubSports, clubFacilities } from '../../db/schema'

const querySchema = z.object({
  limit: z.coerce.number().int().min(1).max(50).default(20),
  offset: z.coerce.number().int().min(0).default(0),
  sport: z.string().optional(),
  city: z.string().optional(),
  isOpen: z.enum(['true', 'false']).optional(),
  level: z.string().optional(),
  facility: z.string().optional()
})

export default defineEventHandler(async (event) => {
  const query = getQuery(event)

  const parseResult = querySchema.safeParse(query)
  if (!parseResult.success) {
    throw createError({
      statusCode: 400,
      message: parseResult.error.errors[0]?.message || 'Paramètres invalides',
      data: parseResult.error.errors
    })
  }

  const { limit, offset, sport, city, isOpen, level, facility } = parseResult.data
  const db = useDrizzle()

  try {
    // Construire les conditions de filtrage
    const conditions = []

    if (isOpen !== undefined) {
      conditions.push(eq(clubs.isOpen, isOpen === 'true'))
    }

    if (city) {
      conditions.push(eq(addresses.city, city))
    }

    // Filtre par sport (cherche dans le text array clubs.sports ET dans clubSports)
    if (sport) {
      conditions.push(sql`${sport} = ANY(${clubs.sports})`)
    }

    // Filtre par niveau (DEBUTANT, INTERMEDIAIRE, AVANCE, PRO)
    if (level) {
      const matchingClubs = await db
        .select({ clubId: clubSports.clubId })
        .from(clubSports)
        .where(sql`${level} = ANY(${clubSports.levelsAccepted})`)

      const clubIds = matchingClubs.map(c => c.clubId)
      if (clubIds.length === 0) return { data: [], total: 0, limit, offset }
      conditions.push(inArray(clubs.accountId, clubIds))
    }

    // Filtre par accessibilité (HANDICAP_FRIENDLY, VESTIAIRES, TOILETTES)
    if (facility) {
      const matchingClubs = await db
        .select({ clubId: clubFacilities.clubId })
        .from(clubFacilities)
        .where(eq(clubFacilities.facility, facility as any))

      const clubIds = matchingClubs.map(c => c.clubId)
      if (clubIds.length === 0) return { data: [], total: 0, limit, offset }
      conditions.push(inArray(clubs.accountId, clubIds))
    }

    // Compter le total
    const whereClause = conditions.length > 0 ? and(...conditions) : undefined

    const countResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(clubs)
      .leftJoin(addresses, and(eq(addresses.accountId, clubs.accountId), eq(addresses.isPrimary, true)))
      .where(whereClause)

    const total = Number(countResult[0]?.count ?? 0)

    // Récupérer les clubs avec adresse
    const clubsList = await db
      .select({
        accountId: clubs.accountId,
        clubName: clubs.clubName,
        description: clubs.description,
        rating: clubs.rating,
        reviewCount: clubs.reviewCount,
        isOpen: clubs.isOpen,
        websiteUrl: clubs.websiteUrl,
        phone: clubs.phone,
        email: clubs.email,
        sports: clubs.sports,
        offerType: clubs.offerType,
        address: {
          line1: addresses.line1,
          postalCode: addresses.postalCode,
          city: addresses.city,
          latitude: addresses.latitude,
          longitude: addresses.longitude
        }
      })
      .from(clubs)
      .leftJoin(addresses, and(eq(addresses.accountId, clubs.accountId), eq(addresses.isPrimary, true)))
      .where(whereClause)
      .limit(limit)
      .offset(offset)

    return {
      data: clubsList,
      total,
      limit,
      offset
    }
  } catch (error: unknown) {
    if (error && typeof error === 'object' && 'statusCode' in error) {
      throw error
    }

    console.error('Erreur liste clubs:', error)
    throw createError({
      statusCode: 500,
      message: 'Erreur lors de la récupération des clubs'
    })
  }
})
