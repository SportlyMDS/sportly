import { z } from 'zod'
import { eq, and, sql } from 'drizzle-orm'
import { useDrizzle } from '../../../utils/drizzle'
import { events, eventParticipants, accounts } from '../../../db/schema'
import { serverAuth } from '../../../utils/auth'

const querySchema = z.object({
  limit: z.coerce.number().int().min(1).max(50).default(20),
  offset: z.coerce.number().int().min(0).default(0),
  status: z.enum(['REGISTERED', 'CANCELLED', 'ATTENDED']).optional()
})

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

  // Vérifier que l'événement existe et que l'utilisateur est l'organisateur
  const eventResult = await db
    .select({ organizerId: events.organizerId })
    .from(events)
    .where(eq(events.id, id))
    .limit(1)

  if (eventResult.length === 0) {
    throw createError({
      statusCode: 404,
      message: 'Événement non trouvé'
    })
  }

  if (eventResult[0]!.organizerId !== session.user.id) {
    throw createError({
      statusCode: 403,
      message: 'Seul l\'organisateur peut voir les participants'
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

  const { limit, offset, status } = parseResult.data

  try {
    const conditions = [eq(eventParticipants.eventId, id)]

    if (status) {
      conditions.push(eq(eventParticipants.status, status))
    }

    const whereClause = and(...conditions)

    // Compter le total
    const countResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(eventParticipants)
      .where(whereClause)

    const total = Number(countResult[0]?.count ?? 0)

    // Récupérer les participants avec infos du compte
    const participants = await db
      .select({
        userId: eventParticipants.userId,
        status: eventParticipants.status,
        registeredAt: eventParticipants.registeredAt,
        name: accounts.name,
        email: accounts.email
      })
      .from(eventParticipants)
      .innerJoin(accounts, eq(accounts.id, eventParticipants.userId))
      .where(whereClause)
      .orderBy(eventParticipants.registeredAt)
      .limit(limit)
      .offset(offset)

    return {
      data: participants,
      total,
      limit,
      offset
    }
  } catch (error: unknown) {
    if (error && typeof error === 'object' && 'statusCode' in error) {
      throw error
    }

    console.error('Erreur liste participants:', error)
    throw createError({
      statusCode: 500,
      message: 'Erreur lors de la récupération des participants'
    })
  }
})
