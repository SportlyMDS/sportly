import { z } from 'zod'
import { eq } from 'drizzle-orm'
import { useDrizzle } from '../../utils/drizzle'
import { events } from '../../db/schema'
import { serverAuth } from '../../utils/auth'

const updateEventSchema = z.object({
  eventType: z.enum(['STAGE', 'TOURNOI', 'ENTRAINEMENT', 'DECOUVERTE']).optional(),
  title: z.string().min(3).max(160).optional(),
  description: z.string().min(10).optional(),
  addressId: z.string().uuid().optional(),
  startTime: z.string().datetime().optional(),
  endTime: z.string().datetime().optional(),
  levelRequired: z.array(z.string()).min(1).optional(),
  audience: z.array(z.string()).min(1).optional(),
  accessibility: z.array(z.string()).optional(),
  paymentProvider: z.string().max(40).optional(),
  price: z.coerce.number().min(0).optional(),
  maxParticipants: z.coerce.number().int().min(1).optional()
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

  // Vérifier que l'événement existe et que l'utilisateur est le propriétaire
  const existingEvent = await db
    .select({ organizerId: events.organizerId })
    .from(events)
    .where(eq(events.id, id))
    .limit(1)

  if (existingEvent.length === 0) {
    throw createError({
      statusCode: 404,
      message: 'Événement non trouvé'
    })
  }

  if (existingEvent[0]!.organizerId !== session.user.id) {
    throw createError({
      statusCode: 403,
      message: 'Vous n\'êtes pas autorisé à modifier cet événement'
    })
  }

  const body = await readBody(event)

  const parseResult = updateEventSchema.safeParse(body)
  if (!parseResult.success) {
    throw createError({
      statusCode: 400,
      message: parseResult.error.errors[0]?.message || 'Données invalides',
      data: parseResult.error.errors
    })
  }

  const data = parseResult.data

  // Vérifier cohérence dates si fournies
  if (data.startTime && data.endTime) {
    if (new Date(data.startTime) >= new Date(data.endTime)) {
      throw createError({
        statusCode: 400,
        message: 'La date de début doit être antérieure à la date de fin'
      })
    }
  }

  try {
    const updateData: Record<string, unknown> = { ...data }
    if (data.startTime) updateData.startTime = new Date(data.startTime)
    if (data.endTime) updateData.endTime = new Date(data.endTime)
    if (data.price !== undefined) updateData.price = String(data.price)

    await db
      .update(events)
      .set(updateData)
      .where(eq(events.id, id))

    const updatedEvent = await db
      .select()
      .from(events)
      .where(eq(events.id, id))
      .limit(1)

    return {
      success: true,
      message: 'Événement mis à jour avec succès',
      data: updatedEvent[0]
    }
  } catch (error: unknown) {
    if (error && typeof error === 'object' && 'statusCode' in error) {
      throw error
    }

    console.error('Erreur mise à jour événement:', error)
    throw createError({
      statusCode: 500,
      message: 'Erreur lors de la mise à jour de l\'événement'
    })
  }
})
