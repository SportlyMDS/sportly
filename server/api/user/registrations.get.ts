import { eq } from 'drizzle-orm'
import { useDrizzle } from '../../utils/drizzle'
import { eventParticipants, events, addresses } from '../../db/schema'
import { serverAuth } from '../../utils/auth'

export default defineEventHandler(async (event) => {
  const session = await serverAuth().api.getSession({
    headers: event.headers
  })

  if (!session?.user?.id) {
    throw createError({
      statusCode: 401,
      message: 'Non authentifié'
    })
  }

  const db = useDrizzle()

  try {
    const registrations = await db
      .select({
        eventId: eventParticipants.eventId,
        status: eventParticipants.status,
        registeredAt: eventParticipants.registeredAt,
        event: {
          id: events.id,
          title: events.title,
          eventType: events.eventType,
          startTime: events.startTime,
          endTime: events.endTime,
          price: events.price,
          maxParticipants: events.maxParticipants
        },
        address: {
          line1: addresses.line1,
          postalCode: addresses.postalCode,
          city: addresses.city
        }
      })
      .from(eventParticipants)
      .innerJoin(events, eq(events.id, eventParticipants.eventId))
      .leftJoin(addresses, eq(addresses.id, events.addressId))
      .where(eq(eventParticipants.userId, session.user.id))
      .orderBy(events.startTime)

    return { success: true, data: registrations }
  } catch (error: unknown) {
    console.error('Erreur récupération inscriptions:', error)
    throw createError({
      statusCode: 500,
      message: 'Erreur lors de la récupération des inscriptions'
    })
  }
})
