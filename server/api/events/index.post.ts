import { z } from 'zod'
import { eq } from 'drizzle-orm'
import { useDrizzle } from '../../utils/drizzle'
import { events, eventSports, accounts } from '../../db/schema'
import { serverAuth } from '../../utils/auth'

const createEventSchema = z.object({
  eventType: z.enum(['STAGE', 'TOURNOI', 'ENTRAINEMENT', 'DECOUVERTE']),
  title: z.string().min(3).max(160),
  description: z.string().min(10).optional(),
  addressId: z.string().uuid().optional(),
  startTime: z.string().datetime(),
  endTime: z.string().datetime(),
  levelRequired: z.array(z.string()).min(1),
  audience: z.array(z.string()).min(1),
  accessibility: z.array(z.string()).optional(),
  paymentProvider: z.string().max(40).optional(),
  price: z.coerce.number().min(0).default(0),
  maxParticipants: z.coerce.number().int().min(1).optional(),
  sportIds: z.array(z.coerce.number().int()).min(1)
})

export default defineEventHandler(async (event) => {
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

  // Vérifier que le compte est de type CLUB
  const db = useDrizzle()

  const accountResult = await db
    .select({ accountType: accounts.accountType })
    .from(accounts)
    .where(eq(accounts.id, session.user.id))
    .limit(1)

  if (!accountResult[0] || accountResult[0].accountType !== 'CLUB') {
    throw createError({
      statusCode: 403,
      message: 'Seuls les comptes CLUB peuvent créer des événements'
    })
  }

  const body = await readBody(event)

  const parseResult = createEventSchema.safeParse(body)
  if (!parseResult.success) {
    throw createError({
      statusCode: 400,
      message: parseResult.error.errors[0]?.message || 'Données invalides',
      data: parseResult.error.errors
    })
  }

  const { sportIds, ...eventData } = parseResult.data

  // Vérifier que startTime < endTime
  if (new Date(eventData.startTime) >= new Date(eventData.endTime)) {
    throw createError({
      statusCode: 400,
      message: 'La date de début doit être antérieure à la date de fin'
    })
  }

  try {
    // Créer l'événement
    const newEvent = await db
      .insert(events)
      .values({
        organizerId: session.user.id,
        eventType: eventData.eventType,
        title: eventData.title,
        description: eventData.description,
        addressId: eventData.addressId,
        startTime: new Date(eventData.startTime),
        endTime: new Date(eventData.endTime),
        levelRequired: eventData.levelRequired,
        audience: eventData.audience,
        accessibility: eventData.accessibility,
        paymentProvider: eventData.paymentProvider,
        price: String(eventData.price),
        maxParticipants: eventData.maxParticipants
      })
      .returning()

    // Ajouter les sports liés
    if (sportIds.length > 0) {
      await db
        .insert(eventSports)
        .values(sportIds.map(sportId => ({
          eventId: newEvent[0]!.id,
          sportId
        })))
    }

    return {
      success: true,
      message: 'Événement créé avec succès',
      data: newEvent[0]
    }
  } catch (error: unknown) {
    if (error && typeof error === 'object' && 'statusCode' in error) {
      throw error
    }

    console.error('Erreur création événement:', error)
    throw createError({
      statusCode: 500,
      message: 'Erreur lors de la création de l\'événement'
    })
  }
})
