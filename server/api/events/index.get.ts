import { z } from 'zod'
import { eq, sql, and, gte, lte } from 'drizzle-orm'
import { useDrizzle } from '../../utils/drizzle'
import { events, eventSports, sports, addresses } from '../../db/schema'

const querySchema = z.object({
  limit: z.coerce.number().int().min(1).max(50).default(20),
  offset: z.coerce.number().int().min(0).default(0),
  sport: z.string().optional(),
  type: z.enum(['STAGE', 'TOURNOI', 'ENTRAINEMENT', 'DECOUVERTE']).optional(),
  dateFrom: z.string().datetime().optional(),
  dateTo: z.string().datetime().optional(),
  city: z.string().optional(),
  maxPrice: z.coerce.number().min(0).optional(),
  organizerId: z.string().optional()
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

  const { limit, offset, sport, type, dateFrom, dateTo, city, maxPrice, organizerId } = parseResult.data
  const db = useDrizzle()

  try {
    const conditions = []

    if (type) {
      conditions.push(eq(events.eventType, type))
    }

    if (dateFrom) {
      conditions.push(gte(events.startTime, new Date(dateFrom)))
    }

    if (dateTo) {
      conditions.push(lte(events.startTime, new Date(dateTo)))
    }

    if (maxPrice !== undefined) {
      conditions.push(lte(events.price, String(maxPrice)))
    }

    if (organizerId) {
      conditions.push(eq(events.organizerId, organizerId))
    }

    if (city) {
      conditions.push(eq(addresses.city, city))
    }

    // Filtre par sport via la table de liaison eventSports
    if (sport) {
      const matchingSports = await db
        .select({ eventId: eventSports.eventId })
        .from(eventSports)
        .innerJoin(sports, eq(sports.id, eventSports.sportId))
        .where(eq(sports.code, sport))

      const eventIds = matchingSports.map(s => s.eventId)
      if (eventIds.length === 0) return { data: [], total: 0, limit, offset }
      conditions.push(sql`${events.id} = ANY(${eventIds})`)
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined

    // Compter le total
    const countResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(events)
      .leftJoin(addresses, eq(addresses.id, events.addressId))
      .where(whereClause)

    const total = Number(countResult[0]?.count ?? 0)

    // Récupérer les événements
    const eventsList = await db
      .select({
        id: events.id,
        organizerId: events.organizerId,
        eventType: events.eventType,
        title: events.title,
        description: events.description,
        startTime: events.startTime,
        endTime: events.endTime,
        levelRequired: events.levelRequired,
        audience: events.audience,
        accessibility: events.accessibility,
        price: events.price,
        maxParticipants: events.maxParticipants,
        createdAt: events.createdAt,
        address: {
          line1: addresses.line1,
          postalCode: addresses.postalCode,
          city: addresses.city,
          latitude: addresses.latitude,
          longitude: addresses.longitude
        }
      })
      .from(events)
      .leftJoin(addresses, eq(addresses.id, events.addressId))
      .where(whereClause)
      .orderBy(events.startTime)
      .limit(limit)
      .offset(offset)

    return {
      data: eventsList,
      total,
      limit,
      offset
    }
  } catch (error: unknown) {
    if (error && typeof error === 'object' && 'statusCode' in error) {
      throw error
    }

    console.error('Erreur liste événements:', error)
    throw createError({
      statusCode: 500,
      message: 'Erreur lors de la récupération des événements'
    })
  }
})
