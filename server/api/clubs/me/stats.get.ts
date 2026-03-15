import { eq, sql, and, gte } from 'drizzle-orm'
import { useDrizzle } from '../../../utils/drizzle'
import { clubs, addresses, events, eventParticipants } from '../../../db/schema'
import { serverAuth } from '../../../utils/auth'

export default defineEventHandler(async (event) => {
  const session = await serverAuth().api.getSession({
    headers: event.headers
  })

  if (!session?.user) {
    throw createError({
      statusCode: 401,
      message: 'Authentification requise'
    })
  }

  const accountId = session.user.id
  const db = useDrizzle()

  try {
    // 1. Infos club
    const clubResult = await db
      .select()
      .from(clubs)
      .where(eq(clubs.accountId, accountId))
      .limit(1)

    if (clubResult.length === 0) {
      throw createError({
        statusCode: 404,
        message: 'Club non trouvé'
      })
    }

    const club = clubResult[0]!

    // 2. Adresse principale
    const addressResult = await db
      .select()
      .from(addresses)
      .where(and(eq(addresses.accountId, accountId), eq(addresses.isPrimary, true)))
      .limit(1)

    // 3. Nombre total d'événements
    const eventsCountResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(events)
      .where(eq(events.organizerId, accountId))

    const totalEvents = Number(eventsCountResult[0]?.count ?? 0)

    // 4. Événements du mois en cours
    const startOfMonth = new Date()
    startOfMonth.setDate(1)
    startOfMonth.setHours(0, 0, 0, 0)

    const eventsThisMonthResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(events)
      .where(and(
        eq(events.organizerId, accountId),
        gte(events.createdAt, startOfMonth)
      ))

    const eventsThisMonth = Number(eventsThisMonthResult[0]?.count ?? 0)

    // 5. Nombre total de participants uniques (= "membres")
    const membersResult = await db
      .select({ count: sql<number>`count(DISTINCT ${eventParticipants.userId})` })
      .from(eventParticipants)
      .innerJoin(events, eq(events.id, eventParticipants.eventId))
      .where(eq(events.organizerId, accountId))

    const totalMembers = Number(membersResult[0]?.count ?? 0)

    // 6. Revenus estimés (somme price * nombre participants par événement)
    const revenueResult = await db
      .select({
        total: sql<number>`COALESCE(SUM(CAST(${events.price} AS numeric)), 0)`
      })
      .from(eventParticipants)
      .innerJoin(events, eq(events.id, eventParticipants.eventId))
      .where(and(
        eq(events.organizerId, accountId),
        eq(eventParticipants.status, 'REGISTERED')
      ))

    const totalRevenue = Number(revenueResult[0]?.total ?? 0)

    return {
      club: {
        clubName: club.clubName,
        description: club.description,
        offerType: club.offerType,
        rating: club.rating,
        reviewCount: club.reviewCount,
        logoMediaId: club.logoMediaId
      },
      address: addressResult[0] || null,
      stats: {
        totalEvents,
        eventsThisMonth,
        totalMembers,
        totalRevenue: Math.round(totalRevenue)
      }
    }
  } catch (error: unknown) {
    if (error && typeof error === 'object' && 'statusCode' in error) {
      throw error
    }

    console.error('Erreur stats club:', error)
    throw createError({
      statusCode: 500,
      message: 'Erreur lors de la récupération des statistiques'
    })
  }
})
